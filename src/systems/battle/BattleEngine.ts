import {
  BattleState,
  MedicineSpirit,
  SpiritQuestion,
  AnswerEvaluation,
  TameResult,
  SpiritSkill,
  BattleResult,
} from './types';
import { Medicine } from '../../types';
import { spiritQuestionService } from '../../services/ai/SpiritQuestionService';
import { spiritImageService } from '../../services/ai/SpiritImageService';

// 战斗事件监听器
export interface BattleEventListener {
  onStateChange?: (state: BattleState) => void;
  onSpiritTamed?: (spirit: MedicineSpirit) => void;
  onWaveComplete?: (wave: number) => void;
  onBattleEnd?: (result: BattleResult) => void;
  onAnswerEvaluated?: (evaluation: AnswerEvaluation) => void;
}

// 战斗引擎配置
export interface BattleEngineConfig {
  chapterId: string;
  medicines: Medicine[];
  onStateChange?: (state: BattleState) => void;
  onBattleEnd?: (result: BattleResult) => void;
}

/**
 * BattleEngine - 药灵战斗引擎 (v3.0)
 *
 * 核心功能：
 * - 4波药灵系统，每波数量不同（4, 4, 3, 1）
 * - 难度递增：normal → elite → boss
 * - 驯服机制：回答得分 × 5 = 进度增量（5分=25%）
 * - 连击系统：连续正确增加连击，错误打断
 * - AI集成：调用SpiritQuestionService和SpiritImageService
 */
export class BattleEngine {
  private state: BattleState;
  private medicines: Medicine[] = [];
  private eventListeners: BattleEventListener[] = [];
  private timerInterval: number | null = null;
  private spiritImages: Record<string, string> = {};

  // 波次配置：4波，数量分别为 4, 4, 3, 1
  private readonly WAVE_CONFIGS = [
    { wave: 1, count: 4, difficulty: 'normal' as const },
    { wave: 2, count: 4, difficulty: 'normal' as const },
    { wave: 3, count: 3, difficulty: 'elite' as const },
    { wave: 4, count: 1, difficulty: 'boss' as const },
  ];

  // 技能配置
  private readonly SKILL_CONFIGS: SpiritSkill[] = [
    {
      id: 'hint_flash',
      name: '灵光一闪',
      description: '显示答案的首字或长度提示',
      icon: '💡',
      cooldown: 30,
      currentCooldown: 0,
      effect: { type: 'show_hint', hintType: 'first_char' },
    },
    {
      id: 'encyclopedia',
      name: '本草百科',
      description: '显示药材的详细描述',
      icon: '📚',
      cooldown: 60,
      currentCooldown: 0,
      effect: { type: 'show_description' },
    },
    {
      id: 'mentor_hint',
      name: '师尊指点',
      description: 'AI导师直接给出答案，但会扣减得分',
      icon: '👨‍⚕️',
      cooldown: 120,
      currentCooldown: 0,
      effect: { type: 'mentor_answer', scorePenalty: 0.5 },
    },
  ];

  /**
   * 构造函数
   * @param medicines - 本章节的药材列表
   */
  constructor(medicines: Medicine[]) {
    this.medicines = medicines;

    // 初始化状态
    this.state = {
      status: 'waiting',
      wave: 0,
      totalWaves: 4,
      spirits: [],
      activeSpiritId: null,
      score: 0,
      combo: 0,
      maxCombo: 0,
      timeElapsed: 0,
      tamedCount: 0,
      totalSpirits: 12, // 4 + 4 + 3 + 1
      skills: this.initializeSkills(),
      inputText: '',
      lastEvaluation: null,
    };
  }

  /**
   * 添加事件监听器
   */
  addEventListener(listener: BattleEventListener): void {
    this.eventListeners.push(listener);
  }

  /**
   * 移除事件监听器
   */
  removeEventListener(listener: BattleEventListener): void {
    this.eventListeners = this.eventListeners.filter((l) => l !== listener);
  }

  /**
   * 启动战斗
   * - 预生成药灵形象
   * - 生成药灵问题
   * - 开始第一波
   */
  async start(): Promise<void> {
    if (this.medicines.length === 0) {
      throw new Error('No medicines available for battle');
    }

    // 预生成药灵形象
    await this.preloadSpiritImages();

    // 更新状态为进行中
    this.state.status = 'playing';
    this.notifyStateChange();

    // 启动定时器（每秒更新）
    this.startTimer();

    // 开始第一波
    await this.startWave(1);
  }

  /**
   * 预加载药灵形象
   */
  private async preloadSpiritImages(): Promise<void> {
    try {
      // 为每种难度生成一个形象
      for (const config of this.WAVE_CONFIGS) {
        const medicine = this.getRandomMedicine();
        const imageUrl = await spiritImageService.generateSpiritImage(
          medicine,
          config.difficulty
        );
        if (imageUrl) {
          this.spiritImages[`${medicine.id}_${config.difficulty}`] = imageUrl;
        }
      }
    } catch (error) {
      console.error('Failed to preload spirit images:', error);
      // 继续战斗，使用fallback图片
    }
  }

  /**
   * 开始指定波次
   */
  private async startWave(waveNumber: number): Promise<void> {
    const config = this.WAVE_CONFIGS[waveNumber - 1];
    if (!config) {
      this.endBattle(true);
      return;
    }

    this.state.wave = waveNumber;
    this.state.spirits = [];
    this.state.activeSpiritId = null;

    // 生成药灵
    const spirits = await this.generateSpirits(config.count, config.difficulty);
    this.state.spirits = spirits;
    this.state.totalSpirits = this.WAVE_CONFIGS.reduce((sum, c) => sum + c.count, 0);

    // 激活第一个药灵
    if (spirits.length > 0) {
      this.activateSpirit(spirits[0].id);
    }

    this.notifyStateChange();
  }

  /**
   * 生成药灵
   */
  private async generateSpirits(
    count: number,
    difficulty: 'normal' | 'elite' | 'boss'
  ): Promise<MedicineSpirit[]> {
    const spirits: MedicineSpirit[] = [];

    for (let i = 0; i < count; i++) {
      const medicine = this.getRandomMedicine();
      const imageUrl =
        this.spiritImages[`${medicine.id}_${difficulty}`] ||
        (await spiritImageService.generateSpiritImage(medicine, difficulty));

      // 为药灵生成问题
      const questions = await spiritQuestionService.generateQuestionsBatch(
        [medicine],
        [
          { type: 'recall', weight: 40 },
          { type: 'judge', weight: 30 },
          { type: 'choice', weight: 20 },
          { type: 'free', weight: 10 },
        ]
      );

      const question = questions[0] || this.getFallbackQuestion(medicine);

      const spirit: MedicineSpirit = {
        id: `spirit_${difficulty}_${i}_${Date.now()}`,
        medicineId: medicine.id,
        name: medicine.name,
        displayName: this.getSpiritDisplayName(medicine.name, difficulty),
        imageUrl: imageUrl || '',
        difficulty,
        personality: this.getRandomPersonality(),
        position: { x: 100 + i * 150, y: 200 },
        tameProgress: 0,
        state: 'floating',
        isActive: i === 0,
        floatPhase: Math.random() * Math.PI * 2,
        question,
      };

      spirits.push(spirit);
    }

    return spirits;
  }

  /**
   * 提交答案
   * @param answer - 玩家输入的答案
   * @returns 驯服结果，如果没有激活的药灵则返回null
   */
  async submitAnswer(answer: string): Promise<TameResult | null> {
    const activeSpirit = this.getActiveSpirit();
    if (!activeSpirit) {
      return null;
    }

    const medicine = this.medicines.find((m) => m.id === activeSpirit.medicineId);
    if (!medicine) {
      return null;
    }

    // 调用AI评判答案
    const evaluation = await spiritQuestionService.evaluateAnswer({
      question: activeSpirit.question,
      userAnswer: answer,
      medicine,
    });

    this.state.lastEvaluation = evaluation;

    // 计算驯服进度增量：得分 × 5（5分=25%）
    const progressIncrement = evaluation.score * 5;
    const newProgress = Math.min(100, activeSpirit.tameProgress + progressIncrement);

    // 更新药灵状态
    activeSpirit.tameProgress = newProgress;

    // 更新连击
    if (evaluation.isCorrect) {
      this.state.combo++;
      this.state.maxCombo = Math.max(this.state.maxCombo, this.state.combo);
    } else {
      this.state.combo = 0;
    }

    // 计算得分（考虑连击倍率）
    const comboMultiplier = 1 + Math.floor(this.state.combo / 5) * 0.1;
    const scoreGain = Math.floor(evaluation.score * 10 * comboMultiplier);
    this.state.score += scoreGain;

    // 检查是否驯服完成
    const isTamed = newProgress >= 100;
    if (isTamed) {
      activeSpirit.state = 'tamed';
      activeSpirit.isActive = false;
      this.state.tamedCount++;

      // 通知驯服完成
      this.notifySpiritTamed(activeSpirit);

      // 切换到下一个药灵
      this.moveToNextSpirit();
    }

    // 通知答案评判完成
    this.notifyAnswerEvaluated(evaluation);

    const result: TameResult = {
      spiritId: activeSpirit.id,
      evaluation,
      newProgress,
      isTamed,
    };

    this.notifyStateChange();
    return result;
  }

  /**
   * 激活指定药灵
   */
  activateSpirit(spiritId: string): void {
    // 停用当前激活的药灵
    if (this.state.activeSpiritId) {
      const current = this.state.spirits.find((s) => s.id === this.state.activeSpiritId);
      if (current) {
        current.isActive = false;
        current.state = 'floating';
      }
    }

    // 激活新药灵
    const spirit = this.state.spirits.find((s) => s.id === spiritId);
    if (spirit && spirit.state !== 'tamed' && spirit.state !== 'escaped') {
      spirit.isActive = true;
      spirit.state = 'asking';
      this.state.activeSpiritId = spiritId;
    }

    this.notifyStateChange();
  }

  /**
   * 切换到下一个药灵
   */
  private moveToNextSpirit(): void {
    const currentIndex = this.state.spirits.findIndex((s) => s.id === this.state.activeSpiritId);
    const nextSpirit = this.state.spirits.slice(currentIndex + 1).find(
      (s) => s.state !== 'tamed' && s.state !== 'escaped'
    );

    if (nextSpirit) {
      this.activateSpirit(nextSpirit.id);
    } else {
      // 当前波次完成
      this.onWaveComplete();
    }
  }

  /**
   * 波次完成处理
   */
  private onWaveComplete(): void {
    this.notifyWaveComplete(this.state.wave);

    // 检查是否还有下一波
    if (this.state.wave < this.state.totalWaves) {
      setTimeout(() => {
        this.startWave(this.state.wave + 1);
      }, 2000);
    } else {
      // 所有波次完成
      this.endBattle(true);
    }
  }

  /**
   * 使用技能
   * @param skillId - 技能ID
   * @returns 是否成功使用
   */
  useSkill(skillId: string): boolean {
    const skill = this.state.skills.find((s) => s.id === skillId);
    if (!skill || skill.currentCooldown > 0) {
      return false;
    }

    // 设置冷却
    skill.currentCooldown = skill.cooldown;

    // 应用技能效果
    this.applySkillEffect(skill);

    this.notifyStateChange();
    return true;
  }

  /**
   * 应用技能效果
   */
  private applySkillEffect(skill: SpiritSkill): void {
    const activeSpirit = this.getActiveSpirit();
    if (!activeSpirit) return;

    switch (skill.effect.type) {
      case 'show_hint':
        // 显示提示在UI层处理
        break;
      case 'show_description':
        // 显示描述在UI层处理
        break;
      case 'mentor_answer':
        // AI导师直接给出答案，扣减得分
        const penalty = skill.effect.scorePenalty || 0.5;
        this.state.score = Math.floor(this.state.score * penalty);
        break;
    }
  }

  /**
   * 获取当前状态
   */
  getState(): BattleState {
    return { ...this.state };
  }

  /**
   * 暂停战斗
   */
  pause(): void {
    if (this.state.status === 'playing') {
      this.state.status = 'paused';
      this.stopTimer();
      this.notifyStateChange();
    }
  }

  /**
   * 恢复战斗
   */
  resume(): void {
    if (this.state.status === 'paused') {
      this.state.status = 'playing';
      this.startTimer();
      this.notifyStateChange();
    }
  }

  /**
   * 销毁战斗引擎
   */
  destroy(): void {
    this.stopTimer();
    this.eventListeners = [];
    this.state.status = 'defeat';
  }

  /**
   * 启动定时器
   */
  private startTimer(): void {
    if (this.timerInterval) return;

    // 使用全局setInterval，兼容浏览器和Node.js测试环境
    const setIntervalFn = typeof window !== 'undefined' ? window.setInterval : setInterval;
    this.timerInterval = setIntervalFn(() => {
      this.update();
    }, 1000) as unknown as number;
  }

  /**
   * 停止定时器
   */
  private stopTimer(): void {
    if (this.timerInterval) {
      const clearIntervalFn = typeof window !== 'undefined' ? window.clearInterval : clearInterval;
      clearIntervalFn(this.timerInterval);
      this.timerInterval = null;
    }
  }

  /**
   * 定时更新
   */
  private update(): void {
    if (this.state.status !== 'playing') return;

    // 更新时间
    this.state.timeElapsed++;

    // 更新技能冷却
    this.state.skills.forEach((skill) => {
      if (skill.currentCooldown > 0) {
        skill.currentCooldown--;
      }
    });

    this.notifyStateChange();
  }

  /**
   * 结束战斗
   */
  private endBattle(victory: boolean): void {
    this.stopTimer();
    this.state.status = victory ? 'victory' : 'defeat';

    const result: BattleResult = {
      victory,
      score: this.state.score,
      maxCombo: this.state.maxCombo,
      wavesCleared: victory ? this.state.totalWaves : this.state.wave - 1,
      timeElapsed: this.state.timeElapsed,
      tamedSpirits: this.state.spirits.filter((s) => s.state === 'tamed').map((s) => s.id),
      accuracy: this.calculateAccuracy(),
    };

    this.notifyBattleEnd(result);
    this.notifyStateChange();
  }

  /**
   * 计算准确率
   */
  private calculateAccuracy(): number {
    const tamedCount = this.state.spirits.filter((s) => s.state === 'tamed').length;
    const totalCount = this.state.spirits.length;
    return totalCount > 0 ? Math.round((tamedCount / totalCount) * 100) : 0;
  }

  /**
   * 获取激活的药灵
   */
  private getActiveSpirit(): MedicineSpirit | undefined {
    return this.state.spirits.find((s) => s.id === this.state.activeSpiritId);
  }

  /**
   * 获取随机药材
   */
  private getRandomMedicine(): Medicine {
    return this.medicines[Math.floor(Math.random() * this.medicines.length)];
  }

  /**
   * 获取药灵显示名称
   */
  private getSpiritDisplayName(medicineName: string, difficulty: string): string {
    const prefixes: Record<string, string> = {
      normal: '小',
      elite: '',
      boss: '大',
    };
    const suffixes: Record<string, string> = {
      normal: '灵',
      elite: '精',
      boss: '王',
    };
    return `${prefixes[difficulty] || ''}${medicineName}${suffixes[difficulty] || '灵'}`;
  }

  /**
   * 获取随机性格
   */
  private getRandomPersonality(): 'gentle' | 'lively' | 'dignified' {
    const personalities: ('gentle' | 'lively' | 'dignified')[] = ['gentle', 'lively', 'dignified'];
    return personalities[Math.floor(Math.random() * personalities.length)];
  }

  /**
   * 初始化技能
   */
  private initializeSkills(): SpiritSkill[] {
    return this.SKILL_CONFIGS.map((skill) => ({
      ...skill,
      currentCooldown: 0,
    }));
  }

  /**
   * 获取fallback问题
   */
  private getFallbackQuestion(medicine: Medicine): SpiritQuestion {
    return {
      id: `fallback_${Date.now()}`,
      type: 'recall',
      question: `我忘记自己的名字了，你能告诉我吗？`,
      acceptableAnswers: [medicine.name, medicine.pinyin],
      hint: `我的名字是${medicine.name.length}个字哦~`,
      knowledgeType: 'name',
    };
  }

  // ========== 事件通知 ==========

  private notifyStateChange(): void {
    this.eventListeners.forEach((listener) => {
      listener.onStateChange?.(this.getState());
    });
  }

  private notifySpiritTamed(spirit: MedicineSpirit): void {
    this.eventListeners.forEach((listener) => {
      listener.onSpiritTamed?.(spirit);
    });
  }

  private notifyWaveComplete(wave: number): void {
    this.eventListeners.forEach((listener) => {
      listener.onWaveComplete?.(wave);
    });
  }

  private notifyBattleEnd(result: BattleResult): void {
    this.eventListeners.forEach((listener) => {
      listener.onBattleEnd?.(result);
    });
  }

  private notifyAnswerEvaluated(evaluation: AnswerEvaluation): void {
    this.eventListeners.forEach((listener) => {
      listener.onAnswerEvaluated?.(evaluation);
    });
  }
}

// 向后兼容：保留原有的BattleEngineConfig接口
export type { BattleEngineConfig };

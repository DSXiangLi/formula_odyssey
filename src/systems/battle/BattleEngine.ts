import {
  BattleState,
  BattlePhase,
  Enemy,
  WaveConfig,
  BattleResult,
  BattleEngineConfig,
  Question,
  TargetTextType,
  Skill,
  InputResult,
  BattleMedicine,
  BattleFormula,
} from './types';

export class BattleEngine {
  private state: BattleState;
  private config: BattleEngineConfig;
  private waveConfigs: WaveConfig[];
  private spawnQueue: Enemy[] = [];
  private lastSpawnTime: number = 0;
  private questions: Question[] = [];
  private correctAnswers: number = 0;
  private totalQuestions: number = 0;

  constructor(config: BattleEngineConfig) {
    this.config = config;
    this.waveConfigs = this.createWaveConfigs();
    this.questions = this.generateQuestions();

    this.state = {
      phase: 'preparing',
      currentWave: 0,
      totalWaves: 4,
      playerHealth: 100,
      maxHealth: 100,
      combo: 0,
      maxCombo: 0,
      score: 0,
      timeElapsed: 0,
      enemies: [],
      skills: this.createInitialSkills(),
      waveStartTime: 0,
      timeScale: 1,
      shieldTimeRemaining: 0,
    };
  }

  private createWaveConfigs(): WaveConfig[] {
    return [
      {
        waveNumber: 1,
        name: '药名辨识',
        description: '输入药材名称击退邪灵',
        enemyType: 'normal',
        enemyCount: 5,
        spawnInterval: 3000,
        targetTextType: 'name',
        timeLimit: 60,
      },
      {
        waveNumber: 2,
        name: '性味归经',
        description: '输入四气五味信息',
        enemyType: 'normal',
        enemyCount: 5,
        spawnInterval: 2500,
        targetTextType: 'properties',
        timeLimit: 60,
      },
      {
        waveNumber: 3,
        name: '功效主治',
        description: '输入功效关键词',
        enemyType: 'elite',
        enemyCount: 3,
        spawnInterval: 4000,
        targetTextType: 'effects',
        timeLimit: 90,
      },
      {
        waveNumber: 4,
        name: '方剂对决',
        description: '输入完整方剂组成',
        enemyType: 'boss',
        enemyCount: 1,
        spawnInterval: 0,
        targetTextType: 'formula',
        timeLimit: 120,
      },
    ];
  }

  private generateQuestions(): Question[] {
    const questions: Question[] = [];

    // Generate name questions from medicines
    this.config.medicines.forEach((medicine, index) => {
      questions.push({
        id: `name_${index}`,
        type: 'input',
        question: `这是什么药材？`,
        correctAnswer: medicine.name,
        hint: `提示：${medicine.pinyin}`,
        knowledgeType: 'name',
      });
    });

    // Generate property questions
    this.config.medicines.forEach((medicine, index) => {
      const nature = (medicine as any).fourQi || (medicine as any).nature || '';
      const flavors = (medicine as any).fiveFlavors || [];
      questions.push({
        id: `prop_${index}`,
        type: 'input',
        question: `${medicine.name}的四气五味是什么？`,
        correctAnswer: `${nature}${flavors.join('')}`,
        hint: `提示：${nature}、${flavors.join('、')}`,
        knowledgeType: 'properties',
      });
    });

    // Generate effect questions
    this.config.medicines.forEach((medicine, index) => {
      if (medicine.functions.length > 0) {
        questions.push({
          id: `effect_${index}`,
          type: 'input',
          question: `${medicine.name}的主要功效是？`,
          correctAnswer: medicine.functions[0],
          hint: `提示：${medicine.functions[0].substring(0, 2)}...`,
          knowledgeType: 'effects',
        });
      }
    });

    // Generate formula questions
    this.config.formulas.forEach((formula, index) => {
      questions.push({
        id: `formula_${index}`,
        type: 'input',
        question: `这个方剂的名称是？`,
        correctAnswer: formula.name,
        hint: `提示：${formula.pinyin}`,
        knowledgeType: 'formula',
      });
    });

    return questions;
  }

  private createInitialSkills(): Skill[] {
    return [
      {
        id: 'slow_motion',
        name: '定身术',
        description: '时间减缓50%，持续5秒',
        icon: '❄️',
        cooldown: 30000,
        duration: 5000,
        currentCooldown: 0,
        effect: { type: 'slow_motion', factor: 0.5 },
      },
      {
        id: 'instant_kill',
        name: '群体净化',
        description: '清除最前面的3个敌人',
        icon: '✨',
        cooldown: 45000,
        duration: 0,
        currentCooldown: 0,
        effect: { type: 'instant_kill', count: 3 },
      },
      {
        id: 'heal',
        name: '回春术',
        description: '恢复30点生命值',
        icon: '🌿',
        cooldown: 60000,
        duration: 0,
        currentCooldown: 0,
        effect: { type: 'heal', amount: 30 },
      },
      {
        id: 'shield',
        name: '护盾术',
        description: '获得5秒无敌护盾',
        icon: '🛡️',
        cooldown: 90000,
        duration: 5000,
        currentCooldown: 0,
        effect: { type: 'shield', duration: 5000 },
      },
      {
        id: 'hint_reveal',
        name: '灵光一现',
        description: '显示所有敌人答案3秒',
        icon: '💡',
        cooldown: 120000,
        duration: 3000,
        currentCooldown: 0,
        effect: { type: 'hint_reveal', duration: 3000 },
      },
    ];
  }

  start(): void {
    this.state.phase = 'wave_start';
    this.notifyStateChange();

    // Start first wave after delay
    setTimeout(() => this.startWave(1), 2000);
  }

  private startWave(waveNumber: number): void {
    this.state.currentWave = waveNumber;
    this.state.phase = waveNumber === 4 ? 'boss_intro' : 'spawning';
    this.state.waveStartTime = Date.now();
    this.spawnQueue = this.generateEnemies(waveNumber);
    this.lastSpawnTime = Date.now();
    this.notifyStateChange();

    if (waveNumber === 4) {
      // Boss wave has intro animation
      setTimeout(() => {
        this.state.phase = 'spawning';
        this.notifyStateChange();
      }, 3000);
    }
  }

  private generateEnemies(waveNumber: number): Enemy[] {
    const config = this.waveConfigs[waveNumber - 1];
    const enemies: Enemy[] = [];

    for (let i = 0; i < config.enemyCount; i++) {
      const { text, pinyin, question } = this.generateTargetText(config.targetTextType);
      const isBoss = config.enemyType === 'boss';
      const isElite = config.enemyType === 'elite';

      enemies.push({
        id: `enemy_${waveNumber}_${i}_${Date.now()}`,
        type: config.enemyType,
        name: isBoss ? '邪灵王' : isElite ? '大邪灵' : '小邪灵',
        health: isBoss ? 10 : isElite ? 3 : 1,
        maxHealth: isBoss ? 10 : isElite ? 3 : 1,
        speed: isBoss ? 15 : isElite ? 20 : 40,
        position: { x: 400 + (Math.random() - 0.5) * 100, y: 50 },
        targetText: text,
        targetPinyin: pinyin,
        question,
        status: 'approaching',
        reward: isBoss ? 100 : isElite ? 30 : 10,
        attackRange: isBoss ? 50 : isElite ? 60 : 70,
        attackDamage: isBoss ? 30 : isElite ? 20 : 10,
        attackInterval: isBoss ? 2000 : isElite ? 1500 : 1000,
        lastAttackTime: 0,
      });
    }

    return enemies;
  }

  private generateTargetText(type: TargetTextType): { text: string; pinyin: string; question: Question } {
    switch (type) {
      case 'name': {
        const medicine = this.getRandomMedicine();
        const question: Question = {
          id: `target_${Date.now()}`,
          type: 'input',
          question: `这是什么药材？`,
          correctAnswer: medicine.name,
          hint: medicine.pinyin,
          knowledgeType: 'name',
        };
        return { text: medicine.name, pinyin: medicine.pinyin, question };
      }
      case 'properties': {
        const medicine = this.getRandomMedicine();
        const text = `${medicine.fourQi}${medicine.fiveFlavors.join('')}`;
        const question: Question = {
          id: `target_${Date.now()}`,
          type: 'input',
          question: `${medicine.name}的四气五味是什么？`,
          correctAnswer: text,
          hint: `${medicine.fourQi}、${medicine.fiveFlavors.join('、')}`,
          knowledgeType: 'properties',
        };
        return { text, pinyin: text, question };
      }
      case 'effects': {
        const medicine = this.getRandomMedicine();
        const functionText = medicine.functions[0] || '解表';
        const question: Question = {
          id: `target_${Date.now()}`,
          type: 'input',
          question: `${medicine.name}的主要功效是？`,
          correctAnswer: functionText,
          hint: functionText.substring(0, 2),
          knowledgeType: 'effects',
        };
        return { text: functionText, pinyin: functionText, question };
      }
      case 'formula': {
        const formula = this.getRandomFormula();
        const pinyin = formula.pinyin || formula.name;
        const question: Question = {
          id: `target_${Date.now()}`,
          type: 'input',
          question: `这个方剂的名称是？`,
          correctAnswer: formula.name,
          hint: pinyin,
          knowledgeType: 'formula',
        };
        return { text: formula.name, pinyin, question };
      }
      default:
        return { text: '测试', pinyin: 'ce shi', question: this.questions[0] };
    }
  }

  private getRandomMedicine(): BattleMedicine {
    return this.config.medicines[Math.floor(Math.random() * this.config.medicines.length)];
  }

  private getRandomFormula(): BattleFormula {
    return this.config.formulas[Math.floor(Math.random() * this.config.formulas.length)];
  }

  update(deltaTime: number): void {
    // Apply time scale
    const scaledDeltaTime = deltaTime * this.state.timeScale;

    if (this.state.phase !== 'spawning' && this.state.phase !== 'fighting' && this.state.phase !== 'boss_fight') return;

    this.state.timeElapsed += scaledDeltaTime;

    // Update shield time
    if (this.state.shieldTimeRemaining > 0) {
      this.state.shieldTimeRemaining -= scaledDeltaTime;
      if (this.state.shieldTimeRemaining < 0) {
        this.state.shieldTimeRemaining = 0;
      }
    }

    // Update skill cooldowns
    this.state.skills.forEach(skill => {
      if (skill.currentCooldown > 0) {
        skill.currentCooldown = Math.max(0, skill.currentCooldown - scaledDeltaTime);
      }
    });

    // Spawn enemies
    if (this.state.phase === 'spawning' && this.spawnQueue.length > 0) {
      const now = Date.now();
      const config = this.waveConfigs[this.state.currentWave - 1];
      if (now - this.lastSpawnTime >= config.spawnInterval) {
        const enemy = this.spawnQueue.shift()!;
        this.state.enemies.push(enemy);
        this.lastSpawnTime = now;

        if (this.spawnQueue.length === 0) {
          this.state.phase = this.state.currentWave === 4 ? 'boss_fight' : 'fighting';
        }
      }
    }

    const now = Date.now();

    // Update enemies
    this.state.enemies = this.state.enemies.filter(enemy => {
      // Defeated enemies are filtered out

      // Move enemy towards player
      if (enemy.status === 'approaching') {
        enemy.position.y += enemy.speed * (scaledDeltaTime / 1000);

        // Check if reached attack range
        if (enemy.position.y >= 500 - enemy.attackRange) {
          // Check if can attack
          if (now - enemy.lastAttackTime >= enemy.attackInterval) {
            enemy.status = 'attacking';
            enemy.lastAttackTime = now;

            // Deal damage if no shield
            if (this.state.shieldTimeRemaining <= 0) {
              this.state.playerHealth = Math.max(0, this.state.playerHealth - enemy.attackDamage);
              this.state.combo = 0;
            }

            // Return to approaching after attack
            setTimeout(() => {
              if (enemy.status === 'attacking') {
                enemy.status = 'approaching';
              }
            }, 500);

            if (this.state.playerHealth <= 0) {
              this.endBattle(false);
            }
          }
        }
      }

      // Keep this enemy
      return true;
    });

    // Check wave clear
    if (this.state.enemies.length === 0 && this.spawnQueue.length === 0 && this.state.phase !== 'spawning') {
      this.onWaveClear();
    }

    // Check time limit
    const config = this.waveConfigs[this.state.currentWave - 1];
    if (config.timeLimit) {
      const elapsed = (Date.now() - this.state.waveStartTime) / 1000;
      if (elapsed >= config.timeLimit) {
        this.endBattle(false);
      }
    }

    this.notifyStateChange();
  }

  onInput(input: string): InputResult {
    this.totalQuestions++;

    // Find enemy with matching text
    for (const enemy of this.state.enemies) {
      if (enemy.status !== 'approaching') continue;

      // Exact match
      if (input === enemy.targetText) {
        this.defeatEnemy(enemy, true);
        this.correctAnswers++;
        return { type: 'exact_match', score: 100, enemyId: enemy.id };
      }

      // Pinyin match
      if (input === enemy.targetPinyin) {
        this.defeatEnemy(enemy, true);
        this.correctAnswers++;
        return { type: 'pinyin_match', score: 95, enemyId: enemy.id };
      }

      // Prefix match for pinyin input
      if (enemy.targetPinyin.indexOf(input) === 0) {
        return { type: 'prefix_match', progress: input.length / enemy.targetPinyin.length };
      }
    }

    // Wrong input breaks combo
    this.state.combo = 0;
    this.notifyStateChange();
    return { type: 'no_match' };
  }

  private defeatEnemy(enemy: Enemy, byPlayer: boolean): void {
    enemy.status = 'defeated';

    if (byPlayer) {
      this.state.combo++;
      this.state.maxCombo = Math.max(this.state.maxCombo, this.state.combo);

      // Calculate score with combo multiplier
      const comboMultiplier = 1 + Math.floor(this.state.combo / 10) * 0.1;
      this.state.score += Math.floor(enemy.reward * comboMultiplier);
    }

    this.notifyStateChange();
  }

  useSkill(skillId: string): boolean {
    const skill = this.state.skills.filter(s => s.id === skillId)[0];
    if (!skill || skill.currentCooldown > 0) {
      return false;
    }

    skill.currentCooldown = skill.cooldown;

    switch (skill.effect.type) {
      case 'slow_motion':
        // Slow time
        this.state.timeScale = skill.effect.factor;
        setTimeout(() => {
          this.state.timeScale = 1;
          this.notifyStateChange();
        }, skill.duration);
        break;

      case 'instant_kill':
        // Clear front enemies
        const sortedEnemies = [...this.state.enemies]
          .filter(e => e.status === 'approaching')
          .sort((a, b) => b.position.y - a.position.y);
        const toClear = sortedEnemies.slice(0, skill.effect.count);
        toClear.forEach(enemy => this.defeatEnemy(enemy, true));
        break;

      case 'heal':
        this.state.playerHealth = Math.min(this.state.maxHealth, this.state.playerHealth + skill.effect.amount);
        break;

      case 'shield':
        this.state.shieldTimeRemaining = skill.effect.duration;
        break;

      case 'hint_reveal':
        // This would be handled by the UI layer
        // Just trigger the effect duration
        setTimeout(() => {
          this.notifyStateChange();
        }, skill.duration);
        break;
    }

    this.notifyStateChange();
    return true;
  }

  private onWaveClear(): void {
    if (this.state.currentWave >= this.state.totalWaves) {
      this.endBattle(true);
    } else {
      this.state.phase = 'wave_clear';
      this.state.combo = 0;
      this.notifyStateChange();
      setTimeout(() => this.startWave(this.state.currentWave + 1), 2000);
    }
  }

  private endBattle(victory: boolean): void {
    this.state.phase = 'ending';
    this.notifyStateChange();

    setTimeout(() => {
      const result: BattleResult = {
        victory,
        score: this.state.score,
        maxCombo: this.state.maxCombo,
        wavesCleared: victory ? this.state.totalWaves : this.state.currentWave - 1,
        timeElapsed: this.state.timeElapsed,
        correctAnswers: this.correctAnswers,
        totalQuestions: this.totalQuestions,
      };
      this.config.onBattleEnd?.(result);
    }, 2000);
  }

  private notifyStateChange(): void {
    this.config.onStateChange?.({ ...this.state });
  }

  getState(): BattleState {
    return { ...this.state };
  }

  getWaveConfig(): WaveConfig | undefined {
    return this.waveConfigs[this.state.currentWave - 1];
  }

  getSkills(): Skill[] {
    return [...this.state.skills];
  }
}

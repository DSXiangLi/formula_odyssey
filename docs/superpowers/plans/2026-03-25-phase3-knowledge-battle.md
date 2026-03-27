# Phase 3: 知识问答战斗系统 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现知识问答+战斗系统，玩家通过学习知识卡片回答问题击退敌人，答对获得技能奖励

**Architecture:** React组件 + 状态机驱动的波次系统，支持输入/判断/选择三种题型，Canvas渲染敌人动画

**Tech Stack:** React, TypeScript, Framer Motion, Canvas API

---

## 文件结构规划

```
src/
├── systems/
│   └── battle/
│       ├── BattleEngine.ts       # 战斗核心引擎
│       ├── QuestionGenerator.ts  # 题目生成器
│       ├── SkillSystem.ts        # 技能系统
│       └── types.ts              # 战斗类型定义
├── components/
│   └── battle/
│       ├── KnowledgeCard.tsx     # 知识卡片组件
│       ├── QuestionPanel.tsx     # 题目面板（输入/判断/选择）
│       ├── EnemyField.tsx        # 敌人战场（Canvas）
│       ├── SkillBar.tsx          # 技能栏
│       └── BattleScene.tsx       # 战斗场景主组件
├── hooks/
│   └── useBattle.ts              # 战斗Hook
└── pages/
    └── stages/
        └── BattleStage.tsx       # 战斗关卡页面（替换现有占位）
```

---

## Task 1: 战斗类型定义

**参考文档:** `src/types/stage.ts`

**Files:**
- Create: `src/systems/battle/types.ts`
- Create: `src/systems/battle/index.ts`

---

### Step 1.1: 创建战斗类型定义

**File:** `src/systems/battle/types.ts`

```typescript
import { Medicine, Formula } from '../../types';

export type BattlePhase =
  | 'learning'      // 学习知识卡片
  | 'wave_start'    // 波次开始
  | 'spawning'      // 刷怪中
  | 'fighting'      // 战斗中
  | 'wave_clear'    // 波次清理
  | 'boss_intro'    // BOSS登场
  | 'boss_fight'    // BOSS战
  | 'ending'        // 结束动画
  | 'settlement';   // 结算

export type QuestionType = 'input' | 'judgment' | 'choice';

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  correctAnswer: string;
  options?: string[];  // 选择题选项
  hint: string;
  knowledgeType: 'name' | 'properties' | 'effects' | 'formula';
}

export interface Enemy {
  id: string;
  type: 'normal' | 'elite' | 'boss';
  name: string;
  health: number;
  maxHealth: number;
  speed: number;
  position: { x: number; y: number };
  question: Question;
  status: 'approaching' | 'attacking' | 'defeated';
  reward: number;
}

export interface KnowledgeCard {
  medicine?: Medicine;
  formula?: Formula;
  displayTime: number;
  highlights: string[];  // 高亮显示的关键信息
}

export interface WaveConfig {
  waveNumber: number;
  name: string;
  description: string;
  enemyCount: number;
  spawnInterval: number;
  questionTypes: QuestionType[];
  timeLimit?: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string;
  cooldown: number;
  chargeRequired: number;  // 充能次数
  currentCharge: number;
  effect: SkillEffect;
}

export type SkillEffect =
  | { type: 'freeze'; duration: number }      // 冷冻：暂停敌人
  | { type: 'clear'; count: number }          // 清屏：消灭N个敌人
  | { type: 'heal'; amount: number }          // 回血
  | { type: 'shield'; duration: number };     // 护盾

export interface BattleState {
  phase: BattlePhase;
  currentWave: number;
  totalWaves: number;
  playerHealth: number;
  maxHealth: number;
  score: number;
  combo: number;
  maxCombo: number;
  timeElapsed: number;
  enemies: Enemy[];
  currentKnowledge?: KnowledgeCard;
  skills: Skill[];
  waveStartTime: number;
}

export interface BattleResult {
  victory: boolean;
  score: number;
  maxCombo: number;
  wavesCleared: number;
  timeElapsed: number;
  correctAnswers: number;
  totalQuestions: number;
}

export interface BattleEngineConfig {
  chapterId: string;
  medicines: Medicine[];
  formulas: Formula[];
  onStateChange?: (state: BattleState) => void;
  onBattleEnd?: (result: BattleResult) => void;
}
```

---

### Step 1.2: 创建导出文件

**File:** `src/systems/battle/index.ts`

```typescript
export * from './types';
export { BattleEngine } from './BattleEngine';
export { QuestionGenerator } from './QuestionGenerator';
export { SkillSystem } from './SkillSystem';
```

---

### Step 1.3: Commit

```bash
git add src/systems/battle/types.ts src/systems/battle/index.ts
git commit -m "feat(battle): add battle system type definitions for knowledge Q&A"
```

---

## Task 2: 题目生成器

**参考文档:** `design-output/v3.0-specs/gameplay/02-typing-battle.md`

**Files:**
- Create: `src/systems/battle/QuestionGenerator.ts`

---

### Step 2.1: 实现题目生成器

**File:** `src/systems/battle/QuestionGenerator.ts`

```typescript
import { Medicine, Formula } from '../../types';
import { Question, QuestionType, KnowledgeCard } from './types';

export class QuestionGenerator {
  private medicines: Medicine[];
  private formulas: Formula[];

  constructor(medicines: Medicine[], formulas: Formula[]) {
    this.medicines = medicines;
    this.formulas = formulas;
  }

  // 生成知识卡片
  generateKnowledgeCard(waveNumber: number): KnowledgeCard {
    const medicine = this.getRandomMedicine();
    const highlights = this.getHighlightsForWave(waveNumber);

    return {
      medicine,
      displayTime: 5000 + waveNumber * 1000, // 5-8秒
      highlights,
    };
  }

  // 生成题目
  generateQuestions(waveNumber: number, count: number): Question[] {
    const questions: Question[] = [];
    const types = this.getQuestionTypesForWave(waveNumber);

    for (let i = 0; i < count; i++) {
      const type = types[i % types.length];
      const question = this.createQuestion(type, waveNumber);
      questions.push(question);
    }

    return questions;
  }

  private createQuestion(type: QuestionType, waveNumber: number): Question {
    const medicine = this.getRandomMedicine();
    const id = `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    switch (type) {
      case 'input':
        return this.createInputQuestion(id, medicine, waveNumber);
      case 'judgment':
        return this.createJudgmentQuestion(id, medicine);
      case 'choice':
        return this.createChoiceQuestion(id, medicine);
      default:
        return this.createInputQuestion(id, medicine, waveNumber);
    }
  }

  private createInputQuestion(id: string, medicine: Medicine, waveNumber: number): Question {
    // 根据波次决定题目类型
    const templates = [
      {
        question: `输入"${medicine.name}"的性味`,
        answer: `${medicine.fourQi}、${medicine.fiveFlavors.join('')}`,
        hint: `${medicine.fourQi}${medicine.fiveFlavors[0]}`,
        knowledgeType: 'properties',
      },
      {
        question: `输入"${medicine.name}"的主要功效`,
        answer: medicine.functions[0] || '解表',
        hint: medicine.functions[0]?.substring(0, 2) || '解',
        knowledgeType: 'effects',
      },
      {
        question: `输入"${medicine.name}"归经`,
        answer: medicine.meridians.join('、'),
        hint: medicine.meridians[0],
        knowledgeType: 'properties',
      },
    ];

    const template = templates[waveNumber % templates.length];

    return {
      id,
      type: 'input',
      question: template.question,
      correctAnswer: template.answer,
      hint: template.hint,
      knowledgeType: template.knowledgeType as 'properties' | 'effects',
    };
  }

  private createJudgmentQuestion(id: string, medicine: Medicine): Question {
    const isCorrect = Math.random() > 0.5;
    const properties = [
      `${medicine.name}性${medicine.fourQi}`,
      `${medicine.name}味${medicine.fiveFlavors.join('、')}`,
      `${medicine.name}归${medicine.meridians.join('、')}经`,
    ];
    const wrongProperties = [
      `${medicine.name}性寒`,
      `${medicine.name}味甘`,
      `${medicine.name}归心、肝经`,
    ];

    const statement = isCorrect
      ? properties[Math.floor(Math.random() * properties.length)]
      : wrongProperties[Math.floor(Math.random() * wrongProperties.length)];

    return {
      id,
      type: 'judgment',
      question: `判断：${statement}`,
      correctAnswer: isCorrect ? '对' : '错',
      options: ['对', '错'],
      hint: isCorrect ? '描述正确' : '描述错误',
      knowledgeType: 'properties',
    };
  }

  private createChoiceQuestion(id: string, medicine: Medicine): Question {
    const otherMedicines = this.medicines.filter(m => m.id !== medicine.id);
    const wrongOptions = otherMedicines
      .slice(0, 3)
      .map(m => m.name);

    const options = [medicine.name, ...wrongOptions].sort(() => Math.random() - 0.5);

    return {
      id,
      type: 'choice',
      question: `下列哪项是"${medicine.fourQi}${medicine.fiveFlavors.join('')}"的药材？`,
      correctAnswer: medicine.name,
      options,
      hint: `性${medicine.fourQi}，味${medicine.fiveFlavors.join('')}`,
      knowledgeType: 'properties',
    };
  }

  private getQuestionTypesForWave(waveNumber: number): QuestionType[] {
    switch (waveNumber) {
      case 1:
        return ['input'];
      case 2:
        return ['input', 'judgment'];
      case 3:
        return ['input', 'judgment', 'choice'];
      case 4:
        return ['input', 'choice', 'judgment'];
      default:
        return ['input'];
    }
  }

  private getHighlightsForWave(waveNumber: number): string[] {
    switch (waveNumber) {
      case 1:
        return ['name', 'fourQi', 'fiveFlavors'];
      case 2:
        return ['meridians', 'functions'];
      case 3:
        return ['functions', 'indications'];
      case 4:
        return ['name', 'properties', 'effects'];
      default:
        return ['name'];
    }
  }

  private getRandomMedicine(): Medicine {
    return this.medicines[Math.floor(Math.random() * this.medicines.length)];
  }

  private getRandomFormula(): Formula {
    return this.formulas[Math.floor(Math.random() * this.formulas.length)];
  }
}
```

---

### Step 2.2: Commit

```bash
git add src/systems/battle/QuestionGenerator.ts
git commit -m "feat(battle): implement question generator with input/judgment/choice types"
```

---

## Task 3: 技能系统

**Files:**
- Create: `src/systems/battle/SkillSystem.ts`

---

### Step 3.1: 实现技能系统

**File:** `src/systems/battle/SkillSystem.ts`

```typescript
import { Skill, SkillEffect, BattleState } from './types';

export class SkillSystem {
  private skills: Skill[];
  private onSkillActivated: ((skill: Skill) => void) | null = null;
  private onSkillCharged: ((skill: Skill) => void) | null = null;

  constructor() {
    this.skills = this.initializeSkills();
  }

  private initializeSkills(): Skill[] {
    return [
      {
        id: 'freeze',
        name: '冷冻术',
        description: '冻结所有敌人5秒',
        icon: '❄️',
        cooldown: 0,
        chargeRequired: 3,
        currentCharge: 0,
        effect: { type: 'freeze', duration: 5000 },
      },
      {
        id: 'clear',
        name: '五雷轰顶',
        description: '消灭所有普通敌人',
        icon: '⚡',
        cooldown: 0,
        chargeRequired: 5,
        currentCharge: 0,
        effect: { type: 'clear', count: 999 },
      },
      {
        id: 'heal',
        name: '回春术',
        description: '恢复30%生命值',
        icon: '💚',
        cooldown: 0,
        chargeRequired: 4,
        currentCharge: 0,
        effect: { type: 'heal', amount: 30 },
      },
      {
        id: 'shield',
        name: '护盾术',
        description: '抵挡3次伤害',
        icon: '🛡️',
        cooldown: 0,
        chargeRequired: 3,
        currentCharge: 0,
        effect: { type: 'shield', duration: 10000 },
      },
    ];
  }

  // 答对题目时增加充能
  chargeSkills(amount: number = 1): void {
    this.skills.forEach(skill => {
      if (skill.currentCharge < skill.chargeRequired) {
        skill.currentCharge = Math.min(skill.currentCharge + amount, skill.chargeRequired);
        if (skill.currentCharge === skill.chargeRequired) {
          this.onSkillCharged?.(skill);
        }
      }
    });
  }

  // 使用技能
  useSkill(skillId: string, battleState: BattleState): boolean {
    const skill = this.skills.find(s => s.id === skillId);
    if (!skill || skill.currentCharge < skill.chargeRequired) {
      return false;
    }

    // 应用技能效果
    this.applyEffect(skill.effect, battleState);

    // 重置充能
    skill.currentCharge = 0;

    this.onSkillActivated?.(skill);
    return true;
  }

  private applyEffect(effect: SkillEffect, battleState: BattleState): void {
    switch (effect.type) {
      case 'freeze':
        // 敌人速度设为0，持续duration
        battleState.enemies.forEach(enemy => {
          if (enemy.status === 'approaching') {
            enemy.speed = 0;
          }
        });
        break;

      case 'clear':
        // 消灭所有普通敌人
        battleState.enemies.forEach(enemy => {
          if (enemy.type === 'normal' && enemy.status === 'approaching') {
            enemy.status = 'defeated';
          }
        });
        break;

      case 'heal':
        battleState.playerHealth = Math.min(
          battleState.playerHealth + effect.amount,
          battleState.maxHealth
        );
        break;

      case 'shield':
        // 护盾效果由BattleEngine处理
        break;
    }
  }

  getSkills(): Skill[] {
    return this.skills.map(s => ({ ...s }));
  }

  isSkillReady(skillId: string): boolean {
    const skill = this.skills.find(s => s.id === skillId);
    return skill ? skill.currentCharge >= skill.chargeRequired : false;
  }

  onActivated(callback: (skill: Skill) => void): void {
    this.onSkillActivated = callback;
  }

  onCharged(callback: (skill: Skill) => void): void {
    this.onSkillCharged = callback;
  }

  reset(): void {
    this.skills.forEach(skill => {
      skill.currentCharge = 0;
    });
  }
}
```

---

### Step 3.2: Commit

```bash
git add src/systems/battle/SkillSystem.ts
git commit -m "feat(battle): implement skill system with freeze/clear/heal/shield"
```

---

## Task 4: 战斗核心引擎

**Files:**
- Create: `src/systems/battle/BattleEngine.ts`

---

### Step 4.1: 实现战斗引擎

**File:** `src/systems/battle/BattleEngine.ts`

```typescript
import {
  BattleState,
  BattlePhase,
  BattleResult,
  BattleEngineConfig,
  Enemy,
  WaveConfig,
  Question,
} from './types';
import { QuestionGenerator } from './QuestionGenerator';
import { SkillSystem } from './SkillSystem';

export class BattleEngine {
  private state: BattleState;
  private config: BattleEngineConfig;
  private questionGenerator: QuestionGenerator;
  private skillSystem: SkillSystem;
  private waveConfigs: WaveConfig[];
  private spawnQueue: Enemy[] = [];
  private questions: Question[] = [];
  private questionIndex: number = 0;
  private lastSpawnTime: number = 0;
  private animationFrameId: number | null = null;
  private onStateChange: ((state: BattleState) => void) | null = null;
  private onBattleEnd: ((result: BattleResult) => void) | null = null;

  constructor(config: BattleEngineConfig) {
    this.config = config;
    this.questionGenerator = new QuestionGenerator(
      config.medicines,
      config.formulas
    );
    this.skillSystem = new SkillSystem();
    this.waveConfigs = this.createWaveConfigs();

    this.state = {
      phase: 'learning',
      currentWave: 0,
      totalWaves: 4,
      playerHealth: 100,
      maxHealth: 100,
      score: 0,
      combo: 0,
      maxCombo: 0,
      timeElapsed: 0,
      enemies: [],
      skills: this.skillSystem.getSkills(),
      waveStartTime: 0,
    };

    // 设置技能回调
    this.skillSystem.onCharged(() => {
      this.state.skills = this.skillSystem.getSkills();
      this.notifyStateChange();
    });
  }

  private createWaveConfigs(): WaveConfig[] {
    return [
      {
        waveNumber: 1,
        name: '性味初识',
        description: '学习药材性味，击退邪灵',
        enemyCount: 5,
        spawnInterval: 4000,
        questionTypes: ['input'],
      },
      {
        waveNumber: 2,
        name: '功效辨析',
        description: '判断药材功效正误',
        enemyCount: 5,
        spawnInterval: 3500,
        questionTypes: ['input', 'judgment'],
      },
      {
        waveNumber: 3,
        name: '综合考验',
        description: '选择题考验综合知识',
        enemyCount: 5,
        spawnInterval: 3000,
        questionTypes: ['input', 'judgment', 'choice'],
      },
      {
        waveNumber: 4,
        name: '方剂对决',
        description: 'BOSS战：方剂知识',
        enemyCount: 1,
        spawnInterval: 0,
        questionTypes: ['input', 'choice'],
        timeLimit: 60,
      },
    ];
  }

  start(
    onStateChange: (state: BattleState) => void,
    onBattleEnd: (result: BattleResult) => void
  ): void {
    this.onStateChange = onStateChange;
    this.onBattleEnd = onBattleEnd;

    // 开始第一波的学习阶段
    this.startLearningPhase(1);
  }

  private startLearningPhase(waveNumber: number): void {
    this.state.currentWave = waveNumber;
    this.state.phase = 'learning';
    this.state.currentKnowledge = this.questionGenerator.generateKnowledgeCard(waveNumber);
    this.notifyStateChange();

    // 3秒学习时间后进入战斗
    setTimeout(() => {
      this.startWave(waveNumber);
    }, 5000);
  }

  private startWave(waveNumber: number): void {
    const config = this.waveConfigs[waveNumber - 1];
    this.state.phase = 'wave_start';
    this.state.waveStartTime = Date.now();
    this.notifyStateChange();

    // 生成题目
    this.questions = this.questionGenerator.generateQuestions(
      waveNumber,
      config.enemyCount
    );
    this.questionIndex = 0;

    // 生成敌人
    this.spawnQueue = this.questions.map((q, i) => this.createEnemy(q, i, config));
    this.lastSpawnTime = Date.now();

    // 波次开始动画
    setTimeout(() => {
      this.state.phase = 'spawning';
      this.notifyStateChange();
      this.startGameLoop();
    }, 1500);
  }

  private createEnemy(question: Question, index: number, config: WaveConfig): Enemy {
    const isBoss = config.waveNumber === 4;
    const isElite = config.waveNumber === 3;

    return {
      id: `enemy_${config.waveNumber}_${index}`,
      type: isBoss ? 'boss' : isElite ? 'elite' : 'normal',
      name: isBoss ? '邪灵王' : isElite ? '大邪灵' : '小邪灵',
      health: isBoss ? 10 : isElite ? 3 : 1,
      maxHealth: isBoss ? 10 : isElite ? 3 : 1,
      speed: isBoss ? 20 : isElite ? 35 : 50,
      position: {
        x: 100 + Math.random() * 600,
        y: -50 - index * 100,
      },
      question,
      status: 'approaching',
      reward: isBoss ? 100 : isElite ? 30 : 10,
    };
  }

  private startGameLoop(): void {
    const loop = (timestamp: number) => {
      const deltaTime = 16; // ~60fps
      this.update(deltaTime);

      if (this.state.phase === 'spawning' || this.state.phase === 'fighting' || this.state.phase === 'boss_fight') {
        this.animationFrameId = requestAnimationFrame(loop);
      }
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  update(deltaTime: number): void {
    if (this.state.phase !== 'spawning' && this.state.phase !== 'fighting' && this.state.phase !== 'boss_fight') {
      return;
    }

    this.state.timeElapsed += deltaTime;

    // 刷怪
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

    // 更新敌人位置
    this.state.enemies = this.state.enemies.filter((enemy) => {
      if (enemy.status === 'defeated') return false;

      if (enemy.status === 'approaching') {
        enemy.position.y += enemy.speed * (deltaTime / 1000);

        // 到达底部
        if (enemy.position.y >= 500) {
          enemy.status = 'attacking';
          this.damagePlayer(enemy.type === 'boss' ? 30 : enemy.type === 'elite' ? 20 : 10);
          return false;
        }
      }

      return true;
    });

    // 检查波次结束
    if (this.state.enemies.length === 0 && this.spawnQueue.length === 0) {
      this.onWaveClear();
    }

    this.notifyStateChange();
  }

  private damagePlayer(amount: number): void {
    this.state.playerHealth -= amount;
    this.state.combo = 0;

    if (this.state.playerHealth <= 0) {
      this.endBattle(false);
    }
  }

  // 回答问题
  answerQuestion(answer: string): { correct: boolean; score: number } {
    // 找到最前面的敌人
    const targetEnemy = this.state.enemies.find(
      (e) => e.status === 'approaching'
    );

    if (!targetEnemy) {
      return { correct: false, score: 0 };
    }

    const isCorrect =
      answer.trim() === targetEnemy.question.correctAnswer.trim();

    if (isCorrect) {
      // 击退敌人
      targetEnemy.status = 'defeated';

      // 增加连击
      this.state.combo++;
      this.state.maxCombo = Math.max(this.state.maxCombo, this.state.combo);

      // 计算分数
      const multiplier = 1 + Math.floor(this.state.combo / 5) * 0.2;
      const points = Math.floor(targetEnemy.reward * multiplier);
      this.state.score += points;

      // 充能技能
      this.skillSystem.chargeSkills(1);
      this.state.skills = this.skillSystem.getSkills();

      this.notifyStateChange();

      return { correct: true, score: points };
    } else {
      // 答错中断连击
      this.state.combo = 0;
      this.notifyStateChange();
      return { correct: false, score: 0 };
    }
  }

  // 使用技能
  useSkill(skillId: string): boolean {
    const success = this.skillSystem.useSkill(skillId, this.state);
    if (success) {
      this.state.skills = this.skillSystem.getSkills();
      this.notifyStateChange();
    }
    return success;
  }

  private onWaveClear(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.state.currentWave >= this.state.totalWaves) {
      this.endBattle(true);
    } else {
      this.state.phase = 'wave_clear';
      this.notifyStateChange();

      // 2秒后进入下一波学习阶段
      setTimeout(() => {
        this.startLearningPhase(this.state.currentWave + 1);
      }, 2000);
    }
  }

  private endBattle(victory: boolean): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.state.phase = 'ending';
    this.notifyStateChange();

    setTimeout(() => {
      const result: BattleResult = {
        victory,
        score: this.state.score,
        maxCombo: this.state.maxCombo,
        wavesCleared: victory ? this.state.totalWaves : this.state.currentWave - 1,
        timeElapsed: this.state.timeElapsed,
        correctAnswers: Math.floor(this.state.score / 50),
        totalQuestions: this.waveConfigs.reduce((sum, w) => sum + w.enemyCount, 0),
      };
      this.onBattleEnd?.(result);
    }, 2000);
  }

  private notifyStateChange(): void {
    this.onStateChange?.({ ...this.state });
  }

  getState(): BattleState {
    return { ...this.state };
  }

  destroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}
```

---

### Step 4.2: Commit

```bash
git add src/systems/battle/BattleEngine.ts
git commit -m "feat(battle): implement battle engine with learning phase and skill system"
```

---

## Task 5: 知识卡片组件

**Files:**
- Create: `src/components/battle/KnowledgeCard.tsx`

---

### Step 5.1: 实现知识卡片组件

**File:** `src/components/battle/KnowledgeCard.tsx`

```typescript
import React from 'react';
import { motion } from 'framer-motion';
import { KnowledgeCard as KnowledgeCardType } from '../../systems/battle/types';

interface KnowledgeCardProps {
  card: KnowledgeCardType;
  onComplete: () => void;
}

export const KnowledgeCard: React.FC<KnowledgeCardProps> = ({ card, onComplete }) => {
  const { medicine, displayTime, highlights } = card;

  React.useEffect(() => {
    const timer = setTimeout(onComplete, displayTime);
    return () => clearTimeout(timer);
  }, [displayTime, onComplete]);

  if (!medicine) return null;

  const isHighlighted = (field: string) => highlights.includes(field);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="max-w-lg mx-auto bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 shadow-2xl border-2 border-amber-300"
    >
      {/* 标题 */}
      <div className="text-center mb-4">
        <span className="text-4xl mb-2 block">📚</span>
        <h3 className="text-xl font-bold text-amber-900">学习时刻</h3>
        <p className="text-sm text-amber-700">记住以下知识，准备战斗！</p>
      </div>

      {/* 药材卡片 */}
      <div className="bg-white rounded-xl p-4 shadow-inner">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">🌿</span>
          <h4 className="text-xl font-bold text-gray-800">{medicine.name}</h4>
        </div>

        <div className="space-y-2 text-sm">
          {/* 性味 */}
          <div className={`p-2 rounded-lg transition-colors ${
            isHighlighted('fourQi') || isHighlighted('fiveFlavors')
              ? 'bg-amber-200'
              : 'bg-gray-50'
          }`}>
            <span className="font-medium text-gray-600">性味：</span>
            <span className="text-gray-800">
              {medicine.fourQi}、{medicine.fiveFlavors.join('、')}
            </span>
          </div>

          {/* 归经 */}
          <div className={`p-2 rounded-lg transition-colors ${
            isHighlighted('meridians') ? 'bg-amber-200' : 'bg-gray-50'
          }`}>
            <span className="font-medium text-gray-600">归经：</span>
            <span className="text-gray-800">{medicine.meridians.join('、')}经</span>
          </div>

          {/* 功效 */}
          <div className={`p-2 rounded-lg transition-colors ${
            isHighlighted('functions') ? 'bg-amber-200' : 'bg-gray-50'
          }`}>
            <span className="font-medium text-gray-600">功效：</span>
            <span className="text-gray-800">{medicine.functions.join('，')}</span>
          </div>

          {/* 主治 */}
          {isHighlighted('indications') && medicine.indications && (
            <div className="p-2 rounded-lg bg-amber-200">
              <span className="font-medium text-gray-600">主治：</span>
              <span className="text-gray-800">{medicine.indications.join('，')}</span>
            </div>
          )}
        </div>
      </div>

      {/* 倒计时提示 */}
      <div className="mt-4 text-center">
        <div className="text-amber-700 text-sm">{displayTime / 1000}秒后自动开始战斗...</div>
        <div className="w-full h-1 bg-amber-200 rounded-full mt-2 overflow-hidden">
          <motion.div
            className="h-full bg-amber-500"
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: displayTime / 1000, ease: 'linear' }}
          />
        </div>
      </div>
    </motion.div>
  );
};
```

---

### Step 5.2: Commit

```bash
git add src/components/battle/KnowledgeCard.tsx
git commit -m "feat(battle): add KnowledgeCard component with highlight system"
```

---

## Task 6: 题目面板组件

**Files:**
- Create: `src/components/battle/QuestionPanel.tsx`

---

### Step 6.1: 实现题目面板组件

**File:** `src/components/battle/QuestionPanel.tsx`

```typescript
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Question, QuestionType, Enemy } from '../../systems/battle/types';

interface QuestionPanelProps {
  enemy?: Enemy;
  onAnswer: (answer: string) => void;
  disabled?: boolean;
}

export const QuestionPanel: React.FC<QuestionPanelProps> = ({
  enemy,
  onAnswer,
  disabled,
}) => {
  const [input, setInput] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const question = enemy?.question;

  const handleInputSubmit = useCallback(() => {
    if (!input.trim() || disabled) return;

    const correct = input.trim() === question?.correctAnswer;
    setIsCorrect(correct);
    setShowFeedback(true);

    onAnswer(input.trim());

    setTimeout(() => {
      setShowFeedback(false);
      setInput('');
    }, 800);
  }, [input, question, disabled, onAnswer]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleInputSubmit();
      }
    },
    [handleInputSubmit]
  );

  const handleOptionSelect = useCallback(
    (option: string) => {
      if (disabled) return;

      const correct = option === question?.correctAnswer;
      setIsCorrect(correct);
      setShowFeedback(true);

      onAnswer(option);

      setTimeout(() => {
        setShowFeedback(false);
      }, 800);
    },
    [question, disabled, onAnswer]
  );

  if (!question) {
    return (
      <div className="text-center text-white/60 py-8">
        等待敌人出现...
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
      {/* 问题显示 */}
      <div className="text-center mb-4">
        <div className="text-amber-300 text-sm mb-1">💡 {question.hint}</div>
        <h4 className="text-lg font-medium text-white">{question.question}</h4>
      </div>

      {/* 输入题型 */}
      {question.type === 'input' && (
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="输入答案..."
            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white text-center focus:outline-none focus:border-amber-400 disabled:opacity-50"
            autoFocus
          />
          <button
            onClick={handleInputSubmit}
            disabled={disabled || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-amber-500 text-white rounded text-sm disabled:opacity-50 hover:bg-amber-600 transition-colors"
          >
            确认
          </button>
        </div>
      )}

      {/* 判断题型 */}
      {question.type === 'judgment' && (
        <div className="flex gap-4 justify-center">
          {['对', '错'].map((option) => (
            <button
              key={option}
              onClick={() => handleOptionSelect(option)}
              disabled={disabled}
              className="px-8 py-3 bg-white/20 border border-white/30 rounded-lg text-white font-medium hover:bg-white/30 active:bg-amber-500 disabled:opacity-50 transition-colors"
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {/* 选择题型 */}
      {question.type === 'choice' && question.options && (
        <div className="grid grid-cols-2 gap-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionSelect(option)}
              disabled={disabled}
              className="px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white text-left hover:bg-white/30 active:bg-amber-500 disabled:opacity-50 transition-colors"
            >
              {String.fromCharCode(65 + index)}. {option}
            </button>
          ))}
        </div>
      )}

      {/* 反馈动画 */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-4 text-center py-2 rounded-lg ${
              isCorrect ? 'bg-green-500/50 text-green-100' : 'bg-red-500/50 text-red-100'
            }`}
          >
            {isCorrect ? '✅ 回答正确！' : '❌ 回答错误'}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
```

---

### Step 6.2: Commit

```bash
git add src/components/battle/QuestionPanel.tsx
git commit -m "feat(battle): add QuestionPanel with input/judgment/choice support"
```

---

## Task 7: 敌人战场组件

**Files:**
- Create: `src/components/battle/EnemyField.tsx`

---

### Step 7.1: 实现敌人战场组件

**File:** `src/components/battle/EnemyField.tsx`

```typescript
import React, { useEffect, useRef } from 'react';
import { Enemy } from '../../systems/battle/types';

interface EnemyFieldProps {
  enemies: Enemy[];
}

export const EnemyField: React.FC<EnemyFieldProps> = ({ enemies }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制敌人
    enemies.forEach((enemy) => {
      if (enemy.status !== 'approaching') return;

      drawEnemy(ctx, enemy);
    });
  }, [enemies]);

  const drawEnemy = (ctx: CanvasRenderingContext2D, enemy: Enemy) => {
    const x = enemy.position.x;
    const y = enemy.position.y;

    // 绘制敌人图标
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const emoji = enemy.type === 'boss' ? '👹' : enemy.type === 'elite' ? '👺' : '👾';
    ctx.fillText(emoji, x, y);

    // 绘制问题提示
    ctx.font = '14px "Noto Sans SC", sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(enemy.question.question.substring(0, 15) + '...', x, y - 35);

    // 绘制血条
    const barWidth = 60;
    const barHeight = 6;
    const healthPercent = enemy.health / enemy.maxHealth;

    ctx.fillStyle = '#374151';
    ctx.fillRect(x - barWidth / 2, y + 25, barWidth, barHeight);

    ctx.fillStyle = healthPercent > 0.5 ? '#10B981' : '#EF4444';
    ctx.fillRect(x - barWidth / 2, y + 25, barWidth * healthPercent, barHeight);
  };

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={400}
      className="w-full h-full rounded-xl bg-gradient-to-b from-gray-800 to-gray-900"
    />
  );
};
```

---

### Step 7.2: Commit

```bash
git add src/components/battle/EnemyField.tsx
git commit -m "feat(battle): add EnemyField canvas component"
```

---

## Task 8: 技能栏组件

**Files:**
- Create: `src/components/battle/SkillBar.tsx`

---

### Step 8.1: 实现技能栏组件

**File:** `src/components/battle/SkillBar.tsx`

```typescript
import React from 'react';
import { motion } from 'framer-motion';
import { Skill } from '../../systems/battle/types';

interface SkillBarProps {
  skills: Skill[];
  onUseSkill: (skillId: string) => void;
}

export const SkillBar: React.FC<SkillBarProps> = ({ skills, onUseSkill }) => {
  return (
    <div className="flex items-center gap-3">
      <span className="text-white/60 text-sm">技能：</span>
      {skills.map((skill) => {
        const isReady = skill.currentCharge >= skill.chargeRequired;
        const chargePercent = (skill.currentCharge / skill.chargeRequired) * 100;

        return (
          <motion.button
            key={skill.id}
            onClick={() => isReady && onUseSkill(skill.id)}
            disabled={!isReady}
            whileHover={isReady ? { scale: 1.1 } : {}}
            whileTap={isReady ? { scale: 0.95 } : {}}
            className={`relative w-14 h-14 rounded-lg border-2 transition-all ${
              isReady
                ? 'border-amber-400 bg-amber-500/30 cursor-pointer hover:bg-amber-500/50'
                : 'border-gray-600 bg-gray-800/50 cursor-not-allowed'
            }`}
          >
            {/* 图标 */}
            <span className="text-2xl absolute inset-0 flex items-center justify-center">
              {skill.icon}
            </span>

            {/* 充能进度 */}
            {!isReady && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700 rounded-b-lg overflow-hidden">
                <motion.div
                  className="h-full bg-amber-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${chargePercent}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}

            {/* 就绪标记 */}
            {isReady && (
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              />
            )}

            {/* 快捷键提示 */}
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs text-white/60 bg-black/50 px-1 rounded">
              {skill.id === 'freeze' ? '1' : skill.id === 'clear' ? '2' : skill.id === 'heal' ? '3' : '4'}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};
```

---

### Step 8.2: Commit

```bash
git add src/components/battle/SkillBar.tsx
git commit -m "feat(battle): add SkillBar with charge visualization"
```

---

## Task 9: 战斗场景主组件

**Files:**
- Create: `src/components/battle/BattleScene.tsx`

---

### Step 9.1: 实现战斗场景主组件

**File:** `src/components/battle/BattleScene.tsx`

```typescript
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BattleEngine, BattleEngineConfig } from '../../systems/battle/BattleEngine';
import { BattleState, BattleResult, BattlePhase } from '../../systems/battle/types';
import { KnowledgeCard } from './KnowledgeCard';
import { QuestionPanel } from './QuestionPanel';
import { EnemyField } from './EnemyField';
import { SkillBar } from './SkillBar';

interface BattleSceneProps {
  config: BattleEngineConfig;
  onComplete: (result: BattleResult) => void;
}

export const BattleScene: React.FC<BattleSceneProps> = ({ config, onComplete }) => {
  const [engine] = useState(() => new BattleEngine(config));
  const [state, setState] = useState<BattleState>(engine.getState());
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    engine.start(
      (newState) => setState(newState),
      (result) => onComplete(result)
    );

    return () => {
      engine.destroy();
    };
  }, [engine, onComplete]);

  const handleAnswer = useCallback(
    (answer: string) => {
      const result = engine.answerQuestion(answer);

      if (result.correct) {
        setFeedback({ message: `+${result.score}分！`, type: 'success' });
      } else {
        setFeedback({ message: '回答错误，连击中断', type: 'error' });
      }

      setTimeout(() => setFeedback(null), 1000);
    },
    [engine]
  );

  const handleUseSkill = useCallback(
    (skillId: string) => {
      const success = engine.useSkill(skillId);
      if (success) {
        setFeedback({ message: '技能释放！', type: 'success' });
        setTimeout(() => setFeedback(null), 1000);
      }
    },
    [engine]
  );

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state.phase !== 'fighting' && state.phase !== 'boss_fight') return;

      switch (e.key) {
        case '1':
          handleUseSkill('freeze');
          break;
        case '2':
          handleUseSkill('clear');
          break;
        case '3':
          handleUseSkill('heal');
          break;
        case '4':
          handleUseSkill('shield');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.phase, handleUseSkill]);

  const currentEnemy = state.enemies.find((e) => e.status === 'approaching');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-4">
      {/* Header */}
      <header className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold">药灵守护战</h2>
          <p className="text-sm text-gray-400">
            第{state.currentWave}波 / {state.totalWaves}
          </p>
        </div>
        <div className="flex gap-6 text-sm">
          <div>得分: <span className="text-amber-400 font-bold">{state.score}</span></div>
          <div>生命: <span className="text-red-400 font-bold">{state.playerHealth}/{state.maxHealth}</span></div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {/* 学习阶段 */}
          {state.phase === 'learning' && state.currentKnowledge && (
            <motion.div
              key="learning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-8"
            >
              <KnowledgeCard
                card={state.currentKnowledge}
                onComplete={() => {}}
              />
            </motion.div>
          )}

          {/* 波次开始 */}
          {(state.phase === 'wave_start' || state.phase === 'wave_clear') && (
            <motion.div
              key="wave-info"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="min-h-[400px] flex items-center justify-center"
            >
              <div className="text-center">
                <h3 className="text-3xl font-bold mb-2">
                  {state.phase === 'wave_start' ? `第${state.currentWave}波` : '波次完成！'}
                </h3>
                <p className="text-gray-400">
                  {state.phase === 'wave_start'
                    ? '准备战斗...'
                    : `得分: ${state.score} | 连击: ${state.combo}`}
                </p>
              </div>
            </motion.div>
          )}

          {/* 战斗阶段 */}
          {(state.phase === 'spawning' || state.phase === 'fighting' || state.phase === 'boss_fight') && (
            <motion.div
              key="fighting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* 战场 */}
              <div className="h-80 mb-4 relative">
                <EnemyField enemies={state.enemies} />

                {/* 连击显示 */}
                {state.combo > 1 && (
                  <div className="absolute top-4 right-4 text-center">
                    <div className="text-3xl font-bold text-yellow-400">
                      {state.combo} 连击!
                    </div>
                    <div className="text-sm text-yellow-300">
                      x{(1 + Math.floor(state.combo / 5) * 0.2).toFixed(1)}
                    </div>
                  </div>
                )}
              </div>

              {/* 题目面板 */}
              <QuestionPanel
                enemy={currentEnemy}
                onAnswer={handleAnswer}
                disabled={!currentEnemy}
              />

              {/* 技能栏 */}
              <div className="mt-4 flex justify-center">
                <SkillBar skills={state.skills} onUseSkill={handleUseSkill} />
              </div>
            </motion.div>
          )}

          {/* 结束阶段 */}
          {state.phase === 'ending' && (
            <motion.div
              key="ending"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="min-h-[400px] flex items-center justify-center"
            >
              <div className="text-center">
                <h3 className="text-4xl font-bold mb-4">
                  {state.playerHealth > 0 ? '🎉 胜利！' : '💀 失败'}
                </h3>
                <div className="text-gray-400">
                  <p>最终得分: {state.score}</p>
                  <p>最高连击: {state.maxCombo}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 反馈提示 */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full font-bold ${
                feedback.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}
            >
              {feedback.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
```

---

### Step 9.2: Commit

```bash
git add src/components/battle/BattleScene.tsx
git commit -m "feat(battle): add BattleScene main component with all sub-components"
```

---

## Task 10: 更新BattleStage页面

**Files:**
- Modify: `src/pages/stages/BattleStage.tsx` (替换占位实现)

---

### Step 10.1: 实现战斗关卡页面

**File:** `src/pages/stages/BattleStage.tsx`

```typescript
import React from 'react';
import { BattleScene } from '../../components/battle/BattleScene';
import type { StageProps } from '../../types/stage';
import { useChapterStore } from '../../stores/chapterStore';
import { usePlayerStore } from '../../stores/playerStore';
import { getChapterById } from '../../data/chapters';
import { medicines } from '../../data/medicines';
import { formulas } from '../../data/formulas';
import { BattleResult } from '../../systems/battle/types';

const BattleStage: React.FC<StageProps> = ({ chapterId, onComplete, onExit }) => {
  const chapterStore = useChapterStore();
  const playerStore = usePlayerStore();

  const chapter = chapterId ? getChapterById(chapterId) : null;

  if (!chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">章节不存在</div>
      </div>
    );
  }

  // 获取章节相关药材和方剂
  const chapterMedicines = medicines.filter((m) =>
    chapter.medicines.includes(m.id)
  );
  const chapterFormulas = formulas.filter((f) =>
    chapter.formulas?.includes(f.id)
  );

  const handleBattleComplete = (result: BattleResult) => {
    if (result.victory) {
      // 奖励
      chapterStore.addCurrency(result.score);
      playerStore.addExperience(result.score / 10);

      // 完成阶段
      onComplete({
        score: result.score,
        maxCombo: result.maxCombo,
        wavesCleared: result.wavesCleared,
        accuracy: result.correctAnswers / result.totalQuestions,
      });
    } else {
      // 失败处理 - 可以重试或返回
      if (window.confirm('战斗失败！是否重试？')) {
        window.location.reload();
      } else {
        onExit?.();
      }
    }
  };

  return (
    <div className="min-h-screen">
      <BattleScene
        config={{
          chapterId: chapterId!,
          medicines: chapterMedicines,
          formulas: chapterFormulas,
        }}
        onComplete={handleBattleComplete}
      />

      {/* 退出按钮 */}
      <button
        onClick={onExit}
        className="fixed top-4 right-4 z-50 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors"
      >
        退出
      </button>
    </div>
  );
};

export default BattleStage;
```

---

### Step 10.2: Commit

```bash
git add src/pages/stages/BattleStage.tsx
git commit -m "feat(battle): integrate BattleScene into BattleStage page"
```

---

## Task 11: TypeScript类型检查

**Files:**
- Run type check on entire project

---

### Step 11.1: 运行类型检查

```bash
cd /home/lixiang/Desktop/zhongyi_game/src
npm run type-check
```

**Expected:** 0 errors

---

### Step 11.2: 如果有错误则修复

修复任何TypeScript错误后提交：

```bash
git add .
git commit -m "fix(battle): resolve TypeScript type errors"
```

---

## Task 12: 运行测试

**Files:**
- Run all tests

---

### Step 12.1: 运行单元测试

```bash
cd /home/lixiang/Desktop/zhongyi_game/src
npm run test:unit
```

**Expected:** All PASS

---

### Step 12.2: 运行构建

```bash
cd /home/lixiang/Desktop/zhongyi_game/src
npm run build
```

**Expected:** Build successful

---

### Step 12.3: Final Commit

```bash
git add .
git commit -m "feat(phase3): complete knowledge Q&A battle system"
```

---

## Phase 3 完成标准

- [x] 知识卡片学习系统（3秒学习时间）
- [x] 三题型支持：输入题、判断题、选择题
- [x] 敌人逼近动画（Canvas渲染）
- [x] 答题击退敌人机制
- [x] 连击系统
- [x] 技能系统（冷冻/清屏/回血/护盾）
- [x] 答对充能技能
- [x] 波次系统（4波）
- [x] 战斗结算
- [x] TypeScript 0错误
- [x] 单元测试通过
- [x] 构建成功

**下一阶段:** Phase 4 - AI导师系统

---

## 战斗系统使用说明

### 流程
1. **学习阶段** - 5秒学习知识卡片，高亮关键信息
2. **波次开始** - 敌人从上方出现，头顶显示问题
3. **答题战斗** - 输入答案或选择判断，击退敌人
4. **获得技能** - 答对题目充能技能，满格可释放
5. **结算** - 计算得分、连击、正确率

### 题型
- **输入题** - 输入性味、功效、归经等
- **判断题** - 判断描述是否正确（对/错）
- **选择题** - 从4个选项中选择正确答案

### 技能快捷键
- `1` - 冷冻术
- `2` - 五雷轰顶
- `3` - 回春术
- `4` - 护盾术

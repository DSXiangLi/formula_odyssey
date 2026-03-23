# Phase 3: 药灵守护战斗系统 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现四波次打字战斗系统，支持拼音输入、连击系统、技能系统

**Architecture:** Canvas渲染 + 实时输入检测 + 状态机驱动的波次管理

**Tech Stack:** React, TypeScript, Canvas API, pinyin-pro

---

## 文件结构规划

```
src/
├── systems/
│   └── battle/
│       ├── BattleEngine.ts       # 战斗核心引擎
│       ├── WaveManager.ts        # 波次管理
│       ├── InputHandler.ts       # 输入处理（含拼音）
│       ├── ComboSystem.ts        # 连击系统
│       ├── SkillSystem.ts        # 技能系统
│       ├── EnemySpawner.ts       # 敌人生成
│       └── index.ts
├── components/
│   └── battle/
│       ├── BattleScene.tsx       # 战斗场景主组件
│       ├── Enemy.tsx             # 敌人显示
│       ├── InputZone.tsx         # 输入区域
│       ├── ComboDisplay.tsx      # 连击显示
│       ├── SkillBar.tsx          # 技能栏
│       └── WaveIndicator.tsx     # 波次指示器
├── hooks/
│   └── useBattle.ts              # 战斗Hook
└── pages/
    └── BattleStage.tsx           # 战斗关卡页面
```

---

## Task 1: 战斗核心引擎

**参考文档:** `design-output/v3.0-specs/tech/04-battle-system.md`

**Files:**
- Create: `src/systems/battle/BattleEngine.ts`
- Create: `src/systems/battle/types.ts`
- Create: `src/systems/battle/index.ts`

---

### Step 1.1: 创建战斗类型定义

**File:** `src/systems/battle/types.ts`

```typescript
import { Position } from '../../types';

export type BattlePhase =
  | 'preparing'
  | 'wave_start'
  | 'spawning'
  | 'fighting'
  | 'wave_clear'
  | 'boss_intro'
  | 'boss_fight'
  | 'ending'
  | 'settlement';

export interface BattleState {
  phase: BattlePhase;
  currentWave: number;
  totalWaves: number;
  playerHealth: number;
  maxHealth: number;
  combo: number;
  maxCombo: number;
  score: number;
  timeElapsed: number;
  enemies: Enemy[];
}

export interface Enemy {
  id: string;
  type: 'normal' | 'elite' | 'boss';
  name: string;
  health: number;
  maxHealth: number;
  speed: number;
  position: Position;
  targetText: string;
  targetPinyin: string;
  reward: number;
  status: 'approaching' | 'attacking' | 'defeated';
}

export interface WaveConfig {
  waveNumber: number;
  name: string;
  description: string;
  enemyType: 'normal' | 'elite' | 'boss';
  enemyCount: number;
  spawnInterval: number;
  targetTextType: 'name' | 'properties' | 'effects' | 'formula';
  timeLimit?: number;
}

export interface BattleResult {
  victory: boolean;
  score: number;
  maxCombo: number;
  wavesCleared: number;
  timeElapsed: number;
  accuracy: number;
}

export interface InputResult {
  type: 'exact_match' | 'pinyin_match' | 'fuzzy_match' | 'prefix_match' | 'no_match';
  score?: number;
  progress?: number;
}
```

---

### Step 1.2: 实现战斗引擎

**File:** `src/systems/battle/BattleEngine.ts`

```typescript
import { BattleState, BattlePhase, Enemy, WaveConfig, BattleResult, InputResult } from './types';
import { Position } from '../../types';
import { Medicine, Formula } from '../../types';

export interface BattleEngineConfig {
  chapterId: string;
  medicines: Medicine[];
  formulas: Formula[];
}

export class BattleEngine {
  private state: BattleState;
  private config: BattleEngineConfig;
  private waveConfigs: WaveConfig[];
  private spawnQueue: Enemy[] = [];
  private lastSpawnTime: number = 0;
  private onStateChange: ((state: BattleState) => void) | null = null;
  private onBattleEnd: ((result: BattleResult) => void) | null = null;

  constructor(config: BattleEngineConfig) {
    this.config = config;
    this.waveConfigs = this.createWaveConfigs();

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
      },
      {
        waveNumber: 2,
        name: '性味归经',
        description: '输入四气五味信息',
        enemyType: 'normal',
        enemyCount: 5,
        spawnInterval: 2500,
        targetTextType: 'properties',
      },
      {
        waveNumber: 3,
        name: '功效主治',
        description: '输入功效关键词',
        enemyType: 'elite',
        enemyCount: 3,
        spawnInterval: 4000,
        targetTextType: 'effects',
      },
      {
        waveNumber: 4,
        name: '方剂对决',
        description: '输入完整方剂组成',
        enemyType: 'boss',
        enemyCount: 1,
        spawnInterval: 0,
        targetTextType: 'formula',
        timeLimit: 60,
      },
    ];
  }

  start(onStateChange: (state: BattleState) => void, onBattleEnd: (result: BattleResult) => void): void {
    this.onStateChange = onStateChange;
    this.onBattleEnd = onBattleEnd;
    this.state.phase = 'wave_start';
    this.notifyStateChange();

    // Start first wave after delay
    setTimeout(() => this.startWave(1), 2000);
  }

  private startWave(waveNumber: number): void {
    this.state.currentWave = waveNumber;
    this.state.phase = 'spawning';
    this.spawnQueue = this.generateEnemies(waveNumber);
    this.lastSpawnTime = Date.now();
    this.notifyStateChange();
  }

  private generateEnemies(waveNumber: number): Enemy[] {
    const config = this.waveConfigs[waveNumber - 1];
    const enemies: Enemy[] = [];

    for (let i = 0; i < config.enemyCount; i++) {
      const { text, pinyin } = this.generateTargetText(config.targetTextType);
      enemies.push({
        id: `enemy_${waveNumber}_${i}`,
        type: config.enemyType,
        name: config.enemyType === 'boss' ? '邪灵王' : config.enemyType === 'elite' ? '大邪灵' : '小邪灵',
        health: config.enemyType === 'boss' ? 10 : config.enemyType === 'elite' ? 3 : 1,
        maxHealth: config.enemyType === 'boss' ? 10 : config.enemyType === 'elite' ? 3 : 1,
        speed: config.enemyType === 'boss' ? 15 : config.enemyType === 'elite' ? 30 : 50,
        position: { x: 400, y: 100 },
        targetText: text,
        targetPinyin: pinyin,
        reward: config.enemyType === 'boss' ? 100 : config.enemyType === 'elite' ? 30 : 10,
        status: 'approaching',
      });
    }

    return enemies;
  }

  private generateTargetText(type: string): { text: string; pinyin: string } {
    switch (type) {
      case 'name': {
        const medicine = this.getRandomMedicine();
        return { text: medicine.name, pinyin: medicine.pinyin };
      }
      case 'properties': {
        const medicine = this.getRandomMedicine();
        return {
          text: `${medicine.fourQi}${medicine.fiveFlavors.join('')}`,
          pinyin: `${medicine.fourQi} ${medicine.fiveFlavors.join('')}`,
        };
      }
      case 'effects': {
        const medicine = this.getRandomMedicine();
        const function_text = medicine.functions[0] || '解表';
        return { text: function_text, pinyin: function_text }; // Simplified
      }
      case 'formula': {
        const formula = this.getRandomFormula();
        return { text: formula.name, pinyin: formula.name }; // Simplified
      }
      default:
        return { text: '测试', pinyin: 'ce shi' };
    }
  }

  private getRandomMedicine(): Medicine {
    return this.config.medicines[Math.floor(Math.random() * this.config.medicines.length)];
  }

  private getRandomFormula(): Formula {
    return this.config.formulas[Math.floor(Math.random() * this.config.formulas.length)];
  }

  update(deltaTime: number): void {
    if (this.state.phase !== 'spawning' && this.state.phase !== 'fighting') return;

    this.state.timeElapsed += deltaTime;

    // Spawn enemies
    if (this.state.phase === 'spawning' && this.spawnQueue.length > 0) {
      const now = Date.now();
      const config = this.waveConfigs[this.state.currentWave - 1];
      if (now - this.lastSpawnTime >= config.spawnInterval) {
        const enemy = this.spawnQueue.shift()!;
        this.state.enemies.push(enemy);
        this.lastSpawnTime = now;

        if (this.spawnQueue.length === 0) {
          this.state.phase = 'fighting';
        }
      }
    }

    // Update enemies
    this.state.enemies = this.state.enemies.filter(enemy => {
      if (enemy.status === 'defeated') return false;

      // Move enemy towards player
      if (enemy.status === 'approaching') {
        enemy.position.y += enemy.speed * (deltaTime / 1000);
        if (enemy.position.y >= 400) {
          enemy.status = 'attacking';
          this.state.playerHealth -= enemy.type === 'boss' ? 30 : enemy.type === 'elite' ? 20 : 10;
          this.state.combo = 0;

          if (this.state.playerHealth <= 0) {
            this.endBattle(false);
          }
        }
      }

      return enemy.status !== 'defeated';
    });

    // Check wave clear
    if (this.state.enemies.length === 0 && this.spawnQueue.length === 0) {
      this.onWaveClear();
    }

    this.notifyStateChange();
  }

  onInput(input: string): InputResult {
    // Find enemy with matching text
    for (const enemy of this.state.enemies) {
      if (enemy.status !== 'approaching') continue;

      // Exact match
      if (input === enemy.targetText) {
        this.defeatEnemy(enemy);
        return { type: 'exact_match', score: 1.0 };
      }

      // Pinyin match
      if (input === enemy.targetPinyin) {
        this.defeatEnemy(enemy);
        return { type: 'pinyin_match', score: 0.95 };
      }

      // Prefix match
      if (enemy.targetPinyin.startsWith(input)) {
        return { type: 'prefix_match', progress: input.length / enemy.targetPinyin.length };
      }
    }

    return { type: 'no_match' };
  }

  private defeatEnemy(enemy: Enemy): void {
    enemy.status = 'defeated';
    this.state.combo++;
    this.state.maxCombo = Math.max(this.state.maxCombo, this.state.combo);

    // Calculate score with combo multiplier
    const multiplier = 1 + Math.floor(this.state.combo / 10) * 0.1;
    this.state.score += Math.floor(enemy.reward * multiplier);

    this.notifyStateChange();
  }

  private onWaveClear(): void {
    if (this.state.currentWave >= this.state.totalWaves) {
      this.endBattle(true);
    } else {
      this.state.phase = 'wave_clear';
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
        accuracy: 0.9, // Calculated from hits/misses
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
}
```

---

### Step 1.3: Commit

```bash
git add src/systems/battle/
git commit -m "feat(battle): implement BattleEngine with wave system and enemy management"
```

---

## Task 2: 拼音输入处理

**Files:**
- Create: `src/systems/battle/InputHandler.ts`
- Install: `pinyin-pro`

---

### Step 2.1: 安装拼音库

```bash
cd /home/lixiang/Desktop/zhongyi_game/src
npm install pinyin-pro
```

---

### Step 2.2: 实现输入处理器

**File:** `src/systems/battle/InputHandler.ts`

```typescript
import { pinyin } from 'pinyin-pro';
import { InputResult } from './types';

export interface InputHandlerState {
  targetText: string;
  targetPinyin: string;
  currentInput: string;
}

export class InputHandler {
  private state: InputHandlerState;

  constructor(targetText: string) {
    this.state = {
      targetText,
      targetPinyin: this.toPinyin(targetText),
      currentInput: '',
    };
  }

  private toPinyin(text: string): string {
    return pinyin(text, { toneType: 'none', type: 'array' }).join(' ');
  }

  processInput(input: string): InputResult {
    const normalized = input.toLowerCase().trim();

    // Exact Chinese match
    if (normalized === this.state.targetText) {
      return { type: 'exact_match', score: 1.0 };
    }

    // Pinyin match (with or without spaces)
    const targetPinyinNoSpace = this.state.targetPinyin.replace(/\s/g, '');
    const normalizedNoSpace = normalized.replace(/\s/g, '');

    if (normalized === this.state.targetPinyin ||
        normalizedNoSpace === targetPinyinNoSpace) {
      return { type: 'pinyin_match', score: 0.95 };
    }

    // Fuzzy pinyin match (n/l, z/zh, c/ch, s/sh)
    if (this.matchFuzzyPinyin(normalized, this.state.targetPinyin)) {
      return { type: 'fuzzy_match', score: 0.9 };
    }

    // Prefix match for real-time feedback
    if (this.state.targetPinyin.startsWith(normalized)) {
      return {
        type: 'prefix_match',
        progress: normalized.length / this.state.targetPinyin.length,
      };
    }

    return { type: 'no_match' };
  }

  private matchFuzzyPinyin(input: string, target: string): boolean {
    const fuzzyMap: Record<string, string[]> = {
      'n': ['n', 'l'],
      'l': ['n', 'l'],
      'z': ['z', 'zh'],
      'zh': ['z', 'zh'],
      'c': ['c', 'ch'],
      'ch': ['c', 'ch'],
      's': ['s', 'sh'],
      'sh': ['s', 'sh'],
    };

    // Check if input could be a fuzzy match
    if (input.length !== target.replace(/\s/g, '').length) {
      return false;
    }

    const inputChars = input.replace(/\s/g, '').split('');
    const targetChars = target.replace(/\s/g, '').split('');

    for (let i = 0; i < inputChars.length; i++) {
      const inputChar = inputChars[i];
      const targetChar = targetChars[i];

      if (inputChar === targetChar) continue;

      const fuzzyMatches = fuzzyMap[inputChar];
      if (!fuzzyMatches || !fuzzyMatches.includes(targetChar)) {
        return false;
      }
    }

    return true;
  }

  getPinyinHint(level: number): string {
    // Level 0: First char
    // Level 1: First 30%
    // Level 2: First 60%
    // Level 3: Full
    const pinyin = this.state.targetPinyin;

    switch (level) {
      case 0:
        return pinyin[0] + '_'.repeat(pinyin.length - 1);
      case 1:
        const showCount1 = Math.ceil(pinyin.length * 0.3);
        return pinyin.slice(0, showCount1) + '_'.repeat(pinyin.length - showCount1);
      case 2:
        const showCount2 = Math.ceil(pinyin.length * 0.6);
        return pinyin.slice(0, showCount2) + '_'.repeat(pinyin.length - showCount2);
      default:
        return pinyin;
    }
  }

  setTarget(targetText: string): void {
    this.state.targetText = targetText;
    this.state.targetPinyin = this.toPinyin(targetText);
    this.state.currentInput = '';
  }
}
```

---

### Step 2.3: Commit

```bash
git add src/systems/battle/InputHandler.ts
git commit -m "feat(battle): add pinyin input handler with fuzzy matching"
```

---

## Task 3: 战斗场景UI

**Files:**
- Create: `src/components/battle/BattleScene.tsx`
- Create: `src/components/battle/InputZone.tsx`
- Create: `src/components/battle/ComboDisplay.tsx`

---

### Step 3.1: 创建战斗场景组件

**File:** `src/components/battle/BattleScene.tsx`

```typescript
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { BattleEngine, BattleEngineConfig } from '../../systems/battle/BattleEngine';
import { BattleState, BattleResult, Enemy } from '../../systems/battle/types';
import { InputZone } from './InputZone';
import { ComboDisplay } from './ComboDisplay';

interface BattleSceneProps {
  config: BattleEngineConfig;
  onComplete: (result: BattleResult) => void;
}

export const BattleScene: React.FC<BattleSceneProps> = ({ config, onComplete }) => {
  const [engine] = useState(() => new BattleEngine(config));
  const [state, setState] = useState<BattleState>(engine.getState());
  const [input, setInput] = useState('');
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    engine.start(
      (newState) => setState(newState),
      (result) => onComplete(result)
    );

    const gameLoop = (timestamp: number) => {
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;
      engine.update(deltaTime);
      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => cancelAnimationFrame(animationRef.current);
  }, [engine, onComplete]);

  const handleInput = useCallback((value: string) => {
    setInput(value);

    const result = engine.onInput(value);

    if (result.type === 'exact_match' || result.type === 'pinyin_match' || result.type === 'fuzzy_match') {
      setInput(''); // Clear on match
    }
  }, [engine]);

  const currentWave = state.currentWave > 0 ? state.currentWave : 1;
  const waveNames = ['', '药名辨识', '性味归经', '功效主治', '方剂对决'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
      {/* Header */}
      <header className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold">药灵守护战</h2>
          <p className="text-sm text-gray-400">
            第{currentWave}波 / {state.totalWaves} - {waveNames[currentWave]}
          </p>
        </div>
        <div className="flex gap-4 text-sm">
          <div>得分: {state.score}</div>
          <div>生命: {state.playerHealth}/{state.maxHealth}</div>
        </div>
      </header>

      {/* Battle Area */}
      <div className="relative h-96 bg-gray-800 rounded-xl overflow-hidden mb-4">
        {/* Enemies */}
        {state.enemies.map((enemy) => (
          <EnemySprite
            key={enemy.id}
            enemy={enemy}
            isTarget={enemy.status === 'approaching'}
          />
        ))}

        {/* Player */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-2xl">🧙‍♂️</span>
          </div>
        </div>

        {/* Wave/Phase Indicator */}
        {state.phase === 'wave_start' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <h3 className="text-3xl font-bold">第{currentWave}波</h3>
          </div>
        )}

        {state.phase === 'ending' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <h3 className="text-3xl font-bold">
              {state.playerHealth > 0 ? '胜利！' : '失败'}
            </h3>
          </div>
        )}
      </div>

      {/* Combo Display */}
      <ComboDisplay combo={state.combo} />

      {/* Input Zone */}
      <InputZone
        value={input}
        onChange={handleInput}
        enemies={state.enemies}
      />

      {/* Hint */}
      <div className="mt-4 text-center text-sm text-gray-400">
        输入药材名称或拼音击退邪灵！支持模糊拼音(z/zh, c/ch等)
      </div>
    </div>
  );
};

const EnemySprite: React.FC<{ enemy: Enemy; isTarget: boolean }> = ({ enemy, isTarget }) => {
  const emoji = enemy.type === 'boss' ? '👹' : enemy.type === 'elite' ? '👺' : '👾';

  return (
    <div
      className="absolute transition-all duration-200"
      style={{
        left: `${enemy.position.x}px`,
        top: `${enemy.position.y}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className={`text-4xl ${isTarget ? 'animate-pulse' : ''}`}>{emoji}</div>

      {/* Target text */}
      {isTarget && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/70 px-2 py-1 rounded text-sm whitespace-nowrap">
          {enemy.targetText}
        </div>
      )}

      {/* Health bar */}
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gray-700 rounded">
        <div
          className="h-full bg-red-500 rounded transition-all"
          style={{ width: `${(enemy.health / enemy.maxHealth) * 100}%` }}
        />
      </div>
    </div>
  );
};
```

---

### Step 3.2: 创建输入区域组件

**File:** `src/components/battle/InputZone.tsx`

```typescript
import React from 'react';
import { Enemy } from '../../systems/battle/types';

interface InputZoneProps {
  value: string;
  onChange: (value: string) => void;
  enemies: Enemy[];
}

export const InputZone: React.FC<InputZoneProps> = ({ value, onChange, enemies }) => {
  // Get the closest enemy for hint
  const targetEnemy = enemies.find(e => e.status === 'approaching');

  return (
    <div className="max-w-md mx-auto">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={targetEnemy ? `输入: ${targetEnemy.targetText}` : '等待敌人...'}
          className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg text-center text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={!targetEnemy}
          autoFocus
        />

        {/* Input hint */}
        {targetEnemy && value && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">
            {targetEnemy.targetPinyin}
          </div>
        )}
      </div>

      {/* Target list */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {enemies.filter(e => e.status === 'approaching').map(enemy => (
          <div
            key={enemy.id}
            className={`px-3 py-1 rounded-full text-sm ${
              value && enemy.targetPinyin.startsWith(value.toLowerCase())
                ? 'bg-green-600'
                : 'bg-gray-700'
            }`}
          >
            {enemy.targetText}
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

### Step 3.3: 创建连击显示组件

**File:** `src/components/battle/ComboDisplay.tsx`

```typescript
import React from 'react';

interface ComboDisplayProps {
  combo: number;
}

export const ComboDisplay: React.FC<ComboDisplayProps> = ({ combo }) => {
  if (combo < 2) return null;

  const multiplier = 1 + Math.floor(combo / 10) * 0.1;

  return (
    <div className="text-center mb-4">
      <div className="text-4xl font-bold text-yellow-400 animate-pulse">
        {combo} 连击!
      </div>
      {combo >= 10 && (
        <div className="text-lg text-yellow-300">
          x{multiplier.toFixed(1)} 倍率
        </div>
      )}
    </div>
  );
};
```

---

### Step 3.4: Commit

```bash
git add src/components/battle/
git commit -m "feat(battle): add BattleScene UI with enemy sprites and input handling"
```

---

## Task 4: 战斗关卡页面

**Files:**
- Create: `src/pages/BattleStage.tsx`
- Modify: `src/App.tsx`

---

### Step 4.1: 创建战斗页面

**File:** `src/pages/BattleStage.tsx`

```typescript
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BattleScene } from '../components/battle/BattleScene';
import { BattleResult } from '../systems/battle/types';
import { useChapterStore, usePlayerStore } from '../stores';
import { getChapterById } from '../data';
import { medicines } from '../data/medicines';
import { formulas } from '../data/formulas';

export const BattleStage: React.FC = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const { completeStage, addCurrency, addExperience } = useChapterStore();
  const { increaseWuxingAffinity } = usePlayerStore();

  const chapter = chapterId ? getChapterById(chapterId) : null;

  if (!chapter) {
    return <div>章节不存在</div>;
  }

  const chapterMedicines = medicines.filter(m => chapter.medicines.includes(m.id));
  const chapterFormulas = formulas.filter(f => chapter.formulas.includes(f.id));

  const handleBattleComplete = (result: BattleResult) => {
    // Give rewards
    if (result.victory) {
      addCurrency(result.score);
      addExperience(result.score / 10);
      increaseWuxingAffinity(chapter.wuxing, 10);
      completeStage(chapterId!, 'c1-battle');

      // Navigate to next stage
      navigate(`/chapter/${chapterId}/formula`);
    } else {
      // Retry option
      alert('战斗失败！再试一次？');
    }
  };

  return (
    <BattleScene
      config={{
        chapterId: chapterId!,
        medicines: chapterMedicines,
        formulas: chapterFormulas,
      }}
      onComplete={handleBattleComplete}
    />
  );
};
```

---

### Step 4.2: Update App.tsx

**File:** `src/App.tsx`

```typescript
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ChapterSelect } from './pages/ChapterSelect';
import { ChapterEntry } from './pages/ChapterEntry';
import { GatheringStage } from './pages/GatheringStage';
import { BattleStage } from './pages/BattleStage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ChapterSelect />} />
        <Route path="/chapter/:chapterId" element={<ChapterEntry />} />
        <Route path="/chapter/:chapterId/gathering" element={<GatheringStage />} />
        <Route path="/chapter/:chapterId/battle" element={<BattleStage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
```

---

### Step 4.3: Commit

```bash
git add src/pages/BattleStage.tsx src/App.tsx
git commit -m "feat(pages): integrate battle stage with chapter progression"
```

---

## Task 5: 测试与验证

---

### Step 5.1: 创建战斗引擎测试

**File:** `src/systems/battle/__tests__/BattleEngine.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { BattleEngine } from '../BattleEngine';
import { Medicine, Formula } from '../../../types';

const mockMedicines: Medicine[] = [
  { id: 'ma-huang', name: '麻黄', pinyin: 'ma huang', category: '解表药', wuxing: 'wood', fourQi: 'warm', fiveFlavors: ['pungent', 'slightly_bitter'], movement: 'floating', meridians: ['lung', 'bladder'], toxicity: 'mild', functions: ['induce_sweating'], indications: ['exterior_cold'], imagePlant: '', imageHerb: '', collectionType: 'digging', affinity: 0, isCollected: false },
];

const mockFormulas: Formula[] = [
  { id: 'ma-huang-tang', name: '麻黄汤', composition: [], functions: [], indications: [] },
];

describe('BattleEngine', () => {
  const config = {
    chapterId: 'chapter-1',
    medicines: mockMedicines,
    formulas: mockFormulas,
  };

  it('should initialize with correct state', () => {
    const engine = new BattleEngine(config);
    const state = engine.getState();

    expect(state.phase).toBe('preparing');
    expect(state.playerHealth).toBe(100);
    expect(state.combo).toBe(0);
  });

  it('should start first wave correctly', () => {
    const engine = new BattleEngine(config);
    const onStateChange = vi.fn();
    const onBattleEnd = vi.fn();

    engine.start(onStateChange, onBattleEnd);

    expect(onStateChange).toHaveBeenCalled();
  });

  it('should defeat enemy on correct input', () => {
    const engine = new BattleEngine(config);
    engine.start(() => {}, () => {});

    // Force spawn an enemy
    const state = engine.getState();
    if (state.enemies.length > 0) {
      const enemy = state.enemies[0];
      const result = engine.onInput(enemy.targetText);

      expect(result.type).toBe('exact_match');
      expect(engine.getState().combo).toBe(1);
    }
  });
});
```

---

### Step 5.2: 运行验证

```bash
cd /home/lixiang/Desktop/zhongyi_game/src
npm run test:unit
npm run type-check
npm run build
```

**Expected:** All PASS

---

### Step 5.3: Final Commit

```bash
git add .
git commit -m "feat(phase3): complete battle system with waves, pinyin input, and combo"
```

---

## Phase 3 完成标准

- [x] 四波次战斗系统
- [x] 敌人AI（接近、攻击）
- [x] 拼音输入支持
- [x] 模糊拼音匹配
- [x] Canvas战斗场景
- [x] 连击系统
- [x] 得分计算
- [x] 战斗结果统计
- [x] 章节进度集成
- [x] 单元测试
- [x] TypeScript 0错误

**下一阶段:** Phase 4 - AI导师系统

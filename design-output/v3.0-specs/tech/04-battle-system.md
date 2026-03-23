# 战斗系统技术实现

## 1. 系统架构

### 1.1 模块划分

```
src/systems/battle/
├── BattleEngine.ts           # 战斗核心引擎
├── WaveManager.ts            # 波次管理
├── InputHandler.ts           # 输入处理
├── ComboSystem.ts            # 连击系统
├── SkillSystem.ts            # 技能系统
├── EnemySpawner.ts           # 敌人生成
├── CollisionDetector.ts      # 碰撞检测
└── index.ts                  # 导出
```

### 1.2 核心类图

```typescript
// 战斗引擎 - 主控制器
class BattleEngine {
  private state: BattleState;
  private waveManager: WaveManager;
  private inputHandler: InputHandler;
  private comboSystem: ComboSystem;
  private skillSystem: SkillSystem;
  private enemySpawner: EnemySpawner;
  private renderer: BattleRenderer;

  // 生命周期
  start(): void;
  pause(): void;
  resume(): void;
  end(): BattleResult;

  // 帧更新
  update(deltaTime: number): void;

  // 事件处理
  onInput(input: string): void;
  onEnemyDefeated(enemy: Enemy): void;
  onPlayerDamaged(amount: number): void;
}

// 波次管理
class WaveManager {
  private currentWave: number;
  private waves: WaveConfig[];
  private spawnQueue: Enemy[];
  private state: 'waiting' | 'spawning' | 'active' | 'complete';

  startWave(waveNumber: number): void;
  update(deltaTime: number): void;
  isWaveComplete(): boolean;
  getWaveConfig(waveNumber: number): WaveConfig;
}

// 输入处理器
class InputHandler {
  private targetText: string;
  private currentInput: string;
  private pinyinMap: Map<string, string>;

  processInput(input: string): InputResult;
  validateMatch(input: string): boolean;
  getDisplayText(): string;
  getPinyinHint(): string;
}
```

## 2. 战斗状态机

### 2.1 状态流转

```
[初始化] → [准备阶段] → [波次开始] → [刷怪中] → [战斗中]
                                              ↓
[战斗结束] ← [BOSS战] ← [波次4] ← [波次3] ← [波次2]
    ↓
[结算] → [胜利/失败]
```

### 2.2 状态定义

```typescript
type BattlePhase =
  | 'preparing'      // 准备阶段，显示题目
  | 'wave_start'     // 波次开始动画
  | 'spawning'       // 刷怪中
  | 'fighting'       // 战斗中
  | 'wave_clear'     // 波次清理
  | 'boss_intro'     // BOSS登场
  | 'boss_fight'     // BOSS战
  | 'ending'         // 结束动画
  | 'settlement';    // 结算

interface BattleState {
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
  activeProjectiles: Projectile[];
}
```

## 3. 输入处理系统

### 3.1 拼音输入支持

```typescript
class InputHandler {
  // 拼音映射表
  private pinyinMap: Map<string, string> = new Map([
    ['ma huang', '麻黄'],
    ['gui zhi', '桂枝'],
    ['zi su', '紫苏'],
    // ... 更多映射
  ]);

  // 模糊拼音支持
  private fuzzyPinyinMap: Map<string, string[]> = new Map([
    ['z', ['z', 'zh']],
    ['c', ['c', 'ch']],
    ['s', ['s', 'sh']],
    ['n', ['n', 'l']],
    ['l', ['n', 'l']],
  ]);

  processInput(input: string): InputResult {
    const normalized = this.normalize(input);

    // 1. 直接匹配中文
    if (normalized === this.targetText) {
      return { type: 'exact_match', score: 1.0 };
    }

    // 2. 拼音匹配
    const targetPinyin = this.getPinyin(this.targetText);
    if (this.matchPinyin(normalized, targetPinyin)) {
      return { type: 'pinyin_match', score: 0.95 };
    }

    // 3. 模糊拼音匹配
    if (this.matchFuzzyPinyin(normalized, targetPinyin)) {
      return { type: 'fuzzy_match', score: 0.9 };
    }

    // 4. 前缀匹配（用于实时反馈）
    if (targetPinyin.startsWith(normalized)) {
      return { type: 'prefix_match', progress: normalized.length / targetPinyin.length };
    }

    return { type: 'no_match' };
  }

  // 获取带声调的拼音用于显示
  getPinyinWithTone(text: string): string {
    // 使用 pinyin-pro 库转换
    return pinyin(text, { toneType: 'symbol' });
  }
}

interface InputResult {
  type: 'exact_match' | 'pinyin_match' | 'fuzzy_match' | 'prefix_match' | 'no_match';
  score?: number;
  progress?: number;
}
```

### 3.2 智能提示系统

```typescript
class HintSystem {
  private hintLevel: number = 0;
  private maxHints: number = 3;

  // 根据输入进度提供提示
  getHint(targetText: string, currentInput: string, hintLevel: number): string {
    const targetPinyin = this.getPinyin(targetText);

    switch (hintLevel) {
      case 0:
        // 显示第一个字母
        return targetPinyin[0] + '_'.repeat(targetPinyin.length - 1);
      case 1:
        // 显示前30%
        const showCount1 = Math.ceil(targetPinyin.length * 0.3);
        return targetPinyin.slice(0, showCount1) + '_'.repeat(targetPinyin.length - showCount1);
      case 2:
        // 显示前60%
        const showCount2 = Math.ceil(targetPinyin.length * 0.6);
        return targetPinyin.slice(0, showCount2) + '_'.repeat(targetPinyin.length - showCount2);
      default:
        return targetPinyin;
    }
  }

  // 计算提示消耗
  getHintCost(hintLevel: number): number {
    return hintLevel * 5; // 5💎, 10💎, 15💎
  }
}
```

## 4. 敌人系统

### 4.1 敌人类型定义

```typescript
interface Enemy {
  id: string;
  type: 'normal' | 'elite' | 'boss';
  name: string;
  health: number;
  maxHealth: number;
  speed: number;
  position: Vector2D;
  targetText: string;      // 需要输入的文本
  reward: number;          // 击败奖励
  status: 'approaching' | 'attacking' | 'defeated';
}

interface EnemyConfig {
  type: 'normal' | 'elite' | 'boss';
  sprite: string;
  health: number;
  speed: number;
  attackRange: number;
  attackDamage: number;
  attackInterval: number;
}

// 敌人配置表
const ENEMY_CONFIGS: Record<string, EnemyConfig> = {
  xiao_xie_ling: {
    type: 'normal',
    sprite: '/sprites/enemies/xiao_xie_ling.png',
    health: 1,
    speed: 50, // px/s
    attackRange: 100,
    attackDamage: 10,
    attackInterval: 2000, // ms
  },
  da_xie_ling: {
    type: 'elite',
    sprite: '/sprites/enemies/da_xie_ling.png',
    health: 3,
    speed: 30,
    attackRange: 120,
    attackDamage: 20,
    attackInterval: 3000,
  },
  xie_ling_wang: {
    type: 'boss',
    sprite: '/sprites/enemies/xie_ling_wang.png',
    health: 10,
    speed: 15,
    attackRange: 150,
    attackDamage: 30,
    attackInterval: 4000,
  },
};
```

### 4.2 敌人AI

```typescript
class EnemyAI {
  update(enemy: Enemy, deltaTime: number, player: Player): void {
    const distance = this.getDistance(enemy.position, player.position);

    switch (enemy.status) {
      case 'approaching':
        if (distance <= enemy.attackRange) {
          enemy.status = 'attacking';
          this.startAttack(enemy, player);
        } else {
          this.moveTowards(enemy, player.position, deltaTime);
        }
        break;

      case 'attacking':
        if (distance > enemy.attackRange) {
          enemy.status = 'approaching';
        }
        break;
    }
  }

  private moveTowards(enemy: Enemy, target: Vector2D, deltaTime: number): void {
    const direction = this.normalize({
      x: target.x - enemy.position.x,
      y: target.y - enemy.position.y,
    });

    enemy.position.x += direction.x * enemy.speed * deltaTime;
    enemy.position.y += direction.y * enemy.speed * deltaTime;
  }
}
```

## 5. 波次配置

### 5.1 波次数据结构

```typescript
interface WaveConfig {
  waveNumber: number;
  name: string;
  description: string;
  enemyType: 'normal' | 'elite' | 'boss';
  enemyCount: number;
  spawnInterval: number;     // 刷怪间隔(ms)
  targetTextType: 'name' | 'properties' | 'effects' | 'formula';
  timeLimit?: number;        // 时限(秒)，可选
  specialRules?: SpecialRule[];
}

// 波次配置
const WAVE_CONFIGS: WaveConfig[] = [
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
    specialRules: ['continuous_spawn'],
  },
];
```

### 5.2 题目生成器

```typescript
class QuestionGenerator {
  constructor(
    private medicines: Medicine[],
    private formulas: Formula[],
  ) {}

  // 根据波次类型生成题目
  generate(waveNumber: number, count: number): Question[] {
    const config = WAVE_CONFIGS[waveNumber - 1];

    switch (config.targetTextType) {
      case 'name':
        return this.generateNameQuestions(count);
      case 'properties':
        return this.generatePropertyQuestions(count);
      case 'effects':
        return this.generateEffectQuestions(count);
      case 'formula':
        return this.generateFormulaQuestions(count);
      default:
        return [];
    }
  }

  private generateNameQuestions(count: number): Question[] {
    const shuffled = shuffle(this.medicines);
    return shuffled.slice(0, count).map(m => ({
      id: m.id,
      text: m.name,
      pinyin: m.pinyin,
      hint: `这味药属于${m.category}类`,
    }));
  }

  private generatePropertyQuestions(count: number): Question[] {
    const shuffled = shuffle(this.medicines);
    return shuffled.slice(0, count).map(m => ({
      id: m.id,
      text: `${m.fourQi}、${m.fiveFlavors.join('')}`,
      pinyin: `${m.fourQi} ${m.fiveFlavors.join('')}`,
      hint: `这味药归${m.meridians.join('、')}经`,
    }));
  }

  private generateFormulaQuestions(count: number): Question[] {
    const shuffled = shuffle(this.formulas);
    return shuffled.slice(0, count).map(f => ({
      id: f.id,
      text: f.name,
      pinyin: f.namePinyin,
      hint: f.song?.substring(0, 10) + '...',
    }));
  }
}
```

## 6. 连击与技能系统

### 6.1 连击系统

```typescript
class ComboSystem {
  private combo: number = 0;
  private maxCombo: number = 0;
  private lastHitTime: number = 0;
  private comboTimeout: number = 3000; // 3秒断连
  private multipliers: number[] = [1, 1.1, 1.2, 1.3, 1.5, 2];

  onHit(timestamp: number): void {
    if (timestamp - this.lastHitTime > this.comboTimeout) {
      this.combo = 0;
    }

    this.combo++;
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    this.lastHitTime = timestamp;

    // 触发连击效果
    if (this.combo % 10 === 0) {
      this.onMilestone(this.combo);
    }
  }

  getMultiplier(): number {
    const index = Math.min(Math.floor(this.combo / 10), this.multipliers.length - 1);
    return this.multipliers[index];
  }

  private onMilestone(combo: number): void {
    // 每10连击触发特效
    EventBus.emit('combo:milestone', { combo });
  }

  reset(): void {
    this.combo = 0;
  }
}
```

### 6.2 技能系统

```typescript
interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string;
  cooldown: number;
  duration: number;
  effect: SkillEffect;
}

type SkillEffect =
  | { type: 'slow_motion'; factor: number }      // 时间减缓
  | { type: 'instant_kill'; count: number }     // 秒杀N个敌人
  | { type: 'heal'; amount: number }            // 恢复生命
  | { type: 'shield'; duration: number }        // 护盾
  | { type: 'hint_reveal'; duration: number };  // 显示答案

class SkillSystem {
  private skills: Map<string, Skill> = new Map();
  private cooldowns: Map<string, number> = new Map();
  private activeEffects: Map<string, number> = new Map();

  // 技能配置
  private skillConfigs: Skill[] = [
    {
      id: 'slow_time',
      name: '凝时术',
      description: '减缓时间流逝，持续5秒',
      icon: '/icons/skills/slow_time.png',
      cooldown: 30000,
      duration: 5000,
      effect: { type: 'slow_motion', factor: 0.5 },
    },
    {
      id: 'thunder_strike',
      name: '五雷轰顶',
      description: '瞬间消灭所有小邪灵',
      icon: '/icons/skills/thunder.png',
      cooldown: 45000,
      duration: 0,
      effect: { type: 'instant_kill', count: 999 },
    },
    {
      id: 'heal',
      name: '回春术',
      description: '恢复30%生命值',
      icon: '/icons/skills/heal.png',
      cooldown: 60000,
      duration: 0,
      effect: { type: 'heal', amount: 30 },
    },
  ];

  useSkill(skillId: string, battle: BattleEngine): boolean {
    if (this.isOnCooldown(skillId)) {
      return false;
    }

    const skill = this.skills.get(skillId);
    if (!skill) return false;

    // 应用效果
    this.applyEffect(skill.effect, battle);

    // 设置冷却
    this.cooldowns.set(skillId, skill.cooldown);

    return true;
  }

  private applyEffect(effect: SkillEffect, battle: BattleEngine): void {
    switch (effect.type) {
      case 'slow_motion':
        battle.setTimeScale(effect.factor);
        break;
      case 'instant_kill':
        battle.killEnemies(effect.count);
        break;
      case 'heal':
        battle.healPlayer(effect.amount);
        break;
    }
  }

  update(deltaTime: number): void {
    // 更新冷却
    for (const [id, remaining] of this.cooldowns) {
      const newRemaining = remaining - deltaTime;
      if (newRemaining <= 0) {
        this.cooldowns.delete(id);
      } else {
        this.cooldowns.set(id, newRemaining);
      }
    }

    // 更新效果持续时间
    for (const [id, remaining] of this.activeEffects) {
      const newRemaining = remaining - deltaTime;
      if (newRemaining <= 0) {
        this.activeEffects.delete(id);
        this.removeEffect(id);
      } else {
        this.activeEffects.set(id, newRemaining);
      }
    }
  }
}
```

## 7. 渲染系统

### 7.1 渲染架构

```typescript
class BattleRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particleSystem: ParticleSystem;

  render(state: BattleState): void {
    this.clear();

    // 1. 渲染背景
    this.renderBackground(state.currentWave);

    // 2. 渲染敌人
    state.enemies.forEach(enemy => this.renderEnemy(enemy));

    // 3. 渲染投射物
    state.activeProjectiles.forEach(p => this.renderProjectile(p));

    // 4. 渲染玩家
    this.renderPlayer();

    // 5. 渲染UI
    this.renderUI(state);

    // 6. 渲染特效
    this.particleSystem.render(this.ctx);
  }

  private renderEnemy(enemy: Enemy): void {
    // 绘制敌人精灵
    const sprite = this.getSprite(enemy.type);
    this.ctx.drawImage(sprite, enemy.position.x, enemy.position.y);

    // 绘制血条
    this.renderHealthBar(enemy);

    // 绘制目标文字（在敌人上方）
    this.renderTargetText(enemy);
  }

  private renderTargetText(enemy: Enemy): void {
    const text = enemy.targetText;
    const x = enemy.position.x + 32; // 居中
    const y = enemy.position.y - 20;

    // 背景
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(x - 40, y - 20, 80, 24);

    // 文字
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '14px "Noto Sans SC"';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(text, x, y);
  }

  private renderUI(state: BattleState): void {
    // 血条
    this.renderPlayerHealth(state.playerHealth, state.maxHealth);

    // 连击数
    if (state.combo > 1) {
      this.renderCombo(state.combo);
    }

    // 波次信息
    this.renderWaveInfo(state.currentWave, state.totalWaves);
  }
}
```

### 7.2 特效系统

```typescript
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

class ParticleSystem {
  private particles: Particle[] = [];

  // 击败敌人特效
  emitDefeatEffect(x: number, y: number, color: string = '#FFD700'): void {
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20;
      const speed = 2 + Math.random() * 3;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 30,
        maxLife: 30,
        color,
        size: 3 + Math.random() * 3,
      });
    }
  }

  // 连击特效
  emitComboEffect(combo: number, x: number, y: number): void {
    const colors = ['#FFD700', '#FFA500', '#FF6347'];
    const color = colors[Math.min(Math.floor(combo / 10), colors.length - 1)];

    for (let i = 0; i < combo; i++) {
      const angle = (Math.PI * 2 * i) / combo;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * 5,
        vy: Math.sin(angle) * 5,
        life: 45,
        maxLife: 45,
        color,
        size: 4,
      });
    }
  }

  update(): void {
    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      p.vx *= 0.98; // 阻力
      p.vy *= 0.98;
      return p.life > 0;
    });
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.particles.forEach(p => {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }
}
```

## 8. 单元测试

### 8.1 测试用例

```typescript
// BattleEngine.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { BattleEngine } from './BattleEngine';

describe('BattleEngine', () => {
  let engine: BattleEngine;

  beforeEach(() => {
    engine = new BattleEngine({
      chapterId: 'chapter-1',
      medicines: mockMedicines,
      formulas: mockFormulas,
    });
  });

  it('should initialize with correct state', () => {
    const state = engine.getState();
    expect(state.phase).toBe('preparing');
    expect(state.playerHealth).toBe(100);
    expect(state.combo).toBe(0);
  });

  it('should start first wave correctly', () => {
    engine.start();
    const state = engine.getState();
    expect(state.phase).toBe('fighting');
    expect(state.currentWave).toBe(1);
  });

  it('should process correct input and defeat enemy', () => {
    engine.start();
    const enemy = engine.getEnemies()[0];

    const result = engine.onInput(enemy.targetText);

    expect(result.hit).toBe(true);
    expect(enemy.status).toBe('defeated');
    expect(engine.getState().combo).toBe(1);
  });

  it('should break combo on timeout', () => {
    engine.start();
    engine.onInput('test');
    expect(engine.getState().combo).toBe(1);

    // 模拟3秒过去
    jest.advanceTimersByTime(3500);
    engine.update(3500);

    expect(engine.getState().combo).toBe(0);
  });

  it('should end battle when player health reaches zero', () => {
    engine.start();
    engine.onPlayerDamaged(100);

    expect(engine.getState().phase).toBe('ending');
    expect(engine.getResult().victory).toBe(false);
  });
});

// InputHandler.test.ts
describe('InputHandler', () => {
  let handler: InputHandler;

  beforeEach(() => {
    handler = new InputHandler();
    handler.setTarget('麻黄');
  });

  it('should match exact Chinese input', () => {
    const result = handler.processInput('麻黄');
    expect(result.type).toBe('exact_match');
  });

  it('should match pinyin input', () => {
    const result = handler.processInput('ma huang');
    expect(result.type).toBe('pinyin_match');
  });

  it('should match fuzzy pinyin', () => {
    // z/zh 不区分
    handler.setTarget('浙贝母');
    const result = handler.processInput('ze bei mu');
    expect(result.type).toBe('fuzzy_match');
  });
});

// ComboSystem.test.ts
describe('ComboSystem', () => {
  let combo: ComboSystem;

  beforeEach(() => {
    combo = new ComboSystem();
  });

  it('should increase combo on consecutive hits', () => {
    combo.onHit(1000);
    combo.onHit(1500);
    combo.onHit(2000);

    expect(combo.getCurrent()).toBe(3);
  });

  it('should calculate correct multiplier', () => {
    // 0-9: 1x
    expect(combo.getMultiplier()).toBe(1);

    // 10-19: 1.1x
    for (let i = 0; i < 10; i++) combo.onHit(i * 100);
    expect(combo.getMultiplier()).toBe(1.1);

    // 50+: 2x
    for (let i = 10; i < 50; i++) combo.onHit(i * 100);
    expect(combo.getMultiplier()).toBe(2);
  });
});
```

## 9. 性能优化

### 9.1 对象池

```typescript
class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn: (obj: T) => void;

  constructor(createFn: () => T, resetFn: (obj: T) => void, initialSize: number = 10) {
    this.createFn = createFn;
    this.resetFn = resetFn;

    for (let i = 0; i < initialSize; i++) {
      this.pool.push(createFn());
    }
  }

  acquire(): T {
    return this.pool.pop() || this.createFn();
  }

  release(obj: T): void {
    this.resetFn(obj);
    this.pool.push(obj);
  }
}

// 使用对象池管理敌人和粒子
const enemyPool = new ObjectPool<Enemy>(
  () => ({ id: '', type: 'normal', health: 0, /* ... */ } as Enemy),
  (enemy) => { enemy.health = 0; /* 重置状态 */ },
  20
);
```

### 9.2 渲染优化

```typescript
class RenderOptimizer {
  private lastRenderTime: number = 0;
  private targetFPS: number = 60;
  private frameInterval: number = 1000 / 60;

  shouldRender(timestamp: number): boolean {
    const elapsed = timestamp - this.lastRenderTime;
    if (elapsed >= this.frameInterval) {
      this.lastRenderTime = timestamp - (elapsed % this.frameInterval);
      return true;
    }
    return false;
  }

  // 视口裁剪
  isInViewport(x: number, y: number, viewport: Rect): boolean {
    return x >= viewport.x && x <= viewport.x + viewport.width &&
           y >= viewport.y && y <= viewport.y + viewport.height;
  }
}
```

---

*文档状态: 技术细分*
*核心: 流畅战斗 + 精准输入 + 华丽特效*

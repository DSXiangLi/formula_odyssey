import { z } from 'zod';
import { BattlePhase, CollectionType } from './index';

// 战斗单位（药灵）
export const BattleUnitSchema = z.object({
  id: z.string(),
  medicineId: z.string(),
  name: z.string(),
  type: z.nativeEnum(CollectionType),
  health: z.number(),
  maxHealth: z.number(),
  attack: z.number(),
  defense: z.number(),
  speed: z.number(),
  energy: z.number().default(0),
  maxEnergy: z.number().default(100),
  skills: z.array(z.string()).default([]),
  statusEffects: z.array(z.object({
    type: z.string(),
    value: z.number(),
    duration: z.number(),
  })).default([]),
  isPlayer: z.boolean().default(false),
  isBoss: z.boolean().default(false),
});

export type BattleUnit = z.infer<typeof BattleUnitSchema>;

// 战斗行动
export const BattleActionSchema = z.object({
  id: z.string(),
  unitId: z.string(),
  targetId: z.string().optional(),
  type: z.enum(['attack', 'skill', 'item', 'defend', 'escape']),
  skillId: z.string().optional(),
  itemId: z.string().optional(),
  damage: z.number().optional(),
  healing: z.number().optional(),
  effects: z.array(z.object({
    type: z.string(),
    value: z.number(),
    duration: z.number(),
  })).default([]),
  timestamp: z.number(),
});

export type BattleAction = z.infer<typeof BattleActionSchema>;

// 战斗波次
export const BattleWaveSchema = z.object({
  waveNumber: z.number(),
  enemies: z.array(BattleUnitSchema),
  rewards: z.object({
    currency: z.number().default(0),
    experience: z.number().default(0),
    items: z.array(z.string()).default([]),
  }),
  isBossWave: z.boolean().default(false),
});

export type BattleWave = z.infer<typeof BattleWaveSchema>;

// 战斗状态
export const BattleStateSchema = z.object({
  id: z.string(),
  phase: z.nativeEnum(BattlePhase),
  playerUnits: z.array(BattleUnitSchema),
  enemyUnits: z.array(BattleUnitSchema),
  currentWave: z.number().default(1),
  totalWaves: z.number().default(1),
  turnCount: z.number().default(0),
  actions: z.array(BattleActionSchema).default([]),
  isVictory: z.boolean().optional(),
  startTime: z.number(),
  endTime: z.number().optional(),
});

export type BattleState = z.infer<typeof BattleStateSchema>;

// 战斗结果
export const BattleResultSchema = z.object({
  battleId: z.string(),
  isVictory: z.boolean(),
  wavesCleared: z.number(),
  turnCount: z.number(),
  damageDealt: z.number(),
  damageTaken: z.number(),
  rewards: z.object({
    currency: z.number(),
    experience: z.number(),
    items: z.array(z.string()),
    medicines: z.array(z.string()),
  }),
  duration: z.number(),
});

export type BattleResult = z.infer<typeof BattleResultSchema>;

// 技能定义
export const SkillSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  type: z.enum(['attack', 'heal', 'buff', 'debuff', 'special']),
  power: z.number(),
  energyCost: z.number(),
  cooldown: z.number().default(0),
  targetType: z.enum(['single', 'all', 'self', 'ally']),
  effects: z.array(z.object({
    type: z.string(),
    value: z.number(),
    duration: z.number(),
  })).default([]),
  wuxingBonus: z.record(z.string(), z.number()).optional(),
});

export type Skill = z.infer<typeof SkillSchema>;

import { z } from 'zod';
import { WuxingType, FourQi, CollectionType } from './index';

// 升降浮沉
export enum Movement {
  Ascending = 'ascending',
  Descending = 'descending',
  Floating = 'floating',
  Sinking = 'sinking',
}

// 药灵数据 v3.0
export const MedicineSchema = z.object({
  id: z.string(),
  name: z.string(),
  pinyin: z.string(),
  latinName: z.string(),
  category: z.string(),
  wuxing: z.nativeEnum(WuxingType),
  fourQi: z.nativeEnum(FourQi),
  fiveFlavors: z.array(z.string()),
  movement: z.nativeEnum(Movement),
  meridians: z.array(z.string()),
  toxicity: z.string().default('无毒'),
  functions: z.array(z.string()),
  indications: z.array(z.string()),
  contraindications: z.array(z.string()).default([]),
  imagePlant: z.string(),
  imageHerb: z.string(),
  collectionType: z.nativeEnum(CollectionType),
  stories: z.array(z.string()).default([]),
  affinity: z.number().default(0),
  isCollected: z.boolean().default(false),
});

export type Medicine = z.infer<typeof MedicineSchema>;

// 药灵战斗属性（v3.0战斗系统）
export const MedicineBattleStatsSchema = z.object({
  medicineId: z.string(),
  attack: z.number().min(0).max(100).default(50),
  defense: z.number().min(0).max(100).default(50),
  speed: z.number().min(0).max(100).default(50),
  special: z.number().min(0).max(100).default(50),
});

export type MedicineBattleStats = z.infer<typeof MedicineBattleStatsSchema>;

// 采集目标（战斗中的敌人）
export const CollectionTargetSchema = z.object({
  id: z.string(),
  name: z.string(),
  medicineId: z.string(),
  type: z.nativeEnum(CollectionType),
  health: z.number(),
  maxHealth: z.number(),
  attack: z.number(),
  defense: z.number(),
  speed: z.number(),
  isElite: z.boolean().default(false),
  isBoss: z.boolean().default(false),
});

export type CollectionTarget = z.infer<typeof CollectionTargetSchema>;

// 种子数据 v3.0（简化版，用于探索场景）
export const SeedSchema = z.object({
  id: z.string(),
  medicineId: z.string(),
  chapterId: z.string(),
  wuxing: z.nativeEnum(WuxingType),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  isVisible: z.boolean().default(false),
  isCollected: z.boolean().default(false),
  discoveredAt: z.number().optional(),
});

export type Seed = z.infer<typeof SeedSchema>;

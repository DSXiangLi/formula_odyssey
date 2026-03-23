import { z } from 'zod';
import { WuxingType } from './index';

// 玩家技能
export const PlayerSkillSchema = z.object({
  id: z.string(),
  name: z.string(),
  level: z.number().min(1).max(10),
  maxLevel: z.number().default(10),
  description: z.string(),
  effect: z.object({
    type: z.string(),
    value: z.number(),
  }),
});

export type PlayerSkill = z.infer<typeof PlayerSkillSchema>;

// 玩家数据 v3.0
export const PlayerSchema = z.object({
  id: z.string(),
  name: z.string().default('学徒'),
  level: z.number().default(1),
  experience: z.number().default(0),
  currency: z.number().default(100),
  reputation: z.number().default(0),
  wuxingAffinity: z.record(z.nativeEnum(WuxingType), z.number()).default({
    [WuxingType.Wood]: 0,
    [WuxingType.Fire]: 0,
    [WuxingType.Earth]: 0,
    [WuxingType.Metal]: 0,
    [WuxingType.Water]: 0,
  }),
  unlockedChapters: z.array(z.string()).default(['chapter-1']),
  completedChapters: z.array(z.string()).default([]),
  collectedMedicines: z.array(z.string()).default([]),
  masteredFormulas: z.array(z.string()).default([]),
  skills: z.array(PlayerSkillSchema).default([]),
  createdAt: z.number(),
  lastPlayed: z.number(),
});

export type Player = z.infer<typeof PlayerSchema>;

// 玩家统计
export const PlayerStatsSchema = z.object({
  totalPlayTime: z.number().default(0),
  battlesWon: z.number().default(0),
  battlesLost: z.number().default(0),
  medicinesCollected: z.number().default(0),
  formulasMastered: z.number().default(0),
  chaptersCompleted: z.number().default(0),
  aiInteractions: z.number().default(0),
});

export type PlayerStats = z.infer<typeof PlayerStatsSchema>;

// 玩家设置
export const PlayerSettingsSchema = z.object({
  soundEnabled: z.boolean().default(true),
  musicEnabled: z.boolean().default(true),
  vibrationEnabled: z.boolean().default(true),
  aiMentorEnabled: z.boolean().default(true),
  language: z.string().default('zh-CN'),
  theme: z.enum(['light', 'dark', 'auto']).default('auto'),
});

export type PlayerSettings = z.infer<typeof PlayerSettingsSchema>;

// 经验值计算辅助函数
export function calculateLevel(experience: number): number {
  // 每级需要经验 = 等级 * 100
  let level = 1;
  let expNeeded = 100;
  let remainingExp = experience;

  while (remainingExp >= expNeeded) {
    remainingExp -= expNeeded;
    level++;
    expNeeded = level * 100;
  }

  return level;
}

export function experienceForLevel(level: number): number {
  // 计算达到某级需要的总经验
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += i * 100;
  }
  return total;
}

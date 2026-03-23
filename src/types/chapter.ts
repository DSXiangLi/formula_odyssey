import { z } from 'zod';
import { WuxingType, StageType } from './index';

// 章节阶段定义
export const ChapterStageSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(StageType),
  title: z.string(),
  description: z.string(),
  requiredMedicines: z.array(z.string()).default([]),
  unlockRequirements: z.array(z.string()).default([]),
});

export type ChapterStage = z.infer<typeof ChapterStageSchema>;

// 章节定义
export const ChapterSchema = z.object({
  id: z.string(),
  chapterNumber: z.number().int().min(1).max(20),
  title: z.string(),
  subtitle: z.string(),
  wuxing: z.nativeEnum(WuxingType),
  description: z.string(),
  unlockRequirements: z.array(z.string()).default([]),
  stages: z.array(ChapterStageSchema),
  medicines: z.array(z.string()),
  formulas: z.array(z.string()),
  isUnlocked: z.boolean().default(false),
  isCompleted: z.boolean().default(false),
  masteryScore: z.number().min(0).max(100).default(0),
});

export type Chapter = z.infer<typeof ChapterSchema>;

// 章节进度
export const ChapterProgressSchema = z.object({
  chapterId: z.string(),
  currentStage: z.number().default(0),
  completedStages: z.array(z.string()).default([]),
  collectedMedicines: z.array(z.string()).default([]),
  battleScore: z.number().default(0),
  clinicalScore: z.number().default(0),
  lastAccessed: z.number().optional(),
});

export type ChapterProgress = z.infer<typeof ChapterProgressSchema>;

// 章节配置辅助类型
export interface ChapterConfig {
  totalChapters: number;
  medicinesPerChapter: number;
  formulasPerChapter: number;
  minStages: number;
  maxStages: number;
}

// 默认章节配置
export const DEFAULT_CHAPTER_CONFIG: ChapterConfig = {
  totalChapters: 20,
  medicinesPerChapter: 3,
  formulasPerChapter: 1,
  minStages: 4,
  maxStages: 6,
};

import { z } from 'zod';

// 方剂难度
export enum FormulaDifficulty {
  Easy = 'easy',
  Normal = 'normal',
  Hard = 'hard',
  Challenge = 'challenge',
}

// 君臣佐使
export enum FormulaRole {
  Jun = 'jun',   // 君药
  Chen = 'chen', // 臣药
  Zuo = 'zuo',   // 佐药
  Shi = 'shi',   // 使药
}

// 方剂组成项
export const FormulaCompositionSchema = z.object({
  medicineId: z.string(),
  name: z.string(),
  amount: z.string(),
  role: z.nativeEnum(FormulaRole),
  note: z.string().optional(),
});

export type FormulaComposition = z.infer<typeof FormulaCompositionSchema>;

// 方剂数据 v3.0
export const FormulaSchema = z.object({
  id: z.string(),
  name: z.string(),
  pinyin: z.string(),
  category: z.string(),
  difficulty: z.nativeEnum(FormulaDifficulty),
  composition: z.array(FormulaCompositionSchema),
  functions: z.array(z.string()),
  indications: z.array(z.string()),
  song: z.string().optional(),
  variations: z.array(z.string()).default([]),
  contraindications: z.array(z.string()).default([]),
  chapterId: z.string(),
  proficiency: z.number().min(0).max(5).default(0),
  isMastered: z.boolean().default(false),
});

export type Formula = z.infer<typeof FormulaSchema>;

// 方剂学习进度
export const FormulaProgressSchema = z.object({
  formulaId: z.string(),
  proficiency: z.number().min(0).max(5).default(0),
  studyCount: z.number().default(0),
  correctCount: z.number().default(0),
  lastStudiedAt: z.number().optional(),
  masteredAt: z.number().optional(),
});

export type FormulaProgress = z.infer<typeof FormulaProgressSchema>;

// 临方挑战
export const FormulaChallengeSchema = z.object({
  id: z.string(),
  formulaId: z.string(),
  chapterId: z.string(),
  requirements: z.array(z.string()),
  timeLimit: z.number().optional(),
  rewards: z.object({
    currency: z.number().default(0),
    experience: z.number().default(0),
    reputation: z.number().default(0),
  }),
  isCompleted: z.boolean().default(false),
  completedAt: z.number().optional(),
});

export type FormulaChallenge = z.infer<typeof FormulaChallengeSchema>;

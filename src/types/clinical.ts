import { z } from 'zod';

// 临床病案 v3.0
export const ClinicalCaseSchema = z.object({
  id: z.string(),
  chapterId: z.string(),
  formulaId: z.string(),
  patientInfo: z.object({
    name: z.string(),
    age: z.number(),
    gender: z.enum(['male', 'female']),
    occupation: z.string().optional(),
  }),
  symptoms: z.array(z.string()),
  tongue: z.object({
    color: z.string(),
    coating: z.string(),
    shape: z.string().optional(),
  }),
  pulse: z.object({
    type: z.string(),
    description: z.string(),
  }),
  correctTreatment: z.string(),
  correctFormula: z.string(),
  correctJun: z.string(),
  explanation: z.string(),
  difficulty: z.enum(['easy', 'normal', 'hard']).default('normal'),
});

export type ClinicalCase = z.infer<typeof ClinicalCaseSchema>;

// 病案诊断结果
export const ClinicalDiagnosisSchema = z.object({
  treatment: z.string(),
  formula: z.string(),
  junMedicine: z.string(),
});

export type ClinicalDiagnosis = z.infer<typeof ClinicalDiagnosisSchema>;

// 病案结果
export const ClinicalResultSchema = z.object({
  caseId: z.string(),
  diagnosis: ClinicalDiagnosisSchema,
  treatmentCorrect: z.boolean(),
  formulaCorrect: z.boolean(),
  junCorrect: z.boolean(),
  score: z.number().min(0).max(3),
  reward: z.number(),
  proficiencyGain: z.number(),
  aiFeedback: z.string().optional(),
  completedAt: z.number(),
});

export type ClinicalResult = z.infer<typeof ClinicalResultSchema>;

// 临床实习进度
export const ClinicalProgressSchema = z.object({
  chapterId: z.string(),
  completedCases: z.array(z.string()).default([]),
  totalScore: z.number().default(0),
  averageScore: z.number().default(0),
  isCompleted: z.boolean().default(false),
});

export type ClinicalProgress = z.infer<typeof ClinicalProgressSchema>;

// 辨证要点
export const PatternDifferentiationSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  keySymptoms: z.array(z.string()),
  tongue: z.string(),
  pulse: z.string(),
  relatedFormulas: z.array(z.string()),
});

export type PatternDifferentiation = z.infer<typeof PatternDifferentiationSchema>;

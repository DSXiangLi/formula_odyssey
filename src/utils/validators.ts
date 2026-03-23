import { z } from 'zod';
import { ChapterSchema, ChapterProgressSchema } from '../types/chapter';
import { MedicineSchema } from '../types/medicine';
import { PlayerSchema } from '../types/player';
import { FormulaSchema } from '../types/formula';
import { BattleStateSchema, BattleResultSchema } from '../types/battle';
import { ClinicalCaseSchema, ClinicalResultSchema } from '../types/clinical';

// Chapter validators
export const validateChapter = (data: unknown) => ChapterSchema.safeParse(data);
export const validateChapters = (data: unknown[]) => 
  data.map(item => ChapterSchema.safeParse(item));

// Chapter progress validators
export const validateChapterProgress = (data: unknown) => ChapterProgressSchema.safeParse(data);

// Medicine validators
export const validateMedicine = (data: unknown) => MedicineSchema.safeParse(data);
export const validateMedicines = (data: unknown[]) => 
  data.map(item => MedicineSchema.safeParse(item));

// Player validators
export const validatePlayer = (data: unknown) => PlayerSchema.safeParse(data);

// Formula validators
export const validateFormula = (data: unknown) => FormulaSchema.safeParse(data);
export const validateFormulas = (data: unknown[]) => 
  data.map(item => FormulaSchema.safeParse(item));

// Battle validators
export const validateBattleState = (data: unknown) => BattleStateSchema.safeParse(data);
export const validateBattleResult = (data: unknown) => BattleResultSchema.safeParse(data);

// Clinical validators
export const validateClinicalCase = (data: unknown) => ClinicalCaseSchema.safeParse(data);
export const validateClinicalResult = (data: unknown) => ClinicalResultSchema.safeParse(data);

// 通用验证结果类型
export type ValidationResult<T> = 
  | { success: true; data: T }
  | { success: false; error: z.ZodError };

// 批量验证帮助函数
export function validateBatch<T>(
  items: unknown[],
  validator: (item: unknown) => { success: boolean; data?: T; error?: z.ZodError }
): { valid: T[]; invalid: { item: unknown; error: z.ZodError }[] } {
  const valid: T[] = [];
  const invalid: { item: unknown; error: z.ZodError }[] = [];

  for (const item of items) {
    const result = validator(item);
    if (result.success && result.data) {
      valid.push(result.data);
    } else if (result.error) {
      invalid.push({ item, error: result.error });
    }
  }

  return { valid, invalid };
}

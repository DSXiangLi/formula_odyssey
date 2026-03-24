// v3.0 Enum-based Core Types for 药灵山谷
// AI-Native Chapter-based Learning System

// 从enums.ts导入所有枚举（避免循环依赖）
export {
  WuxingType,
  FourQi,
  FiveFlavors,
  CollectionType,
  Movement,
  DayPhase,
  WeatherType,
  BattlePhase,
  StageType,
  stringToWuxing,
  wuxingToString,
} from './enums';

// 诊断类型（用于探索种子）
export type DiagnosisType = 'wang' | 'wen' | 'ask' | 'qie' | 'cha';

// 向后兼容：字符串字面量类型（用于v2.0迁移）
export type { WuxingTypeString } from './enums';

// v2.0 向后兼容类型导出
export type { Medicine, MedicineV2, Seed } from './medicine';
export type { Chapter, ChapterProgress } from './chapter';
export type { Player } from './player';
export type { AICacheEntry, AIMentorMessage, AIMentorSession } from './ai';
export type { ClinicalCase } from './clinical';
export type { Formula, FormulaProgress, FormulaChallenge } from './formula';
export type { RegionType, DailyStats, FormulaPursuit, GameState, Region } from './game';
export type { BattleUnit, BattleAction, BattleWave, BattleState, BattleResult, Skill } from './battle';


import { z } from 'zod';
import { WuxingType } from './index';
import { Medicine } from './medicine';
import { Seed } from './medicine';
import { Formula } from './formula';
import { ClinicalCase } from './clinical';
import { Player } from './player';

// 区域类型（向后兼容）
export type RegionType = 'mountain' | 'forest' | 'flower' | 'stream' | 'cliff' | WuxingType;

// 每日统计
export interface DailyStats {
  date: string;
  seedsCollected: number;
  medicinesCollected: string[];
  currencyEarned: number;
  currencySpent: number;
  casesCompleted: number;
  correctGuesses: number; // 正确猜测次数
  pursuitsCompleted: number; // 完成的追缉令数
}

// 方剂追缉令
export interface FormulaPursuit {
  id: string;
  formulaId: string;
  targetMedicine?: string;
  progress?: number;
  total?: number;
  reward?: number;
  rewards: {
    currency: number;
    experience?: number;
    reputation?: number;
    items?: string[];
    badge?: string;
    affinityBonus?: number;
  };
  difficulty: 'easy' | 'normal' | 'hard' | 'challenge';
  requirements?: string[];
  accepted?: boolean;
  completed: boolean;
  expiresAt: string; // ISO 8601 日期字符串
  timeLimit?: number; // 小时
  collectedMedicines?: string[];
}

// 游戏状态
export interface GameState {
  player: Player;
  medicines: Medicine[];
  seeds: Seed[];
  formulas: Formula[];
  clinicalCases: ClinicalCase[];
  currentRegion: RegionType;
  isExploreOpen: boolean;
  isCollectionOpen: boolean;
  isMedicineDetailOpen: boolean;
  isFormulaPursuitOpen: boolean;
  isClinicalCaseOpen: boolean;
  selectedMedicine: string | null;
  selectedSeed: string | null;
  currentCase: string | null;
  unlockedFormulas: string[];
  formulaProficiency: Record<string, number>;
  activePursuits: FormulaPursuit[];
  collectedMedicines: string[];
  pursuitRefreshTimer: number | null;
  dailyStats: DailyStats;
}

// 区域定义
export interface Region {
  id: string;
  name: string;
  themeColor: string;
  themeColorLight: string;
  medicines: string[];
  particleType: string;
  zangfu: string;
  season: string;
  direction: string;
  specialMechanism: string;
}

// 导出向后兼容的类型
export type { Medicine, Seed, Formula, ClinicalCase, Player };

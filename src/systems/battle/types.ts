import { Medicine, Formula } from '../../types';

export type BattlePhase =
  | 'preparing'      // 准备阶段，显示题目
  | 'wave_start'     // 波次开始动画
  | 'spawning'       // 刷怪中
  | 'fighting'       // 战斗中
  | 'wave_clear'     // 波次清理
  | 'boss_intro'     // BOSS登场
  | 'boss_fight'     // BOSS战
  | 'ending'         // 结束动画
  | 'settlement';    // 结算

export type QuestionType = 'input' | 'judgment' | 'choice';
export type TargetTextType = 'name' | 'properties' | 'effects' | 'formula';

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  correctAnswer: string;
  options?: string[];
  hint: string;
  knowledgeType: TargetTextType;
}

export interface Enemy {
  id: string;
  type: 'normal' | 'elite' | 'boss';
  name: string;
  health: number;
  maxHealth: number;
  speed: number;
  position: { x: number; y: number };
  targetText: string;      // 需要输入的文本（中文）
  targetPinyin: string;    // 拼音
  question: Question;
  status: 'approaching' | 'attacking' | 'defeated';
  reward: number;
  attackRange: number;
  attackDamage: number;
  attackInterval: number;  // ms
  lastAttackTime: number;
  spawnTime: number;       // 敌人生成时间戳，用于安全期判断
}

export interface KnowledgeCard {
  medicine?: Medicine;
  formula?: Formula;
  displayTime: number;
  highlights: string[];
}

export interface WaveConfig {
  waveNumber: number;
  name: string;
  description: string;
  enemyType: 'normal' | 'elite' | 'boss';
  enemyCount: number;
  spawnInterval: number;     // 刷怪间隔(ms)
  targetTextType: TargetTextType;
  timeLimit?: number;        // 时限(秒)，可选
  specialRules?: string[];
}

// ============================================
// 旧版战斗系统类型 (v2.0 - 打字战斗)
// ============================================

export interface LegacySkill {
  id: string;
  name: string;
  description: string;
  icon: string;
  cooldown: number;
  duration: number;
  currentCooldown: number;
  effect: LegacySkillEffect;
}

export type LegacySkillEffect =
  | { type: 'slow_motion'; factor: number }      // 时间减缓
  | { type: 'instant_kill'; count: number }     // 秒杀N个敌人
  | { type: 'heal'; amount: number }            // 恢复生命
  | { type: 'shield'; duration: number }        // 护盾
  | { type: 'hint_reveal'; duration: number };  // 显示答案

export interface LegacyBattleState {
  phase: BattlePhase;
  currentWave: number;
  totalWaves: number;
  playerHealth: number;
  maxHealth: number;
  score: number;
  combo: number;
  maxCombo: number;
  timeElapsed: number;
  enemies: Enemy[];
  currentKnowledge?: KnowledgeCard;
  skills: LegacySkill[];
  waveStartTime: number;
  timeScale: number;         // 时间缩放因子（用于技能效果）
  shieldTimeRemaining: number; // 护盾剩余时间
}

export { LegacySkill as Skill, LegacySkillEffect as SkillEffect };

export interface LegacyBattleResult {
  victory: boolean;
  score: number;
  maxCombo: number;
  wavesCleared: number;
  timeElapsed: number;
  correctAnswers: number;
  totalQuestions: number;
}

// Minimal medicine interface for battle
export interface BattleMedicine {
  id: string;
  name: string;
  pinyin: string;
  fourQi: string;
  fiveFlavors: string[];
  functions: string[];
}

// Minimal formula interface for battle
export interface BattleFormula {
  id: string;
  name: string;
  pinyin?: string;
}

export interface BattleEngineConfig {
  chapterId: string;
  medicines: BattleMedicine[];
  formulas: BattleFormula[];
  onStateChange?: (state: LegacyBattleState) => void;
  onBattleEnd?: (result: LegacyBattleResult) => void;
}

// 输入结果类型
export interface InputResult {
  type: 'exact_match' | 'pinyin_match' | 'fuzzy_match' | 'prefix_match' | 'no_match';
  score?: number;
  progress?: number;
  enemyId?: string;  // 匹配的敌人ID
}

// 敌人配置
export interface EnemyConfig {
  type: 'normal' | 'elite' | 'boss';
  sprite: string;
  health: number;
  speed: number;
  attackRange: number;
  attackDamage: number;
  attackInterval: number;
}

// 波次完成结果
export interface WaveResult {
  waveNumber: number;
  completed: boolean;
  score: number;
  enemiesDefeated: number;
}

// 默认波次配置
export const DEFAULT_WAVE_CONFIGS: WaveConfig[] = [
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

// 敌人配置表
export const ENEMY_CONFIGS: Record<string, {
  type: 'normal' | 'elite' | 'boss';
  health: number;
  speed: number;
  attackRange: number;
  attackDamage: number;
  attackInterval: number;
  reward: number;
}> = {
  normal: {
    type: 'normal',
    health: 1,
    speed: 50,
    attackRange: 100,
    attackDamage: 10,
    attackInterval: 2000,
    reward: 10,
  },
  elite: {
    type: 'elite',
    health: 3,
    speed: 30,
    attackRange: 120,
    attackDamage: 20,
    attackInterval: 3000,
    reward: 30,
  },
  boss: {
    type: 'boss',
    health: 10,
    speed: 15,
    attackRange: 150,
    attackDamage: 30,
    attackInterval: 4000,
    reward: 100,
  },
};

// 连击倍率配置
export const COMBO_MULTIPLIERS = [1, 1.1, 1.2, 1.3, 1.5, 2];

// 连击超时时间（毫秒）
export const COMBO_TIMEOUT = 3000;

// ============================================
// 药灵驯服游戏机制 - 新类型定义 (v3.0)
// ============================================

// 药灵实体
export interface MedicineSpirit {
  id: string;
  medicineId: string;
  name: string;
  displayName: string;
  imageUrl: string;
  difficulty: 'normal' | 'elite' | 'boss';
  personality: 'gentle' | 'lively' | 'dignified';
  position: { x: number; y: number };
  tameProgress: number;  // 0-100
  state: 'floating' | 'asking' | 'tamed' | 'escaped';
  isActive: boolean;
  floatPhase: number;  // 漂浮相位
  question: SpiritQuestion;
}

// 药灵问题
export interface SpiritQuestion {
  id: string;
  type: 'recall' | 'judge' | 'choice' | 'free';
  question: string;
  options?: string[];
  acceptableAnswers: string[];
  hint: string;
  knowledgeType: 'name' | 'properties' | 'effects' | 'formula';
}

// AI答案评判结果
export interface AnswerEvaluation {
  score: 1 | 2 | 3 | 4 | 5;
  isCorrect: boolean;
  feedback: string;
  bonusInfo?: string;
}

// 驯服结果
export interface TameResult {
  spiritId: string;
  evaluation: AnswerEvaluation;
  newProgress: number;
  isTamed: boolean;
}

// 技能
export interface SpiritSkill {
  id: 'hint_flash' | 'encyclopedia' | 'mentor_hint';
  name: string;
  description: string;
  icon: string;
  cooldown: number;
  currentCooldown: number;
  effect: SpiritSkillEffect;
}

export type SpiritSkillEffect =
  | { type: 'show_hint'; hintType: 'first_char' | 'length' }
  | { type: 'show_description' }
  | { type: 'mentor_answer'; scorePenalty: number };

// 药灵战斗状态
export interface BattleState {
  status: 'waiting' | 'playing' | 'paused' | 'victory' | 'defeat';
  wave: number;
  totalWaves: number;
  spirits: MedicineSpirit[];
  activeSpiritId: string | null;
  score: number;
  combo: number;
  maxCombo: number;
  timeElapsed: number;
  tamedCount: number;
  totalSpirits: number;
  skills: SpiritSkill[];
  inputText: string;
  lastEvaluation: AnswerEvaluation | null;
}

// 药灵战斗结果
export interface BattleResult {
  victory: boolean;
  score: number;
  maxCombo: number;
  wavesCleared: number;
  timeElapsed: number;
  tamedSpirits: string[];
  accuracy: number;
}

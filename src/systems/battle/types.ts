import { Medicine, Formula } from '../../types';

export type BattlePhase =
  | 'learning'      // 学习知识卡片
  | 'wave_start'    // 波次开始
  | 'spawning'      // 刷怪中
  | 'fighting'      // 战斗中
  | 'wave_clear'    // 波次清理
  | 'boss_intro'    // BOSS登场
  | 'boss_fight'    // BOSS战
  | 'ending'        // 结束动画
  | 'settlement';   // 结算

export type QuestionType = 'input' | 'judgment' | 'choice';

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  correctAnswer: string;
  options?: string[];
  hint: string;
  knowledgeType: 'name' | 'properties' | 'effects' | 'formula';
}

export interface Enemy {
  id: string;
  type: 'normal' | 'elite' | 'boss';
  name: string;
  health: number;
  maxHealth: number;
  speed: number;
  position: { x: number; y: number };
  question: Question;
  status: 'approaching' | 'attacking' | 'defeated';
  reward: number;
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
  enemyCount: number;
  spawnInterval: number;
  questionTypes: QuestionType[];
  timeLimit?: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string;
  cooldown: number;
  chargeRequired: number;
  currentCharge: number;
  effect: SkillEffect;
}

export type SkillEffect =
  | { type: 'freeze'; duration: number }
  | { type: 'clear'; count: number }
  | { type: 'heal'; amount: number }
  | { type: 'shield'; duration: number };

export interface BattleState {
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
  skills: Skill[];
  waveStartTime: number;
}

export interface BattleResult {
  victory: boolean;
  score: number;
  maxCombo: number;
  wavesCleared: number;
  timeElapsed: number;
  correctAnswers: number;
  totalQuestions: number;
}

export interface BattleEngineConfig {
  chapterId: string;
  medicines: Medicine[];
  formulas: Formula[];
  onStateChange?: (state: BattleState) => void;
  onBattleEnd?: (result: BattleResult) => void;
}

// v3.0 药灵山谷 - 渐进式Roguelike版类型定义
// 从v2.0升级，保留v2.0基础数据

import type {
  Medicine,
  RegionType,
  Formula,
  ClinicalCase,
} from '../types/index';
import { WuxingType } from '../types/enums';

// ==================== v3.0 章节系统 ====================

export interface Chapter {
  id: string;
  sequence: number; // 1-20
  name: string;
  category: string; // 解表剂、清热剂等
  description: string;
  medicines: string[]; // 本章要收集的药物ID
  formulas: string[]; // 本章解锁的方剂ID
  bossCase: ClinicalCase;
  rewardSkill: string; // 通关奖励技能ID
  unlockCondition: {
    completedChapters?: string[]; // 必须完成的先修章节
    minMedicines?: number; // 最少收集药物数
  };
  wuxing: WuxingType; // 本章主五行
}

export interface ChapterProgress {
  chapterId: string;
  collectedMedicines: string[];
  unlockedFormulas: string[];
  bossDefeated: boolean;
  bestScore: number; // 最高分（用于重玩）
  completedAt?: number; // 完成时间戳
}

export interface ChapterRun {
  chapterId: string;
  startTime: number;
  collectedInRun: string[]; // 本次已收集的药物ID
  currentQuestion: Question | null;
  conversationHistory: ConversationTurn[]; // 与AI的对话历史
  hintsUsed: number; // 已使用提示次数
  totalAttempts: number; // 答题尝试次数
  targetMedicine: string | null; // 当前目标药物
}

// ==================== v3.0 AI题目系统 ====================

export interface Question {
  id: string;
  question: string; // AI生成的问题（自然对话形式）
  type: 'single' | 'compare' | 'formula' | 'cross_chapter';
  difficulty: 1 | 2 | 3 | 4 | 5;
  hintAvailable: boolean;
  expectedKeywords: string[]; // 正确答案关键词
  reference?: string; // 引用的经典出处
  sceneDescription?: string; // 场景描述（用于UI展示）
}

export interface ConversationTurn {
  role: 'user' | 'elder' | 'socrates';
  content: string;
  timestamp: number;
  metadata?: {
    questionType?: string;
    isCorrect?: boolean;
    hintUsed?: boolean;
    targetMedicine?: string;
  };
}

export interface SocraticResponse {
  responseType: 'guide' | 'answer';
  content: string;
  nextQuestion?: string; // 如果继续引导，下一个问题
  giveUp: boolean; // 是否建议放弃引导直接给答案
}

// ==================== v3.0 技能系统 ====================

export type SkillCategory = 'explore' | 'diagnosis' | 'memory' | 'wuxing' | 'chapter';

export type SkillEffectType =
  | 'free_clue'
  | 'discount'
  | 'chapter_bonus'
  | 'extra_reward'
  | 'unlock_content'
  | 'extra_life'
  | 'hint_bonus';

export interface SkillEffect {
  type: SkillEffectType;
  target?: string;
  value: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  icon: string; // emoji或图片路径
  maxLevel: number;
  effects: SkillEffect[];
  unlockCondition: {
    chapter?: number;
    medicines?: string[];
    formulas?: string[];
    cases?: number;
    skillPoints?: number;
    minChaptersCompleted?: number;
  };
}

// ==================== v3.0 开放世界系统 ====================

export type EventType = 'case' | 'book' | 'spirit' | 'bounty' | 'plague';

export interface GeneratedEvent {
  id: string;
  eventType: EventType;
  title: string;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  requirements: {
    medicines?: string[];
    formulas?: string[];
    chapters?: string[];
  };
  rewards: {
    diamonds?: number;
    skillPoints?: number;
    newSkill?: string;
    title?: string;
    affinityBonus?: number;
  };
  timeLimit?: number; // 限时（分钟）
  expiresAt: number; // 过期时间戳
}

export interface RunRecord {
  id: string;
  chapterId: string;
  score: number;
  duration: number; // 通关耗时（秒）
  hintsUsed: number;
  completedAt: number;
}

export interface OpenWorldState {
  unlockedRegions: string[]; // 已解锁的区域
  dailyEvents: GeneratedEvent[]; // 今日随机事件
  completedEvents: string[]; // 已完成事件ID列表
  runHistory: RunRecord[]; // 章节挑战记录
  lastLoginDate: string; // 最后登录日期
  loginStreak: number; // 连续登录天数
}

// ==================== v3.0 游戏状态 ====================

export interface GameSession {
  // === v2.0 保留数据 ===
  // 基础资源
  diamonds: number;
  reputation: number;

  // 收集进度
  collectedMedicines: string[];
  collectedFormulas: string[];
  medicineAffinity: Record<string, number>; // 药物亲密度
  formulaProficiency: Record<string, number>; // 方剂熟练度

  // === v3.0 新增数据 ===
  // 章节进度
  currentChapter: string | null;
  completedChapters: string[];
  chapterProgress: Record<string, ChapterProgress>;

  // 技能系统
  unlockedSkills: string[];
  skillLevels: Record<string, number>; // 技能等级
  skillPoints: number;

  // 当前章节运行
  currentRun: ChapterRun | null;

  // 开放世界
  openWorld: OpenWorldState;

  // UI状态
  uiState: {
    isChapterSelectOpen: boolean;
    isSkillTreeOpen: boolean;
    isOpenWorldOpen: boolean;
    isAIDialogOpen: boolean;
    selectedMedicine: string | null;
    selectedFormula: string | null;
    selectedSkill: string | null;
  };
}

// ==================== Store Actions ====================

export interface GameActions {
  // 章节系统 Actions
  startChapter: (chapterId: string) => void;
  completeChapter: (chapterId: string, score: number) => void;
  updateChapterProgress: (chapterId: string, progress: Partial<ChapterProgress>) => void;
  abandonChapter: (chapterId: string) => void;
  resetChapter: (chapterId: string) => void;

  // 章节运行 Actions
  collectMedicineInRun: (medicineId: string) => void;
  setCurrentQuestion: (question: Question | null) => void;
  addConversationTurn: (turn: ConversationTurn) => void;
  useHint: () => void;
  clearConversation: () => void;

  // 技能系统 Actions
  unlockSkill: (skillId: string) => void;
  upgradeSkill: (skillId: string) => void;
  addSkillPoints: (amount: number) => void;

  // 资源 Actions
  addDiamonds: (amount: number) => void;
  addReputation: (amount: number) => void;
  addMedicineAffinity: (medicineId: string, amount: number) => void;
  addFormulaProficiency: (formulaId: string, amount: number) => void;

  // 收集 Actions
  collectMedicine: (medicineId: string) => void;
  collectFormula: (formulaId: string) => void;

  // 开放世界 Actions
  unlockRegion: (regionId: string) => void;
  generateDailyEvents: () => void;
  completeEvent: (eventId: string) => void;
  addRunRecord: (record: RunRecord) => void;
  checkDailyReset: () => { isNewDay: boolean; rewards?: { diamonds: number; skillPoints: number } };

  // UI Actions
  setChapterSelectOpen: (open: boolean) => void;
  setSkillTreeOpen: (open: boolean) => void;
  setOpenWorldOpen: (open: boolean) => void;
  setAIDialogOpen: (open: boolean) => void;
  setSelectedMedicine: (medicineId: string | null) => void;
  setSelectedFormula: (formulaId: string | null) => void;
  setSelectedSkill: (skillId: string | null) => void;

  // Getters (计算属性)
  getChapterById: (chapterId: string) => Chapter | undefined;
  getSkillById: (skillId: string) => Skill | undefined;
  getCurrentChapterProgress: () => ChapterProgress | null;
  getSkillEffect: (skillId: string) => SkillEffect[];
  getChapterUnlockStatus: (chapterId: string) => { unlocked: boolean; reason?: string };
  getDailyEvents: () => GeneratedEvent[];
  getCompletedChaptersCount: () => number;
  getTotalScore: () => number;
}

// ==================== Store Type ====================

export type GameStore = GameSession & GameActions;

// ==================== AI Service 类型 ====================

export interface QuestionContext {
  chapter: number;
  chapterName: string;
  collectedMedicines: string[];
  targetMedicine: string;
  collectedInChapter: number;
  totalInChapter: number;
  questionType?: 'single' | 'compare' | 'formula' | 'cross_chapter';
}

export interface GuideContext {
  question: Question;
  playerAnswer: string;
  correctPoints: string[];
  history: ConversationTurn[];
  forceAnswer?: boolean;
}

export interface EventContext {
  unlockedRegions: string[];
  collectedMedicines: string[];
  unlockedFormulas: string[];
  playerSkills: string[];
  date: string;
}

// ==================== 预定义技能数据 ====================

export const DEFAULT_SKILLS: Skill[] = [
  // 探索类技能
  {
    id: 'keen_eye',
    name: '望气之眼',
    description: '开局自动获得药图线索',
    category: 'explore',
    icon: '👁️',
    maxLevel: 1,
    effects: [{ type: 'free_clue', target: 'wang', value: 1 }],
    unlockCondition: { chapter: 1 },
  },
  {
    id: 'scent_recognition',
    name: '闻香识药',
    description: '四气线索价格-50%',
    category: 'explore',
    icon: '👃',
    maxLevel: 1,
    effects: [{ type: 'discount', target: 'wen', value: 0.5 }],
    unlockCondition: { medicines: [], minChaptersCompleted: 0 }, // 收集10味药
  },
  {
    id: 'meridian_insight',
    name: '经络洞察',
    description: '归经线索价格-30%',
    category: 'explore',
    icon: '🔮',
    maxLevel: 1,
    effects: [{ type: 'discount', target: 'qie', value: 0.7 }],
    unlockCondition: { chapter: 5 },
  },
  // 章节专属技能
  {
    id: 'exterior_master',
    name: '解表大师',
    description: '解表剂章节奖励+50%',
    category: 'chapter',
    icon: '🌬️',
    maxLevel: 1,
    effects: [{ type: 'chapter_bonus', target: '解表剂', value: 1.5 }],
    unlockCondition: { chapter: 1 },
  },
  {
    id: 'heat_expert',
    name: '清热精通',
    description: '清热剂章节奖励+50%',
    category: 'chapter',
    icon: '🔥',
    maxLevel: 1,
    effects: [{ type: 'chapter_bonus', target: '清热剂', value: 1.5 }],
    unlockCondition: { chapter: 2 },
  },
  {
    id: 'qi_tonic',
    name: '补气圣手',
    description: '补气剂章节奖励+50%',
    category: 'chapter',
    icon: '💪',
    maxLevel: 1,
    effects: [{ type: 'chapter_bonus', target: '补益剂', value: 1.5 }],
    unlockCondition: { chapter: 17 },
  },
  // 通用技能
  {
    id: 'socratic_wisdom',
    name: '顿悟之力',
    description: '首次提示免费',
    category: 'memory',
    icon: '💡',
    maxLevel: 1,
    effects: [{ type: 'hint_bonus', value: 1 }],
    unlockCondition: { cases: 10 },
  },
  {
    id: 'eidetic_memory',
    name: '过目不忘',
    description: '已收集药物复习时提示+1',
    category: 'memory',
    icon: '🧠',
    maxLevel: 3,
    effects: [
      { type: 'unlock_content', value: 1 },
      { type: 'unlock_content', value: 2 },
      { type: 'unlock_content', value: 3 },
    ],
    unlockCondition: { medicines: [], minChaptersCompleted: 0 }, // 收集30味药
  },
  {
    id: 'affinity_boost',
    name: '药灵亲和',
    description: '亲密度获取+20%',
    category: 'wuxing',
    icon: '❤️',
    maxLevel: 1,
    effects: [{ type: 'extra_reward', target: 'affinity', value: 1.2 }],
    unlockCondition: { skillPoints: 0 }, // 亲密度达500
  },
];

// ==================== 预定义章节数据 ====================

export const DEFAULT_CHAPTERS: Chapter[] = [
  {
    id: 'chapter_01',
    sequence: 1,
    name: '解表剂山谷',
    category: '解表剂',
    description: '学习解表剂的组成与应用，掌握麻黄汤、桂枝汤等经典方剂',
    medicines: ['mahuang', 'guizhi', 'zisu', 'shengjiang'],
    formulas: ['mahuang_tang', 'guizhi_tang'],
    bossCase: {} as ClinicalCase, // 占位，实际从数据文件加载
    rewardSkill: 'exterior_master',
    unlockCondition: {},
    wuxing: WuxingType.Wood,
  },
  {
    id: 'chapter_02',
    sequence: 2,
    name: '清热剂山谷',
    category: '清热剂',
    description: '学习清热剂的组成与应用',
    medicines: ['huangqin', 'huanglian', 'zhizi', 'jinyinhua'],
    formulas: [],
    bossCase: {} as ClinicalCase,
    rewardSkill: 'heat_expert',
    unlockCondition: { completedChapters: ['chapter_01'] },
    wuxing: WuxingType.Fire,
  },
  // TODO: 添加第3-20章数据
];

// ==================== 工具函数 ====================

export function createInitialChapterProgress(chapterId: string): ChapterProgress {
  return {
    chapterId,
    collectedMedicines: [],
    unlockedFormulas: [],
    bossDefeated: false,
    bestScore: 0,
  };
}

export function createInitialChapterRun(chapterId: string): ChapterRun {
  return {
    chapterId,
    startTime: Date.now(),
    collectedInRun: [],
    currentQuestion: null,
    conversationHistory: [],
    hintsUsed: 0,
    totalAttempts: 0,
    targetMedicine: null,
  };
}

export function createInitialOpenWorldState(): OpenWorldState {
  const today = new Date().toISOString().split('T')[0];
  return {
    unlockedRegions: [],
    dailyEvents: [],
    completedEvents: [],
    runHistory: [],
    lastLoginDate: today,
    loginStreak: 0,
  };
}

export function createInitialGameSession(): GameSession {
  return {
    // v2.0 保留数据
    diamonds: 100,
    reputation: 0,
    collectedMedicines: [],
    collectedFormulas: [],
    medicineAffinity: {},
    formulaProficiency: {},

    // v3.0 新增数据
    currentChapter: null,
    completedChapters: [],
    chapterProgress: {},
    unlockedSkills: [],
    skillLevels: {},
    skillPoints: 0,
    currentRun: null,
    openWorld: createInitialOpenWorldState(),

    // UI状态
    uiState: {
      isChapterSelectOpen: false,
      isSkillTreeOpen: false,
      isOpenWorldOpen: false,
      isAIDialogOpen: false,
      selectedMedicine: null,
      selectedFormula: null,
      selectedSkill: null,
    },
  };
}

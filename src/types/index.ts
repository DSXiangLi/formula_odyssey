// 五行类型
export type WuxingType = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

// 四气
export type FourQi = '寒' | '热' | '温' | '凉' | '平';

// 五味
export type FiveFlavors = '酸' | '苦' | '甘' | '辛' | '咸';

// 升降浮沉
export type Movement = '升浮' | '沉降' | '双向' | '平和';

// 药灵数据类型（v2.0 五行归元版）
export interface Medicine {
  id: string;
  name: string;
  pinyin: string;
  latinName?: string;        // 拉丁学名
  category: string;          // 功效分类（解表药等）
  wuxing: WuxingType;        // 五行归属

  // 中药专业属性
  fourQi: FourQi;            // 四气
  fiveFlavors: FiveFlavors[]; // 五味（可多个）
  movement: Movement;        // 升降浮沉
  meridians: string[];       // 归经
  toxicity?: string;         // 毒性（有毒/无毒/小毒等）
  functions: string[];       // 功效
  indications: string[];     // 主治
  contraindications: string[]; // 禁忌

  // 图片资源（两层视觉系统）
  imagePlant?: string;       // 原植物/矿物图（未收集状态）
  imageHerb?: string;        // 饮片图（收集后展示）
  imageSeed?: string;        // 兼容旧版本
  imageSpirit?: string;      // 兼容旧版本

  // 故事与亲密度
  stories: string[];
  affinity: number;
  collected: boolean;

  // 兼容性字段
  region?: RegionType;       // 旧区域字段（可选，用于向后兼容）
  nature?: string;           // 旧性味字段（可选，用于向后兼容）
}

// 区域类型（v2.0 五行架构）
export type RegionType = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

// 旧区域类型（向后兼容）
export type LegacyRegionType = 'mountain' | 'forest' | 'flower' | 'stream' | 'cliff';

export interface Region {
  id: RegionType;
  name: string;
  themeColor: string;
  themeColorLight: string;
  medicines: string[];
  particleType: 'petal' | 'ember' | 'grain' | 'frost' | 'snow';
  zangfu: string;           // 对应脏腑
  season: string;           // 对应季节
  direction: string;        // 对应方位
  specialMechanism: string; // 专属机制描述
}

// 亲密度等级
export type AffinityLevel = 1 | 2 | 3 | 4 | 5;

export interface AffinityConfig {
  level: AffinityLevel;
  name: string;
  minScore: number;
  maxScore: number;
  title: string;
}

// 种子数据（v2.0 性味归经探查版）
export interface Seed {
  id: string;
  medicineId: string;
  wuxing: WuxingType;       // 五行归属
  region?: RegionType;      // 旧区域（兼容）
  position: { x: number; y: number };
  visible: boolean;
  collected: boolean;
  discovered: boolean;      // 是否已解锁（分批显示）
  hint?: string;
  // 性味归经探查状态
  examinedWang?: boolean;   // 是否已查看药图
  examinedWen?: boolean;    // 是否已查看四气
  examinedWenCost?: number; // 四气消耗（钻石）
  examinedAsk?: boolean;    // 是否已查看五味
  examinedAskCost?: number; // 五味消耗（钻石）
  examinedQie?: boolean;    // 是否已查看归经
  examinedQieCost?: number; // 归经消耗（钻石）
  examinedCha?: boolean;    // 是否已查看功效
  examinedChaCost?: number; // 功效消耗（钻石）
}

// 方剂数据
export interface Formula {
  id: string;
  name: string;
  pinyin: string;
  category: string;         // 方剂分类（解表剂等）
  difficulty: 'easy' | 'normal' | 'hard' | 'challenge';
  composition: {
    medicineId: string;
    amount: string;
    role: 'jun' | 'chen' | 'zuo' | 'shi'; // 君臣佐使
  }[];
  functions: string[];
  indications: string[];
  song?: string;            // 方歌
  variations?: string[];    // 加减变化
  proficiency: number;      // 熟练度 0-5
}

// 方剂追缉令
export interface FormulaPursuit {
  id: string;
  formulaId: string;
  difficulty: 'easy' | 'normal' | 'hard' | 'challenge';
  requirements?: string;    // 特殊要求
  timeLimit: number;        // 时限（小时）
  rewards: {
    currency: number;
    affinityBonus?: number;
    badge?: string;
  };
  expiresAt: string;        // 过期时间
  completed: boolean;       // 是否已完成
  collectedMedicines: string[]; // 已收集的药材ID
}

// 临床病案
export interface ClinicalCase {
  id: string;
  formulaId: string;        // 对应方剂
  patientInfo: string;      // 患者信息
  symptoms: string[];       // 症状
  tongue: string;           // 舌象
  pulse: string;            // 脉象
  correctTreatment: string; // 正确治法
  correctFormula: string;   // 正确方剂
  correctJun: string;       // 正确君药（可能多味）
  explanation: string;      // 解析
}

// 病案答题结果
export interface CaseResult {
  caseId: string;
  treatmentCorrect: boolean;
  formulaCorrect: boolean;
  junCorrect: boolean;
  score: number;            // 得分 0-3
  reward: number;           // 奖励方灵石
  proficiencyGain: number;  // 熟练度增加
}

// 方剂熟练度等级
export type ProficiencyLevel = 0 | 1 | 2 | 3 | 4 | 5;

// 每日统计
export interface DailyStats {
  date: string;
  seedsExplored: number;
  pursuitsCompleted: number;
  casesCompleted: number;
  correctGuesses: number;   // 连续正确猜测次数
}

// 玩家数据（v2.0 更新版）
export interface Player {
  id: string;
  name: string;

  // 资源
  currency: number;         // 方灵石
  reputation: number;       // 声望值

  // 收集进度
  collectedSeeds: string[];
  collectedMedicines: string[];
  medicineAffinity: Record<string, number>;

  // 方剂进度
  unlockedFormulas: string[];
  formulaProficiency: Record<string, number>;

  // 任务进度
  activePursuits: FormulaPursuit[];
  completedPursuits: string[];

  // 临床实习进度
  completedCases: string[];
  caseProficiency: Record<string, number>;

  // 统计
  dailyStats: DailyStats;

  // 登录
  lastLoginDate: string;
  loginStreak: number;

  // 兼容性字段
  exploreCount?: number;    // 旧探索次数（可选）
}

// 探索问答
export interface Quiz {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'easy' | 'normal' | 'hard';
  category: string;
}

// 游戏状态（v2.0 更新版）
export interface GameState {
  currentRegion: RegionType;
  selectedMedicine: string | null;
  selectedSeed: string | null;      // 当前选中的种子（四诊探查）
  isExploreOpen: boolean;
  isCollectionOpen: boolean;
  isMedicineDetailOpen: boolean;
  isFormulaPursuitOpen: boolean;    // 方剂追缉令界面
  isClinicalCaseOpen: boolean;      // 临床病案界面
  currentCase: string | null;       // 当前病案ID
}

// 线索类型
export type DiagnosisType = 'wang' | 'wen' | 'ask' | 'qie' | 'cha';

// 线索信息
export interface DiagnosisInfo {
  type: DiagnosisType;
  name: string;
  cost: number;
  description: string;
  unlocked: boolean;
  requirement?: string;     // 解锁条件
}

// 粒子效果
export interface Particle {
  id: string;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  color: string;
}

// 动画配置
export interface AnimationConfig {
  duration: number;
  ease: string;
  delay?: number;
}

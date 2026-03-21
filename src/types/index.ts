// 药灵数据类型
export interface Medicine {
  id: string;
  name: string;
  pinyin: string;
  category: string;
  region: RegionType;
  nature: string;
  meridians: string[];
  functions: string[];
  indications: string[];
  contraindications: string[];
  stories: string[];
  affinity: number;
  collected: boolean;
  imageSeed?: string;
  imageHerb?: string;
  imageSpirit?: string;
}

// 区域类型
export type RegionType = 'mountain' | 'forest' | 'flower' | 'stream' | 'cliff';

export interface Region {
  id: RegionType;
  name: string;
  themeColor: string;
  medicines: string[];
  particleType: 'snow' | 'light' | 'petal' | 'mist' | 'sparkle';
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

// 种子数据
export interface Seed {
  id: string;
  medicineId: string;
  region: RegionType;
  position: { x: number; y: number };
  visible: boolean;
  collected: boolean;
  hint?: string;
}

// 玩家数据
export interface Player {
  id: string;
  name: string;
  collectedSeeds: string[];
  collectedMedicines: string[];
  medicineAffinity: Record<string, number>;
  currency: number;
  exploreCount: number;
  lastLoginDate: string;
  loginStreak: number;
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

// 游戏状态
export interface GameState {
  currentRegion: RegionType;
  selectedMedicine: string | null;
  isExploreOpen: boolean;
  isCollectionOpen: boolean;
  isMedicineDetailOpen: boolean;
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

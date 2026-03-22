// v3.0 开放世界系统类型定义

// 开放世界区域（基于已解锁章节）
export interface OpenWorldRegion {
  id: string;
  name: string;
  chapterId: string;      // 对应章节ID
  wuxing: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
  description: string;
  backgroundImage: string;
  unlockCondition: {
    completedChapters: string[];
  };
  unlocked: boolean;
}

// 每日随机事件类型
export type EventType = 'case' | 'book' | 'spirit' | 'bounty' | 'plague';

// 事件难度
export type EventDifficulty = 1 | 2 | 3 | 4 | 5;

// 生成的事件
export interface GeneratedEvent {
  id: string;
  type: EventType;
  title: string;
  description: string;
  difficulty: EventDifficulty;
  regionId: string;       // 关联区域
  // 事件要求
  requirements?: {
    medicines?: string[];
    formulas?: string[];
    skills?: string[];
  };
  // 奖励
  rewards: {
    diamonds: number;
    skillPoints?: number;
    newSkill?: string;
    title?: string;
    affinityBonus?: number;
  };
  // 限时事件
  timeLimit?: number;     // 限时（分钟）
  expiresAt: string;      // 过期时间
  // 事件特有数据
  data?: {
    // 病案求助
    patientInfo?: string;
    symptoms?: string[];
    tongue?: string;
    pulse?: string;
    correctTreatment?: string;
    correctFormula?: string;
    correctJun?: string;
    // 古籍发现
    bookContent?: string;
    questions?: {
      question: string;
      options: string[];
      correctIndex: number;
    }[];
    // 药灵对话
    spiritId?: string;
    dialogues?: {
      speaker: 'player' | 'spirit';
      content: string;
    }[];
    // 追缉令
    targetFormula?: string;
    // 瘟疫爆发
    plagueType?: string;
  };
  // 状态
  accepted: boolean;
  completed: boolean;
  completedAt?: string;
}

// 开放世界状态
export interface OpenWorldState {
  unlocked: boolean;              // 是否已解锁开放世界
  unlockedRegions: string[];      // 已解锁区域ID列表
  dailyEvents: GeneratedEvent[];  // 今日事件列表
  completedEvents: string[];      // 已完成事件ID列表
  acceptedEvents: string[];       // 已接受但未完成
  lastEventDate: string;          // 最后生成事件的日期
  runHistory: RunRecord[];        // 探索历史
}

// 探索记录
export interface RunRecord {
  id: string;
  regionId: string;
  eventId: string;
  startTime: string;
  endTime?: string;
  result: 'success' | 'fail' | 'abandoned';
  rewards?: {
    diamonds: number;
    skillPoints?: number;
  };
}

// 技能数据
export interface Skill {
  id: string;
  name: string;
  description: string;
  category: 'explore' | 'diagnosis' | 'memory' | 'wuxing' | 'chapter';
  icon: string;
  maxLevel: number;
  currentLevel: number;
  effects: SkillEffect[];
  unlockCondition: {
    chapter?: number;
    medicines?: number;
    formulas?: number;
    cases?: number;
    skillPoints?: number;
  };
}

// 技能效果
export interface SkillEffect {
  type: 'free_clue' | 'discount' | 'chapter_bonus' | 'extra_reward' | 'unlock_content';
  target?: string;
  value: number;
}

// 事件筛选条件
export interface EventFilter {
  type?: EventType;
  difficulty?: EventDifficulty;
  regionId?: string;
  status?: 'pending' | 'accepted' | 'completed';
}

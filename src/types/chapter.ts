import type { WuxingType } from './index'

// 章节数据
export interface Chapter {
  id: string
  sequence: number // 1-20
  name: string
  category: string // 解表剂、清热剂等
  description: string
  medicines: string[] // 本章要收集的药物ID列表
  formulas: string[] // 本章解锁的方剂ID列表
  bossCase?: {
    patientInfo?: string
    symptoms?: string[]
    tongue?: string
    pulse?: string
  }
  rewardSkill: string // 通关奖励技能ID
  rewardSkillIcon?: string // 技能图标
  rewardSkillDescription?: string // 技能描述
  unlockCondition?: {
    completedChapters?: string[] // 必须完成的先修章节ID
    minMedicines?: number // 最少收集药物数
  }
  wuxing: WuxingType // 本章主五行
}

// 章节进度
export interface ChapterProgress {
  chapterId: string
  collectedMedicines: string[]
  unlockedFormulas: string[]
  bossDefeated: boolean
  bestScore: number // 最高分（用于重玩）
}

// 章节地图组件Props
export interface ChapterMapProps {
  chapters?: Chapter[]
  chapterProgress?: Record<string, ChapterProgress>
  currentChapterId?: string | null
  onSelectChapter?: (chapter: Chapter) => void
}

// 章节运行状态
export interface ChapterRun {
  chapterId: string
  startTime: number
  collectedInRun: string[] // 本次已收集
  currentQuestion: Question | null
  conversationHistory: ConversationTurn[] // 与AI的对话历史
}

// AI题目
export interface Question {
  id: string
  question: string
  type: 'single' | 'compare' | 'formula' | 'cross_chapter'
  difficulty: number // 1-5
  hintAvailable: boolean
  expectedKeywords: string[]
  reference?: string
  sceneDescription?: string
}

// 对话历史
export interface ConversationTurn {
  role: 'user' | 'elder' | 'socrates'
  content: string
  timestamp: number
  metadata?: {
    questionType?: string
    isCorrect?: boolean
    hintUsed?: boolean
  }
}

// 技能
export interface Skill {
  id: string
  name: string
  description: string
  category: 'explore' | 'diagnosis' | 'memory' | 'wuxing' | 'chapter'
  icon: string
  maxLevel: number
  effects: SkillEffect[]
  unlockCondition: {
    chapter?: number
    medicines?: string[]
    formulas?: string[]
    cases?: number
    skillPoints?: number
  }
}

// 技能效果
export interface SkillEffect {
  type: 'free_clue' | 'discount' | 'chapter_bonus' | 'extra_reward' | 'unlock_content'
  target?: string
  value: number
}

// 游戏会话数据（v3.0）
export interface GameSession {
  // 章节进度
  currentChapter: string | null
  completedChapters: string[]
  chapterProgress: Record<string, ChapterProgress>

  // 技能
  unlockedSkills: string[]
  skillLevels: Record<string, number>
  skillPoints: number

  // 当前章节运行
  currentRun: ChapterRun | null

  // 基础资源
  diamonds: number
  collectedMedicines: string[]
  collectedFormulas: string[]
}

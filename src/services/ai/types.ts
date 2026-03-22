/**
 * AI Service Types
 * 药灵山谷v3.0 AI-Native 类型定义
 */

// ========== AI生成内容类型 ==========

export interface Question {
  question: string;
  type: 'single' | 'compare' | 'formula' | 'cross_chapter';
  difficulty: number;
  hint_available: boolean;
  expected_keywords: string[];
  reference?: string;
  scene_description?: string;
}

export interface SocraticResponse {
  response_type: 'guide' | 'answer';
  content: string;
  next_question?: string;
  give_up: boolean;
}

export interface GeneratedEvent {
  event_type: 'case' | 'book' | 'spirit' | 'bounty' | 'plague';
  title: string;
  description: string;
  difficulty: number;
  requirements?: {
    medicines?: string[];
    formulas?: string[];
  };
  rewards: {
    diamond?: number;
    skill_point?: number;
    new_skill?: string;
    title?: string;
  };
  time_limit?: number;
}

// ========== 上下文类型 ==========

export interface PlayerContext {
  chapter?: number;
  chapterName?: string;
  collectedMedicines: string[];
  targetMedicine?: string;
  collectedInChapter?: number;
  totalInChapter?: number;
  unlockedRegions?: string[];
  playerSkills?: string[];
  unlockedFormulas?: string[];
}

export interface QuestionContext extends PlayerContext {
  targetMedicine: string;
}

export interface GuideContext {
  question: Question;
  playerAnswer: string;
  correctPoints: string[];
  history: ConversationTurn[];
  conversationRound: number;
  forceAnswer?: boolean;
}

export interface EventContext extends PlayerContext {
  eventType?: string;
  date: string;
}

export interface ConversationTurn {
  role: 'user' | 'elder' | 'socrates';
  content: string;
  timestamp: number;
}

// ========== AI服务配置类型 ==========

export interface AIServiceConfig {
  apiBase: string;
  apiKey: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
}

export interface AIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  fallback?: boolean;
}

// ========== 验证结果类型 ==========

export interface ValidationResult {
  isCorrect: boolean;
  confidence: number;
  feedback: string;
  matchedKeywords: string[];
  missedKeywords: string[];
}

// ========== 缓存类型 ==========

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
}

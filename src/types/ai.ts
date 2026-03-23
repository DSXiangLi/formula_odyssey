// AI 导师系统类型定义 v3.0

// AI 缓存条目
export interface AICacheEntry {
  response: string;
  timestamp: number;
  cacheKey: string;
}

// AI 导师消息
export interface AIMentorMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
  metadata?: {
    chapterId?: string;
    medicineId?: string;
    stageType?: string;
    emotion?: string;
  };
}

// AI 导师会话
export interface AIMentorSession {
  id: string;
  messages: AIMentorMessage[];
  context: {
    chapterId?: string;
    medicineId?: string;
    stageType?: string;
    playerLevel?: number;
  };
  createdAt: number;
  lastActivity: number;
}

// AI 提示词模板
export interface AIPromptTemplate {
  id: string;
  name: string;
  template: string;
  variables: string[];
  systemPrompt: string;
  maxTokens: number;
  temperature: number;
}

// AI 服务配置
export interface AIServiceConfig {
  provider: 'volces' | 'dashscope' | 'openai';
  model: string;
  apiKey: string;
  baseUrl?: string;
  timeout: number;
  maxRetries: number;
}

// AI 响应
export interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latency: number;
  timestamp: number;
}

// AI 导师反馈
export interface AIMentorFeedback {
  type: 'encouragement' | 'correction' | 'explanation' | 'hint';
  content: string;
  relatedConcept?: string;
  suggestedAction?: string;
}

// AI 生成内容类型
export enum AIGeneratedContentType {
  SceneDescription = 'scene_description',
  MedicineStory = 'medicine_story',
  BattleDialogue = 'battle_dialogue',
  ClinicalGuidance = 'clinical_guidance',
  LearningTip = 'learning_tip',
}

// AI 生成请求
export interface AIGenerationRequest {
  type: AIGeneratedContentType;
  context: Record<string, unknown>;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

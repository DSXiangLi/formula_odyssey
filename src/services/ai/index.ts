/**
 * AI Services Index
 * 药灵山谷v3.0 AI服务层统一导出
 */

// 类型导出
export type {
  Question,
  SocraticResponse,
  GeneratedEvent,
  PlayerContext,
  QuestionContext,
  GuideContext,
  EventContext,
  ConversationTurn,
  AIServiceConfig,
  AIResponse,
  ValidationResult,
  CacheEntry,
  CacheStats,
} from './types';

// Prompt构建函数导出
export {
  buildElderPrompt,
  buildSocratesPrompt,
  buildEventPrompt,
  buildValidationPrompt,
  FALLBACK_QUESTIONS,
  FALLBACK_EVENTS,
  PROMPT_VERSIONS,
} from './prompts';

// 缓存导出
export { LRUCache, AICacheManager, aiCache } from './cache';

// AI服务导出
export { AIService, aiService } from './aiService';

// Phase 4新增服务
export { AIMentorService, aiMentor, type MentorMessage, type MentorContext } from './AIMentorService';
export { QuestionService, questionService, type Question as QuestionServiceQuestion } from './QuestionService';
export { StreamingService, streamingService, useStreaming } from './StreamingService';

// Spirit服务
export {
  SpiritQuestionService,
  spiritQuestionService,
  type GenerateQuestionParams,
  type EvaluateAnswerParams,
  type QuestionTypeConfig,
} from './SpiritQuestionService';
export { SpiritImageService, spiritImageService } from './SpiritImageService';

// 默认导出
export { AIService as default } from './aiService';

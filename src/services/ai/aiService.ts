/**
 * AI Service
 * 药灵山谷v3.0 AI服务层 - 老顽童出题官、苏格拉底答疑官、事件生成器
 */

import {
  Question,
  SocraticResponse,
  GeneratedEvent,
  QuestionContext,
  GuideContext,
  EventContext,
  ValidationResult,
  AIResponse,
  AIServiceConfig,
} from './types';
import {
  buildElderPrompt,
  buildSocratesPrompt,
  buildEventPrompt,
  buildValidationPrompt,
  FALLBACK_QUESTIONS,
  FALLBACK_EVENTS,
} from './prompts';
import { AICacheManager, aiCache } from './cache';

export class AIService {
  private config: AIServiceConfig;
  private cache: AICacheManager;

  constructor(config?: Partial<AIServiceConfig>) {
    // 从环境变量读取配置
    this.config = {
      apiBase: config?.apiBase || import.meta.env.VITE_GLM_API_BASE || '',
      apiKey: config?.apiKey || import.meta.env.VITE_GLM_API_KEY || '',
      model: config?.model || import.meta.env.VITE_GLM_MODEL_NAME || 'glm-4',
      temperature: config?.temperature ?? 0.7,
      maxTokens: config?.maxTokens ?? 800,
      timeout: config?.timeout ?? 30000,
    };

    this.cache = aiCache;
  }

  /**
   * 生成题目 - 老顽童出题官
   */
  async generateQuestion(context: QuestionContext): Promise<AIResponse<Question>> {
    const cacheKey = AICacheManager.generateQuestionKey(
      context.chapter || 1,
      context.targetMedicine || '',
      context.collectedMedicines || []
    );

    // 检查缓存
    const cached = this.cache.questionCache.get(cacheKey) as Question | undefined;
    if (cached) {
      return { success: true, data: cached };
    }

    // 如果没有API配置，返回备用题目
    if (!this.config.apiKey) {
      const fallback = this.getFallbackQuestion(context);
      return { success: true, data: fallback, fallback: true };
    }

    try {
      const prompt = buildElderPrompt(context);
      const response = await this.callModel(prompt, true);

      const parsed = this.parseJSON<Question>(response);
      if (parsed) {
        // 存入缓存
        this.cache.questionCache.set(cacheKey, parsed);
        return { success: true, data: parsed };
      }

      // 解析失败，返回备用
      const fallback = this.getFallbackQuestion(context);
      return { success: true, data: fallback, fallback: true };
    } catch (error) {
      console.error('AI generateQuestion error:', error);
      const fallback = this.getFallbackQuestion(context);
      return {
        success: true,
        data: fallback,
        fallback: true,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 苏格拉底式引导答疑
   */
  async socraticGuide(context: GuideContext): Promise<AIResponse<SocraticResponse>> {
    const cacheKey = AICacheManager.generateGuideKey(
      context.question.question,
      context.playerAnswer,
      context.conversationRound
    );

    // 检查缓存
    const cached = this.cache.guideCache.get(cacheKey) as SocraticResponse | undefined;
    if (cached) {
      return { success: true, data: cached };
    }

    // 如果强制给答案或已超过3轮
    if (context.forceAnswer || context.conversationRound >= 3) {
      const answerResponse: SocraticResponse = {
        response_type: 'answer',
        content: `让我直接告诉你吧。${context.correctPoints.join('，')}。记住这些关键点哦！`,
        give_up: true,
      };
      return { success: true, data: answerResponse };
    }

    // 如果没有API配置，返回简单引导
    if (!this.config.apiKey) {
      const fallback = this.getFallbackGuide(context);
      return { success: true, data: fallback, fallback: true };
    }

    try {
      const prompt = buildSocratesPrompt(context);
      const response = await this.callModel(prompt, true);

      const parsed = this.parseJSON<SocraticResponse>(response);
      if (parsed) {
        // 存入缓存
        this.cache.guideCache.set(cacheKey, parsed);
        return { success: true, data: parsed };
      }

      // 解析失败，返回备用
      const fallback = this.getFallbackGuide(context);
      return { success: true, data: fallback, fallback: true };
    } catch (error) {
      console.error('AI socraticGuide error:', error);
      const fallback = this.getFallbackGuide(context);
      return {
        success: true,
        data: fallback,
        fallback: true,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 生成开放世界事件
   */
  async generateEvent(context: EventContext): Promise<AIResponse<GeneratedEvent>> {
    const cacheKey = AICacheManager.generateEventKey(context.date);

    // 检查缓存
    const cached = this.cache.eventCache.get(cacheKey) as GeneratedEvent | undefined;
    if (cached) {
      return { success: true, data: cached };
    }

    // 如果没有API配置，返回备用事件
    if (!this.config.apiKey) {
      const fallback = this.getFallbackEvent(context);
      return { success: true, data: fallback, fallback: true };
    }

    try {
      const prompt = buildEventPrompt(context);
      const response = await this.callModel(prompt, true);

      const parsed = this.parseJSON<GeneratedEvent>(response);
      if (parsed) {
        // 存入缓存
        this.cache.eventCache.set(cacheKey, parsed);
        return { success: true, data: parsed };
      }

      // 解析失败，返回备用
      const fallback = this.getFallbackEvent(context);
      return { success: true, data: fallback, fallback: true };
    } catch (error) {
      console.error('AI generateEvent error:', error);
      const fallback = this.getFallbackEvent(context);
      return {
        success: true,
        data: fallback,
        fallback: true,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 验证玩家答案
   */
  async validateAnswer(
    question: Question,
    playerAnswer: string
  ): Promise<AIResponse<ValidationResult>> {
    const cacheKey = AICacheManager.generateValidationKey(
      question.question,
      playerAnswer
    );

    // 检查缓存
    const cached = this.cache.validationCache.get(cacheKey) as ValidationResult | undefined;
    if (cached) {
      return { success: true, data: cached };
    }

    // 简单的关键词匹配作为基础验证
    const keywordMatch = this.checkKeywords(playerAnswer, question.expected_keywords);

    // 如果没有API配置，使用关键词匹配结果
    if (!this.config.apiKey) {
      const result: ValidationResult = {
        isCorrect: keywordMatch.score > 0.5,
        confidence: keywordMatch.score,
        feedback: keywordMatch.score > 0.5
          ? '回答正确！你抓住了关键点。'
          : `还不够准确。需要关注：${question.expected_keywords.join('、')}`,
        matchedKeywords: keywordMatch.matched,
        missedKeywords: keywordMatch.missed,
      };
      this.cache.validationCache.set(cacheKey, result);
      return { success: true, data: result };
    }

    try {
      const prompt = buildValidationPrompt(
        question.question,
        question.expected_keywords,
        playerAnswer
      );
      const response = await this.callModel(prompt, true);

      const parsed = this.parseJSON<ValidationResult>(response);
      if (parsed) {
        // 如果AI判断正确，但关键词匹配很低，以AI为准
        if (parsed.isCorrect && keywordMatch.score < 0.3) {
          console.warn('AI validation conflict: AI says correct but keywords low match');
        }
        this.cache.validationCache.set(cacheKey, parsed);
        return { success: true, data: parsed };
      }

      // 解析失败，使用关键词匹配
      const result: ValidationResult = {
        isCorrect: keywordMatch.score > 0.5,
        confidence: keywordMatch.score,
        feedback: keywordMatch.score > 0.5
          ? '回答正确！'
          : '还不够准确，再想想。',
        matchedKeywords: keywordMatch.matched,
        missedKeywords: keywordMatch.missed,
      };
      return { success: true, data: result };
    } catch (error) {
      console.error('AI validateAnswer error:', error);
      const result: ValidationResult = {
        isCorrect: keywordMatch.score > 0.5,
        confidence: keywordMatch.score,
        feedback: '验证出错，使用备用方案。',
        matchedKeywords: keywordMatch.matched,
        missedKeywords: keywordMatch.missed,
      };
      return { success: true, data: result, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * 批量生成每日事件
   */
  async generateDailyEvents(
    context: EventContext,
    count: number = 3
  ): Promise<AIResponse<GeneratedEvent[]>> {
    const events: GeneratedEvent[] = [];
    const errors: string[] = [];

    for (let i = 0; i < count; i++) {
      const eventTypes: GeneratedEvent['event_type'][] = ['case', 'book', 'spirit', 'bounty', 'plague'];
      const typeContext: EventContext = {
        ...context,
        eventType: eventTypes[i % eventTypes.length],
      };

      const result = await this.generateEvent(typeContext);
      if (result.success && result.data) {
        events.push(result.data);
      } else if (result.error) {
        errors.push(result.error);
      }
    }

    if (events.length === 0) {
      // 全部失败，使用备用
      for (let i = 0; i < count && i < FALLBACK_EVENTS.length; i++) {
        events.push(FALLBACK_EVENTS[i]);
      }
      return {
        success: true,
        data: events,
        fallback: true,
        error: errors.join('; '),
      };
    }

    return { success: true, data: events };
  }

  // ========== 私有方法 ==========

  /**
   * 调用AI模型
   */
  private async callModel(prompt: string, jsonMode: boolean = false): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(`${this.config.apiBase}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [{ role: 'system', content: prompt }],
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens,
          response_format: jsonMode ? { type: 'json_object' } : undefined,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('Empty response from AI');
      }

      return content;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * 解析JSON响应
   */
  private parseJSON<T>(response: string): T | null {
    try {
      // 尝试直接解析
      try {
        return JSON.parse(response) as T;
      } catch {
        // 忽略直接解析失败
      }

      // 尝试提取JSON块
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as T;
      }

      // 尝试提取代码块中的JSON
      const codeBlockMatch = response.match(/```(?:json)?\n?([\s\S]*?)```/);
      if (codeBlockMatch) {
        return JSON.parse(codeBlockMatch[1]) as T;
      }

      return null;
    } catch (error) {
      console.warn('Failed to parse JSON response:', error);
      return null;
    }
  }

  /**
   * 检查关键词匹配
   */
  private checkKeywords(
    answer: string,
    keywords: string[]
  ): { score: number; matched: string[]; missed: string[] } {
    const normalizedAnswer = answer.toLowerCase();
    const matched: string[] = [];
    const missed: string[] = [];

    for (const keyword of keywords) {
      // 检查关键词或其同义词
      const keywordVariants = this.getKeywordVariants(keyword);
      const isMatch = keywordVariants.some(variant =>
        normalizedAnswer.includes(variant.toLowerCase())
      );

      if (isMatch) {
        matched.push(keyword);
      } else {
        missed.push(keyword);
      }
    }

    const score = keywords.length > 0 ? matched.length / keywords.length : 0;
    return { score, matched, missed };
  }

  /**
   * 获取关键词变体（简单的同义词处理）
   */
  private getKeywordVariants(keyword: string): string[] {
    const variants = [keyword];

    // 中医常见同义词
    const synonyms: Record<string, string[]> = {
      '麻黄': ['麻黄'],
      '桂枝': ['桂枝'],
      '发汗解表': ['发汗', '解表', '发汗解表'],
      '宣肺平喘': ['宣肺', '平喘', '止咳'],
      '清热': ['清热', '泻火', '降火'],
      '补气': ['补气', '益气', '健脾'],
      '养血': ['养血', '补血', '滋阴'],
    };

    if (synonyms[keyword]) {
      variants.push(...synonyms[keyword]);
    }

    return variants;
  }

  // ========== 备用方案 ==========

  /**
   * 获取备用题目
   */
  private getFallbackQuestion(context: QuestionContext): Question {
    const chapter = context.chapter || 1;
    const collectedCount = context.collectedInChapter || 0;

    // 根据进度选择题型
    let type: Question['type'] = 'single';
    if (collectedCount >= 2) type = 'compare';
    if (collectedCount >= 3) type = 'formula';
    if (chapter >= 5) type = 'cross_chapter';

    const questions = FALLBACK_QUESTIONS[type];
    const question = questions[Math.floor(Math.random() * questions.length)];

    return {
      question,
      type,
      difficulty: Math.min(chapter / 4, 5),
      hint_available: true,
      expected_keywords: ['回答', '中药'],
      scene_description: '药灵山谷，云雾缭绕',
    };
  }

  /**
   * 获取备用引导回复
   */
  private getFallbackGuide(context: GuideContext): SocraticResponse {
    const round = context.conversationRound;

    if (round === 1) {
      return {
        response_type: 'guide',
        content: '师弟，你再仔细想想。这题的关键点在哪里？',
        next_question: '你觉得这味药的主要功效是什么？',
        give_up: false,
      };
    } else if (round === 2) {
      return {
        response_type: 'guide',
        content: '接近了，但还差一点点。让我再提示一下...',
        next_question: '还记得这味药的性味吗？',
        give_up: false,
      };
    } else {
      return {
        response_type: 'answer',
        content: `好吧，让我告诉你答案。${context.correctPoints.join('，')}。记住了吗？`,
        give_up: true,
      };
    }
  }

  /**
   * 获取备用事件
   */
  private getFallbackEvent(context: EventContext): GeneratedEvent {
    const index = Math.floor(Math.random() * FALLBACK_EVENTS.length);
    return FALLBACK_EVENTS[index];
  }

  // ========== 工具方法 ==========

  /**
   * 获取缓存统计
   */
  getCacheStats(): ReturnType<AICacheManager['getAllStats']> {
    return this.cache.getAllStats();
  }

  /**
   * 清理缓存
   */
  cleanupCache(): { questions: number; events: number; validations: number; guides: number } {
    return this.cache.cleanup();
  }

  /**
   * 清空缓存
   */
  clearCache(): void {
    this.cache.clearAll();
  }

  /**
   * 检查API是否可用
   */
  isAvailable(): boolean {
    return !!this.config.apiKey;
  }
}

// 单例导出
export const aiService = new AIService();

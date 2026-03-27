/**
 * AI Mentor Service
 * 药灵山谷v3.0 AI导师服务 - 青木先生对话系统
 */

import { aiCache, AICacheManager } from './cache';

export interface MentorMessage {
  id: string;
  role: 'mentor' | 'student';
  content: string;
  emotion?: 'happy' | 'thinking' | 'surprised' | 'concerned' | 'celebrating';
  timestamp: number;
}

export interface MentorContext {
  playerName: string;
  chapterId: string;
  chapterTitle: string;
  collectedMedicines: string[];
  knownMedicineInfo: Record<string, string[]>;
  currentQuestion?: string;
  stage: 'intro' | 'guiding' | 'questioning' | 'feedback';
}

interface AIServiceConfig {
  apiKey: string;
  baseURL: string;
  model: string;
}

export class AIMentorService {
  private config: AIServiceConfig;
  private offlineMode: boolean = false;
  private conversationHistory: Array<{role: 'system' | 'user' | 'assistant', content: string}> = [];
  private maxHistoryLength: number = 10; // 保留最近10轮对话

  constructor() {
    // 支持多种环境变量获取方式（Vite、Node.js、process.env）
    const getEnv = (key: string): string => {
      // Vite环境
      if (typeof import.meta !== 'undefined' && import.meta.env) {
        return import.meta.env[key] || '';
      }
      // Node.js环境
      if (typeof process !== 'undefined' && process.env) {
        return process.env[key] || '';
      }
      return '';
    };

    this.config = {
      apiKey: getEnv('VITE_GLM_API_KEY') || getEnv('GLM_API_KEY') || '',
      baseURL: getEnv('VITE_GLM_API_BASE') || getEnv('GLM_API_BASE') || 'https://api.glm.cn/v1',
      model: getEnv('VITE_GLM_MODEL_NAME') || getEnv('GLM_MODEL_NAME') || 'glm-4',
    };
  }

  /**
   * 清空对话历史
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * 获取对话历史（用于测试和调试）
   */
  getHistory(): Array<{role: 'system' | 'user' | 'assistant', content: string}> {
    return [...this.conversationHistory];
  }

  async generateResponse(
    context: MentorContext,
    messageType: 'greeting' | 'guide' | 'encouragement' | 'correction',
    onStream?: (chunk: string) => void,
    studentMessage?: string // 学生当前消息，用于上下文
  ): Promise<MentorMessage> {
    const cacheKey = AICacheManager.generateValidationKey(
      JSON.stringify(context),
      messageType
    );
    const cached = aiCache.validationCache.get(cacheKey) as string | undefined;

    if (cached && !onStream) {
      return {
        id: `msg_${Date.now()}`,
        role: 'mentor',
        content: cached,
        emotion: this.detectEmotion(cached, messageType),
        timestamp: Date.now(),
      };
    }

    const prompt = this.buildPrompt(context, messageType, studentMessage);

    try {
      // 新对话开始时清空历史（问候类型）
      if (messageType === 'greeting') {
        this.clearHistory();
      }

      const response = await this.callAI(prompt, onStream, this.conversationHistory);

      // 保存到对话历史
      if (studentMessage) {
        this.conversationHistory.push({ role: 'user', content: studentMessage });
      }
      this.conversationHistory.push({ role: 'assistant', content: response });

      // 限制历史长度
      if (this.conversationHistory.length > this.maxHistoryLength * 2) {
        this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength * 2);
      }

      // Cache the response
      if (!onStream) {
        aiCache.validationCache.set(cacheKey, response);
      }

      return {
        id: `msg_${Date.now()}`,
        role: 'mentor',
        content: response,
        emotion: this.detectEmotion(response, messageType),
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('AI service error:', error);
      return this.getOfflineResponse(messageType);
    }
  }

  private buildPrompt(
    context: MentorContext,
    type: string,
    studentMessage?: string
  ): string {
    const baseContext = `当前章节：${context.chapterTitle}
学生姓名：${context.playerName}
已采集药材：${context.collectedMedicines.join('、') || '无'}`;

    switch (type) {
      case 'greeting':
        return `你是青木先生，一位德高望重的中医导师。

${baseContext}

任务：向学生问好，介绍本章学习内容，简要说明本章将要学习的4味药材。

要求：
- 语气温和、亲切，使用"徒儿"或"孩子"称呼
- 提及具体药材名称
- 50-80字`;

      case 'guide':
        const medicine = context.collectedMedicines[context.collectedMedicines.length - 1];
        if (!medicine) {
          return `你是青木先生。

${baseContext}

任务：引导学生开始采集药材之旅。

要求：
- 提及采药的意义
- 激发学生兴趣
- 50-80字`;
        }
        return `你是青木先生，一位中医导师。

${baseContext}

${studentMessage ? `学生刚才说："${studentMessage}"` : ''}

任务：用苏格拉底式提问引导学生思考${medicine}的功效。

要求：
- 引用学生的回答或针对学生的困惑提问
- 不要直接给答案，用启发式问题
- 可以引用《本草纲目》或《伤寒论》
- 50-80字`;

      case 'encouragement':
        return `你是青木先生。

${baseContext}

${studentMessage ? `学生刚才说："${studentMessage}"` : ''}

任务：给学生一句鼓励的话。

要求：
- 简短有力，20字以内
- 根据学生的表现给予针对性鼓励`;

      case 'correction':
        return `你是青木先生，一位耐心的中医导师。

${baseContext}

${studentMessage ? `学生刚才回答："${studentMessage}"` : ''}

任务：温和地纠正学生的错误并引导思考。

要求：
- 指出错误原因（具体说明哪里错了）
- 给出思考方向（引导学生自己发现正确答案）
- 语气鼓励，不打击学生积极性
- 50-100字`;

      default:
        return `你是青木先生，一位德高望重的中医导师。请指导学生。`;
    }
  }

  private async callAI(
    prompt: string,
    onStream?: (chunk: string) => void,
    conversationHistory?: Array<{role: 'system' | 'user' | 'assistant', content: string}>
  ): Promise<string> {
    if (this.offlineMode) {
      throw new Error('Offline mode');
    }

    // 构建消息历史，保持上下文连贯
    const messages: Array<{role: 'system' | 'user' | 'assistant', content: string}> = [
      {
        role: 'system',
        content: `你是青木先生，一位德高望重的中医导师。

【角色设定】
- 语气温和、耐心，有大家风范
- 善于用苏格拉底式提问引导学生思考
- 使用中医经典术语，引用《伤寒论》《本草纲目》等

【对话要求】
- 回复必须引用或回应学生的前一条消息内容，保持上下文连贯
- 根据学生的理解程度调整引导策略：
  * 学生困惑时：提供具体提示，而非泛泛而谈
  * 学生答错时：指出错误原因，给出思考方向
  * 学生要求答案时：先给出简要答案，再详细讲解原理
- 每次回复控制在50-100字
- 使用"徒儿"、"孩子"等亲切称呼`,
      },
    ];

    // 添加历史对话上下文（如果有）
    if (conversationHistory && conversationHistory.length > 0) {
      messages.push(...conversationHistory);
    }

    // 添加当前提示
    messages.push({ role: 'user', content: prompt });

    const response = await fetch(`${this.config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages,
        stream: !!onStream,
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    if (onStream) {
      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      let fullText = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || '';
              fullText += content;
              onStream(content);
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
      return fullText;
    } else {
      const data = await response.json();
      return data.choices[0].message.content;
    }
  }

  private getOfflineResponse(type: string): MentorMessage {
    const responses: Record<string, { content: string; emotion: MentorMessage['emotion'] }> = {
      greeting: { content: '欢迎来到药灵山谷，我是青木先生。让我们开始今天的学习吧！', emotion: 'happy' },
      guide: { content: '这味药很有趣，你觉得它可能有什么功效呢？', emotion: 'thinking' },
      encouragement: { content: '很好！继续保持。', emotion: 'celebrating' },
      correction: { content: '没关系，再想想，从它的性味入手。', emotion: 'concerned' },
    };

    const response = responses[type] || responses.greeting;

    return {
      id: `offline_${Date.now()}`,
      role: 'mentor',
      content: response.content,
      emotion: response.emotion,
      timestamp: Date.now(),
    };
  }

  private detectEmotion(text: string, type: string): MentorMessage['emotion'] {
    if (type === 'celebrating' || text.includes('！') || text.includes('很好')) {
      return 'celebrating';
    }
    if (text.includes('？') || text.includes('想想')) {
      return 'thinking';
    }
    if (type === 'correction' || text.includes('没关系')) {
      return 'concerned';
    }
    return 'happy';
  }

  setOfflineMode(enabled: boolean): void {
    this.offlineMode = enabled;
  }
}

export const aiMentor = new AIMentorService();

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

  constructor() {
    this.config = {
      apiKey: import.meta.env.VITE_GLM_API_KEY || '',
      baseURL: 'https://api.glm.cn/v1',
      model: 'glm-4',
    };
  }

  async generateResponse(
    context: MentorContext,
    messageType: 'greeting' | 'guide' | 'encouragement' | 'correction',
    onStream?: (chunk: string) => void
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

    const prompt = this.buildPrompt(context, messageType);

    try {
      const response = await this.callAI(prompt, onStream);

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

  private buildPrompt(context: MentorContext, type: string): string {
    switch (type) {
      case 'greeting':
        return this.buildGreetingPrompt(context);
      case 'guide':
        return this.buildGuidePrompt(context);
      case 'encouragement':
        return '请给学生一句鼓励的话，简短有力（20字以内）';
      case 'correction':
        return '学生回答错误，请温和地纠正并引导思考';
      default:
        return '请作为中医导师指导学生';
    }
  }

  private buildGreetingPrompt(context: MentorContext): string {
    return `你是青木先生，一位德高望重的中医导师。请向学生${context.playerName}问好，
介绍本章"${context.chapterTitle}"的学习内容，简要说明本章将要学习的4味药材。
语气温和、亲切，50-80字。`;
  }

  private buildGuidePrompt(context: MentorContext): string {
    const medicine = context.collectedMedicines[context.collectedMedicines.length - 1];
    if (!medicine) {
      return '请引导学生开始采集药材之旅';
    }
    return `学生刚刚采集了${medicine}。请用苏格拉底式提问引导学生思考这味药的功效，
不要直接给答案。提一个启发性问题，30-50字。`;
  }

  private async callAI(prompt: string, onStream?: (chunk: string) => void): Promise<string> {
    if (this.offlineMode) {
      throw new Error('Offline mode');
    }

    const response = await fetch(`${this.config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: '你是青木先生，一位德高望重的中医导师。语气温和、耐心，善于用引导的方式教学。回答简洁，50-100字。',
          },
          { role: 'user', content: prompt },
        ],
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

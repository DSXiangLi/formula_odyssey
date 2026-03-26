/**
 * Question Service
 * 药灵山谷v3.0 智能出题服务
 */

import { aiCache } from './cache';
import { Medicine } from '../../types';

export interface Question {
  id: string;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  difficulty: number;
  type: 'multiple_choice' | 'fill_blank' | 'matching';
}

export class QuestionService {
  private askedQuestions: Set<string> = new Set();

  async generateQuestion(
    medicines: Medicine[],
    difficulty: number,
    questionType: 'name' | 'properties' | 'effects' | 'clinical' = 'multiple_choice'
  ): Promise<Question> {
    const cacheKey = aiCache.generateValidationKey(
      medicines.map(m => m.id).join(','),
      JSON.stringify({ difficulty, type: questionType })
    );

    // Check if already asked
    if (this.askedQuestions.has(cacheKey)) {
      return this.getFallbackQuestion(medicines, difficulty);
    }

    this.askedQuestions.add(cacheKey);

    const prompt = this.buildQuestionPrompt(
      medicines.map(m => m.name),
      questionType,
      difficulty
    );

    try {
      const response = await this.callAI(prompt);
      const parsed = this.parseQuestionResponse(response);

      if (parsed) {
        return {
          ...parsed,
          id: `q_${Date.now()}`,
          difficulty,
          type: 'multiple_choice',
        };
      }
    } catch (e) {
      console.error('Question generation error:', e);
    }

    return this.getFallbackQuestion(medicines, difficulty);
  }

  private buildQuestionPrompt(
    medicineNames: string[],
    type: string,
    difficulty: number
  ): string {
    return `请为中医学习游戏生成一道选择题。

【药材】${medicineNames.join('、')}
【难度】${difficulty}/5
【类型】${type}

请用JSON格式输出：
{
  "question": "问题文本",
  "options": ["选项A", "选项B", "选项C", "选项D"],
  "answer": "正确答案（与选项之一完全匹配）",
  "explanation": "答案解析（30-50字）"
}

要求：
- 题目围绕提供的药材出题
- 难度${difficulty}/5，${difficulty <= 2 ? '简单，直接考查基础知识' : difficulty <= 4 ? '中等，需要理解应用' : '困难，需要综合分析'}
- 选项要有干扰性，但不能过于迷惑
- 只返回JSON，不要有其他文字`;
  }

  private async callAI(prompt: string): Promise<string> {
    const apiKey = import.meta.env.VITE_GLM_API_KEY;

    const response = await fetch('https://api.glm.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'glm-4',
        messages: [
          {
            role: 'system',
            content: '你是一个中医教育专家，擅长生成高质量的中医学习题目。只返回JSON格式，不要其他文字。',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 500,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private parseQuestionResponse(response: string): Omit<Question, 'id' | 'difficulty' | 'type'> | null {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          question: parsed.question,
          options: parsed.options,
          answer: parsed.answer,
          explanation: parsed.explanation,
        };
      }
    } catch (e) {
      console.error('Failed to parse question:', e);
    }
    return null;
  }

  private getFallbackQuestion(medicines: Medicine[], difficulty: number): Question {
    const medicine = medicines[Math.floor(Math.random() * medicines.length)];
    const otherMedicines = medicines.filter(m => m.id !== medicine.id).slice(0, 3);

    const options = [
      medicine.functions[0] || '解表散寒',
      otherMedicines[0]?.functions[0] || '清热解毒',
      otherMedicines[1]?.functions[0] || '活血化瘀',
      otherMedicines[2]?.functions[0] || '补气养血',
    ].sort(() => Math.random() - 0.5);

    const answer = medicine.functions[0] || '解表散寒';

    return {
      id: `fallback_${Date.now()}`,
      question: `以下哪项是${medicine.name}的主要功效？`,
      options,
      answer: options.find(opt => opt === answer) || options[0],
      explanation: `${medicine.name}属于${medicine.category}，主要功效是${medicine.functions[0]}`,
      difficulty,
      type: 'multiple_choice',
    };
  }

  resetAskedQuestions(): void {
    this.askedQuestions.clear();
  }
}

export const questionService = new QuestionService();

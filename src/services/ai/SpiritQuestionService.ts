/**
 * Spirit Question Service
 * 药灵山谷v3.0 药灵提问与答案评判服务
 *
 * 使用GLM-4生成开放式问题和评判答案
 * 支持4种题型：recall（回忆型）、judge（判断型）、choice（选择型）、free（自由型）
 */

import { AICacheManager } from './cache';
import { Medicine } from '../../types';
import { SpiritQuestion, AnswerEvaluation } from '../../systems/battle/types';

// 问题生成参数
export interface GenerateQuestionParams {
  medicine: Medicine;
  type: 'recall' | 'judge' | 'choice' | 'free';
  difficulty: number; // 1-5
  knowledgeType: 'name' | 'properties' | 'effects' | 'formula';
}

// 答案评判参数
export interface EvaluateAnswerParams {
  question: SpiritQuestion;
  userAnswer: string;
  medicine: Medicine;
}

// 题型配置
export interface QuestionTypeConfig {
  type: 'recall' | 'judge' | 'choice' | 'free';
  weight: number; // 权重，用于批量生成时的比例
}

// 批量生成参数
export interface GenerateQuestionsBatchParams {
  medicines: Medicine[];
  types: QuestionTypeConfig[];
  questionsPerMedicine?: number;
}

export class SpiritQuestionService {
  private readonly API_URL = 'https://api.glm.cn/v1/chat/completions';
  private readonly API_KEY = import.meta.env.VITE_GLM_API_KEY || '';
  private askedQuestions: Set<string> = new Set();
  private cache: AICacheManager;

  constructor() {
    this.cache = new AICacheManager();
  }

  /**
   * 生成单个问题
   * 使用药灵口吻提问，营造与药灵对话的氛围
   */
  async generateQuestion(
    params: GenerateQuestionParams
  ): Promise<SpiritQuestion> {
    const cacheKey = AICacheManager.generateQuestionKey(
      params.difficulty,
      params.medicine.id,
      [params.type, params.knowledgeType]
    );

    // 检查是否已问过
    if (this.askedQuestions.has(cacheKey)) {
      return this.getFallbackQuestion(params);
    }

    // 检查缓存
    const cached = this.cache.questionCache.get(cacheKey) as
      | SpiritQuestion
      | undefined;
    if (cached) {
      this.askedQuestions.add(cacheKey);
      return cached;
    }

    try {
      const prompt = this.buildQuestionPrompt(params);
      const response = await this.callAI(prompt);
      const parsed = this.parseQuestionResponse(response, params);

      if (parsed) {
        this.askedQuestions.add(cacheKey);
        this.cache.questionCache.set(cacheKey, parsed);
        return parsed;
      }
    } catch (e) {
      console.error('Question generation error:', e);
    }

    return this.getFallbackQuestion(params);
  }

  /**
   * 评判用户答案
   * 使用1-5分评分系统，AI根据语义判断答案正确性
   */
  async evaluateAnswer(
    params: EvaluateAnswerParams
  ): Promise<AnswerEvaluation> {
    const cacheKey = AICacheManager.generateValidationKey(
      params.question.question,
      params.userAnswer
    );

    // 检查缓存
    const cached = this.cache.validationCache.get(cacheKey) as
      | AnswerEvaluation
      | undefined;
    if (cached) {
      return cached;
    }

    try {
      const prompt = this.buildEvaluationPrompt(params);
      const response = await this.callAI(prompt);
      const parsed = this.parseEvaluationResponse(response);

      if (parsed) {
        this.cache.validationCache.set(cacheKey, parsed);
        return parsed;
      }
    } catch (e) {
      console.error('Answer evaluation error:', e);
    }

    return this.getFallbackEvaluation(params);
  }

  /**
   * 批量生成问题
   * 用于预先生成章节的所有问题，避免战斗中等待API
   */
  async generateQuestionsBatch(
    medicines: Medicine[],
    types: QuestionTypeConfig[]
  ): Promise<SpiritQuestion[]> {
    const questions: SpiritQuestion[] = [];
    const questionsPerMedicine = 2; // 每个药材生成2个问题

    for (const medicine of medicines) {
      for (let i = 0; i < questionsPerMedicine; i++) {
        // 根据权重随机选择题型
        const type = this.selectQuestionType(types);
        const knowledgeType = this.selectKnowledgeType();

        const params: GenerateQuestionParams = {
          medicine,
          type,
          difficulty: this.calculateDifficulty(medicine),
          knowledgeType,
        };

        try {
          const question = await this.generateQuestion(params);
          questions.push(question);

          // 添加延迟避免速率限制
          if (i < questionsPerMedicine - 1 || medicines.indexOf(medicine) < medicines.length - 1) {
            await this.delay(500);
          }
        } catch (e) {
          console.error(`Failed to generate question for ${medicine.name}:`, e);
          // 使用fallback问题
          const fallback = this.getFallbackQuestion(params);
          questions.push(fallback);
        }
      }
    }

    return questions;
  }

  /**
   * 重置已提问记录
   * 通常在战斗结束后调用，允许重新生成问题
   */
  resetAskedQuestions(): void {
    this.askedQuestions.clear();
  }

  /**
   * 获取缓存统计
   */
  getCacheStats() {
    return this.cache.getAllStats();
  }

  // ========== 私有方法 ==========

  private buildQuestionPrompt(params: GenerateQuestionParams): string {
    const { medicine, type, difficulty, knowledgeType } = params;

    const typeDescriptions: Record<string, string> = {
      recall: '回忆型 - 药灵忘记了自己的某个属性，需要玩家帮助回忆',
      judge: '判断型 - 药灵对某个说法表示怀疑，需要玩家判断真假',
      choice: '选择型 - 药灵给出几个选项，让玩家选择正确的',
      free: '自由型 - 开放式问题，让玩家自由回答',
    };

    const knowledgeDescriptions: Record<string, string> = {
      name: '药材名称、别名等',
      properties: '四气五味、归经、升降浮沉等属性',
      effects: '功效、主治、临床应用等',
      formula: '所属方剂、配伍应用等',
    };

    const spiritTones = [
      '我记不清了，你能告诉我吗？',
      '听说我...是真的吗？',
      '你能帮我确认一下吗？',
      '我忘记自己的...了，你知道吗？',
    ];

    const tone = spiritTones[Math.floor(Math.random() * spiritTones.length)];

    return `请为中医学习游戏生成一道药灵提问。

【药灵信息】
- 名称：${medicine.name}
- 拼音：${medicine.pinyin}
- 四气：${medicine.fourQi}
- 五味：${medicine.fiveFlavors.join('、')}
- 归经：${medicine.meridians.join('、')}
- 功效：${medicine.functions.join('、')}
- 主治：${medicine.indications.slice(0, 2).join('、')}

【题目要求】
- 题型：${typeDescriptions[type]}
- 难度：${difficulty}/5
- 知识类型：${knowledgeDescriptions[knowledgeType]}
- 语气：药灵口吻，开头可用"${tone}"

请用JSON格式输出：
{
  "id": "q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}",
  "type": "${type}",
  "question": "药灵口吻的问题文本（20-50字）",
  "options": ${type === 'choice' ? '["选项A", "选项B", "选项C", "选项D"]' : 'null'},
  "acceptableAnswers": ["可接受的答案1", "可接受的答案2", "同义词"],
  "hint": "提示信息（10-20字，药灵口吻）",
  "knowledgeType": "${knowledgeType}"
}

要求：
- 问题要用药灵的口吻，可爱、生动
- ${difficulty <= 2 ? '简单，直接考查基础知识' : difficulty <= 4 ? '中等，需要理解应用' : '困难，需要综合分析'}
- 可接受答案要包含关键词的同义表达
- 只返回JSON，不要有其他文字`;
  }

  private buildEvaluationPrompt(params: EvaluateAnswerParams): string {
    const { question, userAnswer, medicine } = params;

    const spiritFeedback: Record<number, string> = {
      5: '谢谢你！我想起来了，原来是这样！你真聪明！',
      4: '嗯嗯，差不多对了！谢谢你提醒我~',
      3: '好像是这么回事...不过我还需要再想想。',
      2: '不太对哦...不过很接近了，再想想？',
      1: '不对哦...我印象中不是这样的。',
    };

    return `请评判玩家对药灵问题的回答。

【药灵信息】
- 名称：${medicine.name}
- 四气：${medicine.fourQi}
- 五味：${medicine.fiveFlavors.join('、')}
- 归经：${medicine.meridians.join('、')}
- 功效：${medicine.functions.join('、')}

【问题】
${question.question}

【可接受答案】
${question.acceptableAnswers.join('、')}

【玩家回答】
${userAnswer}

请用JSON格式输出评分结果：
{
  "score": ${question.type === 'free' ? '1-5的整数（语义匹配度）' : '1或5（判断对错）'},
  "isCorrect": ${question.type === 'free' ? 'score >= 3' : 'score === 5'},
  "feedback": "药灵口吻的反馈（用spiritFeedback中${question.type === 'free' ? '对应分数' : '5或1'}的语气）",
  "bonusInfo": "可选的补充知识（20-30字）"
}

评分标准：
- 5分：完全正确，语义完全匹配
- 4分：基本正确，有小瑕疵
- 3分：部分正确，需要补充
- 2分：方向对但不准确
- 1分：错误或无关联

要求：
- feedback要用药灵口吻，可爱、生动
- bonusInfo提供有趣的中医小知识（可选）
- 只返回JSON，不要有其他文字`;
  }

  private async callAI(prompt: string): Promise<string> {
    const response = await fetch(this.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.API_KEY}`,
      },
      body: JSON.stringify({
        model: 'glm-4',
        messages: [
          {
            role: 'system',
            content: '你是一个中医知识丰富的AI，擅长以药灵的口吻与玩家互动。只返回JSON格式，不要其他文字。',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 800,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private parseQuestionResponse(
    response: string,
    params: GenerateQuestionParams
  ): SpiritQuestion | null {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          id: parsed.id || `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: parsed.type as 'recall' | 'judge' | 'choice' | 'free',
          question: parsed.question,
          options: parsed.options,
          acceptableAnswers: parsed.acceptableAnswers || [],
          hint: parsed.hint,
          knowledgeType: parsed.knowledgeType as 'name' | 'properties' | 'effects' | 'formula',
        };
      }
    } catch (e) {
      console.error('Failed to parse question response:', e);
    }
    return null;
  }

  private parseEvaluationResponse(response: string): AnswerEvaluation | null {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const score = Math.min(5, Math.max(1, Math.round(parsed.score))) as 1 | 2 | 3 | 4 | 5;
        return {
          score,
          isCorrect: parsed.isCorrect ?? score >= 3,
          feedback: parsed.feedback,
          bonusInfo: parsed.bonusInfo,
        };
      }
    } catch (e) {
      console.error('Failed to parse evaluation response:', e);
    }
    return null;
  }

  private getFallbackQuestion(
    params: GenerateQuestionParams
  ): SpiritQuestion {
    const { medicine, type, knowledgeType } = params;

    const fallbackQuestions: Record<string, Partial<SpiritQuestion>> = {
      name: {
        question: `我记不清自己的名字了，你能告诉我${medicine.name}还有什么别名吗？`,
        acceptableAnswers: [medicine.name, medicine.pinyin, ...medicine.name.split('')],
        hint: '我的本名是两个字哦~',
      },
      properties: {
        question: `我忘记自己的属性了，你能告诉我我的四气五味吗？`,
        acceptableAnswers: [
          medicine.fourQi,
          ...medicine.fiveFlavors,
          `${medicine.fourQi}，${medicine.fiveFlavors.join('、')}`,
        ],
        hint: `我的四气是${medicine.fourQi}哦~`,
      },
      effects: {
        question: `听说我能治病，但是我不记得治什么了，你能告诉我吗？`,
        acceptableAnswers: medicine.functions,
        hint: `我可以${medicine.functions[0].slice(0, 10)}...`,
      },
      formula: {
        question: `我常常和其他药材一起出现在方剂里，你知道我最常和谁搭配吗？`,
        acceptableAnswers: medicine.indications.slice(0, 3),
        hint: '我在很多解表方剂里都有出现~',
      },
    };

    const fallback = fallbackQuestions[knowledgeType];
    return {
      id: `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      question: fallback?.question || `关于${medicine.name}，你知道些什么？`,
      options: type === 'choice' ? ['A', 'B', 'C', 'D'] : undefined,
      acceptableAnswers: fallback?.acceptableAnswers || [medicine.name],
      hint: fallback?.hint || '好好想想哦~',
      knowledgeType,
    };
  }

  private getFallbackEvaluation(
    params: EvaluateAnswerParams
  ): AnswerEvaluation {
    const { question, userAnswer } = params;

    // 简单的字符串匹配作为fallback评判
    const normalizedAnswer = userAnswer.toLowerCase().trim();
    const isMatch = question.acceptableAnswers.some(
      (ans) =>
        normalizedAnswer.includes(ans.toLowerCase()) ||
        ans.toLowerCase().includes(normalizedAnswer)
    );

    if (isMatch) {
      return {
        score: 5,
        isCorrect: true,
        feedback: '谢谢你！我想起来了，原来是这样！你真聪明！',
        bonusInfo: '答对了！继续保持哦~',
      };
    }

    // 部分匹配
    const partialMatch = question.acceptableAnswers.some((ans) => {
      const ansWords = ans.split(/[，、；;]/);
      return ansWords.some((word) => normalizedAnswer.includes(word.toLowerCase()));
    });

    if (partialMatch) {
      return {
        score: 3,
        isCorrect: true,
        feedback: '好像是这么回事...不过我还需要再想想。',
        bonusInfo: '接近了，但还不够完整~',
      };
    }

    return {
      score: 1,
      isCorrect: false,
      feedback: '不对哦...我印象中不是这样的。',
      bonusInfo: '别灰心，再试试看！',
    };
  }

  private selectQuestionType(
    types: QuestionTypeConfig[]
  ): 'recall' | 'judge' | 'choice' | 'free' {
    const totalWeight = types.reduce((sum, t) => sum + t.weight, 0);
    let random = Math.random() * totalWeight;

    for (const type of types) {
      random -= type.weight;
      if (random <= 0) {
        return type.type;
      }
    }

    return types[0]?.type || 'recall';
  }

  private selectKnowledgeType(): 'name' | 'properties' | 'effects' | 'formula' {
    const types: ('name' | 'properties' | 'effects' | 'formula')[] = [
      'name',
      'properties',
      'effects',
      'formula',
    ];
    return types[Math.floor(Math.random() * types.length)];
  }

  private calculateDifficulty(medicine: Medicine): number {
    // 根据药材属性计算难度
    let difficulty = 3;

    // 功效数量越多，难度越高
    if (medicine.functions.length > 5) difficulty += 1;

    // 有毒性的药材难度更高
    if (medicine.toxicity && medicine.toxicity !== '无毒') difficulty += 1;

    // 归经越多，难度越高
    if (medicine.meridians.length > 3) difficulty += 0.5;

    return Math.min(5, Math.max(1, Math.round(difficulty)));
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// 单例导出
export const spiritQuestionService = new SpiritQuestionService();

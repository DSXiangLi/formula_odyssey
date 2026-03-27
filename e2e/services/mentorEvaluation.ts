/**
 * AI Mentor Evaluation Service
 * Phase 4 AI导师系统质量评估服务
 */

import * as fs from 'fs';
import * as path from 'path';

// 评价结果类型
export interface MentorEvaluationResult {
  dimension: string;
  subDimension: string;
  score: number;
  maxScore: number;
  feedback: string;
  issues: string[];
  suggestions: string[];
}

export interface ConversationEvaluation {
  conversationId: string;
  totalScore: number;
  maxScore: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  dimensions: MentorEvaluationResult[];
  summary: string;
  transcript: DialogueTurn[];
  timestamp: number;
}

export interface DialogueTurn {
  round: number;
  speaker: 'mentor' | 'student';
  content: string;
  emotion?: string;
  evaluationNotes?: string;
}

// AI导师评价服务
export class AIMentorEvaluationService {
  private apiKey: string;
  private baseURL: string;
  private modelName: string;

  constructor() {
    this.apiKey = (process.env.GLM_EVAL_KEY || process.env.VITE_GLM_API_KEY || '').replace(/^"|"$/g, '');
    this.baseURL = (process.env.GLM_EVAL_URL || 'https://api.glm.cn/v1').replace(/^"|"$/g, '');
    this.modelName = (process.env.GLM_EVAL_MODEL || 'glm-4').replace(/^"|"$/g, '');
  }

  /**
   * 评估完整对话质量
   */
  async evaluateConversation(
    transcript: DialogueTurn[],
    context: {
      chapterId: string;
      chapterTitle: string;
      testScenario: string;
    }
  ): Promise<ConversationEvaluation> {
    const dimensions: MentorEvaluationResult[] = [];

    // 评估各个维度
    dimensions.push(await this.evaluateContextCoherence(transcript));
    dimensions.push(await this.evaluateTeachingLogic(transcript));
    dimensions.push(await this.evaluateRoleConsistency(transcript));
    dimensions.push(await this.evaluateExpressionVitality(transcript));
    dimensions.push(await this.evaluateSocraticGuidance(transcript));
    dimensions.push(await this.evaluateKnowledgeAccuracy(transcript, context));
    dimensions.push(await this.evaluateLearningAdaptability(transcript, context));

    // 计算总分
    const totalScore = dimensions.reduce((sum, d) => sum + d.score, 0);
    const maxScore = dimensions.reduce((sum, d) => sum + d.maxScore, 0);
    const grade = this.calculateGrade(totalScore, maxScore);

    return {
      conversationId: `conv_${Date.now()}`,
      totalScore,
      maxScore,
      grade,
      dimensions,
      summary: await this.generateSummary(dimensions, transcript),
      transcript,
      timestamp: Date.now(),
    };
  }

  /**
   * A1. 评估上下文连贯性
   */
  private async evaluateContextCoherence(
    transcript: DialogueTurn[]
  ): Promise<MentorEvaluationResult> {
    const prompt = `请评估以下AI导师对话的上下文连贯性。

对话记录：
${this.formatTranscript(transcript)}

评估标准（满分10分）：
1. 多轮对话是否保持上下文（AI是否引用前文内容）- 4分
2. 话题是否逐步深入（从简单到复杂）- 3分
3. 是否自然承接学生的回答 - 3分

请以JSON格式返回：
{
  "score": 0-10,
  "feedback": "具体评价",
  "issues": ["问题1", "问题2"],
  "suggestions": ["建议1", "建议2"]
}`;

    return this.callEvaluationAI(prompt, 'A1', '上下文连贯性', 10);
  }

  /**
   * A2. 评估教学逻辑性
   */
  private async evaluateTeachingLogic(
    transcript: DialogueTurn[]
  ): Promise<MentorEvaluationResult> {
    const prompt = `请评估以下AI导师对话的教学逻辑性。

对话记录：
${this.formatTranscript(transcript)}

评估标准（满分10分）：
1. 是否遵循认知规律（观察→思考→验证）- 4分
2. 逻辑是否严密，层层递进 - 3分
3. 是否符合中医学习路径 - 3分

请以JSON格式返回：
{
  "score": 0-10,
  "feedback": "具体评价",
  "issues": ["问题1", "问题2"],
  "suggestions": ["建议1", "建议2"]
}`;

    return this.callEvaluationAI(prompt, 'A2', '教学逻辑性', 10);
  }

  /**
   * A3. 评估角色一致性
   */
  private async evaluateRoleConsistency(
    transcript: DialogueTurn[]
  ): Promise<MentorEvaluationResult> {
    const prompt = `请评估以下AI导师是否保持"青木先生"角色一致性。

对话记录：
${this.formatTranscript(transcript)}

角色特征检查（满分10分）：
1. 是否使用"徒儿"、"师弟"等称呼 - 2分
2. 是否引用《伤寒论》《本草纲目》等经典 - 2分
3. 是否使用"为师"、"老朽"等自称 - 2分
4. 语气温和但专业 - 2分
5. 是否有中医大家风范 - 2分

请以JSON格式返回：
{
  "score": 0-10,
  "feedback": "具体评价",
  "issues": ["问题1", "问题2"],
  "suggestions": ["建议1", "建议2"]
}`;

    return this.callEvaluationAI(prompt, 'A3', '角色一致性', 10);
  }

  /**
   * A4. 评估表达生动性
   */
  private async evaluateExpressionVitality(
    transcript: DialogueTurn[]
  ): Promise<MentorEvaluationResult> {
    const prompt = `请评估以下AI导师表达的生动性。

对话记录：
${this.formatTranscript(transcript)}

评估标准（满分10分）：
1. 是否有故事化场景引入 - 3分
2. 是否使用比喻、类比等修辞 - 3分
3. 是否有画面感描述（如"谷中草庐"、"病人"）- 2分
4. 是否引人入胜，有趣味性 - 2分

请以JSON格式返回：
{
  "score": 0-10,
  "feedback": "具体评价",
  "issues": ["问题1", "问题2"],
  "suggestions": ["建议1", "建议2"]
}`;

    return this.callEvaluationAI(prompt, 'A4', '表达生动性', 10);
  }

  /**
   * B1. 评估苏格拉底引导
   */
  private async evaluateSocraticGuidance(
    transcript: DialogueTurn[]
  ): Promise<MentorEvaluationResult> {
    const prompt = `请评估以下AI导师的苏格拉底式引导效果。

对话记录：
${this.formatTranscript(transcript)}

评估标准（满分15分）：
1. 学生答错时，是否引导思考而非直接纠正 - 4分
2. 学生仍困惑时，是否提供更多提示 - 3分
3. 学生要求答案时，是否给出答案+详细讲解 - 4分
4. 是否识别错误原因（概念混淆/记忆错误/理解偏差）- 2分
5. 引导是否有针对性 - 2分

请以JSON格式返回：
{
  "score": 0-15,
  "feedback": "具体评价",
  "issues": ["问题1", "问题2"],
  "suggestions": ["建议1", "建议2"]
}`;

    return this.callEvaluationAI(prompt, 'B1', '苏格拉底引导', 15);
  }

  /**
   * B2. 评估知识点准确性
   */
  private async evaluateKnowledgeAccuracy(
    transcript: DialogueTurn[],
    context: { chapterId: string; chapterTitle: string }
  ): Promise<MentorEvaluationResult> {
    const prompt = `请评估以下AI导师的知识准确性。

章节信息：${context.chapterTitle}
对话记录：
${this.formatTranscript(transcript)}

评估标准（满分10分）：
1. 药材性味归经是否准确 - 3分
2. 方剂君臣佐使是否正确 - 3分
3. 经典引用是否真实存在 - 2分
4. 病案辨证是否符合中医理论 - 2分

请以JSON格式返回：
{
  "score": 0-10,
  "feedback": "具体评价",
  "issues": ["问题1", "问题2"],
  "suggestions": ["建议1", "建议2"]
}`;

    return this.callEvaluationAI(prompt, 'B2', '知识点准确性', 10);
  }

  /**
   * B3. 评估学习适应性
   */
  private async evaluateLearningAdaptability(
    transcript: DialogueTurn[],
    context: { chapterId: string; chapterTitle: string }
  ): Promise<MentorEvaluationResult> {
    const prompt = `请评估以下AI导师的学习适应性。

章节信息：${context.chapterTitle}
对话记录：
${this.formatTranscript(transcript)}

评估标准（满分10分）：
1. 问题难度是否符合章节进度 - 3分
2. 是否基于已学内容出题 - 3分
3. 是否适配学生当前水平 - 2分
4. 是否有循序渐进 - 2分

请以JSON格式返回：
{
  "score": 0-10,
  "feedback": "具体评价",
  "issues": ["问题1", "问题2"],
  "suggestions": ["建议1", "建议2"]
}`;

    return this.callEvaluationAI(prompt, 'B3', '学习适应性', 10);
  }

  /**
   * 调用评估AI
   */
  private async callEvaluationAI(
    prompt: string,
    dimensionCode: string,
    dimensionName: string,
    maxScore: number
  ): Promise<MentorEvaluationResult> {
    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.modelName,
          messages: [
            {
              role: 'system',
              content: '你是专业的教育AI评估专家，擅长评估AI导师的教学质量和对话效果。',
            },
            { role: 'user', content: prompt },
          ],
          max_tokens: 800,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      // 解析JSON结果
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return {
          dimension: dimensionCode,
          subDimension: dimensionName,
          score: Math.min(result.score, maxScore),
          maxScore,
          feedback: result.feedback,
          issues: result.issues || [],
          suggestions: result.suggestions || [],
        };
      }

      throw new Error('Failed to parse evaluation result');
    } catch (error) {
      console.error(`Evaluation failed for ${dimensionName}:`, error);
      return {
        dimension: dimensionCode,
        subDimension: dimensionName,
        score: 0,
        maxScore,
        feedback: '评估失败',
        issues: [(error as Error).message],
        suggestions: ['请检查API配置'],
      };
    }
  }

  /**
   * 格式化对话记录
   */
  private formatTranscript(transcript: DialogueTurn[]): string {
    return transcript
      .map(
        (turn) =>
          `[${turn.speaker === 'mentor' ? '青木先生' : '学生'}]: ${turn.content}`
      )
      .join('\n');
  }

  /**
   * 计算等级
   */
  private calculateGrade(score: number, maxScore: number): 'S' | 'A' | 'B' | 'C' | 'D' {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'S';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    return 'D';
  }

  /**
   * 生成评估总结
   */
  private async generateSummary(
    dimensions: MentorEvaluationResult[],
    transcript: DialogueTurn[]
  ): Promise<string> {
    const prompt = `请基于以下评估结果生成一段总结。

各维度得分：
${dimensions.map((d) => `${d.subDimension}: ${d.score}/${d.maxScore}`).join('\n')}

主要问题：
${dimensions.flatMap((d) => d.issues).slice(0, 5).join('\n')}

请以简洁的语言总结AI导师的表现，包括优点和需要改进的地方。`;

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.modelName,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 300,
          temperature: 0.5,
        }),
      });

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      return '总结生成失败';
    }
  }

  /**
   * 保存评估报告
   */
  saveEvaluationReport(
    evaluation: ConversationEvaluation,
    outputDir: string = './e2e/reports'
  ): string {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filename = `mentor-eval-${evaluation.conversationId}.json`;
    const filepath = path.join(outputDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(evaluation, null, 2), 'utf-8');

    return filepath;
  }
}

export default AIMentorEvaluationService;

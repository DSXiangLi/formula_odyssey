import * as fs from 'fs';
import { AIVisionResult, DesignRequirement } from '../types';

export class AIVisionService {
  private apiKey: string;
  private baseURL: string;
  private modelName: string;

  constructor() {
    this.apiKey = process.env.QWEN_VL_KEY || '';
    this.baseURL = process.env.QWEN_VL_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
    this.modelName = process.env.QWEN_VL_MODEL_NAME || 'qwen-vl-max';
  }

  async analyzeScreenshot(
    screenshotPath: string,
    requirement: DesignRequirement
  ): Promise<AIVisionResult> {
    const imageBase64 = fs.readFileSync(screenshotPath, 'base64');

    const prompt = this.buildPrompt(requirement);

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.modelName,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                {
                  type: 'image_url',
                  image_url: { url: `data:image/png;base64,${imageBase64}` }
                }
              ]
            }
          ]
        })
      });

      const data = await response.json();
      return this.parseAIResponse(data.choices[0].message.content);
    } catch (error) {
      console.error('AI Vision API error:', error);
      return {
        passed: false,
        score: 0,
        issues: [`API error: ${(error as Error).message}`],
        suggestions: [],
      };
    }
  }

  private buildPrompt(requirement: DesignRequirement): string {
    return `你是一位专业的游戏UI/UX验收专家。请严格分析这张游戏截图，并根据以下设计规范进行详细评估：

**验收项目**: ${requirement.name}
**规范要求**:
${requirement.criteria.map(c => `- ${c}`).join('\n')}

**评估维度**（请逐项检查并给出具体分数）：
1. 视觉呈现是否符合中医药风格（古典、雅致、五行元素）- 25分
2. 布局是否合理，元素是否对齐 - 20分
3. 色彩搭配是否和谐且符合主题 - 25分
4. 文字是否清晰可读 - 15分
5. 交互元素是否明确可识别 - 15分

**评分标准**（85分以上才算通过）：
- 90-100分：优秀，完全符合设计规范
- 85-89分：良好，基本符合但有轻微瑕疵
- 70-84分：及格，有明显问题需要改进
- 70分以下：不及格，需要重新设计

请以JSON格式返回详细评估结果：
{
  "passed": boolean,      // 总分>=85才算通过
  "score": number,        // 0-100分
  "dimensionScores": {    // 各维度得分
    "themeStyle": number,
    "layout": number,
    "color": number,
    "text": number,
    "interaction": number
  },
  "issues": string[],     // 具体问题列表（必须详细）
  "suggestions": string[] // 改进建议（必须可操作）
}`;
  }

  private parseAIResponse(content: string): AIVisionResult {
    try {
      // 提取JSON部分
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No JSON found in response');
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return {
        passed: false,
        score: 0,
        issues: ['Failed to parse AI response'],
        suggestions: [content],
      };
    }
  }
}

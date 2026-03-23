import * as fs from 'fs';
import { AIVisionResult, DesignRequirement } from '../types';

export class AIVisionService {
  private apiKey: string;
  private baseURL: string;

  constructor() {
    this.apiKey = process.env.DASHSCOPE_API_KEY || '';
    this.baseURL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation';
  }

  async analyzeScreenshot(
    screenshotPath: string,
    requirement: DesignRequirement
  ): Promise<AIVisionResult> {
    const imageBase64 = fs.readFileSync(screenshotPath, 'base64');

    const prompt = this.buildPrompt(requirement);

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'qwen-vl-max',
          input: {
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
          }
        })
      });

      const data = await response.json();
      return this.parseAIResponse(data.output.choices[0].message.content);
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
    return `你是一位专业的游戏UI/UX验收专家。请分析这张游戏截图，并根据以下设计规范进行评估：

**验收项目**: ${requirement.name}
**规范要求**:
${requirement.criteria.map(c => `- ${c}`).join('\n')}

**评估维度**:
1. 视觉呈现是否符合中医药风格（古典、雅致、五行元素）
2. 布局是否合理，元素是否对齐
3. 色彩搭配是否和谐
4. 文字是否清晰可读
5. 交互元素是否明确可识别

请以JSON格式返回评估结果：
{
  "passed": boolean,      // 是否通过验收
  "score": number,        // 0-100分
  "issues": string[],     // 发现的问题列表
  "suggestions": string[] // 改进建议
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

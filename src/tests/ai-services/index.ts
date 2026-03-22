/**
 * AI服务集成模块
 * 封装Qwen-VL（视觉验证）和GLM-4V（逻辑判断）API调用
 */

interface AIValidationResult {
  passed: boolean;
  confidence: number;
  analysis: string;
  issues: string[];
  suggestions: string[];
}

interface VisualValidationRequest {
  screenshot: string; // base64
  expectedElements?: string[];
  layoutRules?: string[];
  styleChecks?: {
    colors?: string[];
    fonts?: string[];
    spacing?: boolean;
  };
}

interface LogicValidationRequest {
  screenshot: string;
  userAction: string;
  expectedOutcome: string;
  gameState?: Record<string, unknown>;
}

/**
 * Qwen-VL视觉验证服务
 * 用于验证UI布局、动画效果、图片质量
 */
export class QwenVLService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.DASHSCOPE_API_KEY || '';
    this.baseUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation';
  }

  /**
   * 验证UI布局是否符合设计规范
   */
  async validateLayout(request: VisualValidationRequest): Promise<AIValidationResult> {
    const prompt = this.buildLayoutPrompt(request);

    try {
      const response = await fetch(this.baseUrl, {
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
                  { type: 'image', image: request.screenshot },
                ],
              },
            ],
          },
        }),
      });

      const data = await response.json();
      return this.parseValidationResponse(data.output?.choices?.[0]?.message?.content || '');
    } catch (error) {
      return {
        passed: false,
        confidence: 0,
        analysis: `API调用失败: ${error}`,
        issues: ['AI服务调用失败'],
        suggestions: ['检查API密钥和网络连接'],
      };
    }
  }

  /**
   * 验证动画效果
   */
  async validateAnimation(
    screenshots: string[],
    animationDescription: string
  ): Promise<AIValidationResult> {
    const prompt = `作为游戏UI测试专家，请分析这组截图中的动画效果。

动画描述：${animationDescription}

请评估：
1. 动画是否流畅，有无卡顿
2. 动画时序是否正确
3. 元素运动轨迹是否符合预期
4. 有无视觉异常（闪烁、跳变等）

请以JSON格式返回：
{
  "passed": true/false,
  "confidence": 0-100,
  "analysis": "详细分析",
  "issues": ["问题1", "问题2"],
  "suggestions": ["建议1"]
}`;

    try {
      const content = screenshots.map((s, i) => [
        { type: 'text', text: `第${i + 1}帧:` },
        { type: 'image', image: s },
      ]).flat();

      const response = await fetch(this.baseUrl, {
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
                  ...content,
                ],
              },
            ],
          },
        }),
      });

      const data = await response.json();
      return this.parseValidationResponse(data.output?.choices?.[0]?.message?.content || '');
    } catch (error) {
      return {
        passed: false,
        confidence: 0,
        analysis: `API调用失败: ${error}`,
        issues: ['AI服务调用失败'],
        suggestions: ['检查API密钥和网络连接'],
      };
    }
  }

  /**
   * 验证图片质量（药物图片、场景背景）
   */
  async validateImageQuality(
    image: string,
    expectedType: 'medicine' | 'scene' | 'character',
    requirements: string[]
  ): Promise<AIValidationResult> {
    const typeDescriptions = {
      medicine: '中药材图片，需要验证：1)是否符合中药特征 2)画风是否统一 3)是否有明显AI生成痕迹',
      scene: '游戏场景背景，需要验证：1)是否符合五行主题 2)氛围是否正确 3)层次感和景深',
      character: '角色/药灵图片，需要验证：1)风格一致性 2)细节完整性 3)东方美学表现',
    };

    const prompt = `作为游戏美术测试专家，请验证这张图片的质量。

图片类型：${typeDescriptions[expectedType]}

特殊要求：
${requirements.map(r => `- ${r}`).join('\n')}

请以JSON格式返回：
{
  "passed": true/false,
  "confidence": 0-100,
  "analysis": "详细分析",
  "issues": ["问题1", "问题2"],
  "suggestions": ["建议1"]
}`;

    try {
      const response = await fetch(this.baseUrl, {
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
                  { type: 'image', image },
                ],
              },
            ],
          },
        }),
      });

      const data = await response.json();
      return this.parseValidationResponse(data.output?.choices?.[0]?.message?.content || '');
    } catch (error) {
      return {
        passed: false,
        confidence: 0,
        analysis: `API调用失败: ${error}`,
        issues: ['AI服务调用失败'],
        suggestions: ['检查API密钥和网络连接'],
      };
    }
  }

  private buildLayoutPrompt(request: VisualValidationRequest): string {
    return `作为UI测试专家，请验证这张游戏截图的UI布局。

需要验证的元素：
${request.expectedElements?.map(e => `- ${e}`).join('\n') || '- 所有可见UI元素'}

布局规则：
${request.layoutRules?.map(r => `- ${r}`).join('\n') || '- 对齐正确，无重叠，间距合理'}

样式检查：
${request.styleChecks?.colors ? `- 颜色方案: ${request.styleChecks.colors.join(', ')}` : ''}
${request.styleChecks?.fonts ? `- 字体使用: ${request.styleChecks.fonts.join(', ')}` : ''}
${request.styleChecks?.spacing ? '- 间距一致性' : ''}

请以JSON格式返回：
{
  "passed": true/false,
  "confidence": 0-100,
  "analysis": "详细分析说明",
  "issues": ["发现的问题1", "问题2"],
  "suggestions": ["改进建议1"]
}`;
  }

  private parseValidationResponse(content: string): AIValidationResult {
    try {
      // 尝试从响应中提取JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return {
          passed: result.passed ?? false,
          confidence: result.confidence ?? 0,
          analysis: result.analysis ?? content,
          issues: result.issues || [],
          suggestions: result.suggestions || [],
        };
      }
    } catch {
      // JSON解析失败，使用文本响应
    }

    // 回退到简单分析
    const passed = content.toLowerCase().includes('通过') ||
                   content.toLowerCase().includes('passed: true') ||
                   !content.toLowerCase().includes('失败');

    return {
      passed,
      confidence: passed ? 80 : 20,
      analysis: content,
      issues: passed ? [] : ['AI检测到潜在问题'],
      suggestions: ['请人工复核'],
    };
  }
}

/**
 * GLM-4V逻辑判断服务
 * 用于验证游戏逻辑、数据流、用户操作流程
 */
export class GLM4VService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.GLM_API_KEY || '';
    this.baseUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
  }

  /**
   * 验证游戏逻辑状态
   */
  async validateGameLogic(request: LogicValidationRequest): Promise<AIValidationResult> {
    const prompt = `作为游戏测试专家，请分析这个测试场景的逻辑正确性。

用户操作：${request.userAction}

预期结果：${request.expectedOutcome}

当前游戏状态：
${JSON.stringify(request.gameState || {}, null, 2)}

请验证：
1. 操作后界面状态是否符合预期
2. 数据变化是否正确（货币、进度等）
3. 游戏逻辑是否符合设计

请以JSON格式返回：
{
  "passed": true/false,
  "confidence": 0-100,
  "analysis": "详细分析",
  "issues": ["问题1"],
  "suggestions": ["建议1"]
}`;

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'glm-4v',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: `data:image/png;base64,${request.screenshot}` } },
              ],
            },
          ],
        }),
      });

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      return this.parseValidationResponse(content);
    } catch (error) {
      return {
        passed: false,
        confidence: 0,
        analysis: `API调用失败: ${error}`,
        issues: ['AI服务调用失败'],
        suggestions: ['检查API密钥和网络连接'],
      };
    }
  }

  /**
   * 分析测试失败原因
   */
  async analyzeFailure(
    screenshots: string[],
    testSteps: string[],
    errorMessage: string
  ): Promise<{
    rootCause: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    fixSuggestion: string;
    relatedComponents: string[];
  }> {
    const prompt = `作为游戏测试分析专家，请分析这次测试失败的原因。

测试步骤：
${testSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

错误信息：${errorMessage}

请分析：
1. 失败的根本原因
2. 严重程度评估
3. 修复建议
4. 可能涉及的相关组件

请以JSON格式返回：
{
  "rootCause": "根本原因",
  "severity": "low/medium/high/critical",
  "fixSuggestion": "修复建议",
  "relatedComponents": ["组件1", "组件2"]
}`;

    try {
      const content = screenshots.map((s, i) => [
        { type: 'text', text: `步骤${i + 1}截图:` },
        { type: 'image_url', image_url: { url: `data:image/png;base64,${s}` } },
      ]).flat();

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'glm-4v',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                ...content,
              ],
            },
          ],
        }),
      });

      const data = await response.json();
      const result = data.choices?.[0]?.message?.content || '';

      try {
        const parsed = JSON.parse(result.match(/\{[\s\S]*\}/)?.[0] || '{}');
        return {
          rootCause: parsed.rootCause || '未知原因',
          severity: parsed.severity || 'medium',
          fixSuggestion: parsed.fixSuggestion || '需要进一步调查',
          relatedComponents: parsed.relatedComponents || [],
        };
      } catch {
        return {
          rootCause: result || '解析失败',
          severity: 'medium',
          fixSuggestion: '请人工分析',
          relatedComponents: [],
        };
      }
    } catch (error) {
      return {
        rootCause: `API调用失败: ${error}`,
        severity: 'low',
        fixSuggestion: '检查API配置',
        relatedComponents: [],
      };
    }
  }

  private parseValidationResponse(content: string): AIValidationResult {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return {
          passed: result.passed ?? false,
          confidence: result.confidence ?? 0,
          analysis: result.analysis ?? content,
          issues: result.issues || [],
          suggestions: result.suggestions || [],
        };
      }
    } catch {
      // JSON解析失败
    }

    const passed = content.toLowerCase().includes('通过') ||
                   content.toLowerCase().includes('passed: true');

    return {
      passed,
      confidence: passed ? 75 : 25,
      analysis: content,
      issues: passed ? [] : ['AI检测到潜在问题'],
      suggestions: ['请人工复核'],
    };
  }
}

// 导出单例
export const qwenVL = new QwenVLService();
export const glm4v = new GLM4VService();

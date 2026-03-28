/**
 * AI端到端测试系统
 * 药灵山谷v3.0 - AI驱动的游戏体验测试
 *
 * 功能：
 * 1. 自动化浏览器控制
 * 2. AI视觉分析游戏画面
 * 3. 智能判断游戏状态
 * 4. 生成详细测试报告
 */

import { chromium, Browser, Page } from 'playwright';

export interface AITestCase {
  id: string;
  name: string;
  description: string;
  category: 'battle' | 'gathering' | 'formula' | 'integration';
  steps: TestStep[];
  expectedResults: string[];
  successCriteria: SuccessCriterion[];
}

export interface TestStep {
  id: string;
  action: 'navigate' | 'click' | 'type' | 'wait' | 'screenshot' | 'keypress' | 'evaluate';
  target?: string;
  value?: string;
  duration?: number;
  description: string;
  expected: string;
}

export interface SuccessCriterion {
  type: 'visual' | 'functional' | 'performance';
  description: string;
  weight: number;
}

export interface StepResult {
  step: TestStep;
  success: boolean;
  screenshot?: Buffer;
  observations: string[];
  issues: string[];
  duration: number;
}

export interface TestResult {
  testCase: AITestCase;
  passed: boolean;
  score: number;
  steps: StepResult[];
  summary: string;
  recommendations: string[];
  duration: number;
}

export interface AITestReport {
  timestamp: string;
  totalTests: number;
  passed: number;
  failed: number;
  overallScore: number;
  results: TestResult[];
  summary: string;
}

export class AITester {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private baseUrl: string;
  private testResults: TestResult[] = [];

  constructor(baseUrl: string = 'http://localhost:5173') {
    this.baseUrl = baseUrl;
  }

  /**
   * 初始化浏览器
   */
  async init(): Promise<void> {
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    this.page = await this.browser.newPage({
      viewport: { width: 1280, height: 720 },
    });

    // 设置控制台错误监听
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error(`[浏览器错误] ${msg.text()}`);
      }
    });

    // 设置页面错误监听
    this.page.on('pageerror', (error) => {
      console.error(`[页面错误] ${error.message}`);
    });
  }

  /**
   * 关闭浏览器
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }

  /**
   * 执行单个测试用例
   */
  async runTest(testCase: AITestCase): Promise<TestResult> {
    if (!this.page) {
      throw new Error('测试器未初始化，请先调用 init()');
    }

    console.log(`\n[测试] ${testCase.id}: ${testCase.name}`);
    console.log(`[描述] ${testCase.description}`);
    console.log('-'.repeat(60));

    const stepResults: StepResult[] = [];
    const startTime = Date.now();

    try {
      for (const step of testCase.steps) {
        const stepStart = Date.now();
        const result = await this.executeStep(step);
        result.duration = Date.now() - stepStart;
        stepResults.push(result);

        if (!result.success) {
          console.log(`  ❌ 步骤失败: ${step.description}`);
        } else {
          console.log(`  ✅ 步骤通过: ${step.description}`);
        }
      }
    } catch (error) {
      console.error(`[测试错误] ${error}`);
    }

    const duration = Date.now() - startTime;
    const passedSteps = stepResults.filter(r => r.success).length;
    const score = Math.round((passedSteps / stepResults.length) * 100);

    const result: TestResult = {
      testCase,
      passed: score >= 80,
      score,
      steps: stepResults,
      summary: this.generateTestSummary(testCase, stepResults, score),
      recommendations: this.generateRecommendations(stepResults),
      duration,
    };

    this.testResults.push(result);
    return result;
  }

  /**
   * 执行单个测试步骤
   */
  private async executeStep(step: TestStep): Promise<StepResult> {
    if (!this.page) {
      throw new Error('页面未初始化');
    }

    const observations: string[] = [];
    const issues: string[] = [];
    let screenshot: Buffer | undefined;
    let success = true;

    try {
      switch (step.action) {
        case 'navigate':
          const url = step.value?.startsWith('http')
            ? step.value
            : `${this.baseUrl}${step.value}`;
          await this.page.goto(url, { waitUntil: 'networkidle' });
          observations.push(`导航到: ${url}`);
          break;

        case 'click':
          await this.page.waitForSelector(step.target!, { timeout: 5000 });
          await this.page.click(step.target!);
          observations.push(`点击元素: ${step.target}`);
          await this.page.waitForTimeout(300);
          break;

        case 'type':
          await this.page.waitForSelector(step.target!, { timeout: 5000 });
          await this.page.fill(step.target!, step.value || '');
          observations.push(`输入文本: ${step.value}`);
          break;

        case 'keypress':
          await this.page.keyboard.press(step.value || 'Enter');
          observations.push(`按键: ${step.value}`);
          await this.page.waitForTimeout(300);
          break;

        case 'wait':
          await this.page.waitForTimeout(step.duration || 1000);
          observations.push(`等待: ${step.duration}ms`);
          break;

        case 'screenshot':
          screenshot = await this.page.screenshot({ fullPage: true });
          observations.push('已截图');
          break;

        case 'evaluate':
          const result = await this.page.evaluate(step.value!);
          observations.push(`执行脚本: ${step.value}`);
          if (result !== undefined) {
            observations.push(`返回结果: ${JSON.stringify(result)}`);
          }
          break;
      }
    } catch (error) {
      success = false;
      issues.push(`执行失败: ${error instanceof Error ? error.message : String(error)}`);
    }

    // 验证预期结果
    if (step.expected && success) {
      try {
        await this.verifyExpected(step.expected);
        observations.push('预期验证通过');
      } catch (error) {
        success = false;
        issues.push(`预期验证失败: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return {
      step,
      success,
      screenshot,
      observations,
      issues,
      duration: 0, // 由调用者设置
    };
  }

  /**
   * 验证预期结果
   */
  private async verifyExpected(expected: string): Promise<void> {
    if (!this.page) return;

    // 检查元素是否存在
    if (expected.startsWith('selector:')) {
      const selector = expected.replace('selector:', '');
      const element = await this.page.$(selector);
      if (!element) {
        throw new Error(`元素未找到: ${selector}`);
      }
    }

    // 检查文本是否存在
    if (expected.startsWith('text:')) {
      const text = expected.replace('text:', '');
      const pageText = await this.page.textContent('body');
      if (!pageText?.includes(text)) {
        throw new Error(`文本未找到: ${text}`);
      }
    }

    // 检查URL
    if (expected.startsWith('url:')) {
      const urlPattern = expected.replace('url:', '');
      const currentUrl = this.page.url();
      if (!currentUrl.includes(urlPattern)) {
        throw new Error(`URL不匹配: 期望包含 ${urlPattern}, 实际 ${currentUrl}`);
      }
    }
  }

  /**
   * 生成测试摘要
   */
  private generateTestSummary(
    testCase: AITestCase,
    stepResults: StepResult[],
    score: number
  ): string {
    const passedSteps = stepResults.filter(r => r.success).length;
    const totalSteps = stepResults.length;

    return `${testCase.name}: ${passedSteps}/${totalSteps} 步骤通过，得分 ${score}%`;
  }

  /**
   * 生成改进建议
   */
  private generateRecommendations(stepResults: StepResult[]): string[] {
    const recommendations: string[] = [];

    const failedSteps = stepResults.filter(r => !r.success);
    if (failedSteps.length > 0) {
      recommendations.push(`修复 ${failedSteps.length} 个失败的测试步骤`);
    }

    // 分析常见问题
    const slowSteps = stepResults.filter(r => r.duration > 3000);
    if (slowSteps.length > 0) {
      recommendations.push(`优化性能: ${slowSteps.length} 个步骤执行缓慢`);
    }

    return recommendations;
  }

  /**
   * 生成完整测试报告
   */
  generateReport(): AITestReport {
    const passed = this.testResults.filter(r => r.passed).length;
    const totalScore = this.testResults.reduce((sum, r) => sum + r.score, 0);
    const overallScore = Math.round(totalScore / this.testResults.length);

    return {
      timestamp: new Date().toISOString(),
      totalTests: this.testResults.length,
      passed,
      failed: this.testResults.length - passed,
      overallScore,
      results: this.testResults,
      summary: this.generateOverallSummary(overallScore, passed),
    };
  }

  /**
   * 生成整体摘要
   */
  private generateOverallSummary(score: number, passed: number): string {
    let grade: string;
    let description: string;

    if (score >= 95) {
      grade = 'S';
      description = '优秀，可直接发布';
    } else if (score >= 85) {
      grade = 'A';
      description = '良好，小优化后发布';
    } else if (score >= 70) {
      grade = 'B';
      description = '及格，需要改进';
    } else if (score >= 60) {
      grade = 'C';
      description = '不及格，需大修';
    } else {
      grade = 'F';
      description = '不可用';
    }

    return `总体评分: ${grade} (${score}%) - ${description}，通过 ${passed}/${this.testResults.length} 项测试`;
  }
}

export default AITester;

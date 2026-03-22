import { test as base, expect, Page } from '@playwright/test';
import { qwenVL, glm4v } from '../../ai-services/index';

/**
 * AI增强的测试夹具
 * 提供视觉验证和逻辑验证方法
 */
export interface AITestFixtures {
  ai: {
    /**
     * 验证页面布局
     */
    validateLayout: (options: {
      expectedElements?: string[];
      layoutRules?: string[];
      styleChecks?: {
        colors?: string[];
        fonts?: string[];
        spacing?: boolean;
      };
    }) => Promise<void>;

    /**
     * 验证动画效果
     */
    validateAnimation: (
      animationDescription: string,
      duration?: number
    ) => Promise<void>;

    /**
     * 验证游戏逻辑
     */
    validateGameLogic: (options: {
      userAction: string;
      expectedOutcome: string;
      gameState?: Record<string, unknown>;
    }) => Promise<void>;

    /**
     * 验证图片质量
     */
    validateImageQuality: (
      selector: string,
      type: 'medicine' | 'scene' | 'character',
      requirements?: string[]
    ) => Promise<void>;

    /**
     * 截图对比（视觉回归）
     */
    visualRegression: (name: string, threshold?: number) => Promise<void>;
  };
}

export const test = base.extend<AITestFixtures>({
  ai: async ({ page }, use) => {
    const ai = createAIHelper(page);
    await use(ai);
  },
});

function createAIHelper(page: Page) {
  return {
    /**
     * 验证页面布局是否符合设计规范
     */
    async validateLayout(options: {
      expectedElements?: string[];
      layoutRules?: string[];
      styleChecks?: {
        colors?: string[];
        fonts?: string[];
        spacing?: boolean;
      };
    }) {
      const screenshot = await page.screenshot({ fullPage: true });
      const base64 = screenshot.toString('base64');

      const result = await qwenVL.validateLayout({
        screenshot: base64,
        expectedElements: options.expectedElements,
        layoutRules: options.layoutRules,
        styleChecks: options.styleChecks,
      });

      // 记录AI分析结果到测试报告
      test.info().attach('AI布局分析', {
        body: JSON.stringify(result, null, 2),
        contentType: 'application/json',
      });

      expect(result.passed, `AI布局验证失败: ${result.analysis}`).toBe(true);

      if (result.confidence < 70) {
        console.warn(`AI布局验证置信度较低: ${result.confidence}%, 建议人工复核`);
      }
    },

    /**
     * 验证动画效果
     */
    async validateAnimation(animationDescription: string, duration = 2000) {
      const screenshots: string[] = [];
      const interval = duration / 5; // 捕获5帧

      // 开始录制动画
      for (let i = 0; i < 5; i++) {
        await page.waitForTimeout(interval);
        const screenshot = await page.screenshot();
        screenshots.push(screenshot.toString('base64'));
      }

      const result = await qwenVL.validateAnimation(screenshots, animationDescription);

      test.info().attach('AI动画分析', {
        body: JSON.stringify(result, null, 2),
        contentType: 'application/json',
      });

      // 将截图也附加到报告中
      for (let i = 0; i < screenshots.length; i++) {
        test.info().attach(`动画帧${i + 1}`, {
          body: Buffer.from(screenshots[i], 'base64'),
          contentType: 'image/png',
        });
      }

      expect(result.passed, `AI动画验证失败: ${result.analysis}`).toBe(true);
    },

    /**
     * 验证游戏逻辑
     */
    async validateGameLogic(options: {
      userAction: string;
      expectedOutcome: string;
      gameState?: Record<string, unknown>;
    }) {
      const screenshot = await page.screenshot();
      const base64 = screenshot.toString('base64');

      const result = await glm4v.validateGameLogic({
        screenshot: base64,
        userAction: options.userAction,
        expectedOutcome: options.expectedOutcome,
        gameState: options.gameState,
      });

      test.info().attach('AI逻辑分析', {
        body: JSON.stringify(result, null, 2),
        contentType: 'application/json',
      });

      expect(result.passed, `AI逻辑验证失败: ${result.analysis}`).toBe(true);
    },

    /**
     * 验证图片质量
     */
    async validateImageQuality(
      selector: string,
      type: 'medicine' | 'scene' | 'character',
      requirements: string[] = []
    ) {
      const element = await page.$(selector);
      if (!element) {
        throw new Error(`未找到元素: ${selector}`);
      }

      const screenshot = await element.screenshot();
      const base64 = screenshot.toString('base64');

      const result = await qwenVL.validateImageQuality(base64, type, requirements);

      test.info().attach('AI图片质量分析', {
        body: JSON.stringify(result, null, 2),
        contentType: 'application/json',
      });

      expect(result.passed, `AI图片质量验证失败: ${result.analysis}`).toBe(true);
    },

    /**
     * 视觉回归测试
     */
    async visualRegression(name: string, threshold = 0.1) {
      // 首先进行标准的Playwright截图对比
      await expect(page).toHaveScreenshot(`${name}.png`, {
        threshold,
        maxDiffPixelRatio: 0.1,
      });

      // 然后进行AI视觉验证
      const screenshot = await page.screenshot();
      const base64 = screenshot.toString('base64');

      const result = await qwenVL.validateLayout({
        screenshot: base64,
        expectedElements: ['所有可见UI元素'],
        layoutRules: ['布局正确', '无元素重叠', '间距合理'],
      });

      test.info().attach(`视觉回归-${name}`, {
        body: JSON.stringify(result, null, 2),
        contentType: 'application/json',
      });

      if (!result.passed) {
        console.warn(`AI视觉回归检测到差异: ${result.analysis}`);
      }
    },
  };
}

export { expect };

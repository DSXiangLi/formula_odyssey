import { test, expect } from '../fixtures/game-fixtures';
import { DesignRequirement } from '../types';

const wuxingSceneRequirements: DesignRequirement = {
  name: '五行场景视觉验收',
  criteria: [
    '场景背景应符合五行区域特色（青木林/赤焰峰/黄土丘/白金原/黑水潭）',
    '应有五行对应的颜色主题（木-青/火-赤/土-黄/金-白/水-黑）',
    '场景应包含药灵种子元素',
    '应有探索按钮或交互入口',
    '整体视觉效果应具有沉浸感和游戏感',
    '粒子效果或动画应正常运行',
  ],
  expectedElements: ['场景', '探索', '种子'],
};

test.describe('五行场景视觉验收', () => {
  test('青木林场景视觉验证', async ({ page, aiVision, screenshotHelper }) => {
    await page.goto('/chapter/chapter-1');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    const screenshotPath = await screenshotHelper.capture(page, 'wood-scene');
    const result = await aiVision.analyzeScreenshot(screenshotPath, {
      ...wuxingSceneRequirements,
      name: '青木林场景视觉验收',
      criteria: [
        ...wuxingSceneRequirements.criteria,
        '青木林应呈现绿色/青色为主的色调',
        '应有森林、植物相关元素',
      ],
    });
    console.log('青木林AI验收结果:', result);
    expect(result.score).toBeGreaterThanOrEqual(75);
  });

  test('场景交互测试', async ({ page, screenshotHelper }) => {
    await page.goto('/chapter/chapter-1');
    await page.waitForLoadState('networkidle');
    const exploreButton = page.locator('button:has-text("探索"), [data-testid="explore-button"]').first();
    if (await exploreButton.isVisible().catch(() => false)) {
      await screenshotHelper.capture(page, 'before-explore');
      await exploreButton.click();
      await page.waitForTimeout(1000);
      await screenshotHelper.capture(page, 'after-explore');
      const exploreModal = page.locator('[data-testid="explore-modal"], .modal, .dialog').first();
      await expect(exploreModal).toBeVisible();
    }
  });
});

import { test, expect } from '../fixtures/game-fixtures';
import { DesignRequirement } from '../types';

const chapterSelectRequirements: DesignRequirement = {
  name: '章节选择页面视觉验收',
  criteria: [
    '页面顶部应显示"药灵山谷"标题',
    '应展示20个章节的卡片布局',
    '章节卡片应按五行（金木水火土）分类显示',
    '第一章（解表剂山谷）应显示为已解锁状态',
    '其他章节应显示为锁定状态',
    '页面应有响应式设计，适配不同屏幕尺寸',
    '整体色调应符合中医古典风格（暖色调、木质色系）',
  ],
  expectedElements: ['药灵山谷', '解表剂山谷', '章节'],
};

test.describe('章节选择页面 - AI视觉验收', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('应正确渲染章节选择页面', async ({ page, aiVision, screenshotHelper }) => {
    const screenshotPath = await screenshotHelper.capture(page, 'chapter-select-initial');
    const result = await aiVision.analyzeScreenshot(screenshotPath, chapterSelectRequirements);
    console.log('AI视觉验收结果:', JSON.stringify(result, null, 2));
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.issues.filter(i => i.includes('严重')).length).toBe(0);
  });

  test('应能点击第一章进入章节', async ({ page, screenshotHelper }) => {
    const chapter1Card = page.locator('[data-chapter-id="chapter-1"]').first();
    await expect(chapter1Card).toBeVisible();
    await screenshotHelper.capture(page, 'before-chapter-click');
    await chapter1Card.click();
    await page.waitForURL(/\/chapter\/chapter-1/);
    await screenshotHelper.capture(page, 'after-chapter-click');
    expect(page.url()).toContain('/chapter/chapter-1');
  });

  test('锁定章节应无法点击', async ({ page }) => {
    const chapter2Card = page.locator('[data-chapter-id="chapter-2"]').first();
    await expect(chapter2Card).toBeVisible();
    const lockIcon = chapter2Card.locator('[data-testid="lock-icon"]').or(
      chapter2Card.locator('.opacity-60, .grayscale')
    );
    await expect(lockIcon).toBeVisible();
  });
});

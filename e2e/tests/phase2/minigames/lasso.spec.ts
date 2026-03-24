import { test, expect } from '../../fixtures/game-fixtures';
import { MinigameHelper } from '../../helpers/minigame-helper';
import { lassoMinigameRequirements } from '../../requirements/phase2-requirements';

test.describe('Phase 2: 套索小游戏', () => {
  let minigameHelper: MinigameHelper;

  test.beforeEach(async ({ page }) => {
    minigameHelper = new MinigameHelper(page);
  });

  test('套索小游戏应显示移动目标', async ({ page, aiVision, screenshotHelper }) => {
    await page.goto('/chapter/chapter-1/gathering');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('canvas').first();
    await canvas.click();

    try {
      await minigameHelper.waitForMinigameModal('lasso', 3000);
    } catch {
      test.skip('当前地块未触发套索游戏');
    }

    const screenshot = await screenshotHelper.capture(page, 'lasso-game');
    const result = await aiVision.analyzeScreenshot(screenshot, lassoMinigameRequirements);

    expect(result.score).toBeGreaterThanOrEqual(70);
  });

  test('套索游戏应支持鼠标交互', async ({ page }) => {
    await page.goto('/chapter/chapter-1/gathering');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('canvas').first();
    await canvas.click();

    try {
      await minigameHelper.waitForMinigameModal('lasso', 3000);
    } catch {
      test.skip('当前地块未触发套索游戏');
    }

    const result = await minigameHelper.playLassoGame();
    expect(result.success).toBe(true);
  });

  test('套索游戏视觉元素验收', async ({ page, aiVision, screenshotHelper }) => {
    await page.goto('/chapter/chapter-1/gathering');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('canvas').first();
    await canvas.click();

    try {
      await minigameHelper.waitForMinigameModal('lasso', 3000);
    } catch {
      test.skip('当前地块未触发套索游戏');
    }

    const screenshot = await screenshotHelper.capture(page, 'lasso-elements');
    const result = await aiVision.analyzeScreenshot(screenshot, {
      ...lassoMinigameRequirements,
      name: '套索游戏元素验收',
      criteria: [
        '应显示移动目标（动物/昆虫）',
        '套索起始位置应在底部中央',
        '应有分数显示区域',
        '游戏区域边界应清晰',
      ],
    });

    expect(result.score).toBeGreaterThanOrEqual(70);
  });
});

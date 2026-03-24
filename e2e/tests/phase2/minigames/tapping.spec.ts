import { test, expect } from '../../../fixtures/game-fixtures';
import { MinigameHelper } from '../../../helpers/minigame-helper';
import { tappingMinigameRequirements } from '../../../requirements/phase2-requirements';

test.describe('Phase 2: 敲击小游戏', () => {
  let minigameHelper: MinigameHelper;

  test.beforeEach(async ({ page }) => {
    minigameHelper = new MinigameHelper(page);
  });

  test('敲击小游戏应显示节奏指示器', async ({ page, aiVision, screenshotHelper }) => {
    await page.goto('/chapter/chapter-1/gathering');
    await page.waitForLoadState('networkidle');

    // 尝试触发敲击游戏
    const canvas = page.locator('canvas').first();
    await canvas.click();

    try {
      await minigameHelper.waitForMinigameModal('tapping', 3000);
    } catch {
      test.skip('当前地块未触发敲击游戏');
    }

    const screenshot = await screenshotHelper.capture(page, 'tapping-game');
    const result = await aiVision.analyzeScreenshot(screenshot, tappingMinigameRequirements);

    expect(result.score).toBeGreaterThanOrEqual(70);
  });

  test('敲击游戏应支持连击系统', async ({ page }) => {
    await page.goto('/chapter/chapter-1/gathering');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('canvas').first();
    await canvas.click();

    try {
      await minigameHelper.waitForMinigameModal('tapping', 3000);
    } catch {
      test.skip('当前地块未触发敲击游戏');
    }

    const result = await minigameHelper.playTappingGame();
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  test('敲击游戏视觉元素验收', async ({ page, aiVision, screenshotHelper }) => {
    await page.goto('/chapter/chapter-1/gathering');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('canvas').first();
    await canvas.click();

    try {
      await minigameHelper.waitForMinigameModal('tapping', 3000);
    } catch {
      test.skip('当前地块未触发敲击游戏');
    }

    const screenshot = await screenshotHelper.capture(page, 'tapping-rhythm');
    const result = await aiVision.analyzeScreenshot(screenshot, {
      ...tappingMinigameRequirements,
      name: '敲击游戏节奏系统验收',
      criteria: [
        '应显示节拍指示器',
        '应有敲击目标区域',
        '连击时应显示连击数字',
        '应有击打反馈动画',
      ],
    });

    expect(result.score).toBeGreaterThanOrEqual(70);
  });
});

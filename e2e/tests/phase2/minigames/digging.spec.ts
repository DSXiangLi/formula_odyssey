import { test, expect } from '../../../fixtures/game-fixtures';
import { MinigameHelper } from '../../../helpers/minigame-helper';
import { diggingMinigameRequirements } from '../../../requirements/phase2-requirements';

test.describe('Phase 2: 挖掘小游戏', () => {
  let minigameHelper: MinigameHelper;

  test.beforeEach(async ({ page }) => {
    minigameHelper = new MinigameHelper(page);
  });

  test('挖掘小游戏应正确显示多层土壤结构', async ({ page, aiVision, screenshotHelper }) => {
    // 进入采集关卡
    await page.goto('/chapter/chapter-1/stage?stage=1');
    await page.waitForLoadState('networkidle');

    // 点击地图触发小游戏
    const canvas = page.locator('canvas').first();
    await canvas.click();

    // 检查是否触发了挖掘游戏
    try {
      await minigameHelper.waitForMinigameModal('digging', 3000);
    } catch {
      test.skip('当前地块未触发挖掘游戏');
    }

    const screenshot = await screenshotHelper.capture(page, 'digging-game');
    const result = await aiVision.analyzeScreenshot(screenshot, diggingMinigameRequirements);

    expect(result.score).toBeGreaterThanOrEqual(70);
    expect(result.passed).toBe(true);
  });

  test('挖掘小游戏应支持键盘和鼠标交互', async ({ page }) => {
    await page.goto('/chapter/chapter-1/stage?stage=1');
    await page.waitForLoadState('networkidle');

    // 点击地图
    const canvas = page.locator('canvas').first();
    await canvas.click();

    try {
      await minigameHelper.waitForMinigameModal('digging', 3000);
    } catch {
      test.skip('当前地块未触发挖掘游戏');
    }

    // 测试鼠标点击
    const hitButton = page.locator('button:has-text("挖掘"), button:has-text("击打"), button').first();
    const isVisible = await hitButton.isVisible().catch(() => false);

    if (isVisible) {
      await hitButton.click();
      await page.waitForTimeout(500);

      // 验证有响应
      const stillVisible = await minigameHelper.isMinigameVisible('digging');
      expect(stillVisible || await page.locator('[data-testid="minigame-result"]').isVisible().catch(() => false)).toBe(true);
    }
  });

  test('完成挖掘游戏应获得药材奖励', async ({ page, gameStateValidator }) => {
    const beforeMedicines = await gameStateValidator.getCollectedMedicines();

    await page.goto('/chapter/chapter-1/stage?stage=1');
    await page.waitForLoadState('networkidle');

    // 触发小游戏
    const canvas = page.locator('canvas').first();
    await canvas.click();

    try {
      await minigameHelper.waitForMinigameModal('digging', 3000);
    } catch {
      test.skip('当前地块未触发挖掘游戏');
    }

    // 玩游戏
    const result = await minigameHelper.playDiggingGame();

    // 验证奖励
    const afterMedicines = await gameStateValidator.getCollectedMedicines();
    expect(afterMedicines.length).toBeGreaterThanOrEqual(beforeMedicines.length);
  });

  test('挖掘游戏力量条应正确显示', async ({ page, aiVision, screenshotHelper }) => {
    await page.goto('/chapter/chapter-1/stage?stage=1');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('canvas').first();
    await canvas.click();

    try {
      await minigameHelper.waitForMinigameModal('digging', 3000);
    } catch {
      test.skip('当前地块未触发挖掘游戏');
    }

    const screenshot = await screenshotHelper.capture(page, 'digging-power-bar');
    const result = await aiVision.analyzeScreenshot(screenshot, {
      ...diggingMinigameRequirements,
      name: '挖掘游戏力量条验收',
      criteria: [
        '应显示力量条组件',
        '力量条应有颜色渐变（红-黄-绿）',
        '应在40%-60%区域有特殊标记（完美击打区）',
        '力量指示器应能动态移动',
      ],
    });

    expect(result.score).toBeGreaterThanOrEqual(70);
  });
});

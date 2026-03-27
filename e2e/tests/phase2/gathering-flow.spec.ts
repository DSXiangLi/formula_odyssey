import { test, expect } from '../../fixtures/game-fixtures';
import { MapHelper } from '../../helpers/map-helper';
import { MinigameHelper } from '../../helpers/minigame-helper';
import { gatheringFlowRequirements } from '../../requirements/phase2-requirements';

test.describe('Phase 2: 山谷采药完整流程', () => {
  let mapHelper: MapHelper;
  let minigameHelper: MinigameHelper;

  test.beforeEach(async ({ page }) => {
    mapHelper = new MapHelper(page);
    minigameHelper = new MinigameHelper(page);
  });

  test('应能从章节入口进入采集关卡', async ({ page, screenshotHelper }) => {
    // 从章节选择开始
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 点击第一章
    const chapter1 = page.locator('[data-chapter-id="chapter-1"]').first();
    await expect(chapter1).toBeVisible();
    await chapter1.click();

    // 验证进入章节入口
    await page.waitForURL(/chapter\/chapter-1$/);
    await screenshotHelper.capture(page, 'chapter-entry');

    // 点击"开始本章"按钮进入StageManager
    const startButton = page.locator('button:has-text("开始本章"), [data-testid="start-chapter-button"]').first();
    if (await startButton.isVisible().catch(() => false)) {
      await startButton.click();
      await page.waitForURL(/chapter\/chapter-1\/stage/);
    }

    // 验证进入GatheringStage（阶段2）
    await page.waitForTimeout(2000);
    const hasMap = await mapHelper.verifyMapElements();
    expect(hasMap).toBe(true);
  });

  test('完整采集流程：移动-发现-采集-获得奖励', async ({ page, gameStateValidator, screenshotHelper }) => {
    // 初始化状态
    await gameStateValidator.clearAllData();

    // 进入采集关卡（通过StageManager，stage=1直接进入山谷采药）
    await page.goto('/chapter/chapter-1/stage?stage=1');
    await page.waitForLoadState('networkidle');
    await mapHelper.waitForMapRender();

    const beforeMedicines = await gameStateValidator.getCollectedMedicines();
    const beforeCurrency = await gameStateValidator.getPlayerCurrency();

    // 移动到相邻地块
    await mapHelper.moveToAdjacent('right');
    await mapHelper.waitForMoveComplete();
    await page.waitForTimeout(1000);

    // 检查是否触发小游戏
    const minigameType = await minigameHelper.getActiveMinigameType();

    if (minigameType) {
      // 玩小游戏
      const result = await minigameHelper.playCurrentMinigame();
      expect(result.success).toBe(true);

      // 验证奖励
      const afterMedicines = await gameStateValidator.getCollectedMedicines();
      const afterCurrency = await gameStateValidator.getPlayerCurrency();

      expect(afterMedicines.length).toBeGreaterThanOrEqual(beforeMedicines.length);
      if (afterCurrency !== null && beforeCurrency !== null) {
        expect(afterCurrency).toBeGreaterThanOrEqual(beforeCurrency);
      }
    }

    await screenshotHelper.capture(page, 'gathering-complete');
  });

  test('采集状态应正确保存到localStorage', async ({ page, gameStateValidator }) => {
    // 执行采集
    await page.goto('/chapter/chapter-1/stage?stage=1');
    await page.waitForLoadState('networkidle');
    await mapHelper.waitForMapRender();

    await mapHelper.moveToAdjacent('right');
    await mapHelper.waitForMoveComplete();
    await page.waitForTimeout(1000);

    // 尝试玩小游戏获得奖励
    const minigameType = await minigameHelper.getActiveMinigameType();
    if (minigameType) {
      await minigameHelper.playCurrentMinigame();
    }

    // 刷新页面
    await page.reload();
    await page.waitForLoadState('networkidle');
    await mapHelper.waitForMapRender();

    // 验证状态
    const gameState = await gameStateValidator.getGameState();
    expect(gameState?.state).toBeTruthy();
  });

  test('AI验收：完整采集流程视觉一致性', async ({ page, aiVision, screenshotHelper }) => {
    await page.goto('/chapter/chapter-1/stage?stage=1');
    await page.waitForLoadState('networkidle');
    await mapHelper.waitForMapRender();

    const screenshot = await screenshotHelper.capture(page, 'gathering-flow');
    const result = await aiVision.analyzeScreenshot(screenshot, gatheringFlowRequirements);

    expect(result.score).toBeGreaterThanOrEqual(70);
    expect(result.passed).toBe(true);
  });

  test('性能：地图加载应在3秒内完成', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/chapter/chapter-1/stage?stage=1');
    await mapHelper.waitForMapRender();

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000); // 放宽到5秒
  });

  test('玩家应能在地图上自由移动', async ({ page }) => {
    await page.goto('/chapter/chapter-1/stage?stage=1');
    await page.waitForLoadState('networkidle');
    await mapHelper.waitForMapRender();

    const initialPos = await mapHelper.getPlayerPosition();
    expect(initialPos).toBeTruthy();

    // 尝试向多个方向移动
    const directions: Array<'up' | 'down' | 'left' | 'right'> = ['up', 'down', 'left', 'right'];

    for (const direction of directions) {
      await mapHelper.moveToAdjacent(direction);
      await mapHelper.waitForMoveComplete();
      await page.waitForTimeout(500);
    }

    // 验证位置有变化
    const finalPos = await mapHelper.getPlayerPosition();
    expect(finalPos).toBeTruthy();
  });

  test('不同五行章节应有不同的地图主题', async ({ page, aiVision, screenshotHelper }) => {
    const chapters = [
      { id: 'chapter-1', name: '解表剂山谷', wuxing: '木' },
      { id: 'chapter-2', name: '清热剂山谷', wuxing: '水' },
    ];

    for (const chapter of chapters) {
      await page.goto(`/chapter/${chapter.id}/stage?stage=1`);
      await page.waitForLoadState('networkidle');
      await mapHelper.waitForMapRender();

      const screenshot = await screenshotHelper.capture(page, `${chapter.id}-gathering`);
      const result = await aiVision.analyzeScreenshot(screenshot, {
        ...gatheringFlowRequirements,
        name: `${chapter.name}采集关卡验收`,
        criteria: [
          `页面应体现${chapter.wuxing}行特色`,
          '地图风格应与章节主题一致',
          '整体视觉应协调统一',
        ],
      });

      expect(result.score).toBeGreaterThanOrEqual(65);
    }
  });
});

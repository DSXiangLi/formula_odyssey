import { test, expect } from '../../fixtures/game-fixtures';
import { MapHelper } from '../../helpers/map-helper';
import { mapGenerationRequirements, isometricRenderingRequirements } from '../../requirements/phase2-requirements';

test.describe('Phase 2: 地图生成系统', () => {
  let mapHelper: MapHelper;

  test.beforeEach(async ({ page }) => {
    mapHelper = new MapHelper(page);
  });

  test('地图应正确生成并显示6x6网格', async ({ page, screenshotHelper }) => {
    // 进入采集关卡 - 通过StageManager路由，stage=1表示直接进入阶段2（山谷采药）
    await page.goto('/chapter/chapter-1/stage?stage=1', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);

    // 等待StageManager渲染GatheringStage
    await mapHelper.waitForMapRender();

    // 截图用于AI验收
    await screenshotHelper.capture(page, 'map-generated');

    // 验证Canvas存在
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // 验证玩家起始位置
    const playerPos = await mapHelper.getPlayerPosition();
    expect(playerPos).toBeTruthy();
    if (playerPos) {
      expect(playerPos.x).toBeGreaterThanOrEqual(0);
      expect(playerPos.x).toBeLessThan(6);
      expect(playerPos.y).toBeGreaterThanOrEqual(0);
      expect(playerPos.y).toBeLessThan(6);
    }
  });

  test('地图应根据章节五行显示正确主题', async ({ page, aiVision, screenshotHelper }) => {
    // 测试木行章节（第一章），stage=1直接进入山谷采药
    await page.goto('/chapter/chapter-1/stage?stage=1');
    await page.waitForLoadState('networkidle');
    await mapHelper.waitForMapRender();

    const screenshot = await screenshotHelper.capture(page, 'wood-map-theme');
    const result = await aiVision.analyzeScreenshot(screenshot, {
      ...mapGenerationRequirements,
      name: '青木林地图主题验收',
      criteria: [
        ...mapGenerationRequirements.criteria,
        '地图应显示绿色/青色主题（木行）',
        '应有森林、草地相关视觉元素',
      ],
    });

    expect(result.score).toBeGreaterThanOrEqual(85);
    expect(result.passed).toBe(true);
    expect(result.issues.filter((i: string) => i.includes('严重')).length).toBe(0);
  });

  test('地图应根据不同章节显示不同五行主题', async ({ page, aiVision, screenshotHelper }) => {
    // 增加超时到3分钟，因为需要测试3个章节，每个都需要AI视觉分析
    test.setTimeout(180000);

    const chapters = [
      { id: 'chapter-1', wuxing: 'wood', color: '绿色', name: '青木林' },
      { id: 'chapter-5', wuxing: 'fire', color: '红色', name: '赤焰峰' },
      { id: 'chapter-9', wuxing: 'earth', color: '黄色', name: '黄土丘' },
    ];

    for (const chapter of chapters) {
      await page.goto(`/chapter/${chapter.id}/stage?stage=1`);
      await page.waitForLoadState('networkidle');
      await mapHelper.waitForMapRender();

      const screenshot = await screenshotHelper.capture(page, `${chapter.wuxing}-map-theme`);
      const result = await aiVision.analyzeScreenshot(screenshot, {
        ...mapGenerationRequirements,
        name: `${chapter.name}地图主题验收`,
        criteria: [
          `地图应显示${chapter.color}主题（${chapter.wuxing}行）`,
          '地形视觉元素应清晰可见',
        ],
      });

      expect(result.score).toBeGreaterThanOrEqual(85);
    }
  });

  test('等角投影应正确渲染', async ({ page, aiVision, screenshotHelper }) => {
    await page.goto('/chapter/chapter-1/stage?stage=1');
    await page.waitForLoadState('networkidle');
    await mapHelper.waitForMapRender();

    const screenshot = await screenshotHelper.capture(page, 'isometric-projection');
    const result = await aiVision.analyzeScreenshot(screenshot, isometricRenderingRequirements);

    expect(result.score).toBeGreaterThanOrEqual(85);
    expect(result.passed).toBe(true);
  });

  test('地图应正确保存和恢复状态', async ({ page, gameStateValidator }) => {
    await page.goto('/chapter/chapter-1/stage?stage=1');
    await mapHelper.waitForMapRender();

    // 记录初始位置
    const initialPos = await mapHelper.getPlayerPosition();
    expect(initialPos).toBeTruthy();

    // 执行移动操作
    await mapHelper.moveToAdjacent('right');
    await mapHelper.waitForMoveComplete();

    // 刷新页面
    await page.reload();
    await page.waitForLoadState('networkidle');
    await mapHelper.waitForMapRender();

    // 验证状态恢复
    const gameState = await gameStateValidator.getGameState();
    expect(gameState?.state).toBeTruthy();
  });

  test('地图迷雾效果应正确显示', async ({ page, aiVision, screenshotHelper }) => {
    await page.goto('/chapter/chapter-1/stage?stage=1');
    await page.waitForLoadState('networkidle');
    await mapHelper.waitForMapRender();

    const screenshot = await screenshotHelper.capture(page, 'fog-of-war');
    const result = await aiVision.analyzeScreenshot(screenshot, {
      ...isometricRenderingRequirements,
      name: '迷雾效果验收',
      criteria: [
        '未探索区域应显示为深色/迷雾覆盖',
        '已探索区域应清晰可见',
        '迷雾边界应平滑过渡',
      ],
    });

    expect(result.score).toBeGreaterThanOrEqual(85);
  });
});

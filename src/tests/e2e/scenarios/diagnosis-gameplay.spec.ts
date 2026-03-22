/**
 * 性味归经探查玩法端到端测试
 * 测试场景：探索→查看线索→猜药→收集
 */

import { test, expect } from '../utils/ai-test-fixtures';

test.describe('性味归经探查玩法', () => {
  test.beforeEach(async ({ page }) => {
    // 确保有足够钻石
    await page.evaluate(() => {
      const storage = JSON.parse(localStorage.getItem('fangling-valley-v2-storage') || '{}');
      storage.player = { ...storage.player, currency: 200 };
      localStorage.setItem('fangling-valley-v2-storage', JSON.stringify(storage));
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('点击未收集种子应打开性味归经探查弹窗', async ({ page, ai }) => {
    // 点击一个未收集的种子
    const seed = await page.locator('.crystal-ball-seed').first();
    await expect(seed).toBeVisible();

    // 记录点击前的状态
    const initialCurrency = await page.locator('[data-testid="currency-display"]').textContent();

    await seed.click();

    // 等待弹窗出现
    const diagnosisModal = await page.locator('[data-testid="diagnosis-modal"]');
    await expect(diagnosisModal).toBeVisible();

    // AI验证：性味归经弹窗布局
    await ai.validateLayout({
      expectedElements: ['水晶球展示', '药图四气五味归经功效按钮', '线索面板', '猜测输入', '钻石显示'],
      layoutRules: ['水晶球在左侧', '线索按钮网格排列', '线索面板清晰'],
      styleChecks: { colors: ['#2E7D32', '#C62828', '#F9A825', '#78909C', '#1565C0'] },
    });

    // 验证药图免费，其他需要钻石
    const wangBtn = await page.locator('[data-testid="diagnosis-wang"]');
    const wenBtn = await page.locator('[data-testid="diagnosis-wen"]');

    await expect(wangBtn).toContainText('免费');
    await expect(wenBtn).toContainText('5');
  });

  test('查看药图应显示药物原图和五行归属', async ({ page, ai }) => {
    // 打开性味归经弹窗
    await page.click('.crystal-ball-seed');
    await page.waitForSelector('[data-testid="diagnosis-modal"]');

    // 点击查看药图
    await page.click('[data-testid="diagnosis-wang"]');

    // AI验证：药物图片显示
    await ai.validateImageQuality(
      '[data-testid="crystal-ball-image"]',
      'medicine',
      ['中药特征明显', '图片清晰', '符合五行主题']
    );

    // 验证五行标识显示
    const wuxingBadge = await page.locator('[data-testid="wuxing-badge"]');
    await expect(wuxingBadge).toBeVisible();
  });

  test('使用线索应正确消耗钻石', async ({ page, ai }) => {
    // 打开性味归经弹窗
    await page.click('.crystal-ball-seed');
    await page.waitForSelector('[data-testid="diagnosis-modal"]');

    // 记录初始钻石
    const initialCurrency = await page.evaluate(() => {
      const storage = JSON.parse(localStorage.getItem('fangling-valley-v2-storage') || '{}');
      return storage.player?.currency || 0;
    });

    // 依次使用四气(5)和五味(10)
    await page.click('[data-testid="diagnosis-wen"]');
    await page.click('[data-testid="diagnosis-ask"]');

    // 验证钻石减少15
    const currentCurrency = await page.evaluate(() => {
      const storage = JSON.parse(localStorage.getItem('fangling-valley-v2-storage') || '{}');
      return storage.player?.currency || 0;
    });

    expect(currentCurrency).toBe(initialCurrency - 15);

    // AI验证：线索已显示
    await ai.validateLayout({
      expectedElements: ['四气信息', '五味信息', '毒性标识'],
      layoutRules: ['线索按顺序显示', '已探查标记清晰'],
    });
  });

  test('猜测正确应收集成功并获得奖励', async ({ page, ai }) => {
    // 获取种子的正确药名（通过store访问）
    const correctMedicineName = await page.evaluate(() => {
      const storage = JSON.parse(localStorage.getItem('fangling-valley-v2-storage') || '{}');
      const firstSeed = storage.seeds?.[0];
      if (!firstSeed) return null;
      const medicine = storage.medicines?.find((m: any) => m.id === firstSeed.medicineId);
      return medicine?.name;
    });

    test.skip(!correctMedicineName, '未找到可测试的种子');

    // 打开性味归经弹窗
    await page.click('.crystal-ball-seed');
    await page.waitForSelector('[data-testid="diagnosis-modal"]');

    // 记录初始钻石
    const initialCurrency = await page.evaluate(() => {
      const storage = JSON.parse(localStorage.getItem('fangling-valley-v2-storage') || '{}');
      return storage.player?.currency || 0;
    });

    // 输入正确答案
    await page.fill('[data-testid="guess-input"]', correctMedicineName);
    await page.click('[data-testid="guess-submit-btn"]');

    // 等待结果弹窗
    const resultModal = await page.locator('[data-testid="guess-result-modal"]');
    await expect(resultModal).toBeVisible();

    // AI验证：收集成功动画
    await ai.validateAnimation('收集成功动画（光芒爆发+飞入图鉴）', 1500);

    // AI验证：游戏逻辑
    await ai.validateGameLogic({
      userAction: '正确猜测药名',
      expectedOutcome: '种子标记为已收集，钻石增加，亲密度提升',
    });

    // 验证钻石增加（无线索100💎）
    const finalCurrency = await page.evaluate(() => {
      const storage = JSON.parse(localStorage.getItem('fangling-valley-v2-storage') || '{}');
      return storage.player?.currency || 0;
    });

    expect(finalCurrency).toBeGreaterThan(initialCurrency);
  });

  test('猜测错误应提示并扣除奖励', async ({ page, ai }) => {
    // 打开性味归经弹窗
    await page.click('.crystal-ball-seed');
    await page.waitForSelector('[data-testid="diagnosis-modal"]');

    // 输入错误答案
    await page.fill('[data-testid="guess-input"]', '错误药名');
    await page.click('[data-testid="guess-submit-btn"]');

    // 等待错误提示
    const errorModal = await page.locator('[data-testid="guess-fail-modal"]');
    await expect(errorModal).toBeVisible();

    // AI验证：错误提示布局
    await ai.validateLayout({
      expectedElements: ['错误图标', '提示文本', '继续按钮'],
      layoutRules: ['信息清晰', '按钮可点击'],
    });

    // 验证连续正确次数重置
    const correctGuesses = await page.evaluate(() => {
      const storage = JSON.parse(localStorage.getItem('fangling-valley-v2-storage') || '{}');
      return storage.player?.dailyStats?.correctGuesses || 0;
    });

    expect(correctGuesses).toBe(0);
  });

  test('查看答案应消耗50钻石', async ({ page }) => {
    // 确保有足够钻石
    await page.evaluate(() => {
      const storage = JSON.parse(localStorage.getItem('fangling-valley-v2-storage') || '{}');
      storage.player = { ...storage.player, currency: 100 };
      localStorage.setItem('fangling-valley-v2-storage', JSON.stringify(storage));
    });

    // 打开性味归经弹窗
    await page.click('.crystal-ball-seed');
    await page.waitForSelector('[data-testid="diagnosis-modal"]');

    const initialCurrency = await page.evaluate(() => {
      const storage = JSON.parse(localStorage.getItem('fangling-valley-v2-storage') || '{}');
      return storage.player?.currency || 0;
    });

    // 点击查看答案
    await page.click('[data-testid="show-answer-btn"]');

    // 确认消耗
    const confirmBtn = await page.locator('[data-testid="confirm-show-answer"]');
    await confirmBtn.click();

    // 验证答案显示
    const answerText = await page.locator('[data-testid="answer-display"]').textContent();
    expect(answerText).toBeTruthy();

    // 验证钻石减少50
    const finalCurrency = await page.evaluate(() => {
      const storage = JSON.parse(localStorage.getItem('fangling-valley-v2-storage') || '{}');
      return storage.player?.currency || 0;
    });

    expect(finalCurrency).toBe(initialCurrency - 50);
  });
});

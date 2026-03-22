/**
 * 方剂追缉系统端到端测试
 * 测试场景：追缉令→收集药材→完成方剂
 */

import { test, expect } from '../utils/ai-test-fixtures';

test.describe('方剂追缉系统', () => {
  test.beforeEach(async ({ page }) => {
    await page.waitForLoadState('networkidle');
  });

  test('追缉令应显示正确的进度', async ({ page, ai }) => {
    // 打开追缉令界面
    await page.click('[data-testid="formula-pursuit-btn"]');
    await page.waitForSelector('[data-testid="pursuit-list"]');

    // 选择一个追缉令查看详情
    await page.click('.pursuit-card:first-child');
    await page.waitForSelector('[data-testid="pursuit-detail-modal"]');

    // AI验证：详情弹窗布局
    await ai.validateLayout({
      expectedElements: ['方剂名称', '组成列表', '进度条', '剩余时间', '奖励信息'],
      layoutRules: ['组成列表清晰', '已收集/未收集区分明显', '进度直观'],
    });

    // 验证组成列表显示君药标识
    const junTags = await page.locator('[data-role="jun"]').count();
    expect(junTags).toBeGreaterThan(0);
  });

  test('收集药材应自动更新追缉进度', async ({ page, ai }) => {
    // 获取第一个追缉令所需的药材
    const neededMedicine = await page.evaluate(() => {
      const storage = JSON.parse(localStorage.getItem('fangling-valley-v2-storage') || '{}');
      const pursuit = storage.player?.activePursuits?.[0];
      if (!pursuit) return null;
      const formula = storage.formulas?.find((f: any) => f.id === pursuit.formulaId);
      if (!formula) return null;
      return {
        pursuitId: pursuit.id,
        medicineId: formula.composition[0].medicineId,
        medicineName: storage.medicines?.find((m: any) => m.id === formula.composition[0].medicineId)?.name,
      };
    });

    test.skip(!neededMedicine, '未找到追缉令数据');

    // 找到并收集该药材对应的种子
    const seedSelector = `[data-medicine-id="${neededMedicine.medicineId}"]`;
    const seed = await page.locator(seedSelector);

    // 如果种子不存在，可能需要先探索
    if (await seed.isVisible().catch(() => false)) {
      // 记录追缉令进度
      const initialProgress = await page.evaluate((pursuitId) => {
        const storage = JSON.parse(localStorage.getItem('fangling-valley-v2-storage') || '{}');
        const pursuit = storage.player?.activePursuits?.find((p: any) => p.id === pursuitId);
        return pursuit?.collectedMedicines?.length || 0;
      }, neededMedicine.pursuitId);

      // 打开性味归经弹窗并猜测正确
      await seed.click();
      await page.waitForSelector('[data-testid="diagnosis-modal"]');

      // 使用查看答案（简化测试）
      await page.click('[data-testid="show-answer-btn"]');
      await page.click('[data-testid="confirm-show-answer"]');

      // 输入答案
      await page.fill('[data-testid="guess-input"]', neededMedicine.medicineName);
      await page.click('[data-testid="guess-submit-btn"]');

      // 验证追缉令进度更新
      const updatedProgress = await page.evaluate((pursuitId) => {
        const storage = JSON.parse(localStorage.getItem('fangling-valley-v2-storage') || '{}');
        const pursuit = storage.player?.activePursuits?.find((p: any) => p.id === pursuitId);
        return pursuit?.collectedMedicines?.length || 0;
      }, neededMedicine.pursuitId);

      expect(updatedProgress).toBe(initialProgress + 1);

      // AI验证：进度更新逻辑
      await ai.validateGameLogic({
        userAction: '收集追缉令所需药材',
        expectedOutcome: '追缉令进度自动更新，该药材标记为已收集',
        gameState: { pursuitId: neededMedicine.pursuitId, medicineId: neededMedicine.medicineId },
      });
    }
  });

  test('完成方剂应发放奖励并解锁', async ({ page, ai }) => {
    // 模拟已完成所有药材收集的状态
    await page.evaluate(() => {
      const storage = JSON.parse(localStorage.getItem('fangling-valley-v2-storage') || '{}');
      const pursuit = storage.player?.activePursuits?.[0];
      if (pursuit) {
        const formula = storage.formulas?.find((f: any) => f.id === pursuit.formulaId);
        if (formula) {
          pursuit.collectedMedicines = formula.composition.map((c: any) => c.medicineId);
          pursuit.completed = false;
        }
      }
      localStorage.setItem('fangling-valley-v2-storage', JSON.stringify(storage));
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // 打开追缉令界面
    await page.click('[data-testid="formula-pursuit-btn"]');

    // 记录初始资源
    const initialCurrency = await page.evaluate(() => {
      const storage = JSON.parse(localStorage.getItem('fangling-valley-v2-storage') || '{}');
      return storage.player?.currency || 0;
    });

    const initialUnlockedCount = await page.evaluate(() => {
      const storage = JSON.parse(localStorage.getItem('fangling-valley-v2-storage') || '{}');
      return storage.player?.unlockedFormulas?.length || 0;
    });

    // 点击领取奖励按钮
    await page.click('.pursuit-card:first-child .complete-btn');

    // 等待完成动画
    await page.waitForTimeout(1000);

    // AI验证：完成动画效果
    await ai.validateAnimation('方剂完成动画（光芒爆发+奖励飞入）', 1500);

    // 验证奖励发放
    const finalCurrency = await page.evaluate(() => {
      const storage = JSON.parse(localStorage.getItem('fangling-valley-v2-storage') || '{}');
      return storage.player?.currency || 0;
    });

    expect(finalCurrency).toBeGreaterThan(initialCurrency);

    // 验证方剂解锁
    const finalUnlockedCount = await page.evaluate(() => {
      const storage = JSON.parse(localStorage.getItem('fangling-valley-v2-storage') || '{}');
      return storage.player?.unlockedFormulas?.length || 0;
    });

    expect(finalUnlockedCount).toBeGreaterThan(initialUnlockedCount);

    // AI验证：奖励逻辑
    await ai.validateGameLogic({
      userAction: '完成方剂追缉令',
      expectedOutcome: '钻石增加，方剂解锁，熟练度提升',
    });
  });

  test('方剂图鉴应显示熟练度进度', async ({ page, ai }) => {
    // 打开图鉴
    await page.click('[data-testid="collection-btn"]');
    await page.click('[data-testid="formula-tab"]');

    await page.waitForSelector('[data-testid="formula-collection"]');

    // AI验证：图鉴布局
    await ai.validateLayout({
      expectedElements: ['分类筛选', '方剂网格', '熟练度标识', '搜索框'],
      layoutRules: ['网格布局整齐', '熟练度星级清晰', '筛选器可用'],
    });

    // 点击一个已解锁方剂
    const unlockedFormula = await page.locator('.formula-card.unlocked').first();
    if (await unlockedFormula.isVisible().catch(() => false)) {
      await unlockedFormula.click();

      await page.waitForSelector('[data-testid="formula-detail-modal"]');

      // 验证熟练度标签页
      await page.click('[data-testid="tab-song"]');

      // AI验证：方歌显示（熟练度>=2解锁）
      await ai.validateLayout({
        expectedElements: ['方歌内容'],
        layoutRules: ['文本清晰可读'],
      });
    }
  });
});

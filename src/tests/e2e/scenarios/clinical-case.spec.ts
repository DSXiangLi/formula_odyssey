/**
 * 临床实习系统端到端测试
 * 测试场景：选择病案→答题→获得评分
 */

import { test, expect } from '../utils/ai-test-fixtures';

test.describe('临床实习系统', () => {
  test.beforeEach(async ({ page }) => {
    await page.waitForLoadState('networkidle');
  });

  test('病案列表应正确显示熟练度', async ({ page, ai }) => {
    // 打开临床实习
    await page.click('[data-testid="clinical-case-btn"]');

    await page.waitForSelector('[data-testid="clinical-case-list"]');

    // AI验证：病案列表布局
    await ai.validateLayout({
      expectedElements: ['方剂列表', '熟练度进度条', '病案数量', '已完成标记'],
      layoutRules: ['方剂分组清晰', '熟练度可视化', '进度直观'],
    });

    // 验证有临床病案数据
    const caseCount = await page.locator('.case-item').count();
    expect(caseCount).toBeGreaterThan(0);
  });

  test('答题应选择治法、方剂、君药', async ({ page, ai }) => {
    // 进入临床实习
    await page.click('[data-testid="clinical-case-btn"]');

    // 点击第一个病案
    await page.click('.case-item:first-child');

    await page.waitForSelector('[data-testid="clinical-case-modal"]');

    // AI验证：病案展示布局
    await ai.validateLayout({
      expectedElements: ['患者信息', '症状列表', '舌象脉象', '答题区域'],
      layoutRules: ['信息分组清晰', '症状标签化', '答题区域突出'],
    });

    // 选择治法
    await page.click('[data-testid="treatment-option"]:first-child');

    // 选择方剂
    await page.click('[data-testid="formula-option"]:first-child');

    // AI验证：君药选项应动态更新
    await ai.validateLayout({
      expectedElements: ['君药选项', '方剂组成相关药材'],
      layoutRules: ['选项来自所选方剂', '可多选'],
    });

    // 选择君药
    await page.click('[data-testid="jun-option"]:first-child');

    // 提交答案
    await page.click('[data-testid="submit-diagnosis-btn"]');

    // 等待结果
    await page.waitForSelector('[data-testid="diagnosis-result"]');
  });

  test('评分应正确计算并增长熟练度', async ({ page, ai }) => {
    // 获取测试病案的正确答案
    const correctAnswer = await page.evaluate(() => {
      const storage = JSON.parse(localStorage.getItem('fangling-valley-v2-storage') || '{}');
      const caseData = storage.clinicalCases?.[0];
      return {
        caseId: caseData?.id,
        treatment: caseData?.correctTreatment,
        formula: caseData?.correctFormula,
        jun: caseData?.correctJun,
      };
    });

    test.skip(!correctAnswer.caseId, '未找到病案数据');

    // 记录初始熟练度
    const initialProficiency = await page.evaluate((caseId) => {
      const storage = JSON.parse(localStorage.getItem('fangling-valley-v2-storage') || '{}');
      const caseData = storage.clinicalCases?.find((c: any) => c.id === caseId);
      return storage.player?.formulaProficiency?.[caseData?.formulaId] || 0;
    }, correctAnswer.caseId);

    // 进入病案并选择正确答案
    await page.click('[data-testid="clinical-case-btn"]');
    await page.click('.case-item:first-child');
    await page.waitForSelector('[data-testid="clinical-case-modal"]');

    // 选择正确答案
    await page.click(`[data-testid="treatment-option"]:has-text("${correctAnswer.treatment}")`);
    await page.click(`[data-testid="formula-option"]:has-text("${correctAnswer.formula}")`);

    // 选择君药
    const junOptions = correctAnswer.jun.split(/[,、，]/);
    for (const jun of junOptions) {
      const option = await page.locator(`[data-testid="jun-option"]:has-text("${jun.trim()}")`);
      if (await option.isVisible().catch(() => false)) {
        await option.click();
      }
    }

    // 提交
    await page.click('[data-testid="submit-diagnosis-btn"]');
    await page.waitForSelector('[data-testid="diagnosis-result"]');

    // AI验证：结果展示
    await ai.validateLayout({
      expectedElements: ['得分', '正确答案', '解析', '奖励'],
      layoutRules: ['得分突出显示', '错误标记清晰', '解析有帮助'],
    });

    // 验证熟练度增长
    const finalProficiency = await page.evaluate((caseId) => {
      const storage = JSON.parse(localStorage.getItem('fangling-valley-v2-storage') || '{}');
      const caseData = storage.clinicalCases?.find((c: any) => c.id === caseId);
      return storage.player?.formulaProficiency?.[caseData?.formulaId] || 0;
    }, correctAnswer.caseId);

    expect(finalProficiency).toBeGreaterThan(initialProficiency);

    // AI验证：评分逻辑
    await ai.validateGameLogic({
      userAction: '提交正确答案',
      expectedOutcome: '得高分(5分)，熟练度+2，获得200方灵石',
    });
  });

  test('使用提示应消耗50钻石', async ({ page }) => {
    // 确保有足够钻石
    await page.evaluate(() => {
      const storage = JSON.parse(localStorage.getItem('fangling-valley-v2-storage') || '{}');
      storage.player = { ...storage.player, currency: 100 };
      localStorage.setItem('fangling-valley-v2-storage', JSON.stringify(storage));
    });

    // 进入病案
    await page.click('[data-testid="clinical-case-btn"]');
    await page.click('.case-item:first-child');
    await page.waitForSelector('[data-testid="clinical-case-modal"]');

    const initialCurrency = await page.evaluate(() => {
      const storage = JSON.parse(localStorage.getItem('fangling-valley-v2-storage') || '{}');
      return storage.player?.currency || 0;
    });

    // 使用提示
    await page.click('[data-testid="use-hint-btn"]');

    // 验证提示显示
    const hintBox = await page.locator('[data-testid="hint-box"]');
    await expect(hintBox).toBeVisible();

    // 验证钻石减少
    const finalCurrency = await page.evaluate(() => {
      const storage = JSON.parse(localStorage.getItem('fangling-valley-v2-storage') || '{}');
      return storage.player?.currency || 0;
    });

    expect(finalCurrency).toBe(initialCurrency - 50);
  });

  test('已完成病案应显示完成标记', async ({ page }) => {
    // 模拟已完成状态
    await page.evaluate(() => {
      const storage = JSON.parse(localStorage.getItem('fangling-valley-v2-storage') || '{}');
      const caseId = storage.clinicalCases?.[0]?.id;
      if (caseId && !storage.player?.completedCases?.includes(caseId)) {
        storage.player.completedCases = [...(storage.player.completedCases || []), caseId];
      }
      localStorage.setItem('fangling-valley-v2-storage', JSON.stringify(storage));
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // 进入临床实习
    await page.click('[data-testid="clinical-case-btn"]');

    // 验证已完成标记
    const completedIcon = await page.locator('.case-item:first-child .completed-icon');
    await expect(completedIcon).toBeVisible();
  });
});

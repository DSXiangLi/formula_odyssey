/**
 * 登录流程端到端测试
 * 测试场景：每日登录→领取奖励→查看追缉令
 */

import { test, expect } from '../utils/ai-test-fixtures';

test.describe('登录流程', () => {
  test.beforeEach(async ({ page }) => {
    // 清除本地存储，模拟新用户
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();
  });

  test('首次登录应显示欢迎界面并初始化数据', async ({ page, ai }) => {
    // 等待页面加载
    await page.waitForLoadState('networkidle');

    // AI验证：初始界面布局正确
    await ai.validateLayout({
      expectedElements: ['导航栏', '山谷场景', '种子', '探索按钮', '图鉴按钮'],
      layoutRules: ['导航栏在顶部', '种子分布在场景中', '按钮在底部'],
      styleChecks: { colors: ['#1A1A1A', '#C9A961'], spacing: true },
    });

    // 验证初始资源
    const currency = await page.locator('[data-testid="currency-display"]').textContent();
    expect(currency).toContain('100'); // 初始100方灵石
  });

  test('每日登录应发放奖励', async ({ page, ai }) => {
    // 模拟前一天登录
    await page.evaluate(() => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const playerData = {
        currency: 100,
        lastLoginDate: yesterday.toISOString().split('T')[0],
        loginStreak: 3,
      };
      localStorage.setItem('fangling-valley-v2-storage', JSON.stringify({ player: playerData }));
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // 等待登录奖励弹窗
    const rewardModal = await page.locator('[data-testid="daily-reward-modal"]');
    await expect(rewardModal).toBeVisible();

    // AI验证：奖励弹窗显示正确
    await ai.validateLayout({
      expectedElements: ['奖励弹窗', '方灵石数量', '连续登录天数'],
      layoutRules: ['弹窗居中', '奖励信息清晰'],
    });

    // 领取奖励
    await page.click('[data-testid="claim-reward-btn"]');

    // AI验证：游戏逻辑正确
    await ai.validateGameLogic({
      userAction: '点击领取每日登录奖励',
      expectedOutcome: '方灵石增加，弹窗关闭，追缉令已生成',
    });

    // 验证追缉令已生成
    await page.click('[data-testid="formula-pursuit-btn"]');
    const pursuitList = await page.locator('[data-testid="pursuit-list"]');
    await expect(pursuitList).toBeVisible();

    // 验证有5个追缉令
    const pursuits = await page.locator('.pursuit-card').count();
    expect(pursuits).toBe(5);
  });

  test('追缉令列表应正确显示', async ({ page, ai }) => {
    await page.waitForLoadState('networkidle');

    // 打开追缉令界面
    await page.click('[data-testid="formula-pursuit-btn"]');

    // AI验证：追缉令列表布局
    await ai.validateLayout({
      expectedElements: ['追缉令列表', '难度标识', '进度条', '倒计时', '奖励预览'],
      layoutRules: ['卡片式布局', '难度标识醒目', '进度清晰'],
    });

    // 验证难度分布（1入门+2普通+1困难+1挑战）
    const easyCount = await page.locator('.difficulty-badge:has-text("入门")').count();
    const normalCount = await page.locator('.difficulty-badge:has-text("普通")').count();
    const hardCount = await page.locator('.difficulty-badge:has-text("困难")').count();
    const challengeCount = await page.locator('.difficulty-badge:has-text("挑战")').count();

    expect(easyCount).toBe(1);
    expect(normalCount).toBe(2);
    expect(hardCount).toBe(1);
    expect(challengeCount).toBe(1);
  });
});

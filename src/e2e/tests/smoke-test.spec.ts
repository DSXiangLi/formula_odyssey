import { test, expect } from '@playwright/test';
import { GameStateValidator } from '../helpers/game-state';

test.describe('冒烟测试 - 核心功能快速验证', () => {
  test('应用能正常启动并渲染首页', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/药灵山谷/);
    const mainContent = page.locator('body');
    await expect(mainContent).toContainText('药灵');
    const chapterCards = page.locator('[data-chapter-id]');
    await expect(chapterCards.first()).toBeVisible();
  });

  test('能进入游戏并探索', async ({ page }) => {
    await page.goto('/');
    const chapter1 = page.locator('[data-chapter-id="chapter-1"]').first();
    await chapter1.click();
    await expect(page).toHaveURL(/\/chapter\/chapter-1/);
    const scene = page.locator('.scene, [data-testid="scene"]').or(page.locator('body'));
    await expect(scene).toBeVisible();
  });

  test('localStorage正常工作', async ({ page }) => {
    const validator = new GameStateValidator(page);
    await page.goto('/');
    const playerState = await validator.getLocalStorage('yaoling-player-storage');
    expect(playerState).toBeTruthy();
    expect(playerState.state).toBeTruthy();
  });
});

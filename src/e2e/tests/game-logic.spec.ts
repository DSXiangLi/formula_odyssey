import { test, expect } from '@playwright/test';
import { GameStateValidator } from '../helpers/game-state';

test.describe('游戏逻辑自动化验证', () => {
  let validator: GameStateValidator;

  test.beforeEach(async ({ page }) => {
    validator = new GameStateValidator(page);
    await validator.clearAllData();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('新玩家应有正确的初始状态', async ({ page }) => {
    const playerState = await validator.getLocalStorage('yaoling-player-storage');
    expect(playerState?.state?.name).toBe('学徒');
    expect(playerState?.state?.level).toBe(1);
    expect(playerState?.state?.currency).toBe(100);
    expect(playerState?.state?.unlockedChapters).toContain('chapter-1');
  });

  test('localStorage中应有玩家数据', async ({ page }) => {
    const playerState = await validator.getLocalStorage('yaoling-player-storage');
    expect(playerState).toBeTruthy();
    expect(playerState.state).toBeTruthy();
  });

  test('货币不应为负数', async ({ page }) => {
    const playerState = await validator.getLocalStorage('yaoling-player-storage');
    expect(playerState?.state?.currency).toBeGreaterThanOrEqual(0);
  });
});

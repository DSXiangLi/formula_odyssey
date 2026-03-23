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
    // 验证初始状态：货币为100，收集数量为0
    const isValid = await validator.validatePlayerState({
      currency: 100,
      collectedMedicinesCount: 0,
      unlockedFormulasCount: 0,
    });
    expect(isValid).toBe(true);

    // 验证玩家名称 (v2.0中是'方灵师')
    const gameState = await validator.getGameState();
    expect(gameState?.state?.player?.name).toBe('方灵师');

    // 验证声望为0
    const reputation = gameState?.state?.player?.reputation ?? gameState?.state?.reputation;
    expect(reputation).toBe(0);
  });

  test('localStorage中应有玩家数据', async ({ page }) => {
    const gameState = await validator.getGameState();
    expect(gameState).toBeTruthy();
    expect(gameState?.state).toBeTruthy();
  });

  test('货币不应为负数', async ({ page }) => {
    const currency = await validator.getPlayerCurrency();
    expect(currency).not.toBeNull();
    expect(currency).toBeGreaterThanOrEqual(0);
  });

  test('收集的药材列表应为数组', async ({ page }) => {
    const collectedMedicines = await validator.getCollectedMedicines();
    expect(Array.isArray(collectedMedicines)).toBe(true);
  });
});

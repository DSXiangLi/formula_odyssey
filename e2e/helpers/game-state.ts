import { Page } from '@playwright/test';

// v2.0 存储键名
const V2_STORAGE_KEY = 'fangling-valley-v2-storage';
// v3.0 存储键名
const V3_STORAGE_KEY = 'fangling-valley-v3-storage';

// 存储状态类型
interface StorageState {
  state: {
    player?: {
      name?: string;
      currency?: number;
      reputation?: number;
      collectedMedicines?: string[];
      unlockedFormulas?: string[];
      medicineAffinity?: Record<string, number>;
      formulaProficiency?: Record<string, number>;
    };
    // v3.0 字段
    diamonds?: number;
    reputation?: number;
    collectedMedicines?: string[];
    collectedFormulas?: string[];
    completedChapters?: string[];
    chapterProgress?: Record<string, {
      collectedMedicines?: string[];
      bossDefeated?: boolean;
    }>;
  };
}

export class GameStateValidator {
  constructor(private page: Page) {}

  async getLocalStorage(key: string): Promise<StorageState | null> {
    try {
      return await this.page.evaluate((k) => {
        const item = localStorage.getItem(k);
        return item ? JSON.parse(item) : null;
      }, key);
    } catch (error) {
      console.error(`Failed to get localStorage key ${key}:`, error);
      return null;
    }
  }

  async getGameState(): Promise<StorageState | null> {
    // 优先尝试 v3.0 存储键，然后是 v2.0
    const v3State = await this.getLocalStorage(V3_STORAGE_KEY);
    if (v3State) return v3State;

    const v2State = await this.getLocalStorage(V2_STORAGE_KEY);
    if (v2State) return v2State;

    return null;
  }

  async validatePlayerState(expected: {
    name?: string;
    currency?: number;
    reputation?: number;
    collectedMedicinesCount?: number;
    unlockedFormulasCount?: number;
  }): Promise<boolean> {
    const gameState = await this.getGameState();
    if (!gameState?.state) return false;

    const state = gameState.state;

    // 检查玩家名称 (v2.0 使用 player.name)
    if (expected.name !== undefined) {
      const playerName = state.player?.name;
      if (playerName !== expected.name) {
        console.log(`Name mismatch: expected ${expected.name}, got ${playerName}`);
        return false;
      }
    }

    // 检查货币 (v2.0 使用 player.currency, v3.0 使用 diamonds)
    if (expected.currency !== undefined) {
      const currency = state.player?.currency ?? state.diamonds;
      if (currency !== expected.currency) {
        console.log(`Currency mismatch: expected ${expected.currency}, got ${currency}`);
        return false;
      }
    }

    // 检查声望
    if (expected.reputation !== undefined) {
      const reputation = state.player?.reputation ?? state.reputation;
      if (reputation !== expected.reputation) {
        console.log(`Reputation mismatch: expected ${expected.reputation}, got ${reputation}`);
        return false;
      }
    }

    // 检查已收集药材数量
    if (expected.collectedMedicinesCount !== undefined) {
      const count = state.player?.collectedMedicines?.length ?? state.collectedMedicines?.length ?? 0;
      if (count !== expected.collectedMedicinesCount) {
        console.log(`Collected medicines count mismatch: expected ${expected.collectedMedicinesCount}, got ${count}`);
        return false;
      }
    }

    // 检查已解锁方剂数量
    if (expected.unlockedFormulasCount !== undefined) {
      const count = state.player?.unlockedFormulas?.length ?? state.collectedFormulas?.length ?? 0;
      if (count !== expected.unlockedFormulasCount) {
        console.log(`Unlocked formulas count mismatch: expected ${expected.unlockedFormulasCount}, got ${count}`);
        return false;
      }
    }

    return true;
  }

  async validateChapterProgress(
    chapterId: string,
    expected: {
      bossDefeated?: boolean;
      collectedMedicines?: string[];
    }
  ): Promise<boolean> {
    const gameState = await this.getGameState();
    if (!gameState?.state) return false;

    const state = gameState.state;

    // v3.0 章节进度结构
    const progress = state.chapterProgress?.[chapterId];
    if (!progress) {
      console.log(`Chapter ${chapterId} progress not found`);
      return false;
    }

    // 检查Boss击败状态
    if (expected.bossDefeated !== undefined) {
      if (progress.bossDefeated !== expected.bossDefeated) {
        console.log(`Boss defeated mismatch: expected ${expected.bossDefeated}, got ${progress.bossDefeated}`);
        return false;
      }
    }

    // 检查已收集药材
    if (expected.collectedMedicines) {
      for (const medicine of expected.collectedMedicines) {
        if (!progress.collectedMedicines?.includes(medicine)) {
          console.log(`Medicine ${medicine} not found in chapter progress`);
          return false;
        }
      }
    }

    return true;
  }

  async validateChapterCompleted(chapterId: string): Promise<boolean> {
    const gameState = await this.getGameState();
    if (!gameState?.state) return false;

    const completed = gameState.state.completedChapters ?? [];
    return completed.includes(chapterId);
  }

  async clearAllData(): Promise<void> {
    await this.page.evaluate(({ v2Key, v3Key }) => {
      // 清除 v2.0 和 v3.0 存储键
      localStorage.removeItem(v2Key);
      localStorage.removeItem(v3Key);

      // 清除所有相关备份
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith(v2Key) || key.startsWith(v3Key))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    }, { v2Key: V2_STORAGE_KEY, v3Key: V3_STORAGE_KEY });
  }

  async getPlayerCurrency(): Promise<number | null> {
    const gameState = await this.getGameState();
    if (!gameState?.state) return null;

    // v2.0 使用 player.currency, v3.0 使用 diamonds
    return gameState.state.player?.currency ?? gameState.state.diamonds ?? null;
  }

  async getCollectedMedicines(): Promise<string[]> {
    const gameState = await this.getGameState();
    if (!gameState?.state) return [];

    return gameState.state.player?.collectedMedicines ?? gameState.state.collectedMedicines ?? [];
  }
}

import { Page } from '@playwright/test';

export class GameStateValidator {
  constructor(private page: Page) {}

  async getLocalStorage(key: string): Promise<any> {
    return this.page.evaluate((k) => {
      const item = localStorage.getItem(k);
      return item ? JSON.parse(item) : null;
    }, key);
  }

  async validatePlayerState(expected: {
    name?: string;
    level?: number;
    currency?: number;
    unlockedChapters?: string[];
  }): Promise<boolean> {
    const playerState = await this.getLocalStorage('yaoling-player-storage');
    if (expected.name && playerState?.state?.name !== expected.name) {
      return false;
    }
    if (expected.level && playerState?.state?.level !== expected.level) {
      return false;
    }
    if (expected.currency !== undefined && playerState?.state?.currency !== expected.currency) {
      return false;
    }
    if (expected.unlockedChapters) {
      for (const chapter of expected.unlockedChapters) {
        if (!playerState?.state?.unlockedChapters?.includes(chapter)) {
          return false;
        }
      }
    }
    return true;
  }

  async validateChapterProgress(
    chapterId: string,
    expected: {
      completedStages?: string[];
      collectedMedicines?: string[];
    }
  ): Promise<boolean> {
    const chapterState = await this.getLocalStorage('yaoling-chapter-storage');
    const progress = chapterState?.state?.progress?.[chapterId];
    if (!progress) return false;
    if (expected.completedStages) {
      for (const stage of expected.completedStages) {
        if (!progress.completedStages?.includes(stage)) {
          return false;
        }
      }
    }
    if (expected.collectedMedicines) {
      for (const medicine of expected.collectedMedicines) {
        if (!progress.collectedMedicines?.includes(medicine)) {
          return false;
        }
      }
    }
    return true;
  }

  async clearAllData(): Promise<void> {
    await this.page.evaluate(() => {
      localStorage.clear();
    });
  }
}

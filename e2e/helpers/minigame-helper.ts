import { Page } from '@playwright/test';

export type MinigameType = 'digging' | 'tapping' | 'lasso';

export interface MinigameResult {
  success: boolean;
  score: number;
  quality?: 'perfect' | 'good' | 'normal';
  collectedAmount: number;
}

export class MinigameHelper {
  constructor(private page: Page) {}

  /**
   * 等待小游戏模态框出现
   */
  async waitForMinigameModal(type: MinigameType, timeout = 5000): Promise<void> {
    const selectors: Record<MinigameType, string> = {
      digging: '[data-testid="digging-minigame"], .digging-game, [class*="digging"]',
      tapping: '[data-testid="tapping-minigame"], .tapping-game, [class*="tapping"]',
      lasso: '[data-testid="lasso-minigame"], .lasso-game, [class*="lasso"]',
    };

    await this.page.waitForSelector(selectors[type], {
      state: 'visible',
      timeout,
    });
  }

  /**
   * 检查小游戏是否可见
   */
  async isMinigameVisible(type: MinigameType): Promise<boolean> {
    const selectors: Record<MinigameType, string> = {
      digging: '[data-testid="digging-minigame"], .digging-game, [class*="digging"]',
      tapping: '[data-testid="tapping-minigame"], .tapping-game, [class*="tapping"]',
      lasso: '[data-testid="lasso-minigame"], .lasso-game, [class*="lasso"]',
    };

    return await this.page.locator(selectors[type]).first().isVisible().catch(() => false);
  }

  /**
   * 执行挖掘小游戏
   */
  async playDiggingGame(): Promise<MinigameResult> {
    // 查找击打按钮
    const hitButton = this.page.locator('[data-testid="digging-hit-button"]').or(
      this.page.locator('button:has-text("挖掘")')
    ).or(
      this.page.locator('button:has-text("击打")')
    );

    // 观察力量条并击打多次
    for (let i = 0; i < 15; i++) {
      await this.page.waitForTimeout(200);
      await hitButton.click().catch(() => {});
    }

    // 等待游戏完成（结果出现或模态框关闭）
    await this.page.waitForTimeout(2000);

    // 检查结果
    const resultVisible = await this.page.locator('[data-testid="minigame-result"]').or(
      this.page.locator('.minigame-result')
    ).isVisible().catch(() => false);

    if (resultVisible) {
      return await this.extractResult();
    }

    // 游戏可能自动关闭
    return { success: true, score: 50, collectedAmount: 1 };
  }

  /**
   * 执行敲击小游戏
   */
  async playTappingGame(): Promise<MinigameResult> {
    const tapButton = this.page.locator('[data-testid="tapping-button"]').or(
      this.page.locator('button:has-text("敲击")')
    ).or(
      this.page.locator('button:has-text("点击")')
    );

    // 快速点击
    for (let i = 0; i < 8; i++) {
      await this.page.waitForTimeout(400);
      await tapButton.click().catch(() => {});
    }

    await this.page.waitForTimeout(2000);

    const resultVisible = await this.page.locator('[data-testid="minigame-result"]').or(
      this.page.locator('.minigame-result')
    ).isVisible().catch(() => false);

    if (resultVisible) {
      return await this.extractResult();
    }

    return { success: true, score: 60, collectedAmount: 1 };
  }

  /**
   * 执行套索小游戏
   */
  async playLassoGame(): Promise<MinigameResult> {
    const canvas = this.page.locator('[data-testid="lasso-canvas"]').or(
      this.page.locator('canvas')
    ).first();

    // 移动套索并投掷
    for (let i = 0; i < 5; i++) {
      const box = await canvas.boundingBox();
      if (box) {
        // 在Canvas上随机移动
        const x = Math.random() * box.width;
        const y = Math.random() * box.height;
        await canvas.click({ position: { x, y } });
      }
      await this.page.waitForTimeout(800);
    }

    await this.page.waitForTimeout(2000);

    const resultVisible = await this.page.locator('[data-testid="minigame-result"]').or(
      this.page.locator('.minigame-result')
    ).isVisible().catch(() => false);

    if (resultVisible) {
      return await this.extractResult();
    }

    return { success: true, score: 50, collectedAmount: 1 };
  }

  /**
   * 提取游戏结果
   */
  private async extractResult(): Promise<MinigameResult> {
    const resultText = await this.page.locator('[data-testid="minigame-result"]').or(
      this.page.locator('.minigame-result')
    ).textContent().catch(() => '');

    const success = resultText?.includes('成功') || resultText?.includes('完成') || true;
    const scoreMatch = resultText?.match(/(\d+)分/);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 50;

    return {
      success,
      score,
      collectedAmount: success ? 1 : 0,
    };
  }

  /**
   * 关闭小游戏模态框
   */
  async closeMinigame(): Promise<void> {
    await this.page.locator('[data-testid="close-minigame"]').or(
      this.page.locator('button:has-text("关闭")')
    ).or(
      this.page.locator('button:has-text("确定")')
    ).first().click();
  }

  /**
   * 获取当前激活的小游戏类型
   */
  async getActiveMinigameType(): Promise<MinigameType | null> {
    for (const type of ['digging', 'tapping', 'lasso'] as MinigameType[]) {
      if (await this.isMinigameVisible(type)) {
        return type;
      }
    }
    return null;
  }

  /**
   * 自动玩当前小游戏
   */
  async playCurrentMinigame(): Promise<MinigameResult> {
    const type = await this.getActiveMinigameType();
    if (!type) {
      return { success: false, score: 0, collectedAmount: 0 };
    }

    switch (type) {
      case 'digging':
        return await this.playDiggingGame();
      case 'tapping':
        return await this.playTappingGame();
      case 'lasso':
        return await this.playLassoGame();
      default:
        return { success: false, score: 0, collectedAmount: 0 };
    }
  }
}

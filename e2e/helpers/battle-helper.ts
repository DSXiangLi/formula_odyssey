import { Page, Locator } from '@playwright/test';

/**
 * 战斗系统测试助手
 */
export class BattleHelper {
  constructor(private page: Page) {}

  /**
   * 等待战斗场景加载
   */
  async waitForBattleLoad(): Promise<void> {
    await this.page.waitForSelector('[data-testid="battle-scene"]', { timeout: 10000 });
    await this.page.waitForTimeout(500); // 等待初始动画
  }

  /**
   * 验证战斗场景元素
   */
  async verifyBattleElements(): Promise<boolean> {
    const elements = [
      '[data-testid="battle-header"]',
      '[data-testid="enemy-field"]',
      '[data-testid="battle-input"]',
      '[data-testid="skill-bar"]',
      '[data-testid="health-bar"]',
      '[data-testid="wave-indicator"]',
    ];

    for (const selector of elements) {
      const visible = await this.page.locator(selector).isVisible().catch(() => false);
      if (!visible) {
        console.log(`Battle element not found: ${selector}`);
        return false;
      }
    }
    return true;
  }

  /**
   * 获取当前波次
   */
  async getCurrentWave(): Promise<number> {
    const waveText = await this.page.locator('[data-testid="wave-indicator"]').textContent();
    const match = waveText?.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * 获取当前输入值
   */
  async getInputValue(): Promise<string> {
    return await this.page.locator('[data-testid="battle-input"]').inputValue();
  }

  /**
   * 输入答案
   */
  async typeAnswer(answer: string): Promise<void> {
    const input = this.page.locator('[data-testid="battle-input"]');
    await input.focus();
    await input.fill(answer);
  }

  /**
   * 提交答案（回车）
   */
  async submitAnswer(): Promise<void> {
    await this.page.keyboard.press('Enter');
    await this.page.waitForTimeout(300); // 等待攻击动画
  }

  /**
   * 获取可见敌人数量
   */
  async getEnemyCount(): Promise<number> {
    return await this.page.locator('[data-testid="enemy"]').count();
  }

  /**
   * 获取第一个敌人的目标文本
   */
  async getFirstEnemyTarget(): Promise<string> {
    const targetText = await this.page.locator('[data-testid="enemy-target-text"]').first().textContent();
    return targetText || '';
  }

  /**
   * 使用技能
   */
  async useSkill(skillId: string): Promise<void> {
    const skillButton = this.page.locator(`[data-testid="skill-${skillId}"]`);
    await skillButton.click();
    await this.page.waitForTimeout(500); // 等待技能动画
  }

  /**
   * 获取当前血量
   */
  async getCurrentHealth(): Promise<number> {
    const healthText = await this.page.locator('[data-testid="health-bar"]').textContent();
    const match = healthText?.match(/(\d+)\s*\/\s*(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * 获取最大血量
   */
  async getMaxHealth(): Promise<number> {
    const healthText = await this.page.locator('[data-testid="health-bar"]').textContent();
    const match = healthText?.match(/(\d+)\s*\/\s*(\d+)/);
    return match ? parseInt(match[2]) : 100;
  }

  /**
   * 获取当前得分
   */
  async getScore(): Promise<number> {
    const scoreText = await this.page.locator('[data-testid="score-display"]').textContent();
    const match = scoreText?.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * 获取连击数
   */
  async getCombo(): Promise<number> {
    const comboText = await this.page.locator('[data-testid="combo-display"]').textContent();
    const match = comboText?.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * 等待波次开始
   */
  async waitForWaveStart(waveNumber: number): Promise<void> {
    await this.page.waitForFunction(
      (wave) => {
        const waveText = document.querySelector('[data-testid="wave-indicator"]')?.textContent;
        return waveText?.includes(`第 ${wave} 波`);
      },
      waveNumber,
      { timeout: 10000 }
    );
  }

  /**
   * 检查战斗是否结束
   */
  async isBattleEnded(): Promise<boolean> {
    const endScreen = await this.page.locator('[data-testid="battle-end-screen"]').isVisible().catch(() => false);
    return endScreen;
  }

  /**
   * 获取战斗结果
   */
  async getBattleResult(): Promise<'victory' | 'defeat' | null> {
    const victory = await this.page.locator('[data-testid="victory-screen"]').isVisible().catch(() => false);
    if (victory) return 'victory';

    const defeat = await this.page.locator('[data-testid="defeat-screen"]').isVisible().catch(() => false);
    if (defeat) return 'defeat';

    return null;
  }

  /**
   * 等待敌人出现
   */
  async waitForEnemies(timeout = 5000): Promise<void> {
    await this.page.waitForSelector('[data-testid="enemy"]', { timeout });
  }

  /**
   * 完成一波次（击败所有敌人）
   */
  async completeWave(): Promise<void> {
    const maxAttempts = 20;
    for (let i = 0; i < maxAttempts; i++) {
      const enemies = await this.getEnemyCount();
      if (enemies === 0) break;

      const target = await this.getFirstEnemyTarget();
      if (target) {
        await this.typeAnswer(target);
        await this.submitAnswer();
      }
      await this.page.waitForTimeout(200);
    }
  }

  /**
   * 执行完整战斗
   */
  async completeBattle(): Promise<{ score: number; maxCombo: number; victory: boolean }> {
    const startTime = Date.now();
    const maxDuration = 5 * 60 * 1000; // 5分钟超时

    while (Date.now() - startTime < maxDuration) {
      const result = await this.getBattleResult();
      if (result) {
        const score = await this.getScore();
        const combo = await this.getCombo();
        return { score, maxCombo: combo, victory: result === 'victory' };
      }

      // 继续战斗
      await this.completeWave();
      await this.page.waitForTimeout(500);
    }

    throw new Error('Battle timeout');
  }
}

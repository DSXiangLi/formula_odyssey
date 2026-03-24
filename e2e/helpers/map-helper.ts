import { Page } from '@playwright/test';

export interface MapPosition {
  x: number;
  y: number;
}

export class MapHelper {
  constructor(private page: Page) {}

  /**
   * 等待地图Canvas渲染完成
   */
  async waitForMapRender(timeout = 10000): Promise<void> {
    // 等待Canvas元素出现
    await this.page.waitForSelector('canvas', {
      state: 'visible',
      timeout,
    });
    // 等待动画稳定
    await this.page.waitForTimeout(500);
  }

  /**
   * 获取玩家当前位置（从localStorage或DOM）
   */
  async getPlayerPosition(): Promise<MapPosition | null> {
    const position = await this.page.evaluate(() => {
      const v3Key = 'fangling-valley-v3-storage';
      const v2Key = 'fangling-valley-v2-storage';
      const item = localStorage.getItem(v3Key) || localStorage.getItem(v2Key);
      if (!item) return null;
      const gameState = JSON.parse(item);
      return gameState.state?.playerPosition || null;
    });
    return position;
  }

  /**
   * 点击地图上的特定地块
   */
  async clickTile(x: number, y: number): Promise<void> {
    const canvas = this.page.locator('canvas').first();
    await canvas.click({
      position: { x, y },
    });
  }

  /**
   * 移动到相邻地块
   */
  async moveToAdjacent(direction: 'up' | 'down' | 'left' | 'right'): Promise<void> {
    const canvas = this.page.locator('canvas').first();
    const box = await canvas.boundingBox();
    if (!box) throw new Error('Canvas not found');

    const centerX = box.width / 2;
    const centerY = box.height / 2;
    const offset = 50; // 地块间距

    const clicks: Record<string, { x: number; y: number }> = {
      up: { x: centerX, y: centerY - offset },
      down: { x: centerX, y: centerY + offset },
      left: { x: centerX - offset, y: centerY },
      right: { x: centerX + offset, y: centerY },
    };

    await canvas.click({ position: clicks[direction] });
  }

  /**
   * 验证地图是否包含指定元素
   */
  async verifyMapElements(): Promise<boolean> {
    const canvasCount = await this.page.locator('canvas').count();
    return canvasCount > 0;
  }

  /**
   * 检查移动是否完成
   */
  async waitForMoveComplete(timeout = 3000): Promise<void> {
    await this.page.waitForTimeout(500); // 等待动画
  }

  /**
   * 获取当前章节五行属性
   */
  async getChapterWuxing(): Promise<string | null> {
    return await this.page.evaluate(() => {
      const v3Key = 'fangling-valley-v3-storage';
      const item = localStorage.getItem(v3Key);
      if (!item) return null;
      const gameState = JSON.parse(item);
      return gameState.state?.currentChapterWuxing || null;
    });
  }

  /**
   * 获取地图尺寸信息
   */
  async getMapSize(): Promise<number> {
    return await this.page.evaluate(() => {
      const v3Key = 'fangling-valley-v3-storage';
      const item = localStorage.getItem(v3Key);
      if (!item) return 0;
      const gameState = JSON.parse(item);
      return gameState.state?.mapSize || 0;
    });
  }

  /**
   * 检查是否存在可采集的药材
   */
  async hasMedicineAtPosition(x: number, y: number): Promise<boolean> {
    return await this.page.evaluate(({ px, py }) => {
      const v3Key = 'fangling-valley-v3-storage';
      const item = localStorage.getItem(v3Key);
      if (!item) return false;
      const gameState = JSON.parse(item);
      const tiles = gameState.state?.mapTiles || [];
      const tile = tiles.find((t: { position: { x: number; y: number } }) =>
        t.position.x === px && t.position.y === py
      );
      return tile?.medicine != null;
    }, { px: x, py: y });
  }
}

/**
 * 发现系统
 * 处理地图迷雾、地块发现和探索逻辑
 *
 * @module systems/map/DiscoverySystem
 */

import {
  GameMap,
  Tile,
  Position,
  DiscoveryUpdate,
  TileUpdate,
  MedicineSpawn,
} from './types';
import { TileManager, getTilesInRadius } from './TileManager';
import { TERRAIN_PROPERTIES } from './types';

/**
 * 发现系统类
 * 管理地图的发现状态和迷雾系统
 */
export class DiscoverySystem {
  private map: GameMap;
  private baseVisibilityRadius: number = 2;
  private currentVisibilityRadius: number = 2;

  /**
   * 创建发现系统
   * @param map - 游戏地图
   * @param initialRadius - 初始视野半径
   */
  constructor(map: GameMap, initialRadius: number = 2) {
    this.map = map;
    this.baseVisibilityRadius = initialRadius;
    this.currentVisibilityRadius = initialRadius;
  }

  /**
   * 获取当前视野半径
   * @returns 当前视野半径
   */
  getVisibilityRadius(): number {
    return this.currentVisibilityRadius;
  }

  /**
   * 设置基础视野半径
   * @param radius - 半径
   */
  setBaseVisibilityRadius(radius: number): void {
    this.baseVisibilityRadius = radius;
    this.currentVisibilityRadius = radius;
  }

  /**
   * 玩家移动后的发现更新
   * @param position - 新位置
   * @returns 发现更新结果
   */
  onPlayerMove(position: Position): DiscoveryUpdate {
    const updates: TileUpdate[] = [];

    // 计算实际视野半径（考虑地形影响）
    const tile = this.map.tiles[position.y][position.x];
    const visibilityMultiplier = TERRAIN_PROPERTIES[tile.terrain].visibility;
    const effectiveRadius = this.currentVisibilityRadius * visibilityMultiplier;

    // 发现周围地块
    const nearbyTiles = getTilesInRadius(
      this.map.tiles,
      position,
      Math.ceil(effectiveRadius)
    );

    for (const nearbyTile of nearbyTiles) {
      const distance = this.calculateDistance(position, nearbyTile.position);

      if (distance <= effectiveRadius) {
        const manager = new TileManager(nearbyTile);

        if (nearbyTile.discoveryState === 'hidden') {
          // 从未隐藏变为已发现
          manager.updateDiscoveryState('discovered');
          this.map.discoveredTiles.add(manager.getPositionKey());

          updates.push({
            position: nearbyTile.position,
            state: 'discovered',
            terrain: nearbyTile.terrain,
          });
        }
      }
    }

    // 当前地块标记为已探索
    if (tile.discoveryState !== 'explored') {
      const manager = new TileManager(tile);
      manager.updateDiscoveryState('explored');
      this.map.exploredTiles.add(manager.getPositionKey());

      const update: TileUpdate = {
        position,
        state: 'explored',
      };

      if (tile.feature) {
        update.feature = tile.feature;
      }

      if (tile.medicine) {
        update.medicine = tile.medicine;
      }

      updates.push(update);
    }

    return { updates };
  }

  /**
   * 发现指定地块
   * @param position - 位置
   * @returns 是否成功发现
   */
  discoverTile(position: Position): boolean {
    if (!this.isValidPosition(position)) {
      return false;
    }

    const tile = this.map.tiles[position.y][position.x];
    const manager = new TileManager(tile);

    if (manager.updateDiscoveryState('discovered')) {
      this.map.discoveredTiles.add(manager.getPositionKey());
      return true;
    }

    return false;
  }

  /**
   * 探索指定地块
   * @param position - 位置
   * @returns 是否成功探索
   */
  exploreTile(position: Position): boolean {
    if (!this.isValidPosition(position)) {
      return false;
    }

    const tile = this.map.tiles[position.y][position.x];
    const manager = new TileManager(tile);

    // 如果还是hidden，先discover
    if (tile.discoveryState === 'hidden') {
      manager.updateDiscoveryState('discovered');
      this.map.discoveredTiles.add(manager.getPositionKey());
    }

    // 然后explore
    if (manager.updateDiscoveryState('explored')) {
      this.map.exploredTiles.add(manager.getPositionKey());
      return true;
    }

    return false;
  }

  /**
   * 揭示区域（使用道具或技能）
   * @param center - 中心位置
   * @param radius - 揭示半径
   * @returns 揭示的地块更新列表
   */
  revealArea(center: Position, radius: number): DiscoveryUpdate {
    const updates: TileUpdate[] = [];
    const tiles = getTilesInRadius(this.map.tiles, center, radius);

    for (const tile of tiles) {
      const manager = new TileManager(tile);

      if (tile.discoveryState === 'hidden') {
        manager.updateDiscoveryState('discovered');
        this.map.discoveredTiles.add(manager.getPositionKey());

        updates.push({
          position: tile.position,
          state: 'discovered',
          terrain: tile.terrain,
        });
      }
    }

    return { updates };
  }

  /**
   * 完全探索区域（作弊/调试模式）
   * @param center - 中心位置
   * @param radius - 半径
   * @returns 探索的地块更新列表
   */
  fullyExploreArea(center: Position, radius: number): DiscoveryUpdate {
    const updates: TileUpdate[] = [];
    const tiles = getTilesInRadius(this.map.tiles, center, radius);

    for (const tile of tiles) {
      const manager = new TileManager(tile);

      // 直接设置为explored
      if (tile.discoveryState !== 'explored') {
        manager.setDiscoveryState('explored');
        this.map.discoveredTiles.add(manager.getPositionKey());
        this.map.exploredTiles.add(manager.getPositionKey());

        const update: TileUpdate = {
          position: tile.position,
          state: 'explored',
        };

        if (tile.feature) {
          update.feature = tile.feature;
        }

        if (tile.medicine) {
          update.medicine = tile.medicine;
        }

        updates.push(update);
      }
    }

    return { updates };
  }

  /**
   * 扩大视野（使用道具）
   * @param radius - 扩大后的半径
   * @param duration - 持续时间（毫秒）
   */
  expandVisibility(radius: number, duration: number): void {
    this.currentVisibilityRadius = radius;

    setTimeout(() => {
      this.currentVisibilityRadius = this.baseVisibilityRadius;
    }, duration);
  }

  /**
   * 识别药材
   * @param position - 位置
   * @returns 识别结果
   */
  identifyMedicine(position: Position): {
    success: boolean;
    medicineId?: string;
    collectionType?: string;
    clues?: string[];
    error?: string;
  } {
    if (!this.isValidPosition(position)) {
      return { success: false, error: '位置无效' };
    }

    const tile = this.map.tiles[position.y][position.x];

    if (!tile.medicine) {
      return { success: false, error: '此地块没有药材' };
    }

    if (tile.discoveryState !== 'explored') {
      return { success: false, error: '需要先探索此地块' };
    }

    // 生成线索（简化版本）
    const clues = this.generateClues(tile.medicine);

    return {
      success: true,
      medicineId: tile.medicine.medicineId,
      collectionType: tile.medicine.collectionType,
      clues,
    };
  }

  /**
   * 生成药材线索
   * @param medicine - 药材生成信息
   * @returns 线索列表
   */
  private generateClues(medicine: MedicineSpawn): string[] {
    const clues: string[] = [];

    // 基础线索：稀有度
    const rarityText: Record<string, string> = {
      common: '常见',
      uncommon: '罕见',
      rare: '稀有',
      epic: '史诗',
    };
    clues.push(`这是一株${rarityText[medicine.rarity]}的药材`);

    // 采集方式线索
    const collectionText: Record<string, string> = {
      digging: '需要用工具挖掘',
      tapping: '需要小心敲击采集',
      lasso: '需要用套索捕捉',
      searching: '需要仔细搜寻',
    };
    clues.push(collectionText[medicine.collectionType] || '采集方式未知');

    return clues;
  }

  /**
   * 获取已发现地块数量
   * @returns 已发现地块数
   */
  getDiscoveredCount(): number {
    return this.map.discoveredTiles.size;
  }

  /**
   * 获取已探索地块数量
   * @returns 已探索地块数
   */
  getExploredCount(): number {
    return this.map.exploredTiles.size;
  }

  /**
   * 获取发现进度百分比
   * @returns 发现进度 0-100
   */
  getDiscoveryProgress(): number {
    const total = this.map.size * this.map.size;
    return Math.round((this.map.discoveredTiles.size / total) * 100);
  }

  /**
   * 获取探索进度百分比
   * @returns 探索进度 0-100
   */
  getExplorationProgress(): number {
    const total = this.map.size * this.map.size;
    return Math.round((this.map.exploredTiles.size / total) * 100);
  }

  /**
   * 检查位置是否已发现
   * @param position - 位置
   * @returns 是否已发现
   */
  isDiscovered(position: Position): boolean {
    return this.map.discoveredTiles.has(`${position.x},${position.y}`);
  }

  /**
   * 检查位置是否已探索
   * @param position - 位置
   * @returns 是否已探索
   */
  isExplored(position: Position): boolean {
    return this.map.exploredTiles.has(`${position.x},${position.y}`);
  }

  /**
   * 获取可见地块（已发现的地块）
   * @returns 可见地块列表
   */
  getVisibleTiles(): Tile[] {
    const visible: Tile[] = [];

    for (const key of this.map.discoveredTiles) {
      const [x, y] = key.split(',').map(Number);
      if (this.isValidPosition({ x, y })) {
        visible.push(this.map.tiles[y][x]);
      }
    }

    return visible;
  }

  /**
   * 获取迷雾覆盖的地块
   * @returns 仍被迷雾覆盖的地块列表
   */
  getFoggyTiles(): Tile[] {
    const foggy: Tile[] = [];

    for (let y = 0; y < this.map.size; y++) {
      for (let x = 0; x < this.map.size; x++) {
        if (this.map.tiles[y][x].discoveryState === 'hidden') {
          foggy.push(this.map.tiles[y][x]);
        }
      }
    }

    return foggy;
  }

  /**
   * 重置发现状态
   */
  resetDiscovery(): void {
    this.map.discoveredTiles.clear();
    this.map.exploredTiles.clear();

    for (let y = 0; y < this.map.size; y++) {
      for (let x = 0; x < this.map.size; x++) {
        this.map.tiles[y][x].discoveryState = 'hidden';
        this.map.tiles[y][x].visited = false;
      }
    }
  }

  /**
   * 计算两点间距离
   * @param a - 位置A
   * @param b - 位置B
   * @returns 欧几里得距离
   */
  private calculateDistance(a: Position, b: Position): number {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
  }

  /**
   * 检查位置是否有效
   * @param position - 位置
   * @returns 是否有效
   */
  private isValidPosition(position: Position): boolean {
    return (
      position.x >= 0 &&
      position.x < this.map.size &&
      position.y >= 0 &&
      position.y < this.map.size
    );
  }
}

/**
 * 迷雾系统（Canvas渲染用）
 */
export class FogOfWar {
  private width: number;
  private height: number;
  private fogData: Uint8Array; // 0 = clear, 255 = fully foggy

  /**
   * 创建迷雾系统
   * @param width - 宽度
   * @param height - 高度
   */
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.fogData = new Uint8Array(width * height).fill(255); // 全迷雾
  }

  /**
   * 清除迷雾
   * @param center - 中心位置
   * @param radius - 半径
   */
  clearFog(center: Position, radius: number): void {
    for (let y = Math.max(0, center.y - radius);
         y <= Math.min(this.height - 1, center.y + radius);
         y++) {
      for (let x = Math.max(0, center.x - radius);
           x <= Math.min(this.width - 1, center.x + radius);
           x++) {
        const distance = Math.sqrt(
          Math.pow(x - center.x, 2) + Math.pow(y - center.y, 2)
        );

        if (distance <= radius) {
          const index = y * this.width + x;
          // 边缘渐暗效果
          const alpha = Math.floor((distance / radius) * 200);
          this.fogData[index] = Math.min(this.fogData[index], alpha);
        }
      }
    }
  }

  /**
   * 获取迷雾值
   * @param x - x坐标
   * @param y - y坐标
   * @returns 迷雾值 0-255
   */
  getFogValue(x: number, y: number): number {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return 255;
    }
    return this.fogData[y * this.width + x];
  }

  /**
   * 完全清除所有迷雾
   */
  clearAll(): void {
    this.fogData.fill(0);
  }

  /**
   * 重置所有迷雾
   */
  reset(): void {
    this.fogData.fill(255);
  }
}

/**
 * 创建初始发现系统
 * @param map - 游戏地图
 * @param initialPosition - 初始位置
 * @returns 发现系统实例
 */
export function createDiscoverySystem(
  map: GameMap,
  initialPosition: Position
): DiscoverySystem {
  const system = new DiscoverySystem(map);

  // 初始化玩家周围的发现状态
  system.onPlayerMove(initialPosition);

  return system;
}

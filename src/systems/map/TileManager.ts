/**
 * 地块管理器
 * 管理地块状态转换和属性
 *
 * @module systems/map/TileManager
 */

import {
  Tile,
  Position,
  TerrainType,
  DiscoveryState,
  TERRAIN_PROPERTIES,
} from './types';

/**
 * 地块管理器类
 * 负责管理单个地块的状态和属性
 */
export class TileManager {
  private tile: Tile;

  /**
   * 创建地块管理器
   * @param tile - 要管理的地块
   */
  constructor(tile: Tile) {
    this.tile = tile;
  }

  /**
   * 获取地块
   * @returns 当前地块
   */
  getTile(): Tile {
    return this.tile;
  }

  /**
   * 更新发现状态
   * @param newState - 新状态
   * @returns 是否成功更新
   */
  updateDiscoveryState(newState: DiscoveryState): boolean {
    // 状态转换规则：hidden -> discovered -> explored
    const validTransitions: Record<DiscoveryState, DiscoveryState[]> = {
      hidden: ['discovered'],
      discovered: ['explored'],
      explored: [], // explored 是最终状态
    };

    if (validTransitions[this.tile.discoveryState].includes(newState)) {
      this.tile.discoveryState = newState;

      if (newState === 'explored') {
        this.tile.visited = true;
      }

      return true;
    }

    return false;
  }

  /**
   * 设置发现状态（强制）
   * @param state - 新状态
   */
  setDiscoveryState(state: DiscoveryState): void {
    this.tile.discoveryState = state;

    if (state === 'explored') {
      this.tile.visited = true;
    }
  }

  /**
   * 检查是否可通行
   * @returns 是否可通行
   */
  isAccessible(): boolean {
    return this.tile.accessible;
  }

  /**
   * 设置可通行状态
   * @param accessible - 是否可通行
   */
  setAccessible(accessible: boolean): void {
    this.tile.accessible = accessible;
  }

  /**
   * 获取移动消耗
   * @returns 移动消耗值
   */
  getMoveCost(): number {
    const baseCost = TERRAIN_PROPERTIES[this.tile.terrain].moveCost;

    // 如果有特征，可能增加移动消耗
    let featureCost = 0;
    if (this.tile.feature) {
      switch (this.tile.feature.type) {
        case 'herb_patch':
          featureCost = 0.2;
          break;
        case 'mineral_vein':
          featureCost = 0.3;
          break;
        default:
          // 其他特征不影响移动消耗
          featureCost = 0;
      }
    }

    return baseCost + featureCost;
  }

  /**
   * 获取视野倍数
   * @returns 视野倍数
   */
  getVisibility(): number {
    return TERRAIN_PROPERTIES[this.tile.terrain].visibility;
  }

  /**
   * 是否有药材
   * @returns 是否有药材
   */
  hasMedicine(): boolean {
    return this.tile.medicine !== undefined;
  }

  /**
   * 采集药材
   * @returns 采集到的药材ID，如果没有则返回null
   */
  collectMedicine(): string | null {
    if (this.tile.medicine && this.tile.discoveryState === 'explored') {
      const medicineId = this.tile.medicine.medicineId;
      this.tile.medicine = undefined;
      return medicineId;
    }
    return null;
  }

  /**
   * 检查是否有特征
   * @returns 是否有特征
   */
  hasFeature(): boolean {
    return this.tile.feature !== undefined;
  }

  /**
   * 获取地形描述
   * @returns 地形描述
   */
  getDescription(): string {
    const terrainDesc = TERRAIN_PROPERTIES[this.tile.terrain].description;

    if (this.tile.feature) {
      return `${terrainDesc}，${this.tile.feature.description}`;
    }

    return terrainDesc;
  }

  /**
   * 获取地形颜色
   * @returns 地形颜色
   */
  getColor(): string {
    return TERRAIN_PROPERTIES[this.tile.terrain].color;
  }

  /**
   * 标记为已访问
   */
  markVisited(): void {
    this.tile.visited = true;
  }

  /**
   * 是否已访问
   * @returns 是否已访问
   */
  isVisited(): boolean {
    return this.tile.visited;
  }

  /**
   * 获取位置键
   * @returns 位置键 (格式: "x,y")
   */
  getPositionKey(): string {
    return `${this.tile.position.x},${this.tile.position.y}`;
  }

  /**
   * 获取位置
   * @returns 位置坐标
   */
  getPosition(): Position {
    return { ...this.tile.position };
  }

  /**
   * 更新地形
   * @param terrain - 新地形
   */
  setTerrain(terrain: TerrainType): void {
    this.tile.terrain = terrain;
    this.tile.accessible = terrain !== 'water';
  }

  /**
   * 获取地块信息摘要
   * @returns 地块信息
   */
  getSummary(): {
    position: Position;
    terrain: TerrainType;
    state: DiscoveryState;
    accessible: boolean;
    visited: boolean;
    hasMedicine: boolean;
    hasFeature: boolean;
  } {
    return {
      position: this.tile.position,
      terrain: this.tile.terrain,
      state: this.tile.discoveryState,
      accessible: this.tile.accessible,
      visited: this.tile.visited,
      hasMedicine: this.hasMedicine(),
      hasFeature: this.hasFeature(),
    };
  }
}

/**
 * 批量更新地块状态
 * @param tiles - 地块数组
 * @param positions - 位置列表
 * @param state - 目标状态
 * @returns 成功更新的位置列表
 */
export function batchUpdateDiscoveryState(
  tiles: Tile[][],
  positions: Position[],
  state: DiscoveryState
): Position[] {
  const updated: Position[] = [];

  for (const pos of positions) {
    if (pos.y >= 0 && pos.y < tiles.length &&
        pos.x >= 0 && pos.x < tiles[pos.y].length) {
      const manager = new TileManager(tiles[pos.y][pos.x]);
      if (manager.updateDiscoveryState(state)) {
        updated.push({ ...pos });
      }
    }
  }

  return updated;
}

/**
 * 获取指定范围内的所有地块
 * @param tiles - 地块二维数组
 * @param center - 中心位置
 * @param radius - 半径
 * @returns 地块列表
 */
export function getTilesInRadius(
  tiles: Tile[][],
  center: Position,
  radius: number
): Tile[] {
  const result: Tile[] = [];
  const size = tiles.length;

  for (let y = Math.max(0, center.y - radius);
       y <= Math.min(size - 1, center.y + radius);
       y++) {
    for (let x = Math.max(0, center.x - radius);
         x <= Math.min(size - 1, center.x + radius);
         x++) {
      const distance = Math.sqrt(
        Math.pow(x - center.x, 2) + Math.pow(y - center.y, 2)
      );

      if (distance <= radius) {
        result.push(tiles[y][x]);
      }
    }
  }

  return result;
}

/**
 * 查找可通行的邻居地块
 * @param tiles - 地块二维数组
 * @param position - 当前位置
 * @returns 可通行的邻居位置列表
 */
export function findAccessibleNeighbors(
  tiles: Tile[][],
  position: Position
): Position[] {
  const neighbors: Position[] = [];
  const size = tiles.length;
  const directions = [
    { x: 0, y: -1 }, // 上
    { x: 0, y: 1 },  // 下
    { x: -1, y: 0 }, // 左
    { x: 1, y: 0 },  // 右
  ];

  for (const dir of directions) {
    const newX = position.x + dir.x;
    const newY = position.y + dir.y;

    if (newX >= 0 && newX < size && newY >= 0 && newY < size) {
      if (tiles[newY][newX].accessible) {
        neighbors.push({ x: newX, y: newY });
      }
    }
  }

  return neighbors;
}

/**
 * 计算两点间的曼哈顿距离
 * @param a - 位置A
 * @param b - 位置B
 * @returns 曼哈顿距离
 */
export function manhattanDistance(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

/**
 * 计算两点间的欧几里得距离
 * @param a - 位置A
 * @param b - 位置B
 * @returns 欧几里得距离
 */
export function euclideanDistance(a: Position, b: Position): number {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}

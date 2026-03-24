/**
 * 地图生成器
 * 使用 Simplex Noise 算法生成程序化地形
 *
 * @module systems/map/MapGenerator
 */

import { SimplexNoise } from './SimplexNoise';
import {
  GameMap,
  MapConfig,
  Tile,
  Position,
  TerrainType,
  MedicineRarity,
  GameTimeState,
  WeatherState,
  MapEvent,
  Season,
  WUXING_TERRAIN_PREFERENCE,
} from './types';
import { WuxingType, CollectionType, WeatherType, DayPhase } from '../../types';
import { Medicine } from '../../types/medicine';

/**
 * 地图生成器类
 * 负责生成包含地形、药材分布和事件的游戏地图
 */
export class MapGenerator {
  private noise!: SimplexNoise;
  private config!: MapConfig;
  private map!: GameMap;

  /**
   * 生成新地图
   * @param config - 地图配置
   * @returns 生成的游戏地图
   */
  generate(config: MapConfig): GameMap {
    this.config = config;
    this.noise = new SimplexNoise(config.chapterId);

    // 初始化地图
    this.map = this.initializeMap(config);

    // 生成基础地形
    this.generateTerrain();

    // 添加特征区域
    this.addFeatureZones();

    // 分布药材
    this.distributeMedicines();

    // 放置兴趣点
    this.placePointsOfInterest();

    // 确保连通性
    this.ensureConnectivity();

    // 应用五行主题
    this.applyWuxingTheme();

    return this.map;
  }

  /**
   * 初始化空地图
   * @param config - 地图配置
   * @returns 初始化后的地图
   */
  private initializeMap(config: MapConfig): GameMap {
    const size = config.size;
    const tiles: Tile[][] = [];

    // 创建空的二维数组
    for (let y = 0; y < size; y++) {
      tiles[y] = [];
      for (let x = 0; x < size; x++) {
        tiles[y][x] = {
          position: { x, y },
          terrain: 'plains',
          discoveryState: 'hidden',
          accessible: true,
          visited: false,
        };
      }
    }

    // 设置玩家起始位置（地图中心）
    const playerStart: Position = {
      x: Math.floor(size / 2),
      y: Math.floor(size / 2),
    };

    // 确保起始位置在陆地上
    tiles[playerStart.y][playerStart.x].terrain = 'plains';
    tiles[playerStart.y][playerStart.x].accessible = true;

    // 初始化游戏时间
    const time: GameTimeState = {
      hour: 8,
      minute: 0,
      day: 1,
      season: this.getSeasonFromWuxing(config.wuxing),
      phase: DayPhase.Day,
    };

    // 初始化天气
    const weather: WeatherState = {
      type: WeatherType.Sunny,
      intensity: 0.5,
      duration: 300,
      effects: [
        { type: 'visibility', value: 1.2, description: '视野良好' },
      ],
    };

    return {
      id: `map-${config.chapterId}-${Date.now()}`,
      chapterId: config.chapterId,
      wuxing: config.wuxing,
      size,
      tiles,
      playerStart,
      discoveredTiles: new Set<string>(),
      exploredTiles: new Set<string>(),
      collectedMedicines: new Set<string>(),
      events: [],
      weather,
      time,
    };
  }

  /**
   * 根据五行获取季节
   * @param wuxing - 五行类型
   * @returns 季节
   */
  private getSeasonFromWuxing(wuxing: WuxingType): Season {
    const seasonMap: Record<WuxingType, Season> = {
      [WuxingType.Wood]: 'spring',
      [WuxingType.Fire]: 'summer',
      [WuxingType.Earth]: 'autumn',
      [WuxingType.Metal]: 'autumn',
      [WuxingType.Water]: 'winter',
    };
    return seasonMap[wuxing];
  }

  /**
   * 生成地形
   * 使用 Simplex Noise 生成自然的地形分布
   */
  private generateTerrain(): void {
    const preferences = WUXING_TERRAIN_PREFERENCE[this.config.wuxing];
    const size = this.config.size;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        // 使用多层噪声生成更自然的地形
        const noiseValue = this.noise.fractal2D(x * 0.1, y * 0.1, 4, 0.5, 2.0);

        // 根据噪声值和五行偏好选择地形
        let terrain: TerrainType = 'plains';

        if (noiseValue > 0.6) {
          terrain = preferences.includes('mountain') ? 'mountain' : 'forest';
        } else if (noiseValue > 0.3) {
          terrain = preferences.includes('forest') ? 'forest' : 'plains';
        } else if (noiseValue > 0.1) {
          terrain = 'plains';
        } else if (noiseValue > -0.3) {
          terrain = preferences.includes('marsh') ? 'marsh' : 'plains';
        } else if (noiseValue > -0.6) {
          terrain = preferences.includes('water') ? 'water' : 'marsh';
        } else {
          terrain = preferences.includes('cave') ? 'cave' : 'mountain';
        }

        // 保护起始位置
        if (x === this.map.playerStart.x && y === this.map.playerStart.y) {
          terrain = 'plains';
        }

        this.map.tiles[y][x].terrain = terrain;
        this.map.tiles[y][x].accessible = terrain !== 'water';
      }
    }
  }

  /**
   * 添加特征区域
   * 在地图上添加特殊的特征区域
   */
  private addFeatureZones(): void {
    const size = this.config.size;
    const zoneCount = Math.floor(size * size * 0.1); // 10%的地块有特征

    for (let i = 0; i < zoneCount; i++) {
      const x = Math.floor(Math.random() * size);
      const y = Math.floor(Math.random() * size);
      const tile = this.map.tiles[y][x];

      // 跳过水域和起始位置
      if (tile.terrain === 'water' ||
          (x === this.map.playerStart.x && y === this.map.playerStart.y)) {
        continue;
      }

      // 根据地形添加特征
      if (tile.terrain === 'forest' && Math.random() < 0.3) {
        tile.feature = {
          type: 'herb_patch',
          name: '草药丛',
          description: '一片生长着草药的灌木丛',
        };
      } else if (tile.terrain === 'mountain' && Math.random() < 0.3) {
        tile.feature = {
          type: 'mineral_vein',
          name: '矿脉',
          description: '裸露的岩石矿脉',
        };
      } else if (tile.terrain === 'cave' && Math.random() < 0.5) {
        tile.feature = {
          type: 'treasure_spot',
          name: '藏宝点',
          description: '一个可能藏有宝藏的角落',
        };
      }
    }
  }

  /**
   * 分布药材
   * 根据章节配置在地图上分布药材
   */
  private distributeMedicines(): void {
    const { medicines } = this.config;
    const { medicineDensity } = this.config;
    const size = this.config.size;
    const totalTiles = size * size;
    const spawnCount = Math.floor(totalTiles * medicineDensity);

    if (!medicines || medicines.length === 0) {
      return;
    }

    // 按稀有度分组（模拟数据，实际应从完整药材数据获取）
    const byRarity: Record<MedicineRarity, Medicine[]> = {
      common: [],
      uncommon: [],
      rare: [],
      epic: [],
    };

    // 简单的稀有度分配（实际应从Medicine数据中获取）
    medicines.forEach((med: Medicine, index: number) => {
      const rarity: MedicineRarity = index < medicines.length * 0.6
        ? 'common'
        : index < medicines.length * 0.85
        ? 'uncommon'
        : index < medicines.length * 0.97
        ? 'rare'
        : 'epic';
      byRarity[rarity].push(med);
    });

    // 获取可生成的位置
    const spawnPoints = this.findSpawnPoints(spawnCount);

    // 分布比例：普通60%、罕见25%、稀有12%、史诗3%
    const distribution: { rarity: MedicineRarity; ratio: number }[] = [
      { rarity: 'common', ratio: 0.6 },
      { rarity: 'uncommon', ratio: 0.25 },
      { rarity: 'rare', ratio: 0.12 },
      { rarity: 'epic', ratio: 0.03 },
    ];

    let pointIndex = 0;
    for (const { rarity, ratio } of distribution) {
      const count = Math.floor(spawnCount * ratio);
      const availableMedicines = byRarity[rarity];

      if (availableMedicines.length === 0) continue;

      for (let i = 0; i < count && pointIndex < spawnPoints.length; i++) {
        const point = spawnPoints[pointIndex++];
        const medicine = availableMedicines[Math.floor(Math.random() * availableMedicines.length)];

        this.map.tiles[point.y][point.x].medicine = {
          medicineId: medicine.id || `med-${rarity}-${i}`,
          amount: 1,
          rarity,
          collectionType: this.getCollectionType(medicine),
        };
      }
    }
  }

  /**
   * 获取采集类型
   * 根据药材类别决定采集方式
   * @param medicine - 药材数据
   * @returns 采集类型
   */
  getCollectionType(medicine: Medicine): CollectionType {
    const category = medicine.category || '';

    if (category.includes('植物') || category.includes('草')) {
      return CollectionType.Digging;  // 挖掘
    } else if (category.includes('矿物') || category.includes('石')) {
      return CollectionType.Tapping;  // 敲击
    } else if (category.includes('动物') || category.includes('虫')) {
      return CollectionType.Lasso;    // 套索
    } else {
      return CollectionType.Searching; // 搜寻
    }
  }

  /**
   * 查找可生成药材的位置
   * @param count - 需要的位置数量
   * @returns 位置列表
   */
  private findSpawnPoints(count: number): Position[] {
    const points: Position[] = [];
    const size = this.config.size;

    // 收集所有可通行的地块
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const tile = this.map.tiles[y][x];
        // 可通行且不是起始位置
        if (tile.accessible &&
            !(x === this.map.playerStart.x && y === this.map.playerStart.y)) {
          points.push({ x, y });
        }
      }
    }

    // 随机打乱
    for (let i = points.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [points[i], points[j]] = [points[j], points[i]];
    }

    return points.slice(0, count);
  }

  /**
   * 放置兴趣点
   * 在地图上放置特殊地点
   */
  private placePointsOfInterest(): void {
    const size = this.config.size;
    const poiCount = Math.max(1, Math.floor(size / 3));

    for (let i = 0; i < poiCount; i++) {
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < 50) {
        const x = Math.floor(Math.random() * size);
        const y = Math.floor(Math.random() * size);
        const tile = this.map.tiles[y][x];

        if (tile.accessible && !tile.feature && !tile.medicine) {
          tile.feature = {
            type: 'landmark',
            name: `地标 ${i + 1}`,
            description: '一个值得注意的地标',
          };
          placed = true;
        }
        attempts++;
      }
    }
  }

  /**
   * 确保地图连通性
   * 使用BFS检查所有药材点是否可达
   */
  private ensureConnectivity(): void {
    const size = this.map.size;
    const start = this.map.playerStart;

    // BFS遍历所有可达地块
    const reachable = new Set<string>();
    const queue: Position[] = [start];
    reachable.add(`${start.x},${start.y}`);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const neighbors = this.getNeighbors(current, size);

      for (const neighbor of neighbors) {
        const key = `${neighbor.x},${neighbor.y}`;
        if (!reachable.has(key) && this.map.tiles[neighbor.y][neighbor.x].accessible) {
          reachable.add(key);
          queue.push(neighbor);
        }
      }
    }

    // 检查是否有不可达的药材点
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const tile = this.map.tiles[y][x];
        if (tile.medicine && !reachable.has(`${x},${y}`)) {
          // 打通一条路径
          this.createPath(start, { x, y });
        }
      }
    }
  }

  /**
   * 创建路径
   * 使用简单的直线+随机偏移创建路径
   * @param from - 起始位置
   * @param to - 目标位置
   */
  private createPath(from: Position, to: Position): void {
    let current = { ...from };

    while (current.x !== to.x || current.y !== to.y) {
      // 将当前位置设为可通行
      if (!this.map.tiles[current.y][current.x].accessible) {
        this.map.tiles[current.y][current.x].terrain = 'plains';
        this.map.tiles[current.y][current.x].accessible = true;
      }

      // 向目标移动
      if (current.x < to.x) current.x++;
      else if (current.x > to.x) current.x--;
      else if (current.y < to.y) current.y++;
      else if (current.y > to.y) current.y--;

      // 添加随机偏移以增加自然感
      if (Math.random() < 0.3) {
        const offsetX = Math.floor(Math.random() * 3) - 1;
        const offsetY = Math.floor(Math.random() * 3) - 1;
        const newX = Math.max(0, Math.min(this.config.size - 1, current.x + offsetX));
        const newY = Math.max(0, Math.min(this.config.size - 1, current.y + offsetY));

        if (!this.map.tiles[newY][newX].accessible) {
          this.map.tiles[newY][newX].terrain = 'plains';
          this.map.tiles[newY][newX].accessible = true;
        }
      }
    }
  }

  /**
   * 获取相邻位置
   * @param pos - 当前位置
   * @param size - 地图大小
   * @returns 相邻位置列表
   */
  private getNeighbors(pos: Position, size: number): Position[] {
    const neighbors: Position[] = [];
    const directions = [
      { x: 0, y: -1 }, // 上
      { x: 0, y: 1 },  // 下
      { x: -1, y: 0 }, // 左
      { x: 1, y: 0 },  // 右
    ];

    for (const dir of directions) {
      const newX = pos.x + dir.x;
      const newY = pos.y + dir.y;

      if (newX >= 0 && newX < size && newY >= 0 && newY < size) {
        neighbors.push({ x: newX, y: newY });
      }
    }

    return neighbors;
  }

/**
   * 应用五行主题
   * 根据五行类型调整地图元素
   */
  private applyWuxingTheme(): void {
    const wuxing = this.config.wuxing;

    // 根据五行偏好调整地形比例
    // 已在generateTerrain中应用，这里可以添加更多主题效果

    // 添加五行特色事件
    const event: MapEvent = {
      id: `event-${wuxing}-entrance`,
      type: 'meet_npc',
      position: this.map.playerStart,
      trigger: 'proximity',
      description: `进入${wuxing}行山谷，感受到强烈的${wuxing}行之气`,
    };

    this.map.events.push(event);
  }
}

/**
 * 生成地图ID
 * @param chapterId - 章节ID
 * @returns 地图ID
 */
export function generateMapId(chapterId: string): string {
  return `map-${chapterId}-${Date.now()}`;
}

/**
 * 获取默认地图配置
 * @param chapterId - 章节ID
 * @param wuxing - 五行类型
 * @param medicines - 药材列表
 * @returns 默认地图配置
 */
export function getDefaultMapConfig(
  chapterId: string,
  wuxing: WuxingType,
  medicines: Medicine[]
): MapConfig & { medicines: Medicine[] } {
  return {
    chapterId,
    wuxing,
    size: 8,
    difficulty: 'normal',
    medicineDensity: 0.3,
    eventFrequency: 0.1,
    weatherEnabled: true,
    medicines,
  };
}

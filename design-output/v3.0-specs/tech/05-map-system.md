# 地图系统技术实现

## 1. 系统架构

### 1.1 模块划分

```
src/systems/map/
├── MapGenerator.ts           # 地图生成器
├── TileManager.ts            # 地块管理
├── DiscoverySystem.ts        # 发现系统
├── MinigameManager.ts        # 小游戏管理
├── WeatherSystem.ts          # 天气系统
├── TimeSystem.ts             # 时间系统
├── EventManager.ts           # 事件管理
├── MapRenderer.ts            # 地图渲染
└── index.ts                  # 导出
```

### 1.2 核心类图

```typescript
// 地图管理器 - 主控制器
class MapManager {
  private generator: MapGenerator;
  private tileManager: TileManager;
  private discoverySystem: DiscoverySystem;
  private minigameManager: MinigameManager;
  private weatherSystem: WeatherSystem;
  private timeSystem: TimeSystem;
  private eventManager: EventManager;
  private renderer: MapRenderer;

  // 当前地图状态
  private currentMap: GameMap;
  private playerPosition: Position;

  // 初始化
  generateMap(chapterId: string, config: MapConfig): GameMap;
  enterMap(mapId: string): void;
  leaveMap(): void;

  // 交互
  movePlayer(direction: Direction): MoveResult;
  exploreTile(position: Position): ExploreResult;
  startCollection(tile: Tile): MinigameType;

  // 更新
  update(deltaTime: number): void;
}

// 地图生成器
class MapGenerator {
  generate(config: MapConfig): GameMap;
  private generateTerrain(size: number): TerrainType[][];
  private distributeMedicines(medicines: Medicine[], density: number): void;
  private placePointsOfInterest(count: number): void;
  private ensureConnectivity(): void;
}
```

## 2. 地图数据结构

### 2.1 核心类型定义

```typescript
// 位置
interface Position {
  x: number;
  y: number;
}

// 地图配置
interface MapConfig {
  chapterId: string;
  wuxing: WuxingType;
  size: number;              // 地图大小 (6x6, 8x8, 10x10)
  difficulty: 'easy' | 'normal' | 'hard';
  medicineDensity: number;   // 药材密度 0-1
  eventFrequency: number;    // 事件频率
  weatherEnabled: boolean;
  specialRules?: string[];
}

// 游戏地图
interface GameMap {
  id: string;
  chapterId: string;
  wuxing: WuxingType;
  size: number;
  tiles: Tile[][];
  playerStart: Position;
  discoveredTiles: Set<string>;  // "x,y" 格式
  exploredTiles: Set<string>;
  collectedMedicines: Set<string>;
  events: MapEvent[];
  weather: WeatherState;
  time: GameTime;
}

// 地块
interface Tile {
  position: Position;
  terrain: TerrainType;
  feature?: TileFeature;
  medicine?: MedicineSpawn;
  discoveryState: 'hidden' | 'discovered' | 'explored';
  accessible: boolean;
  visited: boolean;
}

// 地形类型
 type TerrainType =
  | 'plains'      // 平原
  | 'forest'      // 森林
  | 'mountain'    // 山地
  | 'water'       // 水域
  | 'marsh'       // 沼泽
  | 'cave'        // 洞穴
  | 'cliff';      // 悬崖

// 地块特征
interface TileFeature {
  type: 'herb_patch' | 'mineral_vein' | 'animal_nest' | 'treasure_spot' | 'landmark';
  name: string;
  description: string;
  visualEffect?: string;
}

// 药材刷新点
interface MedicineSpawn {
  medicineId: string;
  amount: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic';
  collectionType: 'digging' | 'tapping' | 'lasso' | 'searching';
  respawnTime?: number;  // 重生时间(秒)
}
```

### 2.2 地形配置

```typescript
// 五行地形偏好
const WUXING_TERRAIN_PREFERENCE: Record<WuxingType, TerrainType[]> = {
  wood: ['forest', 'plains'],           // 木行：森林、平原
  fire: ['mountain', 'cliff'],          // 火行：山地、悬崖
  earth: ['plains', 'marsh'],           // 土行：平原、沼泽
  metal: ['mountain', 'cave'],          // 金行：山地、洞穴
  water: ['water', 'marsh', 'cave'],    // 水行：水域、沼泽、洞穴
};

// 地形属性
const TERRAIN_PROPERTIES: Record<TerrainType, TerrainProperty> = {
  plains: {
    moveCost: 1,
    visibility: 1,
    medicineBonus: 0,
    description: '开阔的平原，视野良好',
    color: '#8BC34A',
  },
  forest: {
    moveCost: 1.5,
    visibility: 0.7,
    medicineBonus: 0.2,  // 植物类药材+20%
    description: '茂密的森林，容易发现草药',
    color: '#4CAF50',
  },
  mountain: {
    moveCost: 2,
    visibility: 1.2,
    medicineBonus: 0.2,  // 矿物类药材+20%
    description: '陡峭的山地，可以俯瞰四周',
    color: '#795548',
  },
  water: {
    moveCost: 999,  // 不可通行
    visibility: 1,
    medicineBonus: 0,
    description: '水域，需要绕行',
    color: '#2196F3',
  },
  marsh: {
    moveCost: 2.5,
    visibility: 0.6,
    medicineBonus: 0.15,
    description: '湿滑的沼泽，行进困难',
    color: '#607D8B',
  },
  cave: {
    moveCost: 1.5,
    visibility: 0.4,
    medicineBonus: 0.3,  // 洞穴特有药材
    description: '幽暗的洞穴，需要火把照明',
    color: '#424242',
  },
  cliff: {
    moveCost: 3,
    visibility: 1.5,
    medicineBonus: 0.25, // 悬崖特有药材
    description: '险峻的悬崖，有珍稀药材',
    color: '#9E9E9E',
  },
};
```

## 3. 地图生成算法

### 3.1 分层生成策略

```typescript
class MapGenerator {
  generate(config: MapConfig): GameMap {
    // 1. 初始化空白地图
    const map = this.initializeMap(config);

    // 2. 生成基础地形
    this.generateTerrain(map, config);

    // 3. 添加特征区域
    this.addFeatureZones(map, config);

    // 4. 分布药材
    this.distributeMedicines(map, config);

    // 5. 放置兴趣点
    this.placePointsOfInterest(map, config);

    // 6. 确保连通性
    this.ensureConnectivity(map);

    // 7. 应用五行主题
    this.applyWuxingTheme(map, config.wuxing);

    return map;
  }

  private generateTerrain(map: GameMap, config: MapConfig): void {
    const preferences = WUXING_TERRAIN_PREFERENCE[config.wuxing];
    const noise = new SimplexNoise(config.chapterId); // 使用章节ID作为种子

    for (let y = 0; y < config.size; y++) {
      for (let x = 0; x < config.size; x++) {
        const noiseValue = noise.noise2D(x * 0.1, y * 0.1);

        // 根据噪声值和五行偏好选择地形
        let terrain: TerrainType;
        if (noiseValue > 0.5 && preferences.includes('mountain')) {
          terrain = 'mountain';
        } else if (noiseValue > 0.3 && preferences.includes('forest')) {
          terrain = 'forest';
        } else if (noiseValue < -0.5 && preferences.includes('water')) {
          terrain = 'water';
        } else {
          terrain = 'plains';
        }

        map.tiles[y][x] = {
          position: { x, y },
          terrain,
          discoveryState: 'hidden',
          accessible: terrain !== 'water',
          visited: false,
        };
      }
    }
  }

  private distributeMedicines(map: GameMap, config: MapConfig): void {
    const { medicines } = getChapterData(config.chapterId);
    const totalTiles = config.size * config.size;
    const spawnCount = Math.floor(totalTiles * config.medicineDensity);

    // 按稀有度分组
    const byRarity = this.groupByRarity(medicines);

    // 分布算法：稀有药材放在偏远/危险区域
    const spawnPoints = this.findSpawnPoints(map, spawnCount);

    // 普通60%、罕见25%、稀有12%、史诗3%
    const distribution = [
      { rarity: 'common', ratio: 0.6, medicines: byRarity.common },
      { rarity: 'uncommon', ratio: 0.25, medicines: byRarity.uncommon },
      { rarity: 'rare', ratio: 0.12, medicines: byRarity.rare },
      { rarity: 'epic', ratio: 0.03, medicines: byRarity.epic },
    ];

    let pointIndex = 0;
    for (const { rarity, ratio, medicines } of distribution) {
      const count = Math.floor(spawnCount * ratio);

      for (let i = 0; i < count && pointIndex < spawnPoints.length; i++) {
        const point = spawnPoints[pointIndex++];
        const medicine = randomPick(medicines);

        map.tiles[point.y][point.x].medicine = {
          medicineId: medicine.id,
          amount: 1,
          rarity: rarity as any,
          collectionType: this.getCollectionType(medicine),
        };
      }
    }
  }

  private getCollectionType(medicine: Medicine): CollectionType {
    // 根据药材类型决定采集方式
    const category = medicine.category;

    if (category.includes('植物') || category.includes('草')) {
      return 'digging';  // 挖掘
    } else if (category.includes('矿物') || category.includes('石')) {
      return 'tapping';  // 敲击
    } else if (category.includes('动物') || category.includes('虫')) {
      return 'lasso';    // 套索
    } else {
      return 'searching'; // 寻宝
    }
  }
}
```

### 3.2 连通性保证

```typescript
private ensureConnectivity(map: GameMap): void {
  const size = map.size;
  const start = map.playerStart;

  // BFS遍历所有可达地块
  const reachable = new Set<string>();
  const queue: Position[] = [start];
  reachable.add(`${start.x},${start.y}`);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const neighbors = this.getNeighbors(current, size);

    for (const neighbor of neighbors) {
      const key = `${neighbor.x},${neighbor.y}`;
      if (!reachable.has(key) && map.tiles[neighbor.y][neighbor.x].accessible) {
        reachable.add(key);
        queue.push(neighbor);
      }
    }
  }

  // 检查是否有不可达的药材点
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const tile = map.tiles[y][x];
      if (tile.medicine && !reachable.has(`${x},${y}`)) {
        // 打通一条路径
        this.createPath(map, start, { x, y });
      }
    }
  }
}

private createPath(map: GameMap, from: Position, to: Position): void {
  // A*寻路，将路径上的障碍变为可通行
  const path = this.aStar(map, from, to);
  for (const pos of path) {
    if (!map.tiles[pos.y][pos.x].accessible) {
      map.tiles[pos.y][pos.x].terrain = 'plains';
      map.tiles[pos.y][pos.x].accessible = true;
    }
  }
}
```

## 4. 发现系统

### 4.1 渐进式发现机制

```typescript
class DiscoverySystem {
  private map: GameMap;
  private visibilityRadius: number = 2;

  // 玩家移动后更新发现状态
  onPlayerMove(position: Position): DiscoveryUpdate {
    const updates: TileUpdate[] = [];

    // 发现周围地块
    const nearbyTiles = this.getTilesInRadius(position, this.visibilityRadius);
    for (const tile of nearbyTiles) {
      if (tile.discoveryState === 'hidden') {
        tile.discoveryState = 'discovered';
        updates.push({
          position: tile.position,
          state: 'discovered',
          terrain: tile.terrain,
        });
      }
    }

    // 当前地块标记为已探索
    const currentTile = this.map.tiles[position.y][position.x];
    if (currentTile.discoveryState !== 'explored') {
      currentTile.discoveryState = 'explored';
      currentTile.visited = true;
      updates.push({
        position,
        state: 'explored',
        feature: currentTile.feature,
        medicine: currentTile.medicine,
      });
    }

    return { updates };
  }

  // 使用道具扩大视野
  expandVisibility(radius: number, duration: number): void {
    const originalRadius = this.visibilityRadius;
    this.visibilityRadius = radius;

    setTimeout(() => {
      this.visibilityRadius = originalRadius;
    }, duration);
  }

  // 识别药材
  identifyMedicine(position: Position): IdentificationResult {
    const tile = this.map.tiles[position.y][position.x];
    if (!tile.medicine) {
      return { success: false, error: '此地块没有药材' };
    }

    // 消耗鉴定道具或金币
    const medicine = getMedicine(tile.medicine.medicineId);

    // 根据已收集信息给出线索
    const clues = this.generateClues(medicine);

    return {
      success: true,
      medicineId: medicine.id,
      clues,
      collectionType: tile.medicine.collectionType,
    };
  }

  private generateClues(medicine: Medicine): string[] {
    const clues: string[] = [];

    // 基础线索：类别
    clues.push(`这是一味${medicine.category}类药材`);

    // 如果已有亲密度，显示更多信息
    if (medicine.affinity >= 20) {
      clues.push(`性属${medicine.fourQi}`);
    }
    if (medicine.affinity >= 40) {
      clues.push(`味${medicine.fiveFlavors.join('、')}`);
    }
    if (medicine.affinity >= 60) {
      clues.push(`归入${medicine.meridians.join('、')}经`);
    }

    return clues;
  }
}
```

### 4.2 迷雾系统

```typescript
class FogOfWar {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private fogData: Uint8Array;  // 0-255 透明度

  constructor(width: number, height: number) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d')!;
    this.fogData = new Uint8Array(width * height).fill(255); // 全黑
  }

  // 清除迷雾
  clearFog(center: Position, radius: number): void {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;

    for (let y = -radius; y <= radius; y++) {
      for (let x = -radius; x <= radius; x++) {
        const distance = Math.sqrt(x * x + y * y);
        if (distance > radius) continue;

        const px = center.x + x;
        const py = center.y + y;
        if (px < 0 || px >= this.canvas.width || py < 0 || py >= this.canvas.height) continue;

        const index = (py * this.canvas.width + px) * 4;
        const alpha = Math.floor((distance / radius) * 200); // 边缘渐暗

        // 取最小值（最亮）
        data[index + 3] = Math.min(data[index + 3], alpha);
      }
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  // 获取迷雾纹理
  getTexture(): HTMLCanvasElement {
    return this.canvas;
  }
}
```

## 5. 小游戏系统

### 5.1 小游戏管理器

```typescript
class MinigameManager {
  private currentGame: Minigame | null = null;
  private onComplete: ((result: CollectionResult) => void) | null = null;

  // 启动采集小游戏
  startCollection(type: CollectionType, rarity: string, onComplete: (result: CollectionResult) => void): void {
    this.onComplete = onComplete;

    switch (type) {
      case 'digging':
        this.currentGame = new DiggingGame(rarity);
        break;
      case 'tapping':
        this.currentGame = new TappingGame(rarity);
        break;
      case 'lasso':
        this.currentGame = new LassoGame(rarity);
        break;
      case 'searching':
        this.currentGame = new SearchingGame(rarity);
        break;
    }

    this.currentGame?.start();
  }

  // 玩家输入
  onInput(input: GameInput): void {
    this.currentGame?.onInput(input);
  }

  // 更新
  update(deltaTime: number): void {
    if (this.currentGame) {
      this.currentGame.update(deltaTime);

      if (this.currentGame.isComplete()) {
        const result = this.currentGame.getResult();
        this.onComplete?.(result);
        this.currentGame = null;
      }
    }
  }
}
```

### 5.2 挖掘小游戏（植物类）

```typescript
class DiggingGame implements Minigame {
  private state: 'ready' | 'playing' | 'complete' = 'ready';
  private soilLayers: SoilLayer[] = [];
  private currentLayer: number = 0;
  private power: number = 0;
  private powerDirection: number = 1;
  private rarity: string;

  constructor(rarity: string) {
    this.rarity = rarity;
    this.initLayers();
  }

  private initLayers(): void {
    const layerCount = this.getLayerCountByRarity();

    for (let i = 0; i < layerCount; i++) {
      this.soilLayers.push({
        id: i,
        hardness: 0.3 + i * 0.15,  // 越深层越硬
        thickness: 20 + Math.random() * 20,
        color: this.getLayerColor(i, layerCount),
        cracks: 0,
        maxCracks: 3 + i,
      });
    }
  }

  start(): void {
    this.state = 'playing';
    this.startPowerOscillation();
  }

  private startPowerOscillation(): void {
    // 力量条在0-100之间摆动
    const oscillate = () => {
      if (this.state !== 'playing') return;

      this.power += this.powerDirection * 2;
      if (this.power >= 100) {
        this.power = 100;
        this.powerDirection = -1;
      } else if (this.power <= 0) {
        this.power = 0;
        this.powerDirection = 1;
      }

      requestAnimationFrame(oscillate);
    };
    oscillate();
  }

  onInput(input: GameInput): void {
    if (input.type !== 'tap') return;

    const layer = this.soilLayers[this.currentLayer];
    const effectiveness = this.calculateEffectiveness();

    // 根据力量和时机计算效果
    layer.cracks += effectiveness > 0.7 ? 2 : 1;

    if (layer.cracks >= layer.maxCracks) {
      this.currentLayer++;

      if (this.currentLayer >= this.soilLayers.length) {
        this.complete(true);
      }
    }
  }

  private calculateEffectiveness(): number {
    // 最佳打击点在中间区域
    const optimalZone = { min: 40, max: 60 };

    if (this.power >= optimalZone.min && this.power <= optimalZone.max) {
      return 1.0;
    } else if (this.power >= 30 && this.power <= 70) {
      return 0.7;
    } else {
      return 0.4;
    }
  }

  private complete(success: boolean): void {
    this.state = 'complete';
    this.result = {
      success,
      quality: success ? this.calculateQuality() : null,
      bonus: this.calculateBonus(),
    };
  }

  private calculateQuality(): 'perfect' | 'good' | 'normal' {
    const avgEffectiveness = this.totalEffectiveness / this.hitCount;
    if (avgEffectiveness > 0.9) return 'perfect';
    if (avgEffectiveness > 0.7) return 'good';
    return 'normal';
  }
}
```

### 5.3 敲击小游戏（矿石类）

```typescript
class TappingGame implements Minigame {
  private rhythmPattern: RhythmBeat[] = [];
  private currentBeat: number = 0;
  private score: number = 0;
  private startTime: number = 0;

  constructor(rarity: string) {
    this.generatePattern(rarity);
  }

  private generatePattern(rarity: string): void {
    const beatCount = rarity === 'epic' ? 8 : rarity === 'rare' ? 6 : 4;
    const interval = 1000; // 1秒间隔

    for (let i = 0; i < beatCount; i++) {
      this.rhythmPattern.push({
        time: i * interval + 2000, // 2秒后开始
        type: i % 3 === 0 ? 'strong' : 'normal',
        hit: false,
      });
    }
  }

  start(): void {
    this.startTime = Date.now();
  }

  update(deltaTime: number): void {
    const elapsed = Date.now() - this.startTime;

    // 检查是否有节拍被错过
    for (let i = this.currentBeat; i < this.rhythmPattern.length; i++) {
      const beat = this.rhythmPattern[i];
      if (!beat.hit && elapsed > beat.time + 300) {
        // 错过节拍
        this.score -= 10;
        this.currentBeat++;
      }
    }

    // 检查是否完成
    if (this.currentBeat >= this.rhythmPattern.length) {
      this.complete(this.score > 0);
    }
  }

  onInput(input: GameInput): void {
    if (input.type !== 'tap') return;

    const elapsed = Date.now() - this.startTime;
    const beat = this.rhythmPattern[this.currentBeat];

    if (!beat || beat.hit) return;

    const diff = Math.abs(elapsed - beat.time);

    if (diff < 150) {
      // 完美命中
      beat.hit = true;
      this.score += beat.type === 'strong' ? 30 : 20;
      this.currentBeat++;
      this.emitEffect('perfect');
    } else if (diff < 300) {
      // 普通命中
      beat.hit = true;
      this.score += beat.type === 'strong' ? 15 : 10;
      this.currentBeat++;
      this.emitEffect('good');
    } else {
      // 失误
      this.score -= 5;
      this.emitEffect('miss');
    }
  }
}
```

### 5.4 套索小游戏（动物类）

```typescript
class LassoGame implements Minigame {
  private target: MovingTarget;
  private lasso: Lasso;
  private score: number = 0;
  private requiredScore: number;
  private state: 'aiming' | 'thrown' | 'pulling' = 'aiming';

  constructor(rarity: string) {
    this.requiredScore = rarity === 'epic' ? 100 : rarity === 'rare' ? 75 : 50;

    this.target = {
      x: 0.5,  // 归一化坐标 0-1
      y: 0.5,
      vx: (Math.random() - 0.5) * 0.02,
      vy: (Math.random() - 0.5) * 0.02,
      size: 0.1,
      caught: false,
    };

    this.lasso = {
      x: 0.5,
      y: 0.9,
      thrown: false,
      expanding: false,
      radius: 0,
    };
  }

  update(deltaTime: number): void {
    // 更新目标位置
    if (!this.target.caught) {
      this.target.x += this.target.vx;
      this.target.y += this.target.vy;

      // 边界反弹
      if (this.target.x <= 0 || this.target.x >= 1) this.target.vx *= -1;
      if (this.target.y <= 0 || this.target.y >= 1) this.target.vy *= -1;
    }

    // 更新套索
    if (this.state === 'thrown') {
      this.lasso.radius += 0.02;

      // 检查捕获
      const distance = Math.sqrt(
        Math.pow(this.lasso.x - this.target.x, 2) +
        Math.pow(this.lasso.y - this.target.y, 2)
      );

      if (distance < this.lasso.radius + this.target.size) {
        this.target.caught = true;
        this.state = 'pulling';
      }

      // 套索最大范围
      if (this.lasso.radius > 0.5) {
        this.score -= 10;
        this.state = 'aiming';
        this.lasso.thrown = false;
        this.lasso.radius = 0;
      }
    }

    // 拉取阶段
    if (this.state === 'pulling') {
      // 目标向套索中心靠拢
      this.target.x += (this.lasso.x - this.target.x) * 0.1;
      this.target.y += (this.lasso.y - this.target.y) * 0.1;

      if (Math.abs(this.target.x - this.lasso.x) < 0.01) {
        this.score += 50;
        if (this.score >= this.requiredScore) {
          this.complete(true);
        } else {
          // 继续下一轮
          this.resetTarget();
          this.state = 'aiming';
        }
      }
    }
  }

  onInput(input: GameInput): void {
    if (this.state !== 'aiming') return;

    if (input.type === 'drag') {
      // 移动准星
      this.lasso.x = Math.max(0.1, Math.min(0.9, input.x));
    } else if (input.type === 'tap') {
      // 投掷套索
      this.state = 'thrown';
      this.lasso.thrown = true;
    }
  }

  private resetTarget(): void {
    this.target.caught = false;
    this.target.x = 0.3 + Math.random() * 0.4;
    this.target.y = 0.2 + Math.random() * 0.4;
    this.target.vx = (Math.random() - 0.5) * 0.02 * (1 + this.score / 100);
    this.target.vy = (Math.random() - 0.5) * 0.02 * (1 + this.score / 100);
    this.lasso.radius = 0;
    this.lasso.thrown = false;
  }
}
```

## 6. 天气与时间系统

### 6.1 天气系统

```typescript
interface WeatherState {
  type: WeatherType;
  intensity: number;  // 0-1
  duration: number;   // 剩余时间(秒)
  effects: WeatherEffect[];
}

type WeatherType =
  | 'sunny'
  | 'cloudy'
  | 'rainy'
  | 'foggy'
  | 'stormy'
  | 'snowy';

interface WeatherEffect {
  type: 'visibility' | 'move_speed' | 'medicine_spawn' | 'special_event';
  value: number;
  description: string;
}

class WeatherSystem {
  private currentWeather: WeatherState;
  private weatherQueue: WeatherType[] = [];
  private map: GameMap;

  // 天气效果配置
  private weatherEffects: Record<WeatherType, WeatherEffect[]> = {
    sunny: [
      { type: 'visibility', value: 1.2, description: '视野良好' },
      { type: 'medicine_spawn', value: 1.0, description: '正常刷新' },
    ],
    rainy: [
      { type: 'visibility', value: 0.7, description: '视野受限' },
      { type: 'move_speed', value: 0.8, description: '移动变慢' },
      { type: 'medicine_spawn', value: 1.3, description: '植物类药材增加' },
    ],
    foggy: [
      { type: 'visibility', value: 0.4, description: '视野大幅降低' },
      { type: 'special_event', value: 1, description: '可能遇到迷路事件' },
    ],
    stormy: [
      { type: 'visibility', value: 0.5, description: '视野受限' },
      { type: 'move_speed', value: 0.6, description: '移动大幅变慢' },
      { type: 'special_event', value: 1, description: '可能遇到雷击事件' },
    ],
    snowy: [
      { type: 'visibility', value: 0.6, description: '视野受限' },
      { type: 'move_speed', value: 0.7, description: '移动变慢' },
      { type: 'medicine_spawn', value: 0.7, description: '药材刷新减少' },
    ],
  };

  update(deltaTime: number): void {
    // 更新当前天气持续时间
    this.currentWeather.duration -= deltaTime;

    if (this.currentWeather.duration <= 0) {
      this.changeWeather();
    }
  }

  private changeWeather(): void {
    const nextWeather = this.weatherQueue.shift() || this.randomWeather();
    this.weatherQueue.push(this.randomWeather()); // 预生成下一个

    this.currentWeather = {
      type: nextWeather,
      intensity: 0.3 + Math.random() * 0.7,
      duration: 120 + Math.random() * 300, // 2-7分钟
      effects: this.weatherEffects[nextWeather],
    };

    // 通知地图天气变化
    EventBus.emit('weather:change', this.currentWeather);
  }

  private randomWeather(): WeatherType {
    const weathers: WeatherType[] = ['sunny', 'cloudy', 'rainy', 'foggy'];
    return weathers[Math.floor(Math.random() * weathers.length)];
  }

  // 获取当前天气影响
  getEffectMultiplier(effectType: string): number {
    const effect = this.currentWeather.effects.find(e => e.type === effectType);
    return effect?.value ?? 1.0;
  }
}
```

### 6.2 时间系统

```typescript
interface GameTime {
  hour: number;      // 0-23
  minute: number;    // 0-59
  day: number;       // 第几天
  season: Season;
  phase: DayPhase;
}

type Season = 'spring' | 'summer' | 'autumn' | 'winter';
type DayPhase = 'dawn' | 'day' | 'dusk' | 'night';

class TimeSystem {
  private currentTime: GameTime;
  private timeScale: number = 1;  // 1秒现实时间 = 1分钟游戏时间

  update(deltaTime: number): void {
    const gameMinutes = (deltaTime / 1000) * this.timeScale;

    this.currentTime.minute += gameMinutes;

    while (this.currentTime.minute >= 60) {
      this.currentTime.minute -= 60;
      this.currentTime.hour++;

      if (this.currentTime.hour >= 24) {
        this.currentTime.hour = 0;
        this.currentTime.day++;
      }
    }

    // 更新时段
    this.updateDayPhase();
  }

  private updateDayPhase(): void {
    const hour = this.currentTime.hour;
    let newPhase: DayPhase;

    if (hour >= 5 && hour < 7) newPhase = 'dawn';
    else if (hour >= 7 && hour < 17) newPhase = 'day';
    else if (hour >= 17 && hour < 19) newPhase = 'dusk';
    else newPhase = 'night';

    if (newPhase !== this.currentTime.phase) {
      this.currentTime.phase = newPhase;
      EventBus.emit('time:phase_change', newPhase);
    }
  }

  // 根据时间获取环境效果
  getEnvironmentalEffects(): EnvironmentalEffect[] {
    const effects: EnvironmentalEffect[] = [];

    switch (this.currentTime.phase) {
      case 'dawn':
        effects.push({ type: 'visibility', value: 0.9, description: '晨光初现' });
        break;
      case 'day':
        effects.push({ type: 'visibility', value: 1.0, description: '阳光明媚' });
        break;
      case 'dusk':
        effects.push({ type: 'visibility', value: 0.8, description: '夕阳西下' });
        break;
      case 'night':
        effects.push({ type: 'visibility', value: 0.5, description: '夜色深沉' });
        effects.push({ type: 'danger', value: 1.3, description: '夜间更危险' });
        break;
    }

    return effects;
  }
}
```

## 7. 事件系统

### 7.1 随机事件

```typescript
interface MapEvent {
  id: string;
  type: EventType;
  position: Position;
  trigger: 'immediate' | 'proximity' | 'interaction';
  condition?: (player: Player) => boolean;
  effect: EventEffect;
  description: string;
}

type EventType =
  | 'find_herb'           // 发现草药
  | 'meet_npc'            // 遇到NPC
  | 'weather_effect'      // 天气影响
  | 'random_encounter'    // 随机遭遇
  | 'treasure'            // 发现宝藏
  | 'trap'                // 触发陷阱
  | 'shortcut';           // 发现捷径

class EventManager {
  private activeEvents: MapEvent[] = [];
  private eventHistory: string[] = [];

  // 生成随机事件
  generateRandomEvent(playerPos: Position, map: GameMap): MapEvent | null {
    if (Math.random() > 0.1) return null; // 10%概率

    const possibleEvents = this.getPossibleEvents(playerPos, map);
    if (possibleEvents.length === 0) return null;

    const event = randomPick(possibleEvents);
    this.activeEvents.push(event);

    return event;
  }

  // 处理事件触发
  triggerEvent(eventId: string, player: Player): EventResult {
    const event = this.activeEvents.find(e => e.id === eventId);
    if (!event) return { success: false, error: '事件不存在' };

    // 检查条件
    if (event.condition && !event.condition(player)) {
      return { success: false, error: '不满足触发条件' };
    }

    // 应用效果
    const result = this.applyEffect(event.effect, player);

    // 记录历史
    this.eventHistory.push(event.id);
    this.activeEvents = this.activeEvents.filter(e => e.id !== eventId);

    return { success: true, result };
  }

  private applyEffect(effect: EventEffect, player: Player): any {
    switch (effect.type) {
      case 'gain_medicine':
        player.inventory.addMedicine(effect.medicineId, effect.amount);
        return { type: 'medicine', medicineId: effect.medicineId, amount: effect.amount };

      case 'gain_currency':
        player.currency += effect.amount;
        return { type: 'currency', amount: effect.amount };

      case 'start_dialogue':
        return { type: 'dialogue', npcId: effect.npcId };

      case 'start_battle':
        return { type: 'battle', battleId: effect.battleId };

      case 'reveal_area':
        return { type: 'reveal', radius: effect.radius };

      case 'take_damage':
        player.health -= effect.amount;
        return { type: 'damage', amount: effect.amount };

      default:
        return { type: 'none' };
    }
  }
}
```

### 7.2 事件示例配置

```typescript
const EVENT_TEMPLATES: MapEvent[] = [
  {
    id: 'event_lost_herbalist',
    type: 'meet_npc',
    trigger: 'proximity',
    condition: (player) => player.level >= 3,
    effect: {
      type: 'start_dialogue',
      npcId: 'lost_herbalist',
    },
    description: '你遇到了一位迷路的采药人...',
  },
  {
    id: 'event_rare_flower',
    type: 'find_herb',
    trigger: 'interaction',
    condition: (player) => player.wuxingAffinity.wood >= 20,
    effect: {
      type: 'gain_medicine',
      medicineId: 'ling_zhi',
      amount: 1,
    },
    description: '发现了一株千年灵芝！',
  },
  {
    id: 'event_cave_in',
    type: 'trap',
    trigger: 'immediate',
    effect: {
      type: 'take_damage',
      amount: 20,
    },
    description: '洞穴发生了塌方，你受了伤',
  },
  {
    id: 'event_secret_path',
    type: 'shortcut',
    trigger: 'interaction',
    condition: (player) => player.perception >= 15,
    effect: {
      type: 'reveal_area',
      radius: 5,
    },
    description: '你发现了一条隐藏的近路',
  },
];
```

## 8. 渲染系统

### 8.2 等角视角渲染

```typescript
class IsometricRenderer {
  private ctx: CanvasRenderingContext2D;
  private tileWidth: number = 64;
  private tileHeight: number = 32;

  // 世界坐标转屏幕坐标
  worldToScreen(x: number, y: number): ScreenPosition {
    const screenX = (x - y) * this.tileWidth / 2;
    const screenY = (x + y) * this.tileHeight / 2;
    return { x: screenX, y: screenY };
  }

  // 屏幕坐标转世界坐标
  screenToWorld(screenX: number, screenY: number): Position {
    const x = (screenX / (this.tileWidth / 2) + screenY / (this.tileHeight / 2)) / 2;
    const y = (screenY / (this.tileHeight / 2) - screenX / (this.tileWidth / 2)) / 2;
    return { x: Math.round(x), y: Math.round(y) };
  }

  render(map: GameMap, camera: Camera): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 计算可见范围
    const visibleTiles = this.getVisibleTiles(map, camera);

    // 按深度排序（从远到近）
    visibleTiles.sort((a, b) => (a.x + a.y) - (b.x + b.y));

    // 渲染每个地块
    for (const tile of visibleTiles) {
      this.renderTile(tile, camera);
    }

    // 渲染玩家
    this.renderPlayer(camera);

    // 渲染特效
    this.renderEffects();
  }

  private renderTile(tile: Tile, camera: Camera): void {
    const screenPos = this.worldToScreen(tile.position.x, tile.position.y);
    const x = screenPos.x - camera.x + this.canvas.width / 2;
    const y = screenPos.y - camera.y + this.canvas.height / 2;

    // 根据发现状态决定渲染方式
    if (tile.discoveryState === 'hidden') {
      // 渲染迷雾
      this.renderFog(x, y);
    } else {
      // 渲染地形
      const terrainProps = TERRAIN_PROPERTIES[tile.terrain];
      this.renderTerrain(x, y, terrainProps);

      // 渲染特征
      if (tile.feature) {
        this.renderFeature(x, y, tile.feature);
      }

      // 渲染药材标记
      if (tile.medicine && tile.discoveryState === 'explored') {
        this.renderMedicineMarker(x, y, tile.medicine);
      }

      // 如果是discovered但未explored，显示问号
      if (tile.discoveryState === 'discovered' && (tile.feature || tile.medicine)) {
        this.renderQuestionMark(x, y);
      }
    }
  }

  private renderTerrain(x: number, y: number, props: TerrainProperty): void {
    // 绘制菱形地块
    this.ctx.fillStyle = props.color;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y - this.tileHeight / 2);
    this.ctx.lineTo(x + this.tileWidth / 2, y);
    this.ctx.lineTo(x, y + this.tileHeight / 2);
    this.ctx.lineTo(x - this.tileWidth / 2, y);
    this.ctx.closePath();
    this.ctx.fill();

    // 绘制边框
    this.ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
  }
}
```

## 9. 单元测试

```typescript
// MapGenerator.test.ts
describe('MapGenerator', () => {
  let generator: MapGenerator;

  beforeEach(() => {
    generator = new MapGenerator();
  });

  it('should generate map with correct size', () => {
    const map = generator.generate({
      chapterId: 'chapter-1',
      wuxing: 'wood',
      size: 6,
      difficulty: 'easy',
      medicineDensity: 0.3,
      eventFrequency: 0.1,
      weatherEnabled: true,
    });

    expect(map.size).toBe(6);
    expect(map.tiles.length).toBe(6);
    expect(map.tiles[0].length).toBe(6);
  });

  it('should ensure all medicine spawns are accessible', () => {
    const map = generator.generate({
      chapterId: 'chapter-1',
      wuxing: 'wood',
      size: 8,
      difficulty: 'normal',
      medicineDensity: 0.4,
      eventFrequency: 0.1,
      weatherEnabled: true,
    });

    const medicineTiles: Position[] = [];
    for (let y = 0; y < map.size; y++) {
      for (let x = 0; x < map.size; x++) {
        if (map.tiles[y][x].medicine) {
          medicineTiles.push({ x, y });
        }
      }
    }

    // 检查每个药材点都可到达
    for (const pos of medicineTiles) {
      const path = findPath(map, map.playerStart, pos);
      expect(path).toBeDefined();
    }
  });

  it('should apply wuxing terrain preference', () => {
    const map = generator.generate({
      chapterId: 'chapter-1',
      wuxing: 'wood',
      size: 10,
      difficulty: 'normal',
      medicineDensity: 0.3,
      eventFrequency: 0.1,
      weatherEnabled: true,
    });

    // 木行应该更多森林
    let forestCount = 0;
    let totalTiles = 0;

    for (let y = 0; y < map.size; y++) {
      for (let x = 0; x < map.size; x++) {
        totalTiles++;
        if (map.tiles[y][x].terrain === 'forest') {
          forestCount++;
        }
      }
    }

    expect(forestCount / totalTiles).toBeGreaterThan(0.2);
  });
});

// DiscoverySystem.test.ts
describe('DiscoverySystem', () => {
  let system: DiscoverySystem;
  let map: GameMap;

  beforeEach(() => {
    map = createMockMap(6);
    system = new DiscoverySystem(map);
  });

  it('should discover tiles in visibility radius', () => {
    const updates = system.onPlayerMove({ x: 3, y: 3 });

    // 应该发现周围的格子
    const discoveredCount = updates.updates.filter(u => u.state === 'discovered').length;
    expect(discoveredCount).toBeGreaterThan(0);
  });

  it('should mark current tile as explored', () => {
    const updates = system.onPlayerMove({ x: 3, y: 3 });

    const explored = updates.updates.find(
      u => u.position.x === 3 && u.position.y === 3 && u.state === 'explored'
    );
    expect(explored).toBeDefined();
  });

  it('should reveal medicine on explored tile', () => {
    // 在3,3放置药材
    map.tiles[3][3].medicine = {
      medicineId: 'test-herb',
      amount: 1,
      rarity: 'common',
      collectionType: 'digging',
    };

    const updates = system.onPlayerMove({ x: 3, y: 3 });

    const explored = updates.updates.find(
      u => u.position.x === 3 && u.position.y === 3 && u.state === 'explored'
    );
    expect(explored?.medicine).toBeDefined();
  });
});

// MinigameManager.test.ts
describe('MinigameManager', () => {
  let manager: MinigameManager;

  beforeEach(() => {
    manager = new MinigameManager();
  });

  it('should start digging game for plant medicine', () => {
    let result: CollectionResult | null = null;

    manager.startCollection('digging', 'common', (r) => { result = r; });

    expect(manager.getCurrentGame()).toBeDefined();
  });

  it('should complete game with success on good performance', () => {
    return new Promise<void>((resolve) => {
      manager.startCollection('tapping', 'common', (result) => {
        expect(result.success).toBe(true);
        resolve();
      });

      // 模拟完美输入
      for (let i = 0; i < 10; i++) {
        manager.onInput({ type: 'tap', timestamp: i * 1000 });
      }
    });
  });
});
```

## 10. 性能优化

### 10.1 视口裁剪

```typescript
class ViewportCulling {
  private viewport: Rect;

  setViewport(x: number, y: number, width: number, height: number): void {
    this.viewport = { x, y, width, height };
  }

  isVisible(x: number, y: number, padding: number = 64): boolean {
    return x + padding >= this.viewport.x &&
           x - padding <= this.viewport.x + this.viewport.width &&
           y + padding >= this.viewport.y &&
           y - padding <= this.viewport.y + this.viewport.height;
  }

  getVisibleTiles(map: GameMap, camera: Camera): Tile[] {
    const visible: Tile[] = [];

    for (let y = 0; y < map.size; y++) {
      for (let x = 0; x < map.size; x++) {
        const screenPos = this.worldToScreen(x, y);
        if (this.isVisible(screenPos.x, screenPos.y)) {
          visible.push(map.tiles[y][x]);
        }
      }
    }

    return visible;
  }
}
```

### 10.2 地图分块加载

```typescript
class ChunkedMapLoader {
  private loadedChunks: Map<string, Chunk> = new Map();
  private chunkSize: number = 16;

  async loadChunk(cx: number, cy: number): Promise<Chunk> {
    const key = `${cx},${cy}`;

    if (this.loadedChunks.has(key)) {
      return this.loadedChunks.get(key)!;
    }

    // 从服务器或本地加载
    const chunk = await this.fetchChunk(cx, cy);
    this.loadedChunks.set(key, chunk);

    return chunk;
  }

  unloadDistantChunks(centerX: number, centerY: number, radius: number): void {
    for (const [key, chunk] of this.loadedChunks) {
      const [cx, cy] = key.split(',').map(Number);
      const distance = Math.sqrt(
        Math.pow(cx - centerX, 2) + Math.pow(cy - centerY, 2)
      );

      if (distance > radius) {
        this.loadedChunks.delete(key);
      }
    }
  }
}
```

---

*文档状态: 技术细分*
*核心: 程序生成 + 渐进发现 + 趣味采集*

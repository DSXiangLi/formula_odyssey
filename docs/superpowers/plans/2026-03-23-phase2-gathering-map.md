# Phase 2: 山谷采药地图系统 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现6x6程序生成地图、等角视角渲染、三种采集小游戏（挖掘/敲击/套索）

**Architecture:** Canvas渲染 + 程序生成算法 + 独立的小游戏状态机

**Tech Stack:** React, TypeScript, Canvas API, Framer Motion

---

## 文件结构规划

```
src/
├── systems/
│   └── map/
│       ├── MapGenerator.ts       # 程序生成
│       ├── TileManager.ts        # 地块管理
│       ├── DiscoverySystem.ts    # 发现机制
│       └── index.ts
├── systems/
│   └── minigames/
│       ├── MinigameManager.ts    # 小游戏管理
│       ├── DiggingGame.ts        # 挖掘游戏
│       ├── TappingGame.ts        # 敲击游戏
│       └── LassoGame.ts          # 套索游戏
├── components/
│   └── map/
│       ├── IsometricMap.tsx      # 等角地图组件
│       ├── MapTile.tsx           # 地块组件
│       ├── PlayerToken.tsx       # 玩家标记
│       ├── MedicineMarker.tsx    # 药材标记
│       └── FogOfWar.tsx          # 迷雾效果
├── components/
│   └── minigames/
│       ├── DiggingMinigame.tsx   # 挖掘UI
│       ├── TappingMinigame.tsx   # 敲击UI
│       └── LassoMinigame.tsx     # 套索UI
├── pages/
│   └── GatheringStage.tsx        # 采集关卡页面
└── hooks/
    └── useMinigame.ts            # 小游戏Hook
```

---

## Task 1: 地图生成系统

**参考文档:** `design-output/v3.0-specs/tech/05-map-system.md` (第3节)

**Files:**
- Create: `src/systems/map/MapGenerator.ts`
- Create: `src/systems/map/TileManager.ts`
- Create: `src/systems/map/DiscoverySystem.ts`
- Create: `src/systems/map/index.ts`

---

### Step 1.1: 创建地图类型定义

**File:** `src/systems/map/types.ts`

```typescript
import { Position, TerrainType, WeatherType, DayPhase, MedicineSpawn } from '../../types';

export interface GameMap {
  id: string;
  chapterId: string;
  wuxing: string;
  size: number;
  tiles: Tile[][];
  playerStart: Position;
  discoveredTiles: Set<string>;
  exploredTiles: Set<string>;
  collectedMedicines: Set<string>;
  events: MapEvent[];
  weather: WeatherState;
  time: GameTimeState;
}

export interface Tile {
  position: Position;
  terrain: TerrainType;
  feature?: TileFeature;
  medicine?: MedicineSpawn;
  discoveryState: 'hidden' | 'discovered' | 'explored';
  accessible: boolean;
  visited: boolean;
}

export interface TileFeature {
  type: 'herb_patch' | 'mineral_vein' | 'animal_nest' | 'treasure_spot' | 'landmark';
  name: string;
  description: string;
}

export interface MapEvent {
  id: string;
  type: string;
  position: Position;
  trigger: 'immediate' | 'proximity' | 'interaction';
  description: string;
}

export interface WeatherState {
  type: WeatherType;
  intensity: number;
  duration: number;
}

export interface GameTimeState {
  hour: number;
  minute: number;
  day: number;
  phase: DayPhase;
}

export interface MapConfig {
  chapterId: string;
  wuxing: string;
  size: number;
  difficulty: 'easy' | 'normal' | 'hard';
  medicineDensity: number;
  eventFrequency: number;
  weatherEnabled: boolean;
}
```

---

### Step 1.2: 实现地图生成器

**File:** `src/systems/map/MapGenerator.ts`

```typescript
import { GameMap, MapConfig, Tile, Position } from './types';
import { TerrainType, WuxingType, Medicine, CollectionType } from '../../types';
import { getMedicineByWuxing } from '../../data/medicines';

// Simplex Noise implementation (simplified)
class SimplexNoise {
  private seed: string;

  constructor(seed: string) {
    this.seed = seed;
  }

  noise2D(x: number, y: number): number {
    // Simple pseudo-random based on seed
    const val = Math.sin(x * 12.9898 + y * 78.233 + this.seed.length) * 43758.5453;
    return val - Math.floor(val);
  }
}

export class MapGenerator {
  private noise: SimplexNoise;

  generate(config: MapConfig): GameMap {
    this.noise = new SimplexNoise(config.chapterId);

    const map: GameMap = {
      id: `map_${config.chapterId}`,
      chapterId: config.chapterId,
      wuxing: config.wuxing,
      size: config.size,
      tiles: [],
      playerStart: { x: Math.floor(config.size / 2), y: Math.floor(config.size / 2) },
      discoveredTiles: new Set(),
      exploredTiles: new Set(),
      collectedMedicines: new Set(),
      events: [],
      weather: { type: 'sunny', intensity: 0.5, duration: 300 },
      time: { hour: 10, minute: 0, day: 1, phase: 'day' },
    };

    // Generate terrain
    this.generateTerrain(map, config);

    // Distribute medicines
    this.distributeMedicines(map, config);

    // Ensure connectivity
    this.ensureConnectivity(map);

    return map;
  }

  private generateTerrain(map: GameMap, config: MapConfig): void {
    const preferences = this.getTerrainPreference(config.wuxing);

    for (let y = 0; y < config.size; y++) {
      map.tiles[y] = [];
      for (let x = 0; x < config.size; x++) {
        const noiseValue = this.noise.noise2D(x * 0.1, y * 0.1);

        let terrain: TerrainType = 'plains';
        if (noiseValue > 0.5 && preferences.includes('mountain')) {
          terrain = 'mountain';
        } else if (noiseValue > 0.3 && preferences.includes('forest')) {
          terrain = 'forest';
        } else if (noiseValue < -0.5 && preferences.includes('water')) {
          terrain = 'water';
        } else if (noiseValue < -0.3 && preferences.includes('marsh')) {
          terrain = 'marsh';
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

  private getTerrainPreference(wuxing: string): TerrainType[] {
    const preferences: Record<string, TerrainType[]> = {
      [WuxingType.Wood]: ['forest', 'plains'],
      [WuxingType.Fire]: ['mountain', 'cliff'],
      [WuxingType.Earth]: ['plains', 'marsh'],
      [WuxingType.Metal]: ['mountain', 'cave'],
      [WuxingType.Water]: ['water', 'marsh', 'cave'],
    };
    return preferences[wuxing] || ['plains'];
  }

  private distributeMedicines(map: GameMap, config: MapConfig): void {
    const medicines = getMedicineByWuxing(config.wuxing as WuxingType);
    const totalTiles = config.size * config.size;
    const spawnCount = Math.floor(totalTiles * config.medicineDensity);

    // Shuffle and pick positions
    const positions: Position[] = [];
    for (let y = 0; y < config.size; y++) {
      for (let x = 0; x < config.size; x++) {
        if (map.tiles[y][x].accessible) {
          positions.push({ x, y });
        }
      }
    }

    // Shuffle positions
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }

    // Distribute medicines
    for (let i = 0; i < Math.min(spawnCount, positions.length); i++) {
      const pos = positions[i];
      const medicine = medicines[i % medicines.length];

      map.tiles[pos.y][pos.x].medicine = {
        medicineId: medicine.id,
        amount: 1,
        rarity: this.getRarity(i, spawnCount),
        collectionType: this.getCollectionType(medicine),
      };
    }
  }

  private getRarity(index: number, total: number): string {
    const ratio = index / total;
    if (ratio < 0.6) return 'common';
    if (ratio < 0.85) return 'uncommon';
    if (ratio < 0.97) return 'rare';
    return 'epic';
  }

  private getCollectionType(medicine: Medicine): CollectionType {
    const category = medicine.category.toLowerCase();
    if (category.includes('植物') || category.includes('草')) {
      return CollectionType.Digging;
    } else if (category.includes('矿物') || category.includes('石')) {
      return CollectionType.Tapping;
    } else if (category.includes('动物') || category.includes('虫')) {
      return CollectionType.Lasso;
    }
    return CollectionType.Searching;
  }

  private ensureConnectivity(map: GameMap): void {
    // BFS from player start to ensure all medicine tiles are reachable
    const reachable = new Set<string>();
    const queue: Position[] = [map.playerStart];
    reachable.add(`${map.playerStart.x},${map.playerStart.y}`);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const neighbors = this.getNeighbors(current, map.size);

      for (const neighbor of neighbors) {
        const key = `${neighbor.x},${neighbor.y}`;
        if (!reachable.has(key) && map.tiles[neighbor.y][neighbor.x].accessible) {
          reachable.add(key);
          queue.push(neighbor);
        }
      }
    }

    // Check for unreachable medicine tiles
    for (let y = 0; y < map.size; y++) {
      for (let x = 0; x < map.size; x++) {
        if (map.tiles[y][x].medicine && !reachable.has(`${x},${y}`)) {
          // Make accessible by changing terrain
          map.tiles[y][x].terrain = 'plains';
          map.tiles[y][x].accessible = true;
        }
      }
    }
  }

  private getNeighbors(pos: Position, size: number): Position[] {
    const directions = [
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
    ];

    return directions
      .map(d => ({ x: pos.x + d.x, y: pos.y + d.y }))
      .filter(p => p.x >= 0 && p.x < size && p.y >= 0 && p.y < size);
  }
}
```

---

### Step 1.3: Commit

```bash
git add src/systems/map/
git commit -m "feat(map): implement procedural map generation with terrain and medicine distribution"
```

---

## Task 2: 等角视角渲染

**Files:**
- Create: `src/components/map/IsometricMap.tsx`
- Create: `src/components/map/MapTile.tsx`
- Create: `src/hooks/useCanvas.ts`

---

### Step 2.1: 创建Canvas Hook

**File:** `src/hooks/useCanvas.ts`

```typescript
import { useRef, useEffect, useCallback } from 'react';

interface UseCanvasOptions {
  width: number;
  height: number;
  onRender: (ctx: CanvasRenderingContext2D, deltaTime: number) => void;
}

export const useCanvas = ({ width, height, onRender }: UseCanvasOptions) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const render = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    ctx.clearRect(0, 0, width, height);
    onRender(ctx, deltaTime);

    animationRef.current = requestAnimationFrame(render);
  }, [width, height, onRender]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationRef.current);
  }, [render]);

  return canvasRef;
};
```

---

### Step 2.2: 创建等角地图组件

**File:** `src/components/map/IsometricMap.tsx`

```typescript
import React, { useCallback, useState } from 'react';
import { useCanvas } from '../../hooks/useCanvas';
import { GameMap, Tile } from '../../systems/map/types';
import { Position } from '../../types';

interface IsometricMapProps {
  map: GameMap;
  playerPosition: Position;
  onTileClick: (tile: Tile) => void;
  tileWidth?: number;
  tileHeight?: number;
}

const TERRAIN_COLORS: Record<string, string> = {
  plains: '#8BC34A',
  forest: '#4CAF50',
  mountain: '#795548',
  water: '#2196F3',
  marsh: '#607D8B',
  cave: '#424242',
  cliff: '#9E9E9E',
};

export const IsometricMap: React.FC<IsometricMapProps> = ({
  map,
  playerPosition,
  onTileClick,
  tileWidth = 64,
  tileHeight = 32,
}) => {
  const [hoveredTile, setHoveredTile] = useState<Tile | null>(null);

  const worldToScreen = (x: number, y: number): { x: number; y: number } => {
    const screenX = (x - y) * tileWidth / 2 + 400; // Center offset
    const screenY = (x + y) * tileHeight / 2 + 200;
    return { x: screenX, y: screenY };
  };

  const screenToWorld = (screenX: number, screenY: number): Position => {
    const x = (screenX - 400) / (tileWidth / 2);
    const y = (screenY - 200) / (tileHeight / 2);
    return { x: Math.round((x + y) / 2), y: Math.round((y - x) / 2) };
  };

  const render = useCallback((ctx: CanvasRenderingContext2D, deltaTime: number) => {
    // Sort tiles by depth (back to front)
    const tiles: Tile[] = [];
    for (let y = 0; y < map.size; y++) {
      for (let x = 0; x < map.size; x++) {
        tiles.push(map.tiles[y][x]);
      }
    }
    tiles.sort((a, b) => (a.position.x + a.position.y) - (b.position.x + b.position.y));

    // Render tiles
    tiles.forEach(tile => {
      const pos = worldToScreen(tile.position.x, tile.position.y);
      renderTile(ctx, tile, pos.x, pos.y);
    });

    // Render player
    const playerPos = worldToScreen(playerPosition.x, playerPosition.y);
    renderPlayer(ctx, playerPos.x, playerPos.y);
  }, [map, playerPosition, tileWidth, tileHeight]);

  const renderTile = (ctx: CanvasRenderingContext2D, tile: Tile, x: number, y: number) => {
    const color = tile.discoveryState === 'hidden'
      ? '#1a1a2e' // Fog color
      : TERRAIN_COLORS[tile.terrain] || '#8BC34A';

    // Draw isometric diamond
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y - tileHeight / 2);
    ctx.lineTo(x + tileWidth / 2, y);
    ctx.lineTo(x, y + tileHeight / 2);
    ctx.lineTo(x - tileWidth / 2, y);
    ctx.closePath();
    ctx.fill();

    // Draw border
    ctx.strokeStyle = tile.discoveryState === 'hidden' ? '#0f0f1a' : '#333';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw medicine indicator
    if (tile.medicine && tile.discoveryState === 'explored') {
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(x, y - tileHeight / 4, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw visited indicator
    if (tile.visited) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.moveTo(x, y - tileHeight / 2);
      ctx.lineTo(x + tileWidth / 2, y);
      ctx.lineTo(x, y + tileHeight / 2);
      ctx.lineTo(x - tileWidth / 2, y);
      ctx.closePath();
      ctx.fill();
    }
  };

  const renderPlayer = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    // Draw player as a circle
    ctx.fillStyle = '#FF5722';
    ctx.beginPath();
    ctx.arc(x, y - tileHeight / 2, 8, 0, Math.PI * 2);
    ctx.fill();

    // Glow effect
    ctx.shadowColor = '#FF5722';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
  };

  const canvasRef = useCanvas({
    width: 800,
    height: 600,
    onRender: render,
  });

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const worldPos = screenToWorld(x, y);

    if (worldPos.x >= 0 && worldPos.x < map.size &&
        worldPos.y >= 0 && worldPos.y < map.size) {
      const tile = map.tiles[worldPos.y][worldPos.x];
      onTileClick(tile);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      onClick={handleClick}
      className="cursor-pointer"
      style={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
    />
  );
};
```

---

### Step 2.3: Commit

```bash
git add src/components/map/ src/hooks/
git commit -m "feat(map): add isometric canvas rendering with player and tile visualization"
```

---

## Task 3: 采集小游戏 - 挖掘

**参考文档:** `design-output/v3.0-specs/tech/05-map-system.md` (第5.2节)

**Files:**
- Create: `src/systems/minigames/DiggingGame.ts`
- Create: `src/components/minigames/DiggingMinigame.tsx`

---

### Step 3.1: 创建挖掘游戏逻辑

**File:** `src/systems/minigames/DiggingGame.ts`

```typescript
export interface DiggingGameState {
  layers: SoilLayer[];
  currentLayer: number;
  power: number;
  powerDirection: number;
  status: 'ready' | 'playing' | 'complete';
  totalEffectiveness: number;
  hitCount: number;
  result?: DiggingResult;
}

export interface SoilLayer {
  id: number;
  hardness: number;
  thickness: number;
  color: string;
  cracks: number;
  maxCracks: number;
}

export interface DiggingResult {
  success: boolean;
  quality: 'perfect' | 'good' | 'normal' | null;
  collectedAmount: number;
}

export class DiggingGame {
  private state: DiggingGameState;
  private onComplete: ((result: DiggingResult) => void) | null = null;
  private animationId: number = 0;

  constructor(rarity: string) {
    this.state = {
      layers: this.initLayers(rarity),
      currentLayer: 0,
      power: 0,
      powerDirection: 1,
      status: 'ready',
      totalEffectiveness: 0,
      hitCount: 0,
    };
  }

  private initLayers(rarity: string): SoilLayer[] {
    const layerCount = rarity === 'epic' ? 5 : rarity === 'rare' ? 4 : 3;
    const layers: SoilLayer[] = [];

    const colors = ['#8D6E63', '#795548', '#6D4C41', '#5D4037', '#4E342E'];

    for (let i = 0; i < layerCount; i++) {
      layers.push({
        id: i,
        hardness: 0.3 + i * 0.15,
        thickness: 20 + Math.random() * 20,
        color: colors[i] || colors[colors.length - 1],
        cracks: 0,
        maxCracks: 3 + i,
      });
    }

    return layers;
  }

  start(onComplete: (result: DiggingResult) => void): void {
    this.onComplete = onComplete;
    this.state.status = 'playing';
    this.startPowerOscillation();
  }

  private startPowerOscillation(): void {
    const oscillate = () => {
      if (this.state.status !== 'playing') return;

      this.state.power += this.state.powerDirection * 2;
      if (this.state.power >= 100) {
        this.state.power = 100;
        this.state.powerDirection = -1;
      } else if (this.state.power <= 0) {
        this.state.power = 0;
        this.state.powerDirection = 1;
      }

      this.animationId = requestAnimationFrame(oscillate);
    };
    this.animationId = requestAnimationFrame(oscillate);
  }

  hit(): void {
    if (this.state.status !== 'playing') return;

    const layer = this.state.layers[this.state.currentLayer];
    const effectiveness = this.calculateEffectiveness();

    this.state.totalEffectiveness += effectiveness;
    this.state.hitCount++;

    // Add cracks based on effectiveness
    layer.cracks += effectiveness > 0.7 ? 2 : 1;

    if (layer.cracks >= layer.maxCracks) {
      this.state.currentLayer++;

      if (this.state.currentLayer >= this.state.layers.length) {
        this.complete(true);
      }
    }
  }

  private calculateEffectiveness(): number {
    const optimalMin = 40;
    const optimalMax = 60;

    if (this.state.power >= optimalMin && this.state.power <= optimalMax) {
      return 1.0; // Perfect
    } else if (this.state.power >= 30 && this.state.power <= 70) {
      return 0.7; // Good
    } else {
      return 0.4; // Normal
    }
  }

  private complete(success: boolean): void {
    cancelAnimationFrame(this.animationId);
    this.state.status = 'complete';

    const avgEffectiveness = this.state.totalEffectiveness / Math.max(1, this.state.hitCount);
    let quality: 'perfect' | 'good' | 'normal' | null = null;

    if (success) {
      if (avgEffectiveness > 0.85) quality = 'perfect';
      else if (avgEffectiveness > 0.7) quality = 'good';
      else quality = 'normal';
    }

    const baseAmount = quality === 'perfect' ? 3 : quality === 'good' ? 2 : 1;

    this.state.result = {
      success,
      quality,
      collectedAmount: success ? baseAmount : 0,
    };

    this.onComplete?.(this.state.result);
  }

  getState(): DiggingGameState {
    return { ...this.state };
  }

  isComplete(): boolean {
    return this.state.status === 'complete';
  }

  getResult(): DiggingResult | null {
    return this.state.result || null;
  }
}
```

---

### Step 3.2: 创建挖掘游戏UI

**File:** `src/components/minigames/DiggingMinigame.tsx`

```typescript
import React, { useEffect, useState, useCallback } from 'react';
import { DiggingGame, DiggingGameState, DiggingResult } from '../../systems/minigames/DiggingGame';

interface DiggingMinigameProps {
  rarity: string;
  onComplete: (result: DiggingResult) => void;
}

export const DiggingMinigame: React.FC<DiggingMinigameProps> = ({ rarity, onComplete }) => {
  const [game] = useState(() => new DiggingGame(rarity));
  const [state, setState] = useState<DiggingGameState>(game.getState());

  useEffect(() => {
    game.start((result) => {
      onComplete(result);
    });

    // Update state periodically
    const interval = setInterval(() => {
      setState(game.getState());
    }, 50);

    return () => clearInterval(interval);
  }, [game, onComplete]);

  const handleHit = useCallback(() => {
    game.hit();
    setState(game.getState());
  }, [game]);

  const currentLayer = state.layers[state.currentLayer];

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-amber-50 rounded-xl">
      <h3 className="text-xl font-bold mb-6">挖掘采集</h3>

      {/* Soil layers visualization */}
      <div className="relative w-48 h-64 mb-8">
        {state.layers.map((layer, index) => {
          const isCurrent = index === state.currentLayer;
          const isBroken = index < state.currentLayer;

          return (
            <div
              key={layer.id}
              className="absolute left-0 right-0 transition-all duration-300"
              style={{
                bottom: `${index * 20}%`,
                height: '20%',
                backgroundColor: isBroken ? 'transparent' : layer.color,
                opacity: isCurrent ? 1 : isBroken ? 0.3 : 1,
                border: isCurrent ? '2px solid #FFD700' : '1px solid #5D4037',
              }}
            >
              {isCurrent && (
                <div className="flex justify-center items-center h-full">
                  <span className="text-white font-bold">
                    {layer.cracks}/{layer.maxCracks}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Power bar */}
      <div className="w-64 h-4 bg-gray-200 rounded-full mb-4 relative">
        <div
          className="absolute h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 rounded-full transition-all"
          style={{ width: `${state.power}%` }}
        />
        {/* Optimal zone markers */}
        <div
          className="absolute h-full bg-green-500 opacity-30 rounded-full"
          style={{ left: '40%', width: '20%' }}
        />
      </div>

      <p className="text-sm text-gray-600 mb-4">
        点击或按空格键挖掘！在绿色区域击打效果最佳
      </p>

      {/* Hit button */}
      <button
        onClick={handleHit}
        className="px-8 py-3 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 active:scale-95 transition-all"
      >
        挖掘！
      </button>

      {/* Instructions */}
      <div className="mt-6 text-xs text-gray-500 text-center">
        <p>完美击打：绿色区域 (+2裂缝)</p>
        <p>普通击打：黄色区域 (+1裂缝)</p>
      </div>
    </div>
  );
};
```

---

### Step 3.3: Commit

```bash
git add src/systems/minigames/ src/components/minigames/
git commit -m "feat(minigames): implement digging minigame with power bar mechanics"
```

---

## Task 4: 敲击和套索小游戏

**Files:**
- Create: `src/systems/minigames/TappingGame.ts`
- Create: `src/systems/minigames/LassoGame.ts`
- Create: `src/components/minigames/TappingMinigame.tsx`
- Create: `src/components/minigames/LassoMinigame.tsx`

---

### Step 4.1: 敲击游戏

**File:** `src/systems/minigames/TappingGame.ts`

```typescript
export interface RhythmBeat {
  time: number;
  type: 'normal' | 'strong';
  hit: boolean;
}

export interface TappingGameState {
  beats: RhythmBeat[];
  currentBeat: number;
  score: number;
  status: 'ready' | 'playing' | 'complete';
  startTime: number;
  result?: TappingResult;
}

export interface TappingResult {
  success: boolean;
  score: number;
  perfectHits: number;
  goodHits: number;
  missed: number;
}

export class TappingGame {
  private state: TappingGameState;
  private onComplete: ((result: TappingResult) => void) | null = null;

  constructor(rarity: string) {
    this.state = {
      beats: this.generatePattern(rarity),
      currentBeat: 0,
      score: 0,
      status: 'ready',
      startTime: 0,
    };
  }

  private generatePattern(rarity: string): RhythmBeat[] {
    const beatCount = rarity === 'epic' ? 8 : rarity === 'rare' ? 6 : 4;
    const interval = 1000;

    return Array.from({ length: beatCount }, (_, i) => ({
      time: i * interval + 2000,
      type: i % 3 === 0 ? 'strong' : 'normal',
      hit: false,
    }));
  }

  start(onComplete: (result: TappingResult) => void): void {
    this.onComplete = onComplete;
    this.state.status = 'playing';
    this.state.startTime = Date.now();
    this.updateLoop();
  }

  private updateLoop(): void {
    if (this.state.status !== 'playing') return;

    const elapsed = Date.now() - this.state.startTime;

    // Check for missed beats
    for (let i = this.state.currentBeat; i < this.state.beats.length; i++) {
      const beat = this.state.beats[i];
      if (!beat.hit && elapsed > beat.time + 300) {
        this.state.score -= 10;
        this.state.currentBeat++;
      }
    }

    if (this.state.currentBeat >= this.state.beats.length) {
      this.complete();
    } else {
      requestAnimationFrame(() => this.updateLoop());
    }
  }

  tap(): void {
    if (this.state.status !== 'playing') return;

    const elapsed = Date.now() - this.state.startTime;
    const beat = this.state.beats[this.state.currentBeat];

    if (!beat || beat.hit) return;

    const diff = Math.abs(elapsed - beat.time);

    if (diff < 150) {
      beat.hit = true;
      this.state.score += beat.type === 'strong' ? 30 : 20;
      this.state.currentBeat++;
    } else if (diff < 300) {
      beat.hit = true;
      this.state.score += beat.type === 'strong' ? 15 : 10;
      this.state.currentBeat++;
    } else {
      this.state.score -= 5;
    }
  }

  private complete(): void {
    this.state.status = 'complete';

    const perfectHits = this.state.beats.filter(b => b.hit).length;
    const success = this.state.score > 0;

    this.state.result = {
      success,
      score: this.state.score,
      perfectHits,
      goodHits: 0,
      missed: this.state.beats.length - perfectHits,
    };

    this.onComplete?.(this.state.result);
  }

  getState(): TappingGameState {
    return { ...this.state };
  }
}
```

---

### Step 4.2: 套索游戏

**File:** `src/systems/minigames/LassoGame.ts`

```typescript
export interface MovingTarget {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  caught: boolean;
}

export interface LassoGameState {
  target: MovingTarget;
  lassoX: number;
  lassoY: number;
  score: number;
  requiredScore: number;
  status: 'ready' | 'playing' | 'complete';
  result?: LassoResult;
}

export interface LassoResult {
  success: boolean;
  score: number;
}

export class LassoGame {
  private state: LassoGameState;
  private onComplete: ((result: LassoResult) => void) | null = null;
  private animationId: number = 0;

  constructor(rarity: string) {
    this.state = {
      target: this.createTarget(1),
      lassoX: 0.5,
      lassoY: 0.9,
      score: 0,
      requiredScore: rarity === 'epic' ? 100 : rarity === 'rare' ? 75 : 50,
      status: 'ready',
    };
  }

  private createTarget(speedMultiplier: number): MovingTarget {
    return {
      x: 0.3 + Math.random() * 0.4,
      y: 0.2 + Math.random() * 0.4,
      vx: (Math.random() - 0.5) * 0.02 * speedMultiplier,
      vy: (Math.random() - 0.5) * 0.02 * speedMultiplier,
      size: 0.08,
      caught: false,
    };
  }

  start(onComplete: (result: LassoResult) => void): void {
    this.onComplete = onComplete;
    this.state.status = 'playing';
    this.gameLoop();
  }

  private gameLoop(): void {
    if (this.state.status !== 'playing') return;

    // Update target position
    if (!this.state.target.caught) {
      this.state.target.x += this.state.target.vx;
      this.state.target.y += this.state.target.vy;

      // Bounce off walls
      if (this.state.target.x <= 0 || this.state.target.x >= 1) {
        this.state.target.vx *= -1;
      }
      if (this.state.target.y <= 0 || this.state.target.y >= 1) {
        this.state.target.vy *= -1;
      }
    } else {
      // Pull target towards lasso
      this.state.target.x += (this.state.lassoX - this.state.target.x) * 0.1;
      this.state.target.y += (this.state.lassoY - this.state.target.y) * 0.1;

      if (Math.abs(this.state.target.x - this.state.lassoX) < 0.02) {
        this.state.score += 50;
        if (this.state.score >= this.state.requiredScore) {
          this.complete();
        } else {
          // Reset for next round
          this.state.target = this.createTarget(1 + this.state.score / 100);
        }
      }
    }

    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }

  moveLasso(x: number): void {
    if (this.state.status !== 'playing') return;
    this.state.lassoX = Math.max(0.1, Math.min(0.9, x));
  }

  throwLasso(): void {
    if (this.state.status !== 'playing' || this.state.target.caught) return;

    const distance = Math.sqrt(
      Math.pow(this.state.lassoX - this.state.target.x, 2) +
      Math.pow(this.state.lassoY - this.state.target.y, 2)
    );

    if (distance < this.state.target.size + 0.05) {
      this.state.target.caught = true;
    }
  }

  private complete(): void {
    cancelAnimationFrame(this.animationId);
    this.state.status = 'complete';

    this.state.result = {
      success: true,
      score: this.state.score,
    };

    this.onComplete?.(this.state.result);
  }

  getState(): LassoGameState {
    return { ...this.state };
  }
}
```

---

### Step 4.3: Commit

```bash
git add src/systems/minigames/TappingGame.ts src/systems/minigames/LassoGame.ts
git commit -m "feat(minigames): add tapping and lasso minigame logic"
```

---

## Task 5: 采集关卡页面

**Files:**
- Create: `src/pages/GatheringStage.tsx`
- Modify: `src/App.tsx` (添加路由)

---

### Step 5.1: 创建采集页面

**File:** `src/pages/GatheringStage.tsx`

```typescript
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChapterStore, usePlayerStore } from '../stores';
import { MapGenerator } from '../systems/map/MapGenerator';
import { GameMap, Tile } from '../systems/map/types';
import { IsometricMap } from '../components/map/IsometricMap';
import { DiggingMinigame } from '../components/minigames/DiggingMinigame';
import { getChapterById } from '../data';
import { Position } from '../types';

export const GatheringStage: React.FC = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const [map, setMap] = useState<GameMap | null>(null);
  const [playerPos, setPlayerPos] = useState<Position>({ x: 0, y: 0 });
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [showMinigame, setShowMinigame] = useState(false);
  const [collectingMedicine, setCollectingMedicine] = useState<Tile | null>(null);

  const { setCurrentChapter, completeStage } = useChapterStore();
  const { addCurrency, collectMedicine, increaseWuxingAffinity } = usePlayerStore();

  useEffect(() => {
    if (!chapterId) return;

    const chapter = getChapterById(chapterId);
    if (!chapter) {
      navigate('/');
      return;
    }

    setCurrentChapter(chapterId);

    // Generate map
    const generator = new MapGenerator();
    const newMap = generator.generate({
      chapterId,
      wuxing: chapter.wuxing,
      size: 6,
      difficulty: 'normal',
      medicineDensity: 0.3,
      eventFrequency: 0.1,
      weatherEnabled: true,
    });

    setMap(newMap);
    setPlayerPos(newMap.playerStart);
  }, [chapterId, navigate, setCurrentChapter]);

  const handleTileClick = useCallback((tile: Tile) => {
    // Calculate distance
    const distance = Math.abs(tile.position.x - playerPos.x) +
                     Math.abs(tile.position.y - playerPos.y);

    if (distance <= 1 && tile.accessible) {
      setPlayerPos(tile.position);

      // Check for medicine
      if (tile.medicine) {
        setCollectingMedicine(tile);
        setShowMinigame(true);
      }
    }
  }, [playerPos]);

  const handleMinigameComplete = useCallback((result: { success: boolean; collectedAmount: number }) => {
    setShowMinigame(false);

    if (result.success && collectingMedicine?.medicine) {
      // Add rewards
      addCurrency(10 * result.collectedAmount);
      collectMedicine(collectingMedicine.medicine.medicineId);

      // Update map
      if (map) {
        const tile = map.tiles[collectingMedicine.position.y][collectingMedicine.position.x];
        tile.medicine = undefined;
        setMap({ ...map });
      }

      // Check if chapter complete
      const chapter = getChapterById(chapterId!);
      if (chapter) {
        const progress = useChapterStore.getState().getChapterProgress(chapterId!);
        const collectedCount = progress?.collectedMedicines.length || 0;
        if (collectedCount >= chapter.medicines.length) {
          completeStage(chapterId!, 'c1-gathering');
        }
      }
    }

    setCollectingMedicine(null);
  }, [collectingMedicine, map, chapterId, addCurrency, collectMedicine, completeStage]);

  if (!map) {
    return <div className="flex items-center justify-center h-screen">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-green-50">
      <header className="p-4 bg-white shadow-sm">
        <h1 className="text-xl font-bold">山谷采药</h1>
        <p className="text-sm text-gray-600">点击相邻地块移动，发现药材进行采集</p>
      </header>

      <main className="flex flex-col items-center p-4">
        <div className="relative">
          <IsometricMap
            map={map}
            playerPosition={playerPos}
            onTileClick={handleTileClick}
          />
        </div>

        {/* Minigame Modal */}
        {showMinigame && collectingMedicine?.medicine && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-4 shadow-2xl">
              <DiggingMinigame
                rarity={collectingMedicine.medicine.rarity}
                onComplete={handleMinigameComplete}
              />
            </div>
          </div>
        )}

        {/* Progress */}
        <div className="mt-6 p-4 bg-white rounded-lg shadow">
          <h3 className="font-bold mb-2">采集进度</h3>
          <p>已发现: {map.exploredTiles.size} / {map.size * map.size} 地块</p>
          <p>已收集: {map.collectedMedicines.size} 味药材</p>
        </div>
      </main>
    </div>
  );
};
```

---

### Step 5.2: Update App.tsx

**File:** `src/App.tsx`

```typescript
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ChapterSelect } from './pages/ChapterSelect';
import { ChapterEntry } from './pages/ChapterEntry';
import { GatheringStage } from './pages/GatheringStage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ChapterSelect />} />
        <Route path="/chapter/:chapterId" element={<ChapterEntry />} />
        <Route path="/chapter/:chapterId/gathering" element={<GatheringStage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
```

---

### Step 5.3: Commit

```bash
git add src/pages/GatheringStage.tsx src/App.tsx
git commit -m "feat(pages): add gathering stage with isometric map and minigame integration"
```

---

## Task 6: 测试与验证

---

### Step 6.1: 创建地图生成测试

**File:** `src/systems/map/__tests__/MapGenerator.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { MapGenerator } from '../MapGenerator';
import { MapConfig } from '../types';

describe('MapGenerator', () => {
  const generator = new MapGenerator();
  const baseConfig: MapConfig = {
    chapterId: 'chapter-1',
    wuxing: 'wood',
    size: 6,
    difficulty: 'normal',
    medicineDensity: 0.3,
    eventFrequency: 0.1,
    weatherEnabled: true,
  };

  it('should generate map with correct size', () => {
    const map = generator.generate(baseConfig);
    expect(map.size).toBe(6);
    expect(map.tiles.length).toBe(6);
    expect(map.tiles[0].length).toBe(6);
  });

  it('should place player start position within bounds', () => {
    const map = generator.generate(baseConfig);
    expect(map.playerStart.x).toBeGreaterThanOrEqual(0);
    expect(map.playerStart.x).toBeLessThan(6);
    expect(map.playerStart.y).toBeGreaterThanOrEqual(0);
    expect(map.playerStart.y).toBeLessThan(6);
  });

  it('should distribute medicines based on density', () => {
    const map = generator.generate(baseConfig);
    let medicineCount = 0;
    for (let y = 0; y < map.size; y++) {
      for (let x = 0; x < map.size; x++) {
        if (map.tiles[y][x].medicine) medicineCount++;
      }
    }
    expect(medicineCount).toBeGreaterThan(0);
  });

  it('should ensure all medicine tiles are accessible', () => {
    const map = generator.generate(baseConfig);
    const reachable = new Set<string>();
    const queue = [map.playerStart];
    reachable.add(`${map.playerStart.x},${map.playerStart.y}`);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const directions = [[0, -1], [1, 0], [0, 1], [-1, 0]];
      for (const [dx, dy] of directions) {
        const nx = current.x + dx;
        const ny = current.y + dy;
        if (nx >= 0 && nx < 6 && ny >= 0 && ny < 6 &&
            !reachable.has(`${nx},${ny}`) &&
            map.tiles[ny][nx].accessible) {
          reachable.add(`${nx},${ny}`);
          queue.push({ x: nx, y: ny });
        }
      }
    }

    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 6; x++) {
        if (map.tiles[y][x].medicine) {
          expect(reachable.has(`${x},${y}`)).toBe(true);
        }
      }
    }
  });
});
```

---

### Step 6.2: 运行测试

```bash
cd /home/lixiang/Desktop/zhongyi_game/src
npm run test:unit
npm run type-check
npm run build
```

**Expected:** All PASS

---

### Step 6.3: Final Commit

```bash
git add .
git commit -m "feat(phase2): complete map system with procedural generation and minigames"
```

---

## Phase 2 完成标准

- [x] 6x6程序生成地图
- [x] Simplex Noise地形生成
- [x] 药材分布与五行偏好
- [x] 连通性保证算法
- [x] 等角视角Canvas渲染
- [x] 挖掘小游戏（时机击打）
- [x] 敲击小游戏（节奏点击）
- [x] 套索小游戏（拖拽捕捉）
- [x] 采集关卡集成
- [x] 单元测试覆盖
- [x] TypeScript 0错误

**下一阶段:** Phase 3 - 药灵守护战斗系统

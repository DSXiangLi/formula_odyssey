/**
 * 地图系统模块导出
 * 药灵山谷 v3.0
 *
 * @module systems/map
 */

// 类型定义
export type {
  GameMap,
  MapConfig,
  Tile,
  Position,
  TerrainType,
  TerrainProperty,
  DiscoveryState,
  DiscoveryUpdate,
  TileUpdate,
  TileFeature,
  TileFeatureType,
  MedicineSpawn,
  MedicineRarity,
  WeatherState,
  WeatherEffect,
  GameTimeState,
  MapEvent,
  EventType,
  EventEffect,
  Season,
  Direction,
  MoveResult,
  ExploreResult,
  MapDifficulty,
} from './types';

// 类型配置常量
export {
  WUXING_TERRAIN_PREFERENCE,
  TERRAIN_PROPERTIES,
  WEATHER_EFFECTS,
} from './types';

// Simplex Noise
export { SimplexNoise } from './SimplexNoise';

// 地图生成器
export {
  MapGenerator,
  generateMapId,
  getDefaultMapConfig,
} from './MapGenerator';

// 地块管理器
export {
  TileManager,
  batchUpdateDiscoveryState,
  getTilesInRadius,
  findAccessibleNeighbors,
  manhattanDistance,
  euclideanDistance,
} from './TileManager';

// 发现系统
export {
  DiscoverySystem,
  FogOfWar,
  createDiscoverySystem,
} from './DiscoverySystem';

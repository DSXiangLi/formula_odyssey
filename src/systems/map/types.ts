/**
 * 地图系统类型定义
 * 药灵山谷 v3.0 - 山谷采药系统
 *
 * @module systems/map/types
 */

import { WuxingType, CollectionType, WeatherType, DayPhase } from '../../types';

/**
 * 位置坐标
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * 地形类型
 */
export type TerrainType =
  | 'plains'      // 平原
  | 'forest'      // 森林
  | 'mountain'    // 山地
  | 'water'       // 水域
  | 'marsh'       // 沼泽
  | 'cave'        // 洞穴
  | 'cliff';      // 悬崖

/**
 * 发现状态
 */
export type DiscoveryState = 'hidden' | 'discovered' | 'explored';

/**
 * 地图难度
 */
export type MapDifficulty = 'easy' | 'normal' | 'hard';

/**
 * 药材稀有度
 */
export type MedicineRarity = 'common' | 'uncommon' | 'rare' | 'epic';

/**
 * 事件类型
 */
export type EventType =
  | 'find_herb'           // 发现草药
  | 'meet_npc'            // 遇到NPC
  | 'weather_effect'      // 天气影响
  | 'random_encounter'    // 随机遭遇
  | 'treasure'            // 发现宝藏
  | 'trap'                // 触发陷阱
  | 'shortcut';           // 发现捷径

/**
 * 地块特征类型
 */
export type TileFeatureType =
  | 'herb_patch'      // 草药丛
  | 'mineral_vein'    // 矿脉
  | 'animal_nest'     // 动物巢穴
  | 'treasure_spot'   // 宝藏点
  | 'landmark';       // 地标

/**
 * 地图配置
 */
export interface MapConfig {
  /** 章节ID */
  chapterId: string;
  /** 五行类型 */
  wuxing: WuxingType;
  /** 地图大小 (6x6, 8x8, 10x10) */
  size: number;
  /** 难度 */
  difficulty: MapDifficulty;
  /** 药材密度 0-1 */
  medicineDensity: number;
  /** 事件频率 */
  eventFrequency: number;
  /** 是否启用天气 */
  weatherEnabled: boolean;
  /** 特殊规则 */
  specialRules?: string[];
}

/**
 * 地形属性
 */
export interface TerrainProperty {
  /** 移动消耗 */
  moveCost: number;
  /** 视野范围倍数 */
  visibility: number;
  /** 药材生成加成 */
  medicineBonus: number;
  /** 描述 */
  description: string;
  /** 颜色 */
  color: string;
}

/**
 * 地块特征
 */
export interface TileFeature {
  /** 特征类型 */
  type: TileFeatureType;
  /** 名称 */
  name: string;
  /** 描述 */
  description: string;
  /** 视觉效果 */
  visualEffect?: string;
}

/**
 * 药材刷新点
 */
export interface MedicineSpawn {
  /** 药材ID */
  medicineId: string;
  /** 数量 */
  amount: number;
  /** 稀有度 */
  rarity: MedicineRarity;
  /** 采集类型 */
  collectionType: CollectionType;
  /** 重生时间(秒) */
  respawnTime?: number;
}

/**
 * 地块
 */
export interface Tile {
  /** 位置 */
  position: Position;
  /** 地形类型 */
  terrain: TerrainType;
  /** 特征 */
  feature?: TileFeature;
  /** 药材 */
  medicine?: MedicineSpawn;
  /** 发现状态 */
  discoveryState: DiscoveryState;
  /** 是否可通行 */
  accessible: boolean;
  /** 是否已访问 */
  visited: boolean;
}

/**
 * 天气效果
 */
export interface WeatherEffect {
  /** 效果类型 */
  type: 'visibility' | 'move_speed' | 'medicine_spawn' | 'special_event';
  /** 效果值 */
  value: number;
  /** 描述 */
  description: string;
}

/**
 * 天气状态
 */
export interface WeatherState {
  /** 天气类型 */
  type: WeatherType;
  /** 强度 0-1 */
  intensity: number;
  /** 剩余时间(秒) */
  duration: number;
  /** 效果列表 */
  effects: WeatherEffect[];
}

/**
 * 游戏时间状态
 */
export interface GameTimeState {
  /** 小时 0-23 */
  hour: number;
  /** 分钟 0-59 */
  minute: number;
  /** 第几天 */
  day: number;
  /** 季节 */
  season: Season;
  /** 时段 */
  phase: DayPhase;
}

/**
 * 季节
 */
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

/**
 * 地图事件
 */
export interface MapEvent {
  /** 事件ID */
  id: string;
  /** 事件类型 */
  type: EventType;
  /** 位置 */
  position: Position;
  /** 触发方式 */
  trigger: 'immediate' | 'proximity' | 'interaction';
  /** 描述 */
  description: string;
  /** 触发条件 */
  condition?: (playerData: unknown) => boolean;
  /** 事件效果 */
  effect?: EventEffect;
}

/**
 * 事件效果
 */
export interface EventEffect {
  type: string;
  [key: string]: unknown;
}

/**
 * 游戏地图
 */
export interface GameMap {
  /** 地图ID */
  id: string;
  /** 章节ID */
  chapterId: string;
  /** 五行类型 */
  wuxing: WuxingType;
  /** 地图大小 */
  size: number;
  /** 地块二维数组 */
  tiles: Tile[][];
  /** 玩家起始位置 */
  playerStart: Position;
  /** 已发现地块坐标集合 (格式: "x,y") */
  discoveredTiles: Set<string>;
  /** 已探索地块坐标集合 (格式: "x,y") */
  exploredTiles: Set<string>;
  /** 已采集药材ID集合 */
  collectedMedicines: Set<string>;
  /** 事件列表 */
  events: MapEvent[];
  /** 天气状态 */
  weather: WeatherState;
  /** 游戏时间 */
  time: GameTimeState;
}

/**
 * 发现更新结果
 */
export interface DiscoveryUpdate {
  /** 更新的地块列表 */
  updates: TileUpdate[];
}

/**
 * 地块更新
 */
export interface TileUpdate {
  /** 位置 */
  position: Position;
  /** 新状态 */
  state: DiscoveryState;
  /** 地形(仅在discovered时) */
  terrain?: TerrainType;
  /** 特征(仅在explored时) */
  feature?: TileFeature;
  /** 药材(仅在explored且有药时) */
  medicine?: MedicineSpawn;
}

/**
 * 移动方向
 */
export type Direction = 'up' | 'down' | 'left' | 'right';

/**
 * 移动结果
 */
export interface MoveResult {
  /** 是否成功 */
  success: boolean;
  /** 新位置 */
  newPosition?: Position;
  /** 错误信息 */
  error?: string;
  /** 发现更新 */
  discovery?: DiscoveryUpdate;
}

/**
 * 探索结果
 */
export interface ExploreResult {
  /** 是否成功 */
  success: boolean;
  /** 地块信息 */
  tile?: Tile;
  /** 错误信息 */
  error?: string;
}

/**
 * 五行地形偏好配置
 */
export const WUXING_TERRAIN_PREFERENCE: Record<WuxingType, TerrainType[]> = {
  [WuxingType.Wood]: ['forest', 'plains'],           // 木行：森林、平原
  [WuxingType.Fire]: ['mountain', 'cliff'],          // 火行：山地、悬崖
  [WuxingType.Earth]: ['plains', 'marsh'],           // 土行：平原、沼泽
  [WuxingType.Metal]: ['mountain', 'cave'],          // 金行：山地、洞穴
  [WuxingType.Water]: ['water', 'marsh', 'cave'],    // 水行：水域、沼泽、洞穴
};

/**
 * 地形属性配置
 */
export const TERRAIN_PROPERTIES: Record<TerrainType, TerrainProperty> = {
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

/**
 * 默认天气效果配置
 */
export const WEATHER_EFFECTS: Record<WeatherType, WeatherEffect[]> = {
  [WeatherType.Sunny]: [
    { type: 'visibility', value: 1.2, description: '视野良好' },
    { type: 'medicine_spawn', value: 1.0, description: '正常刷新' },
  ],
  [WeatherType.Cloudy]: [
    { type: 'visibility', value: 1.0, description: '视野正常' },
    { type: 'medicine_spawn', value: 1.0, description: '正常刷新' },
  ],
  [WeatherType.Rainy]: [
    { type: 'visibility', value: 0.7, description: '视野受限' },
    { type: 'move_speed', value: 0.8, description: '移动变慢' },
    { type: 'medicine_spawn', value: 1.3, description: '植物类药材增加' },
  ],
  [WeatherType.Foggy]: [
    { type: 'visibility', value: 0.4, description: '视野大幅降低' },
    { type: 'special_event', value: 1, description: '可能遇到迷路事件' },
  ],
  [WeatherType.Stormy]: [
    { type: 'visibility', value: 0.5, description: '视野受限' },
    { type: 'move_speed', value: 0.6, description: '移动大幅变慢' },
    { type: 'special_event', value: 1, description: '可能遇到雷击事件' },
  ],
  [WeatherType.Snowy]: [
    { type: 'visibility', value: 0.6, description: '视野受限' },
    { type: 'move_speed', value: 0.7, description: '移动变慢' },
    { type: 'medicine_spawn', value: 0.7, description: '药材刷新减少' },
  ],
};

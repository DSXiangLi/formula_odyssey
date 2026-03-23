// v3.0 Enum-based Core Types for 药灵山谷
// AI-Native Chapter-based Learning System

// 基础枚举类型 - 五行
export enum WuxingType {
  Wood = 'wood',
  Fire = 'fire',
  Earth = 'earth',
  Metal = 'metal',
  Water = 'water',
}

// 四气枚举
export enum FourQi {
  Cold = 'cold',
  Cool = 'cool',
  Warm = 'warm',
  Hot = 'hot',
}

// 一天中的时段
export enum DayPhase {
  Dawn = 'dawn',
  Day = 'day',
  Dusk = 'dusk',
  Night = 'night',
}

// 天气类型
export enum WeatherType {
  Sunny = 'sunny',
  Cloudy = 'cloudy',
  Rainy = 'rainy',
  Foggy = 'foggy',
  Stormy = 'stormy',
  Snowy = 'snowy',
}

// 采集类型 - v3.0战斗采集系统
export enum CollectionType {
  Digging = 'digging',     // 挖掘 - 对应根类药材
  Tapping = 'tapping',     // 敲打 - 对应皮类药材
  Lasso = 'lasso',         // 套索 - 对应果实/全草类
  Searching = 'searching', // 搜寻 - 对应矿物/菌类
}

// 战斗阶段
export enum BattlePhase {
  Preparing = 'preparing',
  WaveStart = 'wave_start',
  Spawning = 'spawning',
  Fighting = 'fighting',
  WaveClear = 'wave_clear',
  BossIntro = 'boss_intro',
  BossFight = 'boss_fight',
  Ending = 'ending',
  Settlement = 'settlement',
}

// 阶段类型
export enum StageType {
  Intro = 'intro',
  Gathering = 'gathering',
  Battle = 'battle',
  Formula = 'formula',
  Clinical = 'clinical',
  Mastery = 'mastery',
}

// 向后兼容：字符串字面量类型（用于v2.0迁移）
export type WuxingTypeString = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

// 辅助函数：字符串转枚举
export function stringToWuxing(str: WuxingTypeString): WuxingType {
  switch (str) {
    case 'wood': return WuxingType.Wood;
    case 'fire': return WuxingType.Fire;
    case 'earth': return WuxingType.Earth;
    case 'metal': return WuxingType.Metal;
    case 'water': return WuxingType.Water;
    default: return WuxingType.Wood;
  }
}

// 辅助函数：枚举转字符串
export function wuxingToString(wuxing: WuxingType): WuxingTypeString {
  return wuxing as WuxingTypeString;
}

// v2.0 向后兼容类型导出
export type { Medicine as MedicineV2 } from './medicine';
export type { Chapter, ChapterProgress } from './chapter';
export type { Player } from './player';
export type { AICacheEntry, AIMentorMessage, AIMentorSession } from './ai';

// v3.0 游戏状态迁移工具
// 用于从v2.0平滑迁移到v3.0

import type { GameSession } from './types';

// v2.0存储键名
const V2_STORAGE_KEY = 'fangling-valley-v2-storage';
// v3.0存储键名
const V3_STORAGE_KEY = 'fangling-valley-v3-storage';

// v2.0 Player 类型（部分字段）
interface V2Player {
  currency: number;
  reputation: number;
  collectedMedicines: string[];
  unlockedFormulas: string[];
  medicineAffinity: Record<string, number>;
  formulaProficiency: Record<string, number>;
  completedCases: string[];
  dailyStats: {
    date: string;
  };
  lastLoginDate: string;
  loginStreak: number;
}

// v2.0存储状态
interface V2StorageState {
  player: V2Player;
  seeds: unknown[];
}

/**
 * 检查是否存在v2.0数据
 */
export function hasV2Data(): boolean {
  if (typeof localStorage === 'undefined') return false;
  return localStorage.getItem(V2_STORAGE_KEY) !== null;
}

/**
 * 检查是否存在v3.0数据
 */
export function hasV3Data(): boolean {
  if (typeof localStorage === 'undefined') return false;
  return localStorage.getItem(V3_STORAGE_KEY) !== null;
}

/**
 * 从v2.0数据迁移到v3.0
 */
export function migrateFromV2(): Partial<GameSession> | null {
  if (typeof localStorage === 'undefined') return null;

  const v2DataStr = localStorage.getItem(V2_STORAGE_KEY);
  if (!v2DataStr) return null;

  try {
    const v2Data = JSON.parse(v2DataStr) as V2StorageState;
    const v2Player = v2Data.player;

    // 构建v3.0初始状态
    const v3Data: Partial<GameSession> = {
      // 基础资源
      diamonds: v2Player.currency || 100,
      reputation: v2Player.reputation || 0,

      // 收集进度
      collectedMedicines: v2Player.collectedMedicines || [],
      collectedFormulas: v2Player.unlockedFormulas || [],
      medicineAffinity: v2Player.medicineAffinity || {},
      formulaProficiency: v2Player.formulaProficiency || {},

      // v3.0新增字段（初始值）
      currentChapter: null,
      completedChapters: [],
      chapterProgress: {},
      unlockedSkills: [],
      skillLevels: {},
      skillPoints: 0,
      currentRun: null,
      openWorld: {
        unlockedRegions: [],
        dailyEvents: [],
        completedEvents: [],
        runHistory: [],
        lastLoginDate: new Date().toISOString().split('T')[0],
        loginStreak: v2Player.loginStreak || 0,
      },

      // UI状态
      uiState: {
        isChapterSelectOpen: false,
        isSkillTreeOpen: false,
        isOpenWorldOpen: false,
        isAIDialogOpen: false,
        selectedMedicine: null,
        selectedFormula: null,
        selectedSkill: null,
      },
    };

    return v3Data;
  } catch (error) {
    console.error('[Migrate] v2.0数据解析失败:', error);
    return null;
  }
}

/**
 * 执行完整迁移
 * - 保留v2.0数据（备份）
 * - 创建v3.0数据
 */
export function performMigration(): boolean {
  if (typeof localStorage === 'undefined') return false;

  // 如果已有v3.0数据，不重复迁移
  if (hasV3Data()) {
    console.log('[Migrate] v3.0数据已存在，跳过迁移');
    return false;
  }

  // 如果没有v2.0数据，返回false（将使用默认初始值）
  if (!hasV2Data()) {
    console.log('[Migrate] 未找到v2.0数据，使用默认初始值');
    return false;
  }

  const v3Data = migrateFromV2();
  if (!v3Data) {
    console.error('[Migrate] 迁移失败');
    return false;
  }

  // 备份v2.0数据
  const v2DataStr = localStorage.getItem(V2_STORAGE_KEY);
  if (v2DataStr) {
    localStorage.setItem(`${V2_STORAGE_KEY}-backup-${Date.now()}`, v2DataStr);
  }

  // 写入v3.0数据（注意：实际数据由zustand persist管理，这里只是预准备）
  localStorage.setItem(V3_STORAGE_KEY, JSON.stringify({ state: v3Data, version: 3.0 }));

  console.log('[Migrate] v2.0 -> v3.0 迁移完成');
  console.log('[Migrate] 迁移数据:', {
    diamonds: v3Data.diamonds,
    collectedMedicines: v3Data.collectedMedicines?.length || 0,
    collectedFormulas: v3Data.collectedFormulas?.length || 0,
  });

  return true;
}

/**
 * 清除所有游戏数据（用于重置）
 */
export function clearAllGameData(): void {
  if (typeof localStorage === 'undefined') return;

  // 清除v2.0数据
  localStorage.removeItem(V2_STORAGE_KEY);

  // 清除v3.0数据
  localStorage.removeItem(V3_STORAGE_KEY);

  // 清除备份
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith(V2_STORAGE_KEY) || key.startsWith(V3_STORAGE_KEY))) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key));

  console.log('[Migrate] 所有游戏数据已清除');
}

/**
 * 获取迁移状态信息
 */
export function getMigrationStatus(): {
  hasV2: boolean;
  hasV3: boolean;
  canMigrate: boolean;
} {
  return {
    hasV2: hasV2Data(),
    hasV3: hasV3Data(),
    canMigrate: hasV2Data() && !hasV3Data(),
  };
}

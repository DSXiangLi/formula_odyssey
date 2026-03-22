// v3.0 游戏状态 Hook 集合
// 提供便捷的组件级状态访问

import { useCallback, useMemo } from 'react';
import { useGameStore } from './gameStore';
import { DEFAULT_CHAPTERS, DEFAULT_SKILLS } from './types';

// ==================== 基础状态 Hooks ====================

/**
 * 获取玩家资源（钻石、声望、技能点）
 */
export function usePlayerResources() {
  return useGameStore((state) => ({
    diamonds: state.diamonds,
    reputation: state.reputation,
    skillPoints: state.skillPoints,
  }));
}

/**
 * 获取收集进度
 */
export function useCollectionProgress() {
  return useGameStore((state) => ({
    collectedMedicines: state.collectedMedicines,
    collectedFormulas: state.collectedFormulas,
    medicineCount: state.collectedMedicines.length,
    formulaCount: state.collectedFormulas.length,
    totalScore: state.getTotalScore(),
  }));
}

// ==================== 章节系统 Hooks ====================

/**
 * 获取章节列表和解锁状态
 */
export function useChapters() {
  const store = useGameStore();

  const chapters = useMemo(() => {
    return DEFAULT_CHAPTERS.map((chapter) => {
      const status = store.getChapterUnlockStatus(chapter.id);
      const progress = store.chapterProgress[chapter.id];
      return {
        ...chapter,
        unlocked: status.unlocked,
        unlockReason: status.reason,
        completed: store.completedChapters.includes(chapter.id),
        progress,
      };
    });
  }, [store.completedChapters, store.chapterProgress]);

  return {
    chapters,
    completedCount: store.completedChapters.length,
    totalCount: DEFAULT_CHAPTERS.length,
    currentChapter: store.currentChapter,
  };
}

/**
 * 获取当前进行中的章节
 */
export function useCurrentChapter() {
  const store = useGameStore();

  return useMemo(() => {
    if (!store.currentChapter || !store.currentRun) return null;

    const chapter = DEFAULT_CHAPTERS.find((c) => c.id === store.currentChapter);
    if (!chapter) return null;

    return {
      chapter,
      run: store.currentRun,
      progress: store.chapterProgress[store.currentChapter],
    };
  }, [store.currentChapter, store.currentRun, store.chapterProgress]);
}

// ==================== 技能系统 Hooks ====================

/**
 * 获取所有技能及其状态
 */
export function useSkills() {
  const store = useGameStore();

  const skills = useMemo(() => {
    return DEFAULT_SKILLS.map((skill) => {
      const unlocked = store.unlockedSkills.includes(skill.id);
      const level = store.skillLevels[skill.id] || 0;
      const canUnlock = !unlocked && checkCanUnlock(skill, store);

      return {
        ...skill,
        unlocked,
        level,
        canUnlock,
        isMaxLevel: level >= skill.maxLevel,
      };
    });
  }, [store.unlockedSkills, store.skillLevels, store.skillPoints]);

  return {
    skills,
    skillPoints: store.skillPoints,
    unlockedCount: store.unlockedSkills.length,
    totalCount: DEFAULT_SKILLS.length,
  };
}

/**
 * 检查技能是否可以解锁
 */
function checkCanUnlock(skill: typeof DEFAULT_SKILLS[0], store: ReturnType<typeof useGameStore.getState>): boolean {
  const { unlockCondition } = skill;

  if (unlockCondition.skillPoints && store.skillPoints < unlockCondition.skillPoints) {
    return false;
  }
  if (unlockCondition.chapter) {
    const chapterId = `chapter_${String(unlockCondition.chapter).padStart(2, '0')}`;
    if (!store.completedChapters.includes(chapterId)) {
      return false;
    }
  }
  if (unlockCondition.medicines) {
    return unlockCondition.medicines.every((m) => store.collectedMedicines.includes(m));
  }
  if (unlockCondition.cases) {
    // 简化为检查收集的药物数量作为病案完成的代理
    return store.collectedMedicines.length >= unlockCondition.cases;
  }

  return true;
}

/**
 * 获取特定技能
 */
export function useSkill(skillId: string) {
  const store = useGameStore();

  return useMemo(() => {
    const skill = DEFAULT_SKILLS.find((s) => s.id === skillId);
    if (!skill) return null;

    const unlocked = store.unlockedSkills.includes(skillId);
    const level = store.skillLevels[skillId] || 0;

    return {
      ...skill,
      unlocked,
      level,
      effects: skill.effects.slice(0, level),
    };
  }, [skillId, store.unlockedSkills, store.skillLevels]);
}

// ==================== 开放世界 Hooks ====================

/**
 * 获取开放世界状态
 */
export function useOpenWorld() {
  const store = useGameStore();

  return useMemo(() => {
    const activeEvents = store.getDailyEvents();

    return {
      unlockedRegions: store.openWorld.unlockedRegions,
      dailyEvents: activeEvents,
      completedEvents: store.openWorld.completedEvents,
      runHistory: store.openWorld.runHistory.slice(-10), // 最近10条
      lastLoginDate: store.openWorld.lastLoginDate,
      loginStreak: store.openWorld.loginStreak,
      canEnter: store.completedChapters.length >= 5, // 完成5章后解锁
    };
  }, [
    store.openWorld.unlockedRegions,
    store.openWorld.dailyEvents,
    store.openWorld.completedEvents,
    store.openWorld.runHistory,
    store.completedChapters.length,
  ]);
}

// ==================== UI 状态 Hooks ====================

/**
 * 获取UI状态
 */
export function useUIState() {
  return useGameStore((state) => ({
    isChapterSelectOpen: state.uiState.isChapterSelectOpen,
    isSkillTreeOpen: state.uiState.isSkillTreeOpen,
    isOpenWorldOpen: state.uiState.isOpenWorldOpen,
    isAIDialogOpen: state.uiState.isAIDialogOpen,
    selectedMedicine: state.uiState.selectedMedicine,
    selectedFormula: state.uiState.selectedFormula,
    selectedSkill: state.uiState.selectedSkill,
  }));
}

/**
 * 获取UI Actions
 */
export function useUIActions() {
  const store = useGameStore();

  return useMemo(() => ({
    setChapterSelectOpen: store.setChapterSelectOpen,
    setSkillTreeOpen: store.setSkillTreeOpen,
    setOpenWorldOpen: store.setOpenWorldOpen,
    setAIDialogOpen: store.setAIDialogOpen,
    setSelectedMedicine: store.setSelectedMedicine,
    setSelectedFormula: store.setSelectedFormula,
    setSelectedSkill: store.setSelectedSkill,
  }), []);
}

// ==================== 综合 Hooks ====================

/**
 * 获取章节选择界面的所有数据
 */
export function useChapterSelectData() {
  const chapters = useChapters();
  const resources = usePlayerResources();
  const ui = useUIState();
  const actions = useUIActions();

  return {
    chapters: chapters.chapters,
    completedCount: chapters.completedCount,
    totalCount: chapters.totalCount,
    skillPoints: resources.skillPoints,
    isOpen: ui.isChapterSelectOpen,
    setOpen: actions.setChapterSelectOpen,
  };
}

/**
 * 获取技能树界面的所有数据
 */
export function useSkillTreeData() {
  const skills = useSkills();
  const resources = usePlayerResources();
  const ui = useUIState();
  const store = useGameStore();

  return {
    skills: skills.skills,
    skillPoints: resources.skillPoints,
    unlockedCount: skills.unlockedCount,
    totalCount: skills.totalCount,
    isOpen: ui.isSkillTreeOpen,
    setOpen: store.setSkillTreeOpen,
    unlockSkill: store.unlockSkill,
    upgradeSkill: store.upgradeSkill,
  };
}

/**
 * 获取开放世界界面的所有数据
 */
export function useOpenWorldData() {
  const openWorld = useOpenWorld();
  const resources = usePlayerResources();
  const store = useGameStore();
  const ui = useUIState();

  return {
    ...openWorld,
    diamonds: resources.diamonds,
    isOpen: ui.isOpenWorldOpen,
    setOpen: store.setOpenWorldOpen,
    checkDailyReset: store.checkDailyReset,
    completeEvent: store.completeEvent,
  };
}

/**
 * 获取AI对话界面的所有数据
 */
export function useAIDialogData() {
  const store = useGameStore();
  const ui = useUIState();
  const currentChapter = useCurrentChapter();

  return {
    isOpen: ui.isAIDialogOpen,
    setOpen: store.setAIDialogOpen,
    currentRun: store.currentRun,
    currentChapter,
    addConversationTurn: store.addConversationTurn,
    useHint: store.useHint,
    clearConversation: store.clearConversation,
    setCurrentQuestion: store.setCurrentQuestion,
  };
}

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  Medicine,
  WuxingType,
  Formula,
  ClinicalCase,
} from '../types/index';
import type {
  GameStore,
  GameSession,
  Chapter,
  ChapterProgress,
  ChapterRun,
  Skill,
  Question,
  ConversationTurn,
  GeneratedEvent,
  RunRecord,
  OpenWorldState,
  DEFAULT_SKILLS,
  DEFAULT_CHAPTERS,
  createInitialChapterProgress,
  createInitialChapterRun,
  createInitialOpenWorldState,
  createInitialGameSession,
} from './types';

// 药灵数据（从v2.0数据文件导入）
import medicineData from '../../design-output/药灵数据配置.json';

// ==================== 辅助函数 ====================

// 生成唯一ID
function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// 获取今日日期字符串
function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

// 检查是否是新的一天
function isNewDay(lastDate: string): boolean {
  return lastDate !== getTodayString();
}

// 计算章节解锁状态
function checkChapterUnlock(
  chapter: Chapter,
  completedChapters: string[],
  collectedMedicines: string[]
): { unlocked: boolean; reason?: string } {
  const { unlockCondition } = chapter;

  // 检查先修章节
  if (unlockCondition.completedChapters) {
    const incomplete = unlockCondition.completedChapters.filter(
      (id) => !completedChapters.includes(id)
    );
    if (incomplete.length > 0) {
      return {
        unlocked: false,
        reason: `需要先完成章节: ${incomplete.join(', ')}`,
      };
    }
  }

  // 检查最少收集药物数
  if (unlockCondition.minMedicines) {
    if (collectedMedicines.length < unlockCondition.minMedicines) {
      return {
        unlocked: false,
        reason: `需要收集至少 ${unlockCondition.minMedicines} 味药`,
      };
    }
  }

  return { unlocked: true };
}

// ==================== Store 创建 ====================

export const useGameStore = create<GameStore>()(
  immer(
    persist(
      (set, get) => ({
        // ==================== 初始状态 ====================
        ...createInitialGameSession(),

        // ==================== 章节系统 Actions ====================

        startChapter: (chapterId: string) => {
          const state = get();
          const chapter = DEFAULT_CHAPTERS.find((c) => c.id === chapterId);
          if (!chapter) return;

          // 检查解锁条件
          const unlockStatus = checkChapterUnlock(
            chapter,
            state.completedChapters,
            state.collectedMedicines
          );
          if (!unlockStatus.unlocked) {
            console.warn(`章节 ${chapterId} 未解锁: ${unlockStatus.reason}`);
            return;
          }

          // 初始化章节进度（如果不存在）
          if (!state.chapterProgress[chapterId]) {
            set((draft) => {
              draft.chapterProgress[chapterId] = createInitialChapterProgress(chapterId);
            });
          }

          // 开始新的章节运行
          set((draft) => {
            draft.currentChapter = chapterId;
            draft.currentRun = createInitialChapterRun(chapterId);
          });
        },

        completeChapter: (chapterId: string, score: number) => {
          set((draft) => {
            const progress = draft.chapterProgress[chapterId];
            if (progress) {
              progress.bestScore = Math.max(progress.bestScore, score);
              progress.bossDefeated = true;
              progress.completedAt = Date.now();
            }

            if (!draft.completedChapters.includes(chapterId)) {
              draft.completedChapters.push(chapterId);
            }

            // 奖励技能点
            draft.skillPoints += 1;

            // 清理当前运行
            draft.currentRun = null;
            draft.currentChapter = null;
          });
        },

        updateChapterProgress: (chapterId: string, progress: Partial<ChapterProgress>) => {
          set((draft) => {
            if (draft.chapterProgress[chapterId]) {
              Object.assign(draft.chapterProgress[chapterId], progress);
            }
          });
        },

        abandonChapter: (chapterId: string) => {
          set((draft) => {
            if (draft.currentChapter === chapterId) {
              draft.currentRun = null;
              draft.currentChapter = null;
            }
          });
        },

        resetChapter: (chapterId: string) => {
          set((draft) => {
            draft.chapterProgress[chapterId] = createInitialChapterProgress(chapterId);
            // 从已完成列表中移除
            draft.completedChapters = draft.completedChapters.filter((id) => id !== chapterId);
          });
        },

        // ==================== 章节运行 Actions ====================

        collectMedicineInRun: (medicineId: string) => {
          set((draft) => {
            if (draft.currentRun) {
              if (!draft.currentRun.collectedInRun.includes(medicineId)) {
                draft.currentRun.collectedInRun.push(medicineId);
              }
            }

            // 同时更新章节进度
            const chapterId = draft.currentChapter;
            if (chapterId && draft.chapterProgress[chapterId]) {
              if (!draft.chapterProgress[chapterId].collectedMedicines.includes(medicineId)) {
                draft.chapterProgress[chapterId].collectedMedicines.push(medicineId);
              }
            }
          });
        },

        setCurrentQuestion: (question: Question | null) => {
          set((draft) => {
            if (draft.currentRun) {
              draft.currentRun.currentQuestion = question;
            }
          });
        },

        addConversationTurn: (turn: ConversationTurn) => {
          set((draft) => {
            if (draft.currentRun) {
              draft.currentRun.conversationHistory.push(turn);
            }
          });
        },

        useHint: () => {
          set((draft) => {
            if (draft.currentRun) {
              draft.currentRun.hintsUsed += 1;
            }
          });
        },

        clearConversation: () => {
          set((draft) => {
            if (draft.currentRun) {
              draft.currentRun.conversationHistory = [];
            }
          });
        },

        // ==================== 技能系统 Actions ====================

        unlockSkill: (skillId: string) => {
          set((draft) => {
            const skill = DEFAULT_SKILLS.find((s) => s.id === skillId);
            if (!skill) return;

            // 检查是否已解锁
            if (draft.unlockedSkills.includes(skillId)) return;

            // 检查解锁条件
            const { unlockCondition } = skill;
            if (unlockCondition.skillPoints && draft.skillPoints < unlockCondition.skillPoints) {
              return;
            }
            if (unlockCondition.chapter) {
              const chapterId = `chapter_${String(unlockCondition.chapter).padStart(2, '0')}`;
              if (!draft.completedChapters.includes(chapterId)) {
                return;
              }
            }
            if (unlockCondition.medicines) {
              const hasAll = unlockCondition.medicines.every((m) =>
                draft.collectedMedicines.includes(m)
              );
              if (!hasAll) return;
            }

            draft.unlockedSkills.push(skillId);
            draft.skillLevels[skillId] = 1;
          });
        },

        upgradeSkill: (skillId: string) => {
          set((draft) => {
            const skill = DEFAULT_SKILLS.find((s) => s.id === skillId);
            if (!skill) return;

            const currentLevel = draft.skillLevels[skillId] || 0;
            if (currentLevel >= skill.maxLevel) return;
            if (draft.skillPoints <= 0) return;

            draft.skillLevels[skillId] = currentLevel + 1;
            draft.skillPoints -= 1;
          });
        },

        addSkillPoints: (amount: number) => {
          set((draft) => {
            draft.skillPoints += amount;
          });
        },

        // ==================== 资源 Actions ====================

        addDiamonds: (amount: number) => {
          set((draft) => {
            draft.diamonds = Math.max(0, draft.diamonds + amount);
          });
        },

        addReputation: (amount: number) => {
          set((draft) => {
            draft.reputation = Math.max(0, draft.reputation + amount);
          });
        },

        addMedicineAffinity: (medicineId: string, amount: number) => {
          set((draft) => {
            const current = draft.medicineAffinity[medicineId] || 0;
            draft.medicineAffinity[medicineId] = Math.min(100, current + amount);
          });
        },

        addFormulaProficiency: (formulaId: string, amount: number) => {
          set((draft) => {
            const current = draft.formulaProficiency[formulaId] || 0;
            draft.formulaProficiency[formulaId] = Math.min(5, current + amount);
          });
        },

        // ==================== 收集 Actions ====================

        collectMedicine: (medicineId: string) => {
          set((draft) => {
            if (!draft.collectedMedicines.includes(medicineId)) {
              draft.collectedMedicines.push(medicineId);
            }
          });
        },

        collectFormula: (formulaId: string) => {
          set((draft) => {
            if (!draft.collectedFormulas.includes(formulaId)) {
              draft.collectedFormulas.push(formulaId);
            }

            // 同时更新当前章节的解锁方剂
            const chapterId = draft.currentChapter;
            if (chapterId && draft.chapterProgress[chapterId]) {
              if (!draft.chapterProgress[chapterId].unlockedFormulas.includes(formulaId)) {
                draft.chapterProgress[chapterId].unlockedFormulas.push(formulaId);
              }
            }
          });
        },

        // ==================== 开放世界 Actions ====================

        unlockRegion: (regionId: string) => {
          set((draft) => {
            if (!draft.openWorld.unlockedRegions.includes(regionId)) {
              draft.openWorld.unlockedRegions.push(regionId);
            }
          });
        },

        generateDailyEvents: () => {
          set((draft) => {
            // 清空过期事件，生成新事件
            const now = Date.now();
            draft.openWorld.dailyEvents = draft.openWorld.dailyEvents.filter(
              (e) => e.expiresAt > now
            );

            // 如果今日事件不足3个，生成新事件
            if (draft.openWorld.dailyEvents.length < 3) {
              const eventTypes = ['case', 'book', 'spirit', 'bounty'] as const;
              const needed = 3 - draft.openWorld.dailyEvents.length;

              for (let i = 0; i < needed; i++) {
                const event: GeneratedEvent = {
                  id: generateId(),
                  eventType: eventTypes[i % eventTypes.length],
                  title: `今日事件 ${i + 1}`,
                  description: 'AI生成的事件描述（待实现）',
                  difficulty: Math.min(5, Math.floor(draft.completedChapters.length / 4) + 1) as 1 | 2 | 3 | 4 | 5,
                  requirements: {
                    medicines: draft.collectedMedicines.slice(0, 3),
                  },
                  rewards: {
                    diamonds: 50 + i * 25,
                    skillPoints: i === 2 ? 1 : 0,
                  },
                  expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24小时后过期
                };
                draft.openWorld.dailyEvents.push(event);
              }
            }
          });
        },

        completeEvent: (eventId: string) => {
          set((draft) => {
            if (!draft.openWorld.completedEvents.includes(eventId)) {
              draft.openWorld.completedEvents.push(eventId);
            }
          });
        },

        addRunRecord: (record: RunRecord) => {
          set((draft) => {
            draft.openWorld.runHistory.push(record);
            // 只保留最近50条记录
            if (draft.openWorld.runHistory.length > 50) {
              draft.openWorld.runHistory = draft.openWorld.runHistory.slice(-50);
            }
          });
        },

        checkDailyReset: () => {
          const state = get();
          const lastDate = state.openWorld.lastLoginDate;

          if (!isNewDay(lastDate)) {
            return { isNewDay: false };
          }

          // 计算连续登录
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayString = yesterday.toISOString().split('T')[0];

          const newStreak = lastDate === yesterdayString
            ? state.openWorld.loginStreak + 1
            : 1;

          const rewards = {
            diamonds: 50 + (newStreak >= 3 ? 20 : 0),
            skillPoints: newStreak >= 7 ? 1 : 0,
          };

          set((draft) => {
            draft.openWorld.lastLoginDate = getTodayString();
            draft.openWorld.loginStreak = newStreak;
            draft.diamonds += rewards.diamonds;
            if (rewards.skillPoints > 0) {
              draft.skillPoints += rewards.skillPoints;
            }
            // 生成新事件
            draft.openWorld.dailyEvents = [];
          });

          // 触发事件生成
          get().generateDailyEvents();

          return { isNewDay: true, rewards };
        },

        // ==================== UI Actions ====================

        setChapterSelectOpen: (open: boolean) => {
          set((draft) => {
            draft.uiState.isChapterSelectOpen = open;
          });
        },

        setSkillTreeOpen: (open: boolean) => {
          set((draft) => {
            draft.uiState.isSkillTreeOpen = open;
          });
        },

        setOpenWorldOpen: (open: boolean) => {
          set((draft) => {
            draft.uiState.isOpenWorldOpen = open;
          });
        },

        setAIDialogOpen: (open: boolean) => {
          set((draft) => {
            draft.uiState.isAIDialogOpen = open;
          });
        },

        setSelectedMedicine: (medicineId: string | null) => {
          set((draft) => {
            draft.uiState.selectedMedicine = medicineId;
          });
        },

        setSelectedFormula: (formulaId: string | null) => {
          set((draft) => {
            draft.uiState.selectedFormula = formulaId;
          });
        },

        setSelectedSkill: (skillId: string | null) => {
          set((draft) => {
            draft.uiState.selectedSkill = skillId;
          });
        },

        // ==================== Getters ====================

        getChapterById: (chapterId: string) => {
          return DEFAULT_CHAPTERS.find((c) => c.id === chapterId);
        },

        getSkillById: (skillId: string) => {
          return DEFAULT_SKILLS.find((s) => s.id === skillId);
        },

        getCurrentChapterProgress: () => {
          const state = get();
          if (!state.currentChapter) return null;
          return state.chapterProgress[state.currentChapter] || null;
        },

        getSkillEffect: (skillId: string) => {
          const skill = DEFAULT_SKILLS.find((s) => s.id === skillId);
          if (!skill) return [];
          const level = get().skillLevels[skillId] || 0;
          return skill.effects.slice(0, level);
        },

        getChapterUnlockStatus: (chapterId: string) => {
          const state = get();
          const chapter = DEFAULT_CHAPTERS.find((c) => c.id === chapterId);
          if (!chapter) return { unlocked: false, reason: '章节不存在' };
          return checkChapterUnlock(
            chapter,
            state.completedChapters,
            state.collectedMedicines
          );
        },

        getDailyEvents: () => {
          const state = get();
          const now = Date.now();
          return state.openWorld.dailyEvents.filter((e) => e.expiresAt > now);
        },

        getCompletedChaptersCount: () => {
          return get().completedChapters.length;
        },

        getTotalScore: () => {
          return Object.values(get().chapterProgress).reduce(
            (sum, p) => sum + p.bestScore,
            0
          );
        },
      }),
      {
        name: 'fangling-valley-v3-storage',
        version: 3.0, // 版本号用于数据迁移
        storage: createJSONStorage(() => localStorage),
        // 持久化白名单
        partialize: (state) => ({
          diamonds: state.diamonds,
          reputation: state.reputation,
          collectedMedicines: state.collectedMedicines,
          collectedFormulas: state.collectedFormulas,
          medicineAffinity: state.medicineAffinity,
          formulaProficiency: state.formulaProficiency,
          currentChapter: state.currentChapter,
          completedChapters: state.completedChapters,
          chapterProgress: state.chapterProgress,
          unlockedSkills: state.unlockedSkills,
          skillLevels: state.skillLevels,
          skillPoints: state.skillPoints,
          currentRun: state.currentRun,
          openWorld: state.openWorld,
          // 注意：uiState 不持久化
        }),
        // 数据迁移
        migrate: (persistedState: any, version: number) => {
          // 从v2.0迁移到v3.0
          if (version < 3.0) {
            const v2State = persistedState as any;

            // 转换v2.0数据到v3.0格式
            return {
              // 基础资源（v2.0的currency转为diamonds）
              diamonds: v2State.player?.currency || v2State.diamonds || 100,
              reputation: v2State.player?.reputation || 0,

              // 收集进度
              collectedMedicines: v2State.player?.collectedMedicines || [],
              collectedFormulas: v2State.player?.unlockedFormulas || [],
              medicineAffinity: v2State.player?.medicineAffinity || {},
              formulaProficiency: v2State.player?.formulaProficiency || {},

              // v3.0新增字段（初始值）
              currentChapter: null,
              completedChapters: [],
              chapterProgress: {},
              unlockedSkills: [],
              skillLevels: {},
              skillPoints: 0,
              currentRun: null,
              openWorld: createInitialOpenWorldState(),

              // UI状态
              uiState: createInitialGameSession().uiState,
            } as GameSession;
          }
          return persistedState as GameSession;
        },
        onRehydrateStorage: () => {
          return (state) => {
            if (state) {
              // 存储恢复后执行的操作
              console.log('[GameStore] 数据已恢复，当前版本: v3.0');
            }
          };
        },
      }
    )
  )
);

// ==================== 导出 ====================

export { DEFAULT_SKILLS, DEFAULT_CHAPTERS };
export type {
  Chapter,
  ChapterProgress,
  ChapterRun,
  Skill,
  Question,
  ConversationTurn,
  GeneratedEvent,
  RunRecord,
  OpenWorldState,
};

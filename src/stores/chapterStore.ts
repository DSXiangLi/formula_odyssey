import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { ChapterProgress } from '../types/chapter';
import { StageProgress } from '../types/stage';

// 扩展的章节进度
export interface ExtendedChapterProgress extends ChapterProgress {
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  stageProgress: StageProgress;
  startTime?: number;
  lastCheckpoint?: number;
  completeTime?: number;
}

interface ChapterState {
  progress: Record<string, ExtendedChapterProgress>;
  currentChapterId: string | null;
  currentStageIndex: number;

  // Actions
  setCurrentChapter: (chapterId: string) => void;
  setCurrentStage: (stageIndex: number) => void;
  updateChapterProgress: (chapterId: string, updates: Partial<ExtendedChapterProgress>) => void;
  completeStage: (chapterId: string, stageId: string) => void;
  collectMedicineInChapter: (chapterId: string, medicineId: string) => void;
  getChapterProgress: (chapterId: string) => ExtendedChapterProgress | undefined;

  // StageManager 专用
  initChapterProgress: (chapterId: string) => void;
  updateStageProgress: (chapterId: string, stageIndex: number, result: unknown) => void;
  saveCheckpoint: (chapterId: string, stageIndex: number, progress: unknown) => void;
  getProgress: (chapterId: string) => ExtendedChapterProgress | null;
  completeChapter: (chapterId: string) => void;
}

export const useChapterStore = create<ChapterState>()(
  immer(
    persist(
      (set, get) => ({
        progress: {},
        currentChapterId: null,
        currentStageIndex: 0,

        setCurrentChapter: (chapterId) =>
          set((state) => {
            state.currentChapterId = chapterId;
            state.currentStageIndex = 0;

            // Initialize progress if not exists
            if (!state.progress[chapterId]) {
              state.progress[chapterId] = {
                chapterId,
                currentStage: 0,
                completedStages: [],
                collectedMedicines: [],
                battleScore: 0,
                clinicalScore: 0,
                lastAccessed: Date.now(),
                status: 'in_progress',
                stageProgress: {},
                startTime: Date.now(),
              };
            }
          }),

        setCurrentStage: (stageIndex) =>
          set((state) => {
            state.currentStageIndex = stageIndex;
            if (state.currentChapterId) {
              const progress = state.progress[state.currentChapterId];
              if (progress) {
                progress.currentStage = stageIndex;
                progress.lastAccessed = Date.now();
              }
            }
          }),

        updateChapterProgress: (chapterId, updates) =>
          set((state) => {
            if (!state.progress[chapterId]) {
              state.progress[chapterId] = {
                chapterId,
                currentStage: 0,
                completedStages: [],
                collectedMedicines: [],
                battleScore: 0,
                clinicalScore: 0,
                status: 'available',
                stageProgress: {},
              };
            }
            Object.assign(state.progress[chapterId], updates);
          }),

        completeStage: (chapterId, stageId) =>
          set((state) => {
            const progress = state.progress[chapterId];
            if (progress && !progress.completedStages.includes(stageId)) {
              progress.completedStages.push(stageId);
            }
          }),

        collectMedicineInChapter: (chapterId, medicineId) =>
          set((state) => {
            const progress = state.progress[chapterId];
            if (progress && !progress.collectedMedicines.includes(medicineId)) {
              progress.collectedMedicines.push(medicineId);
            }
          }),

        getChapterProgress: (chapterId) => {
          return get().progress[chapterId];
        },

        // StageManager 专用方法
        initChapterProgress: (chapterId) =>
          set((state) => {
            if (!state.progress[chapterId]) {
              state.progress[chapterId] = {
                chapterId,
                currentStage: 0,
                completedStages: [],
                collectedMedicines: [],
                battleScore: 0,
                clinicalScore: 0,
                status: 'in_progress',
                stageProgress: {},
                startTime: Date.now(),
              };
            } else {
              state.progress[chapterId].status = 'in_progress';
              state.progress[chapterId].lastAccessed = Date.now();
            }
          }),

        updateStageProgress: (chapterId, stageIndex, result) =>
          set((state) => {
            const progress = state.progress[chapterId];
            if (!progress) return;

            progress.currentStage = stageIndex + 1;
            progress.lastAccessed = Date.now();

            // 根据阶段索引更新对应的阶段进度
            switch (stageIndex) {
              case 0:
                progress.stageProgress.mentorIntro = { completed: true };
                break;
              case 1:
                if (result && typeof result === 'object') {
                  const gatheringResult = result as { medicines?: string[]; quality?: Record<string, string>; exploredTiles?: number };
                  progress.stageProgress.gathering = {
                    medicinesCollected: gatheringResult.medicines || [],
                    medicineQuality: gatheringResult.quality || {},
                    exploredTiles: gatheringResult.exploredTiles ? [{ x: 0, y: 0 }] : [],
                    completed: true,
                  };
                }
                break;
              case 2:
                if (result && typeof result === 'object') {
                  const battleResult = result as { score?: number; maxCombo?: number };
                  progress.stageProgress.battle = {
                    score: battleResult.score || 0,
                    maxCombo: battleResult.maxCombo || 0,
                    completed: true,
                  };
                }
                break;
              case 3:
                progress.stageProgress.formula = { completedFormulas: [], completed: true };
                break;
              case 4:
                if (result && typeof result === 'object') {
                  const clinicalResult = result as { score?: number; attempts?: number };
                  progress.stageProgress.clinical = {
                    score: clinicalResult.score || 0,
                    attempts: clinicalResult.attempts || 1,
                    completed: true,
                  };
                }
                break;
              case 5:
                // 开放世界阶段完成
                break;
            }
          }),

        saveCheckpoint: (chapterId, stageIndex, stageProgress) =>
          set((state) => {
            const progress = state.progress[chapterId];
            if (progress) {
              progress.currentStage = stageIndex;
              progress.lastCheckpoint = Date.now();
              if (stageProgress && typeof stageProgress === 'object') {
                progress.stageProgress = {
                  ...progress.stageProgress,
                  ...(stageProgress as StageProgress),
                };
              }
            }
          }),

        getProgress: (chapterId) => {
          const progress = get().progress[chapterId];
          return progress || null;
        },

        completeChapter: (chapterId) =>
          set((state) => {
            const progress = state.progress[chapterId];
            if (progress) {
              progress.status = 'completed';
              progress.completeTime = Date.now();
              progress.currentStage = 5; // 最后一个阶段索引（开放世界/融会贯通）
            }
          }),
      }),
      {
        name: 'yaoling-chapter-storage-v3',
      }
    )
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { ChapterProgress } from '../types/chapter';

interface ChapterState {
  progress: Record<string, ChapterProgress>;
  currentChapterId: string | null;
  currentStageIndex: number;

  // Actions
  setCurrentChapter: (chapterId: string) => void;
  setCurrentStage: (stageIndex: number) => void;
  updateChapterProgress: (chapterId: string, updates: Partial<ChapterProgress>) => void;
  completeStage: (chapterId: string, stageId: string) => void;
  collectMedicineInChapter: (chapterId: string, medicineId: string) => void;
  getChapterProgress: (chapterId: string) => ChapterProgress | undefined;
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
      }),
      {
        name: 'yaoling-chapter-storage',
      }
    )
  )
);

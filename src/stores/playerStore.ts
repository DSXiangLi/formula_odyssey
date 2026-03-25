import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Player, WuxingType } from '../types';

interface PlayerState extends Player {
  // Actions
  setName: (name: string) => void;
  addExperience: (amount: number) => void;
  addReputation: (amount: number) => void;
  addCurrency: (amount: number) => void;
  unlockChapter: (chapterId: string) => void;
  completeChapter: (chapterId: string) => void;
  collectMedicine: (medicineId: string) => void;
  increaseWuxingAffinity: (wuxing: WuxingType, amount: number) => void;
  updateLastPlayed: () => void;
}

const initialPlayer: Player = {
  id: `player_${Date.now()}`,
  name: '学徒',
  level: 1,
  experience: 0,
  currency: 100,
  reputation: 0,
  wuxingAffinity: {
    [WuxingType.Wood]: 0,
    [WuxingType.Fire]: 0,
    [WuxingType.Earth]: 0,
    [WuxingType.Metal]: 0,
    [WuxingType.Water]: 0,
  },
  unlockedChapters: ['chapter-1'],
  completedChapters: [],
  collectedMedicines: [],
  masteredFormulas: [],
  skills: [],
  createdAt: Date.now(),
  lastPlayed: Date.now(),
};

export const usePlayerStore = create<PlayerState>()(
  immer(
    persist(
      (set) => ({
        ...initialPlayer,

        setName: (name) =>
          set((state) => {
            state.name = name;
          }),

        addExperience: (amount) =>
          set((state) => {
            state.experience += amount;
            // Level up logic: every 1000 exp = 1 level
            const newLevel = Math.floor(state.experience / 1000) + 1;
            if (newLevel > state.level) {
              state.level = newLevel;
            }
          }),

        addReputation: (amount) =>
          set((state) => {
            state.reputation = Math.max(0, state.reputation + amount);
          }),

        addCurrency: (amount) =>
          set((state) => {
            state.currency = Math.max(0, state.currency + amount);
          }),

        unlockChapter: (chapterId) =>
          set((state) => {
            if (!state.unlockedChapters.includes(chapterId)) {
              state.unlockedChapters.push(chapterId);
            }
          }),

        completeChapter: (chapterId) =>
          set((state) => {
            if (!state.completedChapters.includes(chapterId)) {
              state.completedChapters.push(chapterId);
            }
          }),

        collectMedicine: (medicineId) =>
          set((state) => {
            if (!state.collectedMedicines.includes(medicineId)) {
              state.collectedMedicines.push(medicineId);
            }
          }),

        increaseWuxingAffinity: (wuxing, amount) =>
          set((state) => {
            state.wuxingAffinity[wuxing] += amount;
          }),

        updateLastPlayed: () =>
          set((state) => {
            state.lastPlayed = Date.now();
          }),
      }),
      {
        name: 'yaoling-player-storage',
      }
    )
  )
);

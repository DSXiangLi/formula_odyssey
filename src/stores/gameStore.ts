import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Medicine, RegionType, Seed, Player, GameState } from '@types/index';
import { getAffinityLevel } from '@utils/index';

// 药灵数据
import medicineData from '../../design-output/药灵数据配置.json';

interface GameStore extends GameState {
  // 玩家数据
  player: Player;
  // 药灵数据
  medicines: Medicine[];
  // 种子数据
  seeds: Seed[];
  // 当前区域
  currentRegion: RegionType;
  // UI状态
  isExploreOpen: boolean;
  isCollectionOpen: boolean;
  isMedicineDetailOpen: boolean;
  selectedMedicine: string | null;

  // Actions
  collectSeed: (seedId: string) => void;
  addMedicineAffinity: (medicineId: string, amount: number) => void;
  addCurrency: (amount: number) => void;
  useExploreChance: () => boolean;
  resetExploreCount: () => void;
  setCurrentRegion: (region: RegionType) => void;
  setExploreOpen: (open: boolean) => void;
  setCollectionOpen: (open: boolean) => void;
  setSelectedMedicine: (medicineId: string | null) => void;
  getCollectedCount: () => number;
  getMedicineById: (id: string) => Medicine | undefined;
  getSeedsByRegion: (region: RegionType) => Seed[];
  getCollectedMedicines: () => Medicine[];
  login: () => { isNewDay: boolean; rewards: { seeds: number; currency: number } };
}

// 生成种子数据
function generateSeeds(): Seed[] {
  const seeds: Seed[] = [];
  const medicines = medicineData.medicines;

  medicines.forEach((medicine, index) => {
    // 每个药灵生成1-2颗种子
    const seedCount = Math.random() > 0.7 ? 2 : 1;
    for (let i = 0; i < seedCount; i++) {
      seeds.push({
        id: `${medicine.id}_seed_${i}`,
        medicineId: medicine.id,
        region: medicine.region as RegionType,
        position: {
          x: Math.random() * 80 + 10, // 10% - 90%
          y: Math.random() * 60 + 20, // 20% - 80%
        },
        visible: true,
        collected: false,
        hint: medicine.stories[0],
      });
    }
  });

  return seeds;
}

// 初始化玩家数据
function createInitialPlayer(): Player {
  const today = new Date().toISOString().split('T')[0];
  return {
    id: generatePlayerId(),
    name: '方灵师',
    collectedSeeds: [],
    collectedMedicines: [],
    medicineAffinity: {},
    currency: 0,
    exploreCount: 3,
    lastLoginDate: today,
    loginStreak: 1,
  };
}

function generatePlayerId(): string {
  return 'player_' + Math.random().toString(36).substring(2, 9);
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // 初始状态
      player: createInitialPlayer(),
      medicines: medicineData.medicines as Medicine[],
      seeds: generateSeeds(),
      currentRegion: 'mountain',
      isExploreOpen: false,
      isCollectionOpen: false,
      selectedMedicine: null,

      // 收集种子
      collectSeed: (seedId: string) => {
        const { seeds, player, medicines } = get();
        const seed = seeds.find(s => s.id === seedId);
        if (!seed || seed.collected) return;

        // 更新种子状态
        const updatedSeeds = seeds.map(s =>
          s.id === seedId ? { ...s, collected: true } : s
        );

        // 更新玩家数据
        const medicine = medicines.find(m => m.id === seed.medicineId);
        const isNewMedicine = !player.collectedMedicines.includes(seed.medicineId);

        const updatedPlayer = {
          ...player,
          collectedSeeds: [...player.collectedSeeds, seedId],
          collectedMedicines: isNewMedicine
            ? [...player.collectedMedicines, seed.medicineId]
            : player.collectedMedicines,
          medicineAffinity: {
            ...player.medicineAffinity,
            [seed.medicineId]: (player.medicineAffinity[seed.medicineId] || 0) + 10,
          },
          currency: player.currency + 10,
        };

        set({ seeds: updatedSeeds, player: updatedPlayer });
      },

      // 增加亲密度
      addMedicineAffinity: (medicineId: string, amount: number) => {
        const { player } = get();
        set({
          player: {
            ...player,
            medicineAffinity: {
              ...player.medicineAffinity,
              [medicineId]: Math.min(100, (player.medicineAffinity[medicineId] || 0) + amount),
            },
          },
        });
      },

      // 增加货币
      addCurrency: (amount: number) => {
        const { player } = get();
        set({
          player: {
            ...player,
            currency: Math.max(0, player.currency + amount),
          },
        });
      },

      // 使用探索次数
      useExploreChance: () => {
        const { player } = get();
        if (player.exploreCount <= 0) return false;

        set({
          player: {
            ...player,
            exploreCount: player.exploreCount - 1,
          },
        });
        return true;
      },

      // 重置探索次数
      resetExploreCount: () => {
        const { player } = get();
        set({
          player: {
            ...player,
            exploreCount: 3,
          },
        });
      },

      // 设置当前区域
      setCurrentRegion: (region: RegionType) => {
        set({ currentRegion: region });
      },

      // 设置探索界面开关
      setExploreOpen: (open: boolean) => {
        set({ isExploreOpen: open });
      },

      // 设置图鉴界面开关
      setCollectionOpen: (open: boolean) => {
        set({ isCollectionOpen: open });
      },

      // 设置选中药灵
      setSelectedMedicine: (medicineId: string | null) => {
        set({ selectedMedicine: medicineId });
      },

      // 获取收集数量
      getCollectedCount: () => {
        const { player } = get();
        return player.collectedMedicines.length;
      },

      // 根据ID获取药灵
      getMedicineById: (id: string) => {
        const { medicines } = get();
        return medicines.find(m => m.id === id);
      },

      // 获取区域种子
      getSeedsByRegion: (region: RegionType) => {
        const { seeds } = get();
        return seeds.filter(s => s.region === region);
      },

      // 获取已收集药灵
      getCollectedMedicines: () => {
        const { medicines, player } = get();
        return medicines.filter(m => player.collectedMedicines.includes(m.id));
      },

      // 登录处理
      login: () => {
        const { player, seeds } = get();
        const today = new Date().toISOString().split('T')[0];

        if (player.lastLoginDate === today) {
          return { isNewDay: false, rewards: { seeds: 0, currency: 0 } };
        }

        // 检查是否连续登录
        const lastDate = new Date(player.lastLoginDate);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        const newStreak = diffDays === 1 ? player.loginStreak + 1 : 1;

        // 每日奖励
        const seedRewards = 3;
        const currencyRewards = 30 + (newStreak >= 3 ? 20 : 0);

        // 随机发放种子
        const uncollectedSeeds = seeds.filter(s => !s.collected);
        const rewardSeeds = uncollectedSeeds.slice(0, seedRewards);
        const newCollectedSeeds = [...player.collectedSeeds, ...rewardSeeds.map(s => s.id)];
        const newCollectedMedicines = [...player.collectedMedicines];

        rewardSeeds.forEach(seed => {
          if (!newCollectedMedicines.includes(seed.medicineId)) {
            newCollectedMedicines.push(seed.medicineId);
          }
        });

        const updatedPlayer = {
          ...player,
          collectedSeeds: newCollectedSeeds,
          collectedMedicines: newCollectedMedicines,
          currency: player.currency + currencyRewards,
          exploreCount: 3,
          lastLoginDate: today,
          loginStreak: newStreak,
        };

        set({ player: updatedPlayer });

        return {
          isNewDay: true,
          rewards: { seeds: seedRewards, currency: currencyRewards },
        };
      },
    }),
    {
      name: 'fangling-valley-storage',
      partialize: (state) => ({ player: state.player, seeds: state.seeds }),
    }
  )
);

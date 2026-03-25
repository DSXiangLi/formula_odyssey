import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Medicine,
  Seed,
  RegionType,
  Player,
  GameState,
  Formula,
  FormulaPursuit,
  ClinicalCase,
  DailyStats,
  Region,
} from '../types/index';
import { WuxingType, FourQi, FiveFlavors, Movement } from '../types/enums';
import { FormulaDifficulty, FormulaRole } from '../types/formula';

// 药灵数据
import medicineData from '../../design-output/药灵数据配置v2.0.json';

// 五行区域配置
export const WUXING_REGIONS: Record<WuxingType, Region> = {
  wood: {
    id: 'wood',
    name: '青木林',
    themeColor: '#2E7D32',
    themeColorLight: '#81C784',
    medicines: [],
    particleType: 'petal',
    zangfu: '肝',
    season: '春',
    direction: '东',
    specialMechanism: '春季生发 - 探索时有几率额外获得线索',
  },
  fire: {
    id: 'fire',
    name: '赤焰峰',
    themeColor: '#C62828',
    themeColorLight: '#EF5350',
    medicines: [],
    particleType: 'ember',
    zangfu: '心',
    season: '夏',
    direction: '南',
    specialMechanism: '心主神明 - 首次猜测免费',
  },
  earth: {
    id: 'earth',
    name: '黄土丘',
    themeColor: '#F9A825',
    themeColorLight: '#FFD54F',
    medicines: [],
    particleType: 'grain',
    zangfu: '脾',
    season: '长夏',
    direction: '中',
    specialMechanism: '脾主运化 - 线索价格降低20%',
  },
  metal: {
    id: 'metal',
    name: '白金原',
    themeColor: '#78909C',
    themeColorLight: '#B0BEC5',
    medicines: [],
    particleType: 'frost',
    zangfu: '肺',
    season: '秋',
    direction: '西',
    specialMechanism: '肺主肃降 - 可以快速跳过当前种子',
  },
  water: {
    id: 'water',
    name: '黑水潭',
    themeColor: '#1565C0',
    themeColorLight: '#42A5F5',
    medicines: [],
    particleType: 'snow',
    zangfu: '肾',
    season: '冬',
    direction: '北',
    specialMechanism: '肾藏精 - 收集成功后奖励翻倍',
  },
};

// 旧区域到五行的映射（向后兼容）
const LEGACY_TO_WUXING: Record<string, WuxingType> = {
  mountain: WuxingType.Metal,
  forest: WuxingType.Wood,
  flower: WuxingType.Earth,
  stream: WuxingType.Water,
  cliff: WuxingType.Fire,
};

interface GameStore extends GameState {
  // 玩家数据
  player: Player;
  // 药灵数据
  medicines: Medicine[];
  // 种子数据
  seeds: Seed[];
  // 方剂数据
  formulas: Formula[];
  // 临床病案
  clinicalCases: ClinicalCase[];
  // 当前区域
  currentRegion: RegionType;
  // UI状态
  isExploreOpen: boolean;
  isCollectionOpen: boolean;
  isMedicineDetailOpen: boolean;
  isFormulaPursuitOpen: boolean;
  isClinicalCaseOpen: boolean;
  selectedMedicine: string | null;
  selectedSeed: string | null;
  currentCase: string | null;

  // 方剂相关状态（从player中解构导出，便于组件使用）
  unlockedFormulas: string[];
  formulaProficiency: Record<string, number>;
  activePursuits: FormulaPursuit[];
  collectedMedicines: string[];

  // 追缉令定时器
  pursuitRefreshTimer: number | null;

  // Actions - 亲密度
  addMedicineAffinity: (medicineId: string, amount: number) => void;

  // Actions - 货币
  addCurrency: (amount: number) => void;
  addReputation: (amount: number) => void;

  // Actions - 探索（向后兼容）
  useExploreChance: () => boolean;
  resetExploreCount: () => void;

  // Actions - 区域
  setCurrentRegion: (region: RegionType) => void;

  // Actions - 方剂追缉
  acceptPursuit: (pursuitId: string) => void;
  completePursuit: (pursuitId: string) => void;
  abandonPursuit: (pursuitId: string) => void;
  updatePursuitProgress: (pursuitId: string, medicineId: string) => void;
  generatePursuits: (force?: boolean) => void;
  startPursuitRefreshTimer: () => void;
  stopPursuitRefreshTimer: () => void;

  // Actions - 临床实习
  startClinicalCase: (caseId: string) => void;
  submitDiagnosis: (caseId: string, treatment: string, formula: string, junMedicine: string) =>
    { correct: boolean; score: number };
  completeClinicalCase: (caseId: string, score: number) => void;

  // Actions - UI
  setExploreOpen: (open: boolean) => void;
  setCollectionOpen: (open: boolean) => void;
  setFormulaPursuitOpen: (open: boolean) => void;
  setClinicalCaseOpen: (open: boolean) => void;
  setSelectedMedicine: (medicineId: string | null) => void;

  // Getters
  getCollectedCount: () => number;
  getMedicineById: (id: string) => Medicine | undefined;
  getMedicineByName: (name: string) => Medicine | undefined;
  getCollectedMedicines: () => Medicine[];
  getMedicinesByWuxing: (wuxing: WuxingType) => Medicine[];
  getActivePursuits: () => FormulaPursuit[];
  getUnlockedFormulas: () => Formula[];
  getFormulaById: (id: string) => Formula | undefined;
  getFormulaProficiency: (formulaId: string) => number;

  // 登录
  login: () => { isNewDay: boolean; rewards: { currency: number } };
}

// 将旧数据迁移到新格式
function migrateMedicineData(medicines: any[]): Medicine[] {
  return medicines.map(m => {
    const wuxing: WuxingType = m.wuxing || LEGACY_TO_WUXING[m.region] || WuxingType.Earth;

    let fourQi: FourQi = m.fourQi;
    if (!fourQi && m.nature) {
      const natureParts = m.nature.split('，');
      const fourQiMatch = natureParts[1]?.match(/[寒热温凉]/);
      if (fourQiMatch) {
        const qiMap: Record<string, FourQi> = {
          '寒': FourQi.Cold,
          '热': FourQi.Hot,
          '温': FourQi.Warm,
          '凉': FourQi.Cool,
        };
        fourQi = qiMap[fourQiMatch[0]];
      }
    }
    fourQi = fourQi || FourQi.Warm;

    let fiveFlavors: FiveFlavors[] = m.fiveFlavors;
    if ((!fiveFlavors || fiveFlavors.length === 0) && m.nature) {
      const natureParts = m.nature.split('，');
      const flavors = natureParts[0]?.split('、') || [];
      const flavorMap: Record<string, FiveFlavors> = {
        '辛': FiveFlavors.Spicy,
        '苦': FiveFlavors.Bitter,
        '甘': FiveFlavors.Sweet,
        '酸': FiveFlavors.Sour,
        '咸': FiveFlavors.Salty,
        '微苦': FiveFlavors.Bitter,
        '微甘': FiveFlavors.Sweet,
      };
      fiveFlavors = flavors
        .map((f: string) => flavorMap[f])
        .filter((f: FiveFlavors | undefined): f is FiveFlavors => f !== undefined);
    }
    fiveFlavors = fiveFlavors?.length > 0 ? fiveFlavors : [FiveFlavors.Sweet];

    let movement: Movement = m.movement;
    if (!movement) {
      const movementMap: Record<string, Movement> = {
        '解表药': Movement.Ascending,
        '清热药': Movement.Descending,
        '泻下药': Movement.Descending,
        '补益药': Movement.Floating,
        '理气药': Movement.Ascending,
        '活血化瘀药': Movement.Ascending,
      };
      movement = movementMap[m.category] || Movement.Floating;
    }

    let toxicity: string = m.toxicity;
    if (!toxicity && m.nature) {
      toxicity = '无毒';
      if (m.nature.includes('有毒')) toxicity = '有毒';
      else if (m.nature.includes('小毒')) toxicity = '小毒';
      else if (m.nature.includes('大毒')) toxicity = '大毒';
    }
    toxicity = toxicity || '无毒';

    return {
      id: m.id,
      name: m.name,
      pinyin: m.pinyin,
      latinName: m.latinName || '',
      category: m.category,
      wuxing,
      fourQi,
      fiveFlavors,
      movement,
      meridians: m.meridians || [],
      toxicity,
      functions: m.functions || [],
      indications: m.indications || [],
      contraindications: m.contraindications || [],
      imagePlant: m.imagePlant || '',
      imageHerb: m.imageHerb || '',
      collectionType: m.collectionType || 'digging',
      stories: m.stories || [],
      affinity: m.affinity || 0,
      isCollected: m.collected || false,
      collected: m.collected || false,
      region: m.region,
      nature: m.nature,
    };
  });
}

// 生成今日日期字符串
function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

// 初始化每日统计
function createInitialDailyStats(): DailyStats {
  return {
    date: getTodayString(),
    medicinesCollected: [],
    seedsCollected: 0,
    currencyEarned: 0,
    currencySpent: 0,
    casesCompleted: 0,
    correctGuesses: 0,
    pursuitsCompleted: 0,
  };
}

// 初始化玩家数据（v3.0）
function createInitialPlayer(): Player {
  const today = getTodayString();
  return {
    id: generatePlayerId(),
    name: '方灵师',
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
    completedCases: [],
    medicineAffinity: {},
    skills: [],
    exploreCount: 3,
    maxExploreCount: 10,
    lastExploreReset: 0,
    dailyStats: createInitialDailyStats(),
    createdAt: Date.now(),
    lastPlayed: Date.now(),
    lastLoginDate: today,
    loginStreak: 0,
    collectedSeeds: [],
    completedPursuits: [],
    activePursuits: [],
    formulaProficiency: {},
    unlockedFormulas: [],
  };
}

function generatePlayerId(): string {
  return 'player_' + Math.random().toString(36).substring(2, 9);
}

// 示例方剂数据
const DEFAULT_FORMULAS: Formula[] = [
  {
    id: 'mahuang_tang',
    name: '麻黄汤',
    pinyin: 'Má Huáng Tāng',
    category: '解表剂',
    difficulty: FormulaDifficulty.Normal,
    composition: [
      { medicineId: 'mahuang', amount: '9g', role: FormulaRole.Jun, name: '麻黄' },
      { medicineId: 'guizhi', amount: '6g', role: FormulaRole.Chen, name: '桂枝' },
      { medicineId: 'xingren', amount: '9g', role: FormulaRole.Zuo, name: '杏仁' },
      { medicineId: 'gancao', amount: '3g', role: FormulaRole.Shi, name: '甘草' },
    ],
    functions: ['发汗解表', '宣肺平喘'],
    indications: ['外感风寒表实证'],
    song: '麻黄汤中用桂枝，杏仁甘草四般施，发热恶寒头项痛，喘而无汗服之宜。',
    variations: [],
    contraindications: [],
    proficiency: 0,
    chapterId: 'chapter-1',
    isMastered: false,
  },
  {
    id: 'guizhi_tang',
    name: '桂枝汤',
    pinyin: 'Guì Zhī Tāng',
    category: '解表剂',
    difficulty: FormulaDifficulty.Easy,
    composition: [
      { medicineId: 'guizhi', amount: '9g', role: FormulaRole.Jun, name: '桂枝' },
      { medicineId: 'baishao', amount: '9g', role: FormulaRole.Chen, name: '白芍' },
      { medicineId: 'shengjiang', amount: '9g', role: FormulaRole.Zuo, name: '生姜' },
      { medicineId: 'dazao', amount: '3枚', role: FormulaRole.Zuo, name: '大枣' },
      { medicineId: 'gancao', amount: '6g', role: FormulaRole.Shi, name: '甘草' },
    ],
    functions: ['解肌发表', '调和营卫'],
    indications: ['外感风寒表虚证'],
    song: '桂枝汤治太阳风，芍药甘草姜枣同，解肌发表调营卫，汗出恶风此方功。',
    variations: [],
    contraindications: [],
    proficiency: 0,
    chapterId: 'chapter-1',
    isMastered: false,
  },
  {
    id: 'sijunzi_tang',
    name: '四君子汤',
    pinyin: 'Sì Jūn Zǐ Tāng',
    category: '补益剂',
    difficulty: FormulaDifficulty.Easy,
    composition: [
      { medicineId: 'renshen', amount: '9g', role: FormulaRole.Jun, name: '人参' },
      { medicineId: 'baizhu', amount: '9g', role: FormulaRole.Chen, name: '白术' },
      { medicineId: 'fuling', amount: '9g', role: FormulaRole.Zuo, name: '茯苓' },
      { medicineId: 'gancao', amount: '6g', role: FormulaRole.Shi, name: '甘草' },
    ],
    functions: ['益气健脾'],
    indications: ['脾胃气虚证'],
    song: '四君子汤中和义，参术茯苓甘草比，益以夏陈名六君，祛痰补气阳虚饵。',
    variations: [],
    contraindications: [],
    proficiency: 0,
    chapterId: 'chapter-17',
    isMastered: false,
  },
];

// 示例临床病案
const DEFAULT_CLINICAL_CASES: ClinicalCase[] = [
  {
    id: 'case_001',
    chapterId: 'chapter-1',
    formulaId: 'mahuang_tang',
    patientInfo: {
      name: '张某',
      age: 35,
      gender: 'male',
    },
    symptoms: ['恶寒发热', '头痛身痛', '无汗而喘', '舌苔薄白'],
    tongue: {
      color: '淡红',
      coating: '薄白',
    },
    pulse: {
      type: '浮紧',
      description: '脉浮紧',
    },
    correctTreatment: '辛温解表',
    correctFormula: '麻黄汤',
    correctJun: '麻黄',
    explanation: '患者恶寒发热、无汗而喘，脉浮紧，为外感风寒表实证，故用麻黄汤发汗解表、宣肺平喘。',
    difficulty: 'normal',
  },
  {
    id: 'case_002',
    chapterId: 'chapter-1',
    formulaId: 'guizhi_tang',
    patientInfo: {
      name: '李某',
      age: 28,
      gender: 'female',
    },
    symptoms: ['发热头痛', '汗出恶风', '鼻鸣干呕', '苔白不渴'],
    tongue: {
      color: '淡红',
      coating: '薄白',
    },
    pulse: {
      type: '浮缓',
      description: '脉浮缓',
    },
    correctTreatment: '解肌发表',
    correctFormula: '桂枝汤',
    correctJun: '桂枝',
    explanation: '患者发热汗出、恶风脉缓，为外感风寒表虚证，营卫不和，故用桂枝汤解肌发表、调和营卫。',
    difficulty: 'easy',
  },
];

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // 初始状态
      player: createInitialPlayer(),
      medicines: migrateMedicineData(medicineData.medicines),
      seeds: [],
      formulas: DEFAULT_FORMULAS,
      clinicalCases: DEFAULT_CLINICAL_CASES,
      currentRegion: WuxingType.Wood,
      isExploreOpen: false,
      isCollectionOpen: false,
      isMedicineDetailOpen: false,
      isFormulaPursuitOpen: false,
      isClinicalCaseOpen: false,
      selectedMedicine: null,
      selectedSeed: null,
      currentCase: null,
      unlockedFormulas: [],
      formulaProficiency: {},
      activePursuits: [],
      collectedMedicines: [],
      pursuitRefreshTimer: null,
      dailyStats: createInitialDailyStats(),

      // Actions - 亲密度
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

      // 增加声望
      addReputation: (amount: number) => {
        const { player } = get();
        set({
          player: {
            ...player,
            reputation: Math.max(0, player.reputation + amount),
          },
        });
      },

      // 使用探索次数（向后兼容）
      useExploreChance: () => {
        const { player } = get();
        if ((player.exploreCount || 0) <= 0) return false;

        set({
          player: {
            ...player,
            exploreCount: (player.exploreCount || 0) - 1,
          },
        });
        return true;
      },

      // 重置探索次数（向后兼容）
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

      // 接受方剂追缉令
      acceptPursuit: (_pursuitId: string) => {
        // 实际实现需要生成追缉令
      },

      // 完成方剂追缉令
      completePursuit: (pursuitId: string) => {
        const { player } = get();
        const pursuit = player.activePursuits.find(p => p.id === pursuitId);
        if (!pursuit || pursuit.completed) return;

        const updatedPursuits = player.activePursuits.map(p =>
          p.id === pursuitId ? { ...p, completed: true } : p
        );

        const unlockedFormulas = [...player.unlockedFormulas];
        if (!unlockedFormulas.includes(pursuit.formulaId)) {
          unlockedFormulas.push(pursuit.formulaId);
        }

        const updatedPlayer = {
          ...player,
          currency: player.currency + pursuit.rewards.currency,
          reputation: player.reputation + 10,
          activePursuits: updatedPursuits,
          completedPursuits: [...player.completedPursuits, pursuitId],
          unlockedFormulas,
          dailyStats: {
            ...player.dailyStats,
            pursuitsCompleted: player.dailyStats.pursuitsCompleted + 1,
          },
        };

        set({ player: updatedPlayer });
      },

      // 更新追缉进度
      updatePursuitProgress: (pursuitId: string, medicineId: string) => {
        const { player } = get();
        const updatedPursuits = player.activePursuits.map(p => {
          if (p.id !== pursuitId) return p;
          return {
            ...p,
            collectedMedicines: [...p.collectedMedicines, medicineId],
          };
        });

        set({
          player: {
            ...player,
            activePursuits: updatedPursuits,
          },
        });
      },

      // 放弃追缉令
      abandonPursuit: (pursuitId: string) => {
        const { player } = get();
        const updatedPursuits = player.activePursuits.filter(p => p.id !== pursuitId);
        set({
          player: {
            ...player,
            activePursuits: updatedPursuits,
          },
        });
      },

      // 生成每日追缉令
      generateDailyPursuits: () => {
        const { player, formulas } = get();
        const today = getTodayString();

        if (player.activePursuits.some(p => p.expiresAt.startsWith(today))) {
          return;
        }

        const activePursuits: FormulaPursuit[] = [];
        const shuffled = [...formulas].sort(() => Math.random() - 0.5);
        const difficulties: ('easy' | 'normal' | 'hard' | 'challenge')[] = ['easy', 'normal', 'normal', 'hard', 'challenge'];

        difficulties.forEach((difficulty, index) => {
          const formula = shuffled[index % shuffled.length];
          if (!formula) return;

          const rewards: Record<string, { currency: number; affinityBonus?: number; badge?: string }> = {
            easy: { currency: 200 },
            normal: { currency: 300 },
            hard: { currency: 500 },
            challenge: { currency: 800, badge: '辨证大师' },
          };

          activePursuits.push({
            id: `pursuit_${today}_${index}`,
            formulaId: formula.id,
            difficulty,
            timeLimit: 24,
            rewards: rewards[difficulty],
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            completed: false,
            collectedMedicines: [],
          });
        });

        set({
          player: {
            ...player,
            activePursuits,
          },
        });
      },

      // 生成追缉令（支持强制刷新）
      generatePursuits: (force?: boolean) => {
        const { player, formulas } = get();
        const now = Date.now();

        const acceptedPursuits = player.activePursuits.filter(p =>
          p.collectedMedicines.length > 0 && !p.completed
        );

        if (!force && player.activePursuits.some(p => p.collectedMedicines.length === 0 && !p.completed)) {
          return;
        }

        const newPursuits: FormulaPursuit[] = [];
        const shuffled = [...formulas].sort(() => Math.random() - 0.5);
        const difficulties: ('easy' | 'normal' | 'hard' | 'challenge')[] = ['easy', 'normal', 'normal', 'hard', 'challenge'];

        difficulties.forEach((difficulty, index) => {
          const formula = shuffled[index % shuffled.length];
          if (!formula) return;

          const rewards: Record<string, { currency: number; affinityBonus?: number; badge?: string }> = {
            easy: { currency: 200 },
            normal: { currency: 300 },
            hard: { currency: 500 },
            challenge: { currency: 800, badge: '辨证大师' },
          };

          newPursuits.push({
            id: `pursuit_${now}_${index}`,
            formulaId: formula.id,
            difficulty,
            timeLimit: 1,
            rewards: rewards[difficulty],
            expiresAt: new Date(now + 60 * 60 * 1000).toISOString(),
            completed: false,
            collectedMedicines: [],
          });
        });

        set({
          player: {
            ...player,
            activePursuits: [...acceptedPursuits, ...newPursuits],
          },
        });
      },

      // 启动追缉令定时器（每小时刷新）
      startPursuitRefreshTimer: () => {
        const { pursuitRefreshTimer } = get();
        if (pursuitRefreshTimer) {
          clearInterval(pursuitRefreshTimer);
        }

        const timer = window.setInterval(() => {
          get().generatePursuits(true);
        }, 60 * 60 * 1000);

        set({ pursuitRefreshTimer: timer });
      },

      // 停止追缉令定时器
      stopPursuitRefreshTimer: () => {
        const { pursuitRefreshTimer } = get();
        if (pursuitRefreshTimer) {
          clearInterval(pursuitRefreshTimer);
          set({ pursuitRefreshTimer: null });
        }
      },

      // 开始临床病案
      startClinicalCase: (caseId: string) => {
        set({ currentCase: caseId, isClinicalCaseOpen: true });
      },

      // 提交辨证
      submitDiagnosis: (caseId: string, treatment: string, formula: string, junMedicine: string) => {
        const { clinicalCases } = get();
        const caseData = clinicalCases.find(c => c.id === caseId);
        if (!caseData) return { correct: false, score: 0 };

        let score = 0;
        if (treatment === caseData.correctTreatment) score += 1;
        if (formula === caseData.correctFormula) score += 2;
        if (junMedicine === caseData.correctJun) score += 2;

        const correct = score >= 4;
        return { correct, score };
      },

      // 完成临床病案
      completeClinicalCase: (caseId: string, score: number) => {
        const { player, clinicalCases } = get();
        const caseData = clinicalCases.find(c => c.id === caseId);
        if (!caseData) return;

        const formulaId = caseData.formulaId;
        const currentProficiency = player.formulaProficiency[formulaId] || 0;
        const newProficiency = Math.min(5, currentProficiency + (score >= 4 ? 2 : 1));

        let reward = 50;
        if (score >= 5) reward = 200;
        else if (score >= 4) reward = 100;

        set({
          player: {
            ...player,
            currency: player.currency + reward,
            reputation: player.reputation + (score >= 4 ? 10 : 5),
            formulaProficiency: {
              ...player.formulaProficiency,
              [formulaId]: newProficiency,
            },
            dailyStats: {
              ...player.dailyStats,
              casesCompleted: player.dailyStats.casesCompleted + 1,
            },
          },
        });
      },

      // 设置探索界面开关
      setExploreOpen: (open: boolean) => {
        set({ isExploreOpen: open });
      },

      // 设置图鉴界面开关
      setCollectionOpen: (open: boolean) => {
        set({ isCollectionOpen: open });
      },

      // 设置方剂追缉令界面
      setFormulaPursuitOpen: (open: boolean) => {
        set({ isFormulaPursuitOpen: open });
      },

      // 设置临床病案界面
      setClinicalCaseOpen: (open: boolean) => {
        set({ isClinicalCaseOpen: open });
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

      // 根据名称获取药灵
      getMedicineByName: (name: string) => {
        const { medicines } = get();
        return medicines.find(m => m.name === name);
      },

      // 获取已收集药灵
      getCollectedMedicines: () => {
        const { medicines, player } = get();
        return medicines.filter(m => player.collectedMedicines.includes(m.id));
      },

      // 获取指定五行的药灵
      getMedicinesByWuxing: (wuxing: WuxingType) => {
        const { medicines } = get();
        return medicines.filter(m => m.wuxing === wuxing);
      },

      // 获取活跃的追缉令
      getActivePursuits: () => {
        const { player } = get();
        return player.activePursuits.filter(p => !p.completed && new Date(p.expiresAt) > new Date());
      },

      // 获取已解锁的方剂
      getUnlockedFormulas: () => {
        const { formulas, player } = get();
        return formulas.filter(f => player.unlockedFormulas.includes(f.id));
      },

      // 根据ID获取方剂
      getFormulaById: (id: string) => {
        const { formulas } = get();
        return formulas.find(f => f.id === id);
      },

      // 获取方剂熟练度
      getFormulaProficiency: (formulaId: string) => {
        const { player } = get();
        return player.formulaProficiency[formulaId] || 0;
      },

      // 登录处理（v3.0 简化版，移除 seed 系统）
      login: () => {
        const { player } = get();
        const today = getTodayString();

        // 检查是否是新的一天
        if (player.lastLoginDate === today) {
          return { isNewDay: false, rewards: { currency: 0 } };
        }

        // 检查是否连续登录
        const lastDate = new Date(player.lastLoginDate);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        const newStreak = diffDays === 1 ? player.loginStreak + 1 : 1;

        // 每日奖励
        const currencyRewards = 50 + (newStreak >= 3 ? 20 : 0);

        // 重置每日统计
        const newDailyStats = createInitialDailyStats();

        // 生成新的追缉令
        get().generatePursuits(true);

        // 启动定时器
        get().startPursuitRefreshTimer();

        const updatedPlayer = {
          ...player,
          currency: player.currency + currencyRewards,
          dailyStats: newDailyStats,
          lastLoginDate: today,
          loginStreak: newStreak,
        };

        set({ player: updatedPlayer });

        return {
          isNewDay: true,
          rewards: { currency: currencyRewards },
        };
      },
    }),
    {
      name: 'fangling-valley-v3-storage',
      partialize: (state) => ({ player: state.player }),
    }
  )
);

// 导出辅助函数和常量
export { LEGACY_TO_WUXING };

// 方剂数据访问函数

export interface FormulaData {
  id: string;
  name: string;
  pinyin?: string;
  category: string;
  difficulty?: 'easy' | 'normal' | 'hard' | 'challenge';
  composition?: Array<{
    medicineId: string;
    amount?: string;
    role?: 'jun' | 'chen' | 'zuo' | 'shi';
  }>;
  functions: string[];
  indications: string[];
  song?: string;
  proficiency?: number;
}

// 基础方剂数据（与 gameStore.ts 中的 DEFAULT_FORMULAS 保持一致）
const DEFAULT_FORMULAS: FormulaData[] = [
  {
    id: 'mahuang_tang',
    name: '麻黄汤',
    pinyin: 'Má Huáng Tāng',
    category: '解表剂',
    difficulty: 'normal',
    composition: [
      { medicineId: 'mahuang', amount: '9g', role: 'jun' },
      { medicineId: 'guizhi', amount: '6g', role: 'chen' },
      { medicineId: 'xingren', amount: '9g', role: 'zuo' },
      { medicineId: 'gancao', amount: '3g', role: 'shi' },
    ],
    functions: ['发汗解表', '宣肺平喘'],
    indications: ['外感风寒表实证'],
    song: '麻黄汤中用桂枝，杏仁甘草四般施，发热恶寒头项痛，喘而无汗服之宜。',
    proficiency: 0,
  },
  {
    id: 'guizhi_tang',
    name: '桂枝汤',
    pinyin: 'Guì Zhī Tāng',
    category: '解表剂',
    difficulty: 'easy',
    composition: [
      { medicineId: 'guizhi', amount: '9g', role: 'jun' },
      { medicineId: 'baishao', amount: '9g', role: 'chen' },
      { medicineId: 'shengjiang', amount: '9g', role: 'zuo' },
      { medicineId: 'dazao', amount: '3枚', role: 'zuo' },
      { medicineId: 'gancao', amount: '6g', role: 'shi' },
    ],
    functions: ['解肌发表', '调和营卫'],
    indications: ['外感风寒表虚证'],
    song: '桂枝汤治太阳风，芍药甘草姜枣同，解肌发表调营卫，汗出恶风此方功。',
    proficiency: 0,
  },
  {
    id: 'sijunzi_tang',
    name: '四君子汤',
    pinyin: 'Sì Jūn Zǐ Tāng',
    category: '补益剂',
    difficulty: 'easy',
    composition: [
      { medicineId: 'renshen', amount: '9g', role: 'jun' },
      { medicineId: 'baizhu', amount: '9g', role: 'chen' },
      { medicineId: 'fuling', amount: '9g', role: 'zuo' },
      { medicineId: 'gancao', amount: '6g', role: 'shi' },
    ],
    functions: ['益气健脾'],
    indications: ['脾胃气虚证'],
    song: '四君子汤中和义，参术茯苓甘草比，益以夏陈名六君，祛痰补气阳虚饵。',
    proficiency: 0,
  },
  {
    id: 'baihu_tang',
    name: '白虎汤',
    pinyin: 'Bái Hǔ Tāng',
    category: '清热剂',
    difficulty: 'normal',
    composition: [
      { medicineId: 'shigao', amount: '30g', role: 'jun' },
      { medicineId: 'zhimu', amount: '9g', role: 'chen' },
      { medicineId: 'gengmi', amount: '9g', role: 'zuo' },
      { medicineId: 'gancao', amount: '3g', role: 'shi' },
    ],
    functions: ['清热生津'],
    indications: ['气分热盛证'],
    song: '白虎汤用石膏偎，知母甘草粳米陪，亦有加入人参者，躁烦热渴舌生苔。',
    proficiency: 0,
  },
  {
    id: 'dachengqi_tang',
    name: '大承气汤',
    pinyin: 'Dà Chéng Qì Tāng',
    category: '泻下剂',
    difficulty: 'hard',
    composition: [
      { medicineId: 'dahuang', amount: '12g', role: 'jun' },
      { medicineId: 'mangxiao', amount: '9g', role: 'chen' },
      { medicineId: 'houpu', amount: '15g', role: 'zuo' },
      { medicineId: 'zhishi', amount: '12g', role: 'zuo' },
    ],
    functions: ['峻下热结'],
    indications: ['阳明腑实证'],
    song: '大承气汤用硝黄，配伍枳朴泻力强，痞满燥实四症见，峻下热结第一方。',
    proficiency: 0,
  },
  {
    id: 'sini_tang',
    name: '四逆汤',
    pinyin: 'Sì Nì Tāng',
    category: '温里剂',
    difficulty: 'normal',
    composition: [
      { medicineId: 'fuzi', amount: '15g', role: 'jun' },
      { medicineId: 'ganjiang', amount: '9g', role: 'chen' },
      { medicineId: 'gancao', amount: '6g', role: 'shi' },
    ],
    functions: ['回阳救逆'],
    indications: ['少阴病，心肾阳衰寒厥证'],
    song: '四逆汤中附草姜，四肢厥冷急煎尝，腹痛吐泻脉微细，急投此方可回阳。',
    proficiency: 0,
  },
  {
    id: ' Lizhong_wan',
    name: '理中丸',
    pinyin: 'Lǐ Zhōng Wán',
    category: '温里剂',
    difficulty: 'easy',
    composition: [
      { medicineId: 'renshen', amount: '9g', role: 'jun' },
      { medicineId: 'ganjiang', amount: '9g', role: 'chen' },
      { medicineId: 'baizhu', amount: '9g', role: 'zuo' },
      { medicineId: 'gancao', amount: '9g', role: 'shi' },
    ],
    functions: ['温中祛寒', '补气健脾'],
    indications: ['脾胃虚寒证'],
    song: '理中丸主理中乡，甘草人参术干姜，呕利腹痛阴寒盛，或加附子总扶阳。',
    proficiency: 0,
  },
];

/**
 * 获取所有方剂数据
 */
export function getAllFormulas(): FormulaData[] {
  return DEFAULT_FORMULAS;
}

/**
 * 通过ID获取方剂
 */
export function getFormulaById(id: string): FormulaData | undefined {
  return DEFAULT_FORMULAS.find(f => f.id === id);
}

/**
 * 通过名称获取方剂
 */
export function getFormulaByName(name: string): FormulaData | undefined {
  return DEFAULT_FORMULAS.find(f => f.name === name);
}

/**
 * 通过分类获取方剂
 */
export function getFormulasByCategory(category: string): FormulaData[] {
  return DEFAULT_FORMULAS.filter(f => f.category === category);
}

/**
 * 获取已解锁的方剂
 */
export function getUnlockedFormulas(unlockedIds: string[]): FormulaData[] {
  return DEFAULT_FORMULAS.filter(f => unlockedIds.includes(f.id));
}

/**
 * 搜索方剂
 */
export function searchFormulas(query: string): FormulaData[] {
  const lowerQuery = query.toLowerCase();
  return DEFAULT_FORMULAS.filter(f =>
    f.name.includes(query) ||
    (f.pinyin && f.pinyin.toLowerCase().includes(lowerQuery)) ||
    f.category.includes(query) ||
    f.functions.some(fn => fn.includes(query))
  );
}

export default {
  getAllFormulas,
  getFormulaById,
  getFormulaByName,
  getFormulasByCategory,
  getUnlockedFormulas,
  searchFormulas,
};

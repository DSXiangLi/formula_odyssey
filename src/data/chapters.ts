/**
 * 药灵山谷 v3.0 章节数据配置
 * 20章结构化学习数据
 *
 * 基于现有数据：
 * - 18味药：麻黄、桂枝、紫苏、生姜、石膏、知母、金银花、连翘、大黄、芒硝、
 *          人参、黄芪、白术、茯苓、当归、川芎、白芍、熟地黄
 * - 19个方剂
 *
 * 章节设计原则：
 * 1. 优先使用现有药物和方剂
 * 2. 部分章节预留扩展空间（标记为 TODO 的药物/方剂将在后续版本补充）
 * 3. 保持中医方剂分类的传统顺序
 */

export interface Chapter {
  id: string;
  sequence: number;
  name: string;
  category: string;
  description: string;
  medicines: string[];
  formulas: string[];
  bossCaseId: string;
  rewardSkill: string;
  rewardSkillName: string;
  unlockCondition: {
    completedChapters?: string[];
    minMedicines?: number;
  };
  wuxing: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
  difficulty: 1 | 2 | 3 | 4 | 5;
  isAvailable: boolean; // 标记本章是否可用（数据是否完整）
}

/**
 * 20章完整数据
 * 基于中医传统方剂分类顺序设计
 */
export const chapters: Chapter[] = [
  // ===== 第1章：解表剂山谷 =====
  {
    id: 'chapter-1',
    sequence: 1,
    name: '解表剂山谷',
    category: '解表剂',
    description: '药灵山谷的第一站，这里生长着解表发散的药灵。学习麻黄汤、桂枝汤等经典解表方剂，掌握风寒表证的治疗要领。',
    medicines: ['麻黄', '桂枝', '紫苏', '生姜'],
    formulas: ['麻黄汤', '桂枝汤'],
    bossCaseId: 'case-1',
    rewardSkill: 'keen_eye',
    rewardSkillName: '望气之眼',
    unlockCondition: {},
    wuxing: 'metal',
    difficulty: 1,
    isAvailable: true
  },

  // ===== 第2章：清热剂山谷 =====
  {
    id: 'chapter-2',
    sequence: 2,
    name: '清热剂山谷',
    category: '清热剂',
    description: '炎夏般的山谷，清热泻火药灵在此生长。学习白虎汤等清热方剂，掌握气分实热证的治疗。',
    medicines: ['石膏', '知母', '金银花', '连翘'],
    formulas: ['白虎汤', '黄连解毒汤'],
    bossCaseId: 'case-2',
    rewardSkill: 'heat_expert',
    rewardSkillName: '清热精通',
    unlockCondition: {
      completedChapters: ['chapter-1']
    },
    wuxing: 'water',
    difficulty: 1,
    isAvailable: true
  },

  // ===== 第3章：泻下剂山谷 =====
  {
    id: 'chapter-3',
    sequence: 3,
    name: '泻下剂山谷',
    category: '泻下剂',
    description: '地势险峻的山谷，泻下攻积药灵栖居于此。学习大承气汤等泻下方剂，掌握实热积滞的攻下之法。',
    medicines: ['大黄', '芒硝'],
    formulas: ['大承气汤'],
    bossCaseId: 'case-3',
    rewardSkill: 'purgation_master',
    rewardSkillName: '泻下明辨',
    unlockCondition: {
      completedChapters: ['chapter-2']
    },
    wuxing: 'earth',
    difficulty: 2,
    isAvailable: true
  },

  // ===== 第4章：祛风湿剂山谷（扩展预留） =====
  {
    id: 'chapter-4',
    sequence: 4,
    name: '祛风湿剂山谷',
    category: '祛风湿剂',
    description: '潮湿多雾的山谷，祛风除湿药灵在此生长。学习羌活胜湿汤、独活寄生汤，掌握风寒湿痹的治疗。',
    medicines: ['独活', '羌活', '防风'],
    formulas: ['羌活胜湿汤'],
    bossCaseId: 'case-4',
    rewardSkill: 'rheumatism_expert',
    rewardSkillName: '风湿专精',
    unlockCondition: {
      completedChapters: ['chapter-3']
    },
    wuxing: 'wood',
    difficulty: 2,
    isAvailable: false // 药物数据待补充
  },

  // ===== 第5章：化湿剂山谷（扩展预留） =====
  {
    id: 'chapter-5',
    sequence: 5,
    name: '化湿剂山谷',
    category: '化湿剂',
    description: '湿润多雾的山谷，芳香化湿药灵在此繁衍。学习藿香正气散、三仁汤，掌握湿浊中阻的化湿之法。',
    medicines: ['藿香', '佩兰', '砂仁'],
    formulas: ['藿香正气散'],
    bossCaseId: 'case-5',
    rewardSkill: 'dampness_transform',
    rewardSkillName: '化湿妙手',
    unlockCondition: {
      completedChapters: ['chapter-4']
    },
    wuxing: 'earth',
    difficulty: 2,
    isAvailable: false // 药物数据待补充
  },

  // ===== 第6章：利水渗湿剂山谷 =====
  {
    id: 'chapter-6',
    sequence: 6,
    name: '利水渗湿剂山谷',
    category: '利水渗湿剂',
    description: '雾气缭绕的山谷，利水渗湿药灵在此繁衍。学习五苓散、平胃散，掌握水湿内停的调理之道。',
    medicines: ['茯苓', '白术', '泽泻', '苍术'],
    formulas: ['五苓散', '平胃散'],
    bossCaseId: 'case-6',
    rewardSkill: 'diuresis_master',
    rewardSkillName: '利水通淋',
    unlockCondition: {
      completedChapters: ['chapter-5']
    },
    wuxing: 'water',
    difficulty: 2,
    isAvailable: true // 部分药物需要扩展
  },

  // ===== 第7章：温里剂山谷 =====
  {
    id: 'chapter-7',
    sequence: 7,
    name: '温里剂山谷',
    category: '温里剂',
    description: '常年积雪的山谷，温阳散寒药灵在此蛰伏。学习四逆汤、理中丸，掌握阳虚寒证的救治之法。',
    medicines: ['附子', '干姜', '桂枝', '白术'],
    formulas: ['四逆汤', '理中丸'],
    bossCaseId: 'case-7',
    rewardSkill: 'warm_interior',
    rewardSkillName: '温阳散寒',
    unlockCondition: {
      completedChapters: ['chapter-6']
    },
    wuxing: 'fire',
    difficulty: 3,
    isAvailable: true // 部分药物需要扩展
  },

  // ===== 第8章：理气剂山谷 =====
  {
    id: 'chapter-8',
    sequence: 8,
    name: '理气剂山谷',
    category: '理气剂',
    description: '云雾缭绕的山谷，行气解郁药灵在此穿行。学习柴胡疏肝散、半夏厚朴汤，掌握气机郁滞的调理之法。',
    medicines: ['柴胡', '川芎', '紫苏', '生姜'],
    formulas: ['柴胡疏肝散', '半夏厚朴汤'],
    bossCaseId: 'case-8',
    rewardSkill: 'qi_regulation',
    rewardSkillName: '理气解郁',
    unlockCondition: {
      completedChapters: ['chapter-7']
    },
    wuxing: 'wood',
    difficulty: 3,
    isAvailable: true // 部分药物需要扩展
  },

  // ===== 第9章：消食剂山谷（扩展预留） =====
  {
    id: 'chapter-9',
    sequence: 9,
    name: '消食剂山谷',
    category: '消食剂',
    description: '丰收的山谷，消食导滞药灵在此聚集。学习保和丸、枳实导滞丸，掌握食积内停的消食之法。',
    medicines: ['山楂', '神曲', '麦芽'],
    formulas: ['保和丸'],
    bossCaseId: 'case-9',
    rewardSkill: 'digestion_aid',
    rewardSkillName: '消食导滞',
    unlockCondition: {
      completedChapters: ['chapter-8']
    },
    wuxing: 'earth',
    difficulty: 2,
    isAvailable: false // 药物数据待补充
  },

  // ===== 第10章：驱虫剂山谷（扩展预留） =====
  {
    id: 'chapter-10',
    sequence: 10,
    name: '驱虫剂山谷',
    category: '驱虫剂',
    description: '阴暗潮湿的山谷，驱虫消积药灵在此潜藏。学习乌梅丸，掌握虫积内生的驱虫之法。',
    medicines: ['使君子', '槟榔'],
    formulas: ['乌梅丸'],
    bossCaseId: 'case-10',
    rewardSkill: 'parasite_expel',
    rewardSkillName: '驱虫安蛔',
    unlockCondition: {
      completedChapters: ['chapter-9']
    },
    wuxing: 'wood',
    difficulty: 2,
    isAvailable: false // 药物数据待补充
  },

  // ===== 第11章：止血剂山谷（扩展预留） =====
  {
    id: 'chapter-11',
    sequence: 11,
    name: '止血剂山谷',
    category: '止血剂',
    description: '血红色的山谷，止血收敛药灵在此生长。学习十灰散、黄土汤，掌握各种出血证的治疗之法。',
    medicines: ['三七', '白及', '地榆', '槐花'],
    formulas: ['十灰散', '黄土汤'],
    bossCaseId: 'case-11',
    rewardSkill: 'hemostasis_master',
    rewardSkillName: '止血圣手',
    unlockCondition: {
      completedChapters: ['chapter-10']
    },
    wuxing: 'metal',
    difficulty: 3,
    isAvailable: false // 药物数据待补充
  },

  // ===== 第12章：活血化瘀剂山谷 =====
  {
    id: 'chapter-12',
    sequence: 12,
    name: '活血化瘀剂山谷',
    category: '理血剂',
    description: '紫色的山谷，活血化瘀药灵在此汇聚。学习血府逐瘀汤、温经汤，掌握瘀血内阻的活血之法。',
    medicines: ['川芎', '当归', '白芍', '桂枝'],
    formulas: ['血府逐瘀汤', '温经汤'],
    bossCaseId: 'case-12',
    rewardSkill: 'blood_circulation',
    rewardSkillName: '活血通络',
    unlockCondition: {
      completedChapters: ['chapter-11']
    },
    wuxing: 'fire',
    difficulty: 4,
    isAvailable: true // 部分药物需要扩展
  },

  // ===== 第13章：化痰止咳平喘剂山谷（扩展预留） =====
  {
    id: 'chapter-13',
    sequence: 13,
    name: '化痰止咳平喘剂山谷',
    category: '祛痰剂',
    description: '云雾弥漫的山谷，化痰止咳药灵在此栖息。学习二陈汤、清气化痰丸，掌握痰湿阻肺的祛痰之法。',
    medicines: ['半夏', '陈皮', '茯苓', '甘草'],
    formulas: ['二陈汤', '清气化痰丸'],
    bossCaseId: 'case-13',
    rewardSkill: 'phlegm_resolving',
    rewardSkillName: '化痰止咳',
    unlockCondition: {
      completedChapters: ['chapter-12']
    },
    wuxing: 'metal',
    difficulty: 3,
    isAvailable: true // 部分药物需要扩展
  },

  // ===== 第14章：安神剂山谷（扩展预留） =====
  {
    id: 'chapter-14',
    sequence: 14,
    name: '安神剂山谷',
    category: '安神剂',
    description: '静谧幽深的山谷，宁心安神药灵在此静修。学习酸枣仁汤、天王补心丹，掌握心神不宁的安神之法。',
    medicines: ['酸枣仁', '柏子仁', '远志'],
    formulas: ['酸枣仁汤', '天王补心丹'],
    bossCaseId: 'case-14',
    rewardSkill: 'mind_calming',
    rewardSkillName: '安神定志',
    unlockCondition: {
      completedChapters: ['chapter-13']
    },
    wuxing: 'fire',
    difficulty: 3,
    isAvailable: false // 药物数据待补充
  },

  // ===== 第15章：平肝息风剂山谷 =====
  {
    id: 'chapter-15',
    sequence: 15,
    name: '平肝息风剂山谷',
    category: '祛痰剂',
    description: '风啸山谷，平肝息风药灵在此镇守。学习天麻钩藤饮、镇肝熄风汤，掌握肝阳上亢、肝风内动的平肝之法。',
    medicines: ['天麻', '钩藤', '石决明', '茯苓'],
    formulas: ['天麻钩藤饮', '镇肝熄风汤'],
    bossCaseId: 'case-15',
    rewardSkill: 'wind_extinguishing',
    rewardSkillName: '平肝息风',
    unlockCondition: {
      completedChapters: ['chapter-14']
    },
    wuxing: 'wood',
    difficulty: 4,
    isAvailable: true // 部分药物需要扩展
  },

  // ===== 第16章：开窍剂山谷（扩展预留） =====
  {
    id: 'chapter-16',
    sequence: 16,
    name: '开窍剂山谷',
    category: '开窍剂',
    description: '神秘幽深的山谷，芳香开窍药灵在此沉睡。学习安宫牛黄丸、苏合香丸，掌握窍闭神昏的开窍之法。',
    medicines: ['麝香', '冰片'],
    formulas: ['安宫牛黄丸'],
    bossCaseId: 'case-16',
    rewardSkill: 'orifice_opening',
    rewardSkillName: '开窍醒神',
    unlockCondition: {
      completedChapters: ['chapter-15']
    },
    wuxing: 'fire',
    difficulty: 4,
    isAvailable: false // 药物数据待补充
  },

  // ===== 第17章：补气剂山谷 =====
  {
    id: 'chapter-17',
    sequence: 17,
    name: '补气剂山谷',
    category: '补益剂',
    description: '肥沃丰饶的山谷，补气健脾药灵在此繁茂。学习四君子汤、补中益气汤，掌握脾胃气虚的补气之法。',
    medicines: ['人参', '黄芪', '白术', '甘草'],
    formulas: ['四君子汤', '补中益气汤'],
    bossCaseId: 'case-17',
    rewardSkill: 'qi_tonic',
    rewardSkillName: '补气益脾',
    unlockCondition: {
      completedChapters: ['chapter-16']
    },
    wuxing: 'earth',
    difficulty: 3,
    isAvailable: true // 部分药物需要扩展
  },

  // ===== 第18章：补血剂山谷 =====
  {
    id: 'chapter-18',
    sequence: 18,
    name: '补血剂山谷',
    category: '补益剂',
    description: '温润如玉的山谷，补血养阴药灵在此滋养。学习四物汤，掌握营血虚滞的补血之法。',
    medicines: ['当归', '熟地黄', '白芍', '川芎'],
    formulas: ['四物汤'],
    bossCaseId: 'case-18',
    rewardSkill: 'blood_tonic',
    rewardSkillName: '补血养血',
    unlockCondition: {
      completedChapters: ['chapter-17']
    },
    wuxing: 'water',
    difficulty: 3,
    isAvailable: true
  },

  // ===== 第19章：补阳剂山谷（扩展预留） =====
  {
    id: 'chapter-19',
    sequence: 19,
    name: '补阳剂山谷',
    category: '补益剂',
    description: '阳光普照的山谷，补肾壮阳药灵在此升腾。学习肾气丸、右归丸，掌握肾阳虚衰的补阳之法。',
    medicines: ['附子', '肉桂', '杜仲'],
    formulas: ['肾气丸', '右归丸'],
    bossCaseId: 'case-19',
    rewardSkill: 'yang_tonic',
    rewardSkillName: '补肾壮阳',
    unlockCondition: {
      completedChapters: ['chapter-18']
    },
    wuxing: 'fire',
    difficulty: 4,
    isAvailable: true // 部分药物需要扩展
  },

  // ===== 第20章：补阴剂山谷 =====
  {
    id: 'chapter-20',
    sequence: 20,
    name: '补阴剂山谷',
    category: '补益剂',
    description: '清凉幽静的山谷，滋阴润燥药灵在此涵养。学习六味地黄丸、左归丸，掌握肾阴亏虚的补阴之法。',
    medicines: ['熟地黄', '山茱萸', '山药'],
    formulas: ['六味地黄丸', '左归丸'],
    bossCaseId: 'case-20',
    rewardSkill: 'yin_tonic',
    rewardSkillName: '滋阴润燥',
    unlockCondition: {
      completedChapters: ['chapter-19']
    },
    wuxing: 'water',
    difficulty: 4,
    isAvailable: false // 药物数据待补充
  }
];

/**
 * 获取章节信息
 */
export function getChapter(id: string): Chapter | undefined {
  return chapters.find(ch => ch.id === id);
}

/**
 * 获取下一章
 */
export function getNextChapter(currentSequence: number): Chapter | undefined {
  return chapters.find(ch => ch.sequence === currentSequence + 1);
}

/**
 * 获取已解锁章节
 */
export function getUnlockedChapters(completedChapters: string[]): Chapter[] {
  return chapters.filter(ch => {
    if (!ch.unlockCondition.completedChapters) return true;
    return ch.unlockCondition.completedChapters.every(id => completedChapters.includes(id));
  });
}

/**
 * 检查章节是否解锁
 */
export function isChapterUnlocked(chapterId: string, completedChapters: string[]): boolean {
  const chapter = getChapter(chapterId);
  if (!chapter) return false;
  if (!chapter.unlockCondition.completedChapters) return true;
  return chapter.unlockCondition.completedChapters.every(id => completedChapters.includes(id));
}

/**
 * 获取可用的章节（数据完整）
 */
export function getAvailableChapters(): Chapter[] {
  return chapters.filter(ch => ch.isAvailable);
}

/**
 * 获取可用的已解锁章节
 */
export function getAvailableUnlockedChapters(completedChapters: string[]): Chapter[] {
  return chapters.filter(ch => {
    if (!ch.isAvailable) return false;
    if (!ch.unlockCondition.completedChapters) return true;
    return ch.unlockCondition.completedChapters.every(id => completedChapters.includes(id));
  });
}

/**
 * 章节五行分布统计
 */
export const wuxingDistribution: Record<string, number> = {
  wood: chapters.filter(c => c.wuxing === 'wood').length,
  fire: chapters.filter(c => c.wuxing === 'fire').length,
  earth: chapters.filter(c => c.wuxing === 'earth').length,
  metal: chapters.filter(c => c.wuxing === 'metal').length,
  water: chapters.filter(c => c.wuxing === 'water').length
};

/**
 * 按五行获取章节
 */
export function getChaptersByWuxing(wuxing: Chapter['wuxing']): Chapter[] {
  return chapters.filter(ch => ch.wuxing === wuxing);
}

/**
 * 获取当前版本可用的章节数
 */
export function getAvailableChapterCount(): number {
  return chapters.filter(ch => ch.isAvailable).length;
}

/**
 * 章节统计信息
 */
export const chapterStats = {
  total: chapters.length,
  available: getAvailableChapterCount(),
  byDifficulty: {
    1: chapters.filter(c => c.difficulty === 1).length,
    2: chapters.filter(c => c.difficulty === 2).length,
    3: chapters.filter(c => c.difficulty === 3).length,
    4: chapters.filter(c => c.difficulty === 4).length,
    5: chapters.filter(c => c.difficulty === 5).length
  },
  byWuxing: wuxingDistribution
};

export default chapters;

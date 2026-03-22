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
 * 2. 药物可重复使用于多个章节
 * 3. 保持中医方剂分类的传统顺序
 * 4. 每章3-4味药，确保能组成方剂
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
  isAvailable: boolean;
}

/**
 * 20章完整数据
 */
export const chapters: Chapter[] = [
  // ===== 第1章：解表剂山谷 =====
  // 药物：麻黄(metal)、桂枝(fire)、紫苏(metal)、生姜(metal)
  // 方剂：麻黄汤(缺杏仁、甘草)、桂枝汤(缺大枣、甘草)
  {
    id: 'chapter-1',
    sequence: 1,
    name: '解表剂山谷',
    category: '解表剂',
    description: '药灵山谷的第一站，这里生长着解表发散的药灵。学习麻黄汤、桂枝汤等经典解表方剂，掌握风寒表证的治疗要领。本章收集麻黄、桂枝、紫苏、生姜四味解表要药。',
    medicines: ['麻黄', '桂枝', '紫苏', '生姜'],
    formulas: ['麻黄汤', '桂枝汤'],
    bossCaseId: 'case-exterior',
    rewardSkill: 'keen_eye',
    rewardSkillName: '望气之眼',
    unlockCondition: {},
    wuxing: 'metal',
    difficulty: 1,
    isAvailable: true
  },

  // ===== 第2章：清热剂山谷 =====
  // 药物：石膏(water)、知母(water)、金银花(metal)、连翘(fire)
  // 方剂：白虎汤(缺甘草、粳米)、黄连解毒汤(缺黄连、黄芩、黄柏、栀子)
  {
    id: 'chapter-2',
    sequence: 2,
    name: '清热剂山谷',
    category: '清热剂',
    description: '炎夏般的山谷，清热泻火药灵在此生长。学习白虎汤等清热方剂，掌握气分实热证的治疗。本章收集石膏、知母、金银花、连翘四味清热要药。',
    medicines: ['石膏', '知母', '金银花', '连翘'],
    formulas: ['白虎汤', '黄连解毒汤'],
    bossCaseId: 'case-heat',
    rewardSkill: 'heat_expert',
    rewardSkillName: '清热精通',
    unlockCondition: { completedChapters: ['chapter-1'] },
    wuxing: 'water',
    difficulty: 1,
    isAvailable: true
  },

  // ===== 第3章：泻下剂山谷 =====
  // 药物：大黄(earth)、芒硝(water)
  // 方剂：大承气汤(需厚朴、枳实 - 待补充)
  {
    id: 'chapter-3',
    sequence: 3,
    name: '泻下剂山谷',
    category: '泻下剂',
    description: '地势险峻的山谷，泻下攻积药灵栖居于此。学习大承气汤等泻下方剂，掌握实热积滞的攻下之法。本章收集大黄、芒硝两味泻下峻药。',
    medicines: ['大黄', '芒硝'],
    formulas: ['大承气汤'],
    bossCaseId: 'case-purgation',
    rewardSkill: 'purgation_master',
    rewardSkillName: '泻下明辨',
    unlockCondition: { completedChapters: ['chapter-2'] },
    wuxing: 'earth',
    difficulty: 2,
    isAvailable: true
  },

  // ===== 第4章：利水渗湿剂山谷 =====
  // 药物：茯苓(earth)、白术(earth)复用、泽泻(需补充)、猪苓(需补充)
  // 方剂：五苓散
  {
    id: 'chapter-4',
    sequence: 4,
    name: '利水渗湿剂山谷',
    category: '利水渗湿剂',
    description: '雾气缭绕的山谷，利水渗湿药灵在此繁衍。学习五苓散，掌握水湿内停的调理之道。本章收集茯苓，复习白术。',
    medicines: ['茯苓', '白术', '泽泻', '猪苓'],
    formulas: ['五苓散'],
    bossCaseId: 'case-dampness',
    rewardSkill: 'dampness_expert',
    rewardSkillName: '利水通淋',
    unlockCondition: { completedChapters: ['chapter-3'] },
    wuxing: 'water',
    difficulty: 2,
    isAvailable: true
  },

  // ===== 第5章：祛湿化浊剂山谷 =====
  // 药物：苍术(需补充)、厚朴(需补充)、陈皮(需补充)、半夏(需补充)
  // 方剂：平胃散、二陈汤
  {
    id: 'chapter-5',
    sequence: 5,
    name: '化湿剂山谷',
    category: '化湿剂',
    description: '湿润多雾的山谷，燥湿运脾药灵在此等候。学习平胃散、二陈汤，掌握湿滞脾胃的治疗之法。本章收集苍术、厚朴、陈皮、半夏四味化湿要药。',
    medicines: ['苍术', '厚朴', '陈皮', '半夏'],
    formulas: ['平胃散', '二陈汤'],
    bossCaseId: 'case-damp-transform',
    rewardSkill: 'spleen_dampness',
    rewardSkillName: '化湿妙手',
    unlockCondition: { completedChapters: ['chapter-4'] },
    wuxing: 'earth',
    difficulty: 2,
    isAvailable: false
  },

  // ===== 第6章：温里剂山谷 =====
  // 药物：附子(需补充)、干姜(需补充)、桂枝(fire)复用、白术(earth)复用
  // 方剂：四逆汤、理中丸
  {
    id: 'chapter-6',
    sequence: 6,
    name: '温里剂山谷',
    category: '温里剂',
    description: '常年积雪的山谷，温阳散寒药灵在此蛰伏。学习四逆汤、理中丸，掌握阳虚寒证的救治之法。本章收集附子、干姜，复习桂枝、白术。',
    medicines: ['附子', '干姜', '桂枝', '白术'],
    formulas: ['四逆汤', '理中丸'],
    bossCaseId: 'case-warm-interior',
    rewardSkill: 'warm_interior',
    rewardSkillName: '温阳散寒',
    unlockCondition: { completedChapters: ['chapter-5'] },
    wuxing: 'fire',
    difficulty: 3,
    isAvailable: true
  },

  // ===== 第7章：理气剂山谷 =====
  // 药物：柴胡(需补充)、香附(需补充)、枳壳(需补充)、川芎(wood)复用
  // 方剂：柴胡疏肝散
  {
    id: 'chapter-7',
    sequence: 7,
    name: '理气剂山谷',
    category: '理气剂',
    description: '云雾缭绕的山谷，行气解郁药灵在此穿行。学习柴胡疏肝散，掌握气机郁滞的调理之法。本章收集柴胡、香附、枳壳，复习川芎。',
    medicines: ['柴胡', '香附', '枳壳', '川芎'],
    formulas: ['柴胡疏肝散'],
    bossCaseId: 'case-qi-regulation',
    rewardSkill: 'qi_regulation',
    rewardSkillName: '理气解郁',
    unlockCondition: { completedChapters: ['chapter-6'] },
    wuxing: 'wood',
    difficulty: 3,
    isAvailable: true
  },

  // ===== 第8章：和解剂山谷 =====
  // 药物：柴胡(需补充)复用、黄芩(需补充)、半夏(需补充)、生姜(metal)复用
  // 方剂：小柴胡汤
  {
    id: 'chapter-8',
    sequence: 8,
    name: '和解剂山谷',
    category: '和解剂',
    description: '阴阳交汇的山谷，和解少阳药灵在此交融。学习小柴胡汤，掌握少阳证的治疗之法。本章收集黄芩，复习柴胡、半夏、生姜。',
    medicines: ['柴胡', '黄芩', '半夏', '生姜'],
    formulas: ['小柴胡汤'],
    bossCaseId: 'case-harmonizing',
    rewardSkill: 'harmonization',
    rewardSkillName: '和解少阳',
    unlockCondition: { completedChapters: ['chapter-7'] },
    wuxing: 'wood',
    difficulty: 3,
    isAvailable: false
  },

  // ===== 第9章：消食导滞剂山谷 =====
  // 药物：山楂(需补充)、神曲(需补充)、麦芽(需补充)、莱菔子(需补充)
  // 方剂：保和丸
  {
    id: 'chapter-9',
    sequence: 9,
    name: '消食剂山谷',
    category: '消食剂',
    description: '丰收的山谷，消食导滞药灵在此聚集。学习保和丸，掌握食积内停的消食之法。本章收集山楂、神曲、麦芽、莱菔子四味消食药。',
    medicines: ['山楂', '神曲', '麦芽', '莱菔子'],
    formulas: ['保和丸'],
    bossCaseId: 'case-digestion',
    rewardSkill: 'digestion_aid',
    rewardSkillName: '消食导滞',
    unlockCondition: { completedChapters: ['chapter-8'] },
    wuxing: 'earth',
    difficulty: 2,
    isAvailable: false
  },

  // ===== 第10章：驱虫消积剂山谷 =====
  // 药物：使君子(需补充)、槟榔(需补充)、乌梅(需补充)、川楝子(需补充)
  // 方剂：乌梅丸
  {
    id: 'chapter-10',
    sequence: 10,
    name: '驱虫剂山谷',
    category: '驱虫剂',
    description: '阴暗潮湿的山谷，驱虫消积药灵在此潜藏。学习乌梅丸，掌握虫积内生的驱虫之法。本章收集使君子、槟榔、乌梅、川楝子。',
    medicines: ['使君子', '槟榔', '乌梅', '川楝子'],
    formulas: ['乌梅丸'],
    bossCaseId: 'case-antiparasitic',
    rewardSkill: 'parasite_expel',
    rewardSkillName: '驱虫安蛔',
    unlockCondition: { completedChapters: ['chapter-9'] },
    wuxing: 'wood',
    difficulty: 2,
    isAvailable: false
  },

  // ===== 第11章：止血收敛剂山谷 =====
  // 药物：三七(需补充)、白及(需补充)、地榆(需补充)、槐花(需补充)
  // 方剂：十灰散、黄土汤
  {
    id: 'chapter-11',
    sequence: 11,
    name: '止血剂山谷',
    category: '止血药',
    description: '血红色的山谷，止血收敛药灵在此生长。学习十灰散、黄土汤，掌握各种出血证的治疗之法。本章收集三七、白及、地榆、槐花四味止血药。',
    medicines: ['三七', '白及', '地榆', '槐花'],
    formulas: ['十灰散', '黄土汤'],
    bossCaseId: 'case-hemostasis',
    rewardSkill: 'hemostasis_master',
    rewardSkillName: '止血圣手',
    unlockCondition: { completedChapters: ['chapter-10'] },
    wuxing: 'metal',
    difficulty: 3,
    isAvailable: false
  },

  // ===== 第12章：活血化瘀剂山谷 =====
  // 药物：川芎(wood)、当归(wood)、白芍(wood)、桃仁(需补充)
  // 方剂：血府逐瘀汤、温经汤
  {
    id: 'chapter-12',
    sequence: 12,
    name: '活血化瘀剂山谷',
    category: '理血剂',
    description: '紫色的山谷，活血化瘀药灵在此汇聚。学习血府逐瘀汤、温经汤，掌握瘀血内阻的活血之法。本章收集桃仁，复习川芎、当归、白芍。',
    medicines: ['川芎', '当归', '白芍', '桃仁'],
    formulas: ['血府逐瘀汤', '温经汤'],
    bossCaseId: 'case-blood-stasis',
    rewardSkill: 'blood_circulation',
    rewardSkillName: '活血通络',
    unlockCondition: { completedChapters: ['chapter-11'] },
    wuxing: 'fire',
    difficulty: 4,
    isAvailable: true
  },

  // ===== 第13章：化痰止咳平喘剂山谷 =====
  // 药物：半夏(需补充)、陈皮(需补充)、杏仁(需补充)、桔梗(需补充)
  // 方剂：二陈汤、清气化痰丸
  {
    id: 'chapter-13',
    sequence: 13,
    name: '化痰止咳平喘剂山谷',
    category: '祛痰剂',
    description: '云雾弥漫的山谷，化痰止咳药灵在此栖息。学习二陈汤、清气化痰丸，掌握痰湿阻肺的祛痰之法。本章收集杏仁、桔梗，复习半夏、陈皮。',
    medicines: ['半夏', '陈皮', '杏仁', '桔梗'],
    formulas: ['二陈汤', '清气化痰丸'],
    bossCaseId: 'case-phlegm',
    rewardSkill: 'phlegm_resolving',
    rewardSkillName: '化痰止咳',
    unlockCondition: { completedChapters: ['chapter-12'] },
    wuxing: 'metal',
    difficulty: 3,
    isAvailable: false
  },

  // ===== 第14章：安神定志剂山谷 =====
  // 药物：酸枣仁(需补充)、柏子仁(需补充)、远志(需补充)、茯苓(earth)复用
  // 方剂：酸枣仁汤、天王补心丹
  {
    id: 'chapter-14',
    sequence: 14,
    name: '安神剂山谷',
    category: '安神药',
    description: '静谧幽深的山谷，宁心安神药灵在此静修。学习酸枣仁汤、天王补心丹，掌握心神不宁的安神之法。本章收集酸枣仁、柏子仁、远志，复习茯苓。',
    medicines: ['酸枣仁', '柏子仁', '远志', '茯苓'],
    formulas: ['酸枣仁汤', '天王补心丹'],
    bossCaseId: 'case-sedative',
    rewardSkill: 'mind_calming',
    rewardSkillName: '安神定志',
    unlockCondition: { completedChapters: ['chapter-13'] },
    wuxing: 'fire',
    difficulty: 3,
    isAvailable: false
  },

  // ===== 第15章：平肝息风剂山谷 =====
  // 药物：天麻(需补充)、钩藤(需补充)、石决明(需补充)、牛膝(需补充)
  // 方剂：天麻钩藤饮、镇肝熄风汤
  {
    id: 'chapter-15',
    sequence: 15,
    name: '平肝息风剂山谷',
    category: '平肝息风药',
    description: '风啸山谷，平肝息风药灵在此镇守。学习天麻钩藤饮、镇肝熄风汤，掌握肝阳上亢、肝风内动的平肝之法。本章收集天麻、钩藤、石决明、牛膝。',
    medicines: ['天麻', '钩藤', '石决明', '牛膝'],
    formulas: ['天麻钩藤饮', '镇肝熄风汤'],
    bossCaseId: 'case-wind-calming',
    rewardSkill: 'wind_extinguishing',
    rewardSkillName: '平肝息风',
    unlockCondition: { completedChapters: ['chapter-14'] },
    wuxing: 'wood',
    difficulty: 4,
    isAvailable: false
  },

  // ===== 第16章：开窍醒神剂山谷 =====
  // 药物：麝香(需补充)、冰片(需补充)、苏合香(需补充)、石菖蒲(需补充)
  // 方剂：安宫牛黄丸、苏合香丸
  {
    id: 'chapter-16',
    sequence: 16,
    name: '开窍剂山谷',
    category: '开窍药',
    description: '神秘幽深的山谷，芳香开窍药灵在此沉睡。学习安宫牛黄丸、苏合香丸，掌握窍闭神昏的开窍之法。本章收集麝香、冰片、苏合香、石菖蒲。',
    medicines: ['麝香', '冰片', '苏合香', '石菖蒲'],
    formulas: ['安宫牛黄丸', '苏合香丸'],
    bossCaseId: 'case-orifice-opening',
    rewardSkill: 'orifice_opening',
    rewardSkillName: '开窍醒神',
    unlockCondition: { completedChapters: ['chapter-15'] },
    wuxing: 'fire',
    difficulty: 4,
    isAvailable: false
  },

  // ===== 第17章：补气健脾剂山谷 =====
  // 药物：人参(fire)、黄芪(earth)、白术(earth)、甘草(需补充)
  // 方剂：四君子汤、补中益气汤
  {
    id: 'chapter-17',
    sequence: 17,
    name: '补气剂山谷',
    category: '补益剂',
    description: '肥沃丰饶的山谷，补气健脾药灵在此繁茂。学习四君子汤、补中益气汤，掌握脾胃气虚的补气之法。本章收集甘草，复习人参、黄芪、白术。',
    medicines: ['人参', '黄芪', '白术', '甘草'],
    formulas: ['四君子汤', '补中益气汤'],
    bossCaseId: 'case-qi-tonic',
    rewardSkill: 'qi_tonic',
    rewardSkillName: '补气益脾',
    unlockCondition: { completedChapters: ['chapter-16'] },
    wuxing: 'earth',
    difficulty: 3,
    isAvailable: true
  },

  // ===== 第18章：补血养阴剂山谷 =====
  // 药物：当归(wood)、熟地黄(water)、白芍(wood)、川芎(wood)
  // 方剂：四物汤
  {
    id: 'chapter-18',
    sequence: 18,
    name: '补血剂山谷',
    category: '补益剂',
    description: '温润如玉的山谷，补血养阴药灵在此滋养。学习四物汤，掌握营血虚滞的补血之法。本章复习当归、熟地黄、白芍、川芎四味补血要药。',
    medicines: ['当归', '熟地黄', '白芍', '川芎'],
    formulas: ['四物汤'],
    bossCaseId: 'case-blood-tonic',
    rewardSkill: 'blood_tonic',
    rewardSkillName: '补血养血',
    unlockCondition: { completedChapters: ['chapter-17'] },
    wuxing: 'water',
    difficulty: 3,
    isAvailable: true
  },

  // ===== 第19章：补肾壮阳剂山谷 =====
  // 药物：鹿茸(需补充)、杜仲(需补充)、续断(需补充)、菟丝子(需补充)
  // 方剂：肾气丸、右归丸
  {
    id: 'chapter-19',
    sequence: 19,
    name: '补阳剂山谷',
    category: '补益剂',
    description: '阳光普照的山谷，补肾壮阳药灵在此升腾。学习肾气丸、右归丸，掌握肾阳虚衰的补阳之法。本章收集鹿茸、杜仲、续断、菟丝子。',
    medicines: ['鹿茸', '杜仲', '续断', '菟丝子'],
    formulas: ['肾气丸', '右归丸'],
    bossCaseId: 'case-yang-tonic',
    rewardSkill: 'yang_tonic',
    rewardSkillName: '补肾壮阳',
    unlockCondition: { completedChapters: ['chapter-18'] },
    wuxing: 'fire',
    difficulty: 4,
    isAvailable: false
  },

  // ===== 第20章：滋阴润燥剂山谷 =====
  // 药物：熟地黄(water)复用、山茱萸(需补充)、山药(需补充)、枸杞子(需补充)
  // 方剂：六味地黄丸、左归丸
  {
    id: 'chapter-20',
    sequence: 20,
    name: '补阴剂山谷',
    category: '补益剂',
    description: '清凉幽静的山谷，滋阴润燥药灵在此涵养。学习六味地黄丸、左归丸，掌握肾阴亏虚的补阴之法。本章收集山茱萸、山药、枸杞子，复习熟地黄。',
    medicines: ['熟地黄', '山茱萸', '山药', '枸杞子'],
    formulas: ['六味地黄丸', '左归丸'],
    bossCaseId: 'case-yin-tonic',
    rewardSkill: 'yin_tonic',
    rewardSkillName: '滋阴润燥',
    unlockCondition: { completedChapters: ['chapter-19'] },
    wuxing: 'water',
    difficulty: 4,
    isAvailable: false
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

/**
 * 已上线章节ID列表
 */
export const availableChapterIds = chapters
  .filter(ch => ch.isAvailable)
  .map(ch => ch.id);

/**
 * 获取章节进度百分比
 */
export function getChapterProgress(completedChapters: string[]): number {
  const available = getAvailableChapterCount();
  if (available === 0) return 0;
  const completed = completedChapters.filter(id => {
    const ch = getChapter(id);
    return ch && ch.isAvailable;
  }).length;
  return Math.round((completed / available) * 100);
}

export default chapters;

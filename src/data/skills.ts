// 技能数据定义
// 药灵山谷 v3.0 技能系统

export type SkillCategory = 'explore' | 'diagnosis' | 'memory' | 'wuxing' | 'chapter' | 'general';

export type SkillEffectType =
  | 'free_clue'
  | 'discount'
  | 'chapter_bonus'
  | 'extra_reward'
  | 'unlock_content'
  | 'hint_bonus'
  | 'affinity_boost'
  | 'wuxing_bonus';

export interface SkillEffect {
  type: SkillEffectType;
  target?: string; // 目标对象（如线索类型、章节ID等）
  value: number; // 效果数值
  description?: string; // 效果描述
}

export interface SkillUnlockCondition {
  chapter?: number; // 通关指定章节
  medicines?: string[]; // 收集指定药物
  formulas?: string[]; // 解锁指定方剂
  cases?: number; // 完成指定数量病案
  skillPoints?: number; // 需要技能点数
  totalMedicines?: number; // 收集药物总数
  totalAffinity?: number; // 总亲密度
  previousSkill?: string; // 前置技能
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  icon: string; // emoji
  maxLevel: number;
  effects: SkillEffect[];
  unlockCondition: SkillUnlockCondition;
  flavorText?: string; // 风味文本（引用经典）
}

// ==================== 探索类技能 ====================
const exploreSkills: Skill[] = [
  {
    id: 'keen_eye',
    name: '望气之眼',
    description: '开局自动获得"药图"线索，无需消耗钻石',
    category: 'explore',
    icon: '👁️',
    maxLevel: 1,
    effects: [
      {
        type: 'free_clue',
        target: 'image',
        value: 1,
        description: '开局自动获得药图线索',
      },
    ],
    unlockCondition: { chapter: 1 },
    flavorText: '"望而知之谓之神" ——《难经》',
  },
  {
    id: 'scent_recognition',
    name: '闻香识药',
    description: '"四气"线索价格降低50%',
    category: 'explore',
    icon: '👃',
    maxLevel: 3,
    effects: [
      { type: 'discount', target: 'fourQi', value: 0.5, description: '四气线索价格-50%' },
      { type: 'discount', target: 'fourQi', value: 0.65, description: '四气线索价格-35%' },
      { type: 'discount', target: 'fourQi', value: 0.8, description: '四气线索价格-20%' },
    ],
    unlockCondition: { totalMedicines: 10 },
    flavorText: '"闻而知之谓之圣" ——《难经》',
  },
  {
    id: 'meridian_insight',
    name: '经络洞察',
    description: '"归经"线索价格降低30%',
    category: 'explore',
    icon: '🔮',
    maxLevel: 3,
    effects: [
      { type: 'discount', target: 'meridian', value: 0.7, description: '归经线索价格-30%' },
      { type: 'discount', target: 'meridian', value: 0.8, description: '归经线索价格-20%' },
      { type: 'discount', target: 'meridian', value: 0.9, description: '归经线索价格-10%' },
    ],
    unlockCondition: { chapter: 5 },
    flavorText: '"经络所过，主治所及" ——《灵枢》',
  },
  {
    id: 'taste_mastery',
    name: '辨味精通',
    description: '"五味"线索价格降低25%',
    category: 'explore',
    icon: '👅',
    maxLevel: 3,
    effects: [
      { type: 'discount', target: 'fiveFlavors', value: 0.75, description: '五味线索价格-25%' },
      { type: 'discount', target: 'fiveFlavors', value: 0.85, description: '五味线索价格-15%' },
      { type: 'discount', target: 'fiveFlavors', value: 0.95, description: '五味线索价格-5%' },
    ],
    unlockCondition: { totalMedicines: 15 },
    flavorText: '"酸苦甘辛咸，五味入五脏" ——《素问》',
  },
];

// ==================== 章节专属技能 ====================
const chapterSkills: Skill[] = [
  {
    id: 'exterior_master',
    name: '解表大师',
    description: '解表剂章节奖励+50%',
    category: 'chapter',
    icon: '🌬️',
    maxLevel: 1,
    effects: [
      { type: 'chapter_bonus', target: 'exterior', value: 1.5, description: '解表剂章节奖励+50%' },
    ],
    unlockCondition: { chapter: 1 },
    flavorText: '"其在皮者，汗而发之" ——《素问》',
  },
  {
    id: 'heat_expert',
    name: '清热精通',
    description: '清热剂章节奖励+50%',
    category: 'chapter',
    icon: '🔥',
    maxLevel: 1,
    effects: [
      { type: 'chapter_bonus', target: 'heat', value: 1.5, description: '清热剂章节奖励+50%' },
    ],
    unlockCondition: { chapter: 2 },
    flavorText: '"热者寒之" ——《素问》',
  },
  {
    id: 'purgation_master',
    name: '泻下明辨',
    description: '泻下剂章节奖励+50%',
    category: 'chapter',
    icon: '💨',
    maxLevel: 1,
    effects: [
      { type: 'chapter_bonus', target: 'purgation', value: 1.5, description: '泻下剂章节奖励+50%' },
    ],
    unlockCondition: { chapter: 3 },
    flavorText: '"其下者，引而竭之" ——《素问》',
  },
  {
    id: 'wind_damp_expert',
    name: '风湿专精',
    description: '祛风湿剂章节奖励+50%',
    category: 'chapter',
    icon: '🌧️',
    maxLevel: 1,
    effects: [
      { type: 'chapter_bonus', target: 'wind-damp', value: 1.5, description: '祛风湿剂章节奖励+50%' },
    ],
    unlockCondition: { chapter: 4 },
    flavorText: '"风寒湿三气杂至，合而为痹" ——《素问》',
  },
  {
    id: 'dampness_transformer',
    name: '化湿妙手',
    description: '化湿剂章节奖励+50%',
    category: 'chapter',
    icon: '💧',
    maxLevel: 1,
    effects: [
      { type: 'chapter_bonus', target: 'dampness', value: 1.5, description: '化湿剂章节奖励+50%' },
    ],
    unlockCondition: { chapter: 5 },
    flavorText: '"诸湿肿满，皆属于脾" ——《素问》',
  },
  {
    id: 'water_expert',
    name: '利水通淋',
    description: '利水渗湿剂章节奖励+50%',
    category: 'chapter',
    icon: '💦',
    maxLevel: 1,
    effects: [
      { type: 'chapter_bonus', target: 'water', value: 1.5, description: '利水渗湿剂章节奖励+50%' },
    ],
    unlockCondition: { chapter: 6 },
    flavorText: '"膀胱者，州都之官，津液藏焉" ——《素问》',
  },
  {
    id: 'interior_warming',
    name: '温阳散寒',
    description: '温里剂章节奖励+50%',
    category: 'chapter',
    icon: '☀️',
    maxLevel: 1,
    effects: [
      { type: 'chapter_bonus', target: 'interior-warming', value: 1.5, description: '温里剂章节奖励+50%' },
    ],
    unlockCondition: { chapter: 7 },
    flavorText: '"寒者热之" ——《素问》',
  },
  {
    id: 'qi_regulating',
    name: '理气解郁',
    description: '理气剂章节奖励+50%',
    category: 'chapter',
    icon: '🌸',
    maxLevel: 1,
    effects: [
      { type: 'chapter_bonus', target: 'qi-regulating', value: 1.5, description: '理气剂章节奖励+50%' },
    ],
    unlockCondition: { chapter: 8 },
    flavorText: '"结者散之" ——《素问》',
  },
  {
    id: 'digestion_expert',
    name: '消食导滞',
    description: '消食剂章节奖励+50%',
    category: 'chapter',
    icon: '🍃',
    maxLevel: 1,
    effects: [
      { type: 'chapter_bonus', target: 'digestion', value: 1.5, description: '消食剂章节奖励+50%' },
    ],
    unlockCondition: { chapter: 9 },
    flavorText: '"五谷为养，五果为助" ——《素问》',
  },
  {
    id: 'parasite_expert',
    name: '驱虫安蛔',
    description: '驱虫剂章节奖励+50%',
    category: 'chapter',
    icon: '🐛',
    maxLevel: 1,
    effects: [
      { type: 'chapter_bonus', target: 'parasite', value: 1.5, description: '驱虫剂章节奖励+50%' },
    ],
    unlockCondition: { chapter: 10 },
    flavorText: '"蛔者，长虫也" ——《伤寒论》',
  },
  {
    id: 'hemmorhage_master',
    name: '止血圣手',
    description: '止血剂章节奖励+50%',
    category: 'chapter',
    icon: '🩸',
    maxLevel: 1,
    effects: [
      { type: 'chapter_bonus', target: 'hemostasis', value: 1.5, description: '止血剂章节奖励+50%' },
    ],
    unlockCondition: { chapter: 11 },
    flavorText: '"阳络伤则血外溢，阴络伤则血内溢" ——《灵枢》',
  },
  {
    id: 'blood_stasis_expert',
    name: '活血通络',
    description: '活血化瘀剂章节奖励+50%',
    category: 'chapter',
    icon: '💫',
    maxLevel: 1,
    effects: [
      { type: 'chapter_bonus', target: 'blood-stasis', value: 1.5, description: '活血化瘀剂章节奖励+50%' },
    ],
    unlockCondition: { chapter: 12 },
    flavorText: '"瘀血不去，新血不生" ——《医林改错》',
  },
  {
    id: 'phlegm_expert',
    name: '化痰止咳',
    description: '化痰止咳平喘剂章节奖励+50%',
    category: 'chapter',
    icon: '🫁',
    maxLevel: 1,
    effects: [
      { type: 'chapter_bonus', target: 'phlegm', value: 1.5, description: '化痰止咳平喘剂章节奖励+50%' },
    ],
    unlockCondition: { chapter: 13 },
    flavorText: '"脾为生痰之源，肺为储痰之器" ——《医宗必读》',
  },
  {
    id: 'tranquil_expert',
    name: '安神定志',
    description: '安神剂章节奖励+50%',
    category: 'chapter',
    icon: '😌',
    maxLevel: 1,
    effects: [
      { type: 'chapter_bonus', target: 'tranquilizing', value: 1.5, description: '安神剂章节奖励+50%' },
    ],
    unlockCondition: { chapter: 14 },
    flavorText: '"心藏神，主神明" ——《素问》',
  },
  {
    id: 'liver_pacifying',
    name: '平肝息风',
    description: '平肝息风剂章节奖励+50%',
    category: 'chapter',
    icon: '🌊',
    maxLevel: 1,
    effects: [
      { type: 'chapter_bonus', target: 'liver-pacifying', value: 1.5, description: '平肝息风剂章节奖励+50%' },
    ],
    unlockCondition: { chapter: 15 },
    flavorText: '"诸风掉眩，皆属于肝" ——《素问》',
  },
  {
    id: 'orifice_opening',
    name: '开窍醒神',
    description: '开窍剂章节奖励+50%',
    category: 'chapter',
    icon: '✨',
    maxLevel: 1,
    effects: [
      { type: 'chapter_bonus', target: 'orifice-opening', value: 1.5, description: '开窍剂章节奖励+50%' },
    ],
    unlockCondition: { chapter: 16 },
    flavorText: '"诸热之而寒者取之阳" ——《素问》',
  },
  {
    id: 'qi_tonic',
    name: '补气益脾',
    description: '补气剂章节奖励+50%',
    category: 'chapter',
    icon: '💪',
    maxLevel: 1,
    effects: [
      { type: 'chapter_bonus', target: 'qi-tonic', value: 1.5, description: '补气剂章节奖励+50%' },
    ],
    unlockCondition: { chapter: 17 },
    flavorText: '"正气存内，邪不可干" ——《素问》',
  },
  {
    id: 'blood_tonic',
    name: '补血养血',
    description: '补血剂章节奖励+50%',
    category: 'chapter',
    icon: '❤️',
    maxLevel: 1,
    effects: [
      { type: 'chapter_bonus', target: 'blood-tonic', value: 1.5, description: '补血剂章节奖励+50%' },
    ],
    unlockCondition: { chapter: 18 },
    flavorText: '"血主濡之" ——《难经》',
  },
  {
    id: 'yang_tonic',
    name: '补肾壮阳',
    description: '补阳剂章节奖励+50%',
    category: 'chapter',
    icon: '🔋',
    maxLevel: 1,
    effects: [
      { type: 'chapter_bonus', target: 'yang-tonic', value: 1.5, description: '补阳剂章节奖励+50%' },
    ],
    unlockCondition: { chapter: 19 },
    flavorText: '"肾者主蛰，封藏之本" ——《素问》',
  },
  {
    id: 'yin_tonic',
    name: '滋阴润燥',
    description: '补阴剂章节奖励+50%',
    category: 'chapter',
    icon: '🌙',
    maxLevel: 1,
    effects: [
      { type: 'chapter_bonus', target: 'yin-tonic', value: 1.5, description: '补阴剂章节奖励+50%' },
    ],
    unlockCondition: { chapter: 20 },
    flavorText: '"阴平阳秘，精神乃治" ——《素问》',
  },
];

// ==================== 通用技能 ====================
const generalSkills: Skill[] = [
  {
    id: 'socratic_wisdom',
    name: '顿悟之力',
    description: '首次提示免费，不消耗钻石',
    category: 'general',
    icon: '💡',
    maxLevel: 1,
    effects: [
      { type: 'hint_bonus', value: 1, description: '首次提示免费' },
    ],
    unlockCondition: { cases: 10 },
    flavorText: '"吾日三省吾身" ——《论语》',
  },
  {
    id: 'eidetic_memory',
    name: '过目不忘',
    description: '已收集药物复习时提示次数+1',
    category: 'general',
    icon: '📚',
    maxLevel: 3,
    effects: [
      { type: 'unlock_content', target: 'review_hints', value: 1, description: '复习提示+1' },
      { type: 'unlock_content', target: 'review_hints', value: 2, description: '复习提示+2' },
      { type: 'unlock_content', target: 'review_hints', value: 3, description: '复习提示+3' },
    ],
    unlockCondition: { totalMedicines: 30 },
    flavorText: '"温故而知新" ——《论语》',
  },
  {
    id: 'affinity_boost',
    name: '药灵亲和',
    description: '亲密度获取+20%',
    category: 'general',
    icon: '🤝',
    maxLevel: 3,
    effects: [
      { type: 'affinity_boost', value: 1.2, description: '亲密度获取+20%' },
      { type: 'affinity_boost', value: 1.35, description: '亲密度获取+35%' },
      { type: 'affinity_boost', value: 1.5, description: '亲密度获取+50%' },
    ],
    unlockCondition: { totalAffinity: 500 },
    flavorText: '"医道至精至微，非精诚不能及" ——《千金要方》',
  },
  {
    id: 'lucky_find',
    name: '机缘巧遇',
    description: '探索时10%几率额外获得钻石奖励',
    category: 'general',
    icon: '🍀',
    maxLevel: 3,
    effects: [
      { type: 'extra_reward', value: 0.1, description: '10%几率额外奖励' },
      { type: 'extra_reward', value: 0.15, description: '15%几率额外奖励' },
      { type: 'extra_reward', value: 0.2, description: '20%几率额外奖励' },
    ],
    unlockCondition: { chapter: 3 },
    flavorText: '"上医治未病，中医治欲病，下医治已病" ——《素问》',
  },
  {
    id: 'wuxing_harmony',
    name: '五行调和',
    description: '五行相克时奖励+25%',
    category: 'wuxing',
    icon: '☯️',
    maxLevel: 3,
    effects: [
      { type: 'wuxing_bonus', value: 1.25, description: '五行相克奖励+25%' },
      { type: 'wuxing_bonus', value: 1.35, description: '五行相克奖励+35%' },
      { type: 'wuxing_bonus', value: 1.5, description: '五行相克奖励+50%' },
    ],
    unlockCondition: { totalMedicines: 25 },
    flavorText: '"五行者，金木水火土也，更相生也" ——《孔子家语》',
  },
  {
    id: 'diagnosis_mastery',
    name: '望闻问切',
    description: '病案诊断时额外获得一次提示机会',
    category: 'diagnosis',
    icon: '🩺',
    maxLevel: 2,
    effects: [
      { type: 'hint_bonus', target: 'diagnosis', value: 1, description: '诊断提示+1' },
      { type: 'hint_bonus', target: 'diagnosis', value: 2, description: '诊断提示+2' },
    ],
    unlockCondition: { cases: 20 },
    flavorText: '"望而知之谓之神，闻而知之谓之圣，问而知之谓之工，切而知之谓之巧" ——《难经》',
  },
  {
    id: 'formula_intuition',
    name: '方剂直觉',
    description: '方剂解锁时有几率直接获得君臣佐使关系提示',
    category: 'memory',
    icon: '🧠',
    maxLevel: 2,
    effects: [
      { type: 'unlock_content', target: 'formula_hint', value: 0.3, description: '30%几率获得提示' },
      { type: 'unlock_content', target: 'formula_hint', value: 0.5, description: '50%几率获得提示' },
    ],
    unlockCondition: { formulas: ['麻黄汤', '桂枝汤'] },
    flavorText: '"君臣佐使，制方之要" ——《本草经集注》',
  },
  {
    id: 'herbal_scholar',
    name: '本草学者',
    description: '解锁隐藏药物故事和轶事',
    category: 'memory',
    icon: '📖',
    maxLevel: 1,
    effects: [
      { type: 'unlock_content', target: 'hidden_stories', value: 1, description: '解锁隐藏故事' },
    ],
    unlockCondition: { totalMedicines: 40 },
    flavorText: '"本草之学，博大精深" ——《本草纲目》',
  },
  {
    id: 'clinical_expert',
    name: '临床名家',
    description: '临床病案奖励+30%',
    category: 'diagnosis',
    icon: '👨‍⚕️',
    maxLevel: 2,
    effects: [
      { type: 'extra_reward', target: 'case', value: 1.3, description: '病案奖励+30%' },
      { type: 'extra_reward', target: 'case', value: 1.5, description: '病案奖励+50%' },
    ],
    unlockCondition: { cases: 50 },
    flavorText: '"大医精诚" ——《千金要方》',
  },
];

// ==================== 所有技能 ====================
export const allSkills: Skill[] = [
  ...exploreSkills,
  ...chapterSkills,
  ...generalSkills,
];

// 按分类获取技能
export function getSkillsByCategory(category: SkillCategory): Skill[] {
  return allSkills.filter((skill) => skill.category === category);
}

// 获取技能
export function getSkillById(id: string): Skill | undefined {
  return allSkills.find((skill) => skill.id === id);
}

// 获取可解锁技能（满足条件但未解锁）
export function getUnlockableSkills(
  unlockedSkills: string[],
  gameProgress: {
    completedChapters: number;
    totalMedicines: number;
    totalFormulas: number;
    completedCases: number;
    totalAffinity: number;
  }
): Skill[] {
  return allSkills.filter((skill) => {
    // 已解锁的跳过
    if (unlockedSkills.includes(skill.id)) return false;

    // 检查解锁条件
    const condition = skill.unlockCondition;

    if (condition.chapter && gameProgress.completedChapters < condition.chapter) {
      return false;
    }
    if (condition.totalMedicines && gameProgress.totalMedicines < condition.totalMedicines) {
      return false;
    }
    if (condition.cases && gameProgress.completedCases < condition.cases) {
      return false;
    }
    if (condition.totalAffinity && gameProgress.totalAffinity < condition.totalAffinity) {
      return false;
    }

    return true;
  });
}

// 检查技能是否可解锁
export function canUnlockSkill(
  skill: Skill,
  gameProgress: {
    completedChapters: number;
    totalMedicines: number;
    totalFormulas: number;
    completedCases: number;
    totalAffinity: number;
    unlockedSkills: string[];
  }
): boolean {
  const condition = skill.unlockCondition;

  if (condition.chapter && gameProgress.completedChapters < condition.chapter) {
    return false;
  }
  if (condition.totalMedicines && gameProgress.totalMedicines < condition.totalMedicines) {
    return false;
  }
  if (condition.cases && gameProgress.completedCases < condition.cases) {
    return false;
  }
  if (condition.totalAffinity && gameProgress.totalAffinity < condition.totalAffinity) {
    return false;
  }
  if (condition.previousSkill && !gameProgress.unlockedSkills.includes(condition.previousSkill)) {
    return false;
  }

  return true;
}

// 获取技能解锁条件描述
export function getUnlockConditionDescription(skill: Skill): string {
  const condition = skill.unlockCondition;
  const conditions: string[] = [];

  if (condition.chapter) {
    conditions.push(`通关第${condition.chapter}章`);
  }
  if (condition.totalMedicines) {
    conditions.push(`收集${condition.totalMedicines}味药`);
  }
  if (condition.cases) {
    conditions.push(`完成${condition.cases}个病案`);
  }
  if (condition.totalAffinity) {
    conditions.push(`总亲密度达${condition.totalAffinity}`);
  }
  if (condition.previousSkill) {
    const prevSkill = getSkillById(condition.previousSkill);
    conditions.push(`先解锁「${prevSkill?.name || condition.previousSkill}」`);
  }

  return conditions.join('，') || '初始解锁';
}

// 获取技能效果描述
export function getSkillEffectDescription(skill: Skill, level: number = 1): string {
  const effect = skill.effects[level - 1] || skill.effects[0];
  if (!effect) return '';

  switch (effect.type) {
    case 'free_clue':
      return `开局自动获得"${effect.target === 'image' ? '药图' : effect.target}"线索`;
    case 'discount':
      const discount = Math.round((1 - effect.value) * 100);
      return `"${effect.target}"线索价格-${discount}%`;
    case 'chapter_bonus':
      const bonus = Math.round((effect.value - 1) * 100);
      return `"${effect.target}"章节奖励+${bonus}%`;
    case 'extra_reward':
      if (effect.target === 'case') {
        const percent = Math.round((effect.value - 1) * 100);
        return `病案奖励+${percent}%`;
      }
      return `探索时${Math.round(effect.value * 100)}%几率获得额外奖励`;
    case 'hint_bonus':
      return `首次提示免费`;
    case 'unlock_content':
      if (effect.target === 'review_hints') {
        return `复习时提示+${effect.value}`;
      }
      if (effect.target === 'hidden_stories') {
        return '解锁隐藏药物故事';
      }
      return '解锁额外内容';
    case 'affinity_boost':
      const boost = Math.round((effect.value - 1) * 100);
      return `亲密度获取+${boost}%`;
    case 'wuxing_bonus':
      const wuxingBoost = Math.round((effect.value - 1) * 100);
      return `五行相克奖励+${wuxingBoost}%`;
    default:
      return effect.description || '';
  }
}

// 分类名称映射
export const categoryNames: Record<SkillCategory, { name: string; color: string; gradient: string }> = {
  explore: {
    name: '探索',
    color: '#4CAF50',
    gradient: 'from-green-500 to-emerald-600',
  },
  diagnosis: {
    name: '诊断',
    color: '#2196F3',
    gradient: 'from-blue-500 to-cyan-600',
  },
  memory: {
    name: '记忆',
    color: '#9C27B0',
    gradient: 'from-purple-500 to-pink-600',
  },
  wuxing: {
    name: '五行',
    color: '#FF9800',
    gradient: 'from-amber-500 to-orange-600',
  },
  chapter: {
    name: '章节',
    color: '#F44336',
    gradient: 'from-red-500 to-rose-600',
  },
  general: {
    name: '通用',
    color: '#607D8B',
    gradient: 'from-gray-500 to-slate-600',
  },
};

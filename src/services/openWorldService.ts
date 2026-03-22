import type { GeneratedEvent, EventType, EventDifficulty, OpenWorldRegion } from '../types/openWorld';

// 事件类型配置
const EVENT_TYPE_CONFIG: Record<EventType, { name: string; icon: string; color: string; bgColor: string }> = {
  case: {
    name: '病案求助',
    icon: '🏥',
    color: '#E53935',
    bgColor: 'rgba(229, 57, 53, 0.1)',
  },
  book: {
    name: '古籍发现',
    icon: '📜',
    color: '#FB8C00',
    bgColor: 'rgba(251, 140, 0, 0.1)',
  },
  spirit: {
    name: '药灵对话',
    icon: '👻',
    color: '#8E24AA',
    bgColor: 'rgba(142, 36, 170, 0.1)',
  },
  bounty: {
    name: '追缉令',
    icon: '⚔️',
    color: '#1E88E5',
    bgColor: 'rgba(30, 136, 229, 0.1)',
  },
  plague: {
    name: '瘟疫爆发',
    icon: '☠️',
    color: '#546E7A',
    bgColor: 'rgba(84, 110, 122, 0.1)',
  },
};

// 事件池（预设事件模板）
const EVENT_TEMPLATES: Partial<GeneratedEvent>[] = [
  // 病案求助
  {
    type: 'case',
    title: '风寒表虚证的困扰',
    description: '村口的王大爷来求医，说最近总怕风，稍微一动就出汗，还老是头痛。你给他把脉，脉浮缓。王大爷愁眉苦脸地说："大夫，我这毛病反反复复，该用什么方子啊？"',
    difficulty: 2,
    requirements: { medicines: ['桂枝', '白芍'], formulas: ['桂枝汤'] },
    rewards: { diamonds: 200, skillPoints: 1 },
    data: {
      patientInfo: '王大爷，男，65岁',
      symptoms: ['怕风', '汗出', '头痛'],
      pulse: '脉浮缓',
      correctTreatment: '解肌发表',
      correctFormula: '桂枝汤',
      correctJun: '桂枝',
    },
  },
  {
    type: 'case',
    title: '脾胃不和的烦恼',
    description: '李婶子抱着肚子来找你，说吃了东西就胃胀，还经常拉肚子。你看她面色萎黄，舌苔白腻，脉濡缓。她说："大夫，我是不是脾胃出了毛病？"',
    difficulty: 3,
    requirements: { medicines: ['白术', '茯苓', '党参'], formulas: ['四君子汤'] },
    rewards: { diamonds: 300, skillPoints: 1 },
    data: {
      patientInfo: '李婶子，女，45岁',
      symptoms: ['食后胃胀', '腹泻', '面色萎黄'],
      tongue: '舌苔白腻',
      pulse: '脉濡缓',
      correctTreatment: '益气健脾',
      correctFormula: '四君子汤',
      correctJun: '人参',
    },
  },
  {
    type: 'case',
    title: '外感风寒表实证',
    description: '张猎户冒着风雪而来，说自己恶寒发热，浑身疼痛，还喘不上气。你诊脉发现脉浮紧，问他有没有汗，他说一滴汗都没有。',
    difficulty: 2,
    requirements: { medicines: ['麻黄', '桂枝'], formulas: ['麻黄汤'] },
    rewards: { diamonds: 250, skillPoints: 1 },
    data: {
      patientInfo: '张猎户，男，38岁',
      symptoms: ['恶寒发热', '身疼痛', '无汗而喘'],
      pulse: '脉浮紧',
      correctTreatment: '发汗解表',
      correctFormula: '麻黄汤',
      correctJun: '麻黄',
    },
  },
  // 古籍发现
  {
    type: 'book',
    title: '残缺的《伤寒论》',
    description: '在山谷深处发现一页残破的医书，上面记载着："太阳中风，阳浮而阴弱..."后面的内容已经模糊不清。你能补全这段经典吗？',
    difficulty: 3,
    rewards: { diamonds: 150, title: '古籍修复者' },
    data: {
      bookContent: '太阳中风，阳浮而阴弱...',
      questions: [{
        question: '《伤寒论》中"阳浮而阴弱"指的是什么？',
        options: ['阳气浮于外，阴气弱于内', '太阳经阳气浮盛', '阴阳俱虚', '阳盛阴衰'],
        correctIndex: 0,
      }],
    },
  },
  {
    type: 'book',
    title: '《本草纲目》残页',
    description: '在一棵古树下发现一页《本草纲目》残页，记载着某味药的性味归经，但药名已经磨损不清。根据描述猜猜这是什么药？',
    difficulty: 2,
    rewards: { diamonds: 100 },
    data: {
      bookContent: '此药味辛、微苦，性温。入肺、膀胱经。能发汗解表，宣肺平喘...',
      questions: [{
        question: '根据描述，这是什么药？',
        options: ['桂枝', '麻黄', '紫苏', '生姜'],
        correctIndex: 1,
      }],
    },
  },
  // 药灵对话
  {
    type: 'spirit',
    title: '桂枝的自白',
    description: '药灵桂枝出现在你面前，轻声说道："我是桂枝，生于桂树之梢，长于春风之中。你能告诉我，我最大的本领是什么吗？"',
    difficulty: 1,
    requirements: { medicines: ['桂枝'] },
    rewards: { diamonds: 100, affinityBonus: 20 },
    data: {
      spiritId: 'guizhi',
      dialogues: [
        { speaker: 'spirit', content: '我是桂枝，生于桂树之梢...' },
        { speaker: 'player', content: '您能解肌发表、温通经脉。' },
        { speaker: 'spirit', content: '不错！你懂我。' },
      ],
    },
  },
  {
    type: 'spirit',
    title: '人参的考问',
    description: '千年人参化作老者模样，捋着胡须问你："小友，老夫大补元气，但你知道什么时候不能用我吗？"',
    difficulty: 2,
    requirements: { medicines: ['人参'] },
    rewards: { diamonds: 200, affinityBonus: 30 },
    data: {
      spiritId: 'renshen',
      dialogues: [
        { speaker: 'spirit', content: '小友，老夫大补元气...' },
        { speaker: 'player', content: '实热证、湿热证不宜用人参。' },
        { speaker: 'spirit', content: '善哉！实证忌补，切记切记。' },
      ],
    },
  },
  // 追缉令
  {
    type: 'bounty',
    title: '采集五味子的任务',
    description: '药铺掌柜发布追缉令：急需五味子十斤，用于配制生脉散。谁能采集到五味子，重重有赏！',
    difficulty: 2,
    requirements: { medicines: ['五味子'] },
    rewards: { diamonds: 400, newSkill: '采药专精' },
    data: {
      targetFormula: '生脉散',
    },
  },
  {
    type: 'bounty',
    title: '寻找稀有灵芝',
    description: '山谷深处有千年灵芝现世，各大医馆竞相求购。谁能找到这株灵芝，将获得传说中的"寻药圣手"称号！',
    difficulty: 4,
    requirements: { medicines: ['灵芝'], skills: ['望气之眼'] },
    rewards: { diamonds: 800, title: '寻药圣手' },
    data: {
      targetFormula: '灵芝丸',
    },
  },
  // 瘟疫爆发
  {
    type: 'plague',
    title: '春季瘟疫',
    description: '村中突然爆发瘟疫，许多村民发热头痛、咳嗽不止。作为山谷中的医者，你必须在日落前找出病因并开出方剂！',
    difficulty: 4,
    timeLimit: 30,
    rewards: { diamonds: 600, title: '济世神医' },
    data: {
      plagueType: '风热感冒',
      symptoms: ['发热', '头痛', '咳嗽', '咽痛'],
      correctTreatment: '辛凉解表',
      correctFormula: '银翘散',
    },
  },
];

// 开放世界区域配置
export const OPEN_WORLD_REGIONS: OpenWorldRegion[] = [
  {
    id: 'qingmu_lin',
    name: '青木林',
    chapterId: 'chapter_1',
    wuxing: 'wood',
    description: '水晶竹林深处，万物生发之地',
    backgroundImage: '/images/scenes/wood.jpg',
    unlockCondition: { completedChapters: ['chapter_1'] },
    unlocked: false,
  },
  {
    id: 'chiyan_feng',
    name: '赤焰峰',
    chapterId: 'chapter_2',
    wuxing: 'fire',
    description: '红色水晶熔岩之地，心火所归',
    backgroundImage: '/images/scenes/fire.jpg',
    unlockCondition: { completedChapters: ['chapter_2'] },
    unlocked: false,
  },
  {
    id: 'huangtu_qiu',
    name: '黄土丘',
    chapterId: 'chapter_3',
    wuxing: 'earth',
    description: '金色麦田环绕，脾土运化之所',
    backgroundImage: '/images/scenes/earth.jpg',
    unlockCondition: { completedChapters: ['chapter_3'] },
    unlocked: false,
  },
  {
    id: 'baijin_yuan',
    name: '白金原',
    chapterId: 'chapter_4',
    wuxing: 'metal',
    description: '银色桦林，肺金肃降之地',
    backgroundImage: '/images/scenes/metal.jpg',
    unlockCondition: { completedChapters: ['chapter_4'] },
    unlocked: false,
  },
  {
    id: 'heishui_tan',
    name: '黑水潭',
    chapterId: 'chapter_5',
    wuxing: 'water',
    description: '黑曜石深潭，肾水藏精之所',
    backgroundImage: '/images/scenes/water.jpg',
    unlockCondition: { completedChapters: ['chapter_5'] },
    unlocked: false,
  },
];

// 获取事件类型配置
export function getEventTypeConfig(type: EventType) {
  return EVENT_TYPE_CONFIG[type];
}

// 获取难度标签
export function getDifficultyLabel(difficulty: EventDifficulty): string {
  const labels: Record<EventDifficulty, string> = {
    1: '简单',
    2: '普通',
    3: '困难',
    4: '专家',
    5: '大师',
  };
  return labels[difficulty];
}

// 获取难度颜色
export function getDifficultyColor(difficulty: EventDifficulty): string {
  const colors: Record<EventDifficulty, string> = {
    1: '#4CAF50',
    2: '#2196F3',
    3: '#FF9800',
    4: '#F44336',
    5: '#9C27B0',
  };
  return colors[difficulty];
}

// 生成每日事件
export function generateDailyEvents(
  unlockedRegions: string[],
  collectedMedicines: string[],
  date: string
): GeneratedEvent[] {
  const events: GeneratedEvent[] = [];
  const eventCount = Math.floor(Math.random() * 3) + 3; // 3-5个事件

  // 从模板中随机选择
  const shuffledTemplates = [...EVENT_TEMPLATES].sort(() => Math.random() - 0.5);

  for (let i = 0; i < eventCount && i < shuffledTemplates.length; i++) {
    const template = shuffledTemplates[i];
    const regionId = unlockedRegions[Math.floor(Math.random() * unlockedRegions.length)];

    // 检查药物要求是否满足
    const requirements = template.requirements;
    if (requirements?.medicines) {
      const hasRequiredMedicines = requirements.medicines.some(m =>
        collectedMedicines.includes(m)
      );
      if (!hasRequiredMedicines && template.difficulty && template.difficulty > 1) {
        continue; // 跳过要求不满足的高难度事件
      }
    }

    const event: GeneratedEvent = {
      id: `event_${date}_${i}`,
      type: template.type as EventType,
      title: template.title || '',
      description: template.description || '',
      difficulty: (template.difficulty as EventDifficulty) || 1,
      regionId: regionId || 'qingmu_lin',
      requirements: template.requirements,
      rewards: template.rewards || { diamonds: 100 },
      timeLimit: template.timeLimit,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      data: template.data,
      accepted: false,
      completed: false,
    };

    events.push(event);
  }

  return events;
}

// 检查开放世界是否解锁（完成5章）
export function checkOpenWorldUnlock(completedChapters: string[]): boolean {
  return completedChapters.length >= 5;
}

// 获取已解锁区域
export function getUnlockedRegions(completedChapters: string[]): OpenWorldRegion[] {
  return OPEN_WORLD_REGIONS.map(region => ({
    ...region,
    unlocked: region.unlockCondition.completedChapters.every(chapter =>
      completedChapters.includes(chapter)
    ),
  })).filter(region => region.unlocked);
}

// AI生成事件（预留接口）
export async function generateAIEvent(
  eventType: EventType,
  playerContext: {
    collectedMedicines: string[];
    unlockedFormulas: string[];
    completedChapters: string[];
  }
): Promise<GeneratedEvent | null> {
  // TODO: 调用AI服务生成事件
  // 这里返回null作为占位符
  console.log('AI事件生成:', eventType, playerContext);
  return null;
}

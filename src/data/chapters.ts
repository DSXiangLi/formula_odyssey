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

import { Chapter } from '../types/chapter';
import { WuxingType, StageType } from '../types';

/**
 * 20章完整数据 - v3.0格式
 */
export const chapters: Chapter[] = [
  // ===== 第1章：解表剂山谷 =====
  {
    id: 'chapter-1',
    chapterNumber: 1,
    title: '解表剂山谷',
    subtitle: '第一章·解表剂',
    wuxing: WuxingType.Metal,
    description: '药灵山谷的第一站，这里生长着解表发散的药灵。学习麻黄汤、桂枝汤等经典解表方剂，掌握风寒表证的治疗要领。本章收集麻黄、桂枝、紫苏、生姜四味解表要药。',
    unlockRequirements: [],
    stages: [
      { id: 'c1-intro', type: StageType.Intro, title: '师导入门', description: '青木先生介绍本章学习目标', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c1-gathering', type: StageType.Gathering, title: '山谷采药', description: '探索山谷，寻找麻黄、桂枝等解表药材', requiredMedicines: ['麻黄', '桂枝', '紫苏', '生姜'],
        unlockRequirements: [] },
      { id: 'c1-battle', type: StageType.Battle, title: '药灵守护', description: '通过战斗巩固解表药材知识', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c1-formula', type: StageType.Formula, title: '方剂学习', description: '学习麻黄汤和桂枝汤的组成与功效', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c1-clinical', type: StageType.Clinical, title: '临床考核', description: '完成表证病案分析考核', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c1-mastery', type: StageType.Mastery, title: '融会贯通', description: '总结本章收获，获得望气之眼技能', requiredMedicines: [],
        unlockRequirements: [] },
    ],
    medicines: ['麻黄', '桂枝', '紫苏', '生姜'],
    formulas: ['麻黄汤', '桂枝汤'],
    isUnlocked: true,
    isCompleted: false,
    masteryScore: 0,
  },

  // ===== 第2章：清热剂山谷 =====
  {
    id: 'chapter-2',
    chapterNumber: 2,
    title: '清热剂山谷',
    subtitle: '第二章·清热剂',
    wuxing: WuxingType.Water,
    description: '炎夏般的山谷，清热泻火药灵在此生长。学习白虎汤等清热方剂，掌握气分实热证的治疗。本章收集石膏、知母、金银花、连翘四味清热要药。',
    unlockRequirements: ['chapter-1'],
    stages: [
      { id: 'c2-intro', type: StageType.Intro, title: '师导入门', description: '青木先生介绍清热剂学习重点', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c2-gathering', type: StageType.Gathering, title: '炎夏采药', description: '探索炎夏山谷，寻找清热药材', requiredMedicines: ['石膏', '知母', '金银花', '连翘'],
        unlockRequirements: [] },
      { id: 'c2-battle', type: StageType.Battle, title: '药灵守护', description: '通过战斗巩固清热药材知识', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c2-formula', type: StageType.Formula, title: '方剂学习', description: '学习白虎汤和黄连解毒汤', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c2-clinical', type: StageType.Clinical, title: '临床考核', description: '完成热证病案分析考核', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c2-mastery', type: StageType.Mastery, title: '融会贯通', description: '总结本章收获，获得清热精通技能', requiredMedicines: [],
        unlockRequirements: [] },
    ],
    medicines: ['石膏', '知母', '金银花', '连翘'],
    formulas: ['白虎汤', '黄连解毒汤'],
    isUnlocked: false,
    isCompleted: false,
    masteryScore: 0,
  },

  // ===== 第3章：泻下剂山谷 =====
  {
    id: 'chapter-3',
    chapterNumber: 3,
    title: '泻下剂山谷',
    subtitle: '第三章·泻下剂',
    wuxing: WuxingType.Earth,
    description: '地势险峻的山谷，泻下攻积药灵栖居于此。学习大承气汤等泻下方剂，掌握实热积滞的攻下之法。本章收集大黄、芒硝两味泻下峻药。',
    unlockRequirements: ['chapter-2'],
    stages: [
      { id: 'c3-intro', type: StageType.Intro, title: '师导入门', description: '青木先生介绍泻下剂使用要点', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c3-gathering', type: StageType.Gathering, title: '险峻采药', description: '探索险峻山谷，寻找泻下药材', requiredMedicines: ['大黄', '芒硝'],
        unlockRequirements: [] },
      { id: 'c3-battle', type: StageType.Battle, title: '药灵守护', description: '通过战斗巩固泻下药材知识', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c3-formula', type: StageType.Formula, title: '方剂学习', description: '学习大承气汤的组成与应用', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c3-clinical', type: StageType.Clinical, title: '临床考核', description: '完成实热积滞病案分析考核', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c3-mastery', type: StageType.Mastery, title: '融会贯通', description: '总结本章收获，获得泻下明辨技能', requiredMedicines: [],
        unlockRequirements: [] },
    ],
    medicines: ['大黄', '芒硝'],
    formulas: ['大承气汤'],
    isUnlocked: false,
    isCompleted: false,
    masteryScore: 0,
  },

  // ===== 第4章：利水渗湿剂山谷 =====
  {
    id: 'chapter-4',
    chapterNumber: 4,
    title: '利水渗湿剂山谷',
    subtitle: '第四章·利水渗湿剂',
    wuxing: WuxingType.Water,
    description: '雾气缭绕的山谷，利水渗湿药灵在此繁衍。学习五苓散，掌握水湿内停的调理之道。本章收集茯苓、白术、泽泻、猪苓。',
    unlockRequirements: ['chapter-3'],
    stages: [
      { id: 'c4-intro', type: StageType.Intro, title: '师导入门', description: '青木先生介绍利水渗湿原理', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c4-gathering', type: StageType.Gathering, title: '雾中采药', description: '探索雾气山谷，寻找利水渗湿药材', requiredMedicines: ['茯苓', '白术', '泽泻', '猪苓'],
        unlockRequirements: [] },
      { id: 'c4-battle', type: StageType.Battle, title: '药灵守护', description: '通过战斗巩固利水药材知识', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c4-formula', type: StageType.Formula, title: '方剂学习', description: '学习五苓散的组成与应用', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c4-clinical', type: StageType.Clinical, title: '临床考核', description: '完成水湿内停病案分析考核', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c4-mastery', type: StageType.Mastery, title: '融会贯通', description: '总结本章收获，获得利水通淋技能', requiredMedicines: [],
        unlockRequirements: [] },
    ],
    medicines: ['茯苓', '白术', '泽泻', '猪苓'],
    formulas: ['五苓散'],
    isUnlocked: false,
    isCompleted: false,
    masteryScore: 0,
  },

  // ===== 第5章：化湿剂山谷 =====
  {
    id: 'chapter-5',
    chapterNumber: 5,
    title: '化湿剂山谷',
    subtitle: '第五章·化湿剂',
    wuxing: WuxingType.Earth,
    description: '湿润多雾的山谷，燥湿运脾药灵在此等候。学习平胃散、二陈汤，掌握湿滞脾胃的治疗之法。本章收集苍术、厚朴、陈皮、半夏四味化湿要药。',
    unlockRequirements: ['chapter-4'],
    stages: [
      { id: 'c5-intro', type: StageType.Intro, title: '师导入门', description: '青木先生介绍化湿剂学习方法', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c5-gathering', type: StageType.Gathering, title: '湿谷采药', description: '探索湿润山谷，寻找化湿药材', requiredMedicines: ['苍术', '厚朴', '陈皮', '半夏'],
        unlockRequirements: [] },
      { id: 'c5-battle', type: StageType.Battle, title: '药灵守护', description: '通过战斗巩固化湿药材知识', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c5-formula', type: StageType.Formula, title: '方剂学习', description: '学习平胃散和二陈汤', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c5-clinical', type: StageType.Clinical, title: '临床考核', description: '完成湿滞脾胃病案分析考核', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c5-mastery', type: StageType.Mastery, title: '融会贯通', description: '总结本章收获，获得化湿妙手技能', requiredMedicines: [],
        unlockRequirements: [] },
    ],
    medicines: ['苍术', '厚朴', '陈皮', '半夏'],
    formulas: ['平胃散', '二陈汤'],
    isUnlocked: false,
    isCompleted: false,
    masteryScore: 0,
  },

  // ===== 第6章：温里剂山谷 =====
  {
    id: 'chapter-6',
    chapterNumber: 6,
    title: '温里剂山谷',
    subtitle: '第六章·温里剂',
    wuxing: WuxingType.Fire,
    description: '常年积雪的山谷，温阳散寒药灵在此蛰伏。学习四逆汤、理中丸，掌握阳虚寒证的救治之法。本章收集附子、干姜，复习桂枝、白术。',
    unlockRequirements: ['chapter-5'],
    stages: [
      { id: 'c6-intro', type: StageType.Intro, title: '师导入门', description: '青木先生介绍温里剂急救应用', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c6-gathering', type: StageType.Gathering, title: '雪谷采药', description: '探索积雪山谷，寻找温阳散寒药材', requiredMedicines: ['附子', '干姜', '桂枝', '白术'],
        unlockRequirements: [] },
      { id: 'c6-battle', type: StageType.Battle, title: '药灵守护', description: '通过战斗巩固温里药材知识', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c6-formula', type: StageType.Formula, title: '方剂学习', description: '学习四逆汤和理中丸', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c6-clinical', type: StageType.Clinical, title: '临床考核', description: '完成阳虚寒证病案分析考核', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c6-mastery', type: StageType.Mastery, title: '融会贯通', description: '总结本章收获，获得温阳散寒技能', requiredMedicines: [],
        unlockRequirements: [] },
    ],
    medicines: ['附子', '干姜', '桂枝', '白术'],
    formulas: ['四逆汤', '理中丸'],
    isUnlocked: false,
    isCompleted: false,
    masteryScore: 0,
  },

  // ===== 第7章：理气剂山谷 =====
  {
    id: 'chapter-7',
    chapterNumber: 7,
    title: '理气剂山谷',
    subtitle: '第七章·理气剂',
    wuxing: WuxingType.Wood,
    description: '云雾缭绕的山谷，行气解郁药灵在此穿行。学习柴胡疏肝散，掌握气机郁滞的调理之法。本章收集柴胡、香附、枳壳，复习川芎。',
    unlockRequirements: ['chapter-6'],
    stages: [
      { id: 'c7-intro', type: StageType.Intro, title: '师导入门', description: '青木先生介绍理气剂调理气机', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c7-gathering', type: StageType.Gathering, title: '云谷采药', description: '探索云雾山谷，寻找理气药材', requiredMedicines: ['柴胡', '香附', '枳壳', '川芎'],
        unlockRequirements: [] },
      { id: 'c7-battle', type: StageType.Battle, title: '药灵守护', description: '通过战斗巩固理气药材知识', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c7-formula', type: StageType.Formula, title: '方剂学习', description: '学习柴胡疏肝散的组成', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c7-clinical', type: StageType.Clinical, title: '临床考核', description: '完成气机郁滞病案分析考核', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c7-mastery', type: StageType.Mastery, title: '融会贯通', description: '总结本章收获，获得理气解郁技能', requiredMedicines: [],
        unlockRequirements: [] },
    ],
    medicines: ['柴胡', '香附', '枳壳', '川芎'],
    formulas: ['柴胡疏肝散'],
    isUnlocked: false,
    isCompleted: false,
    masteryScore: 0,
  },

  // ===== 第8章：和解剂山谷 =====
  {
    id: 'chapter-8',
    chapterNumber: 8,
    title: '和解剂山谷',
    subtitle: '第八章·和解剂',
    wuxing: WuxingType.Wood,
    description: '阴阳交汇的山谷，和解少阳药灵在此交融。学习小柴胡汤，掌握少阳证的治疗之法。本章收集黄芩，复习柴胡、半夏、生姜。',
    unlockRequirements: ['chapter-7'],
    stages: [
      { id: 'c8-intro', type: StageType.Intro, title: '师导入门', description: '青木先生介绍和解少阳原理', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c8-gathering', type: StageType.Gathering, title: '交汇采药', description: '探索阴阳交汇山谷，寻找和解药材', requiredMedicines: ['柴胡', '黄芩', '半夏', '生姜'],
        unlockRequirements: [] },
      { id: 'c8-battle', type: StageType.Battle, title: '药灵守护', description: '通过战斗巩固和解药材知识', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c8-formula', type: StageType.Formula, title: '方剂学习', description: '学习小柴胡汤的组成与应用', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c8-clinical', type: StageType.Clinical, title: '临床考核', description: '完成少阳证病案分析考核', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c8-mastery', type: StageType.Mastery, title: '融会贯通', description: '总结本章收获，获得和解少阳技能', requiredMedicines: [],
        unlockRequirements: [] },
    ],
    medicines: ['柴胡', '黄芩', '半夏', '生姜'],
    formulas: ['小柴胡汤'],
    isUnlocked: false,
    isCompleted: false,
    masteryScore: 0,
  },

  // ===== 第9章：消食剂山谷 =====
  {
    id: 'chapter-9',
    chapterNumber: 9,
    title: '消食剂山谷',
    subtitle: '第九章·消食剂',
    wuxing: WuxingType.Earth,
    description: '丰收的山谷，消食导滞药灵在此聚集。学习保和丸，掌握食积内停的消食之法。本章收集山楂、神曲、麦芽、莱菔子四味消食药。',
    unlockRequirements: ['chapter-8'],
    stages: [
      { id: 'c9-intro', type: StageType.Intro, title: '师导入门', description: '青木先生介绍消食导滞原理', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c9-gathering', type: StageType.Gathering, title: '丰收采药', description: '探索丰收山谷，寻找消食药材', requiredMedicines: ['山楂', '神曲', '麦芽', '莱菔子'],
        unlockRequirements: [] },
      { id: 'c9-battle', type: StageType.Battle, title: '药灵守护', description: '通过战斗巩固消食药知识', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c9-formula', type: StageType.Formula, title: '方剂学习', description: '学习保和丸的组成与应用', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c9-clinical', type: StageType.Clinical, title: '临床考核', description: '完成食积内停病案分析考核', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c9-mastery', type: StageType.Mastery, title: '融会贯通', description: '总结本章收获，获得消食导滞技能', requiredMedicines: [],
        unlockRequirements: [] },
    ],
    medicines: ['山楂', '神曲', '麦芽', '莱菔子'],
    formulas: ['保和丸'],
    isUnlocked: false,
    isCompleted: false,
    masteryScore: 0,
  },

  // ===== 第10章：驱虫剂山谷 =====
  {
    id: 'chapter-10',
    chapterNumber: 10,
    title: '驱虫剂山谷',
    subtitle: '第十章·驱虫剂',
    wuxing: WuxingType.Wood,
    description: '阴暗潮湿的山谷，驱虫消积药灵在此潜藏。学习乌梅丸，掌握虫积内生的驱虫之法。本章收集使君子、槟榔、乌梅、川楝子。',
    unlockRequirements: ['chapter-9'],
    stages: [
      { id: 'c10-intro', type: StageType.Intro, title: '师导入门', description: '青木先生介绍驱虫剂使用方法', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c10-gathering', type: StageType.Gathering, title: '暗谷采药', description: '探索阴暗山谷，寻找驱虫药材', requiredMedicines: ['使君子', '槟榔', '乌梅', '川楝子'],
        unlockRequirements: [] },
      { id: 'c10-battle', type: StageType.Battle, title: '药灵守护', description: '通过战斗巩固驱虫药材知识', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c10-formula', type: StageType.Formula, title: '方剂学习', description: '学习乌梅丸的组成与应用', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c10-clinical', type: StageType.Clinical, title: '临床考核', description: '完成虫积病案分析考核', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c10-mastery', type: StageType.Mastery, title: '融会贯通', description: '总结本章收获，获得驱虫安蛔技能', requiredMedicines: [],
        unlockRequirements: [] },
    ],
    medicines: ['使君子', '槟榔', '乌梅', '川楝子'],
    formulas: ['乌梅丸'],
    isUnlocked: false,
    isCompleted: false,
    masteryScore: 0,
  },

  // ===== 第11章：止血剂山谷 =====
  {
    id: 'chapter-11',
    chapterNumber: 11,
    title: '止血剂山谷',
    subtitle: '第十一章·止血剂',
    wuxing: WuxingType.Metal,
    description: '血红色的山谷，止血收敛药灵在此生长。学习十灰散、黄土汤，掌握各种出血证的治疗之法。本章收集三七、白及、地榆、槐花四味止血药。',
    unlockRequirements: ['chapter-10'],
    stages: [
      { id: 'c11-intro', type: StageType.Intro, title: '师导入门', description: '青木先生介绍止血剂分类应用', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c11-gathering', type: StageType.Gathering, title: '血谷采药', description: '探索血红色山谷，寻找止血药材', requiredMedicines: ['三七', '白及', '地榆', '槐花'],
        unlockRequirements: [] },
      { id: 'c11-battle', type: StageType.Battle, title: '药灵守护', description: '通过战斗巩固止血药材知识', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c11-formula', type: StageType.Formula, title: '方剂学习', description: '学习十灰散和黄土汤', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c11-clinical', type: StageType.Clinical, title: '临床考核', description: '完成出血证病案分析考核', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c11-mastery', type: StageType.Mastery, title: '融会贯通', description: '总结本章收获，获得止血圣手技能', requiredMedicines: [],
        unlockRequirements: [] },
    ],
    medicines: ['三七', '白及', '地榆', '槐花'],
    formulas: ['十灰散', '黄土汤'],
    isUnlocked: false,
    isCompleted: false,
    masteryScore: 0,
  },

  // ===== 第12章：活血化瘀剂山谷 =====
  {
    id: 'chapter-12',
    chapterNumber: 12,
    title: '活血化瘀剂山谷',
    subtitle: '第十二章·理血剂',
    wuxing: WuxingType.Fire,
    description: '紫色的山谷，活血化瘀药灵在此汇聚。学习血府逐瘀汤、温经汤，掌握瘀血内阻的活血之法。本章收集桃仁，复习川芎、当归、白芍。',
    unlockRequirements: ['chapter-11'],
    stages: [
      { id: 'c12-intro', type: StageType.Intro, title: '师导入门', description: '青木先生介绍活血化瘀原理', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c12-gathering', type: StageType.Gathering, title: '紫谷采药', description: '探索紫色山谷，寻找活血化瘀药材', requiredMedicines: ['川芎', '当归', '白芍', '桃仁'],
        unlockRequirements: [] },
      { id: 'c12-battle', type: StageType.Battle, title: '药灵守护', description: '通过战斗巩固活血药材知识', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c12-formula', type: StageType.Formula, title: '方剂学习', description: '学习血府逐瘀汤和温经汤', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c12-clinical', type: StageType.Clinical, title: '临床考核', description: '完成瘀血病案分析考核', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c12-mastery', type: StageType.Mastery, title: '融会贯通', description: '总结本章收获，获得活血通络技能', requiredMedicines: [],
        unlockRequirements: [] },
    ],
    medicines: ['川芎', '当归', '白芍', '桃仁'],
    formulas: ['血府逐瘀汤', '温经汤'],
    isUnlocked: false,
    isCompleted: false,
    masteryScore: 0,
  },

  // ===== 第13章：化痰止咳平喘剂山谷 =====
  {
    id: 'chapter-13',
    chapterNumber: 13,
    title: '化痰止咳平喘剂山谷',
    subtitle: '第十三章·祛痰剂',
    wuxing: WuxingType.Metal,
    description: '云雾弥漫的山谷，化痰止咳药灵在此栖息。学习二陈汤、清气化痰丸，掌握痰湿阻肺的祛痰之法。本章收集杏仁、桔梗，复习半夏、陈皮。',
    unlockRequirements: ['chapter-12'],
    stages: [
      { id: 'c13-intro', type: StageType.Intro, title: '师导入门', description: '青木先生介绍化痰止咳原理', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c13-gathering', type: StageType.Gathering, title: '云谷采药', description: '探索云雾山谷，寻找化痰止咳药材', requiredMedicines: ['半夏', '陈皮', '杏仁', '桔梗'],
        unlockRequirements: [] },
      { id: 'c13-battle', type: StageType.Battle, title: '药灵守护', description: '通过战斗巩固化痰药材知识', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c13-formula', type: StageType.Formula, title: '方剂学习', description: '学习二陈汤和清气化痰丸', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c13-clinical', type: StageType.Clinical, title: '临床考核', description: '完成痰湿阻肺病案分析考核', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c13-mastery', type: StageType.Mastery, title: '融会贯通', description: '总结本章收获，获得化痰止咳技能', requiredMedicines: [],
        unlockRequirements: [] },
    ],
    medicines: ['半夏', '陈皮', '杏仁', '桔梗'],
    formulas: ['二陈汤', '清气化痰丸'],
    isUnlocked: false,
    isCompleted: false,
    masteryScore: 0,
  },

  // ===== 第14章：安神剂山谷 =====
  {
    id: 'chapter-14',
    chapterNumber: 14,
    title: '安神剂山谷',
    subtitle: '第十四章·安神药',
    wuxing: WuxingType.Fire,
    description: '静谧幽深的山谷，宁心安神药灵在此静修。学习酸枣仁汤、天王补心丹，掌握心神不宁的安神之法。本章收集酸枣仁、柏子仁、远志，复习茯苓。',
    unlockRequirements: ['chapter-13'],
    stages: [
      { id: 'c14-intro', type: StageType.Intro, title: '师导入门', description: '青木先生介绍安神剂养心之法', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c14-gathering', type: StageType.Gathering, title: '静谷采药', description: '探索静谧山谷，寻找宁心安神药材', requiredMedicines: ['酸枣仁', '柏子仁', '远志', '茯苓'],
        unlockRequirements: [] },
      { id: 'c14-battle', type: StageType.Battle, title: '药灵守护', description: '通过战斗巩固安神药材知识', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c14-formula', type: StageType.Formula, title: '方剂学习', description: '学习酸枣仁汤和天王补心丹', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c14-clinical', type: StageType.Clinical, title: '临床考核', description: '完成心神不宁病案分析考核', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c14-mastery', type: StageType.Mastery, title: '融会贯通', description: '总结本章收获，获得安神定志技能', requiredMedicines: [],
        unlockRequirements: [] },
    ],
    medicines: ['酸枣仁', '柏子仁', '远志', '茯苓'],
    formulas: ['酸枣仁汤', '天王补心丹'],
    isUnlocked: false,
    isCompleted: false,
    masteryScore: 0,
  },

  // ===== 第15章：平肝息风剂山谷 =====
  {
    id: 'chapter-15',
    chapterNumber: 15,
    title: '平肝息风剂山谷',
    subtitle: '第十五章·平肝息风药',
    wuxing: WuxingType.Wood,
    description: '风啸山谷，平肝息风药灵在此镇守。学习天麻钩藤饮、镇肝熄风汤，掌握肝阳上亢、肝风内动的平肝之法。本章收集天麻、钩藤、石决明、牛膝。',
    unlockRequirements: ['chapter-14'],
    stages: [
      { id: 'c15-intro', type: StageType.Intro, title: '师导入门', description: '青木先生介绍平肝息风原理', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c15-gathering', type: StageType.Gathering, title: '风谷采药', description: '探索风啸山谷，寻找平肝息风药材', requiredMedicines: ['天麻', '钩藤', '石决明', '牛膝'],
        unlockRequirements: [] },
      { id: 'c15-battle', type: StageType.Battle, title: '药灵守护', description: '通过战斗巩固息风药材知识', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c15-formula', type: StageType.Formula, title: '方剂学习', description: '学习天麻钩藤饮和镇肝熄风汤', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c15-clinical', type: StageType.Clinical, title: '临床考核', description: '完成肝风内动病案分析考核', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c15-mastery', type: StageType.Mastery, title: '融会贯通', description: '总结本章收获，获得平肝息风技能', requiredMedicines: [],
        unlockRequirements: [] },
    ],
    medicines: ['天麻', '钩藤', '石决明', '牛膝'],
    formulas: ['天麻钩藤饮', '镇肝熄风汤'],
    isUnlocked: false,
    isCompleted: false,
    masteryScore: 0,
  },

  // ===== 第16章：开窍剂山谷 =====
  {
    id: 'chapter-16',
    chapterNumber: 16,
    title: '开窍剂山谷',
    subtitle: '第十六章·开窍药',
    wuxing: WuxingType.Fire,
    description: '神秘幽深的山谷，芳香开窍药灵在此沉睡。学习安宫牛黄丸、苏合香丸，掌握窍闭神昏的开窍之法。本章收集麝香、冰片、苏合香、石菖蒲。',
    unlockRequirements: ['chapter-15'],
    stages: [
      { id: 'c16-intro', type: StageType.Intro, title: '师导入门', description: '青木先生介绍开窍剂急救应用', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c16-gathering', type: StageType.Gathering, title: '幽谷采药', description: '探索神秘幽谷，寻找芳香开窍药材', requiredMedicines: ['麝香', '冰片', '苏合香', '石菖蒲'],
        unlockRequirements: [] },
      { id: 'c16-battle', type: StageType.Battle, title: '药灵守护', description: '通过战斗巩固开窍药材知识', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c16-formula', type: StageType.Formula, title: '方剂学习', description: '学习安宫牛黄丸和苏合香丸', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c16-clinical', type: StageType.Clinical, title: '临床考核', description: '完成窍闭神昏病案分析考核', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c16-mastery', type: StageType.Mastery, title: '融会贯通', description: '总结本章收获，获得开窍醒神技能', requiredMedicines: [],
        unlockRequirements: [] },
    ],
    medicines: ['麝香', '冰片', '苏合香', '石菖蒲'],
    formulas: ['安宫牛黄丸', '苏合香丸'],
    isUnlocked: false,
    isCompleted: false,
    masteryScore: 0,
  },

  // ===== 第17章：补气剂山谷 =====
  {
    id: 'chapter-17',
    chapterNumber: 17,
    title: '补气剂山谷',
    subtitle: '第十七章·补益剂·补气',
    wuxing: WuxingType.Earth,
    description: '肥沃丰饶的山谷，补气健脾药灵在此繁茂。学习四君子汤、补中益气汤，掌握脾胃气虚的补气之法。本章收集甘草，复习人参、黄芪、白术。',
    unlockRequirements: ['chapter-16'],
    stages: [
      { id: 'c17-intro', type: StageType.Intro, title: '师导入门', description: '青木先生介绍补气健脾原理', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c17-gathering', type: StageType.Gathering, title: '丰饶采药', description: '探索肥沃山谷，寻找补气健脾药材', requiredMedicines: ['人参', '黄芪', '白术', '甘草'],
        unlockRequirements: [] },
      { id: 'c17-battle', type: StageType.Battle, title: '药灵守护', description: '通过战斗巩固补气药材知识', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c17-formula', type: StageType.Formula, title: '方剂学习', description: '学习四君子汤和补中益气汤', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c17-clinical', type: StageType.Clinical, title: '临床考核', description: '完成脾胃气虚病案分析考核', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c17-mastery', type: StageType.Mastery, title: '融会贯通', description: '总结本章收获，获得补气益脾技能', requiredMedicines: [],
        unlockRequirements: [] },
    ],
    medicines: ['人参', '黄芪', '白术', '甘草'],
    formulas: ['四君子汤', '补中益气汤'],
    isUnlocked: false,
    isCompleted: false,
    masteryScore: 0,
  },

  // ===== 第18章：补血剂山谷 =====
  {
    id: 'chapter-18',
    chapterNumber: 18,
    title: '补血剂山谷',
    subtitle: '第十八章·补益剂·补血',
    wuxing: WuxingType.Water,
    description: '温润如玉的山谷，补血养阴药灵在此滋养。学习四物汤，掌握营血虚滞的补血之法。本章复习当归、熟地黄、白芍、川芎四味补血要药。',
    unlockRequirements: ['chapter-17'],
    stages: [
      { id: 'c18-intro', type: StageType.Intro, title: '师导入门', description: '青木先生介绍补血养阴原理', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c18-gathering', type: StageType.Gathering, title: '温润采药', description: '探索温润山谷，寻找补血养阴药材', requiredMedicines: ['当归', '熟地黄', '白芍', '川芎'],
        unlockRequirements: [] },
      { id: 'c18-battle', type: StageType.Battle, title: '药灵守护', description: '通过战斗巩固补血药材知识', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c18-formula', type: StageType.Formula, title: '方剂学习', description: '学习四物汤的组成与应用', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c18-clinical', type: StageType.Clinical, title: '临床考核', description: '完成营血虚滞病案分析考核', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c18-mastery', type: StageType.Mastery, title: '融会贯通', description: '总结本章收获，获得补血养血技能', requiredMedicines: [],
        unlockRequirements: [] },
    ],
    medicines: ['当归', '熟地黄', '白芍', '川芎'],
    formulas: ['四物汤'],
    isUnlocked: false,
    isCompleted: false,
    masteryScore: 0,
  },

  // ===== 第19章：补阳剂山谷 =====
  {
    id: 'chapter-19',
    chapterNumber: 19,
    title: '补阳剂山谷',
    subtitle: '第十九章·补益剂·补阳',
    wuxing: WuxingType.Fire,
    description: '阳光普照的山谷，补肾壮阳药灵在此升腾。学习肾气丸、右归丸，掌握肾阳虚衰的补阳之法。本章收集鹿茸、杜仲、续断、菟丝子。',
    unlockRequirements: ['chapter-18'],
    stages: [
      { id: 'c19-intro', type: StageType.Intro, title: '师导入门', description: '青木先生介绍补肾壮阳原理', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c19-gathering', type: StageType.Gathering, title: '阳光采药', description: '探索阳光山谷，寻找补肾壮阳药材', requiredMedicines: ['鹿茸', '杜仲', '续断', '菟丝子'],
        unlockRequirements: [] },
      { id: 'c19-battle', type: StageType.Battle, title: '药灵守护', description: '通过战斗巩固补阳药材知识', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c19-formula', type: StageType.Formula, title: '方剂学习', description: '学习肾气丸和右归丸', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c19-clinical', type: StageType.Clinical, title: '临床考核', description: '完成肾阳虚衰病案分析考核', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c19-mastery', type: StageType.Mastery, title: '融会贯通', description: '总结本章收获，获得补肾壮阳技能', requiredMedicines: [],
        unlockRequirements: [] },
    ],
    medicines: ['鹿茸', '杜仲', '续断', '菟丝子'],
    formulas: ['肾气丸', '右归丸'],
    isUnlocked: false,
    isCompleted: false,
    masteryScore: 0,
  },

  // ===== 第20章：补阴剂山谷 =====
  {
    id: 'chapter-20',
    chapterNumber: 20,
    title: '补阴剂山谷',
    subtitle: '第二十章·补益剂·补阴',
    wuxing: WuxingType.Water,
    description: '清凉幽静的山谷，滋阴润燥药灵在此涵养。学习六味地黄丸、左归丸，掌握肾阴亏虚的补阴之法。本章收集山茱萸、山药、枸杞子，复习熟地黄。',
    unlockRequirements: ['chapter-19'],
    stages: [
      { id: 'c20-intro', type: StageType.Intro, title: '师导入门', description: '青木先生介绍滋阴润燥原理', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c20-gathering', type: StageType.Gathering, title: '清凉采药', description: '探索清凉山谷，寻找滋阴润燥药材', requiredMedicines: ['熟地黄', '山茱萸', '山药', '枸杞子'],
        unlockRequirements: [] },
      { id: 'c20-battle', type: StageType.Battle, title: '药灵守护', description: '通过战斗巩固补阴药材知识', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c20-formula', type: StageType.Formula, title: '方剂学习', description: '学习六味地黄丸和左归丸', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c20-clinical', type: StageType.Clinical, title: '临床考核', description: '完成肾阴亏虚病案分析考核', requiredMedicines: [],
        unlockRequirements: [] },
      { id: 'c20-mastery', type: StageType.Mastery, title: '融会贯通', description: '总结本章收获，获得滋阴润燥技能', requiredMedicines: [],
        unlockRequirements: [] },
    ],
    medicines: ['熟地黄', '山茱萸', '山药', '枸杞子'],
    formulas: ['六味地黄丸', '左归丸'],
    isUnlocked: false,
    isCompleted: false,
    masteryScore: 0,
  },
];

/**
 * 通过ID获取章节
 */
export function getChapterById(id: string): Chapter | undefined {
  return chapters.find(ch => ch.id === id);
}

/**
 * 通过章节号获取章节
 */
export function getChapterByNumber(num: number): Chapter | undefined {
  return chapters.find(ch => ch.chapterNumber === num);
}

/**
 * 获取已解锁的章节
 */
export function getUnlockedChapters(unlockedIds: string[]): Chapter[] {
  return chapters.filter(c => unlockedIds.includes(c.id));
}

/**
 * 获取下一章
 */
export function getNextChapter(currentChapterNumber: number): Chapter | undefined {
  return chapters.find(ch => ch.chapterNumber === currentChapterNumber + 1);
}

/**
 * 检查章节是否解锁
 */
export function isChapterUnlocked(chapterId: string, unlockedIds: string[]): boolean {
  return unlockedIds.includes(chapterId);
}

/**
 * 章节五行分布统计
 */
export const wuxingDistribution: Record<string, number> = {
  wood: chapters.filter(c => c.wuxing === WuxingType.Wood).length,
  fire: chapters.filter(c => c.wuxing === WuxingType.Fire).length,
  earth: chapters.filter(c => c.wuxing === WuxingType.Earth).length,
  metal: chapters.filter(c => c.wuxing === WuxingType.Metal).length,
  water: chapters.filter(c => c.wuxing === WuxingType.Water).length
};

/**
 * 按五行获取章节
 */
export function getChaptersByWuxing(wuxing: WuxingType): Chapter[] {
  return chapters.filter(ch => ch.wuxing === wuxing);
}

/**
 * 章节统计信息
 */
export const chapterStats = {
  total: chapters.length,
  unlocked: chapters.filter(c => c.isUnlocked).length,
  completed: chapters.filter(c => c.isCompleted).length,
  byWuxing: wuxingDistribution
};

/**
 * 获取章节进度百分比
 */
export function getChapterProgress(completedChapterIds: string[]): number {
  if (chapters.length === 0) return 0;
  const completed = completedChapterIds.filter(id => {
    const ch = getChapterById(id);
    return ch !== undefined;
  }).length;
  return Math.round((completed / chapters.length) * 100);
}

export default chapters;

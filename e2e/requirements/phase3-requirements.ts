import { DesignRequirement } from '../types';

/**
 * Phase 3 药灵守护战斗系统验收标准
 */

export const battleSystemRequirements: DesignRequirement = {
  name: '药灵守护战斗系统验收',
  criteria: [
    '战斗界面应显示4波次进度指示器',
    '敌人应从上方出现并向底部移动',
    '玩家应能看到当前波次的敌人和目标文本',
    '输入框应支持中文和拼音输入',
    '正确输入后敌人应被击退并有得分反馈',
    '连击系统应在连续正确输入后显示倍率',
    '技能栏应显示5个技能及其冷却状态',
    '玩家血量应在敌人到达底部时减少',
    '战斗胜利后应显示结算界面并推进到下一阶段',
    '战斗失败应允许重试',
  ],
  expectedElements: ['战斗', '敌人', '输入', '技能', '连击', '血量'],
};

export const battleWaveRequirements: DesignRequirement = {
  name: '四波次战斗系统验收',
  criteria: [
    '第1波（药名辨识）：5个普通敌人，输入药材名称',
    '第2波（性味归经）：5个普通敌人，输入四气五味',
    '第3波（功效主治）：3个精英敌人，输入功效关键词',
    '第4波（方剂对决）：1个BOSS敌人，输入方剂名称',
    '每波之间应有过渡动画和提示',
    '波次难度应递增（敌人速度、血量）',
  ],
  expectedElements: ['波次', '药名辨识', '性味归经', '功效主治', '方剂对决'],
};

export const battleInputRequirements: DesignRequirement = {
  name: '战斗输入系统验收',
  criteria: [
    '应支持精确中文匹配（如"麻黄"）',
    '应支持拼音全拼匹配（如"mahuang"）',
    '应支持拼音首字母匹配（如"mh"）',
    '输入时应有实时视觉反馈',
    '错误输入应清除并允许重新输入',
    '正确输入后应立即触发攻击动画',
  ],
  expectedElements: ['输入', '拼音', '中文', '匹配', '反馈'],
};

export const battleSkillRequirements: DesignRequirement = {
  name: '战斗技能系统验收',
  criteria: [
    '定身术：减缓敌人移动速度50%，持续5秒',
    '群体净化：立即清除最前面3个敌人',
    '回春术：恢复30点生命值',
    '护盾术：获得5秒无敌状态',
    '灵光一现：显示所有敌人答案3秒',
    '技能使用后应进入冷却时间',
    '技能图标应显示冷却进度',
  ],
  expectedElements: ['技能', '定身术', '净化', '回春', '护盾', '灵光'],
};

export const battleComboRequirements: DesignRequirement = {
  name: '连击系统验收',
  criteria: [
    '连续正确输入应增加连击数',
    '连击数应在UI上实时显示',
    '每10连击增加0.1倍得分倍率',
    '错误输入或敌人到达底部应重置连击',
    '最高连击数应在战斗结束后统计',
    '连击应有视觉特效（数字跳动、光效）',
  ],
  expectedElements: ['连击', '倍率', '得分', '重置', '特效'],
};

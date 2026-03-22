import type { Skill, SkillEffect } from '../data/skills';

// 游戏上下文类型
export interface GameContext {
  diamonds: number;
  chapterId?: string;
  clueType?: string;
  basePrice?: number;
  baseReward?: number;
  collectedMedicines?: string[];
  unlockedFormulas?: string[];
  currentWuxing?: string;
  hintUsed?: boolean;
}

// 技能效果应用结果
export interface SkillEffectResult {
  context: GameContext;
  appliedEffects: {
    skillId: string;
    skillName: string;
    effect: SkillEffect;
    value: number;
  }[];
  totalMultiplier: number;
}

/**
 * 应用单个技能效果到游戏上下文
 */
export function applySkillEffect(
  effect: SkillEffect,
  context: GameContext,
  skillId: string,
  skillName: string
): { newContext: GameContext; applied: boolean; value: number } {
  let newContext = { ...context };
  let applied = false;
  let value = 0;

  switch (effect.type) {
    case 'free_clue':
      // 开局自动获得线索 - 在应用时不需要修改上下文
      applied = true;
      value = 1;
      break;

    case 'discount':
      // 价格折扣 - 在计算价格时使用
      applied = true;
      value = effect.value;
      break;

    case 'chapter_bonus':
      // 章节奖励加成 - 检查是否匹配当前章节
      if (context.chapterId && effect.target) {
        // 简化的章节匹配逻辑
        const chapterMatch = context.chapterId.includes(effect.target);
        if (chapterMatch) {
          applied = true;
          value = effect.value;
        }
      }
      break;

    case 'extra_reward':
      // 额外奖励 - 检查触发几率
      if (effect.target === 'case') {
        // 病案奖励加成
        applied = true;
        value = effect.value;
      } else {
        // 探索随机奖励
        const roll = Math.random();
        if (roll < effect.value) {
          applied = true;
          value = effect.value;
        }
      }
      break;

    case 'hint_bonus':
      // 提示加成
      applied = true;
      value = effect.value;
      break;

    case 'affinity_boost':
      // 亲密度加成
      applied = true;
      value = effect.value;
      break;

    case 'wuxing_bonus':
      // 五行加成 - 检查当前五行
      if (context.currentWuxing && effect.target) {
        if (context.currentWuxing === effect.target) {
          applied = true;
          value = effect.value;
        }
      }
      break;

    case 'unlock_content':
      // 内容解锁 - 被动效果，不需要主动应用
      applied = true;
      value = effect.value;
      break;

    default:
      break;
  }

  return { newContext, applied, value };
}

/**
 * 计算线索价格（应用所有折扣效果）
 */
export function calculateCluePrice(
  basePrice: number,
  clueType: string,
  unlockedSkills: Skill[],
  skillLevels: Record<string, number>
): { finalPrice: number; discounts: { skillName: string; discount: number }[] } {
  let priceMultiplier = 1;
  const discounts: { skillName: string; discount: number }[] = [];

  unlockedSkills.forEach((skill) => {
    const level = skillLevels[skill.id] || 1;
    const effect = skill.effects[level - 1];

    if (effect && effect.type === 'discount') {
      if (effect.target === clueType) {
        priceMultiplier *= effect.value;
        const discountPercent = Math.round((1 - effect.value) * 100);
        discounts.push({ skillName: skill.name, discount: discountPercent });
      }
    }
  });

  const finalPrice = Math.round(basePrice * priceMultiplier);

  return { finalPrice, discounts };
}

/**
 * 计算章节奖励（应用所有加成效果）
 */
export function calculateChapterReward(
  baseReward: number,
  chapterId: string,
  chapterCategory: string,
  unlockedSkills: Skill[],
  skillLevels: Record<string, number>
): { finalReward: number; bonuses: { skillName: string; bonus: number }[] } {
  let rewardMultiplier = 1;
  const bonuses: { skillName: string; bonus: number }[] = [];

  unlockedSkills.forEach((skill) => {
    const level = skillLevels[skill.id] || 1;
    const effect = skill.effects[level - 1];

    if (effect) {
      // 章节专属技能加成
      if (effect.type === 'chapter_bonus') {
        if (chapterCategory === effect.target || chapterId.includes(effect.target || '')) {
          rewardMultiplier *= effect.value;
          const bonusPercent = Math.round((effect.value - 1) * 100);
          bonuses.push({ skillName: skill.name, bonus: bonusPercent });
        }
      }

      // 通用额外奖励技能
      if (effect.type === 'extra_reward') {
        rewardMultiplier *= effect.value;
        const bonusPercent = Math.round((effect.value - 1) * 100);
        bonuses.push({ skillName: skill.name, bonus: bonusPercent });
      }
    }
  });

  const finalReward = Math.round(baseReward * rewardMultiplier);

  return { finalReward, bonuses };
}

/**
 * 计算探索奖励（应用随机额外奖励）
 */
export function calculateExploreReward(
  baseReward: number,
  unlockedSkills: Skill[],
  skillLevels: Record<string, number>
): { finalReward: number; bonusTriggered: boolean; triggeredSkill?: string } {
  let finalReward = baseReward;
  let bonusTriggered = false;
  let triggeredSkill: string | undefined;

  unlockedSkills.forEach((skill) => {
    const level = skillLevels[skill.id] || 1;
    const effect = skill.effects[level - 1];

    if (effect && effect.type === 'extra_reward' && !effect.target) {
      // 检查是否触发额外奖励
      const roll = Math.random();
      if (roll < effect.value) {
        finalReward += baseReward * 0.5; // 额外50%奖励
        bonusTriggered = true;
        triggeredSkill = skill.name;
      }
    }
  });

  return { finalReward: Math.round(finalReward), bonusTriggered, triggeredSkill };
}

/**
 * 计算亲密度获取（应用加成）
 */
export function calculateAffinityGain(
  baseAffinity: number,
  unlockedSkills: Skill[],
  skillLevels: Record<string, number>
): { finalAffinity: number; bonuses: { skillName: string; multiplier: number }[] } {
  let affinityMultiplier = 1;
  const bonuses: { skillName: string; multiplier: number }[] = [];

  unlockedSkills.forEach((skill) => {
    const level = skillLevels[skill.id] || 1;
    const effect = skill.effects[level - 1];

    if (effect && effect.type === 'affinity_boost') {
      affinityMultiplier *= effect.value;
      const percent = Math.round((effect.value - 1) * 100);
      bonuses.push({ skillName: skill.name, multiplier: percent });
    }
  });

  const finalAffinity = Math.round(baseAffinity * affinityMultiplier);

  return { finalAffinity, bonuses };
}

/**
 * 检查是否有免费线索技能
 */
export function getFreeClueTypes(
  unlockedSkills: Skill[],
  skillLevels: Record<string, number>
): string[] {
  const freeClues: string[] = [];

  unlockedSkills.forEach((skill) => {
    const level = skillLevels[skill.id] || 1;
    const effect = skill.effects[level - 1];

    if (effect && effect.type === 'free_clue' && effect.target) {
      freeClues.push(effect.target);
    }
  });

  return freeClues;
}

/**
 * 检查提示是否免费
 */
export function isFirstHintFree(
  unlockedSkills: Skill[],
  skillLevels: Record<string, number>
): boolean {
  return unlockedSkills.some((skill) => {
    const level = skillLevels[skill.id] || 1;
    const effect = skill.effects[level - 1];
    return effect && effect.type === 'hint_bonus';
  });
}

/**
 * 获取复习提示加成
 */
export function getReviewHintBonus(
  unlockedSkills: Skill[],
  skillLevels: Record<string, number>
): number {
  let bonus = 0;

  unlockedSkills.forEach((skill) => {
    const level = skillLevels[skill.id] || 1;
    const effect = skill.effects[level - 1];

    if (effect && effect.type === 'unlock_content' && effect.target === 'review_hints') {
      bonus += effect.value;
    }
  });

  return bonus;
}

/**
 * 检查是否解锁隐藏故事
 */
export function hasHiddenStoriesUnlocked(
  unlockedSkills: Skill[],
  skillLevels: Record<string, number>
): boolean {
  return unlockedSkills.some((skill) => {
    const level = skillLevels[skill.id] || 1;
    const effect = skill.effects[level - 1];
    return effect && effect.type === 'unlock_content' && effect.target === 'hidden_stories';
  });
}

/**
 * 计算五行相克奖励
 */
export function calculateWuxingBonus(
  baseReward: number,
  playerWuxing: string,
  targetWuxing: string,
  unlockedSkills: Skill[],
  skillLevels: Record<string, number>
): { finalReward: number; bonusApplied: boolean; bonusPercent: number } {
  // 简化的五行相克关系
  const wuxingRelation: Record<string, string> = {
    wood: 'earth',
    fire: 'metal',
    earth: 'water',
    metal: 'wood',
    water: 'fire',
  };

  const isCountered = wuxingRelation[playerWuxing] === targetWuxing;

  if (!isCountered) {
    return { finalReward: baseReward, bonusApplied: false, bonusPercent: 0 };
  }

  let bonusMultiplier = 1;

  unlockedSkills.forEach((skill) => {
    const level = skillLevels[skill.id] || 1;
    const effect = skill.effects[level - 1];

    if (effect && effect.type === 'wuxing_bonus') {
      bonusMultiplier *= effect.value;
    }
  });

  const finalReward = Math.round(baseReward * bonusMultiplier);
  const bonusPercent = Math.round((bonusMultiplier - 1) * 100);

  return { finalReward, bonusApplied: true, bonusPercent };
}

/**
 * 获取所有激活的技能效果描述
 */
export function getActiveSkillEffects(
  unlockedSkills: Skill[],
  skillLevels: Record<string, number>
): { skillName: string; effectDescription: string }[] {
  return unlockedSkills.map((skill) => {
    const level = skillLevels[skill.id] || 1;
    const effect = skill.effects[level - 1];

    let effectDescription = '';
    if (effect) {
      switch (effect.type) {
        case 'free_clue':
          effectDescription = `开局自动获得${effect.target === 'image' ? '药图' : effect.target}线索`;
          break;
        case 'discount':
          effectDescription = `${effect.target}线索价格-${Math.round((1 - effect.value) * 100)}%`;
          break;
        case 'chapter_bonus':
          effectDescription = `${effect.target}章节奖励+${Math.round((effect.value - 1) * 100)}%`;
          break;
        case 'extra_reward':
          effectDescription = effect.target
            ? `${effect.target}奖励+${Math.round((effect.value - 1) * 100)}%`
            : `${Math.round(effect.value * 100)}%几率额外奖励`;
          break;
        case 'hint_bonus':
          effectDescription = '首次提示免费';
          break;
        case 'affinity_boost':
          effectDescription = `亲密度获取+${Math.round((effect.value - 1) * 100)}%`;
          break;
        case 'wuxing_bonus':
          effectDescription = `五行相克奖励+${Math.round((effect.value - 1) * 100)}%`;
          break;
        case 'unlock_content':
          effectDescription = effect.target === 'review_hints'
            ? `复习提示+${effect.value}`
            : '解锁隐藏内容';
          break;
        default:
          effectDescription = '特殊效果';
      }
    }

    return { skillName: skill.name, effectDescription };
  });
}

/**
 * 计算技能点成本
 */
export function calculateSkillCost(skill: Skill, currentLevel: number): number {
  if (currentLevel >= skill.maxLevel) return 0;

  // 基础成本 + 每级递增
  const baseCost = 1;
  const increment = 1;
  return baseCost + currentLevel * increment;
}

/**
 * 计算总技能效果摘要
 */
export function calculateTotalEffects(
  unlockedSkills: Skill[],
  skillLevels: Record<string, number>
): {
  clueDiscounts: Record<string, number>;
  chapterBonuses: Record<string, number>;
  affinityMultiplier: number;
  freeHints: boolean;
  extraRewardChance: number;
} {
  const clueDiscounts: Record<string, number> = {};
  const chapterBonuses: Record<string, number> = {};
  let affinityMultiplier = 1;
  let freeHints = false;
  let extraRewardChance = 0;

  unlockedSkills.forEach((skill) => {
    const level = skillLevels[skill.id] || 1;
    const effect = skill.effects[level - 1];

    if (!effect) return;

    switch (effect.type) {
      case 'discount':
        if (effect.target) {
          clueDiscounts[effect.target] = (clueDiscounts[effect.target] || 1) * effect.value;
        }
        break;

      case 'chapter_bonus':
        if (effect.target) {
          chapterBonuses[effect.target] = (chapterBonuses[effect.target] || 1) * effect.value;
        }
        break;

      case 'affinity_boost':
        affinityMultiplier *= effect.value;
        break;

      case 'hint_bonus':
        freeHints = true;
        break;

      case 'extra_reward':
        if (!effect.target) {
          extraRewardChance = Math.max(extraRewardChance, effect.value);
        }
        break;
    }
  });

  return {
    clueDiscounts,
    chapterBonuses,
    affinityMultiplier,
    freeHints,
    extraRewardChance,
  };
}

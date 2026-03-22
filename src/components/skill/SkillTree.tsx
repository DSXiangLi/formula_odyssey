import React, { useMemo, useState } from 'react';
import type { Skill, SkillCategory } from '../../data/skills';
import { categoryNames, getUnlockConditionDescription, getSkillEffectDescription, canUnlockSkill } from '../../data/skills';
import { SkillCard } from './SkillCard';

interface SkillTreeProps {
  skills: Skill[];
  unlockedSkills: string[];
  skillLevels: Record<string, number>;
  skillPoints: number;
  onUnlock: (skillId: string) => void;
  onUpgrade: (skillId: string) => void;
  gameProgress: {
    completedChapters: number;
    totalMedicines: number;
    totalFormulas: number;
    completedCases: number;
    totalAffinity: number;
  };
}

export const SkillTree: React.FC<SkillTreeProps> = ({
  skills,
  unlockedSkills,
  skillLevels,
  skillPoints,
  onUnlock,
  onUpgrade,
  gameProgress,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | 'all'>('all');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  // 按分类分组技能
  const skillsByCategory = useMemo(() => {
    const grouped: Record<SkillCategory, Skill[]> = {
      explore: [],
      diagnosis: [],
      memory: [],
      wuxing: [],
      chapter: [],
      general: [],
    };

    skills.forEach((skill) => {
      if (grouped[skill.category]) {
        grouped[skill.category].push(skill);
      }
    });

    return grouped;
  }, [skills]);

  // 过滤显示的技能
  const displayedSkills = useMemo(() => {
    if (selectedCategory === 'all') return skills;
    return skillsByCategory[selectedCategory] || [];
  }, [selectedCategory, skills, skillsByCategory]);

  // 获取技能在树中的位置（简化版网格布局）
  const getSkillPosition = (skill: Skill, index: number): { x: number; y: number } => {
    const categories: SkillCategory[] = ['explore', 'diagnosis', 'memory', 'wuxing', 'chapter', 'general'];
    const categoryIndex = categories.indexOf(skill.category);
    const skillsInCategory = skillsByCategory[skill.category];
    const indexInCategory = skillsInCategory.indexOf(skill);

    // 每个分类一列，每个技能占一行
    const col = categoryIndex;
    const row = indexInCategory;

    return {
      x: col * 200 + 100,
      y: row * 140 + 80,
    };
  };

  // 获取技能状态
  const getSkillStatus = (skill: Skill): 'locked' | 'unlockable' | 'unlocked' | 'maxed' => {
    const isUnlocked = unlockedSkills.includes(skill.id);
    const level = skillLevels[skill.id] || 0;

    if (isUnlocked) {
      if (level >= skill.maxLevel) return 'maxed';
      return 'unlocked';
    }

    const canUnlock = canUnlockSkill(skill, { ...gameProgress, unlockedSkills });
    if (canUnlock) return 'unlockable';
    return 'locked';
  };

  // 获取技能等级
  const getSkillLevel = (skillId: string): number => {
    return skillLevels[skillId] || 0;
  };

  return (
    <div className="skill-tree-container">
      {/* 标题区 */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-amber-400 mb-2">技能树</h2>
        <div className="flex items-center justify-center gap-4">
          <span className="text-amber-300">
            <span className="text-2xl">💎</span> 技能点: {skillPoints}
          </span>
          <span className="text-emerald-400">
            <span className="text-2xl">✨</span> 已解锁: {unlockedSkills.length}/{skills.length}
          </span>
        </div>
      </div>

      {/* 分类筛选 */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-lg transition-all ${
            selectedCategory === 'all'
              ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/50'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
          }`}
        >
          全部
        </button>
        {(['explore', 'diagnosis', 'memory', 'wuxing', 'chapter', 'general'] as SkillCategory[]).map(
          (cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedCategory === cat
                  ? `bg-gradient-to-r ${categoryNames[cat].gradient} text-white shadow-lg`
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {categoryNames[cat].name}
            </button>
          )
        )}
      </div>

      {/* 技能树可视化 */}
      <div className="relative bg-slate-900/50 rounded-2xl p-6 min-h-[500px] overflow-auto">
        {/* SVG连接线层 */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          <defs>
            {/* 发光滤镜 */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* 已解锁连线渐变 */}
            <linearGradient id="unlocked-line" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.8" />
            </linearGradient>
            {/* 可解锁连线渐变 */}
            <linearGradient id="unlockable-line" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.6" />
            </linearGradient>
          </defs>

          {/* 绘制连接线 - 同分类内的连接 */}
          {(['explore', 'diagnosis', 'memory', 'wuxing', 'chapter', 'general'] as SkillCategory[]).map(
            (category) => {
              const categorySkills = skillsByCategory[category];
              if (categorySkills.length < 2) return null;

              return categorySkills.slice(0, -1).map((skill, idx) => {
                const nextSkill = categorySkills[idx + 1];
                const pos1 = getSkillPosition(skill, idx);
                const pos2 = getSkillPosition(nextSkill, idx + 1);

                const status1 = getSkillStatus(skill);
                const status2 = getSkillStatus(nextSkill);
                const isConnected = status1 === 'unlocked' || status1 === 'maxed';

                return (
                  <line
                    key={`${skill.id}-${nextSkill.id}`}
                    x1={pos1.x}
                    y1={pos1.y}
                    x2={pos2.x}
                    y2={pos2.y}
                    stroke={isConnected ? 'url(#unlocked-line)' : 'url(#unlockable-line)'}
                    strokeWidth={isConnected ? 3 : 2}
                    strokeDasharray={isConnected ? 'none' : '5,5'}
                    filter={isConnected ? 'url(#glow)' : undefined}
                  />
                );
              });
            }
          )}
        </svg>

        {/* 技能节点网格 */}
        <div className="relative z-10">
          {(['explore', 'diagnosis', 'memory', 'wuxing', 'chapter', 'general'] as SkillCategory[]).map(
            (category) => {
              const categorySkills = skillsByCategory[category];
              if (selectedCategory !== 'all' && selectedCategory !== category) return null;

              return (
                <div key={category} className="mb-8">
                  <h3 className={`text-lg font-bold mb-4 text-center ${categoryNames[category].color}`}>
                    <span
                      className={`inline-block w-3 h-3 rounded-full mr-2`}
                      style={{ backgroundColor: categoryNames[category].color }}
                    />
                    {categoryNames[category].name}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {categorySkills.map((skill) => {
                      const status = getSkillStatus(skill);
                      const level = getSkillLevel(skill.id);

                      return (
                        <SkillCard
                          key={skill.id}
                          skill={skill}
                          isUnlocked={status === 'unlocked' || status === 'maxed'}
                          isUnlockable={status === 'unlockable'}
                          level={level}
                          onUnlock={() => onUnlock(skill.id)}
                          onUpgrade={() => onUpgrade(skill.id)}
                          onClick={() => setSelectedSkill(skill)}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* 选中技能详情 */}
      {selectedSkill && (
        <div className="mt-6 bg-slate-800/80 rounded-xl p-4 border border-slate-600">
          <div className="flex items-start gap-4">
            <div className="text-4xl">{selectedSkill.icon}</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-amber-400">{selectedSkill.name}</h3>
              <p className="text-slate-300 text-sm mb-2">{selectedSkill.description}</p>
              <p className="text-slate-400 text-xs italic">{selectedSkill.flavorText}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    unlockedSkills.includes(selectedSkill.id)
                      ? 'bg-emerald-500/30 text-emerald-400'
                      : 'bg-slate-600/50 text-slate-400'
                  }`}
                >
                  {unlockedSkills.includes(selectedSkill.id) ? '已解锁' : '未解锁'}
                </span>
                <span className="px-2 py-1 rounded text-xs bg-slate-600/50 text-slate-400">
                  等级 {skillLevels[selectedSkill.id] || 0}/{selectedSkill.maxLevel}
                </span>
              </div>

              <div className="mt-3 text-sm">
                <span className="text-slate-400">当前效果：</span>
                <span className="text-amber-300">
                  {getSkillEffectDescription(selectedSkill, skillLevels[selectedSkill.id] || 1)}
                </span>
              </div>

              {!unlockedSkills.includes(selectedSkill.id) && (
                <div className="mt-2 text-sm">
                  <span className="text-slate-400">解锁条件：</span>
                  <span className="text-slate-300">
                    {getUnlockConditionDescription(selectedSkill)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 图例 */}
      <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span>已解锁</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span>可解锁</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-slate-600" />
          <span>未解锁</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span>已满级</span>
        </div>
      </div>
    </div>
  );
};

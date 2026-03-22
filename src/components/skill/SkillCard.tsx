import React from 'react';
import type { Skill } from '../../data/skills';
import { getSkillEffectDescription, getUnlockConditionDescription, categoryNames } from '../../data/skills';

interface SkillCardProps {
  skill: Skill;
  isUnlocked: boolean;
  isUnlockable: boolean;
  level: number;
  onUnlock: () => void;
  onUpgrade: () => void;
  onClick?: () => void;
}

export const SkillCard: React.FC<SkillCardProps> = ({
  skill,
  isUnlocked,
  isUnlockable,
  level,
  onUnlock,
  onUpgrade,
  onClick,
}) => {
  // 判断技能状态
  const isMaxed = isUnlocked && level >= skill.maxLevel;
  const isLocked = !isUnlocked && !isUnlockable;

  // 获取状态样式
  const getStatusStyles = () => {
    if (isMaxed) {
      return {
        card: 'bg-gradient-to-br from-amber-600/40 to-yellow-500/40 border-amber-400 shadow-lg shadow-amber-500/30',
        icon: 'text-amber-300',
        badge: 'bg-amber-500 text-amber-950',
      };
    }
    if (isUnlocked) {
      return {
        card: 'bg-gradient-to-br from-emerald-600/30 to-teal-500/30 border-emerald-400/60 shadow-lg shadow-emerald-500/20',
        icon: 'text-emerald-300',
        badge: 'bg-emerald-500 text-emerald-950',
      };
    }
    if (isUnlockable) {
      return {
        card: 'bg-gradient-to-br from-blue-600/30 to-cyan-500/30 border-blue-400/60 shadow-lg shadow-blue-500/20 cursor-pointer hover:scale-105',
        icon: 'text-blue-300',
        badge: 'bg-blue-500 text-blue-950',
      };
    }
    return {
      card: 'bg-slate-800/60 border-slate-600/40 grayscale opacity-70',
      icon: 'text-slate-500',
      badge: 'bg-slate-600 text-slate-300',
    };
  };

  const styles = getStatusStyles();
  const categoryInfo = categoryNames[skill.category];

  // 当前效果
  const currentEffect = getSkillEffectDescription(skill, level || 1);
  // 下一级效果（如果有）
  const nextEffect = level < skill.maxLevel ? getSkillEffectDescription(skill, level + 1) : null;

  return (
    <div
      onClick={onClick}
      className={`
        relative rounded-xl p-3 border-2 transition-all duration-300
        ${styles.card}
        ${isUnlockable ? 'hover:shadow-xl' : ''}
        ${onClick ? 'cursor-pointer' : ''}
      `}
    >
      {/* 分类色条 */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl bg-gradient-to-r ${categoryInfo.gradient}`}
      />

      {/* 图标和名称 */}
      <div className="flex items-center gap-2 mb-2">
        <div className={`text-3xl ${styles.icon}`}>{skill.icon}</div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-slate-100 text-sm truncate">{skill.name}</h4>
          <span className="text-xs text-slate-400">{categoryInfo.name}</span>
        </div>
      </div>

      {/* 等级指示器 */}
      <div className="flex items-center gap-1 mb-2">
        {Array.from({ length: skill.maxLevel }).map((_, idx) => (
          <div
            key={idx}
            className={`h-1.5 flex-1 rounded-full ${
              idx < level ? 'bg-amber-400' : 'bg-slate-700'
            }`}
          />
        ))}
      </div>

      {/* 状态标签 */}
      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-0.5 rounded-full ${styles.badge}`}>
          {isMaxed ? '已满级' : isUnlocked ? `${level}/${skill.maxLevel}` : isUnlockable ? '可解锁' : '未解锁'}
        </span>

        {/* 操作按钮 */}
        {isUnlockable && !isUnlocked && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUnlock();
            }}
            className="text-xs px-3 py-1 rounded-full bg-blue-500 hover:bg-blue-400 text-white transition-colors"
          >
            解锁
          </button>
        )}

        {isUnlocked && !isMaxed && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpgrade();
            }}
            className="text-xs px-3 py-1 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white transition-colors"
          >
            升级
          </button>
        )}
      </div>

      {/* 悬停/展开时的详细信息 */}
      <div className="mt-2 pt-2 border-t border-slate-600/30 text-xs">
        <p className="text-slate-300 line-clamp-2">{skill.description}</p>

        {isUnlocked && (
          <div className="mt-2">
            <p className="text-emerald-400">{currentEffect}</p>
            {nextEffect && (
              <p className="text-slate-500 mt-1">
                下一级: <span className="text-amber-400">{nextEffect}</span>
              </p>
            )}
          </div>
        )}

        {!isUnlocked && (
          <div className="mt-2 text-slate-500">
            <span className="text-slate-400">解锁条件: </span>
            {getUnlockConditionDescription(skill)}
          </div>
        )}
      </div>

      {/* 风味文本（仅解锁显示） */}
      {isUnlocked && skill.flavorText && (
        <div className="mt-2 pt-2 border-t border-slate-600/30">
          <p className="text-[10px] text-slate-500 italic">{skill.flavorText}</p>
        </div>
      )}

      {/* 光效动画（可解锁状态） */}
      {isUnlockable && (
        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-transparent animate-pulse" />
        </div>
      )}

      {/* 满级特效 */}
      {isMaxed && (
        <div className="absolute -top-1 -right-1">
          <span className="text-lg">⭐</span>
        </div>
      )}
    </div>
  );
};

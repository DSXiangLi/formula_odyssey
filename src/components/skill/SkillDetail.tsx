import React from 'react';
import type { Skill, SkillEffect } from '../../data/skills';
import { getSkillEffectDescription, getUnlockConditionDescription, categoryNames } from '../../data/skills';

interface SkillDetailProps {
  skill: Skill;
  isOpen: boolean;
  onClose: () => void;
  level: number;
  unlockDate?: string;
  isUnlockable: boolean;
  onUnlock: () => void;
  onUpgrade: () => void;
}

export const SkillDetail: React.FC<SkillDetailProps> = ({
  skill,
  isOpen,
  onClose,
  level,
  unlockDate,
  isUnlockable,
  onUnlock,
  onUpgrade,
}) => {
  if (!isOpen) return null;

  const isUnlocked = level > 0;
  const isMaxed = level >= skill.maxLevel;
  const categoryInfo = categoryNames[skill.category];

  // 获取效果类型描述
  const getEffectTypeDescription = (effect: SkillEffect): string => {
    switch (effect.type) {
      case 'free_clue':
        return '自动线索';
      case 'discount':
        return '价格折扣';
      case 'chapter_bonus':
        return '章节加成';
      case 'extra_reward':
        return '额外奖励';
      case 'unlock_content':
        return '内容解锁';
      case 'hint_bonus':
        return '提示加成';
      case 'affinity_boost':
        return '亲和加成';
      case 'wuxing_bonus':
        return '五行加成';
      default:
        return '特殊效果';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 弹窗内容 */}
      <div className="relative z-10 w-full max-w-lg bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl border-2 border-slate-600 shadow-2xl overflow-hidden">
        {/* 顶部装饰条 */}
        <div className={`h-2 bg-gradient-to-r ${categoryInfo.gradient}`} />

        {/* 头部 */}
        <div className="relative p-6">
          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* 图标和标题 */}
          <div className="flex items-center gap-4">
            <div
              className={`
                w-20 h-20 rounded-2xl flex items-center justify-center text-5xl
                ${isUnlocked ? 'bg-gradient-to-br from-amber-500/30 to-yellow-400/30' : 'bg-slate-700/50'}
                border-2 ${isUnlocked ? 'border-amber-400/50' : 'border-slate-600'}
              `}
            >
              {skill.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-amber-400">{skill.name}</h2>
                {isMaxed && <span className="text-xl">⭐</span>}
              </div>
              <p className="text-sm text-slate-400">{categoryInfo.name} · 等级 {level}/{skill.maxLevel}</p>
            </div>
          </div>

          {/* 状态标签 */}
          <div className="mt-4 flex flex-wrap gap-2">
            {isUnlocked ? (
              <>
                <span className="px-3 py-1 rounded-full text-sm bg-emerald-500/30 text-emerald-400 border border-emerald-500/50">
                  ✓ 已解锁
                </span>
                {isMaxed && (
                  <span className="px-3 py-1 rounded-full text-sm bg-amber-500/30 text-amber-400 border border-amber-500/50">
                    ⭐ 已满级
                  </span>
                )}
              </>
            ) : isUnlockable ? (
              <span className="px-3 py-1 rounded-full text-sm bg-blue-500/30 text-blue-400 border border-blue-500/50">
                🔓 可解锁
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-sm bg-slate-600/50 text-slate-400 border border-slate-500/50">
                🔒 未解锁
              </span>
            )}
          </div>
        </div>

        {/* 内容区 */}
        <div className="px-6 pb-6 space-y-6">
          {/* 描述 */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <p className="text-slate-200">{skill.description}</p>
          </div>

          {/* 风味文本 */}
          {skill.flavorText && (
            <div className="text-center">
              <p className="text-slate-500 italic text-sm">{skill.flavorText}</p>
            </div>
          )}

          {/* 效果详情 */}
          <div>
            <h3 className="text-lg font-semibold text-amber-400 mb-3 flex items-center gap-2">
              <span>✨</span> 技能效果
            </h3>
            <div className="space-y-2">
              {skill.effects.map((effect, idx) => (
                <div
                  key={idx}
                  className={`
                    flex items-center justify-between p-3 rounded-lg
                    ${idx < level ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-slate-800/30 border border-slate-700/30'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`
                        w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                        ${idx < level ? 'bg-emerald-500 text-emerald-950' : 'bg-slate-700 text-slate-400'}
                      `}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <span className="text-xs text-slate-500">{getEffectTypeDescription(effect)}</span>
                      <p className={`${idx < level ? 'text-emerald-300' : 'text-slate-400'}`}>
                        {getSkillEffectDescription(skill, idx + 1)}
                      </p>
                    </div>
                  </div>
                  {idx < level && <span className="text-emerald-400">✓</span>}
                </div>
              ))}
            </div>
          </div>

          {/* 解锁信息 */}
          {isUnlocked && unlockDate && (
            <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
              <p className="text-sm text-slate-400">
                <span className="text-slate-500">解锁时间：</span>
                {new Date(unlockDate).toLocaleDateString('zh-CN')}
              </p>
            </div>
          )}

          {/* 解锁条件 */}
          {!isUnlocked && (
            <div>
              <h3 className="text-lg font-semibold text-amber-400 mb-3 flex items-center gap-2">
                <span>🔓</span> 解锁条件
              </h3>
              <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
                <p className="text-slate-300">{getUnlockConditionDescription(skill)}</p>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-3">
            {!isUnlocked && isUnlockable && (
              <button
                onClick={onUnlock}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-semibold shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02]"
              >
                解锁技能
              </button>
            )}

            {isUnlocked && !isMaxed && (
              <button
                onClick={onUpgrade}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold shadow-lg shadow-emerald-500/30 transition-all hover:scale-[1.02]"
              >
                升级技能
              </button>
            )}

            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold transition-colors"
            >
              {isUnlocked ? '关闭' : '返回'}
            </button>
          </div>
        </div>

        {/* 底部装饰 */}
        <div className={`h-1 bg-gradient-to-r ${categoryInfo.gradient}`} />
      </div>
    </div>
  );
};

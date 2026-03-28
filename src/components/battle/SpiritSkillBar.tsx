import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SpiritSkill, SpiritSkillEffect } from '../../systems/battle/types';

interface SpiritSkillBarProps {
  skills: SpiritSkill[];
  onUseSkill: (skillId: string) => void;
  disabled?: boolean;
}

// 技能图标映射
const skillIcons: Record<string, string> = {
  hint_flash: '💡',
  encyclopedia: '📚',
  mentor_hint: '👨‍⚕️',
  default: '✨',
};

// 技能名称映射
const skillNames: Record<string, string> = {
  hint_flash: '灵光一闪',
  encyclopedia: '本草百科',
  mentor_hint: '师尊指点',
};

// 技能效果描述
const getSkillEffectLabel = (skill: SpiritSkill): string => {
  switch (skill.effect.type) {
    case 'show_hint':
      return skill.effect.hintType === 'first_char' ? '显示首字提示' : '显示答案长度';
    case 'show_description':
      return '显示药材详细描述';
    case 'mentor_answer':
      return `AI导师给出答案 (得分-${Math.round((skill.effect.scorePenalty || 0.5) * 100)}%)`;
    default:
      return '';
  }
};

interface SkillButtonProps {
  skill: SpiritSkill;
  onClick: () => void;
  disabled?: boolean;
}

const SkillButton: React.FC<SkillButtonProps> = ({ skill, onClick, disabled = false }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const isOnCooldown = skill.currentCooldown > 0;
  const canUse = !isOnCooldown && !disabled;

  const icon = skillIcons[skill.id] || skillIcons.default;
  const displayName = skillNames[skill.id] || skill.name;

  return (
    <div className="relative">
      <motion.button
        onClick={onClick}
        disabled={!canUse}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        whileHover={canUse ? { scale: 1.1 } : {}}
        whileTap={canUse ? { scale: 0.95 } : {}}
        className={`relative w-16 h-16 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
          canUse
            ? 'border-amber-400 bg-amber-50 cursor-pointer shadow-lg shadow-amber-200'
            : isOnCooldown
            ? 'border-gray-400 bg-gray-100 cursor-not-allowed'
            : 'border-yellow-400 bg-yellow-50'
        }`}
        data-testid={`skill-button-${skill.id}`}
      >
        {/* 技能图标 */}
        <span className="text-2xl mb-0.5">{icon}</span>

        {/* 技能名称 */}
        <span className="text-xs font-medium text-gray-700 leading-tight text-center px-1">
          {displayName}
        </span>

        {/* 冷却覆盖层 */}
        {isOnCooldown && (
          <div className="absolute inset-0 bg-gray-700/80 rounded-xl flex flex-col items-center justify-center">
            <span className="text-white font-bold text-lg">{skill.currentCooldown}</span>
            <span className="text-white/70 text-xs">冷却中</span>
          </div>
        )}

        {/* 就绪发光效果 */}
        {canUse && (
          <motion.div
            className="absolute inset-0 rounded-xl border-2 border-amber-400"
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(251, 191, 36, 0)',
                '0 0 0 8px rgba(251, 191, 36, 0.3)',
                '0 0 0 0 rgba(251, 191, 36, 0)',
              ],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </motion.button>

      {/* 提示框 */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-48"
          >
            <div className="bg-gray-800 text-white p-3 rounded-lg shadow-xl text-sm">
              <p className="font-bold mb-1">{displayName}</p>
              <p className="text-gray-300 text-xs mb-2">{skill.description}</p>
              <p className="text-amber-300 text-xs">{getSkillEffectLabel(skill)}</p>
              <div className="mt-2 pt-2 border-t border-gray-600 space-y-1">
                <p className="text-xs text-gray-400">冷却时间: {skill.cooldown}s</p>
                {isOnCooldown && (
                  <p className="text-xs text-yellow-400">剩余冷却: {skill.currentCooldown}s</p>
                )}
              </div>
              {/* 箭头 */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SpiritSkillBar: React.FC<SpiritSkillBarProps> = ({ skills, onUseSkill, disabled = false }) => {
  const handleSkillClick = useCallback(
    (skillId: string) => {
      if (disabled) return;
      onUseSkill(skillId);
    },
    [disabled, onUseSkill]
  );

  return (
    <div
      data-testid="spirit-skill-bar"
      className="flex items-center gap-4 p-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-amber-200"
    >
      {/* 标签 */}
      <div className="flex flex-col items-center mr-2">
        <span className="text-sm font-bold text-gray-700">技能</span>
        <span className="text-xs text-gray-500">SKILLS</span>
      </div>

      {/* 分隔线 */}
      <div className="w-px h-12 bg-gray-300" />

      {/* 技能按钮 */}
      <div className="flex gap-3">
        {skills.map((skill, index) => (
          <motion.div
            key={skill.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <SkillButton
              skill={skill}
              onClick={() => handleSkillClick(skill.id)}
              disabled={disabled}
            />
          </motion.div>
        ))}
      </div>

      {/* 帮助文字 */}
      <div className="ml-auto text-xs text-gray-500">
        <p>答对题目可减少冷却</p>
      </div>
    </div>
  );
};

export default SpiritSkillBar;

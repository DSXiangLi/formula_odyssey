import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Skill, SkillEffect } from '../../systems/battle/types';

interface SkillBarProps {
  skills: Skill[];
  onUseSkill: (skillId: string) => void;
  disabled?: boolean;
}

// Skill icons mapping (using emoji as fallback)
const skillIcons: Record<string, string> = {
  slow_motion: '⏱️',
  instant_kill: '⚡',
  heal: '💚',
  shield: '🛡️',
  hint_reveal: '💡',
  default: '✨',
};

// Skill names in Chinese
const skillNames: Record<string, string> = {
  slow_motion: '缓时术',
  instant_kill: '瞬杀术',
  heal: '治疗术',
  shield: '护盾术',
  hint_reveal: '启示术',
};

function getSkillEffectLabel(effect: SkillEffect): string {
  switch (effect.type) {
    case 'slow_motion':
      return `时间减缓 ${Math.round((1 - effect.factor) * 100)}%`;
    case 'instant_kill':
      return `秒杀 ${effect.count} 个敌人`;
    case 'heal':
      return `恢复 ${effect.amount} 点生命`;
    case 'shield':
      return `护盾持续 ${effect.duration} 秒`;
    case 'hint_reveal':
      return `显示答案 ${effect.duration} 秒`;
    default:
      return '';
  }
}

function SkillButton({
  skill,
  onClick,
  disabled,
}: {
  skill: Skill;
  onClick: () => void;
  disabled?: boolean;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  
  const isOnCooldown = skill.currentCooldown > 0;
  const canUse = !isOnCooldown && !disabled;
  
  const effectType = skill.effect.type;
  const icon = skillIcons[effectType] || skillIcons.default;
  const displayName = skillNames[effectType] || skill.name;
  
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
            ? 'border-blue-500 bg-blue-50 cursor-pointer shadow-lg shadow-blue-200'
            : isOnCooldown
            ? 'border-gray-300 bg-gray-100 cursor-not-allowed'
            : 'border-yellow-400 bg-yellow-50'
        }`}
      >
        {/* Skill Icon */}
        <span className="text-2xl mb-0.5">{icon}</span>
        
        {/* Skill Name */}
        <span className="text-xs font-medium text-gray-700 leading-tight text-center px-1 relative z-10">
          {displayName}
        </span>
        
        {/* Cooldown Overlay */}
        {isOnCooldown && (
          <div className="absolute inset-0 bg-gray-600/70 rounded-xl flex flex-col items-center justify-center">
            <span className="text-white font-bold text-lg">{skill.currentCooldown}</span>
            <span className="text-white/70 text-xs">冷却中</span>
          </div>
        )}
        
        {/* Ready Glow Effect */}
        {canUse && (
          <motion.div
            className="absolute inset-0 rounded-xl border-2 border-blue-400"
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(59, 130, 246, 0)',
                '0 0 0 8px rgba(59, 130, 246, 0.3)',
                '0 0 0 0 rgba(59, 130, 246, 0)',
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
      
      {/* Tooltip */}
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
              <p className="text-blue-300 text-xs">{getSkillEffectLabel(skill.effect)}</p>
              <div className="mt-2 pt-2 border-t border-gray-600 space-y-1">
                <p className="text-xs text-gray-400">
                  冷却时间: {skill.cooldown}s
                </p>
                {skill.duration > 0 && (
                  <p className="text-xs text-gray-400">
                    持续时间: {skill.duration}s
                  </p>
                )}
                {isOnCooldown && (
                  <p className="text-xs text-yellow-400">
                    剩余冷却: {skill.currentCooldown}s
                  </p>
                )}
              </div>
              {/* Arrow */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SkillBar({ skills, onUseSkill, disabled = false }: SkillBarProps) {
  const handleSkillClick = useCallback(
    (skillId: string) => {
      if (disabled) return;
      onUseSkill(skillId);
    },
    [disabled, onUseSkill]
  );

  return (
    <div data-testid="skill-bar" className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
      {/* Label */}
      <div className="flex flex-col items-center mr-2">
        <span className="text-sm font-bold text-gray-700">技能</span>
        <span className="text-xs text-gray-500">SKILLS</span>
      </div>

      {/* Divider */}
      <div className="w-px h-12 bg-gray-300" />

      {/* Skill Buttons */}
      <div className="flex gap-3">
        {skills.map((skill, index) => (
          <motion.div
            key={skill.id}
            data-testid={`skill-${skill.id}`}
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
      
      {/* Help Text */}
      <div className="ml-auto text-xs text-gray-500">
        <p>答对题目可减少冷却</p>
      </div>
    </div>
  );
}

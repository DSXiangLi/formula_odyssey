import React from 'react';
import { motion } from 'framer-motion';
import type { StageProps } from '../../types/stage';

const OpenWorldStage: React.FC<StageProps> = ({ onComplete }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center"
      >
        <h1 className="text-3xl font-bold text-white mb-4">🌍 开放世界</h1>
        <p className="text-white/60 mb-8">
          （此阶段将在 Phase 5 完整实现，包含区域解锁和技能奖励）
        </p>
        <button
          onClick={() => onComplete()}
          className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-full font-bold hover:shadow-lg transition-all"
        >
          完成本章 →
        </button>
      </motion.div>
    </div>
  );
};

export default OpenWorldStage;

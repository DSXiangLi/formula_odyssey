import React from 'react';
import { motion } from 'framer-motion';
import type { StageProps } from '../../types/stage';

const FormulaLearningStage: React.FC<StageProps> = ({ onComplete }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center"
      >
        <h1 className="text-3xl font-bold text-white mb-4">📚 方剂学习</h1>
        <p className="text-white/60 mb-8">
          （此阶段将在 Phase 4 完整实现，包含AI讲解方剂君臣佐使）
        </p>
        <button
          onClick={() => onComplete()}
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full font-bold hover:shadow-lg transition-all"
        >
          开始学习 →
        </button>
      </motion.div>
    </div>
  );
};

export default FormulaLearningStage;

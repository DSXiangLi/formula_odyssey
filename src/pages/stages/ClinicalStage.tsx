import React from 'react';
import { motion } from 'framer-motion';
import type { StageProps } from '../../types/stage';

const ClinicalStage: React.FC<StageProps> = ({ onComplete }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center"
      >
        <h1 className="text-3xl font-bold text-white mb-4">🩺 临床考核</h1>
        <p className="text-white/60 mb-8">
          （此阶段已在 Phase 1 实现 ClinicalCase 组件，待集成）
        </p>
        <button
          onClick={() => onComplete({ score: 100, attempts: 1 })}
          className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full font-bold hover:shadow-lg transition-all"
        >
          完成考核 →
        </button>
      </motion.div>
    </div>
  );
};

export default ClinicalStage;

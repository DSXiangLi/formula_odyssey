import React from 'react';
import { motion } from 'framer-motion';
import type { StageProps } from '../../types/stage';

const MentorIntroStage: React.FC<StageProps> = ({ chapterId, onComplete }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center"
      >
        <h1 className="text-3xl font-bold text-white mb-4">👨‍⚕️ 师导入门</h1>
        <p className="text-white/80 mb-6">
          欢迎来到第 {chapterId} 章！我是青木先生，你的AI导师。
        </p>
        <p className="text-white/60 mb-8">
          （此阶段将在 Phase 4 完整实现，包含AI对话和本章介绍）
        </p>
        <button
          onClick={() => onComplete()}
          className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-bold hover:shadow-lg transition-all"
        >
          开始采药 →
        </button>
      </motion.div>
    </div>
  );
};

export default MentorIntroStage;

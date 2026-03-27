import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { StageProps } from '../../types/stage';

const FormulaLearningStage: React.FC<StageProps> = ({ onComplete, chapterId }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = () => {
    console.log('方剂学习: 开始按钮点击', { chapterId });
    setIsLoading(true);

    // 延迟一下让用户看到反馈
    setTimeout(() => {
      try {
        onComplete?.();
        console.log('方剂学习: onComplete 调用成功');
      } catch (error) {
        console.error('方剂学习: onComplete 调用失败', error);
        setIsLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center"
      >
        <h1 className="text-3xl font-bold text-white mb-4">📚 方剂学习</h1>
        <p className="text-white/60 mb-4">
          本章将学习经典方剂的君臣佐使配伍原理
        </p>
        <div className="bg-white/5 rounded-lg p-4 mb-6 text-left">
          <h3 className="text-white/80 font-medium mb-2">即将学习：</h3>
          <ul className="text-white/60 text-sm space-y-1">
            <li>• 麻黄汤 - 发汗解表，宣肺平喘</li>
            <li>• 桂枝汤 - 解肌发表，调和营卫</li>
            <li>• 四君子汤 - 益气健脾</li>
            <li>• 四物汤 - 补血和血</li>
          </ul>
        </div>
        <button
          onClick={handleStart}
          disabled={isLoading}
          className={`px-8 py-3 rounded-full font-bold transition-all ${
            isLoading
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-lg hover:scale-105'
          } text-white`}
        >
          {isLoading ? '加载中...' : '开始学习 →'}
        </button>
      </motion.div>
    </div>
  );
};

export default FormulaLearningStage;

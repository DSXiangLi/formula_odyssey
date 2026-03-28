import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TutorialStep {
  title: string;
  content: string;
  icon: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: '点击药灵',
    content: '点击画面中的药灵，激活它们的问题。每个药灵都需要你的帮助来回忆知识。',
    icon: '👆',
  },
  {
    title: '回答问题',
    content: '根据药灵的问题输入答案。回答越准确，驯服进度越快。5分回答可立即驯服！',
    icon: '✍️',
  },
  {
    title: '驯服药灵',
    content: '当驯服进度达到100%时，药灵就会被驯服。驯服所有药灵即可通关！',
    icon: '✨',
  },
  {
    title: '使用技能',
    content: '遇到困难时可以使用技能：灵光一闪显示提示，本草百科查看描述，师尊指点直接获得答案。',
    icon: '💡',
  },
];

const GameTutorial: React.FC<GameTutorialProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          data-testid="game-tutorial"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
          >
            {/* 头部 */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">欢迎来到药灵守护战</h2>
              <p className="text-emerald-100">驯服药灵，巩固你的中医知识</p>
            </div>

            {/* 内容 */}
            <div className="p-6">
              <div className="space-y-4">
                {tutorialSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    data-testid={`tutorial-step-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4 p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-2xl">
                      {step.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 mb-1">
                        {index + 1}. {step.title}
                      </h3>
                      <p className="text-sm text-gray-600">{step.content}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* 提示信息 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl"
              >
                <p className="text-sm text-amber-800">
                  <span className="font-bold">💡 小贴士：</span>
                  连续正确回答可以积累连击，获得额外分数奖励！
                </p>
              </motion.div>
            </div>

            {/* 底部按钮 */}
            <div className="p-6 pt-0">
              <motion.button
                data-testid="tutorial-start-button"
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 hover:shadow-xl transition-shadow"
              >
                开始驯服
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GameTutorial;

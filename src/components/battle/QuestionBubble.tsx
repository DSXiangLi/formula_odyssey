import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SpiritQuestion, AnswerEvaluation } from '../../systems/battle/types';

interface QuestionBubbleProps {
  spiritName: string;
  question: SpiritQuestion;
  evaluation: AnswerEvaluation | null;
  showHint: boolean;
}

const QuestionBubble: React.FC<QuestionBubbleProps> = ({
  spiritName,
  question,
  evaluation,
  showHint,
}) => {
  // 根据反馈状态获取背景色
  const getBackgroundColor = () => {
    if (evaluation) {
      return evaluation.isCorrect
        ? 'bg-green-50 border-green-300'
        : 'bg-red-50 border-red-300';
    }
    return 'bg-white border-gray-200';
  };

  // 获取药灵头像emoji（根据名称）
  const getSpiritEmoji = (name: string): string => {
    const emojiMap: Record<string, string> = {
      '人参': '🌿',
      '黄芪': '🌱',
      '当归': '🌸',
      '白术': '🍃',
      '茯苓': '🍄',
      '甘草': '🌾',
      '枸杞': '🫐',
      '党参': '🌲',
      '麦冬': '🌵',
      '五味子': '🍇',
    };
    // 尝试匹配前两个字
    for (const [key, emoji] of Object.entries(emojiMap)) {
      if (name.includes(key)) return emoji;
    }
    return '🧚'; // 默认药灵emoji
  };

  return (
    <motion.div
      data-testid="question-bubble"
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`rounded-2xl border-2 shadow-lg p-6 max-w-2xl mx-auto ${getBackgroundColor()}`}
    >
      {/* 药灵信息头部 */}
      <div data-testid="spirit-header" className="flex items-center gap-3 mb-4">
        <div
          data-testid="spirit-avatar"
          className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-2xl shadow-md"
        >
          {getSpiritEmoji(spiritName)}
        </div>
        <div>
          <h4
            data-testid="spirit-name"
            className="text-lg font-bold text-gray-800"
          >
            {spiritName}
          </h4>
          <span className="text-sm text-gray-500">药灵</span>
        </div>
      </div>

      {/* 问题文本 */}
      <div data-testid="question-text" className="mb-6">
        <p className="text-xl text-gray-800 leading-relaxed">
          <span className="text-gray-400 text-2xl mr-2">"</span>
          {question.question}
          <span className="text-gray-400 text-2xl ml-2">"</span>
        </p>
      </div>

      {/* 选择题选项 */}
      <AnimatePresence>
        {question.type === 'choice' && question.options && !evaluation && (
          <motion.div
            data-testid="choice-options"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-2 gap-3 mb-4"
          >
            {question.options.map((option, index) => (
              <div
                key={index}
                data-testid={`choice-option-${index}`}
                className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 text-center hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer"
              >
                <span className="inline-block w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-medium mr-2">
                  {String.fromCharCode(65 + index)}
                </span>
                {option}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 提示信息 */}
      <AnimatePresence>
        {showHint && !evaluation && (
          <motion.div
            data-testid="hint-section"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl"
          >
            <div className="flex items-start gap-2">
              <span className="text-yellow-500 text-xl">💡</span>
              <div>
                <p className="text-sm font-semibold text-yellow-800 mb-1">提示</p>
                <p data-testid="hint-text" className="text-yellow-700">
                  {question.hint}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 答案反馈 */}
      <AnimatePresence>
        {evaluation && (
          <motion.div
            data-testid="evaluation-section"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className={`p-4 rounded-xl border-2 ${
              evaluation.isCorrect
                ? 'bg-green-100 border-green-300'
                : 'bg-red-100 border-red-300'
            }`}
          >
            {/* 反馈头部 */}
            <div className="flex items-center gap-3 mb-3">
              <motion.span
                data-testid="evaluation-icon"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 10, delay: 0.1 }}
                className="text-3xl"
              >
                {evaluation.isCorrect ? '✓' : '✗'}
              </motion.span>
              <div>
                <p
                  data-testid="evaluation-result"
                  className={`font-bold text-lg ${
                    evaluation.isCorrect ? 'text-green-700' : 'text-red-700'
                  }`}
                >
                  {evaluation.isCorrect ? '回答正确！' : '回答错误'}
                </p>
                <p
                  data-testid="evaluation-score"
                  className="text-sm text-gray-600"
                >
                  得分: {evaluation.score}/5分
                </p>
              </div>
            </div>

            {/* 反馈文本 */}
            <p
              data-testid="evaluation-feedback"
              className={`text-gray-700 mb-3 italic ${
                evaluation.isCorrect ? 'text-green-800' : 'text-red-800'
              }`}
            >
              "{evaluation.feedback}"
            </p>

            {/* 额外知识 */}
            {evaluation.bonusInfo && (
              <motion.div
                data-testid="bonus-info"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <p className="text-sm font-semibold text-blue-800 mb-1">
                  📚 额外知识
                </p>
                <p className="text-blue-700 text-sm">{evaluation.bonusInfo}</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default QuestionBubble;

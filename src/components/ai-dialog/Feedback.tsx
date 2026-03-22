import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@utils/index';
import type { FeedbackProps } from './types';

export default function Feedback({
  isCorrect,
  correctAnswer,
  playerAnswer,
  reward,
  explanation,
  onNext,
  onRetry,
  onAskHelp,
}: FeedbackProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="text-center py-8 px-4"
      >
        {isCorrect ? (
          <CorrectFeedback
            correctAnswer={correctAnswer}
            reward={reward}
            explanation={explanation}
            onNext={onNext}
          />
        ) : (
          <IncorrectFeedback
            correctAnswer={correctAnswer}
            playerAnswer={playerAnswer}
            onRetry={onRetry}
            onAskHelp={onAskHelp}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// 正确反馈组件
interface CorrectFeedbackProps {
  correctAnswer?: string;
  reward?: {
    diamonds: number;
    affinityBonus?: number;
    title?: string;
  };
  explanation?: string;
  onNext: () => void;
}

function CorrectFeedback({
  correctAnswer,
  reward,
  explanation,
  onNext,
}: CorrectFeedbackProps) {
  return (
    <>
      {/* 成功动画 */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.1 }}
        className="relative"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-24 h-24 rounded-full border-4 border-dashed border-green-400/30" />
        </motion.div>
        <div className="text-6xl mb-4">🎉</div>
      </motion.div>

      {/* 标题 */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold text-status-success mb-2"
      >
        回答正确！
      </motion.h3>

      {/* 正确答案 */}
      {correctAnswer && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-text-secondary mb-4"
        >
          正确答案是：<span className="text-xl font-bold text-primary">{correctAnswer}</span>
        </motion.p>
      )}

      {/* 奖励展示 */}
      {reward && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-status-success/10 border border-status-success/30 rounded-2xl p-6 mb-6"
        >
          <p className="text-sm text-text-secondary mb-3">获得奖励</p>
          <div className="flex justify-center gap-6 flex-wrap">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="flex items-center gap-2"
            >
              <span className="text-3xl">💎</span>
              <span className="text-xl font-bold text-text-primary">+{reward.diamonds}</span>
            </motion.div>

            {reward.affinityBonus && reward.affinityBonus > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: 'spring' }}
                className="flex items-center gap-2"
              >
                <span className="text-3xl">❤️</span>
                <span className="text-xl font-bold text-text-primary">+{reward.affinityBonus}</span>
              </motion.div>
            )}

            {reward.title && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: 'spring' }}
                className="flex items-center gap-2"
              >
                <span className="text-3xl">🏆</span>
                <span className="text-lg font-bold text-yellow-500">{reward.title}</span>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* 解析 */}
      {explanation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-background-tertiary/50 rounded-xl p-4 mb-6 text-left"
        >
          <p className="text-sm font-medium text-text-secondary mb-2">💡 解析</p>
          <p className="text-sm text-text-primary leading-relaxed">{explanation}</p>
        </motion.div>
      )}

      {/* 下一题按钮 */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onNext}
        className="px-8 py-3 bg-status-success text-white rounded-xl font-medium hover:bg-status-success/90 transition-colors shadow-lg shadow-green-500/25"
      >
        继续下一题 →
      </motion.button>
    </>
  );
}

// 错误反馈组件
interface IncorrectFeedbackProps {
  correctAnswer?: string;
  playerAnswer: string;
  onRetry: () => void;
  onAskHelp: () => void;
}

function IncorrectFeedback({
  correctAnswer,
  playerAnswer,
  onRetry,
  onAskHelp,
}: IncorrectFeedbackProps) {
  return (
    <>
      {/* 错误动画 */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.1 }}
        className="relative mb-4"
      >
        <motion.div
          animate={{ x: [-5, 5, -5, 5, 0] }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-6xl"
        >
          😔
        </motion.div>
      </motion.div>

      {/* 标题 */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-xl font-bold text-status-error mb-2"
      >
        回答不正确
      </motion.h3>

      {/* 玩家答案 */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-text-secondary mb-4"
      >
        你的答案：<span className="text-status-error line-through">{playerAnswer}</span>
      </motion.p>

      {/* 提示 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-status-error/10 border border-status-error/20 rounded-xl p-4 mb-6"
      >
        <p className="text-sm text-text-secondary">
          别灰心！中医学习需要积累。
          <br />
          你可以选择求助师兄，或者再试一次。
        </p>
      </motion.div>

      {/* 操作按钮 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex gap-3 justify-center"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
          className="px-6 py-3 bg-background-tertiary text-text-primary rounded-xl font-medium hover:bg-background-tertiary/80 transition-colors"
        >
          重新答题
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAskHelp}
          className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
        >
          💡 求助师兄
        </motion.button>
      </motion.div>
    </>
  );
}

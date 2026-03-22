import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@utils/index';
import type { HintModalProps } from './types';
import { ROLE_CONFIG } from './types';

export default function HintModal({
  isOpen,
  onClose,
  socraticResponse,
  onContinue,
  onShowAnswer,
  conversationRound,
}: HintModalProps) {
  const socratesConfig = ROLE_CONFIG.socrates;
  const isAnswer = socraticResponse.responseType === 'answer';
  const canShowAnswer = conversationRound >= 3 || socraticResponse.giveUp;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            className="relative w-full max-w-lg bg-background-secondary rounded-2xl border border-background-tertiary shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-background-tertiary text-text-secondary hover:text-text-primary transition-colors"
            >
              ✕
            </button>

            {/* 标题区 */}
            <div className="bg-gradient-to-r from-blue-500/20 to-transparent p-6 border-b border-background-tertiary">
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ rotate: -10 }}
                  animate={{ rotate: 0 }}
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                  style={{ backgroundColor: socratesConfig.color }}
                >
                  {socratesConfig.avatar}
                </motion.div>
                <div>
                  <h2 className="text-xl font-bold text-text-primary">
                    {isAnswer ? '答案揭晓' : '师兄的引导'}
                  </h2>
                  <p className="text-sm text-text-secondary">
                    {isAnswer
                      ? '让我来给你详细讲解'
                      : `第 ${conversationRound} 轮引导，用心思考哦`}
                  </p>
                </div>
              </div>
            </div>

            {/* 内容区 */}
            <div className="p-6">
              {/* 师兄的对话气泡 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex gap-3 mb-6"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0"
                  style={{ backgroundColor: socratesConfig.color }}
                >
                  {socratesConfig.avatar}
                </div>
                <div className="flex-1">
                  <div
                    className={cn(
                      'px-4 py-3 rounded-2xl rounded-tl-sm',
                      socratesConfig.bgColor
                    )}
                  >
                    <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                      {socraticResponse.content}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* 如果是引导，显示下一步问题 */}
              {socraticResponse.nextQuestion && !isAnswer && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="ml-14 mb-6"
                >
                  <div className="bg-background-tertiary/50 rounded-lg p-3 border-l-4 border-blue-500">
                    <p className="text-sm text-text-secondary">
                      <span className="text-blue-500 font-medium">思考方向：</span>
                      {socraticResponse.nextQuestion}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* 操作按钮 */}
              <div className="flex gap-3 justify-center">
                {!isAnswer && (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onContinue}
                      className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
                    >
                      继续思考
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onShowAnswer}
                      disabled={!canShowAnswer}
                      className={cn(
                        'px-6 py-3 rounded-xl font-medium transition-colors',
                        canShowAnswer
                          ? 'bg-background-tertiary text-text-primary hover:bg-background-tertiary/80'
                          : 'bg-background-tertiary/50 text-text-muted cursor-not-allowed'
                      )}
                    >
                      {canShowAnswer ? '显示答案' : `还需 ${3 - conversationRound} 轮`}
                    </motion.button>
                  </>
                )}

                {isAnswer && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
                  >
                    明白了
                  </motion.button>
                )}
              </div>
            </div>

            {/* 底部进度指示器 */}
            {!isAnswer && (
              <div className="px-6 pb-6">
                <div className="flex justify-center gap-1">
                  {[1, 2, 3].map((round) => (
                    <div
                      key={round}
                      className={cn(
                        'w-8 h-1 rounded-full transition-colors',
                        round <= conversationRound ? 'bg-blue-500' : 'bg-background-tertiary'
                      )}
                    />
                  ))}
                </div>
                <p className="text-center text-xs text-text-muted mt-2">
                  {conversationRound < 3
                    ? '最多3轮引导后可直接查看答案'
                    : '已达到最大引导轮数，可查看答案'}
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@stores/gameStore'
import { generateQuiz } from '@services/aiService'
import { useSound } from '@services/soundService'
import { cn } from '@utils/index'

interface ExploreModalProps {
  onClose: () => void
}

export default function ExploreModal({ onClose }: ExploreModalProps) {
  const { useExploreChance, addCurrency } = useGameStore()
  const [quiz, setQuiz] = useState<{
    question: string
    options: string[]
    correctIndex: number
    explanation: string
  } | null>(null)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [loading, setLoading] = useState(true)
  const [reward, setReward] = useState<{ seeds: number; currency: number } | null>(null)
  const { play } = useSound()

  useEffect(() => {
    loadQuiz()
  }, [])

  const loadQuiz = async () => {
    setLoading(true)
    const newQuiz = await generateQuiz('normal')
    setQuiz(newQuiz)
    setLoading(false)
  }

  const handleOptionClick = (index: number) => {
    if (selectedOption !== null) return
    setSelectedOption(index)
  }

  const handleSubmit = () => {
    if (selectedOption === null || !quiz) return

    const correct = selectedOption === quiz.correctIndex
    setIsCorrect(correct)
    setShowResult(true)

    if (correct) {
      // 消耗探索次数
      useExploreChance()
      // 播放成功音效
      play('explore-success')
      // 发放奖励
      const currencyReward = Math.floor(Math.random() * 20) + 10
      addCurrency(currencyReward)
      setReward({ seeds: 1, currency: currencyReward })
    } else {
      // 播放失败音效
      play('explore-fail')
    }
  }

  const handleClose = () => {
    if (showResult && isCorrect) {
      onClose()
    } else {
      onClose()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        className="relative w-full max-w-lg bg-background-secondary rounded-2xl p-6 border border-background-tertiary shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 关闭按钮 */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-background-tertiary text-text-secondary hover:text-text-primary transition-colors"
        >
          ✕
        </button>

        {/* 标题 */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-text-primary font-title mb-2">
            🔍 药灵试炼
          </h2>
          <p className="text-sm text-text-secondary">
            回答正确即可获得药灵种子奖励
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full"
            />
            <p className="mt-4 text-text-secondary">正在生成题目...</p>
          </div>
        ) : quiz ? (
          <AnimatePresence mode="wait">
            {!showResult ? (
              <motion.div
                key="quiz"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* 题目 */}
                <div className="bg-background-tertiary/50 rounded-xl p-4 mb-6">
                  <p className="text-text-primary text-lg leading-relaxed">
                    {quiz.question}
                  </p>
                </div>

                {/* 选项 */}
                <div className="grid grid-cols-1 gap-3 mb-6">
                  {quiz.options.map((option, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: selectedOption === null ? 1.02 : 1 }}
                      whileTap={{ scale: selectedOption === null ? 0.98 : 1 }}
                      onClick={() => handleOptionClick(index)}
                      className={cn(
                        'w-full p-4 rounded-xl text-left transition-all duration-200',
                        selectedOption === index
                          ? 'bg-primary text-background-primary'
                          : 'bg-background-tertiary/50 text-text-primary hover:bg-background-tertiary'
                      )}
                    >
                      <span className="font-medium mr-3">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      {option}
                    </motion.button>
                  ))}
                </div>

                {/* 提交按钮 */}
                <button
                  onClick={handleSubmit}
                  disabled={selectedOption === null}
                  className={cn(
                    'w-full py-3 rounded-xl font-medium transition-all duration-200',
                    selectedOption !== null
                      ? 'btn-primary'
                      : 'bg-background-tertiary text-text-muted cursor-not-allowed'
                  )}
                >
                  提交答案
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                {isCorrect ? (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.2 }}
                      className="text-6xl mb-4"
                    >
                      ✨
                    </motion.div>
                    <h3 className="text-xl font-bold text-status-success mb-2">
                      回答正确！
                    </h3>
                    <p className="text-text-secondary mb-4">
                      {quiz.explanation}
                    </p>

                    {reward && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-status-success/20 rounded-xl p-4 mb-6"
                      >
                        <p className="text-sm text-text-secondary mb-2">获得奖励</p>
                        <div className="flex justify-center gap-6">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">🌿</span>
                            <span className="text-text-primary">随机种子 ×{reward.seeds}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">💎</span>
                            <span className="text-text-primary">+{reward.currency}</span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <button onClick={handleClose} className="btn-primary">
                      收入囊中
                    </button>
                  </>
                ) : (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.2 }}
                      className="text-6xl mb-4"
                    >
                      📚
                    </motion.div>
                    <h3 className="text-xl font-bold text-status-error mb-2">
                      回答错误
                    </h3>
                    <p className="text-text-secondary mb-2">
                      正确答案是：{quiz.options[quiz.correctIndex]}
                    </p>
                    <p className="text-sm text-text-muted mb-6">
                      {quiz.explanation}
                    </p>
                    <div className="flex gap-3">
                      <button onClick={handleClose} className="btn-secondary flex-1">
                        返回山谷
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        ) : null}
      </motion.div>
    </motion.div>
  )
}

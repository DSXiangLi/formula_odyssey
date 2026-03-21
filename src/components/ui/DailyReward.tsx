import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface DailyRewardProps {
  seeds: number
  currency: number
  streak: number
  onClose: () => void
}

export default function DailyReward({ seeds, currency, streak, onClose }: DailyRewardProps) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false)
      onClose()
    }, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className="absolute top-24 left-1/2 -translate-x-1/2 z-50 bg-background-secondary/95 backdrop-blur-md rounded-2xl p-6 border border-primary/30 shadow-2xl"
          style={{ minWidth: '300px' }}
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="text-4xl mb-2"
            >
              🎁
            </motion.div>
            <h3 className="text-lg font-bold text-primary mb-1">每日登录奖励</h3>
            <p className="text-sm text-text-secondary mb-4">
              连续登录 {streak} 天
            </p>

            <div className="flex justify-center gap-6 mb-4">
              <div className="flex flex-col items-center">
                <span className="text-2xl">🌿</span>
                <span className="text-sm text-text-primary mt-1">随机种子 ×{seeds}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl">💎</span>
                <span className="text-sm text-text-primary mt-1">方灵点数 +{currency}</span>
              </div>
            </div>

            {streak >= 3 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-primary/20 rounded-lg px-3 py-2 mb-4"
              >
                <p className="text-xs text-primary">
                  ✨ 3天连续登录额外奖励已发放！
                </p>
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShow(false)
                onClose()
              }}
              className="btn-primary w-full"
            >
              领取奖励
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

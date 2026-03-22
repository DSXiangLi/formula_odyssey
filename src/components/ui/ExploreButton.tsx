import { motion } from 'framer-motion'
import { useGameStore } from '@stores/gameStore'

export default function ExploreButton() {
  const { player, setExploreOpen } = useGameStore()
  const exploreCount = player.exploreCount ?? 3
  const canExplore = exploreCount > 0

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, duration: 0.3, type: 'spring' }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setExploreOpen(true)}
      className="absolute bottom-8 right-8 z-40 flex flex-col items-center gap-2"
    >
      <motion.div
        animate={canExplore ? {
          rotate: [0, 360],
          boxShadow: [
            '0 0 20px rgba(201, 169, 97, 0.5)',
            '0 0 40px rgba(201, 169, 97, 0.8)',
            '0 0 20px rgba(201, 169, 97, 0.5)',
          ],
        } : {}}
        transition={{
          rotate: { duration: 8, repeat: Infinity, ease: 'linear' },
          boxShadow: { duration: 2, repeat: Infinity },
        }}
        className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl ${
          canExplore
            ? 'bg-gradient-to-br from-primary to-primary-dark cursor-pointer'
            : 'bg-background-tertiary cursor-not-allowed'
        }`}
        style={{
          boxShadow: canExplore ? '0 0 20px rgba(201, 169, 97, 0.5)' : 'none',
        }}
      >
        {canExplore ? '✦' : '⏳'}
      </motion.div>
      <div className="text-center">
        <p className={`text-sm font-medium ${canExplore ? 'text-primary' : 'text-text-muted'}`}>
          探索
        </p>
        <p className="text-xs text-text-muted">
          今日剩余: {exploreCount}/3
        </p>
      </div>
    </motion.button>
  )
}

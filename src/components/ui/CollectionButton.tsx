import { motion } from 'framer-motion'
import { useGameStore } from '@stores/gameStore'

export default function CollectionButton() {
  const { setCollectionOpen, getCollectedCount } = useGameStore()
  const collectedCount = getCollectedCount()
  const totalCount = 50

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1.2, duration: 0.3, type: 'spring' }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setCollectionOpen(true)}
      className="absolute top-24 right-6 z-40 flex items-center gap-2 bg-background-secondary/80 backdrop-blur-sm rounded-full px-4 py-2 hover:bg-background-tertiary transition-colors"
    >
      <motion.span
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        className="text-xl"
      >
        📖
      </motion.span>
      <span className="text-sm text-text-primary font-medium">
        {collectedCount}/{totalCount}
      </span>
    </motion.button>
  )
}

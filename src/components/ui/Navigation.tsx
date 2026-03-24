import { motion } from 'framer-motion'
import { useGameStore } from '@stores/gameStore'
import { cn } from '@utils/index'
import { WuxingType } from '../../types/index'

const wuxingRegions: { id: WuxingType; name: string; icon: string }[] = [
  { id: WuxingType.Wood, name: '青木林', icon: '🌳' },
  { id: WuxingType.Fire, name: '赤焰峰', icon: '🔥' },
  { id: WuxingType.Earth, name: '黄土丘', icon: '🏔️' },
  { id: WuxingType.Metal, name: '白金原', icon: '⛰️' },
  { id: WuxingType.Water, name: '黑水潭', icon: '💧' },
]

export default function Navigation() {
  const { currentRegion, setCurrentRegion, getCollectedCount, player, setFormulaPursuitOpen } = useGameStore()
  const collectedCount = getCollectedCount()
  const totalCount = 50

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/60 to-transparent"
    >
      {/* 左侧：返回按钮和标题 */}
      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-icon"
          onClick={() => window.location.reload()}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </motion.button>
        <div>
          <h1 className="text-xl font-bold text-text-primary font-title">药灵山谷</h1>
          <p className="text-sm text-text-secondary">探索 · 收集 · 学习</p>
        </div>
      </div>

      {/* 中间：五行区域导航 */}
      <div className="hidden md:flex items-center gap-2 bg-background-secondary/80 backdrop-blur-sm rounded-full px-4 py-2">
        {wuxingRegions.map((region) => (
          <motion.button
            key={region.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentRegion(region.id)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
              currentRegion === region.id
                ? 'bg-primary text-background-primary'
                : 'text-text-secondary hover:text-text-primary hover:bg-background-tertiary'
            )}
          >
            <span className="mr-1">{region.icon}</span>
            {region.name}
          </motion.button>
        ))}
      </div>

      {/* 右侧：收集进度 */}
      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setFormulaPursuitOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 backdrop-blur-sm rounded-full px-4 py-2 text-white font-medium hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-200"
        >
          <span>📜</span>
          <span className="text-sm">追缉令</span>
        </motion.button>
        <div className="flex items-center gap-2 bg-background-secondary/80 backdrop-blur-sm rounded-full px-4 py-2">
          <span className="text-primary">📖</span>
          <span className="text-sm text-text-primary">
            {collectedCount}/{totalCount}
          </span>
        </div>
        <div className="flex items-center gap-2 bg-background-secondary/80 backdrop-blur-sm rounded-full px-4 py-2">
          <span className="text-primary">💎</span>
          <span className="text-sm text-text-primary font-mono">
            {player.currency.toLocaleString()}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

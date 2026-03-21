import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@stores/gameStore'
import type { Seed as SeedType } from '@types/index'
import { cn } from '@utils/index'
import { useSound } from '@services/soundService'
import { SeedPlaceholder } from '@components/ui/ImageSystem'

interface SeedProps {
  seed: SeedType
  containerWidth: number
  containerHeight: number
}

export default function Seed({ seed, containerWidth, containerHeight }: SeedProps) {
  const { collectSeed, setSelectedMedicine, medicines } = useGameStore()
  const [isHovered, setIsHovered] = useState(false)
  const [showCollectAnimation, setShowCollectAnimation] = useState(false)
  const { play } = useSound()

  const medicine = medicines.find(m => m.id === seed.medicineId)
  if (!medicine) return null

  const handleClick = () => {
    if (seed.collected) {
      play('button-click')
      setSelectedMedicine(seed.medicineId)
    } else {
      play('seed-collect')
      setShowCollectAnimation(true)
      setTimeout(() => {
        collectSeed(seed.id)
        setShowCollectAnimation(false)
      }, 1500)
    }
  }

  const handleHover = (hovering: boolean) => {
    setIsHovered(hovering)
    if (hovering && !seed.collected) {
      play('seed-hover')
    }
  }

  // 计算实际位置（百分比转为像素）
  const x = (seed.position.x / 100) * containerWidth
  const y = (seed.position.y / 100) * containerHeight

  return (
    <>
      {/* 种子主体 */}
      <motion.div
        className="absolute cursor-pointer"
        style={{
          left: x - 30,
          top: y - 30,
          width: 60,
          height: 60,
        }}
        onMouseEnter={() => handleHover(true)}
        onMouseLeave={() => handleHover(false)}
        onClick={handleClick}
        animate={{
          y: isHovered && !seed.collected ? -8 : 0,
          scale: isHovered ? 1.1 : 1,
        }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {/* 使用SVG占位符 */}
        <SeedPlaceholder
          collected={seed.collected}
          className="w-full h-full"
        />

        {/* 标签 */}
        <motion.div
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap"
          animate={{ opacity: isHovered ? 1 : 0.7 }}
        >
          <span className={cn(
            'text-xs font-medium px-2 py-1 rounded-full',
            seed.collected
              ? 'bg-primary text-background-primary'
              : 'bg-background-tertiary/80 text-text-muted'
          )}>
            {seed.collected ? medicine.name : '???'}
          </span>
        </motion.div>
      </motion.div>

      {/* 收集动画 */}
      <AnimatePresence>
        {showCollectAnimation && (
          <CollectAnimation x={x} y={y} onComplete={() => setShowCollectAnimation(false)} />
        )}
      </AnimatePresence>
    </>
  )
}

// 收集动画组件
function CollectAnimation({ x, y, onComplete }: { x: number; y: number; onComplete: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute pointer-events-none z-50"
      style={{ left: x - 50, top: y - 50 }}
    >
      {/* 破碎效果 */}
      <motion.div
        initial={{ scale: 0.8, opacity: 1 }}
        animate={{ scale: 1.5, opacity: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="absolute inset-0 w-[100px] h-[100px]"
      >
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary rounded-full"
            style={{
              left: '50%',
              top: '50%',
            }}
            animate={{
              x: Math.cos((i / 8) * Math.PI * 2) * 40,
              y: Math.sin((i / 8) * Math.PI * 2) * 40,
              opacity: [1, 0],
              scale: [1, 0.5],
            }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ))}
      </motion.div>

      {/* 光芒爆发 */}
      <motion.div
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="absolute inset-0 w-[100px] h-[100px] rounded-full bg-primary/50"
      />

      {/* 药材显现 */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3, type: 'spring' }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <motion.span
          className="text-4xl"
          animate={{
            y: [-20, 0],
            filter: ['blur(4px)', 'blur(0px)'],
          }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          🌿
        </motion.span>
      </motion.div>

      {/* 飞入图鉴动画 */}
      <motion.div
        initial={{ x: 0, y: 0, opacity: 1 }}
        animate={{
          x: window.innerWidth - x - 100,
          y: 100 - y,
          opacity: 0,
          scale: 0.5,
        }}
        transition={{ delay: 0.8, duration: 0.7, ease: 'easeIn' }}
        className="absolute left-[40px] top-[40px]"
        onAnimationComplete={onComplete}
      >
        <span className="text-2xl">🌿</span>
      </motion.div>
    </motion.div>
  )
}

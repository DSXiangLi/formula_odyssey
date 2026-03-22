import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@stores/gameStore'
import type { Seed as SeedType, Medicine } from '../../types/index'
import { cn } from '@utils/index'
import { useSound } from '@services/soundService'
import DiagnosisModal from '@components/explore/DiagnosisModal'

interface SeedProps {
  seed: SeedType
  containerWidth: number
  containerHeight: number
}

export default function Seed({ seed, containerWidth, containerHeight }: SeedProps) {
  const { setSelectedMedicine, medicines } = useGameStore()
  const [isHovered, setIsHovered] = useState(false)
  const [showCollectAnimation, setShowCollectAnimation] = useState(false)
  const [showDiagnosis, setShowDiagnosis] = useState(false)
  const { play } = useSound()

  const medicine = medicines.find(m => m.id === seed.medicineId)
  if (!medicine) return null

  // 计算实际位置（百分比转为像素）
  const x = (seed.position.x / 100) * containerWidth
  const y = (seed.position.y / 100) * containerHeight

  const handleClick = () => {
    if (seed.collected) {
      // 已收集，查看详情
      play('button-click')
      setSelectedMedicine(seed.medicineId)
    } else {
      // 未收集，打开性味归经探查
      play('diagnosis-open')
      setShowDiagnosis(true)
    }
  }

  const handleHover = (hovering: boolean) => {
    setIsHovered(hovering)
    if (hovering && !seed.collected) {
      play('seed-hover')
    }
  }

  const handleDiagnosisClose = () => {
    setShowDiagnosis(false)
    // 如果已收集，播放收集动画
    if (seed.collected) {
      setShowCollectAnimation(true)
      setTimeout(() => {
        setShowCollectAnimation(false)
      }, 1500)
    }
  }

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
        {/* 水晶球种子 */}
        <CrystalBallSeed
          seed={seed}
          medicine={medicine}
          isHovered={isHovered}
        />

        {/* 标签 */}
        <motion.div
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap"
          animate={{ opacity: isHovered ? 1 : 0.7 }}
        >
          <span className={cn(
            'text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm',
            seed.collected
              ? 'bg-primary/90 text-background-primary'
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

      {/* 性味归经探查弹窗 */}
      <AnimatePresence>
        {showDiagnosis && !seed.collected && (
          <DiagnosisModal
            seed={seed}
            medicine={medicine}
            onClose={handleDiagnosisClose}
          />
        )}
      </AnimatePresence>
    </>
  )
}

// 水晶球种子组件
function CrystalBallSeed({
  seed,
  medicine,
  isHovered,
}: {
  seed: SeedType
  medicine: Medicine
  isHovered: boolean
}) {
  const wuxingColors = {
    wood: '#2E7D32',
    fire: '#C62828',
    earth: '#F9A825',
    metal: '#78909C',
    water: '#1565C0',
  }

  const color = wuxingColors[seed.wuxing]

  return (
    <div className="relative w-full h-full">
      {/* 外发光效果 */}
      <motion.div
        animate={{
          boxShadow: isHovered
            ? `0 0 25px ${color}80, 0 0 50px ${color}40`
            : `0 0 15px ${color}40`,
        }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 rounded-full"
      />

      {/* 水晶球主体 */}
      <div className="relative w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-white/30 via-white/10 to-transparent backdrop-blur-sm border border-white/50">
        {/* 内部模糊药物图 */}
        <div className="absolute inset-1 rounded-full overflow-hidden">
          {medicine.imagePlant ? (
            <img
              src={medicine.imagePlant}
              alt="药物"
              className="w-full h-full object-cover"
              style={{ filter: 'blur(4px)' }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-transparent">
              <span className="text-2xl opacity-30">🌿</span>
            </div>
          )}
        </div>

        {/* 水晶折射效果 */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent" />
        <div className="absolute top-2 left-2 w-4 h-4 bg-white/60 rounded-full blur-sm" />
        <div className="absolute bottom-3 right-3 w-2 h-2 bg-white/50 rounded-full" />

        {/* 已收集标记 */}
        {seed.collected && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-8 h-8 rounded-full bg-status-success flex items-center justify-center"
            >
              <span className="text-white text-sm">✓</span>
            </motion.div>
          </div>
        )}
      </div>

      {/* 呼吸动画光环 */}
      {!seed.collected && (
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 rounded-full border-2 border-white/30"
          style={{ margin: '-4px' }}
        />
      )}
    </div>
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

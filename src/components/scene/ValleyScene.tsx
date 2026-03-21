import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@stores/gameStore'
import type { RegionType } from '@types/index'
import Seed from '@components/seed/Seed'
import ParticleSystem from './ParticleSystem'

const regionConfig: Record<RegionType, {
  name: string
  particleType: 'snow' | 'light' | 'petal' | 'mist' | 'sparkle'
  bgImage: string
}> = {
  mountain: {
    name: '高山区域',
    particleType: 'snow',
    bgImage: '/images/region_mountain.jpg',
  },
  forest: {
    name: '林间区域',
    particleType: 'light',
    bgImage: '/images/region_forest.jpg',
  },
  flower: {
    name: '花田区域',
    particleType: 'petal',
    bgImage: '/images/region_flower.jpg',
  },
  stream: {
    name: '溪边区域',
    particleType: 'mist',
    bgImage: '/images/region_stream.jpg',
  },
  cliff: {
    name: '岩壁区域',
    particleType: 'sparkle',
    bgImage: '/images/region_cliff.jpg',
  },
}

export default function ValleyScene() {
  const { currentRegion, getSeedsByRegion } = useGameStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [imageLoaded, setImageLoaded] = useState(false)

  // 更新尺寸
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        })
      }
    }
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  const regionSeeds = getSeedsByRegion(currentRegion)
  const config = regionConfig[currentRegion]

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
    >
      {/* AI生成背景图 */}
      <motion.div
        key={currentRegion}
        initial={{ opacity: 0 }}
        animate={{ opacity: imageLoaded ? 1 : 0 }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0"
      >
        <img
          src={config.bgImage}
          alt={config.name}
          className="w-full h-full object-cover"
          onLoad={() => setImageLoaded(true)}
        />
        {/* 渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
      </motion.div>

      {/* 粒子效果 */}
      <ParticleSystem
        type={config.particleType}
        width={dimensions.width}
        height={dimensions.height}
      />

      {/* 区域标题 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="absolute top-32 left-1/2 -translate-x-1/2 z-10"
      >
        <h2 className="text-2xl font-bold text-white font-title flex items-center gap-2 drop-shadow-lg">
          {currentRegion === 'mountain' && '🏔️'}
          {currentRegion === 'forest' && '🌳'}
          {currentRegion === 'flower' && '🌸'}
          {currentRegion === 'stream' && '🌊'}
          {currentRegion === 'cliff' && '🪨'}
          {config.name}
        </h2>
      </motion.div>

      {/* 种子层 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentRegion}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 z-20"
        >
          {regionSeeds.map((seed, index) => (
            <motion.div
              key={seed.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: index * 0.1,
                duration: 0.3,
                type: 'spring',
              }}
            >
              <Seed
                seed={seed}
                containerWidth={dimensions.width}
                containerHeight={dimensions.height}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* 区域切换提示 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-white/70 text-sm drop-shadow"
      >
        左右滑动或点击导航切换区域
      </motion.div>
    </div>
  )
}

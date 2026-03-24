import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@stores/gameStore'
import type { WuxingType } from '../../types/index'
import Seed from '@components/seed/Seed'
import ParticleSystem from './ParticleSystem'

const regionConfig: Record<WuxingType | string, {
  name: string
  particleType: 'snow' | 'light' | 'petal' | 'mist' | 'sparkle'
  bgImage: string
  icon: string
}> = {
  wood: {
    name: '青木林',
    particleType: 'petal',
    bgImage: '/images/scenes/qingmulin_bg.jpg',
    icon: '🌳',
  },
  fire: {
    name: '赤焰峰',
    particleType: 'light',
    bgImage: '/images/scenes/chiyanfeng_bg.jpg',
    icon: '🔥',
  },
  earth: {
    name: '黄土丘',
    particleType: 'petal',
    bgImage: '/images/scenes/huangtuqiu_bg.jpg',
    icon: '🏔️',
  },
  metal: {
    name: '白金原',
    particleType: 'sparkle',
    bgImage: '/images/scenes/baijinyuan_bg.jpg',
    icon: '⛰️',
  },
  water: {
    name: '黑水潭',
    particleType: 'mist',
    bgImage: '/images/scenes/heishuitan_bg.jpg',
    icon: '💧',
  },
  // 向后兼容
  mountain: {
    name: '山地区',
    particleType: 'sparkle',
    bgImage: '/images/scenes/baijinyuan_bg.jpg',
    icon: '⛰️',
  },
  forest: {
    name: '森林区',
    particleType: 'petal',
    bgImage: '/images/scenes/qingmulin_bg.jpg',
    icon: '🌳',
  },
  flower: {
    name: '花丛区',
    particleType: 'petal',
    bgImage: '/images/scenes/huangtuqiu_bg.jpg',
    icon: '🌸',
  },
  stream: {
    name: '溪流区',
    particleType: 'mist',
    bgImage: '/images/scenes/heishuitan_bg.jpg',
    icon: '💧',
  },
  cliff: {
    name: '悬崖区',
    particleType: 'light',
    bgImage: '/images/scenes/chiyanfeng_bg.jpg',
    icon: '🔥',
  },
}

export default function ValleyScene() {
  const { currentRegion, getSeedsByWuxing } = useGameStore()
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

  const regionSeeds = getSeedsByWuxing(currentRegion as WuxingType)
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
          {config.icon}
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
          {regionSeeds.filter(seed => seed.discovered).map((seed, index) => (
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

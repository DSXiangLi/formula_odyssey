import { motion } from 'framer-motion'
import { cn } from '@utils/index'
import type { Chapter, ChapterProgress } from '../../types/chapter'
import type { WuxingType } from '../../types/index'

interface ChapterCardProps {
  chapter: Chapter
  isUnlocked: boolean
  isCompleted: boolean
  isCurrent: boolean
  progress?: ChapterProgress
  onClick: () => void
}

const wuxingColors: Record<WuxingType, { primary: string; light: string; dark: string; glow: string }> = {
  wood: {
    primary: '#2E7D32',
    light: '#81C784',
    dark: '#1B5E20',
    glow: 'rgba(46, 125, 50, 0.5)',
  },
  fire: {
    primary: '#C62828',
    light: '#EF5350',
    dark: '#B71C1C',
    glow: 'rgba(198, 40, 40, 0.5)',
  },
  earth: {
    primary: '#F9A825',
    light: '#FFD54F',
    dark: '#F57F17',
    glow: 'rgba(249, 168, 37, 0.5)',
  },
  metal: {
    primary: '#78909C',
    light: '#B0BEC5',
    dark: '#546E7A',
    glow: 'rgba(120, 144, 156, 0.5)',
  },
  water: {
    primary: '#1565C0',
    light: '#42A5F5',
    dark: '#0D47A1',
    glow: 'rgba(21, 101, 192, 0.5)',
  },
}

const wuxingIcons: Record<WuxingType, string> = {
  wood: '🌳',
  fire: '🔥',
  earth: '🏔️',
  metal: '⛰️',
  water: '💧',
}

export default function ChapterCard({
  chapter,
  isUnlocked,
  isCompleted,
  isCurrent,
  progress,
  onClick,
}: ChapterCardProps) {
  const colors = wuxingColors[chapter.wuxing]
  const collectedCount = progress?.collectedMedicines.length || 0
  const totalMedicines = chapter.medicines.length
  const progressPercent = totalMedicines > 0 ? (collectedCount / totalMedicines) * 100 : 0

  return (
    <motion.button
      whileHover={isUnlocked ? { scale: 1.05, y: -4 } : {}}
      whileTap={isUnlocked ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={!isUnlocked}
      className={cn(
        'relative w-full aspect-square rounded-2xl overflow-hidden transition-all duration-300',
        isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed opacity-70',
        isCurrent && 'ring-4 ring-white/50 animate-pulse-slow'
      )}
      style={{
        background: isUnlocked
          ? `linear-gradient(135deg, ${colors.dark} 0%, ${colors.primary} 50%, ${colors.light} 100%)`
          : 'linear-gradient(135deg, #3D3D3D 0%, #2D2D2D 100%)',
        boxShadow: isCurrent
          ? `0 0 30px ${colors.glow}, 0 0 60px ${colors.glow}`
          : isUnlocked
          ? `0 4px 20px rgba(0,0,0,0.3), 0 0 20px ${colors.glow}`
          : '0 4px 20px rgba(0,0,0,0.3)',
      }}
    >
      {/* 背景装饰 */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl"
          style={{ background: colors.light }}
        />
        <div
          className="absolute bottom-0 left-0 w-16 h-16 rounded-full blur-xl"
          style={{ background: colors.primary }}
        />
      </div>

      {/* 锁定遮罩 */}
      {!isUnlocked && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            className="text-4xl"
          >
            🔒
          </motion.div>
        </div>
      )}

      {/* 完成标记 */}
      {isCompleted && (
        <div className="absolute top-2 right-2 z-20">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center shadow-lg"
          >
            <span className="text-sm">✓</span>
          </motion.div>
        </div>
      )}

      {/* 当前标记 */}
      {isCurrent && (
        <div className="absolute -top-1 -left-1 z-20">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="px-2 py-0.5 rounded-full bg-white text-black text-xs font-bold"
          >
            进行中
          </motion.div>
        </div>
      )}

      {/* 内容 */}
      <div className="relative z-10 p-4 flex flex-col h-full">
        {/* 章节序号 */}
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-2xl font-bold"
            style={{ color: isUnlocked ? colors.light : '#707070' }}
          >
            {chapter.sequence.toString().padStart(2, '0')}
          </span>
          <span className="text-xl">{wuxingIcons[chapter.wuxing]}</span>
        </div>

        {/* 章节名称 */}
        <h3
          className="text-sm font-bold mb-1 line-clamp-2 flex-grow"
          style={{ color: isUnlocked ? '#FFFFFF' : '#B0B0B0' }}
        >
          {chapter.name}
        </h3>

        {/* 分类标签 */}
        <p
          className="text-xs mb-2 truncate"
          style={{ color: isUnlocked ? colors.light : '#707070' }}
        >
          {chapter.category}
        </p>

        {/* 进度条 */}
        {isUnlocked && (
          <div className="mt-auto">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-white/70">收集进度</span>
              <span className="text-white font-medium">
                {collectedCount}/{totalMedicines}
              </span>
            </div>
            <div className="h-1.5 bg-black/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="h-full rounded-full"
                style={{ background: colors.light }}
              />
            </div>
          </div>
        )}

        {/* 技能图标（已通关显示） */}
        {isCompleted && chapter.rewardSkill && (
          <div className="absolute bottom-2 right-2">
            <motion.div
              whileHover={{ scale: 1.2, rotate: 10 }}
              className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-lg"
            >
              {chapter.rewardSkillIcon || '⭐'}
            </motion.div>
          </div>
        )}
      </div>

      {/* 悬停光效 */}
      {isUnlocked && (
        <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
      )}
    </motion.button>
  )
}

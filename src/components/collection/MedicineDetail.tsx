import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@stores/gameStore'
import { getAffinityLevel, getAffinityLevelName } from '@utils/index'
import { cn } from '@utils/index'

interface MedicineDetailProps {
  medicineId: string
  onClose: () => void
}

type ViewMode = 'seed' | 'herb' | 'spirit'

export default function MedicineDetail({ medicineId, onClose }: MedicineDetailProps) {
  const { medicines, player, addMedicineAffinity: addAffinity } = useGameStore()
  const [viewMode, setViewMode] = useState<ViewMode>('herb')
  const [activeTab, setActiveTab] = useState<'info' | 'story'>('info')

  const medicine = medicines.find((m) => m.id === medicineId)
  if (!medicine) return null

  const affinity = player.medicineAffinity[medicineId] || 0
  const affinityLevel = getAffinityLevel(affinity)
  const levelName = getAffinityLevelName(affinityLevel)
  const canViewSpirit = affinityLevel >= 3

  const handleInteract = () => {
    addAffinity(medicineId, 5)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        className="relative w-full max-w-3xl bg-background-secondary rounded-2xl border border-background-tertiary shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-background-tertiary text-text-secondary hover:text-text-primary transition-colors"
        >
          ✕
        </button>

        <div className="flex flex-col md:flex-row">
          {/* 左侧：视觉区 */}
          <div className="w-full md:w-2/5 bg-gradient-to-b from-background-tertiary/50 to-background-secondary p-6 flex flex-col items-center">
            {/* 形象展示区 */}
            <div className="relative w-48 h-48 mb-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={viewMode}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full flex items-center justify-center"
                >
                  {viewMode === 'seed' && (
                    <span className="text-8xl filter drop-shadow-[0_0_20px_rgba(201,169,97,0.5)]">
                      💎
                    </span>
                  )}
                  {viewMode === 'herb' && (
                    <span className="text-8xl">🌿</span>
                  )}
                  {viewMode === 'spirit' && (
                    <span className={cn('text-8xl', !canViewSpirit && 'grayscale opacity-50')}>
                      {canViewSpirit ? '👤' : '🔒'}
                    </span>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* 切换按钮 */}
            <div className="flex gap-2 mb-4">
              {(['seed', 'herb', 'spirit'] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    if (mode === 'spirit' && !canViewSpirit) {
                      return
                    }
                    setViewMode(mode)
                  }}
                  disabled={mode === 'spirit' && !canViewSpirit}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm transition-all duration-200',
                    viewMode === mode
                      ? 'bg-primary text-background-primary'
                      : 'bg-background-tertiary text-text-secondary hover:text-text-primary',
                    mode === 'spirit' && !canViewSpirit && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {mode === 'seed' && '种子'}
                  {mode === 'herb' && '药材'}
                  {mode === 'spirit' && (canViewSpirit ? '药灵' : '🔒药灵')}
                </button>
              ))}
            </div>

            {/* 亲密度 */}
            <div className="w-full bg-background-tertiary/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text-secondary">亲密度</span>
                <span className="text-sm text-primary font-medium">
                  {levelName}
                </span>
              </div>
              <div className="flex items-center gap-1 mb-2">
                {'★'.repeat(affinityLevel).split('').map((_, i) => (
                  <span key={i} className="text-primary">
                    ★
                  </span>
                ))}
                {'☆'.repeat(5 - affinityLevel).split('').map((_, i) => (
                  <span key={i} className="text-text-muted">
                    ☆
                  </span>
                ))}
              </div>
              <div className="w-full bg-background-tertiary rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${affinity}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
              <p className="text-xs text-text-muted mt-2 text-center">
                {affinity}/100
              </p>
            </div>

            {/* 互动按钮 */}
            <button
              onClick={handleInteract}
              className="mt-4 w-full py-2 rounded-xl bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
            >
              💬 与药灵对话 (+5亲密度)
            </button>
          </div>

          {/* 右侧：信息区 */}
          <div className="w-full md:w-3/5 p-6">
            {/* 标题 */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-text-primary font-title mb-1">
                {medicine.name}
              </h2>
              <p className="text-text-secondary">{medicine.pinyin}</p>
            </div>

            {/* 标签页切换 */}
            <div className="flex gap-4 mb-6 border-b border-background-tertiary">
              <button
                onClick={() => setActiveTab('info')}
                className={cn(
                  'pb-2 text-sm font-medium transition-colors relative',
                  activeTab === 'info'
                    ? 'text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                基本信息
                {activeTab === 'info' && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab('story')}
                className={cn(
                  'pb-2 text-sm font-medium transition-colors relative',
                  activeTab === 'story'
                    ? 'text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                记忆碎片
                {activeTab === 'story' && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  />
                )}
              </button>
            </div>

            {/* 内容区 */}
            <AnimatePresence mode="wait">
              {activeTab === 'info' ? (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  {/* 性味归经 */}
                  <div className="bg-background-tertiary/50 rounded-xl p-4">
                    <h3 className="text-sm text-text-secondary mb-2">性味归经</h3>
                    <p className="text-text-primary mb-2">
                      <span className="text-text-muted">性味：</span>
                      {medicine.nature}
                    </p>
                    <p className="text-text-primary">
                      <span className="text-text-muted">归经：</span>
                      {medicine.meridians.join('、')}
                    </p>
                  </div>

                  {/* 功效 */}
                  <div className="bg-background-tertiary/50 rounded-xl p-4">
                    <h3 className="text-sm text-text-secondary mb-2">功效</h3>
                    <div className="flex flex-wrap gap-2">
                      {medicine.functions.map((func, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm"
                        >
                          {func}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 主治 */}
                  <div className="bg-background-tertiary/50 rounded-xl p-4">
                    <h3 className="text-sm text-text-secondary mb-2">主治</h3>
                    <ul className="space-y-1">
                      {medicine.indications.map((indication, index) => (
                        <li key={index} className="text-text-primary text-sm">
                          • {indication}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 禁忌 */}
                  {medicine.contraindications.length > 0 && (
                    <div className="bg-status-error/10 rounded-xl p-4">
                      <h3 className="text-sm text-status-error mb-2">使用禁忌</h3>
                      <ul className="space-y-1">
                        {medicine.contraindications.map((contra, index) => (
                          <li key={index} className="text-status-error/80 text-sm">
                            • {contra}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="story"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {medicine.stories.map((story, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-background-tertiary/50 rounded-xl p-4"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">💭</span>
                        <p className="text-text-primary leading-relaxed">{story}</p>
                      </div>
                    </motion.div>
                  ))}

                  {affinityLevel < 4 && (
                    <div className="text-center py-4 text-text-muted">
                      <p>
                        亲密度达到
                        <span className="text-primary">{levelName}</span>
                        可解锁更多故事
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

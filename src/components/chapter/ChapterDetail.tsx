import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import type { Chapter, ChapterProgress } from '../../types/chapter'
import type { WuxingType } from '../../types/index'

interface ChapterDetailProps {
  chapter: Chapter | null
  isOpen: boolean
  isUnlocked: boolean
  progress?: ChapterProgress
  onClose: () => void
  onStart: () => void
}

const wuxingNames: Record<WuxingType, string> = {
  wood: '木',
  fire: '火',
  earth: '土',
  metal: '金',
  water: '水',
}

const wuxingColors: Record<WuxingType, { primary: string; light: string; bg: string; glow: string }> = {
  wood: {
    primary: '#2E7D32',
    light: '#81C784',
    bg: 'rgba(46, 125, 50, 0.1)',
    glow: 'rgba(46, 125, 50, 0.5)',
  },
  fire: {
    primary: '#C62828',
    light: '#EF5350',
    bg: 'rgba(198, 40, 40, 0.1)',
    glow: 'rgba(198, 40, 40, 0.5)',
  },
  earth: {
    primary: '#F9A825',
    light: '#FFD54F',
    bg: 'rgba(249, 168, 37, 0.1)',
    glow: 'rgba(249, 168, 37, 0.5)',
  },
  metal: {
    primary: '#78909C',
    light: '#B0BEC5',
    bg: 'rgba(120, 144, 156, 0.1)',
    glow: 'rgba(120, 144, 156, 0.5)',
  },
  water: {
    primary: '#1565C0',
    light: '#42A5F5',
    bg: 'rgba(21, 101, 192, 0.1)',
    glow: 'rgba(21, 101, 192, 0.5)',
  },
}

export default function ChapterDetail({
  chapter,
  isOpen,
  isUnlocked,
  progress,
  onClose,
  onStart,
}: ChapterDetailProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'medicines' | 'boss'>('overview')

  if (!chapter) return null

  const colors = wuxingColors[chapter.wuxing]
  const collectedCount = progress?.collectedMedicines.length || 0
  const totalMedicines = chapter.medicines.length
  const isCompleted = progress?.bossDefeated || false

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* 抽屉内容 */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg z-50 bg-gradient-to-b from-[#2D2D2D] to-[#1A1A1A] shadow-2xl"
          >
            {/* 头部 */}
            <div
              className="relative p-6"
              style={{
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.bg} 100%)`,
              }}
            >
              {/* 关闭按钮 */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/20 flex items-center justify-center hover:bg-black/30 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* 章节信息 */}
              <div className="pt-4">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className="px-3 py-1 rounded-full text-sm font-bold"
                    style={{ background: colors.light, color: colors.primary }}
                  >
                    第 {chapter.sequence} 章
                  </span>
                  <span
                    className="px-3 py-1 rounded-full text-sm"
                    style={{ background: colors.bg, color: colors.light }}
                  >
                    {wuxingNames[chapter.wuxing]}行
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">{chapter.name}</h2>
                <p className="text-white/70">{chapter.category}</p>
              </div>

              {/* 进度指示 */}
              {isUnlocked && (
                <div className="mt-6">
                  <div className="flex items-center justify-between text-sm text-white/80 mb-2">
                    <span>章节进度</span>
                    <span>
                      {collectedCount}/{totalMedicines} 味药
                    </span>
                  </div>
                  <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(collectedCount / totalMedicines) * 100}%` }}
                      className="h-full rounded-full"
                      style={{ background: colors.light }}
                    />
                  </div>
                </div>
              )}

              {/* 锁定状态 */}
              {!isUnlocked && (
                <div className="mt-6 p-4 bg-black/30 rounded-xl flex items-center gap-3">
                  <span className="text-2xl">🔒</span>
                  <div>
                    <p className="text-white font-medium">章节未解锁</p>
                    <p className="text-white/60 text-sm">
                      {chapter.unlockCondition?.completedChapters
                        ? `需先完成：第 ${chapter.unlockCondition.completedChapters.join('、')} 章`
                        : '完成前置章节以解锁'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 标签页导航 */}
            {isUnlocked && (
              <div className="flex border-b border-white/10">
                {[
                  { id: 'overview', label: '概览', icon: '📋' },
                  { id: 'medicines', label: '药物', icon: '🌿' },
                  { id: 'boss', label: 'Boss', icon: '👹' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`flex-1 py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                      activeTab === tab.id
                        ? 'text-white border-b-2'
                        : 'text-white/50 hover:text-white/80'
                    }`}
                    style={{
                      borderColor: activeTab === tab.id ? colors.light : 'transparent',
                    }}
                  >
                    <span>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {/* 内容区域 */}
            <div className="p-6 overflow-y-auto h-[calc(100%-280px)]">
              {/* 概览标签 */}
              {activeTab === 'overview' && isUnlocked && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* 章节介绍 */}
                  <section>
                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <span>📖</span> 章节介绍
                    </h3>
                    <p className="text-white/70 leading-relaxed">{chapter.description}</p>
                  </section>

                  {/* 解锁方剂 */}
                  <section>
                    <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                      <span>📜</span> 解锁方剂
                    </h3>
                    <div className="space-y-2">
                      {chapter.formulas.map((formulaId, index) => (
                        <div
                          key={formulaId}
                          className="p-3 rounded-lg bg-white/5 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">
                              {progress?.unlockedFormulas?.includes(formulaId) ? '📜' : '🔒'}
                            </span>
                            <span className="text-white/80">{formulaId}</span>
                          </div>
                          {progress?.unlockedFormulas?.includes(formulaId) && (
                            <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400">
                              已解锁
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* 奖励技能 */}
                  {chapter.rewardSkill && (
                    <section>
                      <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                        <span>⭐</span> 通关奖励
                      </h3>
                      <div
                        className="p-4 rounded-xl"
                        style={{ background: colors.bg, border: `1px solid ${colors.primary}` }}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-3xl">{chapter.rewardSkillIcon || '✨'}</span>
                          <div>
                            <h4 className="font-bold text-white">{chapter.rewardSkill}</h4>
                            <p className="text-sm" style={{ color: colors.light }}>
                              章节专属技能
                            </p>
                          </div>
                        </div>
                        <p className="text-white/60 text-sm">{chapter.rewardSkillDescription}</p>
                      </div>
                    </section>
                  )}
                </motion.div>
              )}

              {/* 药物标签 */}
              {activeTab === 'medicines' && isUnlocked && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  {chapter.medicines.map((medicineId, index) => {
                    const isCollected = progress?.collectedMedicines?.includes(medicineId)
                    return (
                      <div
                        key={medicineId}
                        className="p-4 rounded-xl bg-white/5 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                            style={{ background: isCollected ? colors.bg : '#3D3D3D' }}
                          >
                            {isCollected ? '🌿' : '❓'}
                          </div>
                          <div>
                            <p className="text-white font-medium">{medicineId}</p>
                            <p className="text-sm text-white/50">
                              {isCollected ? '已收集' : '待收集'}
                            </p>
                          </div>
                        </div>
                        {isCollected && (
                          <span className="text-green-400">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        )}
                      </div>
                    )
                  })}
                </motion.div>
              )}

              {/* Boss标签 */}
              {activeTab === 'boss' && isUnlocked && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="p-4 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-4xl">👹</span>
                      <div>
                        <h3 className="text-xl font-bold text-white">本章Boss挑战</h3>
                        <p className="text-red-400 text-sm">收集齐本章药物后解锁</p>
                      </div>
                    </div>
                    <p className="text-white/70 text-sm">
                      Boss病案是本章最难的临床挑战，需要正确辨证、选方、选君药。通关后可获得本章专属技能奖励。
                    </p>
                  </div>

                  {chapter.bossCase && (
                    <div className="p-4 rounded-xl bg-white/5">
                      <h4 className="font-bold text-white mb-2">病案预览</h4>
                      <p className="text-white/60 text-sm line-clamp-3">
                        {chapter.bossCase.patientInfo || '???'}
                      </p>
                      {isCompleted ? (
                        <div className="mt-3 flex items-center gap-2 text-green-400 text-sm">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          已通关
                        </div>
                      ) : (
                        <div className="mt-3 flex items-center gap-2 text-white/50 text-sm">
                          <span>🔒</span>
                          完成本章收集后解锁
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* 底部按钮 */}
            {isUnlocked && (
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#1A1A1A] to-transparent">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onStart}
                  className="w-full py-4 rounded-xl font-bold text-lg text-white transition-all duration-200"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.light} 100%)`,
                    boxShadow: `0 4px 20px ${colors.glow}`,
                  }}
                >
                  {isCompleted ? '重新挑战' : collectedCount > 0 ? '继续探索' : '开始探索'}
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

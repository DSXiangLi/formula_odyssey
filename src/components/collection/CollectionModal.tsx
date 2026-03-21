import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@stores/gameStore'
import type { Medicine } from '@types/index'
import { cn } from '@utils/index'
import { getAffinityLevel, getAffinityLevelName } from '@utils/index'

interface CollectionModalProps {
  onClose: () => void
}

const categories = [
  '全部',
  '解表药',
  '清热药',
  '泻下药',
  '补益药',
  '活血化瘀药',
  '化痰止咳平喘药',
  '安神药',
]

export default function CollectionModal({ onClose }: CollectionModalProps) {
  const { medicines, player, setSelectedMedicine } = useGameStore()
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [searchQuery, setSearchQuery] = useState('')

  // 过滤药灵
  const filteredMedicines = useMemo(() => {
    let result = medicines

    if (selectedCategory !== '全部') {
      result = result.filter((m) => m.category === selectedCategory)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.pinyin.toLowerCase().includes(query) ||
          m.functions.some((f) => f.includes(query))
      )
    }

    // 已收集的排在前面
    return result.sort((a, b) => {
      const aCollected = player.collectedMedicines.includes(a.id) ? 1 : 0
      const bCollected = player.collectedMedicines.includes(b.id) ? 1 : 0
      return bCollected - aCollected
    })
  }, [medicines, selectedCategory, searchQuery, player.collectedMedicines])

  const collectedCount = player.collectedMedicines.length
  const totalCount = medicines.length

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
        className="relative w-full max-w-4xl h-[80vh] bg-background-secondary rounded-2xl border border-background-tertiary shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-background-tertiary">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-text-primary font-title">
              📖 药灵图鉴
            </h2>
            <div className="flex items-center gap-2 bg-background-tertiary/50 rounded-full px-3 py-1">
              <span className="text-primary font-medium">{collectedCount}</span>
              <span className="text-text-muted">/</span>
              <span className="text-text-secondary">{totalCount}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-background-tertiary text-text-secondary hover:text-text-primary transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 搜索和筛选 */}
        <div className="px-6 py-4 border-b border-background-tertiary space-y-4">
          {/* 搜索框 */}
          <div className="relative">
            <input
              type="text"
              placeholder="搜索药名、拼音或功效..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background-tertiary/50 border border-background-tertiary rounded-xl px-4 py-2 pl-10 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              🔍
            </span>
          </div>

          {/* 分类标签 */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm transition-all duration-200',
                  selectedCategory === category
                    ? 'bg-primary text-background-primary'
                    : 'bg-background-tertiary/50 text-text-secondary hover:bg-background-tertiary hover:text-text-primary'
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* 药灵列表 */}
        <div className="p-6 overflow-y-auto" style={{ height: 'calc(80vh - 200px)' }}>
          {filteredMedicines.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-4">🔍</p>
              <p className="text-text-secondary">未找到匹配的药灵</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredMedicines.map((medicine) => (
                <MedicineCard
                  key={medicine.id}
                  medicine={medicine}
                  isCollected={player.collectedMedicines.includes(medicine.id)}
                  affinity={player.medicineAffinity[medicine.id] || 0}
                  onClick={() => {
                    if (player.collectedMedicines.includes(medicine.id)) {
                      setSelectedMedicine(medicine.id)
                      onClose()
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

interface MedicineCardProps {
  medicine: Medicine
  isCollected: boolean
  affinity: number
  onClick: () => void
}

function MedicineCard({ medicine, isCollected, affinity, onClick }: MedicineCardProps) {
  const affinityLevel = getAffinityLevel(affinity)
  const levelName = getAffinityLevelName(affinityLevel)

  return (
    <motion.div
      whileHover={{ scale: isCollected ? 1.05 : 1 }}
      whileTap={{ scale: isCollected ? 0.95 : 1 }}
      onClick={onClick}
      className={cn(
        'relative rounded-xl p-4 cursor-pointer transition-all duration-300',
        isCollected
          ? 'bg-background-tertiary border-2 border-primary hover:shadow-lg hover:shadow-primary/20'
          : 'bg-background-tertiary/30 border-2 border-dashed border-background-tertiary'
      )}
    >
      {/* 收集状态图标 */}
      <div className="flex justify-center mb-3">
        <div
          className={cn(
            'w-16 h-16 rounded-full flex items-center justify-center text-3xl',
            isCollected
              ? 'bg-primary/20'
              : 'bg-background-tertiary/50 grayscale'
          )}
        >
          {isCollected ? '🌿' : '🔒'}
        </div>
      </div>

      {/* 药名 */}
      <h3
        className={cn(
          'text-center font-medium mb-1',
          isCollected ? 'text-text-primary' : 'text-text-muted'
        )}
      >
        {isCollected ? medicine.name : '???'}
      </h3>

      {/* 类别 */}
      <p className="text-center text-xs text-text-muted mb-2">
        {isCollected ? medicine.category : '未收集'}
      </p>

      {/* 亲密度 */}
      {isCollected && (
        <div className="flex justify-center">
          <div className="flex items-center gap-1">
            <span className="text-xs text-primary">
              {'★'.repeat(affinityLevel)}
              {'☆'.repeat(5 - affinityLevel)}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  )
}

import { motion } from 'framer-motion'
import { useState, useMemo } from 'react'
import ChapterCard from './ChapterCard'
import ChapterDetail from './ChapterDetail'
import type { Chapter, ChapterMapProps } from '../../types/chapter'

// 20章数据（示例，实际应从store获取）
const defaultChapters: Chapter[] = [
  { id: 'ch1', sequence: 1, name: '解表剂山谷', category: '解表剂', wuxing: 'wood', medicines: ['麻黄', '桂枝', '紫苏', '生姜'], formulas: ['麻黄汤', '桂枝汤'], rewardSkill: '望气之眼', rewardSkillIcon: '👁️', rewardSkillDescription: '开局自动获得药图线索', description: '学习解表药的性味归经，掌握发汗解表的原理。' },
  { id: 'ch2', sequence: 2, name: '清热剂山谷', category: '清热剂', wuxing: 'fire', medicines: ['石膏', '知母', '栀子', '夏枯草'], formulas: ['白虎汤', '清营汤'], rewardSkill: '清热精通', rewardSkillIcon: '🔥', rewardSkillDescription: '清热剂章节奖励+50%', description: '探索清热泻火、凉血解毒的奥秘。' },
  { id: 'ch3', sequence: 3, name: '泻下剂山谷', category: '泻下剂', wuxing: 'earth', medicines: ['大黄', '芒硝', '火麻仁'], formulas: ['大承气汤', '麻子仁丸'], rewardSkill: '泻下明辨', rewardSkillIcon: '💨', rewardSkillDescription: '泻下剂效果提升', description: '掌握泻下药的分类与应用。' },
  { id: 'ch4', sequence: 4, name: '祛风湿剂山谷', category: '祛风湿剂', wuxing: 'wood', medicines: ['独活', '威灵仙', '防己'], formulas: ['独活寄生汤'], rewardSkill: '风湿专精', rewardSkillIcon: '🌿', rewardSkillDescription: '祛风湿药效果增强', description: '学习祛风湿药治疗痹证。' },
  { id: 'ch5', sequence: 5, name: '化湿剂山谷', category: '化湿剂', wuxing: 'earth', medicines: ['藿香', '佩兰', '苍术'], formulas: ['藿香正气散'], rewardSkill: '化湿妙手', rewardSkillIcon: '💧', rewardSkillDescription: '化湿药功效提升', description: '掌握芳香化湿药的用法。' },
  { id: 'ch6', sequence: 6, name: '利水渗湿剂山谷', category: '利水渗湿剂', wuxing: 'water', medicines: ['茯苓', '泽泻', '薏苡仁', '车前子'], formulas: ['五苓散', '猪苓汤'], rewardSkill: '利水通淋', rewardSkillIcon: '🌊', rewardSkillDescription: '利水渗湿效果增强', description: '学习利水渗湿药治疗水肿。' },
  { id: 'ch7', sequence: 7, name: '温里剂山谷', category: '温里剂', wuxing: 'fire', medicines: ['附子', '干姜', '肉桂'], formulas: ['四逆汤', '理中丸'], rewardSkill: '温阳散寒', rewardSkillIcon: '❄️', rewardSkillDescription: '温里药功效提升', description: '掌握温里药回阳救逆之法。' },
  { id: 'ch8', sequence: 8, name: '理气剂山谷', category: '理气剂', wuxing: 'wood', medicines: ['陈皮', '枳实', '木香'], formulas: ['柴胡疏肝散', '半夏厚朴汤'], rewardSkill: '理气解郁', rewardSkillIcon: '🌸', rewardSkillDescription: '理气药效果增强', description: '学习理气药调理气机。' },
  { id: 'ch9', sequence: 9, name: '消食剂山谷', category: '消食剂', wuxing: 'earth', medicines: ['山楂', '神曲'], formulas: ['保和丸'], rewardSkill: '消食导滞', rewardSkillIcon: '🍎', rewardSkillDescription: '消食药功效提升', description: '掌握消食药的临床应用。' },
  { id: 'ch10', sequence: 10, name: '驱虫剂山谷', category: '驱虫剂', wuxing: 'earth', medicines: ['使君子', '槟榔'], formulas: ['乌梅丸'], rewardSkill: '驱虫安蛔', rewardSkillIcon: '🐛', rewardSkillDescription: '驱虫药效果增强', description: '学习驱虫药的使用方法。' },
  { id: 'ch11', sequence: 11, name: '止血剂山谷', category: '止血剂', wuxing: 'metal', medicines: ['三七', '白及', '艾叶', '地榆'], formulas: ['十灰散', '黄土汤'], rewardSkill: '止血圣手', rewardSkillIcon: '🩸', rewardSkillDescription: '止血药功效提升', description: '掌握各类止血药的特点。' },
  { id: 'ch12', sequence: 12, name: '活血化瘀剂山谷', category: '活血化瘀剂', wuxing: 'metal', medicines: ['川芎', '丹参', '红花', '桃仁'], formulas: ['血府逐瘀汤', '补阳还五汤'], rewardSkill: '活血通络', rewardSkillIcon: '💫', rewardSkillDescription: '活血化瘀效果增强', description: '学习活血化瘀药治疗血瘀证。' },
  { id: 'ch13', sequence: 13, name: '化痰止咳平喘剂山谷', category: '化痰止咳平喘剂', wuxing: 'metal', medicines: ['半夏', '川贝母', '杏仁', '桔梗'], formulas: ['二陈汤', '清气化痰丸'], rewardSkill: '化痰止咳', rewardSkillIcon: '🫁', rewardSkillDescription: '化痰药功效提升', description: '掌握化痰止咳平喘药的用法。' },
  { id: 'ch14', sequence: 14, name: '安神剂山谷', category: '安神剂', wuxing: 'water', medicines: ['酸枣仁', '柏子仁', '远志'], formulas: ['酸枣仁汤', '天王补心丹'], rewardSkill: '安神定志', rewardSkillIcon: '😴', rewardSkillDescription: '安神药效果增强', description: '学习安神药治疗失眠。' },
  { id: 'ch15', sequence: 15, name: '平肝息风剂山谷', category: '平肝息风剂', wuxing: 'wood', medicines: ['天麻', '钩藤', '石决明'], formulas: ['天麻钩藤饮', '镇肝熄风汤'], rewardSkill: '平肝息风', rewardSkillIcon: '🍃', rewardSkillDescription: '平肝药功效提升', description: '掌握平肝息风药治疗肝风。' },
  { id: 'ch16', sequence: 16, name: '开窍剂山谷', category: '开窍剂', wuxing: 'fire', medicines: ['麝香', '冰片'], formulas: ['安宫牛黄丸'], rewardSkill: '开窍醒神', rewardSkillIcon: '💎', rewardSkillDescription: '开窍药效果增强', description: '学习开窍药急救应用。' },
  { id: 'ch17', sequence: 17, name: '补气剂山谷', category: '补益剂-补气', wuxing: 'earth', medicines: ['人参', '黄芪', '白术', '甘草'], formulas: ['四君子汤', '补中益气汤'], rewardSkill: '补气益脾', rewardSkillIcon: '💪', rewardSkillDescription: '补气药功效提升', description: '掌握补气药治疗气虚证。' },
  { id: 'ch18', sequence: 18, name: '补血剂山谷', category: '补益剂-补血', wuxing: 'water', medicines: ['当归', '熟地黄', '白芍', '阿胶'], formulas: ['四物汤', '归脾汤'], rewardSkill: '补血养血', rewardSkillIcon: '❤️', rewardSkillDescription: '补血药效果增强', description: '学习补血药治疗血虚证。' },
  { id: 'ch19', sequence: 19, name: '补阳剂山谷', category: '补益剂-补阳', wuxing: 'fire', medicines: ['鹿茸', '杜仲', '续断'], formulas: ['肾气丸', '右归丸'], rewardSkill: '补肾壮阳', rewardSkillIcon: '🔆', rewardSkillDescription: '补阳药功效提升', description: '掌握补阳药治疗阳虚证。' },
  { id: 'ch20', sequence: 20, name: '补阴剂山谷', category: '补益剂-补阴', wuxing: 'water', medicines: ['北沙参', '麦冬', '枸杞子'], formulas: ['六味地黄丸', '左归丸'], rewardSkill: '滋阴润燥', rewardSkillIcon: '💧', rewardSkillDescription: '补阴药效果增强', description: '学习补阴药治疗阴虚证。' },
]

// 连接线SVG组件
function ChapterConnection({ from, to }: { from: { x: number; y: number }; to: { x: number; y: number } }) {
  const isHorizontal = from.y === to.y

  return (
    <motion.path
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      d={isHorizontal
        ? `M ${from.x + 80} ${from.y + 60} L ${to.x - 10} ${to.y + 60}`
        : `M ${from.x + 60} ${from.y + 80} Q ${from.x + 60} ${(from.y + to.y) / 2 + 60} ${to.x + 60} ${to.y - 10}`
      }
      stroke="rgba(201, 169, 97, 0.3)"
      strokeWidth="3"
      strokeDasharray="5,5"
      fill="none"
      className="pointer-events-none"
    />
  )
}

export default function ChapterMap({
  chapters = defaultChapters,
  chapterProgress = {},
  currentChapterId,
  onSelectChapter,
}: ChapterMapProps) {
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // 计算解锁状态
  const getChapterStatus = (chapter: Chapter) => {
    const progress = chapterProgress[chapter.id]
    const isCompleted = progress?.bossDefeated || false
    const isUnlocked = chapter.sequence === 1 ||
      chapter.unlockCondition?.completedChapters?.every(chId =>
        chapterProgress[chId]?.bossDefeated
      ) || false
    const isCurrent = currentChapterId === chapter.id

    return { isUnlocked, isCompleted, isCurrent }
  }

  // 计算连接线的位置
  const connectionLines = useMemo(() => {
    const lines: { from: { x: number; y: number }; to: { x: number; y: number } }[] = []
    const cardsPerRow = 5

    for (let i = 0; i < chapters.length - 1; i++) {
      const fromRow = Math.floor(i / cardsPerRow)
      const toRow = Math.floor((i + 1) / cardsPerRow)
      const fromCol = i % cardsPerRow
      const toCol = (i + 1) % cardsPerRow

      // 只在同行内连接，或者行尾到下一行行首
      if (fromRow === toRow) {
        lines.push({
          from: { x: fromCol * 160, y: fromRow * 200 },
          to: { x: toCol * 160, y: toRow * 200 },
        })
      }
    }

    return lines
  }, [chapters.length])

  const handleChapterClick = (chapter: Chapter) => {
    const { isUnlocked } = getChapterStatus(chapter)
    if (isUnlocked) {
      setSelectedChapter(chapter)
      setIsDetailOpen(true)
      onSelectChapter?.(chapter)
    }
  }

  const handleStartChapter = () => {
    if (selectedChapter) {
      // 导航到章节场景
      console.log('Starting chapter:', selectedChapter.id)
      setIsDetailOpen(false)
    }
  }

  const selectedProgress = selectedChapter ? chapterProgress[selectedChapter.id] : undefined
  const selectedStatus = selectedChapter ? getChapterStatus(selectedChapter) : { isUnlocked: false, isCompleted: false, isCurrent: false }

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-b from-[#1A1A1A] via-[#2D2D2D] to-[#1A1A1A] overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#C9A961]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#C9A961]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#C9A961]/3 rounded-full blur-3xl" />
      </div>

      {/* 标题区域 */}
      <div className="relative z-10 pt-8 pb-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-white mb-2 font-title"
        >
          <span className="text-[#C9A961]">药灵</span>山谷
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-white/60"
        >
          选择章节，开启你的中医学习之旅
        </motion.p>
      </div>

      {/* 章节地图 */}
      <div className="relative z-10 px-4 pb-8">
        {/* 连接线层 */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 0 }}
        >
          {connectionLines.map((line, index) => (
            <ChapterConnection key={index} from={line.from} to={line.to} />
          ))}
        </svg>

        {/* 章节网格 */}
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {chapters.map((chapter, index) => {
              const { isUnlocked, isCompleted, isCurrent } = getChapterStatus(chapter)
              const progress = chapterProgress[chapter.id]

              return (
                <motion.div
                  key={chapter.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ChapterCard
                    chapter={chapter}
                    isUnlocked={isUnlocked}
                    isCompleted={isCompleted}
                    isCurrent={isCurrent}
                    progress={progress}
                    onClick={() => handleChapterClick(chapter)}
                  />
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 章节详情抽屉 */}
      <ChapterDetail
        chapter={selectedChapter}
        isOpen={isDetailOpen}
        isUnlocked={selectedStatus.isUnlocked}
        progress={selectedProgress}
        onClose={() => setIsDetailOpen(false)}
        onStart={handleStartChapter}
      />

      {/* 底部提示 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 text-white/40 text-sm text-center"
      >
        点击已解锁的章节查看详情并开始探索
      </motion.div>
    </div>
  )
}

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChapterMap } from '@components/chapter'
import type { Chapter } from '../types/chapter'

// 20章数据配置
const chaptersData: Chapter[] = [
  { id: 'ch1', sequence: 1, name: '解表剂山谷', category: '解表剂', wuxing: 'wood' as const, medicines: ['麻黄', '桂枝', '紫苏', '生姜'], formulas: ['麻黄汤', '桂枝汤'], rewardSkill: '望气之眼', rewardSkillIcon: '👁️', rewardSkillDescription: '开局自动获得药图线索', description: '学习解表药的性味归经，掌握发汗解表的原理。' },
  { id: 'ch2', sequence: 2, name: '清热剂山谷', category: '清热剂', wuxing: 'fire' as const, medicines: ['石膏', '知母', '栀子', '夏枯草'], formulas: ['白虎汤', '清营汤'], rewardSkill: '清热精通', rewardSkillIcon: '🔥', rewardSkillDescription: '清热剂章节奖励+50%', description: '探索清热泻火、凉血解毒的奥秘。' },
  { id: 'ch3', sequence: 3, name: '泻下剂山谷', category: '泻下剂', wuxing: 'earth' as const, medicines: ['大黄', '芒硝', '火麻仁'], formulas: ['大承气汤', '麻子仁丸'], rewardSkill: '泻下明辨', rewardSkillIcon: '💨', rewardSkillDescription: '泻下剂效果提升', description: '掌握泻下药的分类与应用。' },
  { id: 'ch4', sequence: 4, name: '祛风湿剂山谷', category: '祛风湿剂', wuxing: 'wood' as const, medicines: ['独活', '威灵仙', '防己'], formulas: ['独活寄生汤'], rewardSkill: '风湿专精', rewardSkillIcon: '🌿', rewardSkillDescription: '祛风湿药效果增强', description: '学习祛风湿药治疗痹证。' },
  { id: 'ch5', sequence: 5, name: '化湿剂山谷', category: '化湿剂', wuxing: 'earth' as const, medicines: ['藿香', '佩兰', '苍术'], formulas: ['藿香正气散'], rewardSkill: '化湿妙手', rewardSkillIcon: '💧', rewardSkillDescription: '化湿药功效提升', description: '掌握芳香化湿药的用法。' },
  { id: 'ch6', sequence: 6, name: '利水渗湿剂山谷', category: '利水渗湿剂', wuxing: 'water' as const, medicines: ['茯苓', '泽泻', '薏苡仁', '车前子'], formulas: ['五苓散', '猪苓汤'], rewardSkill: '利水通淋', rewardSkillIcon: '🌊', rewardSkillDescription: '利水渗湿效果增强', description: '学习利水渗湿药治疗水肿。' },
  { id: 'ch7', sequence: 7, name: '温里剂山谷', category: '温里剂', wuxing: 'fire' as const, medicines: ['附子', '干姜', '肉桂'], formulas: ['四逆汤', '理中丸'], rewardSkill: '温阳散寒', rewardSkillIcon: '❄️', rewardSkillDescription: '温里药功效提升', description: '掌握温里药回阳救逆之法。' },
  { id: 'ch8', sequence: 8, name: '理气剂山谷', category: '理气剂', wuxing: 'wood' as const, medicines: ['陈皮', '枳实', '木香'], formulas: ['柴胡疏肝散', '半夏厚朴汤'], rewardSkill: '理气解郁', rewardSkillIcon: '🌸', rewardSkillDescription: '理气药效果增强', description: '学习理气药调理气机。' },
  { id: 'ch9', sequence: 9, name: '消食剂山谷', category: '消食剂', wuxing: 'earth' as const, medicines: ['山楂', '神曲'], formulas: ['保和丸'], rewardSkill: '消食导滞', rewardSkillIcon: '🍎', rewardSkillDescription: '消食药功效提升', description: '掌握消食药的临床应用。' },
  { id: 'ch10', sequence: 10, name: '驱虫剂山谷', category: '驱虫剂', wuxing: 'earth' as const, medicines: ['使君子', '槟榔'], formulas: ['乌梅丸'], rewardSkill: '驱虫安蛔', rewardSkillIcon: '🐛', rewardSkillDescription: '驱虫药效果增强', description: '学习驱虫药的使用方法。' },
  { id: 'ch11', sequence: 11, name: '止血剂山谷', category: '止血剂', wuxing: 'metal' as const, medicines: ['三七', '白及', '艾叶', '地榆'], formulas: ['十灰散', '黄土汤'], rewardSkill: '止血圣手', rewardSkillIcon: '🩸', rewardSkillDescription: '止血药功效提升', description: '掌握各类止血药的特点。' },
  { id: 'ch12', sequence: 12, name: '活血化瘀剂山谷', category: '活血化瘀剂', wuxing: 'metal' as const, medicines: ['川芎', '丹参', '红花', '桃仁'], formulas: ['血府逐瘀汤', '补阳还五汤'], rewardSkill: '活血通络', rewardSkillIcon: '💫', rewardSkillDescription: '活血化瘀效果增强', description: '学习活血化瘀药治疗血瘀证。' },
  { id: 'ch13', sequence: 13, name: '化痰止咳平喘剂山谷', category: '化痰止咳平喘剂', wuxing: 'metal' as const, medicines: ['半夏', '川贝母', '杏仁', '桔梗'], formulas: ['二陈汤', '清气化痰丸'], rewardSkill: '化痰止咳', rewardSkillIcon: '🫁', rewardSkillDescription: '化痰药功效提升', description: '掌握化痰止咳平喘药的用法。' },
  { id: 'ch14', sequence: 14, name: '安神剂山谷', category: '安神剂', wuxing: 'water' as const, medicines: ['酸枣仁', '柏子仁', '远志'], formulas: ['酸枣仁汤', '天王补心丹'], rewardSkill: '安神定志', rewardSkillIcon: '😴', rewardSkillDescription: '安神药效果增强', description: '学习安神药治疗失眠。' },
  { id: 'ch15', sequence: 15, name: '平肝息风剂山谷', category: '平肝息风剂', wuxing: 'wood' as const, medicines: ['天麻', '钩藤', '石决明'], formulas: ['天麻钩藤饮', '镇肝熄风汤'], rewardSkill: '平肝息风', rewardSkillIcon: '🍃', rewardSkillDescription: '平肝药功效提升', description: '掌握平肝息风药治疗肝风。' },
  { id: 'ch16', sequence: 16, name: '开窍剂山谷', category: '开窍剂', wuxing: 'fire' as const, medicines: ['麝香', '冰片'], formulas: ['安宫牛黄丸'], rewardSkill: '开窍醒神', rewardSkillIcon: '💎', rewardSkillDescription: '开窍药效果增强', description: '学习开窍药急救应用。' },
  { id: 'ch17', sequence: 17, name: '补气剂山谷', category: '补益剂-补气', wuxing: 'earth' as const, medicines: ['人参', '黄芪', '白术', '甘草'], formulas: ['四君子汤', '补中益气汤'], rewardSkill: '补气益脾', rewardSkillIcon: '💪', rewardSkillDescription: '补气药功效提升', description: '掌握补气药治疗气虚证。' },
  { id: 'ch18', sequence: 18, name: '补血剂山谷', category: '补益剂-补血', wuxing: 'water' as const, medicines: ['当归', '熟地黄', '白芍', '阿胶'], formulas: ['四物汤', '归脾汤'], rewardSkill: '补血养血', rewardSkillIcon: '❤️', rewardSkillDescription: '补血药效果增强', description: '学习补血药治疗血虚证。' },
  { id: 'ch19', sequence: 19, name: '补阳剂山谷', category: '补益剂-补阳', wuxing: 'fire' as const, medicines: ['鹿茸', '杜仲', '续断'], formulas: ['肾气丸', '右归丸'], rewardSkill: '补肾壮阳', rewardSkillIcon: '🔆', rewardSkillDescription: '补阳药功效提升', description: '掌握补阳药治疗阳虚证。' },
  { id: 'ch20', sequence: 20, name: '补阴剂山谷', category: '补益剂-补阴', wuxing: 'water' as const, medicines: ['北沙参', '麦冬', '枸杞子'], formulas: ['六味地黄丸', '左归丸'], rewardSkill: '滋阴润燥', rewardSkillIcon: '💧', rewardSkillDescription: '补阴药效果增强', description: '学习补阴药治疗阴虚证。' },
]

export default function ChapterSelectPage() {
  const [currentChapterId, setCurrentChapterId] = useState<string | null>(null)

  // 模拟章节进度（实际应从store获取）
  const chapterProgress = {
    ch1: { chapterId: 'ch1', collectedMedicines: ['麻黄', '桂枝'], unlockedFormulas: ['麻黄汤'], bossDefeated: false, bestScore: 0 },
    ch2: { chapterId: 'ch2', collectedMedicines: [], unlockedFormulas: [], bossDefeated: false, bestScore: 0 },
  }

  const handleSelectChapter = (chapter: Chapter) => {
    setCurrentChapterId(chapter.id)
    console.log('Selected chapter:', chapter.id)
  }

  const handleBack = () => {
    // 返回主场景
    window.history.back()
  }

  return (
    <div className="relative w-full min-h-screen">
      {/* 返回按钮 */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={handleBack}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-background-secondary/80 backdrop-blur-sm hover:bg-background-tertiary transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="text-sm font-medium">返回山谷</span>
      </motion.button>

      {/* 章节地图 */}
      <ChapterMap
        chapters={chaptersData}
        chapterProgress={chapterProgress}
        currentChapterId={currentChapterId}
        onSelectChapter={handleSelectChapter}
      />
    </div>
  )
}

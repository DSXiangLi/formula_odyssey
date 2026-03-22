import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGameStore } from '@stores/gameStore'
import ValleyScene from '@components/scene/ValleyScene'
import Navigation from '@components/ui/Navigation'
import ChapterMap from '@components/chapter/ChapterMap'
import SkillTree from '@components/skill/SkillTree'
import OpenWorldMap from '@components/open-world/OpenWorldMap'
import { ChapterProvider } from '@stores/hooks'
import type { GameView } from '@stores/types'

// 游戏主流程视图
function GameFlow() {
  const {
    currentChapter,
    currentRun,
    openWorld,
    completedChapters,
    startChapter,
    completeChapter,
  } = useGameStore()

  // 如果没有当前章节且没有进行中的运行，显示章节选择
  if (!currentChapter && !currentRun) {
    // 检查是否解锁了开放世界（完成至少5章）
    const openWorldUnlocked = completedChapters.length >= 5

    return (
      <div className="relative w-full h-screen overflow-hidden bg-background-primary">
        {/* 背景 */}
        <ValleyScene />

        {/* 主内容区 */}
        <div className="relative z-10 flex flex-col h-full">
          {/* 导航 */}
          <Navigation />

          {/* 章节地图 */}
          <div className="flex-1 p-6 overflow-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-6xl mx-auto"
            >
              <h1 className="text-3xl font-bold text-center mb-2 text-white">
                药灵山谷
              </h1>
              <p className="text-center text-white/70 mb-8">
                选择章节，开启你的中医学习之旅
              </p>

              {/* 进度统计 */}
              <div className="flex justify-center gap-8 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">
                    {completedChapters.length}/20
                  </div>
                  <div className="text-sm text-white/60">已通关章节</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {openWorldUnlocked ? '已解锁' : `${5 - completedChapters.length}章后解锁`}
                  </div>
                  <div className="text-sm text-white/60">开放世界</div>
                </div>
              </div>

              {/* 章节地图 */}
              <ChapterMap />
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  // 如果有进行中的运行，显示AI对话答题界面
  if (currentRun) {
    return (
      <ChapterProvider chapterId={currentRun.chapterId}>
        <AIDialogView />
      </ChapterProvider>
    )
  }

  return null
}

// AI对话答题视图
function AIDialogView() {
  const { currentRun, submitAnswer, useHint, skipQuestion } = useGameStore()
  const [answer, setAnswer] = useState('')
  const [showHint, setShowHint] = useState(false)

  if (!currentRun?.currentQuestion) {
    // 显示Boss挑战
    return <BossChallengeView />
  }

  const question = currentRun.currentQuestion

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background-primary">
      {/* 背景 */}
      <ValleyScene />

      {/* 对话界面 */}
      <div className="relative z-10 flex flex-col h-full p-6">
        {/* 进度条 */}
        <div className="mb-4">
          <div className="flex justify-between text-white/70 text-sm mb-2">
            <span>本章进度</span>
            <span>{currentRun.collectedInRun.length} / ?</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-400 to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${(currentRun.collectedInRun.length / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* 对话区域 */}
        <div className="flex-1 bg-black/40 backdrop-blur-sm rounded-2xl p-6 overflow-auto">
          {/* AI提问 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-4 mb-6"
          >
            <div className="w-12 h-12 rounded-full bg-amber-600 flex items-center justify-center text-2xl">
              👴
            </div>
            <div className="flex-1">
              <div className="text-amber-400 text-sm mb-1">老顽童</div>
              <div className="bg-white/10 rounded-2xl rounded-tl-none p-4 text-white">
                {question.scene_description && (
                  <p className="text-white/60 text-sm mb-2 italic">
                    {question.scene_description}
                  </p>
                )}
                <p className="text-lg leading-relaxed">{question.question}</p>
                {question.reference && (
                  <p className="text-amber-300/70 text-sm mt-2 text-right">
                    {question.reference}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* 答题区域 */}
          <div className="mt-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && answer && submitAnswer(answer)}
                placeholder="输入你的答案..."
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400"
              />
              <button
                onClick={() => answer && submitAnswer(answer)}
                disabled={!answer}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-amber-400 hover:to-orange-400 transition-all"
              >
                提交
              </button>
            </div>

            {/* 辅助按钮 */}
            <div className="flex gap-3 mt-4">
              {question.hint_available && (
                <button
                  onClick={() => setShowHint(true)}
                  className="px-4 py-2 bg-blue-500/20 border border-blue-400/30 rounded-lg text-blue-300 text-sm hover:bg-blue-500/30 transition-all"
                >
                  💡 求助师兄
                </button>
              )}
              <button
                onClick={skipQuestion}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white/70 text-sm hover:bg-white/20 transition-all"
              >
                ⏭️ 跳过此题
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 求助弹窗 */}
      <AnimatePresence>
        {showHint && (
          <HintModal onClose={() => setShowHint(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}

// Boss挑战视图
function BossChallengeView() {
  const { currentRun, completeChapter } = useGameStore()

  if (!currentRun) return null

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background-primary">
      <ValleyScene />
      <BossCase
        chapterId={currentRun.chapterId}
        onComplete={(success, rewards) => {
          if (success) {
            completeChapter(currentRun.chapterId)
          }
        }}
      />
    </div>
  )
}

// 求助弹窗组件
function HintModal({ onClose }: { onClose: () => void }) {
  const { currentRun, requestSocraticGuide } = useGameStore()
  const [guideResponse, setGuideResponse] = useState<any>(null)

  useEffect(() => {
    if (currentRun?.currentQuestion) {
      requestSocraticGuide().then(setGuideResponse)
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 border border-blue-400/30 rounded-2xl p-6 max-w-lg w-full"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-xl">
            👨‍🎓
          </div>
          <h3 className="text-xl font-bold text-white">师兄的提示</h3>
        </div>

        {guideResponse ? (
          <div className="space-y-4">
            <p className="text-white/80 leading-relaxed">{guideResponse.content}</p>

            {guideResponse.response_type === 'guide' && !guideResponse.give_up && (
              <div className="flex gap-2">
                <button
                  onClick={() => {/* 继续引导 */}}
                  className="flex-1 py-2 bg-blue-500/20 border border-blue-400/30 rounded-lg text-blue-300 hover:bg-blue-500/30 transition-all"
                >
                  继续思考
                </button>
                <button
                  onClick={() => {/* 显示答案 */}}
                  className="flex-1 py-2 bg-amber-500/20 border border-amber-400/30 rounded-lg text-amber-300 hover:bg-amber-500/30 transition-all"
                >
                  告诉我答案
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-white/60">师兄正在思考...</div>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full py-2 bg-white/10 rounded-lg text-white/70 hover:bg-white/20 transition-all"
        >
          关闭
        </button>
      </motion.div>
    </motion.div>
  )
}

// 技能树视图
function SkillTreeView() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-background-primary">
      <ValleyScene />
      <div className="relative z-10 flex flex-col h-full">
        <Navigation />
        <div className="flex-1 p-6 overflow-auto">
          <SkillTree />
        </div>
      </div>
    </div>
  )
}

// 开放世界视图
function OpenWorldView() {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-background-primary">
      <ValleyScene />
      <div className="relative z-10 flex flex-col h-full">
        <Navigation />
        <div className="flex-1 p-6 overflow-auto">
          <OpenWorldMap />
        </div>
      </div>
    </div>
  )
}

// 主App组件
function App() {
  const [currentView, setCurrentView] = useState<GameView>('chapters')
  const { login } = useGameStore()

  // 登录处理
  useEffect(() => {
    const result = login()
    if (result.isNewDay) {
      console.log('每日登录奖励:', result.rewards)
    }
  }, [])

  // 根据当前视图渲染
  const renderView = () => {
    switch (currentView) {
      case 'chapters':
        return <GameFlow />
      case 'skills':
        return <SkillTreeView />
      case 'openWorld':
        return <OpenWorldView />
      default:
        return <GameFlow />
    }
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {renderView()}
    </div>
  )
}

export default App

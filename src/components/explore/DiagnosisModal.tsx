import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore, DIAGNOSIS_CONFIG } from '@stores/gameStore'
import type { Seed as SeedType, DiagnosisType, Medicine } from '../../types/index'
import { cn } from '@utils/index'
import { useSound } from '@services/soundService'

interface DiagnosisModalProps {
  seed: SeedType
  medicine: Medicine
  onClose: () => void
}

export default function DiagnosisModal({ seed, medicine, onClose }: DiagnosisModalProps) {
  const { player, examineSeed, guessMedicine, getDiagnosisUnlocked, medicines } = useGameStore()
  const { play } = useSound()

  const [guessInput, setGuessInput] = useState('')
  const [showGuessResult, setShowGuessResult] = useState(false)
  const [guessResult, setGuessResult] = useState<{ correct: boolean; reward: number } | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)

  // 获取当前种子的线索状态
  const diagnosisStatus: Record<DiagnosisType, boolean> = {
    wang: seed.examinedWang ?? false,
    wen: seed.examinedWen ?? false,
    ask: seed.examinedAsk ?? false,
    qie: seed.examinedQie ?? false,
    cha: seed.examinedCha ?? false,
  }

  // 计算已消耗的钻石总数
  const totalSpent = useMemo(() => {
    let spent = 0
    if (seed.examinedWen) spent += DIAGNOSIS_CONFIG.wen.cost
    if (seed.examinedAsk) spent += DIAGNOSIS_CONFIG.ask.cost
    if (seed.examinedQie) spent += DIAGNOSIS_CONFIG.qie.cost
    if (seed.examinedCha) spent += DIAGNOSIS_CONFIG.cha.cost
    return spent
  }, [seed])

  // 处理线索探查
  const handleDiagnosis = (type: DiagnosisType) => {
    const success = examineSeed(seed.id, type)
    if (success) {
      play('diagnosis-reveal')
    } else {
      play('error')
    }
  }

  // 处理猜测
  const handleGuess = () => {
    if (!guessInput.trim()) return
    const result = guessMedicine(seed.id, guessInput.trim())
    setGuessResult(result)
    setShowGuessResult(true)
    if (result.correct) {
      play('collect-success')
      // 猜测成功：解锁一个新种子
      const { discoverSeeds } = useGameStore.getState()
      discoverSeeds(1)
    } else {
      play('error')
    }
  }

  // 处理查看答案
  const handleShowAnswer = () => {
    if (player.currency >= 50) {
      const { addCurrency } = useGameStore.getState()
      addCurrency(-50)
      setShowAnswer(true)
      play('diagnosis-reveal')
    }
  }

  // 候选药名提示（基于已收集的药）
  const candidateMedicines = useMemo(() => {
    return medicines
      .filter(m => m.wuxing === seed.wuxing)
      .map(m => m.name)
  }, [medicines, seed.wuxing])

  // 过滤候选
  const filteredCandidates = useMemo(() => {
    if (!guessInput) return []
    return candidateMedicines.filter(name =>
      name.includes(guessInput) && name !== guessInput
    ).slice(0, 5)
  }, [guessInput, candidateMedicines])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        className="relative w-full max-w-4xl bg-background-secondary rounded-2xl border border-background-tertiary shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-background-tertiary text-text-secondary hover:text-text-primary transition-colors"
        >
          ✕
        </button>

        {/* 标题区 */}
        <div className="bg-gradient-to-r from-primary/20 to-transparent p-6 border-b border-background-tertiary">
          <div className="flex items-center gap-4">
            <div className="text-4xl">🔮</div>
            <div>
              <h2 className="text-2xl font-bold text-text-primary font-title">
                性味归经
              </h2>
              <p className="text-sm text-text-secondary">
                查看药图、性味、归经，收集线索猜测药名
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2 bg-background-tertiary/50 px-4 py-2 rounded-full">
              <span className="text-xl">💎</span>
              <span className="font-bold text-text-primary">{player.currency}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* 左侧：水晶球展示 */}
          <div className="lg:w-2/5 p-6 bg-background-primary/50">
            <CrystalBallDisplay
              seed={seed}
              medicine={medicine}
              diagnosisStatus={diagnosisStatus}
            />

            {/* 已消耗钻石 */}
            <div className="mt-4 text-center">
              <span className="text-sm text-text-secondary">
                已消耗线索费用: <span className="text-primary font-bold">{totalSpent}</span> 💎
              </span>
            </div>
          </div>

          {/* 右侧：线索操作区 */}
          <div className="lg:w-3/5 p-6">
            <AnimatePresence mode="wait">
              {!showGuessResult ? (
                <motion.div
                  key="diagnosis"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* 线索按钮 */}
                  <div className="grid grid-cols-5 gap-2 mb-6">
                    {(['wang', 'wen', 'ask', 'qie', 'cha'] as DiagnosisType[]).map((type) => {
                      const config = DIAGNOSIS_CONFIG[type]
                      const unlocked = getDiagnosisUnlocked(type)
                      const examined = diagnosisStatus[type]

                      return (
                        <motion.button
                          key={type}
                          whileHover={unlocked && !examined ? { scale: 1.05 } : {}}
                          whileTap={unlocked && !examined ? { scale: 0.95 } : {}}
                          onClick={() => handleDiagnosis(type)}
                          disabled={!unlocked || examined}
                          className={cn(
                            'relative p-3 rounded-xl border-2 transition-all duration-200',
                            examined
                              ? 'bg-status-success/20 border-status-success'
                              : unlocked
                                ? 'bg-background-tertiary/50 border-background-tertiary hover:border-primary/50'
                                : 'bg-background-tertiary/20 border-background-tertiary/30 opacity-50'
                          )}
                        >
                          <div className="text-2xl mb-1">
                            {type === 'wang' && '👁️'}
                            {type === 'wen' && '👃'}
                            {type === 'ask' && '💬'}
                            {type === 'qie' && '✋'}
                            {type === 'cha' && '📋'}
                          </div>
                          <div className="text-sm font-bold text-text-primary">{config.name}</div>
                          <div className="text-xs text-text-muted">
                            {type === 'wang' ? '免费' : `${config.cost}💎`}
                          </div>
                          {examined && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-status-success rounded-full flex items-center justify-center text-white text-xs">
                              ✓
                            </div>
                          )}
                          {!unlocked && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-lg">🔒</span>
                            </div>
                          )}
                        </motion.button>
                      )
                    })}
                  </div>

                  {/* 线索面板 */}
                  <CluePanel
                    medicine={medicine}
                    diagnosisStatus={diagnosisStatus}
                    unlockedDiagnosis={{
                      wang: true,
                      wen: getDiagnosisUnlocked('wen') ?? false,
                      ask: getDiagnosisUnlocked('ask') ?? false,
                      qie: getDiagnosisUnlocked('qie') ?? false,
                      cha: getDiagnosisUnlocked('cha') ?? false,
                    }}
                  />

                  {/* 猜测输入 */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      猜测药名
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={guessInput}
                        onChange={(e) => setGuessInput(e.target.value)}
                        placeholder="输入你认为的药名..."
                        className="w-full px-4 py-3 bg-background-tertiary/50 border border-background-tertiary rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary"
                      />
                      {/* 候选提示 */}
                      {filteredCandidates.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-background-secondary border border-background-tertiary rounded-xl overflow-hidden z-10">
                          {filteredCandidates.map((name) => (
                            <button
                              key={name}
                              onClick={() => setGuessInput(name)}
                              className="w-full px-4 py-2 text-left text-text-primary hover:bg-background-tertiary/50 transition-colors"
                            >
                              {name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={handleGuess}
                        disabled={!guessInput.trim()}
                        className={cn(
                          'flex-1 py-3 rounded-xl font-medium transition-all duration-200',
                          guessInput.trim()
                            ? 'btn-primary'
                            : 'bg-background-tertiary text-text-muted cursor-not-allowed'
                        )}
                      >
                        确认猜测
                      </button>
                      <button
                        onClick={handleShowAnswer}
                        disabled={player.currency < 50}
                        className={cn(
                          'px-4 py-3 rounded-xl font-medium transition-all duration-200',
                          player.currency >= 50
                            ? 'bg-background-tertiary text-text-primary hover:bg-background-tertiary/80'
                            : 'bg-background-tertiary/50 text-text-muted cursor-not-allowed'
                        )}
                      >
                        查看答案 (50💎)
                      </button>
                    </div>

                    {showAnswer && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-4 bg-status-error/10 border border-status-error/30 rounded-xl"
                      >
                        <p className="text-center">
                          <span className="text-text-secondary">正确答案是：</span>
                          <span className="text-xl font-bold text-status-error ml-2">{medicine.name}</span>
                        </p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <GuessResult
                  result={guessResult!}
                  medicine={medicine}
                  onClose={onClose}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// 水晶球展示组件
function CrystalBallDisplay({
  seed,
  medicine,
  diagnosisStatus,
}: {
  seed: SeedType
  medicine: Medicine
  diagnosisStatus: Record<DiagnosisType, boolean>
}) {
  const [activeImageTab, setActiveImageTab] = useState<'plant' | 'herb'>('plant')
  const [imageError, setImageError] = useState<'plant' | 'herb' | null>(null)

  const wuxingColors = {
    wood: '#2E7D32',
    fire: '#C62828',
    earth: '#F9A825',
    metal: '#78909C',
    water: '#1565C0',
  }

  const wuxingNames = {
    wood: '木',
    fire: '火',
    earth: '土',
    metal: '金',
    water: '水',
  }

  // 药图已解锁
  const isWangUnlocked = diagnosisStatus.wang
  // 是否有饮片图
  const hasHerbImage = !!medicine.imageHerb

  // 调试日志：检查图片路径
  console.log('[CrystalBallDisplay] medicine:', medicine.name, 'imagePlant:', medicine.imagePlant, 'imageHerb:', medicine.imageHerb)

  // 未解锁药图时显示占位
  if (!isWangUnlocked) {
    return (
      <div className="relative">
        {/* 未解锁状态 */}
        <div className="relative aspect-square max-w-[280px] mx-auto">
          {/* 水晶球外发光 */}
          <motion.div
            animate={{
              boxShadow: [
                `0 0 30px ${wuxingColors[seed.wuxing]}40`,
                `0 0 50px ${wuxingColors[seed.wuxing]}60`,
                `0 0 30px ${wuxingColors[seed.wuxing]}40`,
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full"
          />

          {/* 水晶球主体 - 模糊占位 */}
          <div className="relative w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm border-2 border-white/30">
            <div className="absolute inset-2 rounded-full overflow-hidden">
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                <span className="text-6xl opacity-50">🔮</span>
              </div>
              {/* 水晶折射效果 */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent" />
              <div className="absolute top-4 left-4 w-16 h-16 bg-white/20 rounded-full blur-xl" />
              <div className="absolute bottom-8 right-8 w-8 h-8 bg-white/30 rounded-full" />
            </div>

            {/* 五行标识 */}
            <div className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: wuxingColors[seed.wuxing] }}
            >
              {wuxingNames[seed.wuxing]}
            </div>
          </div>
        </div>

        {/* 悬浮提示 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-center"
        >
          <span className="text-sm text-text-muted">点击药图查看药物外观</span>
        </motion.div>
      </div>
    )
  }

  // 已解锁望诊 - 显示清晰的药物图片
  return (
    <div className="relative">
      {/* 图片展示区域 */}
      <div className="relative aspect-square max-w-[320px] mx-auto rounded-2xl overflow-hidden bg-background-tertiary/30 border border-background-tertiary shadow-lg">
        {activeImageTab === 'plant' && medicine.imagePlant && !imageError ? (
          <img
            src={medicine.imagePlant}
            alt={`${medicine.name} - 原植物`}
            className="w-full h-full object-cover"
            onError={() => {
              console.error('[CrystalBallDisplay] Failed to load plant image:', medicine.imagePlant)
              setImageError('plant')
            }}
          />
        ) : activeImageTab === 'herb' && medicine.imageHerb && !imageError ? (
          <img
            src={medicine.imageHerb}
            alt={`${medicine.name} - 饮片`}
            className="w-full h-full object-cover"
            onError={() => {
              console.error('[CrystalBallDisplay] Failed to load herb image:', medicine.imageHerb)
              setImageError('herb')
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <span className="text-6xl opacity-50 mb-2">
              {imageError ? '⚠️' : '🌿'}
            </span>
            <span className="text-sm text-text-secondary">
              {imageError === 'plant' ? '原植物图加载失败' : imageError === 'herb' ? '饮片图加载失败' : '暂无图片'}
            </span>
          </div>
        )}

        {/* 五行标识 */}
        <div className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg"
          style={{ backgroundColor: wuxingColors[seed.wuxing] }}
        >
          {wuxingNames[seed.wuxing]}
        </div>
      </div>

      {/* 图片切换标签 */}
      <div className="mt-4 flex justify-center gap-2">
        <button
          onClick={() => setActiveImageTab('plant')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
            activeImageTab === 'plant'
              ? 'bg-primary text-white'
              : 'bg-background-tertiary/50 text-text-secondary hover:bg-background-tertiary'
          )}
        >
          原植物图
        </button>
        {hasHerbImage && (
          <button
            onClick={() => setActiveImageTab('herb')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              activeImageTab === 'herb'
                ? 'bg-primary text-white'
                : 'bg-background-tertiary/50 text-text-secondary hover:bg-background-tertiary'
            )}
          >
            饮片图
          </button>
        )}
      </div>

      {/* 悬浮提示 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-2 text-center"
      >
        <span className="text-xs text-text-muted">已查看药图 - 五行归属：{wuxingNames[seed.wuxing]}行</span>
      </motion.div>
    </div>
  )
}

// 线索面板
function CluePanel({
  medicine,
  diagnosisStatus,
  unlockedDiagnosis,
}: {
  medicine: Medicine
  diagnosisStatus: Record<DiagnosisType, boolean>
  unlockedDiagnosis: Record<DiagnosisType, boolean>
}) {
  return (
    <div className="bg-background-tertiary/30 rounded-xl p-4">
      <h3 className="text-sm font-bold text-text-secondary mb-3 flex items-center gap-2">
        <span>📋</span> 已收集线索
      </h3>

      <div className="space-y-2">
        {/* 药图信息 */}
        <ClueItem
          icon="👁️"
          label="药图"
          revealed={diagnosisStatus.wang}
          content={
            <div className="flex items-center gap-2">
              <span className="text-2xl">
                {medicine.wuxing === 'wood' && '🌳'}
                {medicine.wuxing === 'fire' && '🔥'}
                {medicine.wuxing === 'earth' && '🏔️'}
                {medicine.wuxing === 'metal' && '⚔️'}
                {medicine.wuxing === 'water' && '💧'}
              </span>
              <span>五行归属：<span className="text-primary">{medicine.wuxing === 'wood' ? '木' : medicine.wuxing === 'fire' ? '火' : medicine.wuxing === 'earth' ? '土' : medicine.wuxing === 'metal' ? '金' : '水'}</span></span>
            </div>
          }
        />

        {/* 四气信息 */}
        <ClueItem
          icon="👃"
          label="四气"
          revealed={diagnosisStatus.wen}
          locked={!unlockedDiagnosis.wen}
          cost={DIAGNOSIS_CONFIG.wen.cost}
          content={<span>四气：<span className="text-primary font-medium">{medicine.fourQi}</span></span>}
        />

        {/* 五味信息 */}
        <ClueItem
          icon="💬"
          label="五味"
          revealed={diagnosisStatus.ask}
          locked={!unlockedDiagnosis.ask}
          cost={DIAGNOSIS_CONFIG.ask.cost}
          content={
            <div>
              <span>五味：</span>
              <span className="text-primary font-medium">{medicine.fiveFlavors.join('、')}</span>
              {medicine.toxicity && medicine.toxicity !== '无毒' && (
                <span className="ml-2 text-status-error">⚠️ {medicine.toxicity}</span>
              )}
            </div>
          }
        />

        {/* 归经信息 */}
        <ClueItem
          icon="✋"
          label="归经"
          revealed={diagnosisStatus.qie}
          locked={!unlockedDiagnosis.qie}
          cost={DIAGNOSIS_CONFIG.qie.cost}
          content={
            <div className="space-y-1">
              <div>升降浮沉：<span className="text-primary font-medium">{medicine.movement}</span></div>
              <div className="text-sm text-text-secondary">归经：{medicine.meridians.join('、')}</div>
            </div>
          }
        />

        {/* 查诊信息 */}
        <ClueItem
          icon="📋"
          label="查诊"
          revealed={diagnosisStatus.cha}
          locked={!unlockedDiagnosis.cha}
          cost={DIAGNOSIS_CONFIG.cha.cost}
          content={
            <div className="space-y-1">
              <div className="text-sm">
                <span className="text-text-secondary">功效：</span>
                <span className="text-primary">{medicine.functions.slice(0, 2).join('、')}</span>
              </div>
              <div className="text-sm">
                <span className="text-text-secondary">主治：</span>
                <span>{medicine.indications.slice(0, 2).join('、')}...</span>
              </div>
            </div>
          }
        />
      </div>
    </div>
  )
}

// 线索项
function ClueItem({
  icon,
  label,
  revealed,
  locked,
  cost,
  content,
}: {
  icon: string
  label: string
  revealed: boolean
  locked?: boolean
  cost?: number
  content: React.ReactNode
}) {
  if (locked) {
    return (
      <div className="flex items-center gap-3 p-2 rounded-lg bg-background-tertiary/20 opacity-50">
        <span className="text-lg">{icon}</span>
        <span className="text-sm text-text-muted">{label} (收集{cost === 10 ? 10 : cost === 15 ? 20 : 30}味药解锁)</span>
      </div>
    )
  }

  if (!revealed) {
    return (
      <div className="flex items-center gap-3 p-2 rounded-lg bg-background-tertiary/20">
        <span className="text-lg">{icon}</span>
        <span className="text-sm text-text-muted">{label} (未探查)</span>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-3 p-2 rounded-lg bg-status-success/10 border border-status-success/20"
    >
      <span className="text-lg">{icon}</span>
      <div className="flex-1 text-sm text-text-primary">{content}</div>
    </motion.div>
  )
}

// 猜测结果
function GuessResult({
  result,
  medicine,
  onClose,
}: {
  result: { correct: boolean; reward: number }
  medicine: Medicine
  onClose: () => void
}) {
  const { player } = useGameStore()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-8"
    >
      {result.correct ? (
        <>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="text-6xl mb-4"
          >
            🎉
          </motion.div>
          <h3 className="text-2xl font-bold text-status-success mb-2">
            猜测正确！
          </h3>
          <p className="text-text-secondary mb-4">
            这是 <span className="text-xl font-bold text-primary">{medicine.name}</span>
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-status-success/20 rounded-xl p-6 mb-6"
          >
            <p className="text-sm text-text-secondary mb-2">获得奖励</p>
            <div className="flex justify-center gap-8">
              <div className="flex items-center gap-2">
                <span className="text-3xl">💎</span>
                <span className="text-xl font-bold text-text-primary">+{result.reward}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-3xl">🌿</span>
                <span className="text-xl font-bold text-text-primary">{medicine.name}</span>
              </div>
            </div>
            {player.dailyStats.correctGuesses > 0 && player.dailyStats.correctGuesses % 3 === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-3 text-sm text-primary"
              >
                ✨ 连续{player.dailyStats.correctGuesses}次正确！额外奖励已发放
              </motion.div>
            )}
          </motion.div>

          <button onClick={onClose} className="btn-primary px-8">
            收入图鉴
          </button>
        </>
      ) : (
        <>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="text-6xl mb-4"
          >
            😔
          </motion.div>
          <h3 className="text-xl font-bold text-status-error mb-2">
            猜测错误
          </h3>
          <p className="text-text-secondary mb-6">
            这不是你猜的药材，继续收集线索再试一次吧
          </p>
          <p className="text-sm text-text-muted mb-6">
            连续猜测已重置，下次连续正确可获得额外奖励
          </p>
          <button onClick={onClose} className="btn-secondary px-8">
            返回继续探查
          </button>
        </>
      )}
    </motion.div>
  )
}

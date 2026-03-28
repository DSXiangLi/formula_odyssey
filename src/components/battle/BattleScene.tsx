import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BattleEngine } from '../../systems/battle/BattleEngine';
import {
  BattleState,
  BattleResult,
  MedicineSpirit,
  SpiritSkill,
  AnswerEvaluation,
  TameResult,
} from '../../systems/battle/types';
import { Medicine } from '../../types';
import SpiritCharacter from './SpiritCharacter';
import QuestionBubble from './QuestionBubble';
import SpiritSkillBar from './SpiritSkillBar';
import GameTutorial from './GameTutorial';

interface BattleSceneProps {
  medicines: Medicine[];
  onComplete: (result: {
    victory: boolean;
    score: number;
    maxCombo: number;
    tamedSpirits: string[];
  }) => void;
  onExit: () => void;
}

const BattleScene: React.FC<BattleSceneProps> = ({ medicines, onComplete, onExit }) => {
  // 战斗引擎
  const [engine] = useState(() => new BattleEngine(medicines));
  const [state, setState] = useState<BattleState>(engine.getState());

  // UI 状态
  const [showTutorial, setShowTutorial] = useState(true);
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showDescription, setShowDescription] = useState(false);

  // 游戏结果
  const [gameResult, setGameResult] = useState<BattleResult | null>(null);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);

  // 订阅状态变化
  useEffect(() => {
    const listener = {
      onStateChange: (newState: BattleState) => {
        setState(newState);
      },
      onBattleEnd: (result: BattleResult) => {
        setGameResult(result);
      },
    };

    engine.addEventListener(listener);

    return () => {
      engine.removeEventListener(listener);
    };
  }, [engine]);

  // 获取激活的药灵
  const activeSpirit = state.spirits.find((s) => s.id === state.activeSpiritId);

  // 处理开始游戏
  const handleStartGame = useCallback(() => {
    setShowTutorial(false);
    engine.start();
  }, [engine]);

  // 处理药灵点击
  const handleSpiritClick = useCallback(
    (spiritId: string) => {
      if (state.status !== 'playing') return;
      engine.activateSpirit(spiritId);
      setInputText('');
      setShowHint(false);
      setShowDescription(false);
    },
    [engine, state.status]
  );

  // 处理答案提交
  const handleSubmitAnswer = useCallback(async () => {
    if (!inputText.trim() || isSubmitting || !activeSpirit) return;

    setIsSubmitting(true);
    try {
      const result = await engine.submitAnswer(inputText.trim());
      if (result) {
        setInputText('');
        setShowHint(false);
        setShowDescription(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [engine, inputText, isSubmitting, activeSpirit]);

  // 处理键盘事件
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSubmitAnswer();
      }
    },
    [handleSubmitAnswer]
  );

  // 处理技能使用
  const handleUseSkill = useCallback(
    (skillId: string) => {
      const success = engine.useSkill(skillId);
      if (success) {
        const skill = state.skills.find((s) => s.id === skillId);
        if (skill) {
          switch (skill.effect.type) {
            case 'show_hint':
              setShowHint(true);
              break;
            case 'show_description':
              setShowDescription(true);
              break;
            case 'mentor_answer':
              // AI导师直接给出答案，已在引擎中处理得分扣减
              break;
          }
        }
      }
    },
    [engine, state.skills]
  );

  // 处理完成游戏
  const handleComplete = useCallback(() => {
    if (gameResult) {
      onComplete({
        victory: gameResult.victory,
        score: gameResult.score,
        maxCombo: gameResult.maxCombo,
        tamedSpirits: gameResult.tamedSpirits,
      });
    }
  }, [gameResult, onComplete]);

  // 获取当前药材的详细信息
  const getCurrentMedicine = useCallback(() => {
    if (!activeSpirit) return null;
    return medicines.find((m) => m.id === activeSpirit.medicineId);
  }, [activeSpirit, medicines]);

  // 聚焦输入框
  useEffect(() => {
    if (state.status === 'playing' && activeSpirit && !showTutorial) {
      inputRef.current?.focus();
    }
  }, [state.status, activeSpirit, showTutorial]);

  // 格式化时间
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      data-testid="battle-scene"
      className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden"
    >
      {/* 教程弹窗 */}
      <GameTutorial isOpen={showTutorial} onClose={handleStartGame} />

      {/* 顶部导航 */}
      <header
        data-testid="battle-header"
        className="fixed top-0 left-0 right-0 z-40 bg-black/40 backdrop-blur-md border-b border-white/10"
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* 左侧：返回按钮和标题 */}
          <div className="flex items-center gap-4">
            <button
              data-testid="exit-button"
              onClick={onExit}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <span className="text-xl">←</span>
            </button>
            <div>
              <h1 className="text-lg font-bold">药灵守护战</h1>
              <p data-testid="wave-indicator" className="text-xs text-white/60">
                第 {state.wave} 波 / {state.totalWaves} 波
              </p>
            </div>
          </div>

          {/* 右侧：药囊计数和计时器 */}
          <div className="flex items-center gap-6">
            {/* 驯服计数 */}
            <div data-testid="tamed-count" className="flex items-center gap-2">
              <span className="text-emerald-400">🌿</span>
              <span className="text-sm">
                {state.tamedCount}/{state.totalSpirits}
              </span>
            </div>

            {/* 计时器 */}
            <div data-testid="timer" className="text-right">
              <p className="text-xs text-white/60">时间</p>
              <p className="text-lg font-mono">{formatTime(state.timeElapsed)}</p>
            </div>
          </div>
        </div>
      </header>

      {/* 主战斗区域 */}
      <main className="relative pt-20 pb-40 px-4 min-h-screen flex flex-col">
        {/* 状态栏 */}
        <div
          data-testid="status-bar"
          className="flex items-center justify-center gap-8 py-4"
        >
          {/* 得分 */}
          <div className="text-center">
            <p className="text-xs text-white/60">得分</p>
            <p className="text-2xl font-bold font-mono text-amber-400">
              {state.score.toLocaleString()}
            </p>
          </div>

          {/* 连击 */}
          <AnimatePresence>
            {state.combo > 0 && (
              <motion.div
                data-testid="combo-display"
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 10 }}
                className="text-center"
              >
                <p className="text-xs text-orange-400">连击</p>
                <p className="text-3xl font-bold text-orange-400">{state.combo}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 最大连击 */}
          <div className="text-center">
            <p className="text-xs text-white/60">最高连击</p>
            <p className="text-xl font-bold font-mono text-purple-400">{state.maxCombo}</p>
          </div>
        </div>

        {/* 药灵区域 */}
        <div
          data-testid="spirits-area"
          className="flex-1 relative min-h-[300px] flex items-center justify-center"
        >
          <div className="flex flex-wrap items-center justify-center gap-8 max-w-4xl">
            {state.spirits.map((spirit, index) => (
              <motion.div
                key={spirit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <SpiritCharacter
                  spirit={spirit}
                  isActive={spirit.id === state.activeSpiritId}
                  onClick={() => handleSpiritClick(spirit.id)}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* 问题泡泡区域 */}
        <AnimatePresence mode="wait">
          {activeSpirit && state.status === 'playing' && (
            <motion.div
              data-testid="question-area"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed bottom-48 left-0 right-0 px-4 z-30"
            >
              <QuestionBubble
                spiritName={activeSpirit.displayName}
                question={activeSpirit.question}
                evaluation={state.lastEvaluation}
                showHint={showHint}
              />

              {/* 药材描述（使用技能后显示） */}
              <AnimatePresence>
                {showDescription && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl max-w-2xl mx-auto"
                  >
                    <p className="text-sm font-semibold text-emerald-800 mb-1">
                      📚 药材详情
                    </p>
                    <p className="text-emerald-700 text-sm">
                      {(() => {
                        const med = getCurrentMedicine();
                        if (!med) return '暂无描述信息';
                        return `【${med.name}】性味：${med.fourQi}，${med.fiveFlavors?.join('、') || '甘'}味。归经：${med.meridians?.join('、') || '未定'}。功效：${med.functions?.join('、') || '暂无'}。`;
                      })()}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 输入区域 */}
        {activeSpirit && state.status === 'playing' && (
          <div
            data-testid="input-area"
            className="fixed bottom-32 left-0 right-0 px-4 z-30"
          >
            <div className="max-w-md mx-auto">
              <div className="relative">
                <input
                  ref={inputRef}
                  data-testid="answer-input"
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="输入你的答案..."
                  disabled={isSubmitting}
                  className="w-full px-6 py-4 bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-2xl text-center text-xl font-medium text-white placeholder-white/40 focus:border-emerald-500/50 focus:bg-white/20 transition-all disabled:opacity-50"
                />
                <button
                  data-testid="submit-button"
                  onClick={handleSubmitAnswer}
                  disabled={!inputText.trim() || isSubmitting}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  提交
                </button>
              </div>
              <p className="text-center text-white/40 text-sm mt-2">
                按 Enter 快速提交
              </p>
            </div>
          </div>
        )}

        {/* 技能栏区域 */}
        <div
          data-testid="skill-bar-area"
          className="fixed bottom-4 left-0 right-0 px-4 z-30"
        >
          <div className="max-w-2xl mx-auto">
            <SpiritSkillBar
              skills={state.skills}
              onUseSkill={handleUseSkill}
              disabled={state.status !== 'playing'}
            />
          </div>
        </div>

        {/* 游戏结束覆盖层 */}
        <AnimatePresence>
          {(state.status === 'victory' || state.status === 'defeat') && gameResult && (
            <motion.div
              data-testid="game-over-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className={`bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center ${
                  state.status === 'victory'
                    ? 'border-4 border-emerald-400'
                    : 'border-4 border-red-400'
                }`}
              >
                {/* 结果图标 */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className={`text-6xl mb-4 ${
                    state.status === 'victory' ? 'text-emerald-500' : 'text-red-500'
                  }`}
                >
                  {state.status === 'victory' ? '🎉' : '💔'}
                </motion.div>

                {/* 结果标题 */}
                <h2
                  className={`text-3xl font-bold mb-2 ${
                    state.status === 'victory' ? 'text-emerald-700' : 'text-red-700'
                  }`}
                >
                  {state.status === 'victory' ? '胜利！' : '失败'}
                </h2>

                {/* 结果描述 */}
                <p className="text-gray-600 mb-6">
                  {state.status === 'victory'
                    ? '恭喜！你成功驯服了所有药灵！'
                    : '药灵们逃走了，再试一次吧！'}
                </p>

                {/* 统计数据 */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500">最终得分</p>
                    <p className="text-2xl font-bold text-amber-500">
                      {gameResult.score.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500">最高连击</p>
                    <p className="text-2xl font-bold text-purple-500">
                      {gameResult.maxCombo}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500">驯服药灵</p>
                    <p className="text-2xl font-bold text-emerald-500">
                      {gameResult.tamedSpirits.length}/{state.totalSpirits}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500">用时</p>
                    <p className="text-2xl font-bold text-blue-500">
                      {formatTime(gameResult.timeElapsed)}
                    </p>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-4">
                  <button
                    data-testid="complete-button"
                    onClick={handleComplete}
                    className={`flex-1 py-3 rounded-xl font-bold transition-colors ${
                      state.status === 'victory'
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                        : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
                  >
                    {state.status === 'victory' ? '继续' : '结束'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 等待开始提示 */}
        <AnimatePresence>
          {!showTutorial && state.status === 'waiting' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-20 flex items-center justify-center bg-black/50"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="text-center"
              >
                <div className="text-6xl mb-4">🌿</div>
                <p className="text-xl text-white/80">准备中...</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default BattleScene;

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BattleEngine } from '../../systems/battle/BattleEngine';
import { BattleState, BattleResult, Enemy, InputResult, Skill, BattleMedicine, BattleFormula } from '../../systems/battle/types';
import SkillBar from './SkillBar';

interface BattleSceneProps {
  chapterId: string;
  medicines: BattleMedicine[];
  formulas: BattleFormula[];
  onComplete: (result: BattleResult) => void;
  onExit?: () => void;
}

const BattleScene: React.FC<BattleSceneProps> = ({
  chapterId,
  medicines,
  formulas,
  onComplete,
  onExit,
}) => {
  const [engine] = useState(() =>
    new BattleEngine({
      chapterId,
      medicines,
      formulas,
    })
  );
  const [state, setState] = useState<BattleState>(engine.getState());
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [input, setInput] = useState('');
  const [inputFeedback, setInputFeedback] = useState<InputResult | null>(null);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Start game loop
  useEffect(() => {
    engine.start();

    const gameLoop = (timestamp: number) => {
      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;
      engine.update(deltaTime);
      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [engine]);

  // Listen for state changes
  useEffect(() => {
    const handleStateChange = () => {
      const newState = engine.getState();
      setState(newState);

      // Check if battle ended
      if (newState.phase === 'ending' && !battleResult) {
        // Create result from final state
        const result: BattleResult = {
          victory: newState.playerHealth > 0,
          score: newState.score,
          maxCombo: newState.maxCombo,
          wavesCleared: newState.currentWave,
          timeElapsed: newState.timeElapsed,
          correctAnswers: 0,
          totalQuestions: 0,
        };
        setBattleResult(result);
        setTimeout(() => onComplete(result), 2000);
      }
    };

    const interval = setInterval(handleStateChange, 100);
    return () => clearInterval(interval);
  }, [engine, onComplete, battleResult]);


  // Auto-focus input
  useEffect(() => {
    if (state.phase === 'fighting' || state.phase === 'boss_fight') {
      inputRef.current?.focus();
    }
  }, [state.phase]);

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInput(value);

      const result = engine.onInput(value);
      setInputFeedback(result);

      if (result.type === 'exact_match' || result.type === 'pinyin_match') {
        setInput('');
        setInputFeedback(null);
      }
    },
    [engine]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && input) {
        // Clear input if no match found
        const result = engine.onInput(input);
        if (result.type === 'no_match') {
          setInput('');
          setInputFeedback(null);
        }
      }
    },
    [input, engine]
  );

  const handleSkillUse = useCallback(
    (skillId: string) => {
      engine.useSkill(skillId);
    },
    [engine]
  );

  const getWaveName = (wave: number) => {
    const names = ['', '药名辨识', '性味归经', '功效主治', '方剂对决'];
    return names[wave] || '';
  };

  const getEnemyEmoji = (type: Enemy['type']) => {
    switch (type) {
      case 'boss':
        return '👹';
      case 'elite':
        return '👺';
      default:
        return '👾';
    }
  };

  const getPhaseDisplay = () => {
    switch (state.phase) {
      case 'preparing':
        return { title: '准备战斗', subtitle: '点击开始' };
      case 'wave_start':
        return {
          title: `第 ${state.currentWave} 波`,
          subtitle: getWaveName(state.currentWave),
        };
      case 'spawning':
        return { title: '敌人来袭', subtitle: '准备迎战' };
      case 'fighting':
      case 'boss_fight':
        return { title: '战斗中', subtitle: '输入答案击败敌人' };
      case 'wave_clear':
        return { title: '波次完成', subtitle: '准备下一波' };
      case 'ending':
        return {
          title: state.playerHealth > 0 ? '胜利！' : '失败',
          subtitle: state.playerHealth > 0 ? '恭喜通关' : '再试一次',
        };
      default:
        return { title: '', subtitle: '' };
    }
  };

  const phaseDisplay = getPhaseDisplay();

  return (
    <div data-testid="battle-scene" className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Header */}
      <header data-testid="battle-header" className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-lg font-bold">药灵守护战</h1>
              <p data-testid="wave-indicator" className="text-xs text-white/60">
                第 {state.currentWave || 1} 波 / {state.totalWaves} 波 - {getWaveName(state.currentWave)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Health */}
            <div data-testid="health-bar" className="flex items-center gap-2">
              <span className="text-red-400">❤️</span>
              <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-red-500 to-red-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${(state.playerHealth / state.maxHealth) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="text-sm font-mono">
                {state.playerHealth}/{state.maxHealth}
              </span>
            </div>

            {/* Score */}
            <div data-testid="score-display" className="text-right">
              <p className="text-xs text-white/60">得分</p>
              <p className="text-lg font-bold font-mono">{state.score.toLocaleString()}</p>
            </div>

            {/* Combo */}
            <AnimatePresence>
              {state.combo > 1 && (
                <motion.div
                  data-testid="combo-display"
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 10 }}
                  className="text-right"
                >
                  <p className="text-xs text-yellow-400">连击</p>
                  <p className="text-xl font-bold text-yellow-400">{state.combo}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Main Battle Area */}
      <main className="relative pt-20 pb-32 px-4 min-h-screen flex flex-col">
        {/* Phase Overlay */}
        <AnimatePresence>
          {(state.phase === 'wave_start' ||
            state.phase === 'wave_clear' ||
            state.phase === 'ending') && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.5, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.5, y: -20 }}
                className="text-center"
              >
                <h2 className="text-5xl font-bold mb-2">{phaseDisplay.title}</h2>
                <p className="text-xl text-white/70">{phaseDisplay.subtitle}</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enemy Field */}
        <div data-testid="enemy-field" className="flex-1 relative min-h-[400px]">
          {/* Background grid */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `
                  linear-gradient(to right, white 1px, transparent 1px),
                  linear-gradient(to bottom, white 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px',
              }}
            />
          </div>

          {/* Enemies */}
          <div className="relative h-full max-w-4xl mx-auto">
            {state.enemies.map((enemy) => (
              <motion.div
                data-testid="enemy"
                key={enemy.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: enemy.status === 'defeated' ? 0 : 1,
                  scale: enemy.status === 'defeated' ? 0 : 1,
                  x: enemy.position.x - 400,
                  y: enemy.position.y,
                }}
                transition={{ duration: 0.2 }}
                className="absolute left-1/2 top-0"
              >
                <div
                  className={`relative ${
                    enemy.status === 'approaching' ? 'animate-pulse' : ''
                  }`}
                >
                  {/* Target text */}
                  <div data-testid="enemy-target-text" className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <div className="bg-black/70 px-3 py-1 rounded-lg text-sm">
                      {enemy.targetText}
                    </div>
                    {input && enemy.targetPinyin.startsWith(input.toLowerCase()) && (
                      <div className="text-xs text-center text-green-400 mt-1">
                        {enemy.targetPinyin}
                      </div>
                    )}
                  </div>

                  {/* Enemy sprite */}
                  <div className="text-6xl">{getEnemyEmoji(enemy.type)}</div>

                  {/* Health bar */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 transition-all duration-300"
                      style={{
                        width: `${(enemy.health / enemy.maxHealth) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Player */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <motion.div
              animate={{
                scale: state.shieldTimeRemaining > 0 ? [1, 1.1, 1] : 1,
              }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="relative"
            >
              <div className="text-6xl">🧙‍♂️</div>
              {state.shieldTimeRemaining > 0 && (
                <div className="absolute inset-0 -m-4 rounded-full border-4 border-blue-400/50 animate-ping" />
              )}
              {state.timeScale < 1 && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-blue-300 text-sm">
                  时间减缓
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Input Area */}
        <div className="fixed bottom-24 left-0 right-0 px-4">
          <div className="max-w-md mx-auto">
            <div className="relative">
              <input
                data-testid="battle-input"
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="输入药材名称或拼音..."
                disabled={state.phase !== 'fighting' && state.phase !== 'boss_fight'}
                className={`w-full px-6 py-4 bg-white/10 backdrop-blur-md border-2 rounded-2xl text-center text-xl font-medium transition-all ${
                  inputFeedback?.type === 'prefix_match'
                    ? 'border-green-500/50 bg-green-500/10'
                    : 'border-white/20 focus:border-blue-500/50 focus:bg-white/20'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              />

              {/* Input feedback */}
              <AnimatePresence>
                {inputFeedback?.type === 'prefix_match' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute -top-8 left-1/2 -translate-x-1/2 text-green-400 text-sm"
                  >
                    输入中...
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <p className="text-center text-white/40 text-sm mt-2">
              支持拼音输入 | 按 Enter 确认
            </p>
          </div>
        </div>

        {/* Skill Bar */}
        <div className="fixed bottom-4 left-0 right-0 px-4">
          <SkillBar
            skills={state.skills}
            onUseSkill={handleSkillUse}
            disabled={state.phase !== 'fighting' && state.phase !== 'boss_fight'}
          />
        </div>
      </main>
    </div>
  );
};

export default BattleScene;

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Trophy, Heart, Zap, Clock } from 'lucide-react';
import { BattleEngine } from '../systems/battle';
import { BattleState, BattleResult, Skill, BattleMedicine, BattleFormula } from '../systems/battle/types';
import { useChapterStore } from '../stores/chapterStore';
import { usePlayerStore } from '../stores/playerStore';
import { getChapterById } from '../data/chapters';
import { getMedicineByName, MedicineData } from '../data/medicines';
import { getFormulaByName, FormulaData } from '../data/formulas';

const BattleStage: React.FC = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const chapterStore = useChapterStore();
  const playerStore = usePlayerStore();

  const [battleEngine, setBattleEngine] = useState<BattleEngine | null>(null);
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [input, setInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const gameLoopRef = useRef<number | null>(null);

  // Get chapter data
  const chapter = chapterId ? getChapterById(chapterId) : undefined;

  // Transform MedicineData to BattleMedicine
  const transformMedicine = (data: MedicineData): BattleMedicine => {
    // Parse nature field (e.g., "辛、微温" -> fourQi "微温", fiveFlavors ["辛"])
    const natureParts = data.nature.split('、');
    const fiveFlavors = natureParts.filter(p => ['辛', '甘', '酸', '苦', '咸'].some(f => p.includes(f)));
    const fourQi = natureParts.find(p => ['寒', '热', '温', '凉', '平'].some(q => p.includes(q))) || '平';

    return {
      id: data.id,
      name: data.name,
      pinyin: data.pinyin,
      fourQi,
      fiveFlavors: fiveFlavors.length > 0 ? fiveFlavors : ['甘'],
      functions: data.functions,
    };
  };

  // Get medicines and formulas for this chapter
  const medicines: BattleMedicine[] = chapter?.medicines
    .map(getMedicineByName)
    .filter((m): m is MedicineData => m !== undefined)
    .map(transformMedicine) || [];

  const formulas: BattleFormula[] = chapter?.formulas
    .map(getFormulaByName)
    .filter((f): f is FormulaData => f !== undefined)
    .map(f => ({ id: f.id, name: f.name, pinyin: f.pinyin || f.name })) || [];

  // Initialize battle
  useEffect(() => {
    if (!chapterId || !chapter) {
      setError('章节不存在');
      return;
    }

    if (medicines.length === 0) {
      setError('没有可用的药材数据');
      return;
    }

    // Create battle engine
    const engine = new BattleEngine({
      chapterId,
      medicines,
      formulas,
      onStateChange: (state) => {
        setBattleState(state);
      },
      onBattleEnd: (result) => {
        setBattleResult(result);
        setShowResult(true);

        // Update player stats
        if (result.victory) {
          playerStore.addExperience(result.score);
          playerStore.addReputation(Math.floor(result.score / 100));
        }

        // Update chapter progress
        chapterStore.updateStageProgress(chapterId, 2, {
          score: result.score,
          maxCombo: result.maxCombo,
        });
      },
    });

    setBattleEngine(engine);

    // Start battle after short delay
    setTimeout(() => {
      engine.start();
    }, 500);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [chapterId, chapter, medicines, formulas]);

  // Game loop
  useEffect(() => {
    if (!battleEngine || isPaused) return;

    let lastTime = Date.now();

    const gameLoop = () => {
      const currentTime = Date.now();
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      battleEngine.update(deltaTime);

      if (!showResult) {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
      }
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [battleEngine, isPaused, showResult]);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle input submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!battleEngine || !input.trim() || isPaused) return;

    const result = battleEngine.onInput(input.trim());

    if (result.type === 'exact_match' || result.type === 'pinyin_match') {
      setInput('');
    }
  }, [battleEngine, input, isPaused]);

  // Handle skill usage
  const handleUseSkill = useCallback((skillId: string) => {
    if (!battleEngine || isPaused) return;
    battleEngine.useSkill(skillId);
  }, [battleEngine, isPaused]);

  // Handle battle completion
  const handleComplete = useCallback(() => {
    if (chapterId) {
      // Navigate to stage manager at next stage
      navigate(`/chapter/${chapterId}/stage`);
    } else {
      navigate('/');
    }
  }, [chapterId, navigate]);

  // Handle retry
  const handleRetry = useCallback(() => {
    setShowResult(false);
    setBattleResult(null);
    setInput('');

    // Recreate battle engine
    if (chapterId && medicines.length > 0) {
      const engine = new BattleEngine({
        chapterId,
        medicines,
        formulas,
        onStateChange: (state) => {
          setBattleState(state);
        },
        onBattleEnd: (result) => {
          setBattleResult(result);
          setShowResult(true);

          if (result.victory) {
            playerStore.addExperience(result.score);
            playerStore.addReputation(Math.floor(result.score / 100));
          }

          chapterStore.updateStageProgress(chapterId, 2, {
            score: result.score,
            maxCombo: result.maxCombo,
          });
        },
      });

      setBattleEngine(engine);
      setTimeout(() => engine.start(), 500);
    }
  }, [chapterId, medicines, formulas]);

  // Handle exit
  const handleExit = useCallback(() => {
    if (chapterId) {
      chapterStore.saveCheckpoint(chapterId, 2, battleEngine?.getState());
      navigate(`/chapter/${chapterId}`);
    } else {
      navigate('/');
    }
  }, [chapterId, battleEngine, chapterStore, navigate]);

  // Loading / Error states
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  if (!battleState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="animate-spin w-12 h-12 border-4 border-white/30 border-t-white rounded-full" />
      </div>
    );
  }

  const waveConfig = battleEngine?.getWaveConfig();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black overflow-hidden">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleExit}
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
                <span>退出</span>
              </button>
              <div className="text-white/90">
                <span className="text-sm text-white/50">波次 {battleState.currentWave}/{battleState.totalWaves}</span>
                <span className="mx-2 text-white/30">|</span>
                <span className="font-medium">{waveConfig?.name || '战斗中'}</span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-white/80">
                <Heart size={18} className="text-red-400" />
                <span>{battleState.playerHealth}/{battleState.maxHealth}</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Zap size={18} className="text-yellow-400" />
                <span>{battleState.combo}连击</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Trophy size={18} className="text-amber-400" />
                <span>{battleState.score}</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Clock size={18} />
                <span>{Math.floor(battleState.timeElapsed / 1000)}s</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Battle Area */}
      <div className="pt-20 pb-32 px-4 min-h-screen">
        <div className="max-w-4xl mx-auto">
          {/* Phase Info */}
          <AnimatePresence mode="wait">
            {battleState.phase === 'wave_start' && (
              <motion.div
                key="wave_start"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-20"
              >
                <h2 className="text-4xl font-bold text-white mb-4">第 {battleState.currentWave} 波</h2>
                <p className="text-xl text-white/70">{waveConfig?.description}</p>
              </motion.div>
            )}

            {battleState.phase === 'boss_intro' && (
              <motion.div
                key="boss_intro"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-20"
              >
                <h2 className="text-5xl font-bold text-red-400 mb-4">BOSS 战</h2>
                <p className="text-xl text-white/70">邪灵王出现了！</p>
              </motion.div>
            )}

            {(battleState.phase === 'spawning' || battleState.phase === 'fighting' || battleState.phase === 'boss_fight') && (
              <motion.div
                key="fighting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                {/* Enemies */}
                <div className="relative h-96 bg-black/20 rounded-2xl overflow-hidden">
                  {battleState.enemies.map((enemy) => (
                    <motion.div
                      key={enemy.id}
                      className="absolute"
                      style={{
                        left: `${enemy.position.x}px`,
                        top: `${enemy.position.y}px`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <div className={`relative ${
                        enemy.type === 'boss' ? 'w-24 h-24' :
                        enemy.type === 'elite' ? 'w-16 h-16' : 'w-12 h-12'
                      }`}>
                        {/* Enemy Sprite */}
                        <div className={`w-full h-full rounded-full flex items-center justify-center text-2xl ${
                          enemy.type === 'boss' ? 'bg-red-600' :
                          enemy.type === 'elite' ? 'bg-orange-500' : 'bg-purple-500'
                        }`}>
                          {enemy.type === 'boss' ? '👹' :
                           enemy.type === 'elite' ? '👺' : '👻'}
                        </div>

                        {/* Health Bar */}
                        <div className="absolute -top-2 left-0 right-0 h-1 bg-gray-700 rounded-full">
                          <div
                            className="h-full bg-green-400 rounded-full transition-all"
                            style={{ width: `${(enemy.health / enemy.maxHealth) * 100}%` }}
                          />
                        </div>

                        {/* Target Text */}
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                          <span className="px-2 py-1 bg-black/60 text-white text-sm rounded">
                            {enemy.targetText}
                          </span>
                        </div>

                        {/* Hint */}
                        <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 whitespace-nowrap">
                          <span className="text-xs text-white/50">
                            {enemy.question.hint}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Player Area */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-3xl">
                      🧙‍♂️
                    </div>
                  </div>
                </div>

                {/* Input Area */}
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="输入药材名称或拼音..."
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-white/40"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                  >
                    攻击
                  </button>
                </form>
              </motion.div>
            )}

            {battleState.phase === 'wave_clear' && (
              <motion.div
                key="wave_clear"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-20"
              >
                <h2 className="text-3xl font-bold text-green-400 mb-4">波次完成！</h2>
                <p className="text-white/70">准备进入下一波...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Skills Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/40 backdrop-blur-md py-4">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center gap-4">
            {battleState.skills.map((skill: Skill) => (
              <button
                key={skill.id}
                onClick={() => handleUseSkill(skill.id)}
                disabled={skill.currentCooldown > 0}
                className={`relative p-3 rounded-xl transition-all ${
                  skill.currentCooldown > 0
                    ? 'bg-white/5 text-white/30 cursor-not-allowed'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <span className="text-2xl">{skill.icon}</span>
                {skill.currentCooldown > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
                    {Math.ceil(skill.currentCooldown / 1000)}
                  </span>
                )}
                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/50 whitespace-nowrap">
                  {skill.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result Modal */}
      <AnimatePresence>
        {showResult && battleResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-md w-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 text-center"
            >
              {battleResult.victory ? (
                <>
                  <div className="text-6xl mb-4">🏆</div>
                  <h2 className="text-3xl font-bold text-white mb-2">战斗胜利！</h2>
                  <p className="text-green-400 mb-6">成功守护药灵山谷</p>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-4">💀</div>
                  <h2 className="text-3xl font-bold text-white mb-2">战斗失败</h2>
                  <p className="text-red-400 mb-6">再接再厉，重新挑战</p>
                </>
              )}

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-white/50 text-sm">得分</p>
                  <p className="text-2xl font-bold text-white">{battleResult.score}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-white/50 text-sm">最高连击</p>
                  <p className="text-2xl font-bold text-white">{battleResult.maxCombo}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-white/50 text-sm">波次</p>
                  <p className="text-2xl font-bold text-white">{battleResult.wavesCleared}/{battleState?.totalWaves}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <p className="text-white/50 text-sm">用时</p>
                  <p className="text-2xl font-bold text-white">{Math.floor(battleResult.timeElapsed / 1000)}s</p>
                </div>
              </div>

              <div className="flex gap-3">
                {!battleResult.victory && (
                  <button
                    onClick={handleRetry}
                    className="flex-1 px-6 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={18} />
                    重试
                  </button>
                )}
                <button
                  onClick={handleComplete}
                  className={`flex-1 px-6 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                    battleResult.victory
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {battleResult.victory ? '继续 →' : '返回章节'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BattleStage;

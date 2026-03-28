import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MemoryGame, MemoryGameState, MemoryCard, MemoryGameResult } from '../../systems/minigames/MemoryGame';
import type { MedicineForMemory } from '../../systems/minigames/MemoryGame';

interface MemoryMinigameProps {
  medicines: MedicineForMemory[];
  onComplete: (result: MemoryGameResult) => void;
  onExit?: () => void;
}

const CARD_BACK_EMOJI = '🌿';
const CARD_BACK_COLORS = ['bg-amber-600', 'bg-emerald-600', 'bg-blue-600', 'bg-purple-600', 'bg-rose-600', 'bg-teal-600'];

export const MemoryMinigame: React.FC<MemoryMinigameProps> = ({
  medicines,
  onComplete,
  onExit,
}) => {
  const [game] = useState(() => new MemoryGame(medicines));
  const [state, setState] = useState<MemoryGameState>(game.getState());
  const [showIntro, setShowIntro] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<MemoryGameResult | null>(null);

  useEffect(() => {
    return () => game.destroy();
  }, [game]);

  const handleStart = useCallback(() => {
    setShowIntro(false);
    game.start(
      (res) => {
        setResult(res);
        setShowResult(true);
      },
      (newState) => setState(newState)
    );
  }, [game]);

  const handleCardClick = useCallback((cardId: string) => {
    if (state.flippedCards.length >= 2) return;
    game.flipCard(cardId);
  }, [game, state.flippedCards.length]);

  const getCardStyle = (card: MemoryCard, index: number) => {
    const colorIndex = index % CARD_BACK_COLORS.length;
    const baseColor = CARD_BACK_COLORS[colorIndex];

    if (card.status === 'hidden') {
      return `${baseColor} cursor-pointer hover:scale-105`;
    }
    if (card.status === 'flipped') {
      return 'bg-white text-gray-800';
    }
    if (card.status === 'matched') {
      return 'bg-green-500 text-white opacity-70';
    }
    return baseColor;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div data-testid="memory-game" className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 text-white p-4">
      <AnimatePresence mode="wait">
        {showIntro && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="min-h-screen flex items-center justify-center"
          >
            <div className="max-w-md w-full bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
              <div className="text-6xl mb-4">🧩</div>
              <h1 className="text-3xl font-bold mb-4">药材记忆翻牌</h1>
              <p className="text-white/70 mb-6">
                翻开卡牌，将药材名与其功效配对
              </p>
              <div className="space-y-2 text-sm text-white/60 mb-8">
                <p>• 12对药材，共24张牌</p>
                <p>• 限时60秒</p>
                <p>• 配对越快，连击越高，得分越高</p>
              </div>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleStart}
                  className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full font-bold hover:shadow-lg hover:scale-105 transition-all"
                >
                  开始游戏
                </button>
                {onExit && (
                  <button
                    onClick={onExit}
                    className="px-8 py-3 bg-white/20 rounded-full font-bold hover:bg-white/30 transition-all"
                  >
                    退出
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {!showIntro && !showResult && (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col"
          >
            {/* Header */}
            <header data-testid="game-header" className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div data-testid="game-timer" className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="text-amber-400">⏱️</span>
                  <span className="font-mono font-bold ml-2">
                    {formatTime(state.timeRemaining)}
                  </span>
                </div>
                <div data-testid="game-score" className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="text-yellow-400">🏆</span>
                  <span className="font-mono font-bold ml-2">{state.score}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div data-testid="game-progress" className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <span className="text-green-400">✓</span>
                  <span className="font-bold ml-2">
                    {state.matchedPairs.length}/{medicines.length}
                  </span>
                </div>
                {state.combo > 1 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-amber-500/80 rounded-lg px-4 py-2"
                  >
                    <span className="text-white font-bold">
                      🔥 {state.combo}连击
                    </span>
                  </motion.div>
                )}
              </div>
            </header>

            {/* Game Board */}
            <div data-testid="game-board" className="flex-1 flex items-center justify-center">
              <div data-testid="card-grid" className="grid grid-cols-6 gap-3 max-w-4xl">
                {state.cards.map((card, index) => (
                  <motion.button
                    key={card.id}
                    data-testid={`memory-card-${index}`}
                    data-card-status={card.status}
                    onClick={() => handleCardClick(card.id)}
                    disabled={card.status !== 'hidden' || state.flippedCards.length >= 2}
                    whileHover={card.status === 'hidden' ? { scale: 1.05 } : {}}
                    whileTap={card.status === 'hidden' ? { scale: 0.95 } : {}}
                    className={`
                      aspect-[3/4] rounded-xl font-bold text-lg
                      flex flex-col items-center justify-center
                      transition-all duration-300
                      disabled:cursor-not-allowed
                      ${getCardStyle(card, index)}
                    `}
                    style={{
                      boxShadow: card.status === 'flipped'
                        ? '0 0 20px rgba(255, 255, 255, 0.3)'
                        : card.status === 'matched'
                          ? '0 0 15px rgba(34, 197, 94, 0.5)'
                          : '0 4px 6px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    {card.status === 'hidden' && (
                      <>
                        <span className="text-4xl">{CARD_BACK_EMOJI}</span>
                        <span className="text-xs mt-2 opacity-70">?</span>
                      </>
                    )}
                    {card.status !== 'hidden' && (
                      <>
                        <span className="text-sm text-center px-2 leading-tight">
                          {card.content}
                        </span>
                        {card.status === 'matched' && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute inset-0 flex items-center justify-center text-4xl"
                          >
                            ✓
                          </motion.span>
                        )}
                      </>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <footer className="mt-6 text-center">
              <p className="text-white/50 text-sm">
                点击翻开卡牌，找到配对的药材
              </p>
            </footer>
          </motion.div>
        )}

        {showResult && result && (
          <motion.div
            key="result"
            data-testid="game-result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="min-h-screen flex items-center justify-center"
          >
            <div className="max-w-md w-full bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
              <div className="text-6xl mb-4">
                {result.success ? '🎉' : '💪'}
              </div>
              <h1 className="text-3xl font-bold mb-4">
                {result.success ? '采集完成！' : '时间到！'}
              </h1>
              <div className="space-y-3 mb-8">
                <div className="flex justify-between bg-white/5 rounded-lg px-4 py-2">
                  <span className="text-white/60">最终得分</span>
                  <span className="font-bold text-yellow-400">{result.score}</span>
                </div>
                <div className="flex justify-between bg-white/5 rounded-lg px-4 py-2">
                  <span className="text-white/60">配对数量</span>
                  <span className="font-bold">{result.matchedMedicines.length}/{medicines.length}</span>
                </div>
                <div className="flex justify-between bg-white/5 rounded-lg px-4 py-2">
                  <span className="text-white/60">准确率</span>
                  <span className="font-bold">{result.accuracy}%</span>
                </div>
                {result.timeBonus > 0 && (
                  <div className="flex justify-between bg-white/5 rounded-lg px-4 py-2">
                    <span className="text-white/60">时间奖励</span>
                    <span className="font-bold text-green-400">+{result.timeBonus}</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => onComplete(result)}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full font-bold hover:shadow-lg hover:scale-105 transition-all"
              >
                继续冒险 →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MemoryMinigame;

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DiggingGame,
  DiggingGameState,
  DiggingResult,
  SoilLayer,
  HitQuality,
} from '../../systems/minigames/DiggingGame';

interface DiggingMinigameProps {
  rarity: string;
  onComplete: (result: DiggingResult) => void;
}

const QUALITY_CONFIG: Record<NonNullable<HitQuality>, { label: string; color: string; emoji: string }> = {
  perfect: { label: '完美', color: 'text-green-500', emoji: '✨' },
  good: { label: '良好', color: 'text-yellow-500', emoji: '👍' },
  normal: { label: '一般', color: 'text-gray-500', emoji: '👌' },
};

export const DiggingMinigame: React.FC<DiggingMinigameProps> = ({
  rarity,
  onComplete,
}) => {
  const gameRef = useRef<DiggingGame | null>(null);
  const [gameState, setGameState] = useState<DiggingGameState | null>(null);
  const [lastHitQuality, setLastHitQuality] = useState<HitQuality>(null);
  const [showHitFeedback, setShowHitFeedback] = useState(false);

  useEffect(() => {
    // Initialize game
    const game = new DiggingGame(rarity);
    gameRef.current = game;

    // Start game
    game.start((result) => {
      onComplete(result);
    });

    // Update state loop
    const updateState = () => {
      if (gameRef.current) {
        setGameState(gameRef.current.getState());
      }
      requestAnimationFrame(updateState);
    };
    const animationId = requestAnimationFrame(updateState);

    return () => {
      cancelAnimationFrame(animationId);
      gameRef.current?.destroy();
    };
  }, [rarity, onComplete]);

  const handleHit = useCallback(() => {
    if (!gameRef.current || gameRef.current.isComplete()) return;

    const prevLayer = gameState?.currentLayer || 0;
    gameRef.current.hit();
    const newState = gameRef.current.getState();

    // Determine hit quality based on power at hit time
    const power = gameState?.power || 0;
    let quality: HitQuality;
    if (power >= 40 && power <= 60) {
      quality = 'perfect';
    } else if (power >= 30 && power <= 70) {
      quality = 'good';
    } else {
      quality = 'normal';
    }

    setLastHitQuality(quality);
    setShowHitFeedback(true);
    setTimeout(() => setShowHitFeedback(false), 500);

    // Check if layer was broken
    if (newState.currentLayer > prevLayer) {
      // Layer broken feedback could be added here
    }
  }, [gameState?.power, gameState?.currentLayer]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleHit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleHit]);

  if (!gameState) {
    return (
      <div className="flex items-center justify-center h-96 bg-amber-50 rounded-xl">
        <div className="text-amber-800">加载中...</div>
      </div>
    );
  }

  const progress = gameState.currentLayer / gameState.layers.length;

  return (
    <div className="w-full max-w-md mx-auto bg-amber-50 rounded-xl p-6 shadow-lg">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-amber-900">挖掘药材</h2>
        <p className="text-sm text-amber-700 mt-1">
          在力量条到达绿色区域时点击挖掘
        </p>
      </div>

      {/* Soil Layers */}
      <div className="relative mb-6">
        <div className="flex flex-col-reverse gap-1">
          {gameState.layers.map((layer: SoilLayer, index: number) => {
            const isCurrentLayer = index === gameState.currentLayer;
            const isBroken = index < gameState.currentLayer;
            const crackProgress = Math.min(layer.cracks / layer.maxCracks, 1);

            return (
              <motion.div
                key={layer.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative h-12 rounded-lg overflow-hidden"
                style={{ backgroundColor: layer.color }}
              >
                {/* Cracks overlay */}
                {isCurrentLayer && (
                  <div
                    className="absolute inset-0 bg-black/20 transition-opacity duration-300"
                    style={{ opacity: crackProgress }}
                  >
                    {/* Crack patterns */}
                    <svg className="w-full h-full" viewBox="0 0 100 48" preserveAspectRatio="none">
                      {layer.cracks >= 1 && (
                        <path
                          d="M10 24 L30 10 L50 30 L70 15 L90 25"
                          stroke="rgba(0,0,0,0.5)"
                          strokeWidth="2"
                          fill="none"
                        />
                      )}
                      {layer.cracks >= 2 && (
                        <path
                          d="M15 35 L35 20 L55 40 L75 25 L85 35"
                          stroke="rgba(0,0,0,0.5)"
                          strokeWidth="2"
                          fill="none"
                        />
                      )}
                      {layer.cracks >= 3 && (
                        <path
                          d="M20 10 L40 25 L60 5 L80 20"
                          stroke="rgba(0,0,0,0.5)"
                          strokeWidth="2"
                          fill="none"
                        />
                      )}
                    </svg>
                  </div>
                )}

                {/* Broken state */}
                {isBroken && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white text-2xl">💥</span>
                  </div>
                )}

                {/* Current layer indicator */}
                {isCurrentLayer && (
                  <div className="absolute inset-0 border-2 border-amber-400 rounded-lg animate-pulse" />
                )}

                {/* Layer label */}
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 text-xs">
                  第{index + 1}层
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Progress indicator */}
        <div className="absolute -right-8 top-0 bottom-0 w-4 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-amber-500 rounded-full"
            initial={{ height: '0%' }}
            animate={{ height: `${progress * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Power Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-amber-700 mb-2">
          <span>力量</span>
          <span>{Math.round(gameState.power)}%</span>
        </div>
        <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
          {/* Background gradient */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to right, #ef4444 0%, #eab308 30%, #22c55e 40%, #22c55e 60%, #eab308 70%, #ef4444 100%)',
            }}
          />

          {/* Optimal zone markers */}
          <div
            className="absolute top-0 bottom-0 bg-white/30 border-l-2 border-r-2 border-white"
            style={{ left: '40%', right: '40%' }}
          />

          {/* Power indicator */}
          <motion.div
            className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
            style={{
              left: `${gameState.power}%`,
              boxShadow: '0 0 10px rgba(255,255,255,0.8)',
            }}
            transition={{ duration: 0 }}
          />

          {/* Power head */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md"
            style={{ left: `calc(${gameState.power}% - 8px)` }}
            transition={{ duration: 0 }}
          />
        </div>

        {/* Zone labels */}
        <div className="flex justify-between text-xs mt-1">
          <span className="text-red-500">弱</span>
          <span className="text-green-600 font-medium">最佳区域</span>
          <span className="text-red-500">弱</span>
        </div>
      </div>

      {/* Hit Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleHit}
        disabled={gameState.status === 'complete'}
        className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <span className="text-lg">⛏️ 挖掘</span>
        <span className="block text-xs font-normal mt-1">按空格键快速挖掘</span>
      </motion.button>

      {/* Hit Feedback */}
      <AnimatePresence>
        {showHitFeedback && lastHitQuality && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -20 }}
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-8 py-6 shadow-2xl">
              <div className="text-center">
                <span className="text-5xl mb-2 block">
                  {QUALITY_CONFIG[lastHitQuality].emoji}
                </span>
                <span className={`text-2xl font-bold ${QUALITY_CONFIG[lastHitQuality].color}`}>
                  {QUALITY_CONFIG[lastHitQuality].label}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-amber-100/50 rounded-lg">
        <h3 className="text-sm font-medium text-amber-900 mb-2">玩法说明：</h3>
        <ul className="text-xs text-amber-700 space-y-1">
          <li>• 观察力量条在绿色区域时点击挖掘</li>
          <li>• 完美时机：力量在 40%-60% 之间</li>
          <li>• 良好时机：力量在 30%-70% 之间</li>
          <li>• 每层土壤需要足够多的裂痕才能挖穿</li>
          <li>• 挖穿所有土层即可完成采集</li>
        </ul>
      </div>

      {/* Stats */}
      {gameState.hitCount > 0 && (
        <div className="mt-4 flex justify-between text-sm text-amber-700">
          <span>挖掘次数: {gameState.hitCount}</span>
          <span>当前层: {gameState.currentLayer + 1}/{gameState.layers.length}</span>
        </div>
      )}
    </div>
  );
};

export default DiggingMinigame;

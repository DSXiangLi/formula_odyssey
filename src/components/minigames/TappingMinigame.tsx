import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TappingGame, TappingGameState, TappingResult, RhythmBeat } from '../../systems/minigames/TappingGame';

interface TappingMinigameProps {
  rarity: string;
  onComplete: (result: TappingResult) => void;
  onCancel: () => void;
}

export default function TappingMinigame({ rarity, onComplete, onCancel }: TappingMinigameProps) {
  const gameRef = useRef<TappingGame | null>(null);
  const [gameState, setGameState] = useState<TappingGameState | null>(null);
  const [hitEffect, setHitEffect] = useState<{ type: 'perfect' | 'good' | 'miss'; index: number } | null>(null);

  // Initialize game
  useEffect(() => {
    gameRef.current = new TappingGame(rarity);
    setGameState(gameRef.current.getState());

    // Start game after brief delay
    const timeout = setTimeout(() => {
      if (gameRef.current) {
        gameRef.current.start((result) => {
          onComplete(result);
        });
      }
    }, 1000);

    return () => {
      clearTimeout(timeout);
      if (gameRef.current) {
        gameRef.current.destroy();
      }
    };
  }, [rarity, onComplete]);

  // Listen for game events
  useEffect(() => {
    const handleEffect = (e: CustomEvent) => {
      const { quality, beatIndex } = e.detail;
      setHitEffect({ type: quality, index: beatIndex });
      setTimeout(() => setHitEffect(null), 300);
    };

    window.addEventListener('tapping:effect', handleEffect as EventListener);
    return () => {
      window.removeEventListener('tapping:effect', handleEffect as EventListener);
    };
  }, []);

  // Update game state periodically
  useEffect(() => {
    if (!gameRef.current) return;

    const interval = setInterval(() => {
      setGameState(gameRef.current?.getState() || null);
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, []);

  // Handle tap
  const handleTap = useCallback(() => {
    if (gameRef.current) {
      gameRef.current.tap();
      setGameState(gameRef.current.getState());
    }
  }, []);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleTap();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTap]);

  if (!gameState) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-text-secondary">加载中...</div>
      </div>
    );
  }

  const isPlaying = gameState.status === 'playing';
  const currentBeat = gameState.beats[gameState.currentBeat];
  const progress = gameRef.current?.getCurrentBeatProgress() || 0;
  const timeUntilNext = gameRef.current?.getTimeUntilNextBeat() || 0;

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-text-primary">敲击采集</h3>
          <p className="text-sm text-text-secondary">跟随节奏点击</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{gameState.score}</div>
          <div className="text-xs text-text-muted">得分</div>
        </div>
      </div>

      {/* Beat Track */}
      <div className="relative h-32 bg-background-tertiary/30 rounded-xl mb-6 overflow-hidden">
        {/* Target Zone */}
        <div className="absolute left-1/2 top-0 bottom-0 w-16 -translate-x-1/2">
          <div className="absolute inset-0 bg-primary/20 rounded-lg" />
          <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 bg-primary/50" />
        </div>

        {/* Beat Indicators */}
        <div className="absolute inset-0 flex items-center px-4">
          {gameState.beats.map((beat, index) => (
            <BeatIndicator
              key={index}
              beat={beat}
              index={index}
              currentBeat={gameState.currentBeat}
              progress={progress}
              timeUntilNext={timeUntilNext}
              isHit={hitEffect?.index === index}
              hitType={hitEffect?.type}
            />
          ))}
        </div>

        {/* Tap Zone */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <AnimatePresence>
            {hitEffect && (
              <motion.div
                initial={{ scale: 0.5, opacity: 1 }}
                animate={{ scale: 1.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                className={`absolute inset-0 rounded-full ${
                  hitEffect.type === 'perfect'
                    ? 'bg-success'
                    : hitEffect.type === 'good'
                    ? 'bg-warning'
                    : 'bg-error'
                }`}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-center gap-6 mb-6">
        <div className="text-center">
          <div className="text-xl font-bold text-success">{gameState.perfectHits}</div>
          <div className="text-xs text-text-muted">完美</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-warning">{gameState.goodHits}</div>
          <div className="text-xs text-text-muted">良好</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-error">{gameState.missedHits}</div>
          <div className="text-xs text-text-muted">错过</div>
        </div>
      </div>

      {/* Tap Button */}
      <div className="flex gap-4">
        <button
          onClick={handleTap}
          disabled={!isPlaying}
          className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all duration-150 active:scale-95 ${
            isPlaying
              ? 'bg-primary text-background-primary hover:bg-primary/90 shadow-lg shadow-primary/30'
              : 'bg-background-tertiary text-text-muted cursor-not-allowed'
          }`}
        >
          {isPlaying ? '点击!' : '准备中...'}
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-4 rounded-xl bg-background-tertiary text-text-secondary hover:text-text-primary transition-colors"
        >
          放弃
        </button>
      </div>

      {/* Instructions */}
      <p className="text-center text-xs text-text-muted mt-4">
        按空格键或点击按钮跟随节奏
      </p>
    </div>
  );
}

interface BeatIndicatorProps {
  beat: RhythmBeat;
  index: number;
  currentBeat: number;
  progress: number;
  timeUntilNext: number;
  isHit: boolean;
  hitType?: 'perfect' | 'good' | 'miss' | null;
}

function BeatIndicator({ beat, index, currentBeat, progress, timeUntilNext, isHit, hitType }: BeatIndicatorProps) {
  // Calculate position based on beat timing
  const isCurrent = index === currentBeat;
  const isPast = index < currentBeat;
  const isFuture = index > currentBeat;

  // Position calculation (beats flow from right to left toward target)
  let position = 0;
  if (isCurrent) {
    // Current beat moves toward target
    position = 50 + (1 - progress) * 50; // 100% -> 50%
  } else if (isFuture) {
    // Future beats are on the right
    const distance = index - currentBeat;
    position = 50 + distance * 25 + (1 - progress) * 25;
  } else if (isPast) {
    // Past beats are on the left
    position = 25;
  }

  // Clamp position
  position = Math.max(5, Math.min(95, position));

  return (
    <motion.div
      className="absolute top-1/2 -translate-y-1/2"
      style={{ left: `${position}%` }}
      animate={{
        scale: isCurrent ? [1, 1.2, 1] : 1,
        opacity: isPast ? 0.3 : isFuture ? 0.6 : 1,
      }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
          beat.type === 'strong'
            ? 'bg-warning text-background-primary'
            : 'bg-background-tertiary text-text-primary'
        } ${
          isHit
            ? hitType === 'perfect'
              ? 'ring-4 ring-success'
              : hitType === 'good'
              ? 'ring-4 ring-warning'
              : 'ring-4 ring-error opacity-50'
            : ''
        } ${isCurrent ? 'ring-2 ring-primary' : ''}`}
      >
        {beat.type === 'strong' ? '★' : '●'}
      </div>
    </motion.div>
  );
}

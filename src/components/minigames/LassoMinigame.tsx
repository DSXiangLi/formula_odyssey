import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LassoGame, LassoGameState, LassoResult } from '../../systems/minigames/LassoGame';

interface LassoMinigameProps {
  rarity: string;
  onComplete: (result: LassoResult) => void;
  onCancel: () => void;
}

export default function LassoMinigame({ rarity, onComplete, onCancel }: LassoMinigameProps) {
  const gameRef = useRef<LassoGame | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<LassoGameState | null>(null);
  const [effect, setEffect] = useState<string | null>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);

  // Initialize game
  useEffect(() => {
    gameRef.current = new LassoGame(rarity);
    setGameState(gameRef.current.getState());

    // Start game after brief delay
    const timeout = setTimeout(() => {
      if (gameRef.current) {
        gameRef.current.start((result) => {
          onComplete(result);
        });
      }
    }, 500);

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
      const { effect: effectType } = e.detail;
      setEffect(effectType);
      setTimeout(() => setEffect(null), 500);
    };

    window.addEventListener('lasso:effect', handleEffect as EventListener);
    return () => {
      window.removeEventListener('lasso:effect', handleEffect as EventListener);
    };
  }, []);

  // Update game state
  useEffect(() => {
    if (!gameRef.current) return;

    const interval = setInterval(() => {
      setGameState(gameRef.current?.getState() || null);
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, []);

  // Handle mouse/touch movement
  const handleMove = useCallback((clientX: number) => {
    if (!gameRef.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    gameRef.current.moveLasso(x);
  }, []);

  // Handle throw
  const handleThrow = useCallback(() => {
    if (gameRef.current) {
      gameRef.current.throwLasso();
    }
  }, []);

  // Mouse handlers
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    handleMove(e.clientX);
  }, [handleMove]);

  const handleMouseDown = useCallback(() => {
    setIsMouseDown(true);
    handleThrow();
  }, [handleThrow]);

  const handleMouseUp = useCallback(() => {
    setIsMouseDown(false);
  }, []);

  // Touch handlers
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    handleMove(e.touches[0].clientX);
  }, [handleMove]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    handleMove(e.touches[0].clientX);
    handleThrow();
  }, [handleMove, handleThrow]);

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameRef.current) return;

      const lasso = gameRef.current.getState().lasso;

      switch (e.code) {
        case 'ArrowLeft':
          e.preventDefault();
          gameRef.current.moveLasso(Math.max(0.1, lasso.x - 0.05));
          break;
        case 'ArrowRight':
          e.preventDefault();
          gameRef.current.moveLasso(Math.min(0.9, lasso.x + 0.05));
          break;
        case 'Space':
        case 'Enter':
          e.preventDefault();
          handleThrow();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleThrow]);

  if (!gameState) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-text-secondary">加载中...</div>
      </div>
    );
  }

  const isPlaying = gameState.status === 'playing';
  const progress = gameRef.current?.getProgress() || 0;

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-text-primary">套索采集</h3>
          <p className="text-sm text-text-secondary">瞄准并捕捉目标</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{gameState.score}</div>
          <div className="text-xs text-text-muted">/ {gameState.requiredScore}</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-background-tertiary rounded-full mb-4 overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Game Area */}
      <div
        ref={containerRef}
        className="relative h-80 bg-gradient-to-b from-sky-100/10 to-earth-100/10 rounded-xl overflow-hidden cursor-crosshair select-none"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchStart={handleTouchStart}
        style={{ touchAction: 'none' }}
      >
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-text-muted" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Target */}
        <AnimatePresence>
          <motion.div
            className="absolute"
            style={{
              left: `${gameState.target.x * 100}%`,
              top: `${gameState.target.y * 100}%`,
              width: `${gameState.target.size * 100}%`,
              height: `${gameState.target.size * 100}%`,
            }}
            animate={{
              scale: gameState.target.caught ? [1, 1.2, 1] : 1,
            }}
            transition={{ duration: 0.2 }}
          >
            <div
              className={`w-full h-full rounded-full flex items-center justify-center text-2xl transition-all ${
                gameState.target.caught
                  ? 'bg-warning/50 ring-4 ring-warning'
                  : 'bg-primary/20 ring-2 ring-primary'
              }`}
            >
              {gameState.target.caught ? '🦋' : '🐛'}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Lasso */}
        <div
          className="absolute"
          style={{
            left: `${gameState.lasso.x * 100}%`,
            top: `${gameState.lasso.y * 100}%`,
          }}
        >
          {/* Lasso Line */}
          {!gameState.lasso.thrown && (
            <div
              className="absolute w-0.5 bg-background-tertiary origin-top"
              style={{
                height: `${(LASSO_START_Y - gameState.lasso.y) * 400}px`,
                transform: 'translateY(-100%)',
              }}
            />
          )}

          {/* Lasso Circle */}
          <motion.div
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-primary"
            animate={{
              width: gameState.lasso.thrown
                ? `${gameState.lasso.radius * 200}%`
                : '40px',
              height: gameState.lasso.thrown
                ? `${gameState.lasso.radius * 200}%`
                : '40px',
              opacity: gameState.lassoState === 'aiming' ? 0.7 : 1,
            }}
            transition={{ duration: 0.05 }}
            style={{
              backgroundColor: gameState.lasso.thrown
                ? 'rgba(var(--color-primary-rgb), 0.1)'
                : 'transparent',
            }}
          />

          {/* Lasso Handle */}
          <div className="absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-background-primary rounded-full border-2 border-primary" />
        </div>

        {/* Effects */}
        <AnimatePresence>
          {effect && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div
                className={`text-4xl font-bold ${
                  effect === 'caught'
                    ? 'text-success'
                    : effect === 'catch'
                    ? 'text-warning'
                    : 'text-error'
                }`}
              >
                {effect === 'caught'
                  ? '+50!'
                  : effect === 'catch'
                  ? '抓住!'
                  : '错过!'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* State Indicator */}
        <div className="absolute top-4 left-4">
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              gameState.lassoState === 'aiming'
                ? 'bg-primary/20 text-primary'
                : gameState.lassoState === 'throwing'
                ? 'bg-warning/20 text-warning'
                : 'bg-success/20 text-success'
            }`}
          >
            {gameState.lassoState === 'aiming'
              ? '瞄准中'
              : gameState.lassoState === 'throwing'
              ? '抛出套索'
              : '收网中'}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-4 flex gap-4">
        <button
          onClick={handleThrow}
          disabled={!isPlaying || gameState.lassoState !== 'aiming'}
          className={`flex-1 py-3 rounded-xl font-bold transition-all duration-150 active:scale-95 ${
            isPlaying && gameState.lassoState === 'aiming'
              ? 'bg-primary text-background-primary hover:bg-primary/90 shadow-lg shadow-primary/30'
              : 'bg-background-tertiary text-text-muted cursor-not-allowed'
          }`}
        >
          {gameState.lassoState === 'aiming'
            ? '抛出套索 (空格)'
            : gameState.lassoState === 'throwing'
            ? '收网中...'
            : '收网中...'}
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-3 rounded-xl bg-background-tertiary text-text-secondary hover:text-text-primary transition-colors"
        >
          放弃
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-4 text-center text-xs text-text-muted space-y-1">
        <p>左右移动鼠标或按方向键瞄准，点击或按空格键抛出套索</p>
        <p>捕捉目标获得分数，达到目标分数即可成功采集</p>
      </div>
    </div>
  );
}

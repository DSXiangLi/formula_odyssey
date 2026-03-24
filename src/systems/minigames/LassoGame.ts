/**
 * Lasso Minigame System
 * Catching game for animal/insect-based herb collection
 */

export type LassoGameStatus = 'ready' | 'playing' | 'complete';
export type LassoState = 'aiming' | 'throwing' | 'pulling' | 'caught';

export interface MovingTarget {
  x: number;       // 0-1 normalized position
  y: number;       // 0-1 normalized position
  vx: number;      // x velocity
  vy: number;      // y velocity
  size: number;    // size (normalized)
  caught: boolean;
}

export interface Lasso {
  x: number;       // 0-1 normalized position
  y: number;       // 0-1 normalized position (starts at bottom)
  thrown: boolean;
  expanding: boolean;
  radius: number;  // 0-0.5 (max radius)
}

export interface LassoGameState {
  target: MovingTarget;
  lasso: Lasso;
  score: number;
  requiredScore: number;
  status: LassoGameStatus;
  lassoState: LassoState;
  result?: LassoResult;
}

export interface LassoResult {
  success: boolean;
  score: number;
  caught: number;
}

const TARGET_SIZE = 0.08;      // Target size (normalized)
const LASSO_START_Y = 0.9;     // Lasso starts at 90% down
const LASSO_THROW_SPEED = 0.02; // Lasso expansion speed
const LASSO_MAX_RADIUS = 0.3;  // Maximum lasso radius
const PULL_SPEED = 0.05;       // Speed to pull caught target
const SCORE_PER_CATCH = 50;    // Points per successful catch

export class LassoGame {
  private state: LassoGameState;
  private onComplete: ((result: LassoResult) => void) | null = null;
  private animationId: number = 0;
  private lastTime: number = 0;
  private caughtCount: number = 0;

  constructor(rarity: string) {
    // Determine required score based on rarity
    let requiredScore = 50;
    switch (rarity) {
      case 'common':
        requiredScore = 50;
        break;
      case 'uncommon':
        requiredScore = 60;
        break;
      case 'rare':
        requiredScore = 75;
        break;
      case 'epic':
      case 'legendary':
        requiredScore = 100;
        break;
      default:
        requiredScore = 50;
    }

    // Initialize target at random position
    const target: MovingTarget = {
      x: 0.3 + Math.random() * 0.4,  // Start in middle 40%
      y: 0.2 + Math.random() * 0.4,  // Start in upper-middle
      vx: (Math.random() - 0.5) * 0.008,  // Random direction
      vy: (Math.random() - 0.5) * 0.008,
      size: TARGET_SIZE,
      caught: false,
    };

    // Ensure minimum velocity
    if (Math.abs(target.vx) < 0.003) target.vx = 0.003 * Math.sign(target.vx) || 0.003;
    if (Math.abs(target.vy) < 0.003) target.vy = 0.003 * Math.sign(target.vy) || 0.003;

    const lasso: Lasso = {
      x: 0.5,
      y: LASSO_START_Y,
      thrown: false,
      expanding: false,
      radius: 0,
    };

    this.state = {
      target,
      lasso,
      score: 0,
      requiredScore,
      status: 'ready',
      lassoState: 'aiming',
    };

    this.caughtCount = 0;
  }

  start(onComplete: (result: LassoResult) => void): void {
    this.onComplete = onComplete;
    this.state.status = 'playing';
    this.lastTime = performance.now();

    // Start the game loop
    this.gameLoop();
  }

  private gameLoop(): void {
    const update = (currentTime: number) => {
      if (this.state.status !== 'playing') {
        return;
      }

      const _deltaTime = currentTime - this.lastTime;
      this.lastTime = currentTime;

      this.updateTarget();
      this.updateLasso();
      this.checkCatch();

      this.animationId = requestAnimationFrame(update);
    };

    this.animationId = requestAnimationFrame(update);
  }

  private updateTarget(): void {
    const target = this.state.target;

    if (target.caught) {
      // Move caught target towards lasso center
      const lasso = this.state.lasso;
      target.x += (lasso.x - target.x) * PULL_SPEED;
      target.y += (lasso.y - target.y) * PULL_SPEED;

      // Check if target has been pulled in
      const distance = Math.sqrt(
        Math.pow(target.x - lasso.x, 2) + Math.pow(target.y - lasso.y, 2)
      );

      if (distance < 0.01) {
        // Target successfully pulled in
        this.state.score += SCORE_PER_CATCH;
        this.caughtCount++;

        // Emit score event
        this.emitEffect('caught');

        // Check if required score reached
        if (this.state.score >= this.state.requiredScore) {
          this.complete();
          return;
        }

        // Reset for next catch
        this.resetTarget();
      }
      return;
    }

    // Normal movement
    target.x += target.vx;
    target.y += target.vy;

    // Bounce off walls
    if (target.x <= target.size || target.x >= 1 - target.size) {
      target.vx *= -1;
      target.x = Math.max(target.size, Math.min(1 - target.size, target.x));
    }
    if (target.y <= target.size || target.y >= 1 - target.size) {
      target.vy *= -1;
      target.y = Math.max(target.size, Math.min(1 - target.size, target.y));
    }
  }

  private updateLasso(): void {
    const lasso = this.state.lasso;

    if (this.state.lassoState === 'throwing') {
      // Expand lasso radius
      lasso.radius += LASSO_THROW_SPEED;

      // Check if lasso reached max radius
      if (lasso.radius >= LASSO_MAX_RADIUS) {
        // Lasso missed - reset
        this.state.score = Math.max(0, this.state.score - 10);
        this.resetLasso();
        this.emitEffect('miss');
      }
    }
  }

  private checkCatch(): void {
    if (this.state.lassoState !== 'throwing' || this.state.target.caught) {
      return;
    }

    const target = this.state.target;
    const lasso = this.state.lasso;

    // Calculate distance between lasso center and target
    const distance = Math.sqrt(
      Math.pow(lasso.x - target.x, 2) + Math.pow(lasso.y - target.y, 2)
    );

    // Check if target is within lasso radius
    if (distance < lasso.radius + target.size) {
      target.caught = true;
      this.state.lassoState = 'pulling';
      this.emitEffect('catch');
    }
  }

  moveLasso(x: number): void {
    if (this.state.status !== 'playing' || this.state.lassoState !== 'aiming') {
      return;
    }

    // Constrain lasso position to game area
    const margin = 0.1;
    this.state.lasso.x = Math.max(margin, Math.min(1 - margin, x));
  }

  throwLasso(): void {
    if (this.state.status !== 'playing' || this.state.lassoState !== 'aiming') {
      return;
    }

    this.state.lassoState = 'throwing';
    this.state.lasso.thrown = true;
    this.state.lasso.expanding = true;
  }

  private resetLasso(): void {
    this.state.lassoState = 'aiming';
    this.state.lasso.thrown = false;
    this.state.lasso.expanding = false;
    this.state.lasso.radius = 0;
  }

  private resetTarget(): void {
    this.state.target.caught = false;

    // Reset to new random position
    this.state.target.x = 0.2 + Math.random() * 0.6;
    this.state.target.y = 0.15 + Math.random() * 0.5;

    // Increase difficulty slightly with each catch
    const speedMultiplier = 1 + (this.caughtCount * 0.1);
    this.state.target.vx = (Math.random() - 0.5) * 0.008 * speedMultiplier;
    this.state.target.vy = (Math.random() - 0.5) * 0.008 * speedMultiplier;

    // Ensure minimum velocity
    if (Math.abs(this.state.target.vx) < 0.003) {
      this.state.target.vx = 0.003 * Math.sign(this.state.target.vx) || 0.003;
    }
    if (Math.abs(this.state.target.vy) < 0.003) {
      this.state.target.vy = 0.003 * Math.sign(this.state.target.vy) || 0.003;
    }

    // Reset lasso
    this.resetLasso();
  }

  private emitEffect(effect: string): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lasso:effect', {
        detail: { effect, score: this.state.score }
      }));
    }
  }

  private complete(): void {
    this.state.status = 'complete';

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    this.state.result = {
      success: true,
      score: this.state.score,
      caught: this.caughtCount,
    };

    if (this.onComplete) {
      this.onComplete(this.state.result);
    }
  }

  getState(): LassoGameState {
    return {
      ...this.state,
      target: { ...this.state.target },
      lasso: { ...this.state.lasso },
    };
  }

  isComplete(): boolean {
    return this.state.status === 'complete';
  }

  getResult(): LassoResult | null {
    return this.state.result || null;
  }

  getProgress(): number {
    return Math.min(1, this.state.score / this.state.requiredScore);
  }

  destroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

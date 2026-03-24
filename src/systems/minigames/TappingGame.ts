/**
 * Tapping Minigame System
 * Rhythm-based game for bark-based herb collection
 */

export type TappingGameStatus = 'ready' | 'playing' | 'complete';
export type BeatType = 'normal' | 'strong';

export interface RhythmBeat {
  time: number;      // Time in ms from start
  type: BeatType;    // Normal or strong beat
  hit: boolean;      // Whether the beat has been hit
  hitQuality: HitQuality;
}

export type HitQuality = 'perfect' | 'good' | 'miss' | null;

export interface TappingGameState {
  beats: RhythmBeat[];
  currentBeat: number;
  score: number;
  status: TappingGameStatus;
  startTime: number;
  perfectHits: number;
  goodHits: number;
  missedHits: number;
  result?: TappingResult;
}

export interface TappingResult {
  success: boolean;
  score: number;
  perfectHits: number;
  goodHits: number;
  missed: number;
  quality: 'perfect' | 'good' | 'normal';
}

const PERFECT_WINDOW = 150;  // ms - perfect hit window
const GOOD_WINDOW = 300;     // ms - good hit window
const BEAT_INTERVAL = 1000;  // ms between beats

export class TappingGame {
  private state: TappingGameState;
  private onComplete: ((result: TappingResult) => void) | null = null;
  private animationId: number = 0;

  constructor(rarity: string) {
    // Determine number of beats based on rarity
    let beatCount = 4;
    switch (rarity) {
      case 'common':
        beatCount = 4;
        break;
      case 'uncommon':
        beatCount = 5;
        break;
      case 'rare':
        beatCount = 6;
        break;
      case 'epic':
      case 'legendary':
        beatCount = 8;
        break;
      default:
        beatCount = 4;
    }

    // Generate rhythm pattern
    const beats: RhythmBeat[] = [];
    const startOffset = 2000; // 2 seconds before first beat

    for (let i = 0; i < beatCount; i++) {
      beats.push({
        time: startOffset + i * BEAT_INTERVAL,
        type: i % 3 === 0 ? 'strong' : 'normal', // Strong beat every 3rd
        hit: false,
        hitQuality: null,
      });
    }

    this.state = {
      beats,
      currentBeat: 0,
      score: 0,
      status: 'ready',
      startTime: 0,
      perfectHits: 0,
      goodHits: 0,
      missedHits: 0,
    };
  }

  start(onComplete: (result: TappingResult) => void): void {
    this.onComplete = onComplete;
    this.state.status = 'playing';
    this.state.startTime = performance.now();

    // Start the game loop
    this.gameLoop();
  }

  private gameLoop(): void {
    const checkBeats = () => {
      if (this.state.status !== 'playing') {
        return;
      }

      const elapsed = performance.now() - this.state.startTime;

      // Check for missed beats
      for (let i = this.state.currentBeat; i < this.state.beats.length; i++) {
        const beat = this.state.beats[i];
        if (!beat.hit && elapsed > beat.time + GOOD_WINDOW) {
          // Beat was missed
          beat.hit = true;
          beat.hitQuality = 'miss';
          this.state.missedHits++;
          this.state.score -= 10;
          this.state.currentBeat = i + 1;

          // Emit miss effect
          this.emitEffect('miss');
        }
      }

      // Check if all beats have been processed
      if (this.state.currentBeat >= this.state.beats.length) {
        this.complete();
        return;
      }

      this.animationId = requestAnimationFrame(checkBeats);
    };

    this.animationId = requestAnimationFrame(checkBeats);
  }

  tap(): void {
    if (this.state.status !== 'playing') {
      return;
    }

    const elapsed = performance.now() - this.state.startTime;
    const beat = this.state.beats[this.state.currentBeat];

    if (!beat || beat.hit) {
      return;
    }

    const diff = Math.abs(elapsed - beat.time);

    if (diff < PERFECT_WINDOW) {
      // Perfect hit
      beat.hit = true;
      beat.hitQuality = 'perfect';
      this.state.perfectHits++;
      this.state.score += beat.type === 'strong' ? 30 : 20;
      this.state.currentBeat++;
      this.emitEffect('perfect');
    } else if (diff < GOOD_WINDOW) {
      // Good hit
      beat.hit = true;
      beat.hitQuality = 'good';
      this.state.goodHits++;
      this.state.score += beat.type === 'strong' ? 15 : 10;
      this.state.currentBeat++;
      this.emitEffect('good');
    } else {
      // Too early or too late - count as miss
      beat.hit = true;
      beat.hitQuality = 'miss';
      this.state.missedHits++;
      this.state.score -= 5;
      this.state.currentBeat++;
      this.emitEffect('miss');
    }
  }

  private emitEffect(quality: HitQuality): void {
    // This can be used to trigger visual/audio effects
    // For now, just a placeholder for potential event emission
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tapping:effect', {
        detail: { quality, beatIndex: this.state.currentBeat - 1 }
      }));
    }
  }

  private complete(): void {
    this.state.status = 'complete';

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    // Calculate final result
    const totalBeats = this.state.beats.length;
    const success = this.state.score > 0 && this.state.missedHits < totalBeats / 2;

    let quality: 'perfect' | 'good' | 'normal';
    if (this.state.perfectHits >= totalBeats * 0.7) {
      quality = 'perfect';
    } else if (this.state.goodHits + this.state.perfectHits >= totalBeats * 0.6) {
      quality = 'good';
    } else {
      quality = 'normal';
    }

    this.state.result = {
      success,
      score: Math.max(0, this.state.score),
      perfectHits: this.state.perfectHits,
      goodHits: this.state.goodHits,
      missed: this.state.missedHits,
      quality,
    };

    if (this.onComplete) {
      this.onComplete(this.state.result);
    }
  }

  getState(): TappingGameState {
    return {
      ...this.state,
      beats: this.state.beats.map(b => ({ ...b })),
    };
  }

  isComplete(): boolean {
    return this.state.status === 'complete';
  }

  getResult(): TappingResult | null {
    return this.state.result || null;
  }

  getCurrentBeatProgress(): number {
    if (this.state.status !== 'playing' || this.state.currentBeat >= this.state.beats.length) {
      return 0;
    }
    const elapsed = performance.now() - this.state.startTime;
    const beat = this.state.beats[this.state.currentBeat];
    const timeUntilBeat = beat.time - elapsed;
    return Math.max(0, Math.min(1, 1 - (timeUntilBeat / BEAT_INTERVAL)));
  }

  getTimeUntilNextBeat(): number {
    if (this.state.status !== 'playing' || this.state.currentBeat >= this.state.beats.length) {
      return 0;
    }
    const elapsed = performance.now() - this.state.startTime;
    const beat = this.state.beats[this.state.currentBeat];
    return Math.max(0, beat.time - elapsed);
  }

  destroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

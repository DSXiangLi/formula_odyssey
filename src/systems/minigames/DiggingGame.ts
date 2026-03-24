/**
 * Digging Minigame System
 * Power bar mechanics for root-based herb collection
 */

export type DiggingGameStatus = 'ready' | 'playing' | 'complete';
export type HitQuality = 'perfect' | 'good' | 'normal' | null;

export interface DiggingGameState {
  layers: SoilLayer[];
  currentLayer: number;
  power: number;
  powerDirection: number;
  status: DiggingGameStatus;
  totalEffectiveness: number;
  hitCount: number;
  result?: DiggingResult;
}

export interface SoilLayer {
  id: number;
  hardness: number;
  thickness: number;
  color: string;
  cracks: number;
  maxCracks: number;
}

export interface DiggingResult {
  success: boolean;
  quality: HitQuality;
  collectedAmount: number;
}

const LAYER_COLORS = ['#8D6E63', '#795548', '#6D4C41', '#5D4037', '#4E342E'];
const POWER_SPEED = 2; // Power oscillation speed
const PERFECT_ZONE = { min: 40, max: 60 };
const GOOD_ZONE = { min: 30, max: 70 };

export class DiggingGame {
  private state: DiggingGameState;
  private onComplete: ((result: DiggingResult) => void) | null = null;
  private animationId: number = 0;
  private lastTime: number = 0;

  constructor(rarity: string) {
    // Determine number of layers based on rarity
    let layerCount = 3;
    switch (rarity) {
      case 'common':
        layerCount = 3;
        break;
      case 'rare':
        layerCount = 4;
        break;
      case 'epic':
      case 'legendary':
        layerCount = 5;
        break;
      default:
        layerCount = 3;
    }

    // Create layers with increasing difficulty
    const layers: SoilLayer[] = [];
    for (let i = 0; i < layerCount; i++) {
      layers.push({
        id: i,
        hardness: 1 + i * 0.5, // Increasing hardness
        thickness: 100 / layerCount,
        color: LAYER_COLORS[i % LAYER_COLORS.length],
        cracks: 0,
        maxCracks: 2 + Math.floor(i / 2), // Deeper layers need more cracks
      });
    }

    this.state = {
      layers,
      currentLayer: 0,
      power: 0,
      powerDirection: 1,
      status: 'ready',
      totalEffectiveness: 0,
      hitCount: 0,
    };
  }

  start(onComplete: (result: DiggingResult) => void): void {
    this.onComplete = onComplete;
    this.state.status = 'playing';
    this.lastTime = performance.now();
    this.startPowerOscillation();
  }

  private startPowerOscillation(): void {
    const updatePower = (currentTime: number) => {
      if (this.state.status !== 'playing') {
        return;
      }

      const deltaTime = currentTime - this.lastTime;
      this.lastTime = currentTime;

      // Update power value
      const powerChange = (POWER_SPEED * deltaTime) / 16; // Normalize to ~60fps
      let newPower = this.state.power + this.state.powerDirection * powerChange;

      // Bounce at boundaries
      if (newPower >= 100) {
        newPower = 100;
        this.state.powerDirection = -1;
      } else if (newPower <= 0) {
        newPower = 0;
        this.state.powerDirection = 1;
      }

      this.state.power = newPower;

      this.animationId = requestAnimationFrame(updatePower);
    };

    this.animationId = requestAnimationFrame(updatePower);
  }

  hit(): void {
    if (this.state.status !== 'playing') {
      return;
    }

    const currentPower = this.state.power;
    const currentLayer = this.state.layers[this.state.currentLayer];

    // Determine hit quality based on power
    let quality: HitQuality;
    let effectiveness = 0;

    if (currentPower >= PERFECT_ZONE.min && currentPower <= PERFECT_ZONE.max) {
      quality = 'perfect';
      effectiveness = 3;
      currentLayer.cracks += 2;
    } else if (currentPower >= GOOD_ZONE.min && currentPower <= GOOD_ZONE.max) {
      quality = 'good';
      effectiveness = 2;
      currentLayer.cracks += 1;
    } else {
      quality = 'normal';
      effectiveness = 1;
      currentLayer.cracks += 1;
    }

    this.state.totalEffectiveness += effectiveness;
    this.state.hitCount++;

    // Check if layer is broken
    if (currentLayer.cracks >= currentLayer.maxCracks) {
      this.state.currentLayer++;

      // Check if all layers are completed
      if (this.state.currentLayer >= this.state.layers.length) {
        this.complete(quality);
      }
    }
  }

  private complete(_finalQuality: HitQuality): void {
    this.state.status = 'complete';

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    // Calculate final result
    const averageEffectiveness = this.state.totalEffectiveness / this.state.hitCount;
    let resultQuality: HitQuality;
    let collectedAmount: number;

    if (averageEffectiveness >= 2.5) {
      resultQuality = 'perfect';
      collectedAmount = 3;
    } else if (averageEffectiveness >= 1.8) {
      resultQuality = 'good';
      collectedAmount = 2;
    } else {
      resultQuality = 'normal';
      collectedAmount = 1;
    }

    this.state.result = {
      success: true,
      quality: resultQuality,
      collectedAmount,
    };

    if (this.onComplete) {
      this.onComplete(this.state.result);
    }
  }

  getState(): DiggingGameState {
    return { ...this.state, layers: this.state.layers.map(l => ({ ...l })) };
  }

  isComplete(): boolean {
    return this.state.status === 'complete';
  }

  getResult(): DiggingResult | null {
    return this.state.result || null;
  }

  destroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

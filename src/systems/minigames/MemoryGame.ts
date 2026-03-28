/**
 * Memory Card Minigame System
 * 药灵山谷v3.0 - 药材记忆翻牌游戏
 *
 * 游戏机制：
 * - 6x4 网格，共24张牌
 * - 12对药材（药材名 + 功效/性味）
 * - 玩家翻牌配对，配对成功即可"采集"该药材
 * - 限时60秒，根据配对速度和准确率评分
 */

export type CardType = 'name' | 'property' | 'effect';
export type CardStatus = 'hidden' | 'flipped' | 'matched';
export type GameStatus = 'ready' | 'playing' | 'paused' | 'complete';

export interface MemoryCard {
  id: string;
  medicineId: string;
  medicineName: string;
  content: string; // 卡牌显示内容（药名、性味、或功效）
  type: CardType;
  status: CardStatus;
}

export interface MemoryGameState {
  cards: MemoryCard[];
  status: GameStatus;
  timeRemaining: number;
  score: number;
  flippedCards: string[]; // 当前翻开的卡牌ID
  matchedPairs: string[]; // 已匹配的药材ID
  totalMoves: number;
  correctMoves: number;
  combo: number;
  maxCombo: number;
}

export interface MemoryGameResult {
  success: boolean;
  score: number;
  matchedMedicines: string[];
  accuracy: number; // 准确率
  timeBonus: number; // 时间奖励
}

export interface MedicineForMemory {
  id: string;
  name: string;
  pinyin: string;
  fourQi: string;
  fiveFlavors: string[];
  functions: string[];
}

const GAME_DURATION = 60; // 游戏时长60秒
const GRID_ROWS = 4;
const GRID_COLS = 6;
const TOTAL_PAIRS = 12;

export class MemoryGame {
  private state: MemoryGameState;
  private medicines: MedicineForMemory[];
  private onComplete: ((result: MemoryGameResult) => void) | null = null;
  private timerId: ReturnType<typeof setInterval> | null = null;
  private onStateChange: ((state: MemoryGameState) => void) | null = null;

  constructor(medicines: MedicineForMemory[]) {
    this.medicines = medicines.slice(0, TOTAL_PAIRS);
    this.state = {
      cards: this.generateCards(),
      status: 'ready',
      timeRemaining: GAME_DURATION,
      score: 0,
      flippedCards: [],
      matchedPairs: [],
      totalMoves: 0,
      correctMoves: 0,
      combo: 0,
      maxCombo: 0,
    };
  }

  private generateCards(): MemoryCard[] {
    const cards: MemoryCard[] = [];

    this.medicines.forEach((medicine, index) => {
      // 为每个药材创建两张卡牌：药名 + 功效/性味
      const cardTypes: CardType[] = ['name', Math.random() > 0.5 ? 'property' : 'effect'];

      cardTypes.forEach((type, typeIndex) => {
        let content: string;
        switch (type) {
          case 'name':
            content = medicine.name;
            break;
          case 'property':
            content = `${medicine.fourQi}、${medicine.fiveFlavors.join('')}`;
            break;
          case 'effect':
            content = medicine.functions[0] || '解表';
            break;
        }

        cards.push({
          id: `card_${index}_${typeIndex}`,
          medicineId: medicine.id,
          medicineName: medicine.name,
          content,
          type,
          status: 'hidden',
        });
      });
    });

    // 随机打乱卡牌
    return this.shuffleArray(cards);
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  start(
    onComplete: (result: MemoryGameResult) => void,
    onStateChange?: (state: MemoryGameState) => void
  ): void {
    this.onComplete = onComplete;
    this.onStateChange = onStateChange || null;
    this.state.status = 'playing';
    this.startTimer();
    this.notifyStateChange();
  }

  private startTimer(): void {
    this.timerId = setInterval(() => {
      this.state.timeRemaining--;

      if (this.state.timeRemaining <= 0) {
        this.complete(false);
      }

      this.notifyStateChange();
    }, 1000);
  }

  /**
   * 翻开一张卡牌
   */
  flipCard(cardId: string): boolean {
    if (this.state.status !== 'playing') return false;
    if (this.state.flippedCards.length >= 2) return false;

    const card = this.state.cards.find(c => c.id === cardId);
    if (!card || card.status !== 'hidden') return false;

    // 翻开卡牌
    card.status = 'flipped';
    this.state.flippedCards.push(cardId);
    this.notifyStateChange();

    // 如果翻开了两张卡牌，检查是否匹配
    if (this.state.flippedCards.length === 2) {
      this.state.totalMoves++;
      setTimeout(() => this.checkMatch(), 800);
    }

    return true;
  }

  /**
   * 检查翻开的卡牌是否匹配
   */
  private checkMatch(): void {
    const [cardId1, cardId2] = this.state.flippedCards;
    const card1 = this.state.cards.find(c => c.id === cardId1)!;
    const card2 = this.state.cards.find(c => c.id === cardId2)!;

    // 匹配规则：同一药材的两张卡牌匹配
    const isMatch = card1.medicineId === card2.medicineId;

    if (isMatch) {
      // 匹配成功
      card1.status = 'matched';
      card2.status = 'matched';
      this.state.matchedPairs.push(card1.medicineId);
      this.state.correctMoves++;

      // 连击加成
      this.state.combo++;
      this.state.maxCombo = Math.max(this.state.maxCombo, this.state.combo);

      // 计算分数
      const baseScore = 100;
      const comboMultiplier = 1 + (this.state.combo - 1) * 0.1;
      const timeBonus = Math.floor(this.state.timeRemaining / 10);
      this.state.score += Math.floor(baseScore * comboMultiplier) + timeBonus;

      // 检查是否完成所有配对
      if (this.state.matchedPairs.length === this.medicines.length) {
        this.complete(true);
      }
    } else {
      // 匹配失败，翻回卡牌
      card1.status = 'hidden';
      card2.status = 'hidden';
      this.state.combo = 0;
    }

    this.state.flippedCards = [];
    this.notifyStateChange();
  }

  /**
   * 游戏结束
   */
  private complete(success: boolean): void {
    this.state.status = 'complete';
    this.stopTimer();

    const accuracy = this.state.totalMoves > 0
      ? (this.state.correctMoves / this.state.totalMoves) * 100
      : 0;

    const timeBonus = this.state.timeRemaining * 10;
    const finalScore = this.state.score + (success ? timeBonus : 0);

    const result: MemoryGameResult = {
      success,
      score: finalScore,
      matchedMedicines: this.state.matchedPairs,
      accuracy: Math.round(accuracy),
      timeBonus: success ? timeBonus : 0,
    };

    if (this.onComplete) {
      this.onComplete(result);
    }
  }

  private stopTimer(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private notifyStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange({ ...this.state });
    }
  }

  getState(): MemoryGameState {
    return { ...this.state, cards: this.state.cards.map(c => ({ ...c })) };
  }

  isComplete(): boolean {
    return this.state.status === 'complete';
  }

  pause(): void {
    if (this.state.status === 'playing') {
      this.state.status = 'paused';
      this.stopTimer();
      this.notifyStateChange();
    }
  }

  resume(): void {
    if (this.state.status === 'paused') {
      this.state.status = 'playing';
      this.startTimer();
      this.notifyStateChange();
    }
  }

  destroy(): void {
    this.stopTimer();
  }
}

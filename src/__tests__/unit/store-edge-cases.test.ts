import { describe, it, expect, beforeEach } from 'vitest';
import { usePlayerStore } from '../../stores/playerStore';
import { useChapterStore } from '../../stores/chapterStore';
import { WuxingType } from '../../types';

describe('Store Edge Cases', () => {
  beforeEach(() => {
    usePlayerStore.setState({
      id: `player_${Date.now()}`,
      name: '学徒',
      level: 1,
      experience: 0,
      currency: 100,
      reputation: 0,
      wuxingAffinity: {
        [WuxingType.Wood]: 0,
        [WuxingType.Fire]: 0,
        [WuxingType.Earth]: 0,
        [WuxingType.Metal]: 0,
        [WuxingType.Water]: 0,
      },
      unlockedChapters: ['chapter-1'],
      completedChapters: [],
      collectedMedicines: [],
      masteredFormulas: [],
      skills: [],
      createdAt: Date.now(),
      lastPlayed: Date.now(),
    });
    useChapterStore.setState({
      progress: {},
      currentChapterId: null,
      currentStageIndex: 0,
    });
  });

  it('should not allow negative currency', () => {
    const { addCurrency } = usePlayerStore.getState();
    addCurrency(-150);

    const state = usePlayerStore.getState();
    expect(state.currency).toBe(0);
  });

  it('should handle level up correctly', () => {
    const { addExperience } = usePlayerStore.getState();

    // Add exactly 1000 exp (should level up to 2)
    addExperience(1000);
    const state1 = usePlayerStore.getState();
    expect(state1.level).toBe(2);
    expect(state1.experience).toBe(1000);

    // Add more exp (should stay level 2 until 2000)
    addExperience(500);
    const state2 = usePlayerStore.getState();
    expect(state2.level).toBe(2);
    expect(state2.experience).toBe(1500);

    // Add enough to reach level 3 (now at 2000 exp total)
    addExperience(500);
    const state3 = usePlayerStore.getState();
    expect(state3.level).toBe(3); // 2000/1000 + 1 = 3
  });

  it('should not collect same medicine twice', () => {
    const { collectMedicine } = usePlayerStore.getState();

    collectMedicine('麻黄');
    const count1 = usePlayerStore.getState().collectedMedicines.length;

    collectMedicine('麻黄');
    const count2 = usePlayerStore.getState().collectedMedicines.length;

    expect(count1).toBe(count2);
    expect(usePlayerStore.getState().collectedMedicines.filter(m => m === '麻黄').length).toBe(1);
  });

  it('should not unlock same chapter twice', () => {
    const { unlockChapter } = usePlayerStore.getState();

    unlockChapter('chapter-2');
    const count1 = usePlayerStore.getState().unlockedChapters.length;

    unlockChapter('chapter-2');
    const count2 = usePlayerStore.getState().unlockedChapters.length;

    expect(count1).toBe(count2);
  });

  it('should handle empty chapter operations gracefully', () => {
    const { setCurrentChapter, completeStage, getChapterProgress } = useChapterStore.getState();

    // Operations on non-existent chapter should not crash
    expect(() => {
      completeStage('non-existent', 'stage-1');
    }).not.toThrow();

    const progress = getChapterProgress('non-existent');
    expect(progress).toBeUndefined();
  });

  it('should handle negative experience gracefully', () => {
    const { addExperience } = usePlayerStore.getState();

    // Adding negative experience
    addExperience(-500);
    const state = usePlayerStore.getState();
    expect(state.experience).toBe(-500);
    expect(state.level).toBe(1); // Level shouldn't decrease
  });

  it('should handle large currency values', () => {
    const { addCurrency } = usePlayerStore.getState();

    addCurrency(999999);
    const state = usePlayerStore.getState();
    expect(state.currency).toBe(1000099); // Initial 100 + 999999
  });

  it('should handle chapter with no stages gracefully', () => {
    const { setCurrentChapter, setCurrentStage } = useChapterStore.getState();

    setCurrentChapter('chapter-1');
    setCurrentStage(0);

    const state = useChapterStore.getState();
    expect(state.currentStageIndex).toBe(0);
  });

  it('should prevent duplicate stage completion', () => {
    const { setCurrentChapter, completeStage, getChapterProgress } = useChapterStore.getState();

    setCurrentChapter('chapter-1');
    completeStage('chapter-1', 'c1-intro');
    const count1 = getChapterProgress('chapter-1')?.completedStages.length || 0;

    completeStage('chapter-1', 'c1-intro');
    const count2 = getChapterProgress('chapter-1')?.completedStages.length || 0;

    expect(count1).toBe(count2);
  });
});

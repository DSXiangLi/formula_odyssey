import { describe, it, expect, beforeEach } from 'vitest';
import { usePlayerStore } from '../../stores/playerStore';
import { useChapterStore } from '../../stores/chapterStore';
import { WuxingType } from '../../types';

describe('Store Integration', () => {
  beforeEach(() => {
    // Reset both stores
    usePlayerStore.setState({
      id: `player_${Date.now()}`,
      name: '学徒',
      level: 1,
      experience: 0,
      currency: 100,
      reputation: 0,
      wuxingAffinity: { [WuxingType.Wood]: 0, [WuxingType.Fire]: 0, [WuxingType.Earth]: 0, [WuxingType.Metal]: 0, [WuxingType.Water]: 0 },
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
    localStorage.clear();
  });

  it('should sync medicine collection across stores', () => {
    const { collectMedicine } = usePlayerStore.getState();
    const { setCurrentChapter, collectMedicineInChapter } = useChapterStore.getState();

    setCurrentChapter('chapter-1');
    collectMedicineInChapter('chapter-1', '麻黄');
    collectMedicine('麻黄');

    const playerState = usePlayerStore.getState();
    const chapterProgress = useChapterStore.getState().getChapterProgress('chapter-1');

    expect(playerState.collectedMedicines).toContain('麻黄');
    expect(chapterProgress?.collectedMedicines).toContain('麻黄');
  });

  it('should unlock next chapter when current is completed', () => {
    const { completeChapter, unlockChapter } = usePlayerStore.getState();
    const { setCurrentChapter, completeStage } = useChapterStore.getState();

    setCurrentChapter('chapter-1');
    completeStage('chapter-1', 'c1-mastery');
    completeChapter('chapter-1');
    unlockChapter('chapter-2');

    const { completedChapters, unlockedChapters } = usePlayerStore.getState();

    expect(completedChapters).toContain('chapter-1');
    expect(unlockedChapters).toContain('chapter-2');
  });

  it('should maintain state consistency across operations', () => {
    const { addExperience, addCurrency } = usePlayerStore.getState();
    const { setCurrentChapter, setCurrentStage, completeStage } = useChapterStore.getState();

    setCurrentChapter('chapter-1');
    addExperience(500);
    addCurrency(-20);
    setCurrentStage(1);
    completeStage('chapter-1', 'c1-intro');
    addExperience(600); // Should level up

    const playerState = usePlayerStore.getState();
    const chapterState = useChapterStore.getState();

    expect(playerState.experience).toBe(1100);
    expect(playerState.level).toBe(2);
    expect(playerState.currency).toBe(80);
    expect(chapterState.currentChapterId).toBe('chapter-1');
    expect(chapterState.currentStageIndex).toBe(1);
    expect(chapterState.progress['chapter-1']?.completedStages).toContain('c1-intro');
  });

  it('should track chapter completion across both stores', () => {
    const { unlockChapter, completeChapter } = usePlayerStore.getState();
    const { setCurrentChapter, completeStage, getChapterProgress } = useChapterStore.getState();

    // Complete chapter 1
    setCurrentChapter('chapter-1');
    completeStage('chapter-1', 'c1-intro');
    completeStage('chapter-1', 'c1-gathering');
    completeChapter('chapter-1');

    // Unlock and start chapter 2
    unlockChapter('chapter-2');
    setCurrentChapter('chapter-2');

    const ch1Progress = getChapterProgress('chapter-1');
    const { unlockedChapters, completedChapters } = usePlayerStore.getState();

    expect(ch1Progress?.completedStages).toContain('c1-intro');
    expect(unlockedChapters).toContain('chapter-2');
    expect(completedChapters).toContain('chapter-1');
  });

  it('should update currency and wuxing affinity together', () => {
    const { addCurrency, increaseWuxingAffinity } = usePlayerStore.getState();

    addCurrency(50);
    increaseWuxingAffinity(WuxingType.Wood, 10);
    increaseWuxingAffinity(WuxingType.Fire, 5);

    const { currency, wuxingAffinity } = usePlayerStore.getState();

    expect(currency).toBe(150);
    expect(wuxingAffinity[WuxingType.Wood]).toBe(10);
    expect(wuxingAffinity[WuxingType.Fire]).toBe(5);
  });
});

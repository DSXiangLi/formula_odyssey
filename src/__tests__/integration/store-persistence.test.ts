import { describe, it, expect, beforeEach } from 'vitest';
import { usePlayerStore } from '../../stores/playerStore';
import { useChapterStore } from '../../stores/chapterStore';
import { WuxingType } from '../../types';

describe('Store Persistence', () => {
  beforeEach(() => {
    // Reset stores to initial state
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

  describe('PlayerStore State Management', () => {
    it('should update player name', () => {
      const { setName } = usePlayerStore.getState();

      setName('TestPlayer');

      const state = usePlayerStore.getState();
      expect(state.name).toBe('TestPlayer');
    });

    it('should update currency correctly', () => {
      const { addCurrency } = usePlayerStore.getState();

      addCurrency(50);

      const state = usePlayerStore.getState();
      expect(state.currency).toBe(150);
    });

    it('should update level and experience', () => {
      const { addExperience } = usePlayerStore.getState();

      addExperience(1500);

      const state = usePlayerStore.getState();
      expect(state.experience).toBe(1500);
      expect(state.level).toBe(2);
    });

    it('should unlock chapters', () => {
      const { unlockChapter } = usePlayerStore.getState();

      unlockChapter('chapter-2');

      const { unlockedChapters } = usePlayerStore.getState();
      expect(unlockedChapters).toContain('chapter-2');
    });

    it('should complete chapters', () => {
      const { completeChapter } = usePlayerStore.getState();

      completeChapter('chapter-1');

      const { completedChapters } = usePlayerStore.getState();
      expect(completedChapters).toContain('chapter-1');
    });

    it('should collect medicines', () => {
      const { collectMedicine } = usePlayerStore.getState();

      collectMedicine('麻黄');
      collectMedicine('桂枝');

      const { collectedMedicines } = usePlayerStore.getState();
      expect(collectedMedicines).toContain('麻黄');
      expect(collectedMedicines).toContain('桂枝');
    });

    it('should update wuxing affinity', () => {
      const { increaseWuxingAffinity } = usePlayerStore.getState();

      increaseWuxingAffinity(WuxingType.Wood, 10);
      increaseWuxingAffinity(WuxingType.Fire, 5);

      const { wuxingAffinity } = usePlayerStore.getState();
      expect(wuxingAffinity[WuxingType.Wood]).toBe(10);
      expect(wuxingAffinity[WuxingType.Fire]).toBe(5);
    });

    it('should not allow negative currency', () => {
      const { addCurrency } = usePlayerStore.getState();

      addCurrency(-150);

      const state = usePlayerStore.getState();
      expect(state.currency).toBe(0);
    });
  });

  describe('ChapterStore State Management', () => {
    it('should set current chapter', () => {
      const { setCurrentChapter } = useChapterStore.getState();

      setCurrentChapter('chapter-1');

      const { currentChapterId } = useChapterStore.getState();
      expect(currentChapterId).toBe('chapter-1');
    });

    it('should track chapter progress', () => {
      const { setCurrentChapter, completeStage, getChapterProgress } = useChapterStore.getState();

      setCurrentChapter('chapter-1');
      completeStage('chapter-1', 'c1-intro');

      const progress = getChapterProgress('chapter-1');
      expect(progress?.completedStages).toContain('c1-intro');
    });

    it('should set current stage', () => {
      const { setCurrentChapter, setCurrentStage } = useChapterStore.getState();

      setCurrentChapter('chapter-2');
      setCurrentStage(3);

      const { currentStageIndex } = useChapterStore.getState();
      expect(currentStageIndex).toBe(3);
    });

    it('should update battle and clinical scores', () => {
      const { setCurrentChapter, updateChapterProgress, getChapterProgress } = useChapterStore.getState();

      setCurrentChapter('chapter-1');
      updateChapterProgress('chapter-1', { battleScore: 100, clinicalScore: 80 });

      const progress = getChapterProgress('chapter-1');
      expect(progress?.battleScore).toBe(100);
      expect(progress?.clinicalScore).toBe(80);
    });

    it('should collect medicines in chapter', () => {
      const { setCurrentChapter, collectMedicineInChapter, getChapterProgress } = useChapterStore.getState();

      setCurrentChapter('chapter-1');
      collectMedicineInChapter('chapter-1', '麻黄');

      const progress = getChapterProgress('chapter-1');
      expect(progress?.collectedMedicines).toContain('麻黄');
    });

    it('should track multiple chapters independently', () => {
      const { setCurrentChapter, completeStage, getChapterProgress } = useChapterStore.getState();

      setCurrentChapter('chapter-1');
      completeStage('chapter-1', 'c1-intro');

      setCurrentChapter('chapter-2');
      completeStage('chapter-2', 'c2-intro');

      expect(getChapterProgress('chapter-1')?.completedStages).toContain('c1-intro');
      expect(getChapterProgress('chapter-2')?.completedStages).toContain('c2-intro');
    });

    it('should set lastAccessed timestamp', () => {
      const { setCurrentChapter, getChapterProgress } = useChapterStore.getState();
      const beforeTime = Date.now();

      setCurrentChapter('chapter-1');

      const progress = getChapterProgress('chapter-1');
      expect(progress?.lastAccessed).toBeGreaterThanOrEqual(beforeTime);
    });
  });
});

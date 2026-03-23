import { describe, it, expect, beforeEach, vi } from 'vitest';
import { usePlayerStore } from '../../stores/playerStore';
import { useChapterStore } from '../../stores/chapterStore';
import { WuxingType } from '../../types';

describe('Store Persistence', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
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

  describe('PlayerStore Persistence', () => {
    it('should persist player data changes', () => {
      const { setName, addCurrency } = usePlayerStore.getState();

      setName('TestPlayer');
      addCurrency(50);

      // Check that data was persisted to localStorage
      const stored = JSON.parse(localStorage.getItem('yaoling-player-storage') || '{}');
      expect(stored.state.name).toBe('TestPlayer');
      expect(stored.state.currency).toBe(150);
    });

    it('should persist player level and experience', () => {
      const { addExperience } = usePlayerStore.getState();

      // Add enough experience to level up (1000 exp = level 2)
      addExperience(2500);

      const stored = JSON.parse(localStorage.getItem('yaoling-player-storage') || '{}');
      expect(stored.state.experience).toBe(2500);
      expect(stored.state.level).toBe(3); // 2500 / 1000 + 1 = 3
    });

    it('should persist chapter unlocks', () => {
      const { unlockChapter, completeChapter } = usePlayerStore.getState();

      unlockChapter('chapter-2');
      unlockChapter('chapter-3');
      completeChapter('chapter-1');

      const stored = JSON.parse(localStorage.getItem('yaoling-player-storage') || '{}');
      expect(stored.state.unlockedChapters).toContain('chapter-1');
      expect(stored.state.unlockedChapters).toContain('chapter-2');
      expect(stored.state.unlockedChapters).toContain('chapter-3');
      expect(stored.state.completedChapters).toContain('chapter-1');
    });

    it('should persist medicine collection', () => {
      const { collectMedicine } = usePlayerStore.getState();

      collectMedicine('mahuang');
      collectMedicine('guizhi');

      const stored = JSON.parse(localStorage.getItem('yaoling-player-storage') || '{}');
      expect(stored.state.collectedMedicines).toContain('mahuang');
      expect(stored.state.collectedMedicines).toContain('guizhi');
    });

    it('should persist wuxing affinity', () => {
      const { increaseWuxingAffinity } = usePlayerStore.getState();

      increaseWuxingAffinity(WuxingType.Wood, 10);
      increaseWuxingAffinity(WuxingType.Fire, 5);

      const stored = JSON.parse(localStorage.getItem('yaoling-player-storage') || '{}');
      expect(stored.state.wuxingAffinity[WuxingType.Wood]).toBe(10);
      expect(stored.state.wuxingAffinity[WuxingType.Fire]).toBe(5);
    });

    it('should handle currency edge cases', () => {
      const { addCurrency } = usePlayerStore.getState();

      // Test that currency doesn't go below 0
      addCurrency(-200);

      const stored = JSON.parse(localStorage.getItem('yaoling-player-storage') || '{}');
      expect(stored.state.currency).toBe(0);
    });
  });

  describe('ChapterStore Persistence', () => {
    it('should persist chapter progress', () => {
      const { setCurrentChapter, completeStage } = useChapterStore.getState();

      setCurrentChapter('chapter-1');
      completeStage('chapter-1', 'c1-intro');

      const stored = JSON.parse(localStorage.getItem('yaoling-chapter-storage') || '{}');
      expect(stored.state.progress['chapter-1']).toBeDefined();
      expect(stored.state.progress['chapter-1'].completedStages).toContain('c1-intro');
    });

    it('should persist current chapter and stage', () => {
      const { setCurrentChapter, setCurrentStage } = useChapterStore.getState();

      setCurrentChapter('chapter-2');
      setCurrentStage(3);

      const stored = JSON.parse(localStorage.getItem('yaoling-chapter-storage') || '{}');
      expect(stored.state.currentChapterId).toBe('chapter-2');
      expect(stored.state.currentStageIndex).toBe(3);
    });

    it('should persist battle and clinical scores', () => {
      const { setCurrentChapter, updateChapterProgress } = useChapterStore.getState();

      setCurrentChapter('chapter-1');
      updateChapterProgress('chapter-1', { battleScore: 150, clinicalScore: 90 });

      const stored = JSON.parse(localStorage.getItem('yaoling-chapter-storage') || '{}');
      expect(stored.state.progress['chapter-1'].battleScore).toBe(150);
      expect(stored.state.progress['chapter-1'].clinicalScore).toBe(90);
    });

    it('should persist collected medicines in chapter', () => {
      const { setCurrentChapter, collectMedicineInChapter } = useChapterStore.getState();

      setCurrentChapter('chapter-1');
      collectMedicineInChapter('chapter-1', 'mahuang');
      collectMedicineInChapter('chapter-1', 'guizhi');

      const stored = JSON.parse(localStorage.getItem('yaoling-chapter-storage') || '{}');
      expect(stored.state.progress['chapter-1'].collectedMedicines).toContain('mahuang');
      expect(stored.state.progress['chapter-1'].collectedMedicines).toContain('guizhi');
    });

    it('should track multiple chapters independently', () => {
      const { setCurrentChapter, completeStage } = useChapterStore.getState();

      // Setup chapter 1
      setCurrentChapter('chapter-1');
      completeStage('chapter-1', 'c1-intro');

      // Switch to chapter 2
      setCurrentChapter('chapter-2');
      completeStage('chapter-2', 'c2-intro');

      const stored = JSON.parse(localStorage.getItem('yaoling-chapter-storage') || '{}');
      expect(stored.state.progress['chapter-1'].completedStages).toContain('c1-intro');
      expect(stored.state.progress['chapter-2'].completedStages).toContain('c2-intro');
      expect(stored.state.currentChapterId).toBe('chapter-2');
    });

    it('should persist lastAccessed timestamp', () => {
      const { setCurrentChapter } = useChapterStore.getState();

      const beforeTime = Date.now();
      setCurrentChapter('chapter-1');
      const afterTime = Date.now();

      const stored = JSON.parse(localStorage.getItem('yaoling-chapter-storage') || '{}');
      const lastAccessed = stored.state.progress['chapter-1'].lastAccessed;
      expect(lastAccessed).toBeGreaterThanOrEqual(beforeTime);
      expect(lastAccessed).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('Persistence Storage Format', () => {
    it('should store player data with correct storage key', () => {
      const { setName } = usePlayerStore.getState();
      setName('KeyTest');

      const keys = Object.keys(localStorage);
      expect(keys).toContain('yaoling-player-storage');
    });

    it('should store chapter data with correct storage key', () => {
      const { setCurrentChapter } = useChapterStore.getState();
      setCurrentChapter('chapter-1');

      const keys = Object.keys(localStorage);
      expect(keys).toContain('yaoling-chapter-storage');
    });

    it('should maintain data integrity in storage', () => {
      const { setName, addCurrency, unlockChapter } = usePlayerStore.getState();

      setName('IntegrityTest');
      addCurrency(500);
      unlockChapter('chapter-5');

      const stored = localStorage.getItem('yaoling-player-storage');
      expect(stored).toBeTruthy();

      // Verify it's valid JSON
      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveProperty('state');
      expect(parsed).toHaveProperty('version');
      expect(parsed.state.name).toBe('IntegrityTest');
      expect(parsed.state.currency).toBe(600);
      expect(parsed.state.unlockedChapters).toContain('chapter-5');
    });
  });
});

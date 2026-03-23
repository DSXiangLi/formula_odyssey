import { describe, it, expect } from 'vitest';
import { usePlayerStore } from '../../stores/playerStore';
import { useChapterStore } from '../../stores/chapterStore';
import { chapters } from '../../data/chapters';

describe('Chapter Flow Integration', () => {
  it('should start chapter-1 as unlocked', () => {
    const state = usePlayerStore.getState();
    expect(state.unlockedChapters).toContain('chapter-1');
  });

  it('should have 20 chapters', () => {
    expect(chapters.length).toBe(20);
  });

  it('should initialize chapter progress on enter', () => {
    const { setCurrentChapter } = useChapterStore.getState();
    setCurrentChapter('chapter-1');

    const { progress } = useChapterStore.getState();
    expect(progress['chapter-1']).toBeDefined();
    expect(progress['chapter-1'].chapterId).toBe('chapter-1');
  });

  it('should complete stage and track progress', () => {
    const { setCurrentChapter, completeStage } = useChapterStore.getState();
    setCurrentChapter('chapter-1');
    completeStage('chapter-1', 'c1-intro');

    const { getChapterProgress } = useChapterStore.getState();
    const progress = getChapterProgress('chapter-1');
    expect(progress?.completedStages).toContain('c1-intro');
  });

  it('should complete chapter and track', () => {
    const { completeChapter } = usePlayerStore.getState();
    completeChapter('chapter-1');

    const newState = usePlayerStore.getState();
    expect(newState.completedChapters).toContain('chapter-1');
  });

  it('should track chapter progress for multiple chapters', () => {
    const { setCurrentChapter, completeStage, getChapterProgress } = useChapterStore.getState();
    const { unlockChapter } = usePlayerStore.getState();

    // Initialize chapter 1 first
    setCurrentChapter('chapter-1');

    // Unlock and work on chapter 2
    unlockChapter('chapter-2');
    setCurrentChapter('chapter-2');
    completeStage('chapter-2', 'c2-intro');

    // Progress should be tracked separately
    const ch2Progress = getChapterProgress('chapter-2');
    const ch1Progress = getChapterProgress('chapter-1');

    expect(ch2Progress?.completedStages).toContain('c2-intro');
    // ch1 progress exists but doesn't have c2-intro
    expect(ch1Progress?.completedStages || []).not.toContain('c2-intro');
  });

  it('should unlock multiple chapters', () => {
    const { unlockChapter } = usePlayerStore.getState();

    unlockChapter('chapter-2');
    unlockChapter('chapter-3');

    const state = usePlayerStore.getState();
    expect(state.unlockedChapters).toContain('chapter-1');
    expect(state.unlockedChapters).toContain('chapter-2');
    expect(state.unlockedChapters).toContain('chapter-3');
  });

  it('should not unlock same chapter twice', () => {
    const { unlockChapter } = usePlayerStore.getState();

    // First get current state after unlocking chapter-2
    unlockChapter('chapter-2');
    const stateAfterFirst = usePlayerStore.getState();
    const initialCount = stateAfterFirst.unlockedChapters.length;

    // Try to unlock chapter-2 again
    unlockChapter('chapter-2');
    const stateAfterSecond = usePlayerStore.getState();

    expect(stateAfterSecond.unlockedChapters.length).toBe(initialCount);
  });

  it('should collect medicine in chapter', () => {
    const { setCurrentChapter, collectMedicineInChapter, getChapterProgress } = useChapterStore.getState();

    setCurrentChapter('chapter-1');
    collectMedicineInChapter('chapter-1', 'mahuang');

    const progress = getChapterProgress('chapter-1');
    expect(progress?.collectedMedicines).toContain('mahuang');
  });

  it('should update chapter progress', () => {
    const { setCurrentChapter, updateChapterProgress, getChapterProgress } = useChapterStore.getState();

    setCurrentChapter('chapter-1');
    updateChapterProgress('chapter-1', { battleScore: 100, clinicalScore: 80 });

    const progress = getChapterProgress('chapter-1');
    expect(progress?.battleScore).toBe(100);
    expect(progress?.clinicalScore).toBe(80);
  });

  it('should set current stage', () => {
    const { setCurrentChapter, setCurrentStage } = useChapterStore.getState();

    setCurrentChapter('chapter-1');
    setCurrentStage(2);

    const state = useChapterStore.getState();
    expect(state.currentStageIndex).toBe(2);
    expect(state.progress['chapter-1']?.currentStage).toBe(2);
  });
});

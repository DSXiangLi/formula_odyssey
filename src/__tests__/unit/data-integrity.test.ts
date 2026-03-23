import { describe, it, expect } from 'vitest';
import { chapters } from '../../data/chapters';
import { validateChapter } from '../../utils/validators';
import { WuxingType } from '../../types';

describe('Data Integrity', () => {
  it('should have exactly 20 chapters', () => {
    expect(chapters.length).toBe(20);
  });

  it('should have unique chapter numbers 1-20', () => {
    const numbers = chapters.map(c => c.chapterNumber);
    const uniqueNumbers = new Set(numbers);
    expect(uniqueNumbers.size).toBe(20);

    for (let i = 1; i <= 20; i++) {
      expect(numbers).toContain(i);
    }
  });

  it('should have unique chapter IDs', () => {
    const ids = chapters.map(c => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(20);
  });

  it('should have valid wuxing types', () => {
    const validWuxing = Object.values(WuxingType);
    chapters.forEach(chapter => {
      expect(validWuxing).toContain(chapter.wuxing);
    });
  });

  it('should have exactly 6 stages per chapter', () => {
    chapters.forEach(chapter => {
      expect(chapter.stages.length).toBe(6);
    });
  });

  it('should pass Zod schema validation', () => {
    chapters.forEach(chapter => {
      const result = validateChapter(chapter);
      if (!result.success) {
        console.error('Validation failed for chapter:', chapter.id, result.error);
      }
      expect(result.success).toBe(true);
    });
  });

  it('should have valid stage types', () => {
    const validStageTypes = ['intro', 'gathering', 'battle', 'formula', 'clinical', 'mastery'];
    chapters.forEach(chapter => {
      chapter.stages.forEach(stage => {
        expect(validStageTypes).toContain(stage.type);
      });
    });
  });

  it('should have chapter 1 unlocked and others locked', () => {
    chapters.forEach(chapter => {
      if (chapter.chapterNumber === 1) {
        expect(chapter.isUnlocked).toBe(true);
      } else {
        expect(chapter.isUnlocked).toBe(false);
      }
    });
  });

  it('should have unlockRequirements for chapters > 1', () => {
    chapters.slice(1).forEach(chapter => {
      expect(chapter.unlockRequirements.length).toBeGreaterThan(0);
    });
  });

  it('should have medicines and formulas arrays', () => {
    chapters.forEach(chapter => {
      expect(Array.isArray(chapter.medicines)).toBe(true);
      expect(Array.isArray(chapter.formulas)).toBe(true);
      expect(chapter.medicines.length).toBeGreaterThan(0);
    });
  });

  it('should have all required chapter fields', () => {
    chapters.forEach(chapter => {
      expect(chapter.id).toBeDefined();
      expect(chapter.chapterNumber).toBeGreaterThan(0);
      expect(chapter.chapterNumber).toBeLessThanOrEqual(20);
      expect(chapter.title).toBeDefined();
      expect(chapter.subtitle).toBeDefined();
      expect(chapter.description).toBeDefined();
      expect(chapter.wuxing).toBeDefined();
    });
  });

  it('should have masteryScore 0 for all chapters', () => {
    chapters.forEach(chapter => {
      expect(chapter.masteryScore).toBe(0);
    });
  });

  it('should have isCompleted false for all chapters', () => {
    chapters.forEach(chapter => {
      expect(chapter.isCompleted).toBe(false);
    });
  });

  it('should have valid stage IDs', () => {
    chapters.forEach(chapter => {
      chapter.stages.forEach((stage, index) => {
        expect(stage.id).toBeDefined();
        expect(stage.title).toBeDefined();
        expect(stage.description).toBeDefined();
        expect(stage.requiredMedicines).toBeDefined();
      });
    });
  });
});

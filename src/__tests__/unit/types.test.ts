import { describe, it, expect } from 'vitest';
import { WuxingType, FourQi, CollectionType, BattlePhase, StageType } from '../../types';
import { validateChapter } from '../../utils/validators';
import { chapters } from '../../data/chapters';

describe('Type Enums', () => {
  it('should have correct WuxingType values', () => {
    expect(WuxingType.Wood).toBe('wood');
    expect(WuxingType.Fire).toBe('fire');
    expect(WuxingType.Earth).toBe('earth');
    expect(WuxingType.Metal).toBe('metal');
    expect(WuxingType.Water).toBe('water');
  });

  it('should have correct FourQi values', () => {
    expect(FourQi.Cold).toBe('cold');
    expect(FourQi.Cool).toBe('cool');
    expect(FourQi.Warm).toBe('warm');
    expect(FourQi.Hot).toBe('hot');
  });

  it('should have correct CollectionType values', () => {
    expect(CollectionType.Digging).toBe('digging');
    expect(CollectionType.Tapping).toBe('tapping');
    expect(CollectionType.Lasso).toBe('lasso');
    expect(CollectionType.Searching).toBe('searching');
  });

  it('should have correct BattlePhase values', () => {
    expect(BattlePhase.Preparing).toBe('preparing');
    expect(BattlePhase.WaveStart).toBe('wave_start');
    expect(BattlePhase.Spawning).toBe('spawning');
    expect(BattlePhase.Fighting).toBe('fighting');
    expect(BattlePhase.WaveClear).toBe('wave_clear');
    expect(BattlePhase.BossIntro).toBe('boss_intro');
    expect(BattlePhase.BossFight).toBe('boss_fight');
    expect(BattlePhase.Ending).toBe('ending');
    expect(BattlePhase.Settlement).toBe('settlement');
  });

  it('should have correct StageType values', () => {
    expect(StageType.Intro).toBe('intro');
    expect(StageType.Gathering).toBe('gathering');
    expect(StageType.Battle).toBe('battle');
    expect(StageType.Formula).toBe('formula');
    expect(StageType.Clinical).toBe('clinical');
    expect(StageType.Mastery).toBe('mastery');
  });
});

describe('Chapter Validation', () => {
  it('should validate chapter data', () => {
    const validChapter = {
      id: 'chapter-1',
      chapterNumber: 1,
      title: 'Test Chapter',
      subtitle: 'Test',
      wuxing: WuxingType.Wood,
      description: 'Test description',
      unlockRequirements: [],
      stages: [],
      medicines: [],
      formulas: [],
      isUnlocked: true,
      isCompleted: false,
      masteryScore: 0,
    };
    const result = validateChapter(validChapter);
    expect(result.success).toBe(true);
  });

  it('should invalidate chapter with missing fields', () => {
    const invalidChapter = {
      id: 'chapter-1',
      // missing chapterNumber
      title: 'Test',
      subtitle: 'Test',
      wuxing: WuxingType.Wood,
      description: 'Test',
    };
    const result = validateChapter(invalidChapter);
    expect(result.success).toBe(false);
  });

  it('should invalidate chapter with invalid chapterNumber', () => {
    const invalidChapter = {
      id: 'chapter-1',
      chapterNumber: 25, // should be max 20
      title: 'Test Chapter',
      subtitle: 'Test',
      wuxing: WuxingType.Wood,
      description: 'Test description',
      unlockRequirements: [],
      stages: [],
      medicines: [],
      formulas: [],
      isUnlocked: true,
      isCompleted: false,
      masteryScore: 0,
    };
    const result = validateChapter(invalidChapter);
    expect(result.success).toBe(false);
  });

  it('should invalidate chapter with invalid masteryScore', () => {
    const invalidChapter = {
      id: 'chapter-1',
      chapterNumber: 1,
      title: 'Test Chapter',
      subtitle: 'Test',
      wuxing: WuxingType.Wood,
      description: 'Test description',
      unlockRequirements: [],
      stages: [],
      medicines: [],
      formulas: [],
      isUnlocked: true,
      isCompleted: false,
      masteryScore: 150, // should be max 100
    };
    const result = validateChapter(invalidChapter);
    expect(result.success).toBe(false);
  });
});

describe('Stage Validation', () => {
  it('should validate stage with all fields', () => {
    const validChapter = {
      id: 'chapter-1',
      chapterNumber: 1,
      title: 'Test Chapter',
      subtitle: 'Test',
      wuxing: WuxingType.Wood,
      description: 'Test description',
      unlockRequirements: [],
      stages: [
        {
          id: 'c1-intro',
          type: StageType.Intro,
          title: 'Introduction',
          description: 'Chapter intro',
          requiredMedicines: [],
          unlockRequirements: [],
        },
      ],
      medicines: [],
      formulas: [],
      isUnlocked: true,
      isCompleted: false,
      masteryScore: 0,
    };
    const result = validateChapter(validChapter);
    expect(result.success).toBe(true);
  });

  it('should validate all stage types', () => {
    const stageTypes = [
      StageType.Intro,
      StageType.Gathering,
      StageType.Battle,
      StageType.Formula,
      StageType.Clinical,
      StageType.Mastery,
    ];

    stageTypes.forEach((type, index) => {
      const chapter = {
        id: `chapter-${index}`,
        chapterNumber: index + 1,
        title: 'Test',
        subtitle: 'Test',
        wuxing: WuxingType.Wood,
        description: 'Test',
        unlockRequirements: [],
        stages: [
          {
            id: 'stage-1',
            type,
            title: 'Stage',
            description: 'Stage desc',
            requiredMedicines: [],
            unlockRequirements: [],
          },
        ],
        medicines: [],
        formulas: [],
        isUnlocked: true,
        isCompleted: false,
        masteryScore: 0,
      };
      const result = validateChapter(chapter);
      expect(result.success).toBe(true);
    });
  });
});

describe('Wuxing Distribution', () => {
  it('should have valid wuxing types for all chapters', () => {
    const validWuxing = ['wood', 'fire', 'earth', 'metal', 'water'];

    chapters.forEach((chapter: any) => {
      expect(validWuxing).toContain(chapter.wuxing);
    });
  });

  it('should have chapters with valid structure', () => {
    chapters.forEach((chapter) => {
      expect(chapter.id).toBeDefined();
      expect(chapter.chapterNumber).toBeGreaterThan(0);
      expect(chapter.chapterNumber).toBeLessThanOrEqual(20);
      expect(chapter.title).toBeDefined();
      expect(chapter.stages.length).toBeGreaterThan(0);
    });
  });
});

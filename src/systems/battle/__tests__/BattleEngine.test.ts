/**
 * BattleEngine Unit Tests - Medicine Spirit System
 * Tests for battle system core functionality with AI-driven Medicine Spirit taming
 *
 * @module systems/battle/__tests__/BattleEngine.test
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { BattleEngine, BattleEventListener } from '../BattleEngine';
import { Medicine, WuxingType, FourQi, Movement, CollectionType } from '../../../types/index';

// Mock medicine data for testing
const mockMedicines: Medicine[] = [
  {
    id: 'med-1',
    name: '麻黄',
    pinyin: 'ma huang',
    latinName: 'Ephedra',
    category: '解表药',
    wuxing: WuxingType.Wood,
    fourQi: FourQi.Warm,
    fiveFlavors: ['spicy', 'bitter'],
    movement: Movement.Ascending,
    meridians: ['lung', 'bladder'],
    toxicity: '无毒',
    functions: ['发汗解表', '宣肺平喘', '利水消肿'],
    indications: ['风寒感冒', '咳嗽气喘', '水肿'],
    contraindications: [],
    stories: [],
    affinity: 0,
    isCollected: false,
  },
];

describe('BattleEngine - Medicine Spirit System', () => {
  let engine: BattleEngine;
  const mockListener: BattleEventListener = {
    onStateChange: vi.fn(),
    onSpiritTamed: vi.fn(),
    onWaveComplete: vi.fn(),
    onBattleEnd: vi.fn(),
    onAnswerEvaluated: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    engine = new BattleEngine(mockMedicines);
    engine.addEventListener(mockListener);
  });

  afterEach(() => {
    engine.destroy();
  });

  describe('Initialization', () => {
    it('should initialize with correct state', () => {
      const state = engine.getState();

      expect(state.status).toBe('waiting');
      expect(state.wave).toBe(0);
      expect(state.totalWaves).toBe(4);
      expect(state.spirits).toHaveLength(0);
      expect(state.activeSpiritId).toBeNull();
      expect(state.score).toBe(0);
      expect(state.combo).toBe(0);
      expect(state.skills).toHaveLength(3);
    });

    it('should initialize skills with correct cooldowns', () => {
      const state = engine.getState();

      expect(state.skills[0].id).toBe('hint_flash');
      expect(state.skills[0].name).toBe('灵光一闪');
      expect(state.skills[0].currentCooldown).toBe(0);
      expect(state.skills[1].id).toBe('encyclopedia');
      expect(state.skills[2].id).toBe('mentor_hint');
    });
  });

  describe('Error Handling', () => {
    it('should throw error when starting without medicines', async () => {
      const emptyEngine = new BattleEngine([]);
      await expect(emptyEngine.start()).rejects.toThrow('No medicines available');
    });
  });

  describe('Skill System', () => {
    it('should return skills list', () => {
      const skills = engine.getState().skills;

      expect(skills).toHaveLength(3);
      expect(skills[0].name).toBe('灵光一闪');
    });

    it('should return false for invalid skill', () => {
      const result = engine.useSkill('invalid_skill');
      expect(result).toBe(false);
    });
  });

  describe('Event Listeners', () => {
    it('should add event listener', () => {
      const newListener: BattleEventListener = {
        onStateChange: vi.fn(),
      };
      engine.addEventListener(newListener);
      // Should not throw
      expect(() => engine.addEventListener(newListener)).not.toThrow();
    });

    it('should remove event listener', () => {
      engine.removeEventListener(mockListener);
      // Should not throw
      expect(() => engine.removeEventListener(mockListener)).not.toThrow();
    });
  });

  describe('Destroy', () => {
    it('should clean up resources on destroy', async () => {
      engine.destroy();
      expect(engine.getState().status).toBe('defeat');
    });
  });
});

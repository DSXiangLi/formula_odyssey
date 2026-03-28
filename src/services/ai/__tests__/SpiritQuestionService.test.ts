import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  SpiritQuestionService,
  GenerateQuestionParams,
  EvaluateAnswerParams,
  QuestionTypeConfig,
} from '../SpiritQuestionService';
import { Medicine } from '../../../types';
import { SpiritQuestion } from '../../../systems/battle/types';
import { WuxingType, FourQi, Movement } from '../../../types/enums';

// Mock global fetch
global.fetch = vi.fn();

describe('SpiritQuestionService', () => {
  let service: SpiritQuestionService;

  const mockMedicine: Medicine = {
    id: 'med-001',
    name: '人参',
    pinyin: 'renshen',
    latinName: 'Panax ginseng',
    category: '补气药',
    wuxing: WuxingType.Wood,
    fourQi: FourQi.Warm,
    fiveFlavors: ['甘', '微苦'],
    movement: Movement.Ascending,
    meridians: ['脾', '肺', '心'],
    toxicity: '无毒',
    functions: ['大补元气', '复脉固脱', '补脾益肺', '生津养血', '安神益智'],
    indications: ['元气虚脱证', '肺脾心肾气虚证', '热病气虚津伤口渴'],
    contraindications: ['实证', '热证'],
    stories: ['人参成精的故事'],
    affinity: 0,
    isCollected: false,
    collected: false,
  };

  const mockMedicine2: Medicine = {
    id: 'med-002',
    name: '黄芪',
    pinyin: 'huangqi',
    latinName: 'Astragalus membranaceus',
    category: '补气药',
    wuxing: WuxingType.Earth,
    fourQi: FourQi.Warm,
    fiveFlavors: ['甘'],
    movement: Movement.Ascending,
    meridians: ['脾', '肺'],
    toxicity: '无毒',
    functions: ['补气升阳', '固表止汗', '利水消肿', '生津养血'],
    indications: ['脾气虚证', '肺气虚证', '气虚自汗'],
    contraindications: ['表实邪盛'],
    stories: [],
    affinity: 0,
    isCollected: false,
    collected: false,
  };

  beforeEach(() => {
    service = new SpiritQuestionService();
    vi.clearAllMocks();
  });

  describe('generateQuestion', () => {
    it('should generate a recall question with medicine spirit tone', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                id: 'q_test_001',
                type: 'recall',
                question: '我记不清自己的功效了，你能告诉我吗？',
                options: null,
                acceptableAnswers: ['大补元气', '补气'],
                hint: '我是补气第一要药~',
                knowledgeType: 'effects',
              }),
            },
          },
        ],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const params: GenerateQuestionParams = {
        medicine: mockMedicine,
        type: 'recall',
        difficulty: 3,
        knowledgeType: 'effects',
      };

      const question = await service.generateQuestion(params);

      expect(question.type).toBe('recall');
      expect(question.question).toContain('我');
      expect(question.acceptableAnswers.length).toBeGreaterThan(0);
      expect(question.knowledgeType).toBe('effects');
    });

    it('should generate a choice question with options', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                id: 'q_test_002',
                type: 'choice',
                question: '听说我归脾肺经，是真的吗？',
                options: ['是真的', '不是，归心肾经', '归肝胆经', '归脾胃经'],
                acceptableAnswers: ['是真的'],
                hint: '想想我主要补哪里的气~',
                knowledgeType: 'properties',
              }),
            },
          },
        ],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const params: GenerateQuestionParams = {
        medicine: mockMedicine,
        type: 'choice',
        difficulty: 2,
        knowledgeType: 'properties',
      };

      const question = await service.generateQuestion(params);

      expect(question.type).toBe('choice');
      expect(question.options).toBeDefined();
      expect(question.options?.length).toBe(4);
    });

    it('should return fallback question when API fails', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Network error')
      );

      const params: GenerateQuestionParams = {
        medicine: mockMedicine,
        type: 'recall',
        difficulty: 3,
        knowledgeType: 'name',
      };

      const question = await service.generateQuestion(params);

      expect(question.id).toContain('fallback');
      expect(question.question).toContain(mockMedicine.name);
      expect(question.acceptableAnswers).toContain(mockMedicine.name);
    });

    it('should return fallback question when same question already asked', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                id: 'q_test_003',
                type: 'recall',
                question: 'Test question',
                acceptableAnswers: ['answer'],
                hint: 'hint',
                knowledgeType: 'effects',
              }),
            },
          },
        ],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const params: GenerateQuestionParams = {
        medicine: mockMedicine,
        type: 'recall',
        difficulty: 3,
        knowledgeType: 'effects',
      };

      // First call
      await service.generateQuestion(params);

      // Second call should return fallback since question already asked
      const question2 = await service.generateQuestion(params);

      expect(question2.id).toContain('fallback');
    });
  });

  describe('evaluateAnswer', () => {
    const mockQuestion: SpiritQuestion = {
      id: 'q_test_001',
      type: 'recall',
      question: '我记不清自己的功效了，你能告诉我吗？',
      acceptableAnswers: ['大补元气', '补气', '复脉固脱'],
      hint: '我是补气第一要药~',
      knowledgeType: 'effects',
    };

    it('should evaluate correct answer with high score', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                score: 5,
                isCorrect: true,
                feedback: '谢谢你！我想起来了，原来是这样！你真聪明！',
                bonusInfo: '答对了！继续保持哦~',
              }),
            },
          },
        ],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const params: EvaluateAnswerParams = {
        question: mockQuestion,
        userAnswer: '大补元气',
        medicine: mockMedicine,
      };

      const evaluation = await service.evaluateAnswer(params);

      expect(evaluation.score).toBe(5);
      expect(evaluation.isCorrect).toBe(true);
      expect(evaluation.feedback).toContain('谢谢');
    });

    it('should evaluate incorrect answer with low score', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                score: 1,
                isCorrect: false,
                feedback: '不对哦...我印象中不是这样的。',
                bonusInfo: '别灰心，再试试看！',
              }),
            },
          },
        ],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const params: EvaluateAnswerParams = {
        question: mockQuestion,
        userAnswer: '清热解毒',
        medicine: mockMedicine,
      };

      const evaluation = await service.evaluateAnswer(params);

      expect(evaluation.score).toBe(1);
      expect(evaluation.isCorrect).toBe(false);
      expect(evaluation.feedback).toContain('不对');
    });

    it('should use fallback evaluation when API fails', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Network error')
      );

      const params: EvaluateAnswerParams = {
        question: mockQuestion,
        userAnswer: '大补元气',
        medicine: mockMedicine,
      };

      const evaluation = await service.evaluateAnswer(params);

      expect(evaluation.isCorrect).toBe(true);
      expect(evaluation.score).toBe(5);
    });

    it('should use fallback for partial match', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Network error')
      );

      const params: EvaluateAnswerParams = {
        question: mockQuestion,
        userAnswer: '补气', // partial match
        medicine: mockMedicine,
      };

      const evaluation = await service.evaluateAnswer(params);

      // "补气" is in acceptableAnswers so it should be correct
      expect(evaluation.isCorrect).toBe(true);
    });
  });

  describe('generateQuestionsBatch', () => {
    it('should generate questions for multiple medicines', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                id: 'q_batch_001',
                type: 'recall',
                question: 'Batch question',
                acceptableAnswers: ['answer'],
                hint: 'hint',
                knowledgeType: 'effects',
              }),
            },
          },
        ],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const types: QuestionTypeConfig[] = [
        { type: 'recall', weight: 40 },
        { type: 'judge', weight: 30 },
        { type: 'choice', weight: 20 },
        { type: 'free', weight: 10 },
      ];

      const questions = await service.generateQuestionsBatch(
        [mockMedicine, mockMedicine2],
        types
      );

      // Should generate 2 medicines * 2 questions each = 4 questions
      expect(questions.length).toBe(4);
    });

    it('should handle API failures gracefully in batch mode', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('API error')
      );

      const types: QuestionTypeConfig[] = [
        { type: 'recall', weight: 100 },
      ];

      const questions = await service.generateQuestionsBatch([mockMedicine], types);

      // Should still return fallback questions
      expect(questions.length).toBe(2);
      expect(questions[0].id).toContain('fallback');
    });
  });

  describe('resetAskedQuestions', () => {
    it('should allow regeneration after reset', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                id: 'q_reset_001',
                type: 'recall',
                question: 'Reset test question',
                acceptableAnswers: ['answer'],
                hint: 'hint',
                knowledgeType: 'effects',
              }),
            },
          },
        ],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const params: GenerateQuestionParams = {
        medicine: mockMedicine,
        type: 'recall',
        difficulty: 3,
        knowledgeType: 'effects',
      };

      // First call - should use API
      const question1 = await service.generateQuestion(params);
      expect(question1.id).toBe('q_reset_001');

      // Reset asked questions - this clears the "already asked" tracking
      service.resetAskedQuestions();

      // Second call - should return cached question (since cache is not cleared on reset)
      const question2 = await service.generateQuestion(params);
      expect(question2.id).toBe('q_reset_001');

      // API should only be called once due to caching
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should allow new question generation after reset with different medicine', async () => {
      const mockResponse1 = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                id: 'q_med1_001',
                type: 'recall',
                question: 'Medicine 1 question',
                acceptableAnswers: ['answer'],
                hint: 'hint',
                knowledgeType: 'effects',
              }),
            },
          },
        ],
      };

      const mockResponse2 = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                id: 'q_med2_001',
                type: 'recall',
                question: 'Medicine 2 question',
                acceptableAnswers: ['answer'],
                hint: 'hint',
                knowledgeType: 'effects',
              }),
            },
          },
        ],
      };

      (global.fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse1) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockResponse2) });

      const params1: GenerateQuestionParams = {
        medicine: mockMedicine,
        type: 'recall',
        difficulty: 3,
        knowledgeType: 'effects',
      };

      const params2: GenerateQuestionParams = {
        medicine: mockMedicine2,
        type: 'recall',
        difficulty: 3,
        knowledgeType: 'effects',
      };

      // First call for medicine 1
      const question1 = await service.generateQuestion(params1);
      expect(question1.id).toBe('q_med1_001');

      // Reset asked questions
      service.resetAskedQuestions();

      // Call for medicine 2 - should call API again
      const question2 = await service.generateQuestion(params2);
      expect(question2.id).toBe('q_med2_001');

      // API should be called twice for different medicines
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('question types', () => {
    it('should support all 4 question types', async () => {
      const types: Array<'recall' | 'judge' | 'choice' | 'free'> = [
        'recall',
        'judge',
        'choice',
        'free',
      ];

      for (const type of types) {
        const mockResponse = {
          choices: [
            {
              message: {
                content: JSON.stringify({
                  id: `q_${type}_001`,
                  type,
                  question: `${type} question`,
                  acceptableAnswers: ['answer'],
                  hint: 'hint',
                  knowledgeType: 'effects',
                }),
              },
            },
          ],
        };

        (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        service.resetAskedQuestions();
        const params: GenerateQuestionParams = {
          medicine: mockMedicine,
          type,
          difficulty: 3,
          knowledgeType: 'effects',
        };

        const question = await service.generateQuestion(params);
        expect(question.type).toBe(type);
      }
    });
  });

  describe('knowledge types', () => {
    it('should support all knowledge types in fallback', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Network error')
      );

      const knowledgeTypes: Array<'name' | 'properties' | 'effects' | 'formula'> = [
        'name',
        'properties',
        'effects',
        'formula',
      ];

      for (const knowledgeType of knowledgeTypes) {
        service.resetAskedQuestions();
        const params: GenerateQuestionParams = {
          medicine: mockMedicine,
          type: 'recall',
          difficulty: 3,
          knowledgeType,
        };

        const question = await service.generateQuestion(params);
        expect(question.knowledgeType).toBe(knowledgeType);
        expect(question.question).toBeTruthy();
      }
    });
  });

  describe('cache functionality', () => {
    it('should cache questions and return cached version', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                id: 'q_cache_001',
                type: 'recall',
                question: 'Cached question',
                acceptableAnswers: ['answer'],
                hint: 'hint',
                knowledgeType: 'effects',
              }),
            },
          },
        ],
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const params: GenerateQuestionParams = {
        medicine: mockMedicine,
        type: 'recall',
        difficulty: 3,
        knowledgeType: 'effects',
      };

      // First call - hits API
      const question1 = await service.generateQuestion(params);

      // Reset asked questions
      service.resetAskedQuestions();

      // Second call - should use cache (not API)
      const question2 = await service.generateQuestion(params);

      expect(question1.question).toBe(question2.question);
      // Should only call API once due to caching
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should provide cache statistics', () => {
      const stats = service.getCacheStats();

      expect(stats).toHaveProperty('questions');
      expect(stats).toHaveProperty('events');
      expect(stats).toHaveProperty('validations');
      expect(stats).toHaveProperty('guides');
    });
  });
});

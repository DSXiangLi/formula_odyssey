# 药灵驯服战重构实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有的"药灵守护战"打字战斗游戏重构为"药灵驯服战"问答游戏，引入AI药灵形象、开放式问答、AI评分系统。

**Architecture:**
- 保留BattleEngine核心架构，但将"敌人"概念改为"药灵"
- 引入LLM服务生成开放式问题和评判答案
- 新增SpiritImageService用于AI生成药灵形象
- 重构UI组件：药灵悬浮展示、问题泡泡、驯服进度条

**Tech Stack:** React 18 + TypeScript + Framer Motion + Zustand + Seedream API + GLM-4 API

---

## 文件结构映射

| 文件 | 职责 |
|------|------|
| `src/systems/battle/types.ts` | 战斗类型定义（新增Spirit类型） |
| `src/systems/battle/MedicineSpirit.ts` | 药灵实体类（新） |
| `src/systems/battle/AnswerEvaluator.ts` | AI答案评判服务（新） |
| `src/systems/battle/BattleEngine.ts` | 战斗引擎核心（重构） |
| `src/services/ai/SpiritImageService.ts` | AI药灵形象生成（新） |
| `src/services/ai/SpiritQuestionService.ts` | LLM问题生成服务（新） |
| `src/components/battle/SpiritCharacter.tsx` | 药灵角色组件（新） |
| `src/components/battle/QuestionBubble.tsx` | 问题泡泡组件（新） |
| `src/components/battle/TameProgressBar.tsx` | 驯服进度条（新） |
| `src/components/battle/BattleScene.tsx` | 主战斗场景（重构） |
| `src/components/battle/SpiritSkillBar.tsx` | 技能栏（重构） |
| `src/components/battle/GameTutorial.tsx` | 游戏引导（新） |

---

## Task 1: 重构类型定义系统

**Files:**
- Modify: `src/systems/battle/types.ts`
- Test: `src/systems/battle/__tests__/types.test.ts`

**Context:** 现有Enemy类型需要重构为MedicineSpirit类型，支持新的游戏机制。

### Step 1: 添加新类型定义

```typescript
// src/systems/battle/types.ts

export interface MedicineSpirit {
  id: string;
  medicineId: string;
  name: string;
  displayName: string;
  imageUrl: string;
  difficulty: 'normal' | 'elite' | 'boss';
  personality: 'gentle' | 'lively' | 'dignified';

  // 位置与状态
  position: { x: number; y: number };
  tameProgress: number;  // 0-100
  state: 'floating' | 'asking' | 'tamed' | 'escaped';
  isActive: boolean;

  // 动画
  floatPhase: number;  // 漂浮相位

  // 问题
  question: SpiritQuestion;
}

export interface SpiritQuestion {
  id: string;
  type: 'recall' | 'judge' | 'choice' | 'free';
  question: string;
  options?: string[];
  acceptableAnswers: string[];
  hint: string;
  knowledgeType: 'name' | 'properties' | 'effects' | 'formula';
}

export interface AnswerEvaluation {
  score: 1 | 2 | 3 | 4 | 5;
  isCorrect: boolean;
  feedback: string;
  bonusInfo?: string;
}

export interface TameResult {
  spiritId: string;
  evaluation: AnswerEvaluation;
  newProgress: number;
  isTamed: boolean;
}

export interface SpiritSkill {
  id: 'hint_flash' | 'encyclopedia' | 'mentor_hint';
  name: string;
  description: string;
  icon: string;
  cooldown: number;
  currentCooldown: number;
  effect: SpiritSkillEffect;
}

export type SpiritSkillEffect =
  | { type: 'show_hint'; hintType: 'first_char' | 'length' }
  | { type: 'show_description' }
  | { type: 'mentor_answer'; scorePenalty: number };

// 重构BattleState
export interface BattleState {
  status: 'waiting' | 'playing' | 'paused' | 'victory' | 'defeat';
  wave: number;
  totalWaves: number;
  spirits: MedicineSpirit[];
  activeSpiritId: string | null;
  score: number;
  combo: number;
  maxCombo: number;
  timeElapsed: number;
  tamedCount: number;
  totalSpirits: number;
  skills: SpiritSkill[];
  inputText: string;
  lastEvaluation: AnswerEvaluation | null;
}

export interface BattleResult {
  victory: boolean;
  score: number;
  maxCombo: number;
  wavesCleared: number;
  timeElapsed: number;
  tamedSpirits: string[];
  accuracy: number;
}
```

### Step 2: 运行TypeScript检查

```bash
cd /home/lixiang/Desktop/zhongyi_game/src
npx tsc --noEmit --skipLibCheck
```

Expected: PASS (无类型错误)

### Step 3: 提交

```bash
git add src/systems/battle/types.ts
git commit -m "feat(battle): add MedicineSpirit and AnswerEvaluation types"
```

---

## Task 2: 创建AI药灵形象生成服务

**Files:**
- Create: `src/services/ai/SpiritImageService.ts`
- Create: `src/services/ai/__tests__/SpiritImageService.test.ts`

**Context:** 使用Seedream API生成拟人化药灵形象。

### Step 1: 创建SpiritImageService

```typescript
// src/services/ai/SpiritImageService.ts

import { Medicine } from '../../types';

export interface SpiritImagePrompt {
  name: string;
  difficulty: 'normal' | 'elite' | 'boss';
  medicine: Medicine;
}

export class SpiritImageService {
  private readonly API_URL = import.meta.env.VITE_SEED_IMAGE_URL ||
    'https://ark.cn-beijing.volces.com/api/v3/images/generations';
  private readonly API_KEY = import.meta.env.VITE_SEED_IMAGE_KEY || '';
  private readonly MODEL = import.meta.env.VITE_SEED_MODEL_NAME || 'doubao-seedream-4-5-251128';

  // 本地缓存
  private imageCache: Map<string, string> = new Map();

  /**
   * 生成药灵形象
   */
  async generateSpiritImage(
    medicine: Medicine,
    difficulty: 'normal' | 'elite' | 'boss'
  ): Promise<string | null> {
    const cacheKey = `${medicine.id}_${difficulty}`;

    // 检查缓存
    if (this.imageCache.has(cacheKey)) {
      return this.imageCache.get(cacheKey)!;
    }

    if (!this.API_KEY) {
      console.warn('Seedream API key not configured, using placeholder');
      return this.getPlaceholderImage(medicine, difficulty);
    }

    try {
      const prompt = this.buildPrompt(medicine, difficulty);
      const imageUrl = await this.callSeedream(prompt);

      if (imageUrl) {
        this.imageCache.set(cacheKey, imageUrl);
      }

      return imageUrl;
    } catch (error) {
      console.error('Failed to generate spirit image:', error);
      return this.getPlaceholderImage(medicine, difficulty);
    }
  }

  /**
   * 批量生成药灵形象
   */
  async generateSpiritImages(
    medicines: Medicine[],
    difficulty: 'normal' | 'elite' | 'boss'
  ): Promise<Record<string, string>> {
    const results: Record<string, string> = {};

    for (const medicine of medicines) {
      const imageUrl = await this.generateSpiritImage(medicine, difficulty);
      results[medicine.id] = imageUrl || this.getPlaceholderImage(medicine, difficulty);

      // 延迟避免速率限制
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
  }

  private buildPrompt(medicine: Medicine, difficulty: string): string {
    const featureDesc = this.getMedicineFeatureDescription(medicine);
    const styleGuide = this.getStyleGuide(difficulty);

    return `${styleGuide}
${featureDesc}
Traditional Chinese fantasy style, magical atmosphere,
character portrait, centered composition, clean background, 4K quality`;
  }

  private getMedicineFeatureDescription(medicine: Medicine): string {
    // 根据药物特征生成描述
    const descriptions: Record<string, string> = {
      'danggui': 'A gentle female spirit in flowing red robes, long black hair with red ribbons,
        holding a red silk cord, warm and nurturing expression, representing blood nourishment',
      'chuanxiong': 'A lively young male spirit in teal robes, holding a folding fan,
        energetic posture, wind-swept hair, representing blood circulation and movement',
      'huangqi': 'A dignified elder spirit in golden yellow robes, long white beard,
        holding a staff with herb decorations, wise and commanding presence, representing qi boosting',
      'baishao': 'An elegant female spirit in pure white robes, serene expression,
        gentle floating pose, soft glowing aura, representing yin nourishment',
      'shudihuang': 'A mystical spirit in dark purple-black robes, mysterious expression,
        surrounded by dark golden light, representing kidney essence and blood replenishment',
    };

    return descriptions[medicine.id] ||
      `A herb spirit representing ${medicine.name}, wearing traditional Chinese clothing
       with ${medicine.category} motifs, magical aura`;
  }

  private getStyleGuide(difficulty: string): string {
    switch (difficulty) {
      case 'normal':
        return 'Cute chibi-style anime character, young apprentice appearance, soft glowing aura,
                gentle expression, floating pose with magical particles, anime art style,';
      case 'elite':
        return 'Elegant anime character design, young scholar appearance, confident pose,
                golden glowing aura, refined traditional clothing, detailed anime style,';
      case 'boss':
        return 'Majestic anime character design, wise elder appearance, powerful commanding pose,
                rainbow aura, elaborate emperor-style robes with ornate crown, epic anime style,';
      default:
        return 'Anime character design, traditional Chinese fantasy style,';
    }
  }

  private async callSeedream(prompt: string): Promise<string | null> {
    const response = await fetch(this.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.API_KEY}`,
      },
      body: JSON.stringify({
        model: this.MODEL,
        prompt: prompt,
        width: 1024,
        height: 1024,
        seed: Math.floor(Math.random() * 1000000),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Seedream API error:', errorText);
      return null;
    }

    const data = await response.json();
    return data.data?.[0]?.url || null;
  }

  private getPlaceholderImage(medicine: Medicine, difficulty: string): string {
    // 使用表情符号作为降级方案
    const emojiMap: Record<string, Record<string, string>> = {
      normal: { default: '👻' },
      elite: { default: '👺' },
      boss: { default: '👹' },
    };

    // 返回SVG data URL
    const emoji = emojiMap[difficulty]?.default || '👻';
    return `data:image/svg+xml,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
        <text x="50" y="70" font-size="60" text-anchor="middle">${emoji}</text>
      </svg>`
    )}`;
  }

  /**
   * 清空缓存
   */
  clearCache(): void {
    this.imageCache.clear();
  }
}

export const spiritImageService = new SpiritImageService();
```

### Step 2: 编写测试

```typescript
// src/services/ai/__tests__/SpiritImageService.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SpiritImageService } from '../SpiritImageService';
import { Medicine } from '../../../types';

describe('SpiritImageService', () => {
  let service: SpiritImageService;

  const mockMedicine: Medicine = {
    id: 'danggui',
    name: '当归',
    category: '补血药',
    properties: '甘、辛，温',
    meridian: '肝、心、脾',
    functions: ['补血活血', '调经止痛', '润肠通便'],
    applications: ['血虚萎黄', '月经不调'],
    pinyin: 'danggui',
  };

  beforeEach(() => {
    service = new SpiritImageService();
    service.clearCache();
  });

  it('should return placeholder when API key is not configured', async () => {
    vi.stubEnv('VITE_SEED_IMAGE_KEY', '');

    const result = await service.generateSpiritImage(mockMedicine, 'normal');

    expect(result).toContain('data:image/svg+xml');
  });

  it('should cache generated images', async () => {
    // Mock successful API call
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [{ url: 'https://example.com/image.png' }] }),
    });

    vi.stubEnv('VITE_SEED_IMAGE_KEY', 'test-key');

    const result1 = await service.generateSpiritImage(mockMedicine, 'normal');
    const result2 = await service.generateSpiritImage(mockMedicine, 'normal');

    expect(result1).toBe('https://example.com/image.png');
    expect(result2).toBe('https://example.com/image.png');
    expect(fetch).toHaveBeenCalledTimes(1); // 只调用一次API
  });

  it('should batch generate images', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [{ url: 'https://example.com/image.png' }] }),
    });

    vi.stubEnv('VITE_SEED_IMAGE_KEY', 'test-key');

    const medicines = [mockMedicine, { ...mockMedicine, id: 'chuanxiong', name: '川芎' }];
    const results = await service.generateSpiritImages(medicines, 'normal');

    expect(results).toHaveProperty('danggui');
    expect(results).toHaveProperty('chuanxiong');
  });
});
```

### Step 3: 运行测试

```bash
cd /home/lixiang/Desktop/zhongyi_game/src
npm test -- src/services/ai/__tests__/SpiritImageService.test.ts
```

Expected: PASS

### Step 4: 提交

```bash
git add src/services/ai/SpiritImageService.ts
git add src/services/ai/__tests__/SpiritImageService.test.ts
git commit -m "feat(spirit): add SpiritImageService for AI-generated spirit images"
```

---

## Task 3: 创建LLM问题生成服务

**Files:**
- Create: `src/services/ai/SpiritQuestionService.ts`
- Create: `src/services/ai/__tests__/SpiritQuestionService.test.ts`

**Context:** 使用GLM-4生成开放式中医药问题和评判答案。

### Step 1: 创建SpiritQuestionService

```typescript
// src/services/ai/SpiritQuestionService.ts

import { Medicine } from '../../types';
import { SpiritQuestion, AnswerEvaluation } from '../../systems/battle/types';
import { AICacheManager } from './cache';

export interface GenerateQuestionParams {
  medicine: Medicine;
  questionType: 'recall' | 'judge' | 'choice' | 'free';
  knowledgeType: 'name' | 'properties' | 'effects' | 'formula';
}

export interface EvaluateAnswerParams {
  question: SpiritQuestion;
  userAnswer: string;
  medicine: Medicine;
}

export class SpiritQuestionService {
  private readonly API_URL = 'https://api.glm.cn/v1/chat/completions';
  private readonly API_KEY = import.meta.env.VITE_GLM_API_KEY || '';
  private askedQuestions: Set<string> = new Set();

  /**
   * 生成药灵问题
   */
  async generateQuestion(params: GenerateQuestionParams): Promise<SpiritQuestion> {
    const cacheKey = AICacheManager.generateValidationKey(
      params.medicine.id,
      JSON.stringify({ type: params.questionType, knowledge: params.knowledgeType })
    );

    // 避免重复问题
    if (this.askedQuestions.has(cacheKey)) {
      return this.getFallbackQuestion(params);
    }

    this.askedQuestions.add(cacheKey);

    if (!this.API_KEY) {
      return this.getFallbackQuestion(params);
    }

    try {
      const prompt = this.buildQuestionPrompt(params);
      const response = await this.callLLM(prompt);
      const parsed = this.parseQuestionResponse(response, params);

      if (parsed) {
        return { ...parsed, id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` };
      }
    } catch (error) {
      console.error('Question generation error:', error);
    }

    return this.getFallbackQuestion(params);
  }

  /**
   * 评判玩家答案
   */
  async evaluateAnswer(params: EvaluateAnswerParams): Promise<AnswerEvaluation> {
    if (!this.API_KEY) {
      return this.getFallbackEvaluation(params);
    }

    try {
      const prompt = this.buildEvaluationPrompt(params);
      const response = await this.callLLM(prompt);
      const parsed = this.parseEvaluationResponse(response);

      if (parsed) {
        return parsed;
      }
    } catch (error) {
      console.error('Answer evaluation error:', error);
    }

    return this.getFallbackEvaluation(params);
  }

  /**
   * 批量生成问题（波次初始化时调用）
   */
  async generateQuestionsBatch(
    medicines: Medicine[],
    types: Array<{ type: 'recall' | 'judge' | 'choice' | 'free'; knowledge: 'name' | 'properties' | 'effects' | 'formula' }>
  ): Promise<SpiritQuestion[]> {
    const questions: SpiritQuestion[] = [];

    for (let i = 0; i < medicines.length; i++) {
      const medicine = medicines[i];
      const typeConfig = types[i % types.length];

      const question = await this.generateQuestion({
        medicine,
        questionType: typeConfig.type,
        knowledgeType: typeConfig.knowledge,
      });

      questions.push(question);
    }

    return questions;
  }

  private buildQuestionPrompt(params: GenerateQuestionParams): string {
    const { medicine, questionType, knowledgeType } = params;

    const typeInstructions: Record<string, string> = {
      recall: `设计一个"回忆型"问题：药灵忘记了自己的${this.getKnowledgeLabel(knowledgeType)}，
               需要玩家告诉它。问题要体现"失忆"的语境。`,
      judge: `设计一个"判断型"问题：药灵听说某种说法，想确认是否正确。
              问题要体现"求证"的语境。`,
      choice: `设计一个"选择型"问题：给出几个选项让药灵选择正确的。`,
      free: `设计一个"自由型"问题：开放式深度问题，考察对药材的综合理解。`,
    };

    return `请为中医学习游戏生成一道题目。

【药材信息】
名称：${medicine.name}
性味归经：${medicine.properties}，归${medicine.meridian}
功效：${medicine.functions.join('、')}
主治：${medicine.applications.join('、')}

【题目类型】${typeInstructions[questionType]}

【要求】
1. 从药灵的角度提问（"我记不清了..." / "听说我...是真的吗？"）
2. 围绕${this.getKnowledgeLabel(knowledgeType)}设计问题
3. 问题要有趣味性，符合药灵"失忆"的设定

请用JSON格式输出：
{
  "type": "${questionType}",
  "knowledgeType": "${knowledgeType}",
  "question": "问题文本（药灵口吻）",
  "options": ${questionType === 'choice' ? '["选项A", "选项B", "选项C", "选项D"]' : 'null'},
  "acceptableAnswers": ["答案1", "答案2", "同义词"],
  "hint": "提示信息"
}

只返回JSON，不要有其他文字。`;
  }

  private buildEvaluationPrompt(params: EvaluateAnswerParams): string {
    const { question, userAnswer, medicine } = params;

    return `请评判玩家对中医药问题的回答。

【题目】${question.question}
【正确答案参考】${question.acceptableAnswers.join(' / ')}
【玩家回答】${userAnswer}

【药材信息】
名称：${medicine.name}
性味归经：${medicine.properties}，归${medicine.meridian}
功效：${medicine.functions.join('、')}

【评分标准】
5分：完美回答，准确完整
4分：正确，但缺少细节
3分：基本正确，有小偏差
2分：部分正确
1分：错误或完全不相关

请用JSON格式输出：
{
  "score": 1-5,
  "isCorrect": true/false (>=3分为正确),
  "feedback": "反馈文本（鼓励性，中文）",
  "bonusInfo": "额外知识补充（可选）"
}

反馈要亲切友好，从药灵的角度回应（"谢谢你！我想起来了..." / "不对哦...让我再想想..."）。

只返回JSON，不要有其他文字。`;
  }

  private async callLLM(prompt: string): Promise<string> {
    const response = await fetch(this.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.API_KEY}`,
      },
      body: JSON.stringify({
        model: 'glm-4',
        messages: [
          {
            role: 'system',
            content: '你是一个中医教育专家，擅长设计有趣的学习题目。只返回JSON格式。',
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 800,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private parseQuestionResponse(response: string, params: GenerateQuestionParams): SpiritQuestion | null {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          id: '', // 由调用者设置
          type: parsed.type || params.questionType,
          question: parsed.question,
          options: parsed.options,
          acceptableAnswers: parsed.acceptableAnswers || [],
          hint: parsed.hint,
          knowledgeType: parsed.knowledgeType || params.knowledgeType,
        };
      }
    } catch (e) {
      console.error('Failed to parse question:', e);
    }
    return null;
  }

  private parseEvaluationResponse(response: string): AnswerEvaluation | null {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          score: Math.min(5, Math.max(1, parsed.score || 3)),
          isCorrect: parsed.isCorrect || parsed.score >= 3,
          feedback: parsed.feedback || '谢谢你的回答！',
          bonusInfo: parsed.bonusInfo,
        };
      }
    } catch (e) {
      console.error('Failed to parse evaluation:', e);
    }
    return null;
  }

  private getFallbackQuestion(params: GenerateQuestionParams): SpiritQuestion {
    const { medicine, questionType, knowledgeType } = params;

    // 基于知识类型生成默认问题
    const fallbacks: Record<string, SpiritQuestion> = {
      properties: {
        id: `fallback_${Date.now()}`,
        type: 'recall',
        knowledgeType: 'properties',
        question: `我记不清了...我的性味归经是什么来着？`,
        acceptableAnswers: [medicine.properties, `${medicine.properties}，归${medicine.meridian}`],
        hint: `提示：我属于${medicine.category}，性味是${medicine.properties.split('，')[0]}`,
      },
      effects: {
        id: `fallback_${Date.now()}`,
        type: 'recall',
        knowledgeType: 'effects',
        question: `我好像能治病，但忘了能治什么...我的功效是什么？`,
        acceptableAnswers: medicine.functions,
        hint: `提示：我能${medicine.functions[0]}`,
      },
    };

    return fallbacks[knowledgeType] || fallbacks.properties;
  }

  private getFallbackEvaluation(params: EvaluateAnswerParams): AnswerEvaluation {
    const { question, userAnswer } = params;

    // 简单的字符串匹配作为降级方案
    const isCorrect = question.acceptableAnswers.some(
      ans => userAnswer.toLowerCase().includes(ans.toLowerCase()) ||
             ans.toLowerCase().includes(userAnswer.toLowerCase())
    );

    return {
      score: isCorrect ? 4 : 2,
      isCorrect,
      feedback: isCorrect ? '谢谢你！我想起来了！' : '不对哦...让我再想想...',
    };
  }

  private getKnowledgeLabel(type: string): string {
    const labels: Record<string, string> = {
      name: '名称',
      properties: '性味归经',
      effects: '功效',
      formula: '方剂组成',
    };
    return labels[type] || '属性';
  }

  resetAskedQuestions(): void {
    this.askedQuestions.clear();
  }
}

export const spiritQuestionService = new SpiritQuestionService();
```

### Step 2: 编写测试

```typescript
// src/services/ai/__tests__/SpiritQuestionService.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SpiritQuestionService } from '../SpiritQuestionService';
import { Medicine } from '../../../types';

describe('SpiritQuestionService', () => {
  let service: SpiritQuestionService;

  const mockMedicine: Medicine = {
    id: 'danggui',
    name: '当归',
    category: '补血药',
    properties: '甘、辛，温',
    meridian: '肝、心、脾',
    functions: ['补血活血', '调经止痛'],
    applications: ['血虚萎黄', '月经不调'],
    pinyin: 'danggui',
  };

  beforeEach(() => {
    service = new SpiritQuestionService();
    service.resetAskedQuestions();
  });

  it('should generate fallback question when API is not available', async () => {
    vi.stubEnv('VITE_GLM_API_KEY', '');

    const question = await service.generateQuestion({
      medicine: mockMedicine,
      questionType: 'recall',
      knowledgeType: 'properties',
    });

    expect(question.question).toContain('记不清');
    expect(question.acceptableAnswers.length).toBeGreaterThan(0);
  });

  it('should evaluate answer with fallback when API is not available', async () => {
    vi.stubEnv('VITE_GLM_API_KEY', '');

    const question = await service.generateQuestion({
      medicine: mockMedicine,
      questionType: 'recall',
      knowledgeType: 'properties',
    });

    const evaluation = await service.evaluateAnswer({
      question,
      userAnswer: '甘、辛，温',
      medicine: mockMedicine,
    });

    expect(evaluation.isCorrect).toBe(true);
    expect(evaluation.score).toBeGreaterThanOrEqual(3);
  });

  it('should batch generate questions', async () => {
    vi.stubEnv('VITE_GLM_API_KEY', '');

    const medicines = [mockMedicine, { ...mockMedicine, id: 'chuanxiong', name: '川芎' }];
    const types = [
      { type: 'recall' as const, knowledge: 'properties' as const },
      { type: 'judge' as const, knowledge: 'effects' as const },
    ];

    const questions = await service.generateQuestionsBatch(medicines, types);

    expect(questions).toHaveLength(2);
    expect(questions[0].question).toBeTruthy();
  });
});
```

### Step 3: 运行测试并提交

```bash
cd /home/lixiang/Desktop/zhongyi_game/src
npm test -- src/services/ai/__tests__/SpiritQuestionService.test.ts
```

Expected: PASS

```bash
git add src/services/ai/SpiritQuestionService.ts
git add src/services/ai/__tests__/SpiritQuestionService.test.ts
git commit -m "feat(spirit): add SpiritQuestionService for LLM-generated questions and answer evaluation"
```

---

## Task 4: 重构BattleEngine核心

**Files:**
- Modify: `src/systems/battle/BattleEngine.ts`
- Modify: `src/systems/battle/__tests__/BattleEngine.test.ts`

**Context:** 将敌人系统改为药灵系统，实现驯服机制。

### Step 1: 重构BattleEngine

```typescript
// src/systems/battle/BattleEngine.ts

import { Medicine } from '../../types';
import { BattleState, BattleResult, MedicineSpirit, SpiritSkill, AnswerEvaluation, TameResult } from './types';
import { spiritQuestionService } from '../../services/ai/SpiritQuestionService';
import { spiritImageService } from '../../services/ai/SpiritImageService';
import { AICacheManager } from '../../services/ai/cache';

export type BattleEventType =
  | 'state_change'
  | 'spirit_tamed'
  | 'spirit_escaped'
  | 'answer_evaluated'
  | 'skill_used'
  | 'wave_complete'
  | 'game_over';

export interface BattleEvent {
  type: BattleEventType;
  payload: unknown;
}

type BattleEventListener = (event: BattleEvent) => void;

export class BattleEngine {
  private state: BattleState;
  private medicines: Medicine[] = [];
  private eventListeners: BattleEventListener[] = [];
  private timerInterval: number | null = null;
  private readonly WAVES = 4;
  private readonly SPIRITS_PER_WAVE = [4, 4, 3, 1];

  constructor(medicines: Medicine[]) {
    this.medicines = medicines;
    this.state = this.createInitialState();
  }

  private createInitialState(): BattleState {
    return {
      status: 'waiting',
      wave: 1,
      totalWaves: this.WAVES,
      spirits: [],
      activeSpiritId: null,
      score: 0,
      combo: 0,
      maxCombo: 0,
      timeElapsed: 0,
      tamedCount: 0,
      totalSpirits: 0,
      skills: this.createInitialSkills(),
      inputText: '',
      lastEvaluation: null,
    };
  }

  private createInitialSkills(): SpiritSkill[] {
    return [
      {
        id: 'hint_flash',
        name: '灵光一闪',
        description: '获得答案提示',
        icon: '🌟',
        cooldown: 30,
        currentCooldown: 0,
        effect: { type: 'show_hint', hintType: 'first_char' },
      },
      {
        id: 'encyclopedia',
        name: '典籍查阅',
        description: '查看药材详细描述',
        icon: '📖',
        cooldown: 45,
        currentCooldown: 0,
        effect: { type: 'show_description' },
      },
      {
        id: 'mentor_hint',
        name: '青木提示',
        description: '直接获得答案（得分减半）',
        icon: '💡',
        cooldown: 60,
        currentCooldown: 0,
        effect: { type: 'mentor_answer', scorePenalty: 0.5 },
      },
    ];
  }

  // 事件订阅
  subscribe(listener: BattleEventListener): void {
    this.eventListeners.push(listener);
  }

  unsubscribe(listener: BattleEventListener): void {
    this.eventListeners = this.eventListeners.filter(l => l !== listener);
  }

  private emit(event: BattleEvent): void {
    this.eventListeners.forEach(listener => listener(event));
  }

  private notifyStateChange(): void {
    this.emit({ type: 'state_change', payload: this.state });
  }

  // 游戏控制
  async start(): Promise<void> {
    this.state.status = 'playing';
    await this.startWave(1);
    this.startTimer();
    this.notifyStateChange();
  }

  private startTimer(): void {
    if (this.timerInterval) {
      window.clearInterval(this.timerInterval);
    }

    this.timerInterval = window.setInterval(() => {
      this.state.timeElapsed++;
      this.updateSkillCooldowns();
      this.notifyStateChange();
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      window.clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // 波次管理
  private async startWave(waveNumber: number): Promise<void> {
    this.state.wave = waveNumber;
    const spiritCount = this.SPIRITS_PER_WAVE[waveNumber - 1] || 4;

    // 生成药灵
    const spirits = await this.generateSpirits(spiritCount, waveNumber);
    this.state.spirits = spirits;
    this.state.totalSpirits += spiritCount;

    // 默认激活第一个药灵
    if (spirits.length > 0) {
      this.state.activeSpiritId = spirits[0].id;
      spirits[0].isActive = true;
    }

    this.notifyStateChange();
  }

  private async generateSpirits(count: number, wave: number): Promise<MedicineSpirit[]> {
    const spirits: MedicineSpirit[] = [];
    const difficulty = wave === 4 ? 'boss' : wave === 3 ? 'elite' : 'normal';

    // 选择药材（优先使用已收集的）
    const selectedMedicines = this.selectMedicinesForWave(count);

    // 预生成药灵形象
    const imageUrls = await spiritImageService.generateSpiritImages(selectedMedicines, difficulty);

    // 预生成问题
    const questionTypes: Array<{ type: 'recall' | 'judge' | 'choice' | 'free'; knowledge: 'name' | 'properties' | 'effects' | 'formula' }> = [
      { type: 'recall', knowledge: 'properties' },
      { type: 'recall', knowledge: 'effects' },
      { type: 'judge', knowledge: 'properties' },
      { type: 'free', knowledge: 'effects' },
    ];

    const questions = await spiritQuestionService.generateQuestionsBatch(
      selectedMedicines,
      questionTypes
    );

    for (let i = 0; i < count; i++) {
      const medicine = selectedMedicines[i];
      const question = questions[i];

      spirits.push({
        id: `spirit_${wave}_${i}_${Date.now()}`,
        medicineId: medicine.id,
        name: `${medicine.name}灵`,
        displayName: medicine.name,
        imageUrl: imageUrls[medicine.id] || '',
        difficulty,
        personality: this.getPersonality(medicine),
        position: { x: this.calculateXPosition(i, count), y: 100 },
        tameProgress: 0,
        state: 'floating',
        isActive: i === 0,
        floatPhase: i * 0.5, // 相位差
        question,
      });
    }

    return spirits;
  }

  private selectMedicinesForWave(count: number): Medicine[] {
    // 从可用药材中随机选择
    const shuffled = [...this.medicines].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  private calculateXPosition(index: number, total: number): number {
    // 均匀分布在画面上方
    const spacing = 800 / (total + 1);
    return 100 + spacing * (index + 1);
  }

  private getPersonality(medicine: Medicine): 'gentle' | 'lively' | 'dignified' {
    // 根据药物特性决定性格
    if (medicine.category.includes('补益')) return 'dignified';
    if (medicine.category.includes('解表')) return 'lively';
    return 'gentle';
  }

  // 核心交互：回答处理
  async submitAnswer(answer: string): Promise<TameResult | null> {
    if (!this.state.activeSpiritId || this.state.status !== 'playing') {
      return null;
    }

    const spirit = this.state.spirits.find(s => s.id === this.state.activeSpiritId);
    if (!spirit || spirit.state === 'tamed') {
      return null;
    }

    // 获取药材信息
    const medicine = this.medicines.find(m => m.id === spirit.medicineId);
    if (!medicine) return null;

    // AI评判答案
    const evaluation = await spiritQuestionService.evaluateAnswer({
      question: spirit.question,
      userAnswer: answer,
      medicine,
    });

    this.state.lastEvaluation = evaluation;

    // 更新驯服进度
    const progressIncrement = evaluation.score * 5; // 5分=25%, 4分=20%, etc.
    spirit.tameProgress = Math.min(100, spirit.tameProgress + progressIncrement);

    const result: TameResult = {
      spiritId: spirit.id,
      evaluation,
      newProgress: spirit.tameProgress,
      isTamed: spirit.tameProgress >= 100,
    };

    // 更新连击
    if (evaluation.isCorrect) {
      this.state.combo++;
      this.state.maxCombo = Math.max(this.state.maxCombo, this.state.combo);
    } else {
      this.state.combo = 0;
    }

    // 计算得分（考虑连击加成）
    const comboBonus = Math.floor(this.state.combo / 5) * 10;
    const baseScore = evaluation.score * 20;
    this.state.score += baseScore + comboBonus;

    // 驯服完成
    if (result.isTamed) {
      spirit.state = 'tamed';
      this.state.tamedCount++;
      this.emit({ type: 'spirit_tamed', payload: { spirit, score: baseScore } });

      // 检查是否完成波次
      if (this.checkWaveComplete()) {
        await this.completeWave();
      } else {
        // 自动切换到下一个未驯服的药灵
        this.switchToNextSpirit();
      }
    } else {
      this.emit({ type: 'answer_evaluated', payload: result });
    }

    this.notifyStateChange();
    return result;
  }

  private checkWaveComplete(): boolean {
    return this.state.spirits.every(s => s.state === 'tamed');
  }

  private async completeWave(): Promise<void> {
    this.emit({ type: 'wave_complete', payload: { wave: this.state.wave } });

    if (this.state.wave >= this.WAVES) {
      this.completeGame(true);
    } else {
      // 短暂延迟后进入下一波
      await new Promise(resolve => setTimeout(resolve, 2000));
      await this.startWave(this.state.wave + 1);
    }
  }

  private switchToNextSpirit(): void {
    const currentSpirit = this.state.spirits.find(s => s.id === this.state.activeSpiritId);
    if (currentSpirit) {
      currentSpirit.isActive = false;
    }

    const nextSpirit = this.state.spirits.find(s => s.state !== 'tamed');
    if (nextSpirit) {
      this.state.activeSpiritId = nextSpirit.id;
      nextSpirit.isActive = true;
      nextSpirit.state = 'asking';
    } else {
      this.state.activeSpiritId = null;
    }
  }

  // 激活特定药灵
  activateSpirit(spiritId: string): void {
    if (this.state.status !== 'playing') return;

    const spirit = this.state.spirits.find(s => s.id === spiritId);
    if (!spirit || spirit.state === 'tamed') return;

    // 取消当前激活
    const currentSpirit = this.state.spirits.find(s => s.id === this.state.activeSpiritId);
    if (currentSpirit) {
      currentSpirit.isActive = false;
    }

    // 激活新药灵
    this.state.activeSpiritId = spiritId;
    spirit.isActive = true;
    spirit.state = 'asking';

    this.notifyStateChange();
  }

  // 技能系统
  useSkill(skillId: string): boolean {
    const skill = this.state.skills.find(s => s.id === skillId);
    if (!skill || skill.currentCooldown > 0 || this.state.status !== 'playing') {
      return false;
    }

    skill.currentCooldown = skill.cooldown;

    // 应用技能效果
    switch (skill.effect.type) {
      case 'mentor_answer':
        // 自动填入答案（得分减半）
        const spirit = this.state.spirits.find(s => s.id === this.state.activeSpiritId);
        if (spirit) {
          const answer = spirit.question.acceptableAnswers[0];
          this.submitAnswer(answer); // 实际得分会在内部计算
        }
        break;
      case 'show_hint':
      case 'show_description':
        // UI层处理
        break;
    }

    this.emit({ type: 'skill_used', payload: { skillId, effect: skill.effect } });
    this.notifyStateChange();
    return true;
  }

  private updateSkillCooldowns(): void {
    this.state.skills.forEach(skill => {
      if (skill.currentCooldown > 0) {
        skill.currentCooldown--;
      }
    });
  }

  // 游戏结束
  private completeGame(victory: boolean): void {
    this.stopTimer();
    this.state.status = victory ? 'victory' : 'defeat';

    const result: BattleResult = {
      victory,
      score: this.state.score,
      maxCombo: this.state.maxCombo,
      wavesCleared: victory ? this.WAVES : this.state.wave - 1,
      timeElapsed: this.state.timeElapsed,
      tamedSpirits: this.state.spirits.filter(s => s.state === 'tamed').map(s => s.name),
      accuracy: this.calculateAccuracy(),
    };

    this.emit({ type: 'game_over', payload: result });
    this.notifyStateChange();
  }

  private calculateAccuracy(): number {
    const tamed = this.state.spirits.filter(s => s.state === 'tamed').length;
    return this.state.totalSpirits > 0 ? (tamed / this.state.totalSpirits) * 100 : 0;
  }

  // 获取状态
  getState(): BattleState {
    return { ...this.state };
  }

  // 更新输入文本
  setInputText(text: string): void {
    this.state.inputText = text;
    this.notifyStateChange();
  }

  // 清理
  destroy(): void {
    this.stopTimer();
    this.eventListeners = [];
  }
}

export default BattleEngine;
```

### Step 2: 更新测试

```typescript
// src/systems/battle/__tests__/BattleEngine.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BattleEngine } from '../BattleEngine';
import { Medicine } from '../../../types';

// Mock services
vi.mock('../../../services/ai/SpiritQuestionService', () => ({
  spiritQuestionService: {
    generateQuestionsBatch: vi.fn().mockResolvedValue([
      {
        id: 'q1',
        type: 'recall',
        question: '我记不清了...',
        acceptableAnswers: ['甘、辛，温'],
        hint: '提示',
        knowledgeType: 'properties',
      },
    ]),
    evaluateAnswer: vi.fn().mockResolvedValue({
      score: 4,
      isCorrect: true,
      feedback: '谢谢你！',
    }),
  },
}));

vi.mock('../../../services/ai/SpiritImageService', () => ({
  spiritImageService: {
    generateSpiritImages: vi.fn().mockResolvedValue({
      danggui: 'https://example.com/image.png',
    }),
  },
}));

describe('BattleEngine', () => {
  let engine: BattleEngine;

  const mockMedicines: Medicine[] = [
    {
      id: 'danggui',
      name: '当归',
      category: '补血药',
      properties: '甘、辛，温',
      meridian: '肝、心、脾',
      functions: ['补血活血'],
      applications: ['血虚萎黄'],
      pinyin: 'danggui',
    },
  ];

  beforeEach(() => {
    engine = new BattleEngine(mockMedicines);
  });

  it('should initialize with waiting status', () => {
    const state = engine.getState();
    expect(state.status).toBe('waiting');
    expect(state.spirits).toHaveLength(0);
  });

  it('should start game and generate spirits', async () => {
    await engine.start();
    const state = engine.getState();

    expect(state.status).toBe('playing');
    expect(state.spirits.length).toBeGreaterThan(0);
    expect(state.activeSpiritId).toBeTruthy();
  });

  it('should handle answer submission', async () => {
    await engine.start();

    const result = await engine.submitAnswer('甘、辛，温');

    expect(result).toBeTruthy();
    expect(result?.evaluation.isCorrect).toBe(true);
    expect(result?.newProgress).toBeGreaterThan(0);
  });

  it('should activate different spirit', async () => {
    await engine.start();
    const state = engine.getState();

    if (state.spirits.length > 1) {
      const secondSpirit = state.spirits[1];
      engine.activateSpirit(secondSpirit.id);

      const newState = engine.getState();
      expect(newState.activeSpiritId).toBe(secondSpirit.id);
      expect(secondSpirit.isActive).toBe(true);
    }
  });

  it('should track combo correctly', async () => {
    await engine.start();

    await engine.submitAnswer('甘、辛，温');
    const state1 = engine.getState();
    expect(state1.combo).toBe(1);

    // Mock wrong answer
    vi.mocked((await import('../../../services/ai/SpiritQuestionService')).spiritQuestionService.evaluateAnswer)
      .mockResolvedValueOnce({
        score: 2,
        isCorrect: false,
        feedback: '不对哦',
      });

    await engine.submitAnswer('错误答案');
    const state2 = engine.getState();
    expect(state2.combo).toBe(0);
  });
});
```

### Step 3: 运行测试并提交

```bash
cd /home/lixiang/Desktop/zhongyi_game/src
npm test -- src/systems/battle/__tests__/BattleEngine.test.ts
```

Expected: PASS

```bash
git add src/systems/battle/BattleEngine.ts
git add src/systems/battle/__tests__/BattleEngine.test.ts
git commit -m "feat(battle): refactor BattleEngine for MedicineSpirit system with AI evaluation"
```

---

## Task 5: 创建药灵角色组件

**Files:**
- Create: `src/components/battle/SpiritCharacter.tsx`
- Create: `src/components/battle/__tests__/SpiritCharacter.test.tsx`

**Context:** 展示药灵形象、漂浮动画、驯服进度。

### Step 1: 创建SpiritCharacter组件

```typescript
// src/components/battle/SpiritCharacter.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { MedicineSpirit } from '../../systems/battle/types';

interface SpiritCharacterProps {
  spirit: MedicineSpirit;
  onClick: () => void;
  isActive: boolean;
}

export const SpiritCharacter: React.FC<SpiritCharacterProps> = ({
  spirit,
  onClick,
  isActive,
}) => {
  const isTamed = spirit.state === 'tamed';

  // 漂浮动画
  const floatAnimation = {
    y: [0, -15, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
      delay: spirit.floatPhase,
    },
  };

  // 呼吸发光
  const glowAnimation = {
    boxShadow: isActive
      ? [
          '0 0 20px rgba(100,200,255,0.5)',
          '0 0 40px rgba(100,200,255,0.8)',
          '0 0 20px rgba(100,200,255,0.5)',
        ]
      : [
          '0 0 10px rgba(255,215,0,0.3)',
          '0 0 20px rgba(255,215,0,0.5)',
          '0 0 10px rgba(255,215,0,0.3)',
        ],
    transition: {
      duration: 2,
      repeat: Infinity,
    },
  };

  // 驯服动画
  const tamedAnimation = isTamed ? {
    scale: [1, 1.2, 0],
    opacity: [1, 1, 0],
    transition: { duration: 1 },
  } : {};

  return (
    <motion.div
      data-testid={`spirit-${spirit.id}`}
      className={`relative cursor-pointer transition-all duration-300 ${
        isActive ? 'scale-110 z-10' : 'opacity-70 hover:opacity-100'
      } ${isTamed ? 'pointer-events-none' : ''}`}
      animate={floatAnimation}
      onClick={onClick}
      style={{
        left: spirit.position.x,
        top: spirit.position.y,
        position: 'absolute',
      }}
    >
      {/* 激活光环 */}
      {isActive && (
        <motion.div
          data-testid="spirit-active-halo"
          className="absolute -inset-4 rounded-full border-4 border-blue-400"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      {/* 药灵形象容器 */}
      <motion.div
        data-testid="spirit-image-container"
        className={`relative w-24 h-24 rounded-full overflow-hidden border-4 ${
          isActive ? 'border-blue-400' : 'border-yellow-400'
        } ${isTamed ? 'border-green-400' : ''}`}
        animate={glowAnimation}
        style={{
          boxShadow: isActive
            ? '0 0 30px rgba(100,200,255,0.6)'
            : '0 0 20px rgba(255,215,0,0.4)',
        }}
      >
        {/* 药灵图片 */}
        <img
          data-testid="spirit-image"
          src={spirit.imageUrl}
          alt={spirit.name}
          className="w-full h-full object-cover"
        />

        {/* 驯服标记 */}
        {isTamed && (
          <motion.div
            data-testid="spirit-tamed-mark"
            className="absolute inset-0 flex items-center justify-center bg-green-500/80"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <span className="text-4xl">✓</span>
          </motion.div>
        )}
      </motion.div>

      {/* 药灵名称 */}
      <div
        data-testid="spirit-name"
        className={`absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-full text-sm font-medium ${
          isActive ? 'bg-blue-500 text-white' : 'bg-gray-800/80 text-white'
        }`}
      >
        {spirit.name}
      </div>

      {/* 驯服进度条 */}
      {!isTamed && (
        <div
          data-testid="spirit-progress"
          className="absolute -bottom-14 left-1/2 -translate-x-1/2 w-20"
        >
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              data-testid="spirit-progress-bar"
              className="h-full bg-gradient-to-r from-yellow-400 to-green-400"
              initial={{ width: 0 }}
              animate={{ width: `${spirit.tameProgress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="text-center text-xs text-gray-400 mt-1">
            {spirit.tameProgress}%
          </div>
        </div>
      )}

      {/* 连接线（指向问题泡泡） */}
      {isActive && (
        <motion.div
          data-testid="spirit-connector"
          className="absolute top-full left-1/2 w-0.5 h-20 bg-gradient-to-b from-blue-400 to-transparent"
          initial={{ height: 0 }}
          animate={{ height: 80 }}
        />
      )}
    </motion.div>
  );
};

export default SpiritCharacter;
```

### Step 2: 编写测试

```typescript
// src/components/battle/__tests__/SpiritCharacter.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SpiritCharacter } from '../SpiritCharacter';
import { MedicineSpirit } from '../../../systems/battle/types';

const mockSpirit: MedicineSpirit = {
  id: 'spirit_1',
  medicineId: 'danggui',
  name: '当归灵',
  displayName: '当归',
  imageUrl: 'https://example.com/image.png',
  difficulty: 'normal',
  personality: 'gentle',
  position: { x: 100, y: 100 },
  tameProgress: 50,
  state: 'floating',
  isActive: false,
  floatPhase: 0,
  question: {
    id: 'q1',
    type: 'recall',
    question: '我记不清了...',
    acceptableAnswers: ['甘、辛，温'],
    hint: '提示',
    knowledgeType: 'properties',
  },
};

describe('SpiritCharacter', () => {
  it('should render spirit image and name', () => {
    render(<SpiritCharacter spirit={mockSpirit} onClick={vi.fn()} isActive={false} />);

    expect(screen.getByTestId('spirit-image')).toBeInTheDocument();
    expect(screen.getByTestId('spirit-name')).toHaveTextContent('当归灵');
  });

  it('should show active state styling', () => {
    render(<SpiritCharacter spirit={mockSpirit} onClick={vi.fn()} isActive={true} />);

    expect(screen.getByTestId('spirit-active-halo')).toBeInTheDocument();
    expect(screen.getByTestId('spirit-connector')).toBeInTheDocument();
  });

  it('should show tame progress bar', () => {
    render(<SpiritCharacter spirit={mockSpirit} onClick={vi.fn()} isActive={false} />);

    expect(screen.getByTestId('spirit-progress')).toBeInTheDocument();
    expect(screen.getByTestId('spirit-progress-bar')).toHaveStyle({ width: '50%' });
  });

  it('should show tamed state', () => {
    const tamedSpirit = { ...mockSpirit, state: 'tamed', tameProgress: 100 };
    render(<SpiritCharacter spirit={tamedSpirit} onClick={vi.fn()} isActive={false} />);

    expect(screen.getByTestId('spirit-tamed-mark')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const onClick = vi.fn();
    render(<SpiritCharacter spirit={mockSpirit} onClick={onClick} isActive={false} />);

    fireEvent.click(screen.getByTestId(`spirit-${mockSpirit.id}`));
    expect(onClick).toHaveBeenCalled();
  });
});
```

### Step 3: 运行测试并提交

```bash
cd /home/lixiang/Desktop/zhongyi_game/src
npm test -- src/components/battle/__tests__/SpiritCharacter.test.tsx
```

Expected: PASS

```bash
git add src/components/battle/SpiritCharacter.tsx
git add src/components/battle/__tests__/SpiritCharacter.test.tsx
git commit -m "feat(spirit): add SpiritCharacter component with floating animation and tame progress"
```

---

## Task 6: 创建问题泡泡组件

**Files:**
- Create: `src/components/battle/QuestionBubble.tsx`
- Create: `src/components/battle/__tests__/QuestionBubble.test.tsx`

### Step 1: 创建QuestionBubble组件

```typescript
// src/components/battle/QuestionBubble.tsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SpiritQuestion, AnswerEvaluation } from '../../systems/battle/types';

interface QuestionBubbleProps {
  spiritName: string;
  question: SpiritQuestion;
  evaluation: AnswerEvaluation | null;
  showHint: boolean;
}

export const QuestionBubble: React.FC<QuestionBubbleProps> = ({
  spiritName,
  question,
  evaluation,
  showHint,
}) => {
  const getBubbleColor = () => {
    if (!evaluation) return 'bg-white';
    return evaluation.isCorrect ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400';
  };

  return (
    <motion.div
      data-testid="question-bubble"
      className={`relative max-w-md mx-auto p-6 rounded-2xl border-2 shadow-lg ${getBubbleColor()}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* 药灵名称 */}
      <div data-testid="bubble-spirit-name" className="flex items-center gap-2 mb-3">
        <span className="text-2xl">👻</span>
        <span className="font-bold text-lg text-gray-800">{spiritName}</span>
      </div>

      {/* 问题文本 */}
      <div data-testid="bubble-question" className="text-gray-700 text-lg mb-4 leading-relaxed">
        💬 "{question.question}"
      </div>

      {/* 选择型选项 */}
      {question.type === 'choice' && question.options && (
        <div data-testid="bubble-options" className="grid grid-cols-2 gap-2 mb-4">
          {question.options.map((option, index) => (
            <div
              key={index}
              className="p-2 bg-gray-100 rounded-lg text-center text-sm"
            >
              {String.fromCharCode(65 + index)}. {option}
            </div>
          ))}
        </div>
      )}

      {/* 提示 */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            data-testid="bubble-hint"
            className="p-3 bg-yellow-50 rounded-lg text-sm text-yellow-800 mb-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            💡 {question.hint}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 答案反馈 */}
      <AnimatePresence>
        {evaluation && (
          <motion.div
            data-testid="bubble-feedback"
            className={`p-4 rounded-lg mb-4 ${
              evaluation.isCorrect ? 'bg-green-100' : 'bg-red-100'
            }`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{evaluation.isCorrect ? '✅' : '❌'}</span>
              <span className="font-bold">
                {evaluation.isCorrect ? '回答正确！' : '回答错误'}
              </span>
              <span className="text-sm text-gray-600">({evaluation.score}/5分)</span>
            </div>
            <p className="text-gray-700">{evaluation.feedback}</p>
            {evaluation.bonusInfo && (
              <p className="text-sm text-blue-600 mt-2">📚 {evaluation.bonusInfo}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default QuestionBubble;
```

### Step 2: 编写测试

```typescript
// src/components/battle/__tests__/QuestionBubble.test.tsx

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuestionBubble } from '../QuestionBubble';
import { SpiritQuestion, AnswerEvaluation } from '../../../systems/battle/types';

const mockQuestion: SpiritQuestion = {
  id: 'q1',
  type: 'recall',
  question: '我记不清了...我的性味是什么？',
  acceptableAnswers: ['甘、辛，温'],
  hint: '提示信息',
  knowledgeType: 'properties',
};

describe('QuestionBubble', () => {
  it('should render spirit name and question', () => {
    render(
      <QuestionBubble
        spiritName="当归灵"
        question={mockQuestion}
        evaluation={null}
        showHint={false}
      />
    );

    expect(screen.getByTestId('bubble-spirit-name')).toHaveTextContent('当归灵');
    expect(screen.getByTestId('bubble-question')).toHaveTextContent('我记不清了');
  });

  it('should show hint when enabled', () => {
    render(
      <QuestionBubble
        spiritName="当归灵"
        question={mockQuestion}
        evaluation={null}
        showHint={true}
      />
    );

    expect(screen.getByTestId('bubble-hint')).toHaveTextContent('提示信息');
  });

  it('should show correct evaluation feedback', () => {
    const evaluation: AnswerEvaluation = {
      score: 5,
      isCorrect: true,
      feedback: '完美回答！',
      bonusInfo: '当归是补血圣药',
    };

    render(
      <QuestionBubble
        spiritName="当归灵"
        question={mockQuestion}
        evaluation={evaluation}
        showHint={false}
      />
    );

    expect(screen.getByTestId('bubble-feedback')).toHaveTextContent('完美回答');
    expect(screen.getByTestId('bubble-feedback')).toHaveTextContent('5/5分');
  });

  it('should show options for choice type question', () => {
    const choiceQuestion: SpiritQuestion = {
      ...mockQuestion,
      type: 'choice',
      options: ['选项A', '选项B', '选项C', '选项D'],
    };

    render(
      <QuestionBubble
        spiritName="当归灵"
        question={choiceQuestion}
        evaluation={null}
        showHint={false}
      />
    );

    expect(screen.getByTestId('bubble-options')).toBeInTheDocument();
    expect(screen.getByText('A. 选项A')).toBeInTheDocument();
  });
});
```

### Step 3: 运行测试并提交

```bash
cd /home/lixiang/Desktop/zhongyi_game/src
npm test -- src/components/battle/__tests__/QuestionBubble.test.tsx
```

Expected: PASS

```bash
git add src/components/battle/QuestionBubble.tsx
git add src/components/battle/__tests__/QuestionBubble.test.tsx
git commit -m "feat(spirit): add QuestionBubble component with feedback display"
```

---

## Task 7: 重构BattleScene主组件

**Files:**
- Modify: `src/components/battle/BattleScene.tsx`
- Modify: `src/components/battle/__tests__/BattleScene.test.tsx`

**Context:** 整合新组件，实现完整战斗场景。

### Step 1: 重构BattleScene

```typescript
// src/components/battle/BattleScene.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BattleEngine } from '../../systems/battle/BattleEngine';
import { BattleState, AnswerEvaluation } from '../../systems/battle/types';
import { Medicine } from '../../types';
import { SpiritCharacter } from './SpiritCharacter';
import { QuestionBubble } from './QuestionBubble';
import { SpiritSkillBar } from './SpiritSkillBar';
import { GameTutorial } from './GameTutorial';

interface BattleSceneProps {
  medicines: Medicine[];
  onComplete: (result: {
    victory: boolean;
    score: number;
    maxCombo: number;
    tamedSpirits: string[];
  }) => void;
  onExit: () => void;
}

export const BattleScene: React.FC<BattleSceneProps> = ({
  medicines,
  onComplete,
  onExit,
}) => {
  const [engine] = useState(() => new BattleEngine(medicines));
  const [state, setState] = useState<BattleState>(engine.getState());
  const [showTutorial, setShowTutorial] = useState(true);
  const [inputText, setInputText] = useState('');
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 订阅状态更新
  useEffect(() => {
    const handleStateChange = () => {
      setState(engine.getState());
    };

    engine.subscribe(handleStateChange);
    return () => {
      engine.unsubscribe(handleStateChange);
      engine.destroy();
    };
  }, [engine]);

  // 监听游戏结束
  useEffect(() => {
    if (state.status === 'victory' || state.status === 'defeat') {
      setTimeout(() => {
        onComplete({
          victory: state.status === 'victory',
          score: state.score,
          maxCombo: state.maxCombo,
          tamedSpirits: state.spirits.filter(s => s.state === 'tamed').map(s => s.name),
        });
      }, 2000);
    }
  }, [state.status, state.score, state.maxCombo, state.spirits, onComplete]);

  // 激活药灵
  const handleSpiritClick = useCallback((spiritId: string) => {
    engine.activateSpirit(spiritId);
    setInputText('');
    setShowHint(false);
    inputRef.current?.focus();
  }, [engine]);

  // 提交答案
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    await engine.submitAnswer(inputText.trim());
    setInputText('');
  }, [engine, inputText]);

  // 使用技能
  const handleUseSkill = useCallback((skillId: string) => {
    if (skillId === 'hint_flash') {
      setShowHint(true);
    }
    engine.useSkill(skillId);
  }, [engine]);

  // 获取当前激活的药灵
  const activeSpirit = state.spirits.find(s => s.id === state.activeSpiritId);

  return (
    <div data-testid="battle-scene" className="relative w-full h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-900 overflow-hidden">
      {/* 顶部导航 */}
      <div data-testid="battle-header" className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20">
        <button
          onClick={onExit}
          className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white"
        >
          🏠 返回
        </button>
        <h1 className="text-xl font-bold text-white">
          药灵驯服战 - 第{state.wave}/{state.totalWaves}波
        </h1>
        <div className="px-4 py-2 bg-yellow-500/80 rounded-lg text-white">
          💊 药囊: {state.tamedCount}/{state.totalSpirits}
        </div>
      </div>

      {/* 游戏引导 */}
      <AnimatePresence>
        {showTutorial && (
          <GameTutorial onClose={() => {
            setShowTutorial(false);
            engine.start();
          }} />
        )}
      </AnimatePresence>

      {/* 药灵区域 */}
      <div data-testid="spirits-area" className="absolute top-20 left-0 right-0 h-1/2">
        {state.spirits.map((spirit, index) => (
          <SpiritCharacter
            key={spirit.id}
            spirit={spirit}
            isActive={spirit.id === state.activeSpiritId}
            onClick={() => handleSpiritClick(spirit.id)}
          />
        ))}
      </div>

      {/* 问题泡泡区域 */}
      <div data-testid="question-area" className="absolute top-1/2 left-0 right-0 flex justify-center px-4">
        {activeSpirit && (
          <QuestionBubble
            spiritName={activeSpirit.name}
            question={activeSpirit.question}
            evaluation={state.lastEvaluation}
            showHint={showHint}
          />
        )}
      </div>

      {/* 输入区域 */}
      <div data-testid="input-area" className="absolute bottom-32 left-0 right-0 px-8">
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="relative">
            <input
              ref={inputRef}
              data-testid="battle-input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={activeSpirit ? "输入你的答案..." : "点击药灵开始回答"}
              disabled={!activeSpirit || state.status !== 'playing'}
              className="w-full px-6 py-4 text-lg rounded-2xl border-2 border-blue-400 bg-white/90 focus:outline-none focus:ring-4 focus:ring-blue-400/50 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || !activeSpirit}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50"
            >
              提交
            </button>
          </div>
          <p className="text-center text-white/60 text-sm mt-2">
            按 Enter 提交答案
          </p>
        </form>
      </div>

      {/* 技能栏 */}
      <div data-testid="skill-area" className="absolute bottom-8 left-8">
        <SpiritSkillBar
          skills={state.skills}
          onUseSkill={handleUseSkill}
        />
      </div>

      {/* 状态栏 */}
      <div data-testid="status-bar" className="absolute bottom-8 right-8 flex gap-6 text-white">
        <div className="bg-white/20 px-4 py-2 rounded-lg">
          <span className="text-yellow-400">连击:</span> {state.combo}
        </div>
        <div className="bg-white/20 px-4 py-2 rounded-lg">
          <span className="text-green-400">得分:</span> {state.score}
        </div>
        <div className="bg-white/20 px-4 py-2 rounded-lg">
          <span className="text-blue-400">波次:</span> {state.wave}/{state.totalWaves}
        </div>
        <div className="bg-white/20 px-4 py-2 rounded-lg">
          <span className="text-purple-400">⏱️</span> {Math.floor(state.timeElapsed / 60)}:{String(state.timeElapsed % 60).padStart(2, '0')}
        </div>
      </div>

      {/* 游戏结束覆盖层 */}
      <AnimatePresence>
        {(state.status === 'victory' || state.status === 'defeat') && (
          <motion.div
            data-testid="game-over-overlay"
            className="absolute inset-0 flex items-center justify-center bg-black/70 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className={`text-center p-8 rounded-2xl ${
                state.status === 'victory' ? 'bg-green-500' : 'bg-red-500'
              }`}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
            >
              <h2 className="text-4xl font-bold text-white mb-4">
                {state.status === 'victory' ? '🎉 驯服成功！' : '💔 驯服失败'}
              </h2>
              <p className="text-white text-xl">最终得分: {state.score}</p>
              <p className="text-white">最大连击: {state.maxCombo}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BattleScene;
```

### Step 2: 创建SpiritSkillBar组件

```typescript
// src/components/battle/SpiritSkillBar.tsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SpiritSkill } from '../../systems/battle/types';

interface SpiritSkillBarProps {
  skills: SpiritSkill[];
  onUseSkill: (skillId: string) => void;
}

export const SpiritSkillBar: React.FC<SpiritSkillBarProps> = ({
  skills,
  onUseSkill,
}) => {
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  return (
    <div data-testid="spirit-skill-bar" className="flex gap-3">
      {skills.map((skill) => (
        <motion.button
          key={skill.id}
          data-testid={`skill-${skill.id}`}
          className={`relative w-16 h-16 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
            skill.currentCooldown > 0
              ? 'bg-gray-700 border-gray-600 cursor-not-allowed'
              : 'bg-blue-600 border-blue-400 hover:bg-blue-500 cursor-pointer'
          }`}
          onClick={() => skill.currentCooldown === 0 && onUseSkill(skill.id)}
          onMouseEnter={() => setHoveredSkill(skill.id)}
          onMouseLeave={() => setHoveredSkill(null)}
          whileHover={skill.currentCooldown === 0 ? { scale: 1.1 } : {}}
          whileTap={skill.currentCooldown === 0 ? { scale: 0.95 } : {}}
        >
          <span className="text-2xl">{skill.icon}</span>

          {/* 冷却显示 */}
          {skill.currentCooldown > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
              <span className="text-white font-bold">{skill.currentCooldown}s</span>
            </div>
          )}

          {/* 技能提示 */}
          <AnimatePresence>
            {hoveredSkill === skill.id && (
              <motion.div
                data-testid={`skill-tooltip-${skill.id}`}
                className="absolute bottom-full mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg whitespace-nowrap z-10"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <div className="font-bold">{skill.name}</div>
                <div className="text-gray-300 text-xs">{skill.description}</div>
                <div className="text-yellow-400 text-xs">冷却: {skill.cooldown}s</div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      ))}
    </div>
  );
};

export default SpiritSkillBar;
```

### Step 3: 创建GameTutorial组件

```typescript
// src/components/battle/GameTutorial.tsx

import React from 'react';
import { motion } from 'framer-motion';

interface GameTutorialProps {
  onClose: () => void;
}

export const GameTutorial: React.FC<GameTutorialProps> = ({ onClose }) => {
  return (
    <motion.div
      data-testid="game-tutorial"
      className="absolute inset-0 flex items-center justify-center bg-black/80 z-50 p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="max-w-2xl bg-white rounded-2xl p-8 shadow-2xl"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
      >
        <h2 className="text-3xl font-bold text-center mb-6 text-indigo-600">
          🌿 药灵驯服战 🌿
        </h2>

        <p className="text-gray-600 mb-6 text-center">
          欢迎来到药灵山谷！这里的药灵们修炼太久，渐渐忘记了自己的属性。
          你需要回答它们的问题，帮助它们恢复记忆。
        </p>

        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-4">
            <span className="text-2xl">👻</span>
            <div>
              <h3 className="font-bold">点击药灵</h3>
              <p className="text-gray-600">点击悬浮的药灵，激活它的问题</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <span className="text-2xl">💬</span>
            <div>
              <h3 className="font-bold">回答问题</h3>
              <p className="text-gray-600">根据药灵的问题输入答案，AI会评判你的回答质量（1-5分）</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <span className="text-2xl">🌟</span>
            <div>
              <h3 className="font-bold">驯服药灵</h3>
              <p className="text-gray-600">得分越高驯服进度越快，满100%即可驯服药灵</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="font-bold">使用技能</h3>
              <p className="text-gray-600">遇到困难时使用技能获取提示（有冷却时间）</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg mb-6">
          <h3 className="font-bold text-yellow-800 mb-2">💡 小技巧</h3>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li>• 自由回答型问题答得好可以获得高分</li>
            <li>• 连击可以获得额外得分加成</li>
            <li>• 药灵问的是自己失忆的属性，不是让你猜它是谁</li>
          </ul>
        </div>

        <button
          onClick={onClose}
          className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors"
        >
          开始驯服药灵！
        </button>
      </motion.div>
    </motion.div>
  );
};

export default GameTutorial;
```

### Step 4: 运行测试并提交

```bash
cd /home/lixiang/Desktop/zhongyi_game/src
npm run type-check
```

Expected: PASS

```bash
git add src/components/battle/BattleScene.tsx
git add src/components/battle/SpiritSkillBar.tsx
git add src/components/battle/GameTutorial.tsx
git commit -m "feat(battle): refactor BattleScene with MedicineSpirit system and tutorial"
```

---

## Task 8: 端到端测试

**Files:**
- Create: `src/tests/ai/spirit-battle.test.ts`

### Step 1: 创建E2E测试

```typescript
// src/tests/ai/spirit-battle.test.ts

import { AITestCase } from './ai-tester';

export const spiritBattleTestCases: AITestCase[] = [
  {
    id: 'SPIRIT-001',
    name: '药灵驯服战基础流程测试',
    description: '测试完整的药灵驯服流程：激活药灵、回答问题、驯服完成',
    category: 'battle',
    steps: [
      {
        id: 'step-1',
        action: 'navigate',
        value: '/chapter/ch1?stage=2',
        description: '导航到战斗阶段',
        expected: 'selector:[data-testid="battle-scene"]',
      },
      {
        id: 'step-2',
        action: 'wait',
        duration: 1000,
        description: '等待教程出现',
        expected: 'selector:[data-testid="game-tutorial"]',
      },
      {
        id: 'step-3',
        action: 'click',
        target: 'button:has-text("开始驯服药灵")',
        description: '关闭教程开始游戏',
        expected: '',
      },
      {
        id: 'step-4',
        action: 'wait',
        duration: 2000,
        description: '等待药灵生成',
        expected: 'selector:[data-testid="spirits-area"]',
      },
      {
        id: 'step-5',
        action: 'evaluate',
        value: `
          const spirits = document.querySelectorAll('[data-testid^="spirit-"]');
          return { spiritCount: spirits.length };
        `,
        description: '检查药灵数量',
        expected: 'text:spiritCount',
      },
      {
        id: 'step-6',
        action: 'click',
        target: '[data-testid^="spirit-"]:first',
        description: '点击第一个药灵',
        expected: 'selector:[data-testid="question-bubble"]',
      },
      {
        id: 'step-7',
        action: 'evaluate',
        value: `
          const bubble = document.querySelector('[data-testid="question-bubble"]');
          const question = bubble?.querySelector('[data-testid="bubble-question"]')?.textContent;
          return { hasQuestion: !!question, question };
        `,
        description: '验证问题显示',
        expected: 'text:hasQuestion',
      },
      {
        id: 'step-8',
        action: 'type',
        target: '[data-testid="battle-input"]',
        value: '甘、辛，温',
        description: '输入答案',
        expected: '',
      },
      {
        id: 'step-9',
        action: 'click',
        target: 'button[type="submit"]',
        description: '提交答案',
        expected: '',
      },
      {
        id: 'step-10',
        action: 'wait',
        duration: 2000,
        description: '等待AI评判',
        expected: 'selector:[data-testid="bubble-feedback"]',
      },
    ],
    expectedResults: [
      '药灵正确显示并带有漂浮动画',
      '点击药灵后问题泡泡正确显示',
      '输入答案后AI反馈正确显示',
      '驯服进度条随回答更新',
    ],
    successCriteria: [
      { type: 'functional', description: '药灵驯服流程正常工作', weight: 40 },
      { type: 'visual', description: '动画和特效正常', weight: 30 },
      { type: 'performance', description: 'AI评判响应<3秒', weight: 30 },
    ],
  },
];

export default spiritBattleTestCases;
```

### Step 2: 提交

```bash
git add src/tests/ai/spirit-battle.test.ts
git commit -m "test(spirit): add E2E tests for MedicineSpirit battle system"
```

---

## 自审检查

### 1. 规范覆盖检查

| 规范要求 | 任务覆盖 |
|---------|---------|
| MedicineSpirit类型 | Task 1 ✓ |
| AI药灵形象生成 | Task 2 ✓ |
| LLM问题生成 | Task 3 ✓ |
| AI答案评判 | Task 3 ✓ |
| 药灵漂浮动画 | Task 5 ✓ |
| 驯服进度条 | Task 5 ✓ |
| 问题泡泡 | Task 6 ✓ |
| 技能系统 | Task 4, 7 ✓ |
| 游戏引导 | Task 7 ✓ |

### 2. Placeholder扫描
- 无TBD/TODO
- 无"后续实现"等模糊描述
- 所有步骤都有具体代码

### 3. 类型一致性
- `MedicineSpirit`类型统一
- `AnswerEvaluation`类型统一
- `SpiritSkill`类型统一

---

## 执行方式选择

**计划完成并保存到 `docs/superpowers/plans/2026-03-28-yaoling-taming-battle-plan.md`。

**两种执行方式可选：**

**1. Subagent-Driven（推荐）** - 每个任务分配给一个子代理执行，我在每个任务后审查

**2. Inline Execution** - 在当前会话中批量执行任务

推荐使用 **Subagent-Driven**，因为：
- 任务之间有依赖关系（类型定义 → 服务 → 引擎 → UI）
- 需要验证每个任务后再进行下一个
- AI生图和LLM调用需要验证

**请选择执行方式。**

# AI集成设计

## 1. 设计原则

### 1.1 离线优先 + AI增强

```
┌─────────────────────────────────────────────────────────┐
│                   AI集成架构                             │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────┐      ┌──────────────────┐        │
│  │   本地数据        │      │   AI生成内容      │        │
│  │   (Offline)      │◄────►│   (On-demand)    │        │
│  ├──────────────────┤      ├──────────────────┤        │
│  │ · 50味药材基础   │      │ · 病案动态生成   │        │
│  │ · 20方剂基础     │      │ · 题目智能生成   │        │
│  │ · 章节结构       │      │ · 对话自然生成   │        │
│  │ · 用户进度       │      │ · 事件随机生成   │        │
│  └──────────────────┘      └──────────────────┘        │
│           ▲                         ▲                   │
│           │                         │                   │
│           └──────────┬──────────────┘                   │
│                      │                                  │
│            ┌─────────┴─────────┐                       │
│            │   缓存策略         │                       │
│            │   (LRU + 预生成)   │                       │
│            └───────────────────┘                       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 1.2 数据分层策略

| 层级 | 内容 | 存储位置 | 生成方式 |
|------|------|----------|----------|
| **核心数据** | 50味药、20方剂、章节结构 | 本地JSON | 预置 |
| **用户数据** | 进度、对话历史、收集记录 | LocalStorage | 运行时 |
| **AI生成数据** | 病案、题目、事件、对话 | 内存+缓存 | AI实时生成 |
| **缓存数据** | 最近使用的内容 | LocalStorage | 缓存策略 |

## 2. AI服务架构

### 2.1 服务层设计

```typescript
// services/ai/aiService.ts
export class AIService {
  private cache: LRUCache<string, any>;
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.cache = new LRUCache({ max: 100, ttl: 1000 * 60 * 60 }); // 1小时缓存
    this.config = config;
  }

  // ========== 核心生成方法 ==========

  /**
   * 生成病案
   * 根据方剂动态生成临床病案
   */
  async generateClinicalCase(formulaId: string): Promise<ClinicalCase> {
    const cacheKey = `case_${formulaId}`;

    // 1. 检查缓存
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    // 2. 获取方剂信息
    const formula = await this.getFormula(formulaId);

    // 3. 构建Prompt
    const prompt = this.buildCasePrompt(formula);

    // 4. 调用AI生成
    const response = await this.callAI(prompt);

    // 5. 解析并验证
    const clinicalCase = this.parseCaseResponse(response);

    // 6. 存入缓存
    this.cache.set(cacheKey, clinicalCase);

    return clinicalCase;
  }

  /**
   * 生成题目
   * 根据学习进度智能出题
   */
  async generateQuestion(context: QuestionContext): Promise<Question> {
    // 1. 构建上下文感知的Prompt
    const prompt = this.buildQuestionPrompt(context);

    // 2. 调用AI
    const response = await this.callAI(prompt);

    // 3. 解析题目
    const question = this.parseQuestionResponse(response);

    // 4. 验证题目质量
    if (!this.validateQuestion(question, context)) {
      // 质量不合格，重新生成
      return this.generateQuestion(context);
    }

    return question;
  }

  /**
   * 苏格拉底式引导
   * 根据错误答案给出引导
   */
  async socraticGuide(context: GuideContext): Promise<GuideResponse> {
    const prompt = this.buildSocraticPrompt(context);
    const response = await this.callAI(prompt);
    return this.parseGuideResponse(response);
  }

  /**
   * 生成导师对话
   * 自然、情境化的对话
   */
  async generateDialogue(context: DialogueContext): Promise<DialogueResponse> {
    const prompt = this.buildDialoguePrompt(context);
    const response = await this.callAI(prompt);
    return this.parseDialogueResponse(response);
  }

  /**
   * 生成开放世界事件
   */
  async generateEvent(context: EventContext): Promise<GameEvent> {
    const prompt = this.buildEventPrompt(context);
    const response = await this.callAI(prompt);
    return this.parseEventResponse(response);
  }

  // ========== 私有方法 ==========

  private async callAI(prompt: string): Promise<string> {
    // 调用GLM-4 API
    const response = await fetch(this.config.apiEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'glm-4',
        messages: [{ role: 'system', content: prompt }],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  }
}
```

### 2.2 预生成策略

```typescript
// services/ai/prefetchService.ts
export class PrefetchService {
  private aiService: AIService;

  /**
   * 预生成即将需要的内容
   * 在空闲时或章节加载时调用
   */
  async prefetchChapterContent(chapterId: string): Promise<void> {
    const chapter = await getChapter(chapterId);

    // 并行预生成
    await Promise.all([
      // 预生成病案（2-3个）
      ...chapter.formulas.map(fid =>
        this.aiService.generateClinicalCase(fid)
      ),

      // 预生成题目（每个药材2题）
      ...chapter.medicines.map(mid =>
        this.generateMedicineQuestions(mid, 2)
      ),

      // 预生成对话开场白
      this.aiService.generateDialogue({
        type: 'chapter_intro',
        chapterId,
      }),
    ]);
  }

  /**
   * 后台持续预生成
   * 利用游戏空闲时间
   */
  async backgroundPrefetch(playerProgress: PlayerProgress): Promise<void> {
    // 根据学习进度预测下一步需要什么
    const nextChapter = this.predictNextChapter(playerProgress);

    if (nextChapter) {
      await this.prefetchChapterContent(nextChapter.id);
    }
  }
}
```

## 3. Prompt模板

### 3.1 病案生成Prompt

```typescript
const CLINICAL_CASE_PROMPT = `
你是中医临床病案生成专家。
请根据以下方剂信息，生成一个典型的临床病案。

【方剂信息】
方名：{formulaName}
组成：{composition}
功效：{functions}
主治：{indications}

【输出格式】
请严格按照以下JSON格式输出：
{
  "patientInfo": {
    "gender": "male|female",
    "age": 25-65之间的数字,
    "occupation": "职业",
    "chiefComplaint": "主诉"
  },
  "symptoms": [
    "症状1（不少于4条）",
    "症状2",
    "..."
  ],
  "tongue": "舌象描述",
  "pulse": "脉象描述",
  "correctAnswer": {
    "treatment": "治法",
    "formula": "方剂名",
    "junMedicine": "君药"
  },
  "explanation": "详细解析，说明辨证思路和选方依据"
}

【要求】
1. 症状要典型，符合该方剂主治
2. 舌脉要与证型相符
3. 患者背景要有故事性
4. 难度适中，有干扰性但不迷惑
5. 解释要详细，有教育意义
`;
```

### 3.2 题目生成Prompt

```typescript
const QUESTION_GENERPT_PROMPT = `
你是中医教育出题专家。
请根据以下学习上下文，生成一道合适的题目。

【学习上下文】
当前章节：{chapterName}
已学药材：{collectedMedicines}
当前目标：{targetMedicine}
已出题：{askedQuestions}
错题历史：{wrongHistory}

【输出格式】
{
  "questionId": "唯一ID",
  "type": "identification|property|comparison|formula|clinical",
  "difficulty": 1-5,
  "question": "题目内容（自然对话形式）",
  "interactionMode": "choice|open|socratic",
  "options": ["选项A", "选项B", "选项C", "选项D"], // 选择题时
  "expectedAnswers": ["正确答案1", "正确答案2"],
  "hints": ["提示1", "提示2"],
  "reference": "引用经典（可选）",
  "knowledgePoints": ["知识点1", "知识点2"]
}

【出题原则】
1. 不要重复已出过的题目
2. 优先覆盖未学过的知识点
3. 根据已学药材出对比题
4. 难度适合当前章节
5. 要有趣味性，避免死记硬背
`;
```

### 3.3 导师对话Prompt

```typescript
const MENTOR_DIALOGUE_PROMPT = `
你是青木先生，药灵山谷的守谷人，一位活了三百岁的老中医。
你正在教导一位学徒学习中医。

【当前情境】
章节：{chapterName}
阶段：{stage} (intro|gathering|battle|formula|clinical)
已学药材：{collectedMedicines}
上一步：{previousAction}

【你的任务】
根据当前情境，生成自然的对话。

【输出格式】
{
  "speaker": "mentor",
  "content": "对话内容（温和、有耐心、引经据典但不死板）",
  "type": "greeting|question|feedback|hint|celebration",
  "emotion": "default|thinking|nodding|surprised|celebrating",
  "nextAction": "expected_player_response",
  "options": [ // 如果是选择题
    { "text": "选项内容", "value": "选项值" }
  ]
}

【说话风格】
- 开头常用："徒儿"、"小子/丫头"、"你"
- 引用经典时注明出处："《伤寒论》云..."
- 适当幽默："为师当年..."、"三百年前..."
- 鼓励为主："善！"、"不错！"、"再想想..."
`;
```

## 4. 缓存与存储

### 4.1 缓存策略

```typescript
// services/cache/aiCache.ts
export class AICache {
  private memoryCache: Map<string, CacheEntry>;
  private localStorageKey = 'ai_cache';

  constructor() {
    this.memoryCache = new Map();
    this.loadFromStorage();
  }

  /**
   * 获取缓存
   */
  get<T>(key: string): T | null {
    const entry = this.memoryCache.get(key);
    if (!entry) return null;

    // 检查过期
    if (Date.now() > entry.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * 设置缓存
   */
  set<T>(key: string, data: T, ttlMinutes: number = 60): void {
    const entry: CacheEntry = {
      data,
      createdAt: Date.now(),
      expiresAt: Date.now() + ttlMinutes * 60 * 1000,
    };

    this.memoryCache.set(key, entry);
    this.saveToStorage();
  }

  /**
   * 批量预缓存
   */
  prefetch(items: Array<{ key: string; data: any }>): void {
    items.forEach(item => {
      this.set(item.key, item.data, 24 * 60); // 缓存24小时
    });
  }

  /**
   * 清理过期缓存
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now > entry.expiresAt) {
        this.memoryCache.delete(key);
      }
    }
    this.saveToStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.localStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.memoryCache = new Map(Object.entries(parsed));
      }
    } catch (e) {
      console.error('加载AI缓存失败:', e);
    }
  }

  private saveToStorage(): void {
    try {
      const obj = Object.fromEntries(this.memoryCache.entries());
      localStorage.setItem(this.localStorageKey, JSON.stringify(obj));
    } catch (e) {
      console.error('保存AI缓存失败:', e);
    }
  }
}
```

### 4.2 对话历史存储

```typescript
// storage/conversationStorage.ts
export class ConversationStorage {
  private storageKey = 'conversations';

  /**
   * 保存对话轮次
   */
  saveTurn(chapterId: string, stage: number, turn: ConversationTurn): void {
    const key = `${this.storageKey}_${chapterId}_${stage}`;
    const existing = this.getTurns(chapterId, stage);

    existing.push(turn);

    // 限制存储数量（最近100条）
    if (existing.length > 100) {
      existing.shift();
    }

    localStorage.setItem(key, JSON.stringify(existing));
  }

  /**
   * 获取对话历史
   */
  getTurns(chapterId: string, stage: number): ConversationTurn[] {
    const key = `${this.storageKey}_${chapterId}_${stage}`;
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * 导出所有对话（用于AI上下文）
   */
  exportAll(): Record<string, ConversationTurn[]> {
    const result: Record<string, ConversationTurn[]> = {};

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.storageKey)) {
        try {
          const turns = JSON.parse(localStorage.getItem(key) || '[]');
          result[key] = turns;
        } catch {
          // 忽略解析错误
        }
      }
    }

    return result;
  }

  /**
   * 获取最近N条对话（用于AI上下文）
   */
  getRecentContext(chapterId: string, stage: number, count: number = 10): ConversationTurn[] {
    const turns = this.getTurns(chapterId, stage);
    return turns.slice(-count);
  }
}
```

## 5. 离线支持

### 5.1 离线模式检测

```typescript
// services/network/offlineManager.ts
export class OfflineManager {
  private isOffline: boolean = false;

  constructor() {
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  private handleOnline(): void {
    this.isOffline = false;
    // 恢复AI服务
    eventBus.emit('network:online');
  }

  private handleOffline(): void {
    this.isOffline = true;
    // 切换到离线模式
    eventBus.emit('network:offline');
  }

  /**
   * 获取当前网络状态
   */
  getStatus(): NetworkStatus {
    return {
      isOnline: navigator.onLine,
      isOfflineMode: this.isOffline,
    };
  }
}
```

### 5.2 离线降级策略

```typescript
// services/ai/offlineFallback.ts
export class OfflineFallback {
  private templateDB: Map<string, any>;

  constructor() {
    this.templateDB = new Map();
    this.loadTemplates();
  }

  /**
   * 离线时返回模板内容
   */
  getFallback(type: ContentType, params: any): any {
    switch (type) {
      case 'clinical_case':
        return this.getCaseTemplate(params.formulaId);
      case 'question':
        return this.getQuestionTemplate(params.medicineId);
      case 'dialogue':
        return this.getDialogueTemplate(params.stage);
      default:
        return this.getGenericFallback();
    }
  }

  private getCaseTemplate(formulaId: string): ClinicalCase {
    // 从预置模板返回
    return this.templateDB.get(`case_${formulaId}`) || this.generateGenericCase();
  }

  private loadTemplates(): void {
    // 加载预置的备用模板
    // 每个方剂至少有1个备用病案
    // 每味药至少有3个备用题目
  }
}
```

## 6. 性能优化

### 6.1 流式响应

```typescript
// services/ai/streamingAI.ts
export class StreamingAIService {
  /**
   * 流式生成对话
   * 打字机效果
   */
  async *streamDialogue(context: DialogueContext): AsyncGenerator<string> {
    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: { ... },
      body: JSON.stringify({
        ...payload,
        stream: true,  // 启用流式
      }),
    });

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // 解析SSE数据
      const chunk = new TextDecoder().decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;
            if (content) yield content;
          } catch {
            // 忽略解析错误
          }
        }
      }
    }
  }
}
```

### 6.2 请求合并

```typescript
// services/ai/batchAI.ts
export class BatchAIService {
  private pendingRequests: Map<string, Promise<any>>;

  /**
   * 合并相同请求
   */
  async request<T>(key: string, factory: () => Promise<T>): Promise<T> {
    // 如果已有相同请求在进行中，复用
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key) as Promise<T>;
    }

    // 创建新请求
    const promise = factory().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }
}
```

## 7. 质量监控

### 7.1 生成质量检测

```typescript
// services/ai/qualityCheck.ts
export class QualityChecker {
  /**
   * 检查病案质量
   */
  checkClinicalCase(caseData: ClinicalCase): QualityReport {
    const issues: string[] = [];

    // 检查症状数量
    if (caseData.symptoms.length < 4) {
      issues.push('症状描述不足');
    }

    // 检查舌脉合理性
    if (!this.isTonguePulseConsistent(caseData)) {
      issues.push('舌脉不符');
    }

    // 检查答案合理性
    if (!caseData.correctAnswer.formula) {
      issues.push('缺少方剂答案');
    }

    return {
      passed: issues.length === 0,
      issues,
      score: 100 - issues.length * 20,
    };
  }

  /**
   * 检查题目质量
   */
  checkQuestion(question: Question, context: QuestionContext): QualityReport {
    const issues: string[] = [];

    // 检查难度适配
    const expectedDifficulty = this.calculateExpectedDifficulty(context);
    if (Math.abs(question.difficulty - expectedDifficulty) > 1) {
      issues.push('难度不适配');
    }

    // 检查重复
    if (context.askedQuestions.includes(question.questionId)) {
      issues.push('题目重复');
    }

    // 检查知识点覆盖
    if (!this.coversNewKnowledge(question, context)) {
      issues.push('无新知识');
    }

    return {
      passed: issues.length === 0,
      issues,
      score: 100 - issues.length * 25,
    };
  }
}
```

---

*文档状态: 详细设计*
*核心: 离线优先，AI增强，轻量化数据*

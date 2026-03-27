# Phase 4: AI导师系统重构设计（AI-Native版）

> 文档版本: v2.0 - AI-Native重构
> 创建日期: 2026-03-26
> 核心理念: **AI完全自主驱动，零模板，结构化推理**

---

## 1. 核心设计转变

### 1.1 从"模板+AI润色"到"AI完全生成"

| 旧思维 | 新思维 |
|--------|--------|
| 预定义6步流程 | AI自主决定对话流向 |
| 模板+占位符填充 | AI实时生成个性化内容 |
| 离线降级到预置文本 | AI始终生成，失败时重试或简化 |
| 人工维护教学点列表 | AI动态判断覆盖度 |
| 代码控制状态机 | AI推理下一步最佳行动 |

### 1.2 架构核心原则

```
┌──────────────────────────────────────────────────────────────┐
│                    AI-Native架构                             │
│                                                               │
│   人类只定义：                                                 │
│   ✓ 角色设定（青木先生是谁）                                   │
│   ✓ 教学目标（本章要学4味药）                                  │
│   ✓ 约束边界（50-100字，温和耐心）                             │
│                                                               │
│   AI自主决定：                                                 │
│   ✓ 说什么内容                                                │
│   ✓ 用什么表情                                                │
│   ✓ 提供什么选项                                              │
│   ✓ 下一步讲什么                                              │
│   ✓ 何时进入下一阶段                                          │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. 唯一Prompt：导师推理引擎

不再为每个场景写Prompt，只有一个**导师推理Prompt**，让AI像真正的导师一样思考和决策。

```typescript
const MENTOR_REASONING_PROMPT = `你是青木先生，药灵山谷的守谷人，一位活了三百岁的老中医。
你正在引导一位学徒学习中医。请像真正的导师一样思考和行动。

【角色设定】
- 说话风格：温和、有耐心、偶尔幽默、引经据典
- 常用称呼："徒儿"、"小子/丫头"、偶尔"你"
- 个性特点：喜欢说"为师当年..."、"三百年前..."
- 教学方式：引导式而非灌输式，鼓励思考

【当前教学场景】
章节：${chapterTitle}
五行属性：${wuxing}
本章药材：${medicineNames.join('、')}

【对话历史】
${history.map(t => `${t.role === 'mentor' ? '青木先生' : '学徒'}：${t.content}`).join('\n')}

【已讨论话题】
${coveredTopics.join('、') || '无'}

【学徒上次选择】
${lastStudentChoice || '初次见面'}

【你的任务】
作为青木先生，请思考并决定：
1. 现在应该说什么？（考虑对话上下文和教学目标）
2. 用什么表情最合适？
3. 给学徒什么选择？（2-4个选项）
4. 是否已经覆盖了必要的教学内容？
5. 是否该结束本阶段，进入山谷采药？

【输出格式 - 必须是有效JSON】
{
  "thinking": "你的思考过程（为什么这样说）",
  "response": {
    "content": "你要说的话（50-100字，自然对话）",
    "emotion": "happy|thinking|surprised|concerned|celebrating",
    "reference": "引用的经典（可选，如《伤寒论》云...）"
  },
  "options": [
    {
      "id": "opt_1",
      "text": "选项文字（简洁，不超过8个字）",
      "intent": "continue|question|skip|complete_stage",
      "context": "这个选项的意图是什么"
    }
  ],
  "pedagogy": {
    "topicCovered": ["本次覆盖的新话题"],
    "teachingGoal": "本次对话的教学目的",
    "nextSuggestion": "建议下次讨论什么"
  },
  "stageControl": {
    "shouldComplete": false,
    "reason": "如果建议结束阶段，说明原因"
  }
}

【教学参考（AI需自觉遵守）】
- 本章有${medicineCount}味药需要介绍
- 每味药应介绍：名称、性味、主要功效
- 学徒可能完全不懂中医，从基础讲起
- 不要一次性说太多，保持对话感
- 在学徒表示"准备好了"或"了解了"时才考虑结束`;
```

### 2.1 AI输出结构详解

```typescript
interface MentorReasoningOutput {
  // AI的思考过程（可记录用于调试）
  thinking: string;

  // 实际展示给玩家的内容
  response: {
    content: string;       // 对话内容
    emotion: string;       // 表情（AI自主决定）
    reference?: string;    // 引用的经典（增加真实感）
  };

  // 提供给玩家的选项
  options: {
    id: string;
    text: string;          // 选项文字（AI生成，不预设）
    intent: string;        // 意图分类（AI判断）
    context: string;       // AI对选项的理解
  }[];

  // 教学元数据（AI自我评估）
  pedagogy: {
    topicCovered: string[];    // AI认为本次覆盖了哪些内容
    teachingGoal: string;      // AI认为本次的教学目的
    nextSuggestion: string;    // AI建议下一步
  };

  // 阶段控制（AI决定何时结束）
  stageControl: {
    shouldComplete: boolean;   // AI是否认为该结束了
    reason: string;            // AI的理由
  };
}
```

---

## 3. 极简状态管理

不再维护复杂的TodoList，只保留**对话历史和AI的覆盖度声明**。

### 3.1 精简状态结构

```typescript
interface MentorSession {
  // 会话基本信息
  sessionId: string;
  chapterId: string;
  startTime: number;

  // 唯一核心状态：对话历史
  history: DialogueTurn[];

  // AI自我报告的覆盖度（仅供参考）
  coveredTopics: string[];

  // 阶段是否完成（由AI判断或玩家强制）
  isCompleted: boolean;

  // 统计信息（用于分析）
  stats: {
    totalTurns: number;
    totalTokens: number;
    duration: number;
  };
}

interface DialogueTurn {
  id: string;
  timestamp: number;

  // 导师回合
  mentorContent?: string;
  mentorEmotion?: string;
  mentorReference?: string;
  mentorThinking?: string;    // 可选：展示AI思考过程（调试模式）

  // 选项（导师提供）
  options?: {
    id: string;
    text: string;
    intent: string;
  }[];

  // 学生回合
  studentChoice?: {
    optionId: string;
    text: string;
    intent: string;
  };
}
```

### 3.2 核心逻辑：纯AI驱动

```typescript
// 核心函数：获取下一轮对话
async function getNextMentorTurn(
  session: MentorSession,
  studentChoice?: StudentChoice
): Promise<MentorTurn> {

  // 1. 更新历史（如果有学生选择）
  if (studentChoice) {
    session.history.push({
      id: generateId(),
      timestamp: Date.now(),
      studentChoice,
    });
  }

  // 2. 构建Prompt（只有这一个Prompt！）
  const prompt = buildMentorReasoningPrompt({
    chapter: getChapter(session.chapterId),
    history: session.history,
    coveredTopics: session.coveredTopics,
    lastStudentChoice: studentChoice?.text,
  });

  // 3. 调用AI（唯一AI调用点）
  const aiOutput = await aiService.structuredGenerate<MentorReasoningOutput>(
    prompt,
    'mentor_reasoning',
    session.chapterId
  );

  // 4. 创建新的导师回合
  const mentorTurn: DialogueTurn = {
    id: generateId(),
    timestamp: Date.now(),
    mentorContent: aiOutput.response.content,
    mentorEmotion: aiOutput.response.emotion,
    mentorReference: aiOutput.response.reference,
    mentorThinking: aiOutput.thinking,  // 可选记录
    options: aiOutput.options,
  };

  // 5. 更新会话状态
  session.history.push(mentorTurn);
  session.coveredTopics = [...new Set([
    ...session.coveredTopics,
    ...aiOutput.pedagogy.topicCovered
  ])];

  // 6. AI判断是否该结束
  if (aiOutput.stageControl.shouldComplete) {
    session.isCompleted = true;
  }

  return {
    content: aiOutput.response.content,
    emotion: aiOutput.response.emotion,
    reference: aiOutput.response.reference,
    options: aiOutput.options,
    shouldComplete: aiOutput.stageControl.shouldComplete,
  };
}
```

---

## 4. UI组件（极简版）

### 4.1 组件清单（精简到最少）

```
src/components/mentor/
├── MentorAvatar.tsx          # emoji + 五行色（不变）
├── DialogueView.tsx          # 对话展示（打字机效果）
└── ChoicePanel.tsx           # 选项按钮（AI生成什么就展示什么）
```

### 4.2 关键：不预设任何UI状态

不再区分"问候阶段"、"药材介绍阶段"等，UI只负责**展示AI返回的内容**。

```typescript
// MentorIntroStage.tsx - 极简实现
export const MentorIntroStage: React.FC<Props> = ({ chapterId, onComplete }) => {
  const [session, setSession] = useState<MentorSession>(() => loadOrCreateSession(chapterId));
  const [currentTurn, setCurrentTurn] = useState<MentorTurn | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 初始化：获取第一轮对话
  useEffect(() => {
    if (!currentTurn && session.history.length === 0) {
      fetchNextTurn();
    }
  }, []);

  // 获取下一轮
  const fetchNextTurn = async (choice?: StudentChoice) => {
    setIsLoading(true);
    const turn = await getNextMentorTurn(session, choice);
    setCurrentTurn(turn);
    setIsLoading(false);
    saveSession(session);

    if (turn.shouldComplete) {
      onComplete({ history: session.history });
    }
  };

  // 选择选项
  const handleChoice = (option: Option) => {
    fetchNextTurn({
      optionId: option.id,
      text: option.text,
      intent: option.intent,
    });
  };

  return (
    <div className="mentor-intro-stage">
      <MentorAvatar emotion={currentTurn?.emotion} />
      <DialogueView
        content={currentTurn?.content}
        reference={currentTurn?.reference}
        isLoading={isLoading}
      />
      <ChoicePanel
        options={currentTurn?.options}
        onSelect={handleChoice}
        disabled={isLoading}
      />
    </div>
  );
};
```

---

## 5. 教学覆盖度：AI自我评估

不再用代码强制控制教学流程，而是让AI**自我评估**教学是否充分。

### 5.1 AI的自我检查

在Prompt中加入自我评估要求：

```
【结束阶段判断标准】
只有当以下情况满足时，才设置 shouldComplete = true：
1. 学徒明确表示"准备好了"、"了解了"、"开始吧"等
2. 已经自然讨论了本章的4味药材
3. 学徒对中医基础有了基本认知
4. 对话已经持续至少3-5轮（确保不是跳过）

如果不满足，继续对话，引导学徒了解更多。
```

### 5.2 覆盖度追踪（仅供参考）

```typescript
// AI自我报告的覆盖度
interface CoverageReport {
  reportedByAI: string[];      // AI认为已覆盖的话题
  chapterMedicines: string[];  // 本章应该介绍的药材
  confidence: number;          // AI的自信度（0-1）
}

// 分析函数（仅用于分析和优化，不用于强制流程）
function analyzeCoverage(session: MentorSession): CoverageReport {
  const chapter = getChapter(session.chapterId);

  // 检查AI报告覆盖了哪些药材
  const coveredMedicines = chapter.medicines.filter(med =>
    session.coveredTopics.some(topic =>
      topic.includes(med.name) || topic.includes(med.id)
    )
  );

  return {
    reportedByAI: session.coveredTopics,
    chapterMedicines: chapter.medicines.map(m => m.name),
    confidence: coveredMedicines.length / chapter.medicines.length,
  };
}
```

---

## 6. 缓存与性能

### 6.1 智能缓存策略

```typescript
// 对话级缓存（同一选择链，缓存AI响应）
const cacheKey = generateCacheKey({
  chapterId: session.chapterId,
  historyHash: hashHistory(session.history),
  lastChoice: studentChoice?.text,
});

// 但默认关闭缓存，因为AI应该能创造不同的对话体验
const USE_CACHE = false;  // 可在配置中开启
```

### 6.2 流式响应（提升体验）

```typescript
// 支持流式输出，实现打字机效果
async function* streamMentorTurn(
  session: MentorSession,
  studentChoice?: StudentChoice
): AsyncGenerator<StreamChunk> {
  const prompt = buildMentorReasoningPrompt({...});

  // AI返回JSON，但可以流式接收
  const stream = await aiService.streamGenerate(prompt);

  for await (const chunk of stream) {
    // 解析部分JSON，实时展示
    yield parsePartialJson(chunk);
  }
}
```

---

## 7. 调试与可观测性

### 7.1 AI思考过程可视化（Debug模式）

```typescript
// 开发模式下展示AI的思考过程
const DEBUG_MODE = import.meta.env.DEV;

{DEBUG_MODE && currentTurn?.thinking && (
  <div className="ai-thinking-panel">
    <h4>AI思考过程</h4>
    <pre>{currentTurn.thinking}</pre>
    <div>建议下一步: {currentTurn.nextSuggestion}</div>
    <div>覆盖度: {currentTurn.topicCovered.join(', ')}</div>
  </div>
)}
```

### 7.2 对话日志记录

```typescript
// 记录每次对话用于分析和优化Prompt
function logDialogue(session: MentorSession, turn: MentorTurn) {
  const logEntry = {
    timestamp: Date.now(),
    chapterId: session.chapterId,
    turnCount: session.history.length,
    aiThinking: turn.thinking,
    content: turn.content,
    emotion: turn.emotion,
    topicCovered: turn.topicCovered,
    shouldComplete: turn.shouldComplete,
  };

  // 发送到分析服务或本地存储
  dialogueLogger.record(logEntry);
}
```

---

## 8. 与传统方案对比

| 维度 | 旧方案（模板+状态机） | 新方案（AI-Native） |
|------|----------------------|---------------------|
| **代码复杂度** | 高（维护状态机、模板、降级） | 低（唯一Prompt，AI驱动） |
| **对话自然度** | 中（模板化，可预测） | 高（AI实时生成，个性化） |
| **可扩展性** | 低（新增内容需改代码） | 高（改Prompt即可） |
| **教学灵活性** | 低（固定流程） | 高（AI自适应调整） |
| **调试难度** | 中（逻辑清晰但代码多） | 中（逻辑在Prompt，需调优） |
| **AI token消耗** | 低（只润色） | 高（完全生成） |
| **离线可用性** | 高（有降级模板） | 中（需AI，失败时重试） |
| **测试覆盖** | 高（状态机可测） | 中（AI行为需E2E验证） |

---

## 9. 实施计划（极简）

### Task 1: 重构AI服务层

```typescript
// 扩展aiService支持结构化生成
interface AIService {
  structuredGenerate<T>(
    prompt: string,
    cacheNamespace: string,
    cacheKey: string
  ): Promise<T>;
}
```

### Task 2: 创建唯一Prompt

编写 `MENTOR_REASONING_PROMPT`，包含所有角色设定和输出要求。

### Task 3: 实现极简状态管理

```typescript
// 只有对话历史和覆盖度声明
interface MentorSession {
  history: DialogueTurn[];
  coveredTopics: string[];
  isCompleted: boolean;
}
```

### Task 4: 重构MentorIntroStage

移除所有阶段判断逻辑，只负责：
1. 展示AI返回的内容
2. 传递玩家选择给AI
3. 保存对话历史

### Task 5: 调优Prompt

通过实际对话测试，调整Prompt以：
- 确保AI会介绍所有药材
- 控制回复长度
- 优化表情和选项的相关性

---

## 10. 验收标准（AI-Native版）

| 检查项 | 标准 |
|--------|------|
| **零模板** | 代码中没有任何预置对话文本 |
| **AI驱动** | 所有内容由AI实时生成 |
| **结构化** | AI输出包含content/emotion/options/shouldComplete |
| **自评估** | AI能自我报告覆盖度和建议结束时机 |
| **个性化** | 不同玩家看到不同的对话内容 |
| **可控性** | AI不会无限循环，能在合适时机结束 |
| **可调试** | 开发模式可见AI思考过程 |

---

## 11. 风险与应对

| 风险 | 应对策略 |
|------|----------|
| AI生成内容不稳定 | Prompt中加入稳定性要求；使用temperature=0.7 |
| AI跳过重要内容 | Prompt强调教学责任；添加最小轮数检查 |
| AI无限循环 | Prompt设置结束标准；UI提供"直接开始"按钮 |
| Token消耗过高 | 精简Prompt；限制历史长度（最近5轮） |
| AI幻觉（胡说八道） | Prompt强调中医准确性；后期加入内容校验 |

---

*重构完成 - 真正的AI-Native设计*

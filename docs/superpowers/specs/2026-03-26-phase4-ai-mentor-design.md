# Phase 4: AI导师系统设计文档

> 文档版本: v1.0
> 创建日期: 2026-03-26
> 基于: 03-ai-integration.md + 用户选择（混合式交互、结构化AI、简单表情）

---

## 1. 设计目标

Phase 4 的核心目标是为 **师导入门阶段（Stage 1: mentor-intro）** 实现AI导师"青木先生"的完整交互体验：

- 通过结构化的AI对话引导玩家了解本章学习目标
- 介绍本章的4味核心药材
- 建立沉浸式的师徒关系
- 为后续阶段（采药、战斗）做好知识准备

---

## 2. 架构设计

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                     MentorIntroStage                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  DialogueStateManager                    │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │   │
│  │  │   TodoList   │  │  Guidance    │  │  History     │   │   │
│  │  │   Tracker    │  │   Engine     │  │  Manager     │   │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   DialogueUI                             │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌────────────────┐   │   │
│  │  │ MentorAvatar│  │DialogueBox  │  │  OptionButtons │   │   │
│  │  │  (emoji)    │  │ (bubbles)   │  │  (choices)     │   │   │
│  │  └─────────────┘  └─────────────┘  └────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                    ┌─────────┴─────────┐                        │
│                    ▼                   ▼                        │
│           ┌──────────────┐   ┌──────────────┐                  │
│           │  aiService   │   │   TTS        │                  │
│           │  (existing)  │   │  (future)    │                  │
│           └──────────────┘   └──────────────┘                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 核心设计原则

1. **结构化对话**：不是完全自由输入，而是通过选项按钮引导流程
2. **AI生成内容**：使用已有 `aiService` 生成个性化对话内容
3. **覆盖度跟踪**：内置TodoList系统确保所有教学点都被覆盖
4. **状态持久化**：对话进度自动保存，支持断点续玩

---

## 3. 数据结构

### 3.1 对话状态 (DialogueState)

```typescript
interface DialogueState {
  // 当前会话ID
  sessionId: string;

  // 对话历史
  history: DialogueTurn[];

  // TodoList - 需要覆盖的教学点
  todoList: TeachingItem[];

  // 当前指导上下文
  guidance: GuidanceContext;

  // 当前轮次
  currentRound: number;

  // 是否已完成
  isCompleted: boolean;

  // 元数据
  metadata: {
    chapterId: string;
    startTime: number;
    lastUpdateTime: number;
  };
}
```

### 3.2 教学项目 (TeachingItem)

```typescript
interface TeachingItem {
  id: string;                    // 唯一标识
  type: 'greeting' | 'chapter_goal' | 'medicine_intro' |
        'knowledge_check' | 'motivation' | 'transition';
  content: string;               // 教学内容描述
  targetMedicine?: string;       // 关联的药材ID（如适用）
  status: 'pending' | 'in_progress' | 'completed';
  priority: number;              // 优先级（1-5）
  dependencies?: string[];       // 前置依赖项目ID
}
```

### 3.3 指导上下文 (GuidanceContext)

```typescript
interface GuidanceContext {
  // 当前章节信息
  chapter: {
    id: string;
    title: string;
    wuxing: string;
    medicines: string[];
    formulas: string[];
  };

  // 玩家进度
  player: {
    name: string;
    totalChaptersCompleted: number;
    masteredMedicines: string[];
  };

  // 当前焦点
  currentFocus: {
    itemId: string | null;       // 当前教学项目ID
    medicineIndex: number;       // 当前介绍到第几个药材
    topic: string;               // 当前话题
  };

  // 已覆盖知识点
  coveredTopics: string[];
}
```

### 3.4 对话轮次 (DialogueTurn)

```typescript
interface DialogueTurn {
  id: string;
  role: 'mentor' | 'student';
  content: string;
  emotion?: 'happy' | 'thinking' | 'surprised' | 'concerned' | 'celebrating';
  options?: DialogueOption[];    // 如果是导师回合，提供选项
  selectedOption?: string;       // 学生选择的选项ID
  timestamp: number;
  teachingItemId?: string;       // 关联的教学项目
}

interface DialogueOption {
  id: string;
  text: string;
  value: string;
  type: 'continue' | 'question' | 'skip' | 'action';
  metadata?: Record<string, any>;
}
```

---

## 4. 对话流程设计

### 4.1 标准流程（6步）

```
┌────────────────────────────────────────────────────────────────────┐
│                     师导入门阶段标准流程                            │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Step 1: 问候与欢迎                                                 │
│  ├─ 导师："徒儿，欢迎来到本章..."                                   │
│  ├─ 表情：happy                                                    │
│  └─ 选项：[继续聆听]                                               │
│                                                                    │
│  Step 2: 本章目标介绍                                               │
│  ├─ 导师：介绍本章学习目标和背景故事                                │
│  ├─ 表情：thinking（讲解时）→ happy（鼓励）                         │
│  └─ 选项：[了解本章药材] [询问难点] [直接开始]                      │
│                                                                    │
│  Step 3: 第一味药材介绍                                            │
│  ├─ 导师：详细描述药材特征、性味归经                                │
│  ├─ 表情：thinking                                                 │
│  └─ 选项：[了解更多] [提问] [继续下一味]                          │
│                                                                    │
│  Step 4: 第二/三/四味药材介绍（循环）                               │
│  ├─ 导师：依次介绍剩余药材                                         │
│  ├─ 表情：根据内容变化                                              │
│  └─ 选项：交互式选项                                               │
│                                                                    │
│  Step 5: 知识巩固（可选）                                          │
│  ├─ 导师：提出1-2个简单的预习问题                                   │
│  ├─ 表情：thinking → celebrating（答对）/ concerned（答错）         │
│  └─ 选项：A/B/C/D 选择题                                            │
│                                                                    │
│  Step 6: 激励与过渡                                                │
│  ├─ 导师：鼓励玩家并预告下一阶段（山谷采药）                        │
│  ├─ 表情：celebrating                                              │
│  └─ 选项：[进入山谷采药]                                           │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### 4.2 TodoList跟踪机制

每个章节初始化时自动生成以下教学项目：

```typescript
const DEFAULT_TODO_LIST: TeachingItem[] = [
  {
    id: 'greeting',
    type: 'greeting',
    content: '欢迎玩家并建立师徒关系',
    status: 'pending',
    priority: 5,
  },
  {
    id: 'chapter_goal',
    type: 'chapter_goal',
    content: `介绍本章学习目标：掌握${chapter.medicines.length}味药材`,
    status: 'pending',
    priority: 5,
    dependencies: ['greeting'],
  },
  // 为每味药材生成介绍项目
  ...chapter.medicines.map((medId, index) => ({
    id: `medicine_${medId}`,
    type: 'medicine_intro',
    content: `介绍${medicineName}的特征、性味归经`,
    targetMedicine: medId,
    status: 'pending',
    priority: 4,
    dependencies: index === 0 ? ['chapter_goal'] : [`medicine_${chapter.medicines[index-1]}`],
  })),
  {
    id: 'knowledge_check',
    type: 'knowledge_check',
    content: '简单提问巩固预习知识',
    status: 'pending',
    priority: 3,
    dependencies: [`medicine_${chapter.medicines[chapter.medicines.length-1]}`],
  },
  {
    id: 'transition',
    type: 'transition',
    content: '激励玩家并引导进入下一阶段',
    status: 'pending',
    priority: 5,
    dependencies: ['knowledge_check'],
  },
];
```

---

## 5. AI生成策略

### 5.1 Prompt设计

使用已有的 `aiService` 和 `buildElderPrompt`，但需要针对"导师引导"场景扩展：

```typescript
// 新增的Prompt构建函数
export function buildMentorGuidancePrompt(
  context: GuidanceContext,
  currentItem: TeachingItem,
  history: DialogueTurn[]
): string {
  return `你是青木先生，药灵山谷的守谷人，一位活了三百岁的老中医。
你正在引导一位学徒进入新的学习章节。

【当前任务】
任务类型：${currentItem.type}
任务内容：${currentItem.content}
${currentItem.targetMedicine ? `当前药材：${getMedicineName(currentItem.targetMedicine)}` : ''}

【本章信息】
章节：${context.chapter.title}
五行属性：${context.chapter.wuxing}
本章药材：${context.chapter.medicines.map(getMedicineName).join('、')}

【已覆盖内容】
${context.coveredTopics.join('\n')}

【对话历史】
${history.slice(-3).map(turn =>
  `${turn.role === 'mentor' ? '青木先生' : '学徒'}：${turn.content}`
).join('\n')}

【输出要求】
请以JSON格式输出：
{
  "content": "对话内容（温和、有耐心、引经据典但不死板，50-100字）",
  "emotion": "happy|thinking|surprised|concerned|celebrating",
  "options": [
    { "id": "opt1", "text": "选项文字", "type": "continue" }
  ],
  "coveredTopics": ["本回合覆盖的新知识点"]
}

注意：
1. 开头常用称呼："徒儿"、"小子/丫头"
2. 引用经典时注明出处："《伤寒论》云..."
3. 适当幽默："为师当年..."、"三百年前..."
4. 提供2-3个选项引导玩家，避免完全开放输入`;
}
```

### 5.2 缓存策略

对话内容按以下策略缓存：

| 内容类型 | 缓存键 | TTL | 说明 |
|----------|--------|-----|------|
| 问候语 | `mentor_greeting_${chapterId}` | 24小时 | 同一章节问候相同 |
| 药材介绍 | `mentor_med_${medicineId}` | 永久 | 药材介绍固定 |
| 章节目标 | `mentor_goal_${chapterId}` | 24小时 | 章节目标固定 |
| 动态回复 | 不缓存 | - | 根据玩家选择实时生成 |

### 5.3 离线降级

当AI服务不可用时的降级策略：

```typescript
const OFFLINE_FALLBACK: Record<string, { content: string; emotion: string; options: DialogueOption[] }> = {
  greeting: {
    content: '徒儿，欢迎来到药灵山谷。我是青木先生，今日起由我来指导你学习中医之道。',
    emotion: 'happy',
    options: [{ id: 'continue', text: '弟子拜见先生', type: 'continue' }],
  },
  chapter_goal: {
    content: '本章我们将学习${medicineNames}这${count}味药材。这些都是${wuxing}属性的药材，在临床应用中十分重要。',
    emotion: 'thinking',
    options: [
      { id: 'learn', text: '请先生讲解', type: 'continue' },
      { id: 'skip', text: '弟子已有所了解', type: 'skip' },
    ],
  },
  // ... 其他类型
};
```

---

## 6. UI组件设计

### 6.1 组件清单

```
src/components/mentor/
├── MentorAvatar.tsx          # 导师头像（表情emoji + 五行色背景）
├── DialogueBubble.tsx        # 对话气泡（区分导师/学生）
├── OptionButtonGroup.tsx     # 选项按钮组
├── TeachingProgress.tsx      # 教学进度条（显示TodoList完成度）
├── DialogueContainer.tsx     # 对话容器（整合以上组件）
└── index.ts                  # 统一导出
```

### 6.2 MentorAvatar 组件

```typescript
interface MentorAvatarProps {
  emotion: 'happy' | 'thinking' | 'surprised' | 'concerned' | 'celebrating';
  wuxing: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
  size?: 'sm' | 'md' | 'lg';
  isSpeaking?: boolean;        // 是否正在说话（带动画效果）
}

const EMOTION_EMOJI: Record<string, string> = {
  happy: '😊',
  thinking: '🤔',
  surprised: '😮',
  concerned: '😟',
  celebrating: '🎉',
};

const WUXING_COLORS: Record<string, { primary: string; light: string }> = {
  wood: { primary: '#2E7D32', light: '#81C784' },
  fire: { primary: '#C62828', light: '#EF5350' },
  earth: { primary: '#F9A825', light: '#FFD54F' },
  metal: { primary: '#78909C', light: '#B0BEC5' },
  water: { primary: '#1565C0', light: '#42A5F5' },
};
```

### 6.3 DialogueBubble 组件

```typescript
interface DialogueBubbleProps {
  role: 'mentor' | 'student';
  content: string;
  emotion?: string;            // 仅导师显示表情
  isStreaming?: boolean;       // 是否正在流式输出
  onComplete?: () => void;     // 内容展示完成回调
}

// 视觉设计
// - 导师：左侧，蓝色/五行色调气泡，带头像
// - 学生：右侧，绿色/灰色气泡，无头像
// - 打字机效果展示内容
```

### 6.4 OptionButtonGroup 组件

```typescript
interface OptionButtonGroupProps {
  options: DialogueOption[];
  onSelect: (option: DialogueOption) => void;
  disabled?: boolean;
  layout?: 'vertical' | 'horizontal' | 'grid';
}

// 视觉设计
// - 垂直排列（默认）：适合2-3个选项
// - 网格排列：适合4个选择题选项
// - 禁用状态：选中后其他选项禁用，直到AI回复
```

### 6.5 TeachingProgress 组件

```typescript
interface TeachingProgressProps {
  items: TeachingItem[];
  currentItemId: string | null;
  compact?: boolean;           // 是否紧凑模式
}

// 视觉设计
// - 进度条形式显示完成度
// - 当前项目高亮
// - 可展开的详情列表（可选）
```

---

## 7. MentorIntroStage 页面设计

### 7.1 页面布局

```
┌────────────────────────────────────────────────────────────────────┐
│  Header：药灵山谷 - 师导入门                                        │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                     TeachingProgress                         │ │
│  │  [━━━━━━░░░░░░░░░░] 40% - 已覆盖：问候、目标介绍              │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌──────────┐  ┌─────────────────────────────────────────────────┐│
│  │          │  │                                                 ││
│  │  😊      │  │  徒儿，欢迎来到药灵山谷。我是青木先生...       ││
│  │  青木    │  │                                                 ││
│  │  先生    │  │                                                 ││
│  │          │  │                                                 ││
│  └──────────┘  └─────────────────────────────────────────────────┘│
│                                                                    │
│  ┌───────────────────────────────────────────────────────────────┐│
│  │                                                               ││
│  │        [  继 续 聆 听  ]  [ 询 问 详 情  ]                    ││
│  │                                                               ││
│  └───────────────────────────────────────────────────────────────┘│
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### 7.2 状态管理

```typescript
// 使用React hooks管理状态
const [state, setState] = useState<DialogueState>(initializeState);
const [isLoading, setIsLoading] = useState(false);
const [currentTurn, setCurrentTurn] = useState<DialogueTurn | null>(null);

// 核心流程
const proceedToNextItem = async () => {
  const nextItem = getNextPendingItem(state.todoList);
  if (!nextItem) {
    completeStage();
    return;
  }

  setIsLoading(true);
  const turn = await generateMentorTurn(nextItem, state);
  setCurrentTurn(turn);
  setIsLoading(false);
};

const handleOptionSelect = async (option: DialogueOption) => {
  // 记录学生选择
  const studentTurn: DialogueTurn = {
    id: `student_${Date.now()}`,
    role: 'student',
    content: option.text,
    selectedOption: option.id,
    timestamp: Date.now(),
  };

  // 更新历史
  setState(prev => ({
    ...prev,
    history: [...prev.history, studentTurn],
  }));

  // 根据选项类型处理
  if (option.type === 'skip') {
    skipCurrentItem();
  } else {
    proceedToNextItem();
  }
};
```

### 7.3 与StageManager集成

```typescript
interface MentorIntroStageProps {
  chapterId: string;
  onComplete: (result: {
    coveredTopics: string[];
    dialogHistory: DialogueTurn[];
  }) => void;
  onExit: () => void;
}

// 阶段完成时传递数据给父组件
const completeStage = () => {
  onComplete({
    coveredTopics: state.guidance.coveredTopics,
    dialogHistory: state.history,
  });
};
```

---

## 8. 持久化策略

### 8.1 自动保存点

以下时机自动保存对话状态：

1. **每个教学项目完成时** - 保存到 `chapterStore`
2. **玩家选择选项后** - 立即保存
3. **AI生成回复后** - 保存更新后的历史
4. **页面卸载前** - 使用 `beforeunload` 事件

### 8.2 数据结构存储

```typescript
// 存储到 chapterStore.stageProgress.mentorIntro
interface MentorIntroProgress {
  completed: boolean;
  coveredTopics: string[];
  dialogueHistory: DialogueTurn[];
  todoListStatus: Record<string, TeachingItemStatus>;
  lastSaveTime: number;
}

// 恢复时重建完整状态
const restoreState = (progress: MentorIntroProgress): DialogueState => {
  return {
    ...initializeState(),
    todoList: applyStatusToTodoList(progress.todoListStatus),
    history: progress.dialogueHistory,
    guidance: {
      ...initialGuidance,
      coveredTopics: progress.coveredTopics,
    },
    isCompleted: progress.completed,
  };
};
```

---

## 9. 测试策略

### 9.1 单元测试

```typescript
// DialogueStateManager 测试
describe('DialogueStateManager', () => {
  it('should initialize todo list for chapter', () => {
    const state = initializeState('chapter-1');
    expect(state.todoList).toHaveLength(8); // 问候 + 目标 + 4药材 + 检测 + 过渡
    expect(state.todoList[0].type).toBe('greeting');
  });

  it('should mark item as completed', () => {
    const state = markItemCompleted(initialState, 'greeting');
    expect(state.todoList[0].status).toBe('completed');
  });

  it('should get next pending item based on dependencies', () => {
    const item = getNextPendingItem(state.todoList);
    expect(item?.id).toBe('greeting'); // 第一个无依赖的项目
  });
});
```

### 9.2 集成测试

- 测试与 `aiService` 的集成（模拟响应）
- 测试与 `chapterStore` 的集成（保存/恢复）
- 测试完整的6步流程

### 9.3 视觉回归测试

- 使用Playwright拍摄导师对话界面
- AI视觉验收：确保对话布局符合预期

---

## 10. 扩展计划

### 10.1 Phase 4.1（可选增强）

- [ ] 导师立绘图片（AI生成图）
- [ ] 语音合成（TTS）朗读对话
- [ ] 更丰富的表情动画（Lottie）
- [ ] 对话收藏功能（收藏经典语录）

### 10.2 与其他阶段联动

- **与采药阶段联动**：根据采药结果动态调整导师对话
- **与战斗阶段联动**：根据战斗表现给予针对性鼓励
- **与方剂阶段联动**：药材介绍数据共享

---

## 11. 验收标准

| 检查项 | 标准 | 测试方法 |
|--------|------|----------|
| 结构化对话 | 完整覆盖6步流程 | 单元测试 |
| TodoList跟踪 | 所有项目状态正确更新 | 单元测试 |
| AI集成 | 能正确调用aiService生成内容 | 集成测试 |
| UI展示 | 导师头像、气泡、选项正常显示 | 视觉测试 |
| 持久化 | 断点续玩功能正常 | E2E测试 |
| 离线模式 | AI不可用时降级为模板 | 集成测试 |
| 阶段流转 | 完成后正确进入下一阶段 | E2E测试 |

---

## 12. 技术债务与注意事项

1. **图片资源**：导师立绘需要AI生成，第一阶段先用emoji占位
2. **Prompt调优**：AI生成的对话质量需要反复调试Prompt
3. **缓存失效**：章节内容更新时需要清空相关缓存
4. **移动端适配**：对话界面在手机上需要特殊布局
5. **无障碍支持**：考虑为视障用户添加屏幕阅读器支持

---

*文档完成 - 等待review后可进入实施计划阶段*

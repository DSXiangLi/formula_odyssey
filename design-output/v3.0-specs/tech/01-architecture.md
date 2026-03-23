# 技术架构设计

## 1. 系统架构总览

```
┌─────────────────────────────────────────────────────────────┐
│                        客户端 (React)                        │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   章节系统    │  │  山谷采药    │  │  药灵守护    │      │
│  │   Chapter    │  │  Gathering   │  │ BattleSystem │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│  ┌──────┴──────────────────┴──────────────────┴──────┐      │
│  │              游戏状态管理 (Zustand)                 │      │
│  │  ┌────────────────────────────────────────────┐   │      │
│  │  │  ChapterStore | PlayerStore | BattleStore  │   │      │
│  │  └────────────────────────────────────────────┘   │      │
│  └─────────────────────────────────────────────────────┘      │
│                          │                                    │
│  ┌───────────────────────┴──────────────────────────┐        │
│  │              AI服务层 (AIService)                 │        │
│  │  ┌────────────────────────────────────────────┐  │        │
│  │  │  QuestionGenerator | SocraticGuide |       │  │        │
│  │  │  EventGenerator | AnswerValidator          │  │        │
│  │  └────────────────────────────────────────────┘  │        │
│  └──────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     AI API (GLM-4)                          │
└─────────────────────────────────────────────────────────────┘
```

## 2. 核心模块划分

### 2.1 章节系统 (ChapterSystem)

**职责**：管理20章学习进度

```typescript
// stores/chapterStore.ts
interface ChapterStore {
  // 状态
  currentChapter: string | null;
  chapterProgress: ChapterProgress[];

  // 动作
  startChapter(chapterId: string): void;
  completeStage(chapterId: string, stage: number): void;
  completeChapter(chapterId: string): void;

  // 查询
  getChapterStatus(chapterId: string): ChapterStatus;
  getNextAvailableChapter(): string | null;
}
```

### 2.2 山谷采药系统 (GatheringSystem)

**职责**：地图探索、药材采集

```typescript
// stores/gatheringStore.ts
interface GatheringStore {
  // 状态
  currentMap: MapData | null;
  playerPosition: Position;
  inventory: Inventory;
  tools: Tool[];

  // 动作
  moveTo(position: Position): void;
  exploreTile(tile: Tile): DiscoveryResult;
  collectMedicine(medicineId: string, quality: Quality): void;
  useTool(toolId: string): void;

  // 小游戏
  startDiggingGame(medicineId: string): DiggingGame;
  startRhythmGame(medicineId: string): RhythmGame;
  startLassoGame(medicineId: string): LassoGame;
}
```

### 2.3 药灵守护系统 (BattleSystem)

**职责**：打字战斗核心逻辑

```typescript
// stores/battleStore.ts
interface BattleStore {
  // 状态
  battleState: 'idle' | 'preparing' | 'wave1' | 'wave2' | 'wave3' | 'boss' | 'victory' | 'defeat';
  enemies: Enemy[];
  currentInput: string;
  combo: number;
  maxCombo: number;
  score: number;

  // 动作
  startBattle(medicineIds: string[]): void;
  handleInput(char: string): void;
  handleBackspace(): void;
  submitAnswer(): void;
  useSkill(skillId: string): void;

  // 敌人生成
  spawnEnemy(wave: number): Enemy;
  moveEnemies(): void;
  checkCollisions(): CollisionResult[];
}
```

### 2.4 AI服务系统 (AIService)

**职责**：与GLM-4交互

```typescript
// services/ai/aiService.ts
interface AIService {
  // 出题
  generateQuestion(context: QuestionContext): Promise<Question>;

  // 苏格拉底引导
  socraticGuide(context: GuideContext): Promise<GuideResponse>;

  // 答案验证
  validateAnswer(question: string, answer: string, expected: string[]): Promise<ValidationResult>;

  // 事件生成
  generateEvent(context: EventContext): Promise<GameEvent>;
}
```

## 3. 数据流设计

### 3.1 章节流程数据流

```
用户点击章节
    ↓
chapterStore.startChapter()
    ↓
加载章节数据 + AI导师对话
    ↓
进入山谷采药阶段 → gatheringStore
    ↓
采集完成触发 → battleStore.startBattle()
    ↓
战斗胜利 → 解锁方剂学习
    ↓
方剂学习完成 → 进入临床考核
    ↓
考核通过 → chapterStore.completeChapter()
    ↓
解锁开放世界
```

### 3.2 战斗系统数据流

```
键盘输入
    ↓
battleStore.handleInput(char)
    ↓
更新currentInput + 实时匹配检测
    ↓
匹配成功 → 发射药气波
    ↓
检测碰撞 → 击退敌人
    ↓
更新连击数 + 分数
    ↓
连击达到阈值 → 激活技能
```

## 4. 状态管理设计

### 4.1 持久化策略

```typescript
// 需要持久化的状态
const persistentStates = [
  'playerProgress',      // 玩家进度
  'chapterProgress',     // 章节进度
  'collectedMedicines',  // 已收集药材
  'unlockedSkills',      // 已解锁技能
  'dailyStats',          // 每日统计
];

// 临时状态（不持久化）
const temporaryStates = [
  'currentBattle',       // 当前战斗
  'currentMap',          // 当前地图
  'conversationHistory', // 对话历史（可缓存）
];
```

### 4.2 状态切片

```typescript
// stores/index.ts
export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // 玩家基础信息
      ...createPlayerSlice(set, get),
      // 章节进度
      ...createChapterSlice(set, get),
      // 采药系统
      ...createGatheringSlice(set, get),
      // 战斗系统
      ...createBattleSlice(set, get),
      // AI对话
      ...createDialogueSlice(set, get),
    }),
    {
      name: 'yaoling-game-storage',
      partialize: (state) => ({
        player: state.player,
        chapterProgress: state.chapterProgress,
        collectedMedicines: state.collectedMedicines,
        // ... 其他需要持久化的字段
      }),
    }
  )
);
```

## 5. 组件架构

### 5.1 页面结构

```
src/
├── pages/
│   ├── ChapterSelect/        # 章节选择页
│   ├── ChapterPlay/          # 章节进行页
│   │   ├── Stage1_Intro/     # 师导入门
│   │   ├── Stage2_Gathering/ # 山谷采药
│   │   ├── Stage3_Battle/    # 药灵守护
│   │   ├── Stage4_Formula/   # 方剂学习
│   │   ├── Stage5_Clinical/  # 临床考核
│   │   └── Stage6_Complete/  # 章节完成
│   ├── OpenWorld/            # 开放世界
│   └── Collection/           # 药材图鉴
```

### 5.2 核心组件

```
components/
├── gathering/                # 采药系统组件
│   ├── MapGrid.tsx          # 地图网格
│   ├── Tile.tsx             # 地块组件
│   ├── MedicineSpot.tsx     # 药材发现点
│   ├── DiggingGame.tsx      # 挖掘小游戏
│   ├── RhythmGame.tsx       # 节奏小游戏
│   └── LassoGame.tsx        # 套索小游戏
├── battle/                   # 战斗系统组件
│   ├── BattleField.tsx      # 战场画布
│   ├── Enemy.tsx            # 敌人组件
│   ├── InputArea.tsx        # 输入区域
│   ├── ComboDisplay.tsx     # 连击显示
│   └── SkillBar.tsx         # 技能栏
├── mentor/                   # AI导师组件
│   ├── MentorAvatar.tsx     # 导师立绘
│   ├── DialogueBox.tsx      # 对话框
│   ├── OptionList.tsx       # 选项列表
│   └── InputField.tsx       # 输入框
└── common/                   # 通用组件
    ├── Button.tsx
    ├── ProgressBar.tsx
    ├── Modal.tsx
    └── Tooltip.tsx
```

## 6. 路由设计

```typescript
// 路由配置
const routes = [
  { path: '/', component: HomePage },
  { path: '/chapters', component: ChapterSelectPage },
  { path: '/chapter/:id', component: ChapterPlayPage },
  { path: '/chapter/:id/gathering', component: GatheringStage },
  { path: '/chapter/:id/battle', component: BattleStage },
  { path: '/chapter/:id/formula', component: FormulaStage },
  { path: '/chapter/:id/clinical', component: ClinicalStage },
  { path: '/openworld', component: OpenWorldPage },
  { path: '/collection', component: CollectionPage },
  { path: '/skills', component: SkillTreePage },
];
```

## 7. 性能优化策略

### 7.1 渲染优化

- 使用 `React.memo` 优化静态组件
- 使用 `useMemo` 缓存计算结果
- 使用 `useCallback` 稳定回调函数
- 战斗系统使用 `requestAnimationFrame`
- 地图使用 Canvas 而非 DOM

### 7.2 数据优化

- AI响应使用缓存（LRU Cache）
- 图片懒加载
- 分页加载章节数据
- 增量保存玩家进度

### 7.3 网络优化

- AI请求合并发送
- 离线模式支持（缓存题目）
- 断点续传章节进度

## 8. 错误处理

### 8.1 AI服务错误

```typescript
// AI请求失败处理
async function safeAIRequest<T>(
  request: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await request();
  } catch (error) {
    console.error('AI服务错误:', error);
    // 记录错误日志
    logError(error);
    // 返回fallback数据
    return fallback;
  }
}
```

### 8.2 状态恢复

```typescript
// 战斗状态异常恢复
function recoverBattleState(): BattleState {
  const saved = localStorage.getItem('battle-backup');
  if (saved) {
    return JSON.parse(saved);
  }
  return createInitialBattleState();
}
```

## 9. 安全考虑

- AI API Key 环境变量管理
- 用户输入 sanitization
- 状态数据校验（zod schema）
- 防作弊检测（异常分数检测）

## 10. 待细化问题

1. **战斗系统帧率**：目标60fps，需要性能测试
2. **AI响应延迟**：目标<2s，需要流式响应
3. **离线支持**：是否需要完全离线游玩？
4. **多端同步**：是否需要云存档？
5. **防沉迷**：是否需要学习时长限制？

---

*文档状态: 初稿*
*待补充: 详细API设计、性能基准*

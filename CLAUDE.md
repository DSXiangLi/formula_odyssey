# 药灵山谷 v3.0 - 师承问道版

## 项目定位

**《药灵山谷 v3.0》** 是一款AI-native中医学习游戏，融合：
- 🌿 **五行归元** - 中医五行世界观
- 👨‍⚕️ **AI导师** - 青木先生全程陪伴学习
- 🎮 **山谷采药** - 探索+采集小游戏
- ⌨️ **药灵守护** - 打字战斗巩固知识

---

## 版本信息

| 版本 | 名称 | 状态 | 文档 |
|------|------|------|------|
| v2.0 | 五行归元版 | 已完成 | `药灵山谷v2.0_五行归元版设计.md` |
| v3.0 | 师承问道版 | 设计中 | `药灵山谷v3.0_融合设计.md` |

---

## 核心设计文档

### 主设计文档
- **药灵山谷v3.0_融合设计.md** - 完整设计文档

### 细分文档
```
design-output/v3.0-specs/
├── tech/                     # 技术细分文档
│   ├── 01-architecture.md   # 系统架构设计
│   ├── 02-data-models.md    # 数据模型详细设计
│   ├── 03-ai-integration.md # AI集成设计
│   ├── 04-battle-system.md  # 战斗系统技术设计
│   ├── 05-map-system.md     # 地图系统技术设计
│   └── 06-testing-strategy.md # 测试策略（必看）
├── gameplay/                 # 游戏策略细分文档
│   ├── 01-gathering-adventure.md  # 山谷采药冒险
│   ├── 02-typing-battle.md        # 药灵守护战
│   ├── 03-chapter-system.md       # 章节系统
│   └── 04-open-world.md           # 开放世界
└── design/                   # 设计细分文档
    ├── 01-ui-ux.md          # UI/UX规范
    ├── 02-visual-style.md   # 视觉风格
    ├── 03-animation-effects.md # 动画效果
    └── 04-sound-design.md   # 音效设计
```

---

## 开发导航

### 按功能模块查找文档

| 开发任务 | 必读文档 | 参考文档 |
|----------|----------|----------|
| **系统架构** | [01-architecture.md](design-output/v3.0-specs/tech/01-architecture.md) | [02-data-models.md](design-output/v3.0-specs/tech/02-data-models.md) |
| **数据模型/类型定义** | [02-data-models.md](design-output/v3.0-specs/tech/02-data-models.md) | [01-architecture.md](design-output/v3.0-specs/tech/01-architecture.md) |
| **AI导师集成** | [03-ai-integration.md](design-output/v3.0-specs/tech/03-ai-integration.md) | [01-gathering-adventure.md](design-output/v3.0-specs/gameplay/01-gathering-adventure.md) |
| **战斗系统开发** | [04-battle-system.md](design-output/v3.0-specs/tech/04-battle-system.md) | [02-typing-battle.md](design-output/v3.0-specs/gameplay/02-typing-battle.md), [03-animation-effects.md](design-output/v3.0-specs/design/03-animation-effects.md) |
| **地图系统开发** | [05-map-system.md](design-output/v3.0-specs/tech/05-map-system.md) | [01-gathering-adventure.md](design-output/v3.0-specs/gameplay/01-gathering-adventure.md), [02-visual-style.md](design-output/v3.0-specs/design/02-visual-style.md) |
| **测试与验收** | [06-testing-strategy.md](design-output/v3.0-specs/tech/06-testing-strategy.md) | - |
| **山谷采药玩法** | [01-gathering-adventure.md](design-output/v3.0-specs/gameplay/01-gathering-adventure.md) | [05-map-system.md](design-output/v3.0-specs/tech/05-map-system.md) |
| **药灵守护战玩法** | [02-typing-battle.md](design-output/v3.0-specs/gameplay/02-typing-battle.md) | [04-battle-system.md](design-output/v3.0-specs/tech/04-battle-system.md) |
| **章节系统设计** | [03-chapter-system.md](design-output/v3.0-specs/gameplay/03-chapter-system.md) | [01-architecture.md](design-output/v3.0-specs/tech/01-architecture.md) |
| **开放世界设计** | [04-open-world.md](design-output/v3.0-specs/gameplay/04-open-world.md) | [05-map-system.md](design-output/v3.0-specs/tech/05-map-system.md) |
| **UI/UX实现** | [01-ui-ux.md](design-output/v3.0-specs/design/01-ui-ux.md) | [02-visual-style.md](design-output/v3.0-specs/design/02-visual-style.md) |
| **视觉美术** | [02-visual-style.md](design-output/v3.0-specs/design/02-visual-style.md) | [03-animation-effects.md](design-output/v3.0-specs/design/03-animation-effects.md) |
| **动画特效** | [03-animation-effects.md](design-output/v3.0-specs/design/03-animation-effects.md) | [02-visual-style.md](design-output/v3.0-specs/design/02-visual-style.md) |
| **音效实现** | [04-sound-design.md](design-output/v3.0-specs/design/04-sound-design.md) | - |

### 按开发阶段查找文档

| 阶段 | 主要文档 | 完成标准 |
|------|----------|----------|
| **Phase 1: 核心框架** | [01-architecture.md](design-output/v3.0-specs/tech/01-architecture.md), [02-data-models.md](design-output/v3.0-specs/tech/02-data-models.md), [03-chapter-system.md](design-output/v3.0-specs/gameplay/03-chapter-system.md) | TypeScript 0错误，章节数据可加载 |
| **Phase 2: 山谷采药** | [05-map-system.md](design-output/v3.0-specs/tech/05-map-system.md), [01-gathering-adventure.md](design-output/v3.0-specs/gameplay/01-gathering-adventure.md), [02-visual-style.md](design-output/v3.0-specs/design/02-visual-style.md) | 地图生成正常，小游戏可玩 |
| **Phase 3: 药灵守护** | [04-battle-system.md](design-output/v3.0-specs/tech/04-battle-system.md), [02-typing-battle.md](design-output/v3.0-specs/gameplay/02-typing-battle.md), [03-animation-effects.md](design-output/v3.0-specs/design/03-animation-effects.md) | 输入响应<100ms，战斗流程完整 |
| **Phase 4: AI导师** | [03-ai-integration.md](design-output/v3.0-specs/tech/03-ai-integration.md), [01-gathering-adventure.md](design-output/v3.0-specs/gameplay/01-gathering-adventure.md) | 对话流畅，缓存有效 |
| **Phase 5: 开放世界** | [04-open-world.md](design-output/v3.0-specs/gameplay/04-open-world.md), [05-map-system.md](design-output/v3.0-specs/tech/05-map-system.md) | 区域解锁正常，事件可触发 |
| **Phase 6: Polish** | [03-animation-effects.md](design-output/v3.0-specs/design/03-animation-effects.md), [04-sound-design.md](design-output/v3.0-specs/design/04-sound-design.md), [06-testing-strategy.md](design-output/v3.0-specs/tech/06-testing-strategy.md) | 所有测试通过，AI验收S级 |

### 关键决策参考

| 决策点 | 参考文档 | 章节 |
|--------|----------|------|
| 技术栈选择 | [01-architecture.md](design-output/v3.0-specs/tech/01-architecture.md) | Tech Stack |
| AI离线优先策略 | [03-ai-integration.md](design-output/v3.0-specs/tech/03-ai-integration.md) | 离线优先架构 |
| 拼音输入支持 | [04-battle-system.md](design-output/v3.0-specs/tech/04-battle-system.md) | 输入处理系统 |
| 地图生成算法 | [05-map-system.md](design-output/v3.0-specs/tech/05-map-system.md) | 地图生成算法 |
| 测试通过标准 | [06-testing-strategy.md](design-output/v3.0-specs/tech/06-testing-strategy.md) | Definition of Done |

---

## 快速开始

### 启动开发服务器
```bash
cd /home/lixiang/Desktop/zhongyi_game/src
npm install
npm run dev
```

### 构建生产版本
```bash
cd /home/lixiang/Desktop/zhongyi_game/src
npm run build
```

---

## Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **State Management**: Zustand (with persistence)
- **Animations**: Framer Motion
- **Styling**: Tailwind CSS + CSS Modules

### 核心组件架构

#### StageManager（v3.0 新增）

阶段管理器，负责6阶段流程的状态管理和流转：

```typescript
// pages/StageManager.tsx
interface StageManagerProps {
  chapterId: string;
}

// 阶段配置
const STAGES = [
  { id: 'mentor-intro', component: MentorIntroStage, title: '师导入门' },
  { id: 'gathering', component: GatheringStage, title: '山谷采药' },
  { id: 'battle', component: BattleStage, title: '药灵守护' },
  { id: 'formula', component: FormulaLearningStage, title: '方剂学习' },
  { id: 'clinical', component: ClinicalStage, title: '临床考核' },
  { id: 'open-world', component: OpenWorldStage, title: '开放世界' },
];

// 阶段流转
const nextStage = () => {
  if (currentStage < 5) {
    setCurrentStage(currentStage + 1);
    saveCheckpoint();
  } else {
    completeChapter();
  }
};
```

#### GatheringStage（改造后）

作为阶段2组件，接收 onComplete 回调：

```typescript
interface GatheringStageProps {
  chapterId: string;
  onComplete: (result: {
    medicines: CollectedMedicine[];
    quality: Record<string, Quality>;
  }) => void;
  onExit: () => void; // 中途退出保存进度
}
```

### AI Services
- **GLM-4**: 文本生成（导师对话、智能出题）
- **Qwen-VL**: 图像理解（药材识别）
- **Seedream**: 图像生成（药材图片）

### 技术特点
- 章节化学习进度持久化
- AI对话流式响应
- 打字战斗实时输入检测
- 地图系统Canvas渲染

---

## 游戏核心循环

```
师导入门 → 山谷采药 → 药灵守护 → 方剂学习 → 临床考核 → 开放世界
   ↑                                                           ↓
   └──────────────── 下一章解锁 ← 技能获得 ← 声望提升 ←───────┘
```

### 六阶段流程（v3.0 核心架构）

每章学习由 **StageManager** 管理的6个线性阶段：

| 阶段 | 名称 | 时长 | 功能 | 状态 |
|------|------|------|------|------|
| 1 | 师导入门 | 5min | AI导师讲解本章目标、介绍4味药材 | Phase 4 |
| 2 | 山谷采药 | 15min | **等角地图探索+采集小游戏** ⭐ | **Phase 2** |
| 3 | 药灵守护 | 5min | 打字战斗巩固知识 | Phase 3 |
| 4 | 方剂学习 | 10min | AI讲解方剂君臣佐使 | Phase 4 |
| 5 | 临床考核 | 10min | 2-3个病案辨证 | Phase 1 |
| 6 | 开放世界 | 5min | 解锁新区域、获得技能 | Phase 5 |

**流程图：**
```
章节选择 → 章节入口(ChapterEntry) → StageManager
                                         ↓
              ┌──────────────────────────────────────────┐
              ↓                                          ↓
        阶段1:师导入门 ──完成──→ 阶段2:山谷采药 ──完成──→ 阶段3:药灵守护
         (MentorIntro)           (GatheringStage)          (BattleStage)
              ↑                                                  ↓
              └────────── 阶段6:开放世界 ←──阶段5:临床考核 ←──阶段4:方剂学习
                (OpenWorldStage)       (ClinicalStage)      (FormulaLearning)
```

**关键设计原则：**
- GatheringStage 不是独立页面，是阶段2的组件
- 阶段流转由 StageManager 统一管理
- 支持断点续玩（每个阶段完成后自动保存）

---

## 数据结构

### 核心实体
- **Chapter** - 章节
- **Medicine** - 药材（v2.0保留）
- **Formula** - 方剂（v2.0保留）
- **ClinicalCase** - 病案（v2.0保留）
- **AIMentor** - AI导师
- **PlayerProgress** - 玩家进度

### 章节进度数据结构

```typescript
// 章节进度 - 保存在 chapterStore
interface ChapterProgress {
  chapterId: string;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  currentStage: number; // 0-5，当前进行到的阶段
  stageProgress: {
    mentorIntro?: { completed: boolean; };
    gathering?: {
      medicinesCollected: string[];
      medicineQuality: Record<string, Quality>;
      exploredTiles: Position[];
    };
    battle?: { score: number; maxCombo: number; };
    formula?: { completedFormulas: string[]; };
    clinical?: { score: number; attempts: number; };
  };
  startTime?: number;
  lastCheckpoint?: number;
  completeTime?: number;
}

// 阶段状态
interface StageState {
  chapterId: string;
  currentStageIndex: number; // 0-5
  isCompleted: boolean;
  checkpoint?: unknown; // 阶段特定的断点数据
}
```

### 断点续玩机制

```typescript
// 自动保存点
const CHECKPOINT_TRIGGERS = [
  'stage_completed',     // 每个阶段完成时
  'medicine_collected',  // 采集到药材时
  'battle_end',          // 战斗胜利/失败时
  'formula_learned',     // 学习完成时
  'clinical_passed',     // 考核通过时
  'manual_save',         // 玩家手动保存
];

// 恢复游戏
function resumeChapter(chapterId: string): StageState {
  const progress = getChapterProgress(chapterId);
  return {
    chapterId,
    currentStageIndex: progress.currentStage,
    isCompleted: false,
    checkpoint: progress.stageProgress,
  };
}
```

---

## 开发工作流（重要）

### 分支管理策略

**⚠️ 必须遵守以下流程，避免合并冲突：**

```
main 分支
  │
  ├── 开发 Phase X 前：
  │   1. git checkout main
  │   2. git pull origin main
  │   3. git merge feature/v3.0-phase(X-1)  ← 合并上一轮开发
  │   4. git push origin main
  │
  ├── 创建新开发分支：
  │   git checkout -b feature/v3.0-phaseX
  │
  └── 开发 Phase X
      │
      └── 完成后：
          1. git checkout main
          2. git pull origin main
          3. git merge feature/v3.0-phaseX
          4. git push origin main
```

### 关键规则

1. **永远从 main 创建新分支** - 确保基于最新代码
2. **开发前先合并上一轮** - 避免长期分支导致的冲突
3. **定期同步 main** - 如果开发周期长，中途同步 main 分支
4. **合并后删除旧分支** - 保持仓库整洁

### 命令示例

```bash
# 开始 Phase 5 开发前
git checkout main
git pull origin main
git merge feature/v3.0-phase4  # 合并上一轮
git push origin main

# 创建新分支
git checkout -b feature/v3.0-phase5

# ... 开发工作 ...

# 完成后合并回 main
git checkout main
git merge feature/v3.0-phase5
git push origin main
git branch -d feature/v3.0-phase5  # 删除已合并分支
```

---

## 开发阶段

### Phase 1: 核心框架（2周）
**参考文档**: [01-architecture.md](design-output/v3.0-specs/tech/01-architecture.md), [02-data-models.md](design-output/v3.0-specs/tech/02-data-models.md), [03-chapter-system.md](design-output/v3.0-specs/gameplay/03-chapter-system.md)

- 20章数据配置
- AI导师基础系统
- 章节进度存储
- 智能出题系统

### Phase 2: 山谷采药（2周）⭐
**参考文档**: [05-map-system.md](design-output/v3.0-specs/tech/05-map-system.md), [01-gathering-adventure.md](design-output/v3.0-specs/gameplay/01-gathering-adventure.md), [02-visual-style.md](design-output/v3.0-specs/design/02-visual-style.md)

**核心目标**: 将 GatheringStage 改造为阶段2组件，创建 StageManager

**任务清单**:
- ✅ 6x6 等角地图系统
- ✅ 玩家移动与地块探索
- ✅ 三种采集小游戏（挖掘/敲击/套索）
- 🔄 **新增**: StageManager 阶段管理器
- 🔄 **新增**: 章节入口页面重构（ChapterEntry）
- 🔄 **新增**: GatheringStage 阶段接口改造
- 🔄 **新增**: 其他阶段占位组件
- 🔄 **新增**: 断点续玩机制
- 🔄 **删除**: v2.0 ValleyScene 遗留系统

**完成标准**:
1. 从章节选择 → 章节入口 → StageManager 流程完整
2. GatheringStage 作为阶段2可被 StageManager 渲染
3. 采集完成可流转到阶段3（占位）
4. 支持中途退出后恢复进度

### Phase 3: 药灵守护（2周）⭐
**参考文档**: [04-battle-system.md](design-output/v3.0-specs/tech/04-battle-system.md), [02-typing-battle.md](design-output/v3.0-specs/gameplay/02-typing-battle.md), [03-animation-effects.md](design-output/v3.0-specs/design/03-animation-effects.md)

- 打字战斗核心系统
- 敌人波次系统
- 连击与技能系统
- 战斗场景与特效

### Phase 4: AI导师（2周）
**参考文档**: [03-ai-integration.md](design-output/v3.0-specs/tech/03-ai-integration.md), [01-gathering-adventure.md](design-output/v3.0-specs/gameplay/01-gathering-adventure.md)

- 导师立绘与表情
- 对话系统
- 苏格拉底引导

### Phase 5: 开放世界（1周）
**参考文档**: [04-open-world.md](design-output/v3.0-specs/gameplay/04-open-world.md), [05-map-system.md](design-output/v3.0-specs/tech/05-map-system.md)

- 区域解锁
- 每日事件
- 技能系统

### Phase 6: Polish（1周）
**参考文档**: [03-animation-effects.md](design-output/v3.0-specs/design/03-animation-effects.md), [04-sound-design.md](design-output/v3.0-specs/design/04-sound-design.md), [06-testing-strategy.md](design-output/v3.0-specs/tech/06-testing-strategy.md)

- 动画效果
- 音效
- Bug修复
- **AI端到端验收**（必做，参考[06-testing-strategy.md](design-output/v3.0-specs/tech/06-testing-strategy.md)）

---

## 设计规范

### 色彩系统
```css
/* 五行色 */
--wood-primary: #2E7D32;
--wood-light: #81C784;
--fire-primary: #C62828;
--fire-light: #EF5350;
--earth-primary: #F9A825;
--earth-light: #FFD54F;
--metal-primary: #78909C;
--metal-light: #B0BEC5;
--water-primary: #1565C0;
--water-light: #42A5F5;

/* 功能色 */
--currency-primary: #FFD700;
--success: #4CAF50;
--error: #F44336;
```

---

## 数据文件

- `药灵数据配置v2.0.json` - 50味药数据
- `方剂数据配置.json` - 20个方剂
- `临床病案数据.json` - 20个病案

---

## 开发团队

| 角色 | 职责 |
|------|------|
| game-designer | 游戏策略兼美术设计 |
| fullstack-dev | 全栈开发工程师 |

---

*Version: v3.0*
*Last Updated: 2026-03-23*

---

## 附录

### 实施计划（开发任务拆分）

| Phase | 名称 | 实施计划 | 预计时间 | 状态 |
|-------|------|----------|----------|------|
| 1 | 核心框架 | [2026-03-23-phase1-core-framework.md](docs/superpowers/plans/2026-03-23-phase1-core-framework.md) | 2周 | ✅ 已完成 |
| 2 | **山谷采药（重构版）** | **[2026-03-24-phase2-refactor-chapter-flow.md](docs/superpowers/plans/2026-03-24-phase2-refactor-chapter-flow.md)** | **2-3天** | 🔄 **待开始** |
| 2 | ~~山谷采药（旧版）~~ | ~~[2026-03-23-phase2-gathering-map.md](docs/superpowers/plans/2026-03-23-phase2-gathering-map.md)~~ | ~~2周~~ | ~~❌ 已废弃~~ |
| 3 | 药灵守护 | [2026-03-23-phase3-battle-system.md](docs/superpowers/plans/2026-03-23-phase3-battle-system.md) | 2周 | 待开始 |
| 4 | AI导师 | [2026-03-23-phase4-ai-mentor.md](docs/superpowers/plans/2026-03-23-phase4-ai-mentor.md) | 2周 | 待开始 |
| 5 | 开放世界 | [2026-03-23-phase5-open-world.md](docs/superpowers/plans/2026-03-23-phase5-open-world.md) | 1周 | 待开始 |
| 6 | Polish | [2026-03-23-phase6-polish-testing.md](docs/superpowers/plans/2026-03-23-phase6-polish-testing.md) | 1周 | 待开始 |

**Phase 2 重构说明**:
- **旧版计划** (`phase2-gathering-map.md`): 将 GatheringStage 作为独立页面实现，与 v3.0 架构不符
- **新版计划** (`phase2-refactor-chapter-flow.md`): 按 v3.0 6阶段流程重构，GatheringStage 作为阶段2组件

**执行方式**: 使用 `superpowers:subagent-driven-development` 或 `superpowers:executing-plans` skill 按Task逐步执行

---

### 测试与验收

**开发前必读**: [06-testing-strategy.md](design-output/v3.0-specs/tech/06-testing-strategy.md)

所有代码提交前必须通过：
1. **TypeScript编译** - 0错误，0警告
2. **单元测试** - 覆盖率>70%
3. **功能测试** - Playwright自动化测试通过
4. **AI端到端测试** - GLM-4游戏体验官评分≥B级

**测试 checklist**:
```bash
# 提交前运行
npm run type-check    # TypeScript检查
npm run test:unit     # 单元测试
npm run test:e2e      # 端到端测试
npm run test:ai       # AI游戏体验测试
```

### 设计文档完整索引

| 类别 | 文档 | 说明 |
|------|------|------|
| **主设计** | [药灵山谷v3.0_融合设计.md](design-output/药灵山谷v3.0_融合设计.md) | v3.0完整设计文档 |
| **技术** | [01-architecture.md](design-output/v3.0-specs/tech/01-architecture.md) | 系统架构 |
| **技术** | [02-data-models.md](design-output/v3.0-specs/tech/02-data-models.md) | 数据模型 |
| **技术** | [03-ai-integration.md](design-output/v3.0-specs/tech/03-ai-integration.md) | AI集成 |
| **技术** | [04-battle-system.md](design-output/v3.0-specs/tech/04-battle-system.md) | 战斗系统 |
| **技术** | [05-map-system.md](design-output/v3.0-specs/tech/05-map-system.md) | 地图系统 |
| **技术** | [06-testing-strategy.md](design-output/v3.0-specs/tech/06-testing-strategy.md) | 测试策略 |
| **玩法** | [01-gathering-adventure.md](design-output/v3.0-specs/gameplay/01-gathering-adventure.md) | 山谷采药 |
| **玩法** | [02-typing-battle.md](design-output/v3.0-specs/gameplay/02-typing-battle.md) | 药灵守护战 |
| **玩法** | [03-chapter-system.md](design-output/v3.0-specs/gameplay/03-chapter-system.md) | 章节系统 |
| **玩法** | [04-open-world.md](design-output/v3.0-specs/gameplay/04-open-world.md) | 开放世界 |
| **设计** | [01-ui-ux.md](design-output/v3.0-specs/design/01-ui-ux.md) | UI/UX规范 |
| **设计** | [02-visual-style.md](design-output/v3.0-specs/design/02-visual-style.md) | 视觉风格 |
| **设计** | [03-animation-effects.md](design-output/v3.0-specs/design/03-animation-effects.md) | 动画特效 |
| **设计** | [04-sound-design.md](design-output/v3.0-specs/design/04-sound-design.md) | 音效设计 |

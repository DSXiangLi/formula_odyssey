# Phase 2 重构实施计划 - v3.0 章节流程架构

> **目标**: 将 GatheringStage 从独立页面改造为阶段2组件，创建 StageManager 管理6阶段流程

**架构**: 章节化学习核心架构 - ChapterEntry → StageManager → 6阶段组件（GatheringStage 作为阶段2）

**状态**: 待开始

---

## 前置检查清单

- [x] 已阅读 `docs/v3.0-architecture-insight.md`
- [x] 已阅读 `design-output/v3.0-specs/gameplay/03-chapter-system.md`
- [x] 已阅读 `design-output/v3.0-specs/tech/02-data-models.md`
- [x] CLAUDE.md 已更新 6阶段流程说明

---

## 文件结构变更

### 需要删除的文件（v2.0 遗留）
| 文件路径 | 说明 |
|---------|------|
| `src/components/scene/ValleyScene.tsx` | v2.0 水晶球种子系统 |
| `src/components/scene/ParticleSystem.tsx` | v2.0 粒子效果 |
| `src/components/seed/Seed.tsx` | v2.0 种子组件 |
| `src/components/seed/SeedDetail.tsx` | v2.0 种子详情 |

### 需要重构的文件
| 文件路径 | 修改内容 |
|---------|---------|
| `src/pages/ChapterEntry.tsx` | 完全重写，从标签页改为章节概览+开始按钮 |
| `src/pages/GatheringStage.tsx` | 添加 onComplete/onExit 接口，移除独立路由逻辑 |
| `src/stores/gameStore.ts` | 移除 v2.0 种子相关逻辑 |
| `src/App.tsx` | 更新路由，移除 `/gathering` 独立路由，添加 `/stage` |
| `src/stores/chapterStore.ts` | 扩展 ChapterProgress 接口 |

### 需要新建的文件
| 文件路径 | 说明 |
|---------|------|
| `src/pages/StageManager.tsx` | 阶段管理核心组件 |
| `src/pages/stages/MentorIntroStage.tsx` | 阶段1: 师导入门（占位） |
| `src/pages/stages/BattleStage.tsx` | 阶段3: 药灵守护（占位） |
| `src/pages/stages/FormulaLearningStage.tsx` | 阶段4: 方剂学习（占位） |
| `src/pages/stages/ClinicalStage.tsx` | 阶段5: 临床考核（占位） |
| `src/pages/stages/OpenWorldStage.tsx` | 阶段6: 开放世界（占位） |
| `src/types/stage.ts` | 阶段相关类型定义 |

---

## Task 1: 清理 v2.0 遗留系统

**描述**: 删除 ValleyScene 及相关 v2.0 组件

**文件**:
- 删除: `src/components/scene/ValleyScene.tsx`
- 删除: `src/components/scene/ParticleSystem.tsx`
- 删除: `src/components/seed/Seed.tsx`
- 删除: `src/components/seed/SeedDetail.tsx`
- 修改: `src/stores/gameStore.ts`（移除种子相关代码）
- 修改: `src/pages/ChapterEntry.tsx`（移除 ValleyScene 引用）

---

- [ ] **Step 1: 删除 ValleyScene 组件**

```bash
rm src/components/scene/ValleyScene.tsx
rm src/components/scene/ParticleSystem.tsx
```

---

- [ ] **Step 2: 删除 Seed 组件**

```bash
rm src/components/seed/Seed.tsx
rm src/components/seed/SeedDetail.tsx
# 如果 seed 目录为空，删除目录
rmdir src/components/seed 2>/dev/null || true
```

---

- [ ] **Step 3: 清理 gameStore.ts**

读取 `src/stores/gameStore.ts`，删除以下代码：
- `generateSeeds` 函数
- `discoverSeeds` 函数
- `collectSeed` action
- seeds 相关的 state 和 actions
- 保留：玩家基础信息、章节进度相关代码

---

- [ ] **Step 4: 验证编译通过**

```bash
cd src && npm run type-check
```

预期: 无 TypeScript 错误（与 seeds 相关的错误）

---

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "refactor: remove v2.0 ValleyScene and seed system

- Delete ValleyScene, ParticleSystem components
- Delete Seed, SeedDetail components
- Clean up gameStore seed-related code
- Prepare for v3.0 chapter flow architecture"
```

---

## Task 2: 创建阶段类型定义

**描述**: 定义 StageManager 和各阶段组件需要的类型

**文件**:
- 创建: `src/types/stage.ts`

---

- [ ] **Step 1: 创建类型定义文件**

```typescript
// src/types/stage.ts

export type StageId =
  | 'mentor-intro'
  | 'gathering'
  | 'battle'
  | 'formula'
  | 'clinical'
  | 'open-world';

export interface StageConfig {
  id: StageId;
  index: number; // 0-5
  title: string;
  component: React.ComponentType<StageProps>;
}

export interface StageProps {
  chapterId: string;
  onComplete: (result?: unknown) => void;
  onExit?: () => void;
  initialData?: unknown; // 用于断点续玩
}

export interface StageState {
  type: 'loading' | 'playing' | 'completed';
  stageIndex: number; // 0-5
  progress?: unknown;
}

// GatheringStage 特定的结果类型
export interface GatheringResult {
  medicines: string[]; // 收集的药材ID
  quality: Record<string, 'normal' | 'good' | 'excellent' | 'legendary'>;
  exploredTiles: number;
}

// 阶段进度（保存在 chapterStore）
export interface StageProgress {
  mentorIntro?: { completed: boolean; };
  gathering?: {
    medicinesCollected: string[];
    medicineQuality: Record<string, string>;
    exploredTiles: Array<{ x: number; y: number }>;
    completed: boolean;
  };
  battle?: {
    score: number;
    maxCombo: number;
    completed: boolean;
  };
  formula?: {
    completedFormulas: string[];
    completed: boolean;
  };
  clinical?: {
    score: number;
    attempts: number;
    completed: boolean;
  };
}
```

---

- [ ] **Step 2: 导出类型**

确保类型可以从主入口导出（如果需要）。

---

- [ ] **Step 3: Commit**

```bash
git add src/types/stage.ts
git commit -m "feat: add stage type definitions for chapter flow

- Define StageId, StageConfig, StageProps
- Define StageState for state machine
- Define stage-specific progress types"
```

---

## Task 3: 创建 StageManager

**描述**: 创建阶段管理核心组件，管理6阶段流程和状态流转

**文件**:
- 创建: `src/pages/StageManager.tsx`

---

- [ ] **Step 1: 创建 StageManager 组件**

```typescript
// src/pages/StageManager.tsx
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useChapterStore } from '../stores/chapterStore';
import type { StageConfig, StageState, GatheringResult } from '../types/stage';

// 懒加载各阶段组件
const MentorIntroStage = lazy(() => import('./stages/MentorIntroStage'));
const GatheringStage = lazy(() => import('./GatheringStage'));
const BattleStage = lazy(() => import('./stages/BattleStage'));
const FormulaLearningStage = lazy(() => import('./stages/FormulaLearningStage'));
const ClinicalStage = lazy(() => import('./stages/ClinicalStage'));
const OpenWorldStage = lazy(() => import('./stages/OpenWorldStage'));

const STAGES: StageConfig[] = [
  { id: 'mentor-intro', index: 0, title: '师导入门', component: MentorIntroStage },
  { id: 'gathering', index: 1, title: '山谷采药', component: GatheringStage },
  { id: 'battle', index: 2, title: '药灵守护', component: BattleStage },
  { id: 'formula', index: 3, title: '方剂学习', component: FormulaLearningStage },
  { id: 'clinical', index: 4, title: '临床考核', component: ClinicalStage },
  { id: 'open-world', index: 5, title: '开放世界', component: OpenWorldStage },
];

const StageManager: React.FC = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const chapterStore = useChapterStore();

  const [stageState, setStageState] = useState<StageState>({
    type: 'loading',
    stageIndex: 0
  });

  // 加载章节进度
  useEffect(() => {
    if (!chapterId) {
      navigate('/');
      return;
    }

    const progress = chapterStore.getProgress(chapterId);
    if (progress) {
      // 恢复断点
      setStageState({
        type: 'playing',
        stageIndex: progress.currentStage,
        progress: progress.stageProgress,
      });
    } else {
      // 新章节，从阶段1开始
      setStageState({
        type: 'playing',
        stageIndex: 0,
      });
      // 初始化章节进度
      chapterStore.initChapterProgress(chapterId);
    }
  }, [chapterId, navigate, chapterStore]);

  // 阶段完成处理
  const handleStageComplete = (result?: unknown) => {
    const currentStageIndex = stageState.stageIndex;

    // 保存阶段进度
    if (chapterId) {
      chapterStore.updateStageProgress(chapterId, currentStageIndex, result);
    }

    if (currentStageIndex < 5) {
      // 进入下一阶段
      setStageState({
        type: 'playing',
        stageIndex: currentStageIndex + 1,
      });
    } else {
      // 章节完成
      setStageState({ type: 'completed', stageIndex: currentStageIndex });
      if (chapterId) {
        chapterStore.completeChapter(chapterId);
      }
      // 延迟后返回章节选择
      setTimeout(() => navigate('/'), 3000);
    }
  };

  // 中途退出处理
  const handleStageExit = () => {
    // 保存当前进度
    if (chapterId) {
      chapterStore.saveCheckpoint(chapterId, stageState.stageIndex, stageState.progress);
    }
    navigate(`/chapter/${chapterId}`);
  };

  if (stageState.type === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 to-emerald-800">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-white/30 border-t-white rounded-full mx-auto mb-4" />
          <p className="text-white/80">加载章节...</p>
        </div>
      </div>
    );
  }

  if (stageState.type === 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 to-emerald-800">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-white mb-4">🎉 章节完成！</h1>
          <p className="text-white/80">正在返回章节选择...</p>
        </motion.div>
      </div>
    );
  }

  const CurrentStageComponent = STAGES[stageState.stageIndex].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-emerald-800">
      {/* 阶段进度指示器 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-white/90 font-medium">
              {STAGES[stageState.stageIndex].title}
            </h2>
            <div className="flex items-center gap-1">
              {STAGES.map((stage, idx) => (
                <div
                  key={stage.id}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    idx === stageState.stageIndex
                      ? 'bg-white'
                      : idx < stageState.stageIndex
                        ? 'bg-white/60'
                        : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 阶段内容 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stageState.stageIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="pt-16"
        >
          <Suspense fallback={
            <div className="flex items-center justify-center h-screen">
              <div className="animate-spin w-8 h-8 border-4 border-white/30 border-t-white rounded-full" />
            </div>
          }>
            <CurrentStageComponent
              chapterId={chapterId!}
              onComplete={handleStageComplete}
              onExit={handleStageExit}
              initialData={stageState.progress}
            />
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default StageManager;
```

---

- [ ] **Step 2: Commit**

```bash
git add src/pages/StageManager.tsx
git commit -m "feat: create StageManager for 6-stage chapter flow

- Implement stage state machine
- Add lazy loading for stage components
- Add checkpoint save/restore
- Add stage progress indicator"
```

---

## Task 4: 扩展 chapterStore

**描述**: 扩展章节进度存储，支持阶段进度和断点续玩

**文件**:
- 修改: `src/stores/chapterStore.ts`

---

- [ ] **Step 1: 读取当前 chapterStore.ts**

```bash
cat src/stores/chapterStore.ts
```

---

- [ ] **Step 2: 扩展 ChapterProgress 接口**

在现有 chapterStore 基础上添加：

```typescript
// 扩展的章节进度
interface ExtendedChapterProgress {
  chapterId: string;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  currentStage: number; // 0-5
  stageProgress: StageProgress;
  startTime?: number;
  lastCheckpoint?: number;
  completeTime?: number;
}

// 阶段进度
interface StageProgress {
  mentorIntro?: { completed: boolean };
  gathering?: {
    medicinesCollected: string[];
    medicineQuality: Record<string, string>;
    exploredTiles: Array<{ x: number; y: number }>;
    completed: boolean;
  };
  battle?: {
    score: number;
    maxCombo: number;
    completed: boolean;
  };
  formula?: {
    completedFormulas: string[];
    completed: boolean;
  };
  clinical?: {
    score: number;
    attempts: number;
    completed: boolean;
  };
}
```

---

- [ ] **Step 3: 添加 StageManager 需要的 actions**

```typescript
// 添加到 chapterStore
interface ChapterStoreActions {
  // 已有 actions...

  // StageManager 专用
  initChapterProgress: (chapterId: string) => void;
  updateStageProgress: (chapterId: string, stageIndex: number, result: unknown) => void;
  saveCheckpoint: (chapterId: string, stageIndex: number, progress: unknown) => void;
  getProgress: (chapterId: string) => ExtendedChapterProgress | null;
  completeChapter: (chapterId: string) => void;
}
```

---

- [ ] **Step 4: Commit**

```bash
git add src/stores/chapterStore.ts
git commit -m "feat: extend chapterStore for stage management

- Add ExtendedChapterProgress interface
- Add StageProgress tracking
- Add checkpoint save/restore actions"
```

---

## Task 5: 创建阶段占位组件

**描述**: 创建5个阶段的占位组件（阶段1,3,4,5,6），阶段2的 GatheringStage 在 Task 6 改造

**文件**:
- 创建: `src/pages/stages/MentorIntroStage.tsx`
- 创建: `src/pages/stages/BattleStage.tsx`
- 创建: `src/pages/stages/FormulaLearningStage.tsx`
- 创建: `src/pages/stages/ClinicalStage.tsx`
- 创建: `src/pages/stages/OpenWorldStage.tsx`
- 创建: `src/pages/stages/index.ts`（导出所有阶段）

---

- [ ] **Step 1: 创建阶段1占位组件**

```typescript
// src/pages/stages/MentorIntroStage.tsx
import React from 'react';
import { motion } from 'framer-motion';
import type { StageProps } from '../../types/stage';

const MentorIntroStage: React.FC<StageProps> = ({ chapterId, onComplete }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center"
      >
        <h1 className="text-3xl font-bold text-white mb-4">👨‍⚕️ 师导入门</h1>
        <p className="text-white/80 mb-6">
          欢迎来到第 {chapterId} 章！我是青木先生，你的AI导师。
        </p>
        <p className="text-white/60 mb-8">
          （此阶段将在 Phase 4 完整实现，包含AI对话和本章介绍）
        </p>
        <button
          onClick={() => onComplete()}
          className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-bold hover:shadow-lg transition-all"
        >
          开始采药 →
        </button>
      </motion.div>
    </div>
  );
};

export default MentorIntroStage;
```

---

- [ ] **Step 2: 创建阶段3-6占位组件**

```typescript
// src/pages/stages/BattleStage.tsx
import React from 'react';
import { motion } from 'framer-motion';
import type { StageProps } from '../../types/stage';

const BattleStage: React.FC<StageProps> = ({ onComplete }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center"
      >
        <h1 className="text-3xl font-bold text-white mb-4">⚔️ 药灵守护</h1>
        <p className="text-white/60 mb-8">
          （此阶段将在 Phase 3 完整实现，包含打字战斗系统）
        </p>
        <button
          onClick={() => onComplete({ score: 1000, maxCombo: 10 })}
          className="px-8 py-3 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-full font-bold hover:shadow-lg transition-all"
        >
          完成战斗 →
        </button>
      </motion.div>
    </div>
  );
};

export default BattleStage;
```

```typescript
// src/pages/stages/FormulaLearningStage.tsx
import React from 'react';
import { motion } from 'framer-motion';
import type { StageProps } from '../../types/stage';

const FormulaLearningStage: React.FC<StageProps> = ({ onComplete }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center"
      >
        <h1 className="text-3xl font-bold text-white mb-4">📚 方剂学习</h1>
        <p className="text-white/60 mb-8">
          （此阶段将在 Phase 4 完整实现，包含AI讲解方剂君臣佐使）
        </p>
        <button
          onClick={() => onComplete()}
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full font-bold hover:shadow-lg transition-all"
        >
          开始学习 →
        </button>
      </motion.div>
    </div>
  );
};

export default FormulaLearningStage;
```

```typescript
// src/pages/stages/ClinicalStage.tsx
import React from 'react';
import { motion } from 'framer-motion';
import type { StageProps } from '../../types/stage';

const ClinicalStage: React.FC<StageProps> = ({ onComplete }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center"
      >
        <h1 className="text-3xl font-bold text-white mb-4">🩺 临床考核</h1>
        <p className="text-white/60 mb-8">
          （此阶段已在 Phase 1 实现 ClinicalCase 组件，待集成）
        </p>
        <button
          onClick={() => onComplete({ score: 100, attempts: 1 })}
          className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full font-bold hover:shadow-lg transition-all"
        >
          完成考核 →
        </button>
      </motion.div>
    </div>
  );
};

export default ClinicalStage;
```

```typescript
// src/pages/stages/OpenWorldStage.tsx
import React from 'react';
import { motion } from 'framer-motion';
import type { StageProps } from '../../types/stage';

const OpenWorldStage: React.FC<StageProps> = ({ onComplete }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center"
      >
        <h1 className="text-3xl font-bold text-white mb-4">🌍 开放世界</h1>
        <p className="text-white/60 mb-8">
          （此阶段将在 Phase 5 完整实现，包含区域解锁和技能奖励）
        </p>
        <button
          onClick={() => onComplete()}
          className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-full font-bold hover:shadow-lg transition-all"
        >
          完成本章 →
        </button>
      </motion.div>
    </div>
  );
};

export default OpenWorldStage;
```

---

- [ ] **Step 3: 创建阶段导出文件**

```typescript
// src/pages/stages/index.ts
export { default as MentorIntroStage } from './MentorIntroStage';
export { default as BattleStage } from './BattleStage';
export { default as FormulaLearningStage } from './FormulaLearningStage';
export { default as ClinicalStage } from './ClinicalStage';
export { default as OpenWorldStage } from './OpenWorldStage';
```

---

- [ ] **Step 4: Commit**

```bash
git add src/pages/stages/
git commit -m "feat: add placeholder components for stages 1,3,4,5,6

- Create MentorIntroStage (Phase 1)
- Create BattleStage (Phase 3)
- Create FormulaLearningStage (Phase 4)
- Create ClinicalStage (Phase 1 - integrate later)
- Create OpenWorldStage (Phase 5)
- Add index.ts for exports"
```

---

## Task 6: 重构 ChapterEntry

**描述**: 完全重写 ChapterEntry，从标签页改为章节概览+开始按钮

**文件**:
- 修改: `src/pages/ChapterEntry.tsx`

---

- [ ] **Step 1: 完全重写 ChapterEntry.tsx**

```typescript
// src/pages/ChapterEntry.tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, RotateCcw, CheckCircle } from 'lucide-react';
import { useChapterStore } from '../stores/chapterStore';
import { getChapter } from '../data/chapters';
import { getMedicineById } from '../data/medicines';
import { getFormulaById } from '../data/formulas';
import type { WuxingType } from '../types';

const wuxingColors: Record<WuxingType, { primary: string; light: string; gradient: string }> = {
  wood: { primary: '#2E7D32', light: '#81C784', gradient: 'from-green-600 to-emerald-700' },
  fire: { primary: '#C62828', light: '#EF5350', gradient: 'from-red-600 to-orange-700' },
  earth: { primary: '#F9A825', light: '#FFD54F', gradient: 'from-yellow-600 to-amber-700' },
  metal: { primary: '#78909C', light: '#B0BEC5', gradient: 'from-gray-500 to-gray-700' },
  water: { primary: '#1565C0', light: '#42A5F5', gradient: 'from-blue-600 to-blue-800' },
};

const wuxingNames: Record<WuxingType, string> = {
  wood: '木',
  fire: '火',
  earth: '土',
  metal: '金',
  water: '水',
};

const ChapterEntry: React.FC = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const chapterStore = useChapterStore();

  if (!chapterId) {
    navigate('/');
    return null;
  }

  const chapter = getChapter(chapterId);
  const progress = chapterStore.getProgress(chapterId);

  if (!chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white">章节不存在</p>
      </div>
    );
  }

  const colors = wuxingColors[chapter.wuxing];
  const status = progress?.status || 'locked';
  const currentStage = progress?.currentStage || 0;

  // 获取药材和方剂信息
  const medicines = chapter.medicines?.map(getMedicineById).filter(Boolean) || [];
  const formulas = chapter.formulas?.map(getFormulaById).filter(Boolean) || [];

  // 处理开始/继续
  const handleStart = () => {
    navigate(`/chapter/${chapterId}/stage`);
  };

  // 处理返回
  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* 顶部导航 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>返回章节选择</span>
          </button>

          {status === 'completed' && (
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle size={20} />
              <span>已完成</span>
            </div>
          )}
        </div>
      </div>

      {/* 主要内容 */}
      <div className="pt-20 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* 章节标题卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gradient-to-br ${colors.gradient} rounded-3xl p-8 mb-6 shadow-2xl`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm text-white">
                    第{chapter.sequence}章
                  </span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm text-white">
                    {wuxingNames[chapter.wuxing]}行 · {chapter.regionName}
                  </span>
                </div>
                <h1 className="text-4xl font-bold text-white mb-2">{chapter.name}</h1>
                <p className="text-white/80 text-lg">{chapter.subtitle}</p>
              </div>

              {/* 五行图标 */}
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-4xl">
                {chapter.wuxing === 'wood' && '🌲'}
                {chapter.wuxing === 'fire' && '🔥'}
                {chapter.wuxing === 'earth' && '🏔️'}
                {chapter.wuxing === 'metal' && '⚔️'}
                {chapter.wuxing === 'water' && '💧'}
              </div>
            </div>

            {/* 预计时长 */}
            <div className="mt-6 flex items-center gap-6 text-white/70">
              <span>⏱️ 预计用时：45分钟</span>
              <span>📚 6个学习阶段</span>
              {status === 'in_progress' && (
                <span>📍 当前阶段：第{currentStage + 1}阶段</span>
              )}
            </div>
          </motion.div>

          {/* 学习内容概览 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
          >
            {/* 本章药材 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>🌿</span> 本章药材（{medicines.length}味）
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {medicines.map((med) => (
                  <div
                    key={med.id}
                    className="bg-white/5 rounded-lg p-3 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-lg">
                      🌿
                    </div>
                    <div>
                      <p className="text-white font-medium">{med.name}</p>
                      <p className="text-white/50 text-sm">{med.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 本章方剂 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>📜</span> 本章方剂（{formulas.length}个）
              </h3>
              <div className="space-y-3">
                {formulas.map((formula) => (
                  <div
                    key={formula.id}
                    className="bg-white/5 rounded-lg p-3"
                  >
                    <p className="text-white font-medium">{formula.name}</p>
                    <p className="text-white/50 text-sm">{formula.category}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* 学习流程 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">📋 学习流程</h3>
            <div className="flex items-center justify-between">
              {[
                { icon: '👨‍⚕️', name: '师导入门', time: '5min' },
                { icon: '🎮', name: '山谷采药', time: '15min' },
                { icon: '⚔️', name: '药灵守护', time: '5min' },
                { icon: '📚', name: '方剂学习', time: '10min' },
                { icon: '🩺', name: '临床考核', time: '10min' },
                { icon: '🌍', name: '开放世界', time: '5min' },
              ].map((stage, idx) => (
                <div key={stage.name} className="flex items-center">
                  <div className="text-center">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-1 ${
                      idx < currentStage
                        ? 'bg-green-500/50'
                        : idx === currentStage
                          ? 'bg-blue-500/50'
                          : 'bg-white/10'
                    }`}>
                      {stage.icon}
                    </div>
                    <p className="text-white/60 text-xs">{stage.name}</p>
                  </div>
                  {idx < 5 && (
                    <div className={`w-4 h-0.5 mx-1 ${
                      idx < currentStage ? 'bg-green-500/50' : 'bg-white/20'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* 操作按钮 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center gap-4"
          >
            {status === 'locked' ? (
              <div className="px-8 py-4 bg-gray-700 rounded-full text-gray-400 flex items-center gap-2">
                <span>🔒</span>
                <span>章节未解锁</span>
              </div>
            ) : status === 'completed' ? (
              <button
                onClick={handleStart}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-bold text-lg flex items-center gap-2 hover:shadow-xl transition-all"
              >
                <RotateCcw size={20} />
                <span>重新学习</span>
              </button>
            ) : status === 'in_progress' ? (
              <button
                onClick={handleStart}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full font-bold text-lg flex items-center gap-2 hover:shadow-xl transition-all"
              >
                <RotateCcw size={20} />
                <span>继续学习（第{currentStage + 1}阶段）</span>
              </button>
            ) : (
              <button
                onClick={handleStart}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-bold text-lg flex items-center gap-2 hover:shadow-xl transition-all"
              >
                <Play size={20} />
                <span>开始本章</span>
              </button>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ChapterEntry;
```

---

- [ ] **Step 2: Commit**

```bash
git add src/pages/ChapterEntry.tsx
git commit -m "feat: completely rewrite ChapterEntry as chapter overview

- Replace tabbed interface with chapter overview
- Add chapter info display (name, wuxing, medicines, formulas)
- Add 6-stage flow visualization
- Add start/continue button based on progress status"
```

---

## Task 7: 改造 GatheringStage

**描述**: 改造 GatheringStage，添加 onComplete/onExit 接口，移除独立路由逻辑

**文件**:
- 修改: `src/pages/GatheringStage.tsx`

---

- [ ] **Step 1: 读取当前 GatheringStage.tsx**

```bash
cat src/pages/GatheringStage.tsx | head -100
```

---

- [ ] **Step 2: 修改 GatheringStage 接口**

添加 StageProps 接口支持：

```typescript
// 在 GatheringStage 文件顶部添加
import type { StageProps } from '../types/stage';
import type { GatheringResult } from '../types/stage';

// 修改组件定义
const GatheringStage: React.FC<StageProps> = ({
  chapterId,
  onComplete,
  onExit,
  initialData
}) => {
  // 组件内部逻辑...

  // 采集完成时调用
  const handleCollectionComplete = (medicineId: string, quality: string) => {
    // 更新状态...

    // 如果4味药都采集完成
    if (collectedMedicines.length >= 4) {
      const result: GatheringResult = {
        medicines: collectedMedicines,
        quality: medicineQualities,
        exploredTiles: exploredTiles.length,
      };
      onComplete(result);
    }
  };

  // 退出时调用
  const handleExit = () => {
    if (onExit) {
      onExit();
    }
  };

  // 渲染...
};
```

---

- [ ] **Step 3: 添加退出按钮**

在 GatheringStage UI 中添加退出按钮：

```typescript
// 在地图容器外部添加退出按钮
<div className="fixed top-20 right-4 z-50">
  <button
    onClick={handleExit}
    className="px-4 py-2 bg-black/50 hover:bg-black/70 text-white rounded-lg backdrop-blur-sm transition-colors"
  >
    退出采药
  </button>
</div>
```

---

- [ ] **Step 4: Commit**

```bash
git add src/pages/GatheringStage.tsx
git commit -m "feat: update GatheringStage for stage integration

- Add StageProps interface support
- Add onComplete callback when all medicines collected
- Add onExit callback for checkpoint save
- Add exit button in UI"
```

---

## Task 8: 更新路由配置

**描述**: 更新 App.tsx 路由，移除 /gathering 独立路由，添加 /stage

**文件**:
- 修改: `src/App.tsx`

---

- [ ] **Step 1: 读取当前 App.tsx**

```bash
cat src/App.tsx
```

---

- [ ] **Step 2: 更新路由配置**

修改路由：

```typescript
// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import ChapterSelect from './pages/ChapterSelect';
import ChapterEntry from './pages/ChapterEntry';
import StageManager from './pages/StageManager';
// 移除 GatheringStage 的独立导入

function App() {
  return (
    <Routes>
      <Route path="/" element={<ChapterSelect />} />
      <Route path="/chapter/:chapterId" element={<ChapterEntry />} />
      {/* 移除独立路由 */}
      {/* <Route path="/chapter/:chapterId/gathering" element={<GatheringStage />} /> */}
      {/* 添加阶段管理路由 */}
      <Route path="/chapter/:chapterId/stage" element={<StageManager />} />
    </Routes>
  );
}

export default App;
```

---

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "refactor: update routing for chapter flow

- Remove /chapter/:id/gathering independent route
- Add /chapter/:id/stage route for StageManager
- Update imports"
```

---

## Task 9: 更新章节数据访问函数

**描述**: 确保 getChapter, getMedicineById, getFormulaById 函数存在且正确

**文件**:
- 检查: `src/data/chapters.ts`
- 检查: `src/data/medicines.ts`
- 检查: `src/data/formulas.ts`

---

- [ ] **Step 1: 检查数据文件**

```bash
ls -la src/data/
```

---

- [ ] **Step 2: 确认导出函数**

确保每个文件都有导出函数：

```typescript
// src/data/chapters.ts
export const getChapter = (id: string): Chapter | undefined => {
  return chapters.find(c => c.id === id);
};

// src/data/medicines.ts
export const getMedicineById = (id: string): Medicine | undefined => {
  return medicines.find(m => m.id === id);
};

// src/data/formulas.ts
export const getFormulaById = (id: string): Formula | undefined => {
  return formulas.find(f => f.id === id);
};
```

---

## Task 10: TypeScript 类型检查

**描述**: 运行 TypeScript 类型检查，确保无错误

---

- [ ] **Step 1: 运行类型检查**

```bash
cd src && npm run type-check 2>&1 | head -50
```

---

- [ ] **Step 2: 修复类型错误**

如果有类型错误，根据错误信息修复。

---

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "chore: fix TypeScript type errors for chapter flow"
```

---

## Task 11: 创建章节流程 E2E 测试

**描述**: 创建新的 E2E 测试，验证完整的章节流程

**文件**:
- 创建: `e2e/tests/chapter-flow/chapter-flow.spec.ts`

---

- [ ] **Step 1: 创建测试文件**

```typescript
// e2e/tests/chapter-flow/chapter-flow.spec.ts
import { test, expect } from '../../fixtures/game-fixtures';

test.describe('Chapter Flow - 6 Stage Journey', () => {

  test('complete chapter flow from entry to completion', async ({ page }) => {
    // 1. 进入章节选择
    await page.goto('/');
    await expect(page.locator('text=章节选择')).toBeVisible();

    // 2. 点击第一章
    await page.click('[data-testid="chapter-chapter-1"]');

    // 3. 验证章节入口页面
    await expect(page).toHaveURL('/chapter/chapter-1');
    await expect(page.locator('[data-testid="chapter-overview"]')).toBeVisible();
    await expect(page.locator('text=本章药材')).toBeVisible();
    await expect(page.locator('text=本章方剂')).toBeVisible();

    // 4. 点击开始本章
    await page.click('[data-testid="start-chapter-button"]');

    // 5. 验证进入 StageManager
    await expect(page).toHaveURL('/chapter/chapter-1/stage');

    // 6. 验证阶段1显示
    await expect(page.locator('text=师导入门')).toBeVisible();

    // 7. 完成阶段1
    await page.click('text=开始采药');

    // 8. 验证进入阶段2 (GatheringStage)
    await expect(page.locator('text=山谷采药')).toBeVisible();
    await expect(page.locator('canvas')).toBeVisible();

    // 9. 快速完成阶段2（测试模式）
    // 这里需要实现测试辅助函数来快速完成采集

    // 10-15. 验证后续阶段...

    // 16. 验证章节完成
    await expect(page.locator('text=章节完成')).toBeVisible();
  });

  test('resume chapter from checkpoint', async ({ page }) => {
    // 1. 开始章节
    await page.goto('/chapter/chapter-1');
    await page.click('[data-testid="start-chapter-button"]');

    // 2. 完成阶段1
    await page.click('text=开始采药');

    // 3. 在阶段2点击退出
    await page.click('text=退出采药');

    // 4. 验证返回章节入口
    await expect(page).toHaveURL('/chapter/chapter-1');

    // 5. 验证显示"继续学习"按钮
    await expect(page.locator('text=继续学习')).toBeVisible();

    // 6. 点击继续学习
    await page.click('[data-testid="continue-chapter-button"]');

    // 7. 验证回到阶段2
    await expect(page.locator('text=山谷采药')).toBeVisible();
  });

  test('chapter entry shows correct status', async ({ page }) => {
    // 测试章节入口显示不同状态
    // - 未解锁
    // - 可开始
    // - 进行中
    // - 已完成
  });
});
```

---

- [ ] **Step 2: Commit**

```bash
git add e2e/tests/chapter-flow/
git commit -m "test: add chapter flow E2E tests

- Add complete chapter flow test
- Add checkpoint resume test
- Add chapter status display test"
```

---

## Task 12: 最终验证

**描述**: 完整验证重构后的系统

---

- [ ] **Step 1: 运行完整类型检查**

```bash
cd src && npm run type-check
```

预期: 0 错误

---

- [ ] **Step 2: 运行单元测试**

```bash
cd src && npm run test:unit
```

预期: 所有测试通过

---

- [ ] **Step 3: 运行 E2E 测试**

```bash
npm run test:e2e
```

预期: 新测试通过

---

- [ ] **Step 4: 手动验证**

1. 启动开发服务器
2. 访问章节选择
3. 点击进入章节
4. 验证章节概览显示正确
5. 点击"开始本章"
6. 验证进入阶段1
7. 完成阶段1进入阶段2
8. 验证 GatheringStage 渲染正常
9. 测试退出和断点续玩

---

- [ ] **Step 5: 最终 Commit**

```bash
git add .
git commit -m "feat: complete Phase 2 refactoring for v3.0 chapter flow

- Remove v2.0 ValleyScene and seed system
- Create StageManager for 6-stage chapter flow
- Rewrite ChapterEntry as chapter overview
- Update GatheringStage for stage integration
- Add placeholder components for stages 1,3,4,5,6
- Extend chapterStore for stage progress tracking
- Update routing for /chapter/:id/stage
- Add chapter flow E2E tests

BREAKING CHANGE: /chapter/:id/gathering route removed
New route: /chapter/:id/stage"
```

---

## 实施顺序总结

```
Task 1: 清理 v2.0 遗留
  ↓
Task 2: 创建类型定义
  ↓
Task 3: 创建 StageManager
  ↓
Task 4: 扩展 chapterStore
  ↓
Task 5: 创建阶段占位组件
  ↓
Task 6: 重构 ChapterEntry
  ↓
Task 7: 改造 GatheringStage
  ↓
Task 8: 更新路由配置
  ↓
Task 9: 确认数据文件
  ↓
Task 10: TypeScript 检查
  ↓
Task 11: E2E 测试
  ↓
Task 12: 最终验证
```

---

## 风险评估

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|---------|
| 删除 v2.0 代码影响其他功能 | 中 | 高 | 仔细审查依赖关系，小步提交 |
| StageManager 状态管理复杂 | 中 | 中 | 使用明确的状态机，充分测试 |
| GatheringStage 改造引入 Bug | 中 | 高 | 保持原有逻辑，只添加接口 |
| 路由变更导致外部链接失效 | 低 | 低 | 项目内部使用，无外部链接 |
| 断点续玩数据格式不兼容 | 低 | 中 | 新版本使用新 key，旧数据忽略 |

---

## 成功标准

- [ ] TypeScript 编译 0 错误
- [ ] 单元测试全部通过
- [ ] 新 E2E 测试全部通过
- [ ] 手动验证章节流程完整
- [ ] GatheringStage 可在阶段2正常游戏
- [ ] 断点续玩功能正常
- [ ] 代码提交到 feature/v3.0-chapter-flow 分支

---

**计划完成时间**: 2-3 天

**负责人**: Claude Code + 开发团队

**审核人**: 待指定

---

*计划创建时间: 2026-03-24*
*版本: v1.0*

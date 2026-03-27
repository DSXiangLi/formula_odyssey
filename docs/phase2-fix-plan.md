# Phase 2 问题修复实施计划

## 问题概述

Phase 2 实现了 GatheringStage（等角地图采集系统），但：
1. ChapterEntry 页面没有入口进入 GatheringStage
2. ValleyScene 种子系统属性命名不一致
3. "开始学习"按钮没有绑定事件
4. 测试遗漏了UI导航流程

## 修复任务清单

### Task 1: 统一 ValleyScene 种子属性命名

**问题：** `isCollected` vs `collected` 命名不一致

**文件：** `src/stores/gameStore.ts`

**修改：**
```typescript
// 将 generateSeeds 中的
isCollected: false,

// 改为
collected: false,
```

**验证：** ValleyScene 能正确显示种子

---

### Task 2: 在 ChapterEntry 添加进入采集关卡的入口

**问题：** 用户无法从UI进入 GatheringStage

**文件：** `src/pages/ChapterEntry.tsx`

**修改：**
1. 在"山谷场景"标签页添加"开始采药"按钮
2. 点击后导航到 `/chapter/:chapterId/gathering`

**代码：**
```typescript
// 在 ValleyScene 下方添加
<div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30">
  <button
    onClick={() => navigate(`/chapter/${chapterId}/gathering`)}
    className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
  >
    🎮 开始采药
  </button>
</div>
```

---

### Task 3: 修复"开始学习"按钮

**问题：** 方剂标签页的"开始学习"按钮没有 onClick

**文件：** `src/pages/ChapterEntry.tsx`

**决策：** 点击后应该发生什么？

选项A：显示方剂详情弹窗（v2.0原有功能）
选项B：直接进入 GatheringStage 并定位到相关药材
选项C：暂时隐藏此按钮，因为Phase 2重点是采集

**建议：** 选择A，保持v2.0原有功能

---

### Task 4: 确保种子默认被发现

**问题：** ValleyScene 过滤 `seed.discovered`，但默认 `discovered: false`

**文件：** `src/stores/gameStore.ts`

**修改：**
```typescript
// generateSeeds 中
discovered: true,  // 改为默认被发现，或

// 或者在 ValleyScene 中移除 discovered 过滤
```

**建议：** 在 `discoverSeeds` 调用中增加初始种子数量，确保有种子可见

---

### Task 5: 创建UI导航流程测试

**文件：** `e2e/tests/phase2/navigation-flow.spec.ts`

**测试场景：**
1. 从首页进入章节选择
2. 点击章节进入章节入口
3. 验证"开始采药"按钮可见
4. 点击按钮进入采集关卡
5. 验证地图渲染
6. 验证可以移动和触发小游戏

---

### Task 6: 创建数据一致性测试

**文件：** `e2e/tests/phase2/data-consistency.spec.ts`

**测试内容：**
1. 验证种子属性命名一致性
2. 验证 localStorage 数据结构
3. 验证地图状态保存和恢复

---

### Task 7: 验证小游戏可触发

**文件：** `e2e/tests/phase2/minigame-trigger.spec.ts`

**测试内容：**
1. 进入采集关卡
2. 移动到有药材的地块
3. 验证小游戏弹窗出现
4. 验证可以完成小游戏
5. 验证获得药材奖励

---

## 修复顺序

```
Task 1 (属性命名) → Task 4 (种子可见) → Task 2 (添加入口)
       ↓
Task 3 (按钮事件) → Task 5/6/7 (测试)
       ↓
全面验证
```

## 成功标准

1. ✅ 从 ChapterEntry 可以点击"开始采药"进入 GatheringStage
2. ✅ ValleyScene 显示可见的种子（至少2-3个）
3. ✅ GatheringStage 地图可交互，可以移动
4. ✅ 点击有药材的地块触发小游戏
5. ✅ 完成小游戏获得药材
6. ✅ 所有新测试通过

---

## 需要用户决策的问题

### 问题1：方剂"开始学习"按钮
**选项：**
A. 实现方剂详情弹窗（v2.0功能）
B. 隐藏此按钮，Phase 2专注采集
C. 点击后进入 GatheringStage

### 问题2：ValleyScene 和 GatheringStage 的关系
**选项：**
A. 完全替换：ChapterEntry 只保留"开始采药"按钮，移除 ValleyScene
B. 并存：ValleyScene 作为预览，GatheringStage 作为深度玩法
C. 整合：在 GatheringStage 中显示种子外观

请确认修复方案。

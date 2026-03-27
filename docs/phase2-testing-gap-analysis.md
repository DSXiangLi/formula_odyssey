# Phase 2 测试遗漏与问题分析报告

## 核心发现：两套系统并存但无连接

### 系统设计矛盾

| 系统 | 用途 | 位置 | 状态 |
|------|------|------|------|
| ValleyScene (v2.0) | 章节入口页面展示 | ChapterEntry.tsx | 已集成，但种子属性命名错误 |
| GatheringStage (Phase 2) | 等角地图采集关卡 | /chapter/:id/gathering | 已实现，但无入口 |

### 关键问题：没有导航入口

从 ChapterEntry 页面，用户**没有办法**进入 GatheringStage：
- "山谷场景"标签 = ValleyScene（背景图+种子）
- "开始学习"按钮 = 无事件处理器
- 没有"进入采集关卡"按钮或链接

---

## 测试遗漏清单

### 1. UI导航流程测试（完全遗漏）

**缺失测试：**
- [ ] 从章节选择 -> 章节入口 -> 采集关卡 的完整导航
- [ ] "开始学习"按钮点击后应跳转到采集关卡
- [ ] 章节入口页面应有明确的"开始采药"入口

**为什么遗漏：**
- 测试直接访问URL `/chapter/chapter-1/gathering`
- 没有模拟真实用户从UI点击进入的流程

### 2. 数据一致性测试（严重遗漏）

**缺失测试：**
- [ ] ValleyScene 的种子属性命名一致性（`isCollected` vs `collected`）
- [ ] ValleyScene 和 GatheringStage 的数据共享
- [ ] 从ValleyScene点击种子后应触发GatheringStage的地图定位

**发现的命名不一致：**
```typescript
// gameStore.ts 生成种子时
isCollected: false,  // 存储使用 isCollected
isVisible: true,
discovered: false,

// Seed.tsx 组件中
if (seed.collected) { ... }  // 组件使用 collected

// ValleyScene.tsx 中
seed.discovered  // 过滤条件是 discovered
```

### 3. 功能完整性测试（部分遗漏）

| 功能 | 设计文档要求 | 实现状态 | 测试覆盖 |
|------|-------------|---------|---------|
| 6x6等角地图 | ✅ | ✅ | ✅ |
| 玩家移动 | ✅ | ✅ | ✅ |
| 挖掘小游戏 | ✅ | ✅ | ✅ |
| 敲击小游戏 | ✅ | ✅ | ✅ |
| 套索小游戏 | ✅ | ✅ | ✅ |
| 小游戏触发 | 点击地图药材 | ⚠️ 未连接 | ❌ 未测试 |
| 时辰系统 | 12时辰影响采集 | ❌ 未实现 | ❌ 未测试 |
| 天气系统 | 7种天气效果 | ❌ 未实现 | ❌ 未测试 |
| 体力系统 | 20点体力限制 | ❌ 未实现 | ❌ 未测试 |
| 工具系统 | 6种工具+升级 | ❌ 未实现 | ❌ 未测试 |
| 随机事件 | 7种事件 | ❌ 未实现 | ❌ 未测试 |
| 品质系统 | 4级品质 | ⚠️ 部分实现 | ⚠️ 部分测试 |

### 4. 用户体验测试（完全遗漏）

**缺失测试：**
- [ ] 首次进入游戏的引导流程
- [ ] 种子/药材的可见性和可点击性
- [ ] 小游戏的可玩性和难度平衡
- [ ] 错误处理和边界情况

---

## 根本原因分析

### 1. 文档层面
- **设计文档**（01-gathering-adventure.md）和**实施计划**（2026-03-23-phase2-gathering-map.md）描述的是两套不同系统
- 没有明确说明如何从旧版（ValleyScene）过渡到新版（GatheringStage）

### 2. 实现层面
- Phase 2 实现了 GatheringStage，但没有替换 ValleyScene
- 两个系统独立运行，数据不互通
- ChapterEntry 没有提供进入 GatheringStage 的入口

### 3. 测试层面
- 测试直接访问URL，没有验证UI导航
- 没有测试数据一致性（属性命名）
- AI视觉测试无法发现功能性问题

---

## 修复方案

### 方案A：完全替换（推荐）
1. 在 ChapterEntry 移除 ValleyScene
2. 添加"开始采药"按钮，跳转到 GatheringStage
3. 修复种子属性命名
4. 确保 GatheringStage 完全替代 ValleyScene 的功能

### 方案B：双系统并存
1. 保留 ValleyScene 作为"快速预览"
2. 添加明确的"进入采集关卡"按钮
3. 实现 ValleyScene 和 GatheringStage 的数据同步
4. 用户可以选择简单收集（Valley）或深度探索（Gathering）

---

## 建议的测试策略改进

1. **增加UI流程测试**：从首页开始，逐步点击进入每个功能
2. **增加数据一致性测试**：检查store中的数据命名和类型
3. **增加用户场景测试**：模拟真实用户的操作流程
4. **减少直接URL访问测试**：除非是API测试
5. **增加边界条件测试**：空状态、错误状态、加载状态

---

*分析日期：2026-03-24*
*分析师：Claude Code*

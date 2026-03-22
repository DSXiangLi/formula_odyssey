# AI游戏体验官 (AI Game Experience Officer)

药灵山谷 v3.0 自动化测试与体验优化系统

## 系统概述

AI游戏体验官是一个基于AI的自动化测试和体验优化系统，能够：
- 自动完成游戏全流程体验
- 评估游戏体验和教学质量
- 生成详细的优化建议
- 与开发团队持续对话改进

## 核心组件

| 文件 | 功能 |
|------|------|
| `AIExperienceOfficer.ts` | 核心类，测试执行、评分、报告生成 |
| `optimizationDialogue.ts` | 优化对话系统，自动迭代改进 |
| `cli.ts` | 交互式命令行界面 |
| `experience.spec.ts` | Playwright测试用例 |
| `run-experience-officer.ts` | 快速启动脚本 |

## 体验评估维度

| 维度 | 权重 | 评估标准 |
|------|------|----------|
| 游戏性 | 25% | 趣味性、挑战性、成就感 |
| 教学效果 | 30% | 知识传递、记忆效果、理解深度 |
| 用户体验 | 25% | 界面直观、操作流畅、反馈清晰 |
| 中医专业性 | 20% | 内容准确、引经据典、符合传统 |

## 使用方法

### 方式1：交互式CLI（推荐）

```bash
cd /home/lixiang/Desktop/zhongyi_game/src
tsx tests/ai-experience-officer/cli.ts
```

功能菜单：
1. 🔬 运行完整体验测试
2. 💬 与AI体验官对话
3. 📊 查看当前评分
4. 🔄 启动持续优化循环
5. 📈 生成优化报告
6. ❌ 退出

### 方式2：自动优化模式

```bash
cd /home/lixiang/Desktop/zhongyi_game/src
tsx tests/ai-experience-officer/optimizationDialogue.ts
```

自动运行优化循环，直到达到目标分数。

### 方式3：Playwright测试

```bash
# 安装依赖
npm install @playwright/test

# 运行测试
npx playwright test tests/ai-experience-officer/experience.spec.ts

# 生成报告
npx playwright show-report
```

### 方式4：npm脚本

在 `package.json` 中添加：

```json
{
  "scripts": {
    "test:experience": "tsx tests/ai-experience-officer/cli.ts",
    "test:experience:auto": "tsx tests/ai-experience-officer/optimizationDialogue.ts",
    "experience-officer": "tsx tests/ai-experience-officer/run-experience-officer.ts"
  }
}
```

然后运行：

```bash
npm run experience-officer
```

## 对话示例

```
👤 你: 评分怎么样？

🤖 AI体验官: 当前综合评分 78/100。

各维度得分：
  📚 教学效果:  82/100 ✨
  🎮 游戏性:    76/100 👍
  🖱️  用户体验:  74/100 👍
  🏥 专业性:    85/100 ✨

距离目标 90 分还有 12 分差距。

👤 你: 有哪些问题？

🤖 AI体验官: 发现了 2 个主要问题：

1. 🔴 第3章难度曲线过陡
   位置: 第3章 | 严重程度: major
   影响: 可能导致玩家挫败感

2. 🟡 AI响应偶尔延迟
   位置: AI对话 | 严重程度: minor
   影响: 体验不够流畅

👤 你: 给出优化建议

🤖 AI体验官: 基于测试分析，我为你生成 3 条优化建议：

1. 🔴 优化章节难度曲线
   [CRITICAL] 第2-3章之间难度跳跃过大
   预期影响: ★★★★★★★★★☆ | 实施难度: medium

2. 🟡 增强AI出题多样性
   [IMPROVEMENT] 增加情景题和对比题比例
   预期影响: ★★★★★★★☆☆☆ | 实施难度: medium

👤 你: 可以发布吗？

🤖 AI体验官: 🤔 还有一些改进空间。

当前评分 78 分，距离目标还有 12 分差距。
建议继续优化后再发布，以确保最佳用户体验。

可以通过"启动持续优化循环"功能自动迭代改进。
```

## 持续优化循环

```
        ┌─────────────┐
        │   自动测试   │
        └──────┬──────┘
               ▼
        ┌─────────────┐
        │  体验评估   │
        └──────┬──────┘
               ▼
        ┌─────────────┐
        │ 生成建议   │◄─────┐
        └──────┬──────┘      │
               ▼             │
        ┌─────────────┐      │
        │ 开发团队   │      │
        │ 讨论决策   │      │
        └──────┬──────┘      │
               ▼             │
        ┌─────────────┐      │
        │ 实施优化   │──────┘  (不满意继续迭代)
        └─────────────┘
```

## 配置文件

创建 `experience.config.ts`：

```typescript
export default {
  targetScore: 90,          // 目标总分
  minDimensionScore: 80,    // 各维度最低分
  maxIterations: 10,        // 最大优化迭代次数
  screenshotOnFailure: true, // 失败时截图
  recordVideo: true,         // 录制视频
  chapters: [1, 2, 3, 4, 5], // 测试章节
};
```

## 测试报告示例

```markdown
# 游戏体验优化报告

**生成时间**: 2026-03-22 14:30:00
**目标分数**: 90
**当前分数**: 85
**目标达成**: ❌ 否

## 详细评分

| 维度 | 分数 | 状态 |
|------|------|------|
| 游戏性 | 83 | ⚠️ |
| 教学效果 | 87 | ✅ |
| 用户体验 | 81 | ✅ |
| 专业性 | 89 | ✅ |

## 优化建议

### 1. 优化章节难度曲线 [CRITICAL]

- **影响**: 9/10
- **难度**: medium
- **负责**: content-dev
- **描述**: 第2-3章之间难度跳跃过大，建议增加过渡关卡
- **理由**: 合适的难度曲线是留存的关键

## 行动项

| 优先级 | 任务 | 负责 | 预计工时 |
|--------|------|------|----------|
| 1 | 优化第3章难度曲线 | content-dev | 8h |
| 2 | 增强AI响应缓存 | ai-dev | 4h |
```

## 与AI体验官对话的最佳实践

1. **询问评分**: "评分怎么样？" / "分数多少？"
2. **发现问题**: "有什么问题？" / "发现了什么bug？"
3. **获取建议**: "给出建议" / "如何优化？"
4. **特定维度**: "教学效果如何？" / "用户体验怎么样？"
5. **发布决策**: "可以发布吗？" / "满意吗？"
6. **优先建议**: "哪个最重要？" / "先做什么？"

## 集成到CI/CD

```yaml
# .github/workflows/experience-test.yml
name: Experience Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Experience Officer
        run: |
          npm install
          npm run test:experience
      - name: Check Score
        run: |
          if [ $(cat reports/score.txt) -lt 90 ]; then
            echo "体验评分未达标"
            exit 1
          fi
```

## 预期效果

通过AI游戏体验官的持续优化：
- 发现人工测试难以察觉的体验问题
- 获得专业、客观的游戏评估
- 缩短优化迭代周期
- 提升最终游戏品质

让AI不仅是游戏内容的生成者，也是游戏体验的守护者和优化者。

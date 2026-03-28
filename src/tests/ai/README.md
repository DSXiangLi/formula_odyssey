# AI端到端测试系统

药灵山谷v3.0 - AI驱动的游戏体验测试框架

## 概述

本测试系统使用Playwright + AI智能判断，对游戏进行端到端的自动化测试。

## 测试覆盖

### 1. 战斗系统同步修复验证 (BATTLE-*)
- **BATTLE-001**: 敌人安全期验证 - 验证2秒安全期内不攻击
- **BATTLE-002**: 输入同步验证 - 验证输入与敌人匹配同步
- **BATTLE-003**: 战斗速度调整验证 - 验证敌人速度和攻击间隔已降低
- **BATTLE-004**: 事件驱动状态更新验证 - 验证100ms轮询改为事件驱动

### 2. 记忆翻牌游戏验证 (MEMORY-*)
- **MEMORY-001**: 游戏界面和布局验证 - 6x4网格，24张卡牌
- **MEMORY-002**: 卡牌翻转和匹配逻辑 - 翻转和配对机制
- **MEMORY-003**: 计分和连击系统 - 分数计算和连击加成
- **MEMORY-004**: 计时器功能验证 - 60秒倒计时
- **MEMORY-005**: 游戏完成流程 - 结果展示和流转

### 3. 方剂学习AI集成验证 (FORMULA-*)
- **FORMULA-001**: AI导师对话框显示 - 导师形象和对话框
- **FORMULA-002**: 方剂讲解流程 - 方剂信息显示
- **FORMULA-003**: 君臣佐使解析 - 配伍角色讲解
- **FORMULA-004**: 互动问答功能 - 测验和反馈
- **FORMULA-005**: 阶段完成流转 - 学习完成流程

### 4. 集成测试 (INTEGRATION-*)
- **INTEGRATION-001**: 完整章节流程 - 从进入到完成
- **INTEGRATION-002**: 阶段跳转测试 - StageManager跳转

## 使用方法

### 运行所有测试

```bash
npm run test:ai
```

### 运行特定类别测试

```bash
npm run test:ai -- --category battle
npm run test:ai -- --category gathering
npm run test:ai -- --category formula
npm run test:ai -- --category integration
```

### 运行特定测试用例

```bash
npm run test:ai -- --test BATTLE-001
npm run test:ai -- --test MEMORY-002
npm run test:ai -- --test FORMULA-003
```

### 列出所有测试

```bash
npm run test:ai -- --list
```

## 环境变量

- `TEST_BASE_URL`: 测试基础URL (默认: http://localhost:5173)
- `HEADLESS`: 是否无头模式 (默认: true)

## 文件结构

```
src/tests/ai/
├── ai-tester.ts              # AI测试官核心类
├── battle-sync.test.ts       # 战斗同步修复测试
├── memory-game.test.ts       # 记忆翻牌游戏测试
├── formula-learning.test.ts  # 方剂学习AI集成测试
├── run-tests.ts              # 测试运行器
├── report-generator.ts       # 报告生成器
├── cli.js                    # 命令行入口
└── README.md                 # 本文档
```

## 测试报告

测试完成后，报告将保存在 `test-reports/ai-e2e-report.json`。

可以使用 `report-generator.ts` 生成HTML或Markdown格式的报告：

```typescript
import { ReportGenerator } from './report-generator';
import report from '../test-reports/ai-e2e-report.json';

// 生成Markdown报告
const md = ReportGenerator.generateMarkdown(report, {
  format: 'markdown',
  detailLevel: 'detailed'
});

// 生成HTML报告
const html = ReportGenerator.generateHTML(report, {
  format: 'html',
  detailLevel: 'standard'
});
```

## 评分标准

| 等级 | 分数 | 描述 |
|------|------|------|
| S | ≥95% | 优秀，可直接发布 |
| A | ≥85% | 良好，小优化后发布 |
| B | ≥70% | 及格，需要改进 |
| C | ≥60% | 不及格，需大修 |
| F | <60% | 不可用 |

## 注意事项

1. 运行测试前确保开发服务器已启动 (`npm run dev`)
2. 首次运行会下载Playwright浏览器
3. 测试过程中请勿操作浏览器窗口
4. 测试截图保存在 `test-reports/screenshots/` 目录

## 扩展测试

添加新测试用例：

```typescript
// src/tests/ai/my-test.test.ts
import { AITestCase } from './ai-tester';

export const myTestCases: AITestCase[] = [
  {
    id: 'MY-001',
    name: '我的测试',
    description: '测试描述',
    category: 'integration',
    steps: [
      {
        id: 'step-1',
        action: 'navigate',
        value: '/',
        description: '导航到首页',
        expected: 'text:药灵山谷',
      },
      // 更多步骤...
    ],
    expectedResults: ['结果1', '结果2'],
    successCriteria: [
      { type: 'functional', description: '功能正常', weight: 100 },
    ],
  },
];

export default myTestCases;
```

然后在 `run-tests.ts` 中导入：

```typescript
import myTestCases from './my-test.test';

const allTestCases = [
  ...battleSyncTestCases,
  ...memoryGameTestCases,
  ...formulaLearningTestCases,
  ...myTestCases, // 添加新测试
];
```

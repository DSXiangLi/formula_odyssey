# AI端到端测试配置说明

## 概述

本文档说明如何配置和运行药灵山谷v3.0的AI端到端测试系统。

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 安装Playwright浏览器

```bash
npx playwright install chromium
```

### 3. 确保开发服务器运行

```bash
npm run dev
```

### 4. 运行测试

```bash
# 运行所有AI端到端测试
npm run test:ai:e2e

# 或运行特定类别
npm run test:ai:e2e -- --category battle
npm run test:ai:e2e -- --category gathering
npm run test:ai:e2e -- --category formula
```

## 测试用例详情

### 战斗系统同步修复 (4个测试)

| 测试ID | 名称 | 验证内容 |
|--------|------|----------|
| BATTLE-001 | 敌人安全期验证 | 2秒安全期内不攻击 |
| BATTLE-002 | 输入同步验证 | 输入与敌人匹配同步 |
| BATTLE-003 | 战斗速度调整验证 | 速度和攻击间隔降低 |
| BATTLE-004 | 事件驱动状态更新验证 | 无100ms轮询 |

### 记忆翻牌游戏 (5个测试)

| 测试ID | 名称 | 验证内容 |
|--------|------|----------|
| MEMORY-001 | 游戏界面和布局验证 | 6x4网格，24张牌 |
| MEMORY-002 | 卡牌翻转和匹配逻辑 | 翻转和配对机制 |
| MEMORY-003 | 计分和连击系统 | 分数和连击计算 |
| MEMORY-004 | 计时器功能验证 | 60秒倒计时 |
| MEMORY-005 | 游戏完成流程 | 结果展示和流转 |

### 方剂学习AI集成 (5个测试)

| 测试ID | 名称 | 验证内容 |
|--------|------|----------|
| FORMULA-001 | AI导师对话框显示 | 导师形象和对话框 |
| FORMULA-002 | 方剂讲解流程 | 方剂信息显示 |
| FORMULA-003 | 君臣佐使解析 | 配伍角色讲解 |
| FORMULA-004 | 互动问答功能 | 测验和反馈 |
| FORMULA-005 | 阶段完成流转 | 学习完成流程 |

## 配置选项

### 环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| TEST_BASE_URL | http://localhost:5173 | 测试目标URL |
| HEADLESS | true | 是否无头模式运行 |

### 示例

```bash
# 测试生产环境
TEST_BASE_URL=https://fangling-valley.com npm run test:ai:e2e

# 显示浏览器窗口（非无头模式）
HEADLESS=false npm run test:ai:e2e
```

## 测试结果

### 报告位置

- JSON报告: `test-reports/ai-e2e-report.json`
- HTML报告: `test-reports/ai-e2e-report.html`（需生成）
- Markdown报告: `test-reports/ai-e2e-report.md`（需生成）

### 生成报告

```bash
# 生成HTML报告
npm run test:ai:report html

# 生成Markdown报告
npm run test:ai:report md
```

### 评分等级

| 等级 | 分数 | 含义 |
|------|------|------|
| S | ≥95% | 优秀，可直接发布 |
| A | ≥85% | 良好，小优化后发布 |
| B | ≥70% | 及格，需要改进 |
| C | ≥60% | 不及格，需大修 |
| F | <60% | 不可用 |

## 故障排除

### 浏览器启动失败

```bash
# 重新安装Playwright
npx playwright install --force
```

### 测试超时

- 检查开发服务器是否运行
- 增加超时时间: `TEST_TIMEOUT=60000 npm run test:ai:e2e`

### 页面加载失败

- 检查 `TEST_BASE_URL` 是否正确
- 确认端口没有冲突

## CI/CD集成

### GitHub Actions示例

```yaml
name: AI端到端测试

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ai-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install chromium
      - run: npm run test:ai:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-reports
          path: test-reports/
```

## 扩展测试

### 添加新测试用例

1. 在对应测试文件中添加用例
2. 遵循现有格式和命名规范
3. 更新本文档

### 添加新类别

1. 创建新的测试文件
2. 在 `run-tests.ts` 中导入并添加
3. 更新分类统计逻辑

## 注意事项

1. 测试前确保开发服务器运行
2. 首次运行会下载浏览器，可能较慢
3. 测试过程中请勿操作浏览器窗口
4. 截图会保存在 `test-reports/screenshots/`

## 联系

如有问题，请联系开发团队。

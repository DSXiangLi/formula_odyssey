# AI端到端测试执行检查清单

## 前置条件检查

在运行AI端到端测试前，请确认以下事项：

### ✅ 开发环境

- [ ] Node.js 版本 >= 18
- [ ] npm 包已安装 (`npm install`)
- [ ] Playwright 浏览器已安装 (`npx playwright install chromium`)
- [ ] TypeScript 编译无错误 (`npm run type-check`)

### ✅ 开发服务器

- [ ] 开发服务器正在运行 (`npm run dev`)
- [ ] 服务器地址可访问 (默认: http://localhost:5173)
- [ ] 应用可正常加载首页

### ✅ 测试文件

- [ ] `src/tests/ai/ai-tester.ts` 存在
- [ ] `src/tests/ai/battle-sync.test.ts` 存在
- [ ] `src/tests/ai/memory-game.test.ts` 存在
- [ ] `src/tests/ai/formula-learning.test.ts` 存在
- [ ] `src/tests/ai/run-tests.ts` 存在
- [ ] `src/tests/ai/report-generator.ts` 存在
- [ ] `src/tests/ai/cli.js` 存在

### ✅ 配置文件

- [ ] `package.json` 已更新测试脚本
- [ ] `playwright.config.ts` 配置正确

### ✅ 目录结构

```
src/tests/ai/
├── ai-tester.ts              ✅
├── battle-sync.test.ts       ✅
├── memory-game.test.ts       ✅
├── formula-learning.test.ts  ✅
├── run-tests.ts              ✅
├── report-generator.ts       ✅
├── cli.js                    ✅
├── README.md                 ✅
├── CONFIG.md                 ✅
└── CHECKLIST.md              ✅ (本文件)
```

## 测试执行命令

### 快速测试

```bash
# 运行所有测试
npm run test:ai:e2e

# 或完整命令
npm run test:ai:full
```

### 分类测试

```bash
# 战斗系统测试
npm run test:ai:e2e -- --category battle

# 采药游戏测试
npm run test:ai:e2e -- --category gathering

# 方剂学习测试
npm run test:ai:e2e -- --category formula

# 集成测试
npm run test:ai:e2e -- --category integration
```

### 单个测试

```bash
# 测试特定用例
npm run test:ai:e2e -- --test BATTLE-001
npm run test:ai:e2e -- --test MEMORY-002
npm run test:ai:e2e -- --test FORMULA-003
```

### 查看测试列表

```bash
npm run test:ai:e2e -- --list
```

## 测试覆盖范围

### 1. 战斗系统同步修复 (4个测试)

| 测试ID | 验证内容 |
|--------|----------|
| BATTLE-001 | 敌人出现后2秒安全期 |
| BATTLE-002 | 输入与敌人匹配同步 |
| BATTLE-003 | 敌人速度和攻击间隔降低 |
| BATTLE-004 | 事件驱动状态更新 |

### 2. 记忆翻牌游戏 (5个测试)

| 测试ID | 验证内容 |
|--------|----------|
| MEMORY-001 | 6x4网格布局 |
| MEMORY-002 | 卡牌翻转和匹配 |
| MEMORY-003 | 计分和连击系统 |
| MEMORY-004 | 60秒计时器 |
| MEMORY-005 | 游戏完成流程 |

### 3. 方剂学习AI集成 (5个测试)

| 测试ID | 验证内容 |
|--------|----------|
| FORMULA-001 | AI导师对话框显示 |
| FORMULA-002 | 方剂讲解流程 |
| FORMULA-003 | 君臣佐使解析 |
| FORMULA-004 | 互动问答功能 |
| FORMULA-005 | 阶段完成流转 |

## 预期输出

### 测试执行时

```
======================================================================
药灵山谷v3.0 - AI端到端测试
======================================================================
测试时间: 2026/03/28 15:30:45
测试基础URL: http://localhost:5173
测试用例数: 16
======================================================================
[系统] 浏览器初始化完成

======================================================================
[类别] 战斗系统测试
======================================================================
[测试] BATTLE-001: 敌人安全期验证
[描述] 验证敌人出现后2秒内不会攻击玩家
--------------------------------------------------------------
  ✅ 步骤通过: 导航到战斗阶段
  ✅ 步骤通过: 等待战斗场景加载
  ✅ 步骤通过: 记录初始状态
  ✅ 步骤通过: 等待敌人出现（在安全期内）
  ✅ 步骤通过: 验证安全期内血量未减少

...

======================================================================
测试报告
======================================================================
总体评分: 85%
通过测试: 15/16
失败测试: 1/16

总体评分: A (85%) - 良好，小优化后发布

详细结果:
--------------------------------------------------------------
✅ BATTLE-001: 敌人安全期验证 (100%)
✅ BATTLE-002: 输入同步验证 (100%)
✅ BATTLE-003: 战斗速度调整验证 (90%)
✅ BATTLE-004: 事件驱动状态更新验证 (100%)
✅ MEMORY-001: 游戏界面和布局验证 (100%)
...

[系统] 报告已保存到: ./test-reports/ai-e2e-report.json
[系统] 浏览器已关闭
```

### 测试报告文件

- `test-reports/ai-e2e-report.json` - JSON格式完整数据
- `test-reports/ai-e2e-report.html` - HTML可视化报告（需生成）
- `test-reports/ai-e2e-report.md` - Markdown文本报告（需生成）

## 故障排除

### 问题1: 浏览器启动失败

```bash
# 解决: 重新安装Playwright
npx playwright install --force chromium
```

### 问题2: 页面加载超时

```bash
# 检查开发服务器
npm run dev

# 或指定正确的URL
TEST_BASE_URL=http://localhost:3000 npm run test:ai:e2e
```

### 问题3: TypeScript错误

```bash
# 检查类型
npm run type-check

# 修复错误后重新运行测试
```

### 问题4: 测试步骤失败

1. 检查元素选择器是否正确
2. 确认页面已完全加载
3. 查看截图: `test-reports/screenshots/`

## 评分标准

| 等级 | 分数 | 行动 |
|------|------|------|
| S | ≥95% | 🎉 可直接发布 |
| A | ≥85% | ✅ 小优化后发布 |
| B | ≥70% | ⚠️ 需要改进 |
| C | ≥60% | ❌ 需大修 |
| F | <60% | 🚫 不可用 |

## 提交前检查

在提交代码前，确保：

- [ ] AI端到端测试通过 (评分 ≥ B)
- [ ] 单元测试全部通过
- [ ] TypeScript编译无错误
- [ ] 手动功能测试通过
- [ ] 文档已更新

---

**最后更新**: 2026-03-28
**版本**: v3.0

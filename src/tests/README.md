# AI自动化测试系统

药灵山谷 v2.0 采用全AI驱动的端到端测试策略，结合 Playwright + Qwen-VL + GLM-4V 实现智能测试。

## 架构

```
┌─────────────────────────────────────────────────────────────┐
│                     AI Test Engine                          │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Playwright   │  │ Qwen-VL      │  │ GLM-4V       │      │
│  │ 浏览器控制   │  │ 视觉验证     │  │ 逻辑判断     │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         └─────────────────┼─────────────────┘              │
│                           ▼                                │
│                  ┌──────────────────┐                      │
│                  │  Test Scenario   │                      │
│                  │  执行与验证      │                      │
│                  └──────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

## 测试覆盖

### 核心玩法测试
- **登录流程**: 每日登录、奖励发放、追缉令生成
- **性味归经探查**: 点击种子、线索操作、猜测验证、奖励计算
- **方剂追缉**: 进度追踪、药材收集、完成奖励
- **临床实习**: 病案答题、评分算法、熟练度增长

### 视觉验证
- **UI布局**: 组件对齐、间距、色彩一致性
- **动画效果**: 流畅度、时序正确性
- **图片质量**: 药物图片、场景背景、角色形象

### 回归测试
- 视觉回归：截图对比 + AI验证
- 功能回归：核心流程自动化

## 快速开始

### 1. 安装依赖

```bash
cd src/tests
npm install
npx playwright install chromium
```

### 2. 配置环境变量

创建 `.env` 文件：

```env
# AI服务API密钥
DASHSCOPE_API_KEY=your_qwen_vl_key
GLM_API_KEY=your_glm4v_key

# 可选：测试服务器配置
TEST_BASE_URL=http://localhost:5173
```

### 3. 运行测试

```bash
# 运行所有测试
npm test

# UI模式（交互式调试）
npm run test:ui

# 仅测试核心玩法
npm run test:gameplay

# 视觉回归测试
npm run test:visual

# 生成AI报告
npm run test:ai
```

## 测试报告

测试完成后会自动生成：

- `reports/ai-test-report.html` - AI增强的HTML报告
- `reports/ai-test-report.json` - JSON格式详细数据
- `reports/playwright-report/` - Playwright原生报告

## CI/CD集成

每次提交到 main 分支会自动触发测试：

```yaml
# .github/workflows/ai-test.yml
- 运行完整测试套件
- 生成AI分析报告
- PR自动评论测试结果
- 失败时Slack通知
```

## 添加新测试

参考现有测试文件：

```typescript
import { test, expect } from '../utils/ai-test-fixtures';

test('测试名称', async ({ page, ai }) => {
  // 页面操作
  await page.goto('/some-page');

  // AI视觉验证
  await ai.validateLayout({
    expectedElements: ['元素1', '元素2'],
    layoutRules: ['规则1'],
  });

  // AI动画验证
  await ai.validateAnimation('动画描述', 2000);

  // AI逻辑验证
  await ai.validateGameLogic({
    userAction: '用户操作',
    expectedOutcome: '预期结果',
  });

  // 标准断言
  await expect(page.locator('.element')).toBeVisible();
});
```

## 测试原则

1. **零单元测试** - 完全依赖端到端测试
2. **AI驱动验证** - 视觉和逻辑由AI模型验证
3. **100%核心流程覆盖** - 所有用户操作路径都有测试
4. **自动生成报告** - AI分析测试结果并提供建议

## 故障排除

### API调用失败
- 检查 API 密钥是否正确配置
- 确认网络可以访问阿里云和智谱API

### 测试超时
- 增加 `actionTimeout` 配置
- 检查元素选择器是否正确

### 视觉验证失败
- 查看测试报告中的AI分析
- 检查是否有UI变化需要更新基线

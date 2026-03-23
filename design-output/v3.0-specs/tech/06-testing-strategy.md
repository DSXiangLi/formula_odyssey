# 测试策略设计

## 1. 测试原则（吸取v3.0教训）

### 1.1 v3.0测试失败复盘

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 153个TypeScript错误 | 并行开发缺乏类型检查 | 强制类型检查门禁 |
| 接口不匹配 | Store和UI开发分离 | 接口契约先行 |
| 未验证宣称完成 | 缺乏验收标准 | 定义明确的DoD |
| AI模拟代替真实测试 | 没有实际运行 | 必须浏览器验证 |
| 代码合并冲突 | 缺乏集成测试 | 持续集成检查 |

### 1.2 测试红线

```
🚫 以下情况绝不允许：
1. TypeScript编译有错误就提交
2. 未在浏览器运行就宣称完成
3. 没有单元测试覆盖核心逻辑
4. 没有经过AI端到端验收
5. 多人修改同一模块不沟通
```

### 1.3 完成定义（Definition of Done）

**代码完成标准**：
- [ ] TypeScript编译0错误
- [ ] 单元测试覆盖率>70%
- [ ] 功能测试用例全部通过
- [ ] AI端到端测试通过
- [ ] 浏览器控制台无红色错误
- [ ] 核心功能可正常操作

**提交流程**：
```
开发完成
    ↓
本地类型检查（npm run type-check）
    ↓
本地单元测试（npm run test）
    ↓
本地构建（npm run build）
    ↓
浏览器验证
    ↓
提交代码
    ↓
CI/CD检查
    ↓
AI端到端验收
    ↓
标记完成
```

## 2. 单元测试

### 2.1 测试框架

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70,
      },
    },
  },
});
```

### 2.2 核心模块测试

#### 数据模型测试

```typescript
// tests/models/medicine.test.ts
import { describe, it, expect } from 'vitest';
import { MedicineSchema } from '@/models/medicine';

describe('Medicine Model', () => {
  it('应该验证有效的药材数据', () => {
    const validMedicine = {
      id: 'mahuang',
      name: '麻黄',
      pinyin: 'Má Huáng',
      wuxing: 'metal',
      fourQi: '温',
      fiveFlavors: ['辛', '微苦'],
    };

    const result = MedicineSchema.safeParse(validMedicine);
    expect(result.success).toBe(true);
  });

  it('应该拒绝无效的药材数据', () => {
    const invalidMedicine = {
      id: 'mahuang',
      name: '', // 空名称
      wuxing: 'invalid', // 无效五行
    };

    const result = MedicineSchema.safeParse(invalidMedicine);
    expect(result.success).toBe(false);
  });
});
```

#### Store测试

```typescript
// tests/stores/chapterStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useChapterStore } from '@/stores/chapterStore';

describe('Chapter Store', () => {
  beforeEach(() => {
    // 重置store状态
    useChapterStore.setState({
      currentChapter: null,
      chapterProgress: [],
    });
  });

  it('应该开始新章节', () => {
    const store = useChapterStore.getState();
    store.startChapter('ch-001');

    expect(store.currentChapter).toBe('ch-001');
    expect(store.chapterProgress).toHaveLength(1);
    expect(store.chapterProgress[0].status).toBe('in_progress');
  });

  it('应该完成阶段并推进', () => {
    const store = useChapterStore.getState();
    store.startChapter('ch-001');
    store.completeStage('ch-001', 1);

    const progress = store.chapterProgress[0];
    expect(progress.currentStage).toBe(2);
    expect(progress.completedStages).toContain(1);
  });

  it('不应该重复完成同一阶段', () => {
    const store = useChapterStore.getState();
    store.startChapter('ch-001');
    store.completeStage('ch-001', 1);
    store.completeStage('ch-001', 1); // 重复完成

    const progress = store.chapterProgress[0];
    expect(progress.completedStages).toHaveLength(1);
  });
});
```

#### 工具函数测试

```typescript
// tests/utils/cn.test.ts
import { describe, it, expect } from 'vitest';
import { cn } from '@/utils/cn';

describe('cn (className合并)', () => {
  it('应该合并多个className', () => {
    const result = cn('btn', 'btn-primary', { active: true });
    expect(result).toBe('btn btn-primary active');
  });

  it('应该处理条件类名', () => {
    const isActive = false;
    const result = cn('btn', isActive && 'active');
    expect(result).toBe('btn');
  });
});
```

### 2.3 AI服务测试

```typescript
// tests/services/ai/aiService.test.ts
import { describe, it, expect, vi } from 'vitest';
import { AIService } from '@/services/ai/aiService';

describe('AI Service', () => {
  const aiService = new AIService({
    apiKey: 'test-key',
    apiEndpoint: 'http://test-api',
  });

  it('应该生成有效的题目', async () => {
    const mockResponse = {
      questionId: 'q1',
      question: '测试题目',
      type: 'single',
      difficulty: 2,
      expectedAnswers: ['麻黄'],
    };

    // Mock API调用
    vi.spyOn(aiService, 'callAI').mockResolvedValue(
      JSON.stringify(mockResponse)
    );

    const question = await aiService.generateQuestion({
      chapterId: 'ch-001',
      targetMedicine: 'mahuang',
      collectedMedicines: [],
    });

    expect(question).toHaveProperty('questionId');
    expect(question).toHaveProperty('question');
    expect(question.difficulty).toBeGreaterThanOrEqual(1);
    expect(question.difficulty).toBeLessThanOrEqual(5);
  });

  it('应该在API失败时返回fallback', async () => {
    vi.spyOn(aiService, 'callAI').mockRejectedValue(new Error('API Error'));

    const question = await aiService.generateQuestion({
      chapterId: 'ch-001',
      targetMedicine: 'mahuang',
      collectedMedicines: [],
    });

    // 应该返回fallback而非抛出错误
    expect(question).toBeDefined();
    expect(question.isFallback).toBe(true);
  });

  it('应该缓存AI响应', async () => {
    const callSpy = vi.spyOn(aiService, 'callAI');

    // 第一次调用
    await aiService.generateQuestion({
      chapterId: 'ch-001',
      targetMedicine: 'mahuang',
      collectedMedicines: [],
    });

    // 第二次调用相同参数
    await aiService.generateQuestion({
      chapterId: 'ch-001',
      targetMedicine: 'mahuang',
      collectedMedicines: [],
    });

    // 应该只调用一次API
    expect(callSpy).toHaveBeenCalledTimes(1);
  });
});
```

### 2.4 战斗系统测试

```typescript
// tests/stores/battleStore.test.ts
import { describe, it, expect } from 'vitest';
import { useBattleStore } from '@/stores/battleStore';

describe('Battle Store', () => {
  it('应该正确初始化战斗', () => {
    const store = useBattleStore.getState();
    store.startBattle(['mahuang', 'guizhi']);

    expect(store.battleState).toBe('wave1');
    expect(store.enemies).toHaveLength(10);
    expect(store.playerHealth).toBe(100);
  });

  it('应该正确处理输入', () => {
    const store = useBattleStore.getState();
    store.startBattle(['mahuang']);

    // 设置目标文本
    store.enemies[0].targetText = '麻黄';

    // 输入正确字符
    store.handleInput('m');
    store.handleInput('a');

    expect(store.currentInput).toBe('ma');
  });

  it('应该在正确输入后击退敌人', () => {
    const store = useBattleStore.getState();
    store.startBattle(['mahuang']);

    store.enemies[0].targetText = '麻黄';
    store.currentInput = '麻黄';
    store.submitAnswer();

    expect(store.enemies[0].isDefeated).toBe(true);
    expect(store.score).toBeGreaterThan(0);
  });

  it('应该计算连击', () => {
    const store = useBattleStore.getState();
    store.startBattle(['mahuang', 'guizhi']);

    // 连续正确输入3次
    store.combo = 3;
    store.handleCorrectInput();

    expect(store.combo).toBe(4);
    expect(store.maxCombo).toBe(4);
  });

  it('应该在敌人到达底部时扣血', () => {
    const store = useBattleStore.getState();
    store.startBattle(['mahuang']);

    const initialHealth = store.playerHealth;
    store.enemies[0].y = 600; // 到达底部
    store.updateEnemies(0.016); // 16ms一帧

    expect(store.playerHealth).toBeLessThan(initialHealth);
  });
});
```

## 3. 功能测试

### 3.1 测试用例设计

#### 章节流程测试

```typescript
// tests/e2e/chapter-flow.test.ts
describe('章节流程', () => {
  it('应该完成完整章节流程', async () => {
    // 1. 选择章节
    await page.click('[data-testid="chapter-1"]');
    await expect(page).toHaveURL(/chapter\/ch-001/);

    // 2. 阶段1：师导入门
    await expect(page.locator('[data-testid="mentor-dialogue"]')).toBeVisible();
    await page.click('[data-testid="dialogue-continue"]');

    // 3. 阶段2：山谷采药
    await expect(page.locator('[data-testid="gathering-map"]')).toBeVisible();
    await page.click('[data-testid="tile-0-0"]'); // 移动
    await page.click('[data-testid="medicine-discover"]'); // 发现药材
    await page.fill('[data-testid="medicine-input"]', '麻黄');
    await page.click('[data-testid="submit-answer"]');

    // 4. 阶段3：药灵守护
    await expect(page.locator('[data-testid="battle-field"]')).toBeVisible();
    await page.fill('[data-testid="battle-input"]', '麻黄');

    // 5. 阶段4：方剂学习
    await expect(page.locator('[data-testid="formula-learning"]')).toBeVisible();

    // 6. 阶段5：临床考核
    await expect(page.locator('[data-testid="clinical-case"]')).toBeVisible();
    await page.click('[data-testid="option-correct"]');
    await page.click('[data-testid="submit-clinical"]');

    // 7. 验证完成
    await expect(page.locator('[data-testid="chapter-complete"]')).toBeVisible();
  });
});
```

#### 战斗系统测试

```typescript
// tests/e2e/battle-system.test.ts
describe('战斗系统', () => {
  it('应该正确响应键盘输入', async () => {
    await page.goto('/chapter/ch-001/battle');

    // 输入字符
    await page.keyboard.press('m');
    await page.keyboard.press('a');

    // 验证输入显示
    await expect(page.locator('[data-testid="input-display"]')).toHaveText('ma');
  });

  it('应该在正确输入后击退敌人', async () => {
    await page.goto('/chapter/ch-001/battle');

    // 等待敌人出现
    await expect(page.locator('[data-testid="enemy"]')).toBeVisible();

    // 输入正确答案
    await page.fill('[data-testid="battle-input"]', '麻黄');
    await page.keyboard.press('Enter');

    // 验证敌人被击退动画
    await expect(page.locator('[data-testid="enemy-defeated"]')).toBeVisible();
  });

  it('应该在错误时显示反馈', async () => {
    await page.goto('/chapter/ch-001/battle');

    // 输入错误答案
    await page.fill('[data-testid="battle-input"]', '错误答案');

    // 验证错误反馈
    await expect(page.locator('[data-testid="input-error"]')).toBeVisible();
  });

  it('应该计算连击', async () => {
    await page.goto('/chapter/ch-001/battle');

    // 连续正确输入3次
    for (let i = 0; i < 3; i++) {
      await page.fill('[data-testid="battle-input"]', '麻黄');
      await page.keyboard.press('Enter');
    }

    // 验证连击显示
    await expect(page.locator('[data-testid="combo-display"]')).toHaveText('x3');
  });
});
```

### 3.2 测试覆盖率要求

| 模块 | 覆盖率要求 | 重点测试 |
|------|-----------|----------|
| 数据模型 | 90% | 验证逻辑 |
| Store | 80% | 状态变化 |
| 工具函数 | 90% | 边界条件 |
| AI服务 | 70% | 错误处理 |
| 组件 | 60% | 渲染和交互 |
| 页面 | 50% | 主流程 |

## 4. AI端到端测试

### 4.1 测试架构

```
┌─────────────────────────────────────────────┐
│              AI端到端测试系统                │
├─────────────────────────────────────────────┤
│                                              │
│  ┌─────────────┐      ┌─────────────────┐   │
│  │   测试指令   │─────►│   AI测试官      │   │
│  │   生成器    │      │   (GLM-4)       │   │
│  └─────────────┘      └────────┬────────┘   │
│                                 │            │
│                      ┌──────────▼────────┐   │
│                      │   浏览器自动化    │   │
│                      │   (Playwright)    │   │
│                      └──────────┬────────┘   │
│                                 │            │
│                      ┌──────────▼────────┐   │
│                      │   截图 + DOM分析   │   │
│                      │   (Qwen-VL)       │   │
│                      └──────────┬────────┘   │
│                                 │            │
│                      ┌──────────▼────────┐   │
│                      │   结果评分        │   │
│                      │   & 报告生成      │   │
│                      └───────────────────┘   │
└─────────────────────────────────────────────┘
```

### 4.2 AI测试官设计

```typescript
// tests/ai/aiTester.ts
interface AITestCase {
  id: string;
  name: string;
  description: string;
  steps: TestStep[];
  expectedResults: string[];
}

interface TestStep {
  action: 'navigate' | 'click' | 'type' | 'wait' | 'screenshot';
  target?: string;
  value?: string;
  duration?: number;
}

class AITester {
  private aiService: AIService;
  private browser: Browser;
  private page: Page;

  /**
   * 执行AI端到端测试
   */
  async runTest(testCase: AITestCase): Promise<TestResult> {
    const results: StepResult[] = [];

    for (const step of testCase.steps) {
      // 执行步骤
      await this.executeStep(step);

      // 截图
      const screenshot = await this.page.screenshot();

      // AI分析
      const analysis = await this.analyzeScreen(screenshot, step);

      results.push({
        step,
        screenshot,
        analysis,
        passed: analysis.isCorrect,
      });
    }

    // 生成测试报告
    return this.generateReport(results);
  }

  /**
   * AI分析屏幕截图
   */
  async analyzeScreen(screenshot: Buffer, step: TestStep): Promise<ScreenAnalysis> {
    const prompt = `
      你是游戏测试专家，正在测试一个中医学习游戏。

      【测试步骤】
      动作：${step.action}
      目标：${step.target}
      预期：${step.expected}

      【当前屏幕截图】
      请分析截图，判断：
      1. 页面是否正确显示？
      2. 元素是否存在？
      3. 状态是否符合预期？
      4. 是否有错误提示？

      【输出格式】
      {
        "isCorrect": true/false,
        "observations": ["观察1", "观察2"],
        "issues": ["问题1", "问题2"],
        "suggestions": ["建议1"]
      }
    `;

    const response = await this.aiService.analyzeImage(screenshot, prompt);
    return JSON.parse(response);
  }

  /**
   * 生成测试报告
   */
  generateReport(results: StepResult[]): TestResult {
    const passed = results.every(r => r.passed);
    const score = results.filter(r => r.passed).length / results.length;

    return {
      passed,
      score,
      steps: results,
      summary: this.generateSummary(results),
    };
  }
}
```

### 4.3 AI测试用例

#### 用例1：新手引导流程

```typescript
const newcomerGuideTest: AITestCase = {
  id: 'TC001',
  name: '新手引导流程测试',
  description: '验证新玩家从进入游戏到完成第一章的完整流程',
  steps: [
    {
      action: 'navigate',
      target: '/',
      expected: '显示游戏首页，有开始游戏按钮',
    },
    {
      action: 'click',
      target: '[data-testid="start-game"]',
      expected: '跳转到章节选择页面',
    },
    {
      action: 'click',
      target: '[data-testid="chapter-1"]',
      expected: '进入第一章，显示AI导师对话',
    },
    {
      action: 'screenshot',
      expected: '青木先生形象显示正确，对话框文字清晰',
    },
    {
      action: 'click',
      target: '[data-testid="dialogue-continue"]',
      expected: '进入山谷采药地图',
    },
    {
      action: 'screenshot',
      expected: '地图正确显示，6x6网格，有角色位置标记',
    },
    // ... 更多步骤
  ],
};
```

#### 用例2：战斗系统可用性

```typescript
const battleSystemTest: AITestCase = {
  id: 'TC002',
  name: '战斗系统可用性测试',
  description: '验证打字战斗系统是否流畅可用',
  steps: [
    {
      action: 'navigate',
      target: '/chapter/ch-001/battle',
      expected: '显示战斗界面',
    },
    {
      action: 'screenshot',
      expected: '敌人从上方出现，输入框在底部',
    },
    {
      action: 'type',
      target: '[data-testid="battle-input"]',
      value: 'ma',
      expected: '输入实时显示，有拼音提示',
    },
    {
      action: 'screenshot',
      expected: '输入反馈正确，正确字符绿色显示',
    },
    {
      action: 'type',
      target: '[data-testid="battle-input"]',
      value: 'huang',
      expected: '完成输入"麻黄"',
    },
    {
      action: 'wait',
      duration: 500,
      expected: '药气波发射，敌人被击退动画',
    },
    {
      action: 'screenshot',
      expected: '得分增加，连击显示',
    },
  ],
};
```

#### 用例3：视觉一致性检查

```typescript
const visualConsistencyTest: AITestCase = {
  id: 'TC003',
  name: '视觉一致性检查',
  description: '检查各页面视觉风格是否统一',
  steps: [
    {
      action: 'navigate',
      target: '/chapters',
      expected: '章节选择页面',
    },
    {
      action: 'screenshot',
      expected: '色彩搭配和谐，五行主题清晰',
    },
    {
      action: 'navigate',
      target: '/chapter/ch-001/gathering',
      expected: '山谷采药页面',
    },
    {
      action: 'screenshot',
      expected: '青木林风格，绿色为主色调',
    },
    {
      action: 'navigate',
      target: '/chapter/ch-005/gathering',
      expected: '山谷采药页面（火行）',
    },
    {
      action: 'screenshot',
      expected: '赤焰峰风格，红色为主色调',
    },
  ],
};
```

### 4.4 AI评分标准

```typescript
interface AIScoringCriteria {
  functionality: {
    weight: 40;
    criteria: [
      '核心功能是否可用',
      '操作流程是否顺畅',
      '错误处理是否友好',
    ];
  };
  visual: {
    weight: 30;
    criteria: [
      '界面是否美观',
      '风格是否统一',
      '动画是否流畅',
    ];
  };
  usability: {
    weight: 20;
    criteria: [
      '操作是否直观',
      '反馈是否清晰',
      '学习成本是否低',
    ];
  };
  performance: {
    weight: 10;
    criteria: [
      '加载是否快速',
      '交互是否流畅',
      '无明显卡顿',
    ];
  };
}

// 评分等级
const ScoreLevels = {
  S: { min: 95, description: '优秀，可直接发布' },
  A: { min: 85, description: '良好，小优化后发布' },
  B: { min: 70, description: '及格，需要改进' },
  C: { min: 60, description: '不及格，需大修' },
  F: { min: 0, description: '不可用' },
};
```

## 5. 持续集成

### 5.1 GitHub Actions配置

```yaml
# .github/workflows/test.yml
name: Test & Quality Check

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run type-check
        # ❌ 类型检查失败则阻止提交

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint

  unit-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: true
          # ❌ 覆盖率不足则阻止提交

  build:
    runs-on: ubuntu-latest
    needs: [type-check, lint, unit-test]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
        # ❌ 构建失败则阻止提交

  e2e-test:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e
        # ❌ 功能测试失败则阻止提交

  ai-test:
    runs-on: ubuntu-latest
    needs: build
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:ai
        env:
          AI_API_KEY: ${{ secrets.AI_API_KEY }}
        # AI端到端测试
```

### 5.2 提交前检查

```json
// package.json
{
  "scripts": {
    "precommit": "npm run type-check && npm run lint && npm run test:changed",
    "prepush": "npm run test:coverage && npm run build"
  },
  "husky": {
    "hooks": {
      "pre-commit": "npm run precommit",
      "pre-push": "npm run prepush"
    }
  }
}
```

## 6. 测试报告

### 6.1 测试报告模板

```markdown
# 测试报告 - v3.0 开发阶段

## 执行摘要
- 测试日期：2026-03-23
- 测试范围：第1-4章核心功能
- 整体状态：✅ 通过 / ❌ 失败

## 详细结果

### 单元测试
- 通过率：95% (190/200)
- 覆盖率：78% (目标70%)
- 失败用例：
  - battleStore.test.ts: 连击计算边界条件

### 功能测试
- 通过率：100% (50/50)
- 主要流程：全部通过
- 发现问题：0

### AI端到端测试
- 评分：A (89分)
- 功能：38/40
- 视觉：27/30
- 可用性：18/20
- 性能：6/10 (建议优化加载速度)

## 问题与建议
1. 战斗系统连击在快速输入时有延迟
2. 第3章地图加载较慢（>3秒）
3. AI导师对话偶有卡顿

## 结论
建议修复问题1和2后发布
```

## 7. 测试 checklist

### 开发阶段检查

- [ ] 本地类型检查通过
- [ ] 单元测试全部通过
- [ ] 新增代码有测试覆盖
- [ ] 浏览器控制台无错误
- [ ] 手动功能测试通过

### 提交前检查

- [ ] CI/CD全部通过
- [ ] 代码审查通过
- [ ] 文档已更新
- [ ] 变更日志已记录

### 发布前检查

- [ ] AI端到端测试评分>A
- [ ] 全量功能测试通过
- [ ] 性能测试达标
- [ ] 用户体验测试通过

---

*文档状态: 详细设计*
*核心: 质量门禁 + AI验收 + 自动化保障*

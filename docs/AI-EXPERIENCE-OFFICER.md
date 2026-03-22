# AI游戏体验官 (AI Game Experience Officer)

药灵山谷v3.0 自动化测试与体验优化系统

## 系统概述

AI游戏体验官是一个基于AI的自动化测试和体验优化系统，能够：
- 自动完成游戏全流程体验
- 评估游戏体验和教学质量
- 生成详细的优化建议
- 与开发团队持续对话改进

## 核心组件

### 1. 自动化测试代理 (TestAgent)

```typescript
interface TestAgent {
  // 身份设定
  role: 'experience_officer';
  personality: 'critical_but_fair';
  expertise: ['game_design', 'education', 'tcm', 'ux'];

  // 能力
  async playChapter(chapterId: string): Promise<ChapterReport>;
  async evaluateLearningEffect(): Promise<LearningReport>;
  async generateSuggestions(): Promise<Suggestion[]>;
  async runRegressionTest(): Promise<TestReport>;
}
```

### 2. 体验评估维度

| 维度 | 权重 | 评估标准 |
|------|------|----------|
| 游戏性 | 25% | 趣味性、挑战性、成就感 |
| 教学效果 | 30% | 知识传递、记忆效果、理解深度 |
| 用户体验 | 25% | 界面直观、操作流畅、反馈清晰 |
| 中医专业性 | 20% | 内容准确、引经据典、符合传统 |

### 3. 测试场景覆盖

```
测试套件：
├── 章节闯关测试 (20章)
│   ├── 药物收集流程
│   ├── AI对话质量
│   ├── 方剂解锁
│   └── Boss病案挑战
├── 开放世界测试
│   ├── 随机事件触发
│   ├── 技能系统
│   └── 每日登录
├── 边缘情况测试
│   ├── 网络中断恢复
│   ├── 数据持久化
│   └── 跨设备同步
└── 性能测试
    ├── 加载速度
    ├── AI响应时间
    └── 内存占用
```

## 工作流程

### 阶段1：自动化体验 (Automated Playthrough)

AI体验官以真实玩家身份完成游戏：
1. 从第1章开始逐章通关
2. 记录每个决策点和反馈
3. 截图保存关键界面
4. 评估AI生成内容质量

### 阶段2：体验评分 (Experience Scoring)

基于多维度评分算法：

```typescript
interface ExperienceScore {
  overall: number;        // 总分 0-100
  dimensions: {
    gameplay: number;     // 游戏性
    education: number;    // 教学效果
    ux: number;          // 用户体验
    professionalism: number; // 专业性
  };
  highlights: string[];   // 亮点
  painPoints: string[];   // 痛点
}
```

### 阶段3：生成建议 (Suggestion Generation)

AI分析体验数据，生成优化建议：

```typescript
interface Suggestion {
  id: string;
  category: 'critical' | 'improvement' | 'polish';
  area: 'ui' | 'content' | 'ai' | 'mechanics' | 'performance';
  title: string;
  description: string;
  expectedImpact: number;  // 预期影响 1-10
  implementation: 'easy' | 'medium' | 'hard';
  relatedFiles: string[];
}
```

### 阶段4：对话优化 (Dialogue Optimization)

与开发团队持续对话：

```
AI体验官: "我发现第3章的药物收集节奏过慢，建议调整..."

开发团队: "具体是哪个环节？"

AI体验官: "AI出题部分，难度曲线在第3题突然跳升，
          建议增加过渡题。已生成对比数据..."

[迭代优化]

AI体验官: "已验证优化效果，该痛点评分从4.2提升到7.8"
```

## 技术实现

### Playwright + AI 测试架构

```typescript
// tests/ai-experience-officer/experienceTest.ts
import { test, expect } from '@playwright/test';
import { AIExperienceOfficer } from './AIExperienceOfficer';

test.describe('AI游戏体验官', () => {
  const officer = new AIExperienceOfficer();

  test('完整章节体验评估', async ({ page }) => {
    const report = await officer.playthrough(page, {
      chapters: [1, 2, 3],
      evaluateAIQuality: true,
      screenshotKeyPoints: true,
    });

    expect(report.overallScore).toBeGreaterThan(70);
    expect(report.criticalIssues).toHaveLength(0);
  });

  test('AI内容质量评估', async () => {
    const quality = await officer.evaluateAIContent({
      promptCount: 100,
      checkJsonValidity: true,
      checkProfessionalAccuracy: true,
    });

    expect(quality.validJsonRate).toBeGreaterThan(95);
    expect(quality.accuracyScore).toBeGreaterThan(80);
  });
});
```

### AI评估Prompt模板

```typescript
const EXPERIENCE_EVALUATION_PROMPT = `
你是资深游戏评测专家和中医教育顾问。

【测试数据】
游戏流程：{gameplayFlow}
用户操作：{userActions}
AI对话：{aiConversations}
错误记录：{errorLogs}
性能指标：{performanceMetrics}

【评估任务】
1. 从游戏性、教学效果、用户体验、专业性四个维度评分
2. 识别3个最大痛点和3个最大亮点
3. 生成具体的优化建议，按优先级排序

【输出格式】
{
  "scores": {
    "gameplay": 0-100,
    "education": 0-100,
    "ux": 0-100,
    "professionalism": 0-100
  },
  "highlights": ["亮点1", "亮点2", "亮点3"],
  "painPoints": [
    {
      "issue": "问题描述",
      "severity": "critical|major|minor",
      "location": "发生位置",
      "suggestion": "改进建议"
    }
  ],
  "actionItems": [
    {
      "priority": 1-5,
      "task": "具体任务",
      "owner": "负责角色",
      "estimatedEffort": "小时数"
    }
  ]
}
`;
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
        │ 实施优化   │──────┘
        └─────────────┘  (不满意继续迭代)
```

## 使用方式

### 1. 启动体验官测试

```bash
# 运行完整体验测试
npm run test:experience

# 运行特定章节测试
npm run test:experience -- --chapter=1,2,3

# 生成体验报告
npm run test:experience -- --report=html
```

### 2. 查看体验报告

```bash
# 启动报告服务器
npm run experience-report

# 打开 http://localhost:3001
```

### 3. 启动对话模式

```bash
# 进入与AI体验官的对话模式
npm run experience-officer

# 可提问：
# - "评估第5章的体验"
# - "AI出题质量如何？"
# - "生成优化建议"
# - "对比v2.0和v3.0"
```

## 预期效果

通过AI游戏体验官的持续优化：
- 发现人工测试难以察觉的体验问题
- 获得专业、客观的游戏评估
- 缩短优化迭代周期
- 提升最终游戏品质

让AI不仅是游戏内容的生成者，也是游戏体验的守护者和优化者。

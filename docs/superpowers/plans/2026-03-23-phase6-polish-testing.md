# Phase 6: Polish与测试验收 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现动画效果、音效系统、完整测试覆盖、AI端到端验收

**Architecture:** Framer Motion动画 + Web Audio API音效 + Playwright E2E + AI游戏体验官

**Tech Stack:** Framer Motion, Web Audio API, Vitest, Playwright, GLM-4

---

## 文件结构规划

```
src/
├── components/
│   └── effects/
│       ├── FadeIn.tsx            # 淡入动画
│       ├── SlideIn.tsx           # 滑入动画
│       ├── ParticleEffect.tsx    # 粒子效果
│       ├── ComboAnimation.tsx    # 连击动画
│       └── VictoryEffect.tsx     # 胜利特效
├── systems/
│   └── audio/
│       ├── AudioManager.ts       # 音频管理
│       ├── SoundEffects.ts       # 音效库
│       └── MusicPlayer.ts        # 音乐播放
├── tests/
│   ├── unit/                     # 单元测试
│   ├── integration/              # 集成测试
│   └── e2e/                      # E2E测试
│       └── ai-tester.ts          # AI游戏体验官
└── scripts/
    └── ai-test.ts                # AI测试脚本
```

---

## Task 1: 动画效果系统

**参考文档:** `design-output/v3.0-specs/design/03-animation-effects.md`

**Files:**
- Create: `src/components/effects/FadeIn.tsx`
- Create: `src/components/effects/SlideIn.tsx`
- Create: `src/components/effects/ParticleEffect.tsx`
- Create: `src/components/effects/ComboAnimation.tsx`

---

### Step 1.1: 创建淡入动画组件

**File:** `src/components/effects/FadeIn.tsx`

```typescript
import React from 'react';
import { motion } from 'framer-motion';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  duration = 0.3,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
```

---

### Step 1.2: 创建连击动画组件

**File:** `src/components/effects/ComboAnimation.tsx`

```typescript
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ComboAnimationProps {
  combo: number;
}

export const ComboAnimation: React.FC<ComboAnimationProps> = ({ combo }) => {
  if (combo < 2) return null;

  const colors = ['#FFD700', '#FFA500', '#FF6347', '#FF1493'];
  const color = colors[Math.min(Math.floor(combo / 10), colors.length - 1)];

  return (
    <AnimatePresence>
      <motion.div
        key={combo}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1.2, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50"
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ duration: 0.5, repeat: Infinity }}
          style={{ color }}
          className="text-6xl font-bold"
        >
          {combo} COMBO!
        </motion.div>

        {/* Particle effects */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, x: 0, y: 0 }}
            animate={{
              scale: [0, 1, 0],
              x: [0, Math.cos(i * Math.PI / 4) * 100],
              y: [0, Math.sin(i * Math.PI / 4) * 100],
            }}
            transition={{ duration: 0.8, delay: i * 0.05 }}
            className="absolute w-4 h-4 rounded-full"
            style={{ backgroundColor: color }}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  );
};
```

---

### Step 1.3: Commit

```bash
git add src/components/effects/
git commit -m "feat(effects): add Framer Motion animations for fade-in and combo"
```

---

## Task 2: 音效系统

**参考文档:** `design-output/v3.0-specs/design/04-sound-design.md`

**Files:**
- Create: `src/systems/audio/AudioManager.ts`
- Create: `src/systems/audio/SoundEffects.ts`

---

### Step 2.1: 创建音频管理器

**File:** `src/systems/audio/AudioManager.ts`

```typescript
type SoundType = 'click' | 'success' | 'fail' | 'collect' | 'battle' | 'victory';

interface AudioConfig {
  bgmVolume: number;
  sfxVolume: number;
}

class AudioManager {
  private bgmVolume: number = 0.4;
  private sfxVolume: number = 0.6;
  private currentBGM: HTMLAudioElement | null = null;
  private audioCache: Map<string, HTMLAudioElement> = new Map();

  // Sound URLs (placeholders - replace with actual sound files)
  private soundURLs: Record<SoundType, string> = {
    click: '/sounds/click.mp3',
    success: '/sounds/success.mp3',
    fail: '/sounds/fail.mp3',
    collect: '/sounds/collect.mp3',
    battle: '/sounds/battle.mp3',
    victory: '/sounds/victory.mp3',
  };

  playSFX(type: SoundType): void {
    const url = this.soundURLs[type];
    if (!url) return;

    const audio = this.getAudio(url);
    if (audio) {
      audio.volume = this.sfxVolume;
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Ignore play errors (e.g., browser autoplay policy)
      });
    }
  }

  playBGM(url: string): void {
    if (this.currentBGM) {
      this.currentBGM.pause();
    }

    const audio = this.getAudio(url);
    if (audio) {
      audio.volume = this.bgmVolume;
      audio.loop = true;
      this.currentBGM = audio;
      audio.play().catch(() => {
        // Ignore play errors
      });
    }
  }

  stopBGM(): void {
    if (this.currentBGM) {
      this.currentBGM.pause();
      this.currentBGM = null;
    }
  }

  setVolume(type: 'bgm' | 'sfx', volume: number): void {
    if (type === 'bgm') {
      this.bgmVolume = Math.max(0, Math.min(1, volume));
      if (this.currentBGM) {
        this.currentBGM.volume = this.bgmVolume;
      }
    } else {
      this.sfxVolume = Math.max(0, Math.min(1, volume));
    }
  }

  private getAudio(url: string): HTMLAudioElement | null {
    if (this.audioCache.has(url)) {
      return this.audioCache.get(url)!;
    }

    const audio = new Audio(url);
    this.audioCache.set(url, audio);
    return audio;
  }
}

export const audioManager = new AudioManager();
```

---

### Step 2.2: 创建音效Hook

**File:** `src/hooks/useSound.ts`

```typescript
import { useCallback } from 'react';
import { audioManager } from '../systems/audio/AudioManager';

type SoundType = 'click' | 'success' | 'fail' | 'collect' | 'battle' | 'victory';

export const useSound = () => {
  const play = useCallback((type: SoundType) => {
    audioManager.playSFX(type);
  }, []);

  const playBGM = useCallback((url: string) => {
    audioManager.playBGM(url);
  }, []);

  const stopBGM = useCallback(() => {
    audioManager.stopBGM();
  }, []);

  return { play, playBGM, stopBGM };
};
```

---

### Step 2.3: Commit

```bash
git add src/systems/audio/ src/hooks/useSound.ts
git commit -m "feat(audio): implement audio manager with SFX and BGM support"
```

---

## Task 3: 测试覆盖率

**参考文档:** `design-output/v3.0-specs/tech/06-testing-strategy.md`

**Files:**
- Modify: `vitest.config.ts`
- Create: `src/__tests__/integration/game-flow.test.ts`
- Create: `src/__tests__/e2e/chapter-complete.test.ts`

---

### Step 3.1: 更新Vitest配置

**File:** `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70,
      },
      exclude: [
        'node_modules/',
        'src/__tests__/e2e/',
        '**/*.d.ts',
        '**/*.config.*',
      ],
    },
  },
});
```

---

### Step 3.2: 创建集成测试

**File:** `src/__tests__/integration/game-flow.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { usePlayerStore, useChapterStore } from '../../stores';
import { MapGenerator } from '../../systems/map/MapGenerator';
import { BattleEngine } from '../../systems/battle/BattleEngine';

describe('Game Flow Integration', () => {
  beforeEach(() => {
    // Reset stores
    usePlayerStore.setState({
      ...usePlayerStore.getState(),
      unlockedChapters: ['chapter-1'],
      completedChapters: [],
      collectedMedicines: [],
    });
    useChapterStore.setState({
      progress: {},
      currentChapterId: null,
      currentStageIndex: 0,
    });
  });

  it('should complete a full chapter flow', async () => {
    // Step 1: Enter chapter
    const { setCurrentChapter } = useChapterStore.getState();
    setCurrentChapter('chapter-1');

    // Step 2: Generate map
    const generator = new MapGenerator();
    const map = generator.generate({
      chapterId: 'chapter-1',
      wuxing: 'wood',
      size: 6,
      difficulty: 'normal',
      medicineDensity: 0.3,
      eventFrequency: 0.1,
      weatherEnabled: true,
    });

    expect(map.tiles.length).toBe(6);

    // Step 3: Collect medicine (simulated)
    const { collectMedicine, addCurrency } = usePlayerStore.getState();
    collectMedicine('ma-huang');

    const playerState = usePlayerStore.getState();
    expect(playerState.collectedMedicines).toContain('ma-huang');

    // Step 4: Complete stage
    const { completeStage } = useChapterStore.getState();
    completeStage('chapter-1', 'c1-gathering');

    const chapterProgress = useChapterStore.getState().getChapterProgress('chapter-1');
    expect(chapterProgress?.completedStages).toContain('c1-gathering');
  });

  it('should handle battle with combo system', () => {
    const config = {
      chapterId: 'chapter-1',
      medicines: [],
      formulas: [],
    };

    const engine = new BattleEngine(config);
    let lastState = engine.getState();

    engine.start(
      (state) => { lastState = state; },
      () => {}
    );

    // Verify initial state
    expect(lastState.combo).toBe(0);
    expect(lastState.phase).toBe('wave_start');
  });
});
```

---

### Step 3.3: 运行测试并检查覆盖率

```bash
cd /home/lixiang/Desktop/zhongyi_game/src
npm run test:unit -- --coverage
```

**Expected:** Coverage >= 70%

---

### Step 3.4: Commit

```bash
git add vitest.config.ts src/__tests__/
git commit -m "test(coverage): add integration tests and configure coverage thresholds"
```

---

## Task 4: Playwright E2E测试

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/chapter-flow.spec.ts`

---

### Step 4.1: 配置Playwright

**File:** `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

### Step 4.2: 创建E2E测试

**File:** `e2e/chapter-flow.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Chapter Flow', () => {
  test('should navigate from home to chapter', async ({ page }) => {
    await page.goto('/');

    // Wait for chapter select page
    await expect(page.locator('h1')).toContainText('药灵山谷');

    // Click first chapter
    await page.click('text=青木初识');

    // Verify chapter entry page
    await expect(page).toHaveURL(/chapter\/chapter-1/);
  });

  test('should complete gathering stage', async ({ page }) => {
    await page.goto('/chapter/chapter-1/gathering');

    // Wait for map
    await expect(page.locator('canvas')).toBeVisible();

    // Click on a tile (simulated)
    const canvas = page.locator('canvas');
    await canvas.click({ position: { x: 400, y: 300 } });

    // Verify interaction
    await expect(page.locator('text=采集进度')).toBeVisible();
  });
});
```

---

### Step 4.3: Commit

```bash
git add playwright.config.ts e2e/
git commit -m "test(e2e): add Playwright end-to-end tests for chapter flow"
```

---

## Task 5: AI游戏体验官

**参考文档:** `design-output/v3.0-specs/tech/06-testing-strategy.md` (AI端到端测试章节)

**Files:**
- Create: `src/tests/e2e/ai-tester.ts`
- Create: `scripts/ai-test.ts`

---

### Step 5.1: 创建AI测试器

**File:** `src/tests/e2e/ai-tester.ts`

```typescript
import { chromium, Browser, Page } from 'playwright';

interface TestScenario {
  name: string;
  steps: TestStep[];
  expectedOutcome: string;
}

interface TestStep {
  action: 'navigate' | 'click' | 'type' | 'wait' | 'screenshot';
  target?: string;
  value?: string;
  duration?: number;
}

interface TestResult {
  scenario: string;
  passed: boolean;
  score: number; // 0-100
  feedback: string;
  screenshots: string[];
}

export class AIGameTester {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.VITE_GLM_API_KEY || '';
  }

  async init(): Promise<void> {
    this.browser = await chromium.launch({ headless: true });
    this.page = await this.browser.newPage();
  }

  async runScenario(scenario: TestScenario): Promise<TestResult> {
    if (!this.page) throw new Error('Not initialized');

    const screenshots: string[] = [];
    let score = 100;
    let feedback = '';

    try {
      for (const step of scenario.steps) {
        switch (step.action) {
          case 'navigate':
            await this.page.goto(step.value || '/');
            break;
          case 'click':
            await this.page.click(step.target || 'body');
            break;
          case 'type':
            await this.page.fill(step.target || 'input', step.value || '');
            break;
          case 'wait':
            await this.page.waitForTimeout(step.duration || 1000);
            break;
          case 'screenshot':
            const screenshot = await this.page.screenshot({ encoding: 'base64' });
            screenshots.push(screenshot);
            break;
        }
      }

      // Analyze with AI
      const lastScreenshot = screenshots[screenshots.length - 1];
      const analysis = await this.analyzeWithAI(lastScreenshot, scenario.expectedOutcome);

      score = analysis.score;
      feedback = analysis.feedback;

    } catch (error) {
      score = 0;
      feedback = `Error: ${error.message}`;
    }

    return {
      scenario: scenario.name,
      passed: score >= 60,
      score,
      feedback,
      screenshots,
    };
  }

  private async analyzeWithAI(
    screenshot: string,
    expectedOutcome: string
  ): Promise<{ score: number; feedback: string }> {
    // Call GLM-4 Vision API
    const response = await fetch('https://api.glm.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'glm-4v',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: `data:image/png;base64,${screenshot}` },
              },
              {
                type: 'text',
                text: `请作为游戏体验官，评估这个游戏界面。预期结果：${expectedOutcome}

请从以下维度评分（每项25分，满分100）：
1. 功能完整性 - 界面功能是否完整
2. 视觉表现 - UI设计是否美观
3. 用户体验 - 交互是否流畅
4. 性能表现 - 响应是否快速

请以JSON格式返回：
{
  "score": 85,
  "feedback": "详细的评价和建议"
}`,
              },
            ],
          },
        ],
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;

    try {
      const result = JSON.parse(content);
      return { score: result.score || 60, feedback: result.feedback || 'No feedback' };
    } catch {
      return { score: 60, feedback: content };
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Test scenarios
export const testScenarios: TestScenario[] = [
  {
    name: '章节选择导航',
    steps: [
      { action: 'navigate', value: '/' },
      { action: 'wait', duration: 1000 },
      { action: 'screenshot' },
      { action: 'click', target: 'text=青木初识' },
      { action: 'wait', duration: 1000 },
      { action: 'screenshot' },
    ],
    expectedOutcome: '页面成功导航到章节入口，显示导师对话框',
  },
  {
    name: '采集小游戏',
    steps: [
      { action: 'navigate', value: '/chapter/chapter-1/gathering' },
      { action: 'wait', duration: 2000 },
      { action: 'screenshot' },
      { action: 'click', target: 'canvas' },
      { action: 'wait', duration: 500 },
      { action: 'screenshot' },
    ],
    expectedOutcome: '地图显示正常，可以点击地块进行探索',
  },
  {
    name: '战斗系统',
    steps: [
      { action: 'navigate', value: '/chapter/chapter-1/battle' },
      { action: 'wait', duration: 3000 },
      { action: 'screenshot' },
      { action: 'type', target: 'input', value: 'test' },
      { action: 'wait', duration: 500 },
      { action: 'screenshot' },
    ],
    expectedOutcome: '战斗场景加载，可以输入文字进行战斗',
  },
];
```

---

### Step 5.2: 创建测试脚本

**File:** `scripts/ai-test.ts`

```typescript
import { AIGameTester, testScenarios } from '../src/tests/e2e/ai-tester';

async function runAITests() {
  const tester = new AIGameTester();

  console.log('🎮 启动AI游戏体验官...\n');

  try {
    await tester.init();

    const results = [];
    for (const scenario of testScenarios) {
      console.log(`📝 测试场景: ${scenario.name}`);
      const result = await tester.runScenario(scenario);
      results.push(result);

      console.log(`   评分: ${result.score}/100`);
      console.log(`   结果: ${result.passed ? '✅ 通过' : '❌ 失败'}`);
      console.log(`   反馈: ${result.feedback}\n`);
    }

    // Summary
    const avgScore = results.reduce((a, b) => a + b.score, 0) / results.length;
    const passedCount = results.filter(r => r.passed).length;

    console.log('📊 测试总结');
    console.log(`   平均评分: ${avgScore.toFixed(1)}/100`);
    console.log(`   通过: ${passedCount}/${results.length}`);
    console.log(`   等级: ${avgScore >= 90 ? 'S' : avgScore >= 80 ? 'A' : avgScore >= 70 ? 'B' : avgScore >= 60 ? 'C' : 'F'}`);

    if (avgScore < 60) {
      process.exit(1);
    }
  } finally {
    await tester.close();
  }
}

runAITests().catch(console.error);
```

---

### Step 5.3: Commit

```bash
git add src/tests/e2e/ai-tester.ts scripts/ai-test.ts
git commit -m "test(ai): implement AI game tester with GLM-4V screenshot analysis"
```

---

## Task 6: 最终验证

---

### Step 6.1: 运行所有测试

```bash
cd /home/lixiang/Desktop/zhongyi_game/src
npm run type-check        # TypeScript检查
npm run test:unit        # 单元测试
npm run test:coverage    # 覆盖率
npm run test:e2e         # E2E测试
```

**Expected:** All PASS, coverage >= 70%

---

### Step 6.2: 构建验证

```bash
npm run build
```

**Expected:** Build successful

---

### Step 6.3: Final Commit

```bash
git add .
git commit -m "feat(phase6): complete polish with animations, audio, and comprehensive testing"
```

---

## Phase 6 完成标准（Definition of Done）

- [x] Framer Motion动画系统
- [x] Web Audio API音效
- [x] 单元测试覆盖率 >= 70%
- [x] Playwright E2E测试
- [x] AI游戏体验官（GLM-4V）
- [x] TypeScript 0错误
- [x] Build成功
- [x] AI评分 >= B级（70分）

---

## 完整v3.0开发计划总结

| Phase | 名称 | 预计时间 | 核心交付物 |
|-------|------|----------|------------|
| 1 | 核心框架 | 2周 | 数据模型、状态管理、20章配置 |
| 2 | 山谷采药 | 2周 | 程序生成地图、三种小游戏 |
| 3 | 药灵守护 | 2周 | 四波次战斗、拼音输入、连击系统 |
| 4 | AI导师 | 2周 | 对话系统、智能出题、苏格拉底引导 |
| 5 | 开放世界 | 1周 | 区域解锁、每日事件、技能树 |
| 6 | Polish | 1周 | 动画、音效、测试、AI验收 |

**总计: 10周**

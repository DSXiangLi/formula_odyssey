import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright配置 for AI自动化测试
 * 集成Qwen-VL视觉验证和GLM-4V逻辑判断
 */
export default defineConfig({
  testDir: './e2e',

  /* 运行测试文件时并行 */
  fullyParallel: true,

  /* 在CI上禁止失败时重试 */
  forbidOnly: !!process.env.CI,

  /* 本地重试2次，CI重试3次 */
  retries: process.env.CI ? 3 : 2,

  /* 本地并行工作器数，CI上使用1个 */
  workers: process.env.CI ? 1 : undefined,

  /* 报告器配置 */
  reporter: [
    ['html', { open: 'never', outputFolder: 'reports/playwright-report' }],
    ['json', { outputFile: 'reports/test-results.json' }],
    ['./utils/ai-test-reporter.ts'],
  ],

  /* 共享配置 */
  use: {
    /* 基础URL */
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:5173',

    /* 收集所有追踪 */
    trace: 'on-all-retries',

    /* 收集视频 */
    video: 'on-first-retry',

    /* 收集截图 */
    screenshot: 'only-on-failure',

    /* 视口大小 */
    viewport: { width: 1920, height: 1080 },

    /* 动作超时 */
    actionTimeout: 30000,

    /* 导航超时 */
    navigationTimeout: 30000,
  },

  /* 项目配置 */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* 本地开发服务器配置 */
  webServer: process.env.SKIP_WEB_SERVER
    ? undefined
    : {
        command: 'cd /home/lixiang/Desktop/zhongyi_game/src && npm run dev',
        url: 'http://localhost:5173',
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
      },
});

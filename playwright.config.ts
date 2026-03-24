import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import * as path from 'path';

// 加载 .env 文件
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'cd src && vite --port 3000',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120000,
  },
});

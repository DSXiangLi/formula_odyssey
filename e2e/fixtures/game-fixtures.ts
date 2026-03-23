import { test as base, expect } from '@playwright/test';
import { AIVisionService } from '../services/aiVision';
import { ScreenshotHelper } from '../helpers/screenshot';

export const test = base.extend<{
  aiVision: AIVisionService;
  screenshotHelper: ScreenshotHelper;
}>({
  aiVision: async ({}, use) => {
    const service = new AIVisionService();
    await use(service);
  },

  screenshotHelper: async ({}, use, testInfo) => {
    const helper = new ScreenshotHelper(testInfo.title.replace(/\s+/g, '-'));
    await use(helper);
  },
});

export { expect };

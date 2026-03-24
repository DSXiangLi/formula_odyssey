import { test as base, expect } from '@playwright/test';
import { AIVisionService } from '../services/aiVision';
import { ScreenshotHelper } from '../helpers/screenshot';
import { MapHelper } from '../helpers/map-helper';
import { MinigameHelper } from '../helpers/minigame-helper';
import { GameStateValidator } from '../helpers/game-state';

export const test = base.extend<{
  aiVision: AIVisionService;
  screenshotHelper: ScreenshotHelper;
  mapHelper: MapHelper;
  minigameHelper: MinigameHelper;
  gameStateValidator: GameStateValidator;
}>({
  aiVision: async ({}, use) => {
    const service = new AIVisionService();
    await use(service);
  },

  screenshotHelper: async ({}, use, testInfo) => {
    const helper = new ScreenshotHelper(testInfo.title.replace(/\s+/g, '-'));
    await use(helper);
  },

  mapHelper: async ({ page }, use) => {
    const helper = new MapHelper(page);
    await use(helper);
  },

  minigameHelper: async ({ page }, use) => {
    const helper = new MinigameHelper(page);
    await use(helper);
  },

  gameStateValidator: async ({ page }, use) => {
    const validator = new GameStateValidator(page);
    await use(validator);
  },
});

export { expect };

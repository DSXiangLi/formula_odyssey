import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export class ScreenshotHelper {
  private screenshotDir: string;

  constructor(testName: string) {
    this.screenshotDir = path.join('e2e', 'screenshots', testName);
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }
  }

  async capture(page: Page, name: string): Promise<string> {
    const filepath = path.join(this.screenshotDir, `${name}.png`);
    await page.screenshot({ path: filepath, fullPage: true });
    return filepath;
  }

  async captureElement(page: Page, selector: string, name: string): Promise<string> {
    const element = page.locator(selector);
    const filepath = path.join(this.screenshotDir, `${name}.png`);
    await element.screenshot({ path: filepath });
    return filepath;
  }

  getScreenshotPath(name: string): string {
    return path.join(this.screenshotDir, `${name}.png`);
  }
}

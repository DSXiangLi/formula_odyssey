import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();

page.on('console', msg => console.log(`CONSOLE: ${msg.type()}: ${msg.text()}`));
page.on('pageerror', err => console.log(`PAGE ERROR: ${err.message}`));

// Try loading home page first
try {
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 5000 });
  console.log('Home page loaded');
  await page.waitForTimeout(2000);
  const title = await page.title();
  console.log('Page title:', title);
} catch (e) {
  console.log('Home page Error:', e.message);
}

await browser.close();

import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // 捕获控制台错误
  page.on('console', msg => {
    console.log(`Console [${msg.type()}]:`, msg.text());
  });

  page.on('pageerror', error => {
    console.log('Page Error:', error.message);
    console.log('Stack:', error.stack);
  });

  try {
    await page.goto('http://localhost:3001/chapter/chapter-1', { timeout: 30000 });
    await page.waitForTimeout(3000);

    // 检查root元素是否有内容
    const rootContent = await page.evaluate(() => {
      const root = document.getElementById('root');
      return root ? root.innerHTML.substring(0, 500) : 'No root element';
    });
    console.log('Root content:', rootContent);

  } catch (e) {
    console.log('Error:', e.message);
  }

  await browser.close();
})();

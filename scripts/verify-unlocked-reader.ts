import { chromium } from 'playwright';
import { preview } from 'vite';

async function captureScreenshots() {
  const server = await preview({
    preview: { port: 0 },
  });

  const baseUrl = server.resolvedUrls?.local[0] || 'http://localhost:4173/';
  console.log(`Preview server running at ${baseUrl}`);

  const browser = await chromium.launch();

  const viewports = [
    { name: '390x844', width: 390, height: 844 },
    { name: '768x1024', width: 768, height: 1024 },
    { name: '1440x900', width: 1440, height: 900 },
  ];

  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
    });
    const page = await context.newPage();

    // 1. Reader page initial load
    await page.goto(`${baseUrl}novel/shattered-reach/chapter/chapter-1`, {
      waitUntil: 'networkidle',
    });
    await page.waitForTimeout(600);

    // 2. Open TOC Drawer
    await page.evaluate(() => {
      const btn = document.querySelector('button[aria-label="Table of Contents"]') as HTMLElement | null;
      if (btn) btn.click();
    });
    await page.waitForTimeout(600);

    // Capture TOC showing chapters 1-10 with no locks or coins
    await page.screenshot({
      path: `screenshots/toc-unlocked-${vp.name}.png`,
    });
    console.log(`Saved screenshots/toc-unlocked-${vp.name}.png`);

    // 3. Click Chapter 5 in TOC - should navigate directly without any modal
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const ch5Btn = buttons.find((b) => b.textContent?.includes('Chapter 5'));
      if (ch5Btn) ch5Btn.click();
    });
    await page.waitForTimeout(800);

    await page.screenshot({
      path: `screenshots/chapter-5-direct-${vp.name}.png`,
    });
    console.log(`Saved screenshots/chapter-5-direct-${vp.name}.png`);

    await context.close();
  }

  await browser.close();
  await new Promise<void>((resolve) => server.httpServer.close(() => resolve()));
}

captureScreenshots().catch((err) => {
  console.error(err);
  process.exit(1);
});

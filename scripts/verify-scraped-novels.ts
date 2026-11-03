import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import { preview } from 'vite';

async function verifyScrapedNovels() {
  const screenshotsDir = path.resolve('screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const server = await preview({
    preview: { port: 4185 },
  });

  const baseUrl = server.resolvedUrls?.local?.[0]?.replace(/\/$/, '') || 'http://localhost:4185';
  console.log('Preview server started at', baseUrl);

  const browser = await chromium.launch();

  try {
    // 1. Mobile (390x844) - Scraped Novel: Top-Class Comprehension
    {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const page = await context.newPage();
      await page.goto(`${baseUrl}/novel/top-class-comprehension-start-with-basic-fist-techniques/chapter/chapter-1`, {
        waitUntil: 'domcontentloaded',
      });
      await page.waitForSelector('article', { timeout: 8000 });
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(600);

      await page.screenshot({ path: path.join(screenshotsDir, 'scraped-390x844.png') });
      console.log('✓ Captured mobile 390x844 screenshot');
      await context.close();
    }

    // 2. Tablet (768x1024) - Library Drawer open
    {
      const context = await browser.newContext({ viewport: { width: 768, height: 1024 } });
      const page = await context.newPage();
      await page.goto(`${baseUrl}/novel/top-class-comprehension-start-with-basic-fist-techniques/chapter/chapter-1`, {
        waitUntil: 'domcontentloaded',
      });
      await page.waitForSelector('article', { timeout: 8000 });
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(400);

      // Click Library button in header (which is visible at top of page)
      const libraryBtn = page.locator('button[aria-label="Library"]');
      await libraryBtn.click();
      await page.waitForTimeout(600);

      await page.screenshot({ path: path.join(screenshotsDir, 'library-drawer-768x1024.png') });
      console.log('✓ Captured tablet 768x1024 Library Drawer screenshot');
      await context.close();
    }

    // 3. Desktop (1440x900) - Supremacy Games with Table of Contents (1,958 chapters)
    {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await context.newPage();
      await page.goto(`${baseUrl}/novel/supremacy-games/chapter/chapter-1`, {
        waitUntil: 'domcontentloaded',
      });
      await page.waitForSelector('article', { timeout: 8000 });
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(600);

      await page.screenshot({ path: path.join(screenshotsDir, 'supremacy-1440x900.png') });
      console.log('✓ Captured desktop 1440x900 Supremacy Games reader screenshot');

      // Open Table of Contents from bottom dock or TOC button
      const tocBtn = page.locator('button[aria-label="Table of Contents"]');
      await tocBtn.click();
      await page.waitForTimeout(600);

      await page.screenshot({ path: path.join(screenshotsDir, 'supremacy-toc-1440x900.png') });
      console.log('✓ Captured desktop 1440x900 TOC drawer (1,958 chapters) screenshot');

      await context.close();
    }
  } finally {
    await browser.close();
    await new Promise<void>((resolve) => server.httpServer.close(() => resolve()));
  }

  console.log('🎉 Verification run complete!');
}

verifyScrapedNovels().catch((err) => {
  console.error('Error during verification:', err);
  process.exit(1);
});

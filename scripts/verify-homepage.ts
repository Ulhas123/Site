import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import { preview } from 'vite';

async function verifyHomepage() {
  const screenshotsDir = path.resolve('screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const server = await preview({
    preview: { port: 4188 },
  });

  const baseUrl = server.resolvedUrls?.local?.[0]?.replace(/\/$/, '') || 'http://localhost:4188';
  console.log('Preview server started at', baseUrl);

  const browser = await chromium.launch();

  try {
    // 1. Mobile (390x844)
    {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const page = await context.newPage();
      await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('article', { timeout: 8000 });
      await page.waitForTimeout(500);

      const filePath = path.join(screenshotsDir, 'homepage-390x844.png');
      await page.screenshot({ path: filePath });
      console.log('✓ Captured mobile 390x844 screenshot at', filePath);
      await context.close();
    }

    // 2. Tablet (768x1024)
    {
      const context = await browser.newContext({ viewport: { width: 768, height: 1024 } });
      const page = await context.newPage();
      await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('article', { timeout: 8000 });
      await page.waitForTimeout(500);

      const filePath = path.join(screenshotsDir, 'homepage-768x1024.png');
      await page.screenshot({ path: filePath });
      console.log('✓ Captured tablet 768x1024 screenshot at', filePath);
      await context.close();
    }

    // 3. Desktop (1440x900) - Default Dark
    {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await context.newPage();
      await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('article', { timeout: 8000 });
      await page.waitForTimeout(500);

      const filePath = path.join(screenshotsDir, 'homepage-1440x900.png');
      await page.screenshot({ path: filePath });
      console.log('✓ Captured desktop 1440x900 dark screenshot at', filePath);

      // Test Sepia Theme
      const sepiaBtn = page.locator('button[aria-label="Sepia theme"]');
      if (await sepiaBtn.count()) {
        await sepiaBtn.click();
        await page.waitForTimeout(400);
        await page.screenshot({ path: path.join(screenshotsDir, 'homepage-sepia-1440x900.png') });
        console.log('✓ Captured desktop sepia theme screenshot');
      }

      // Test Midnight Theme
      const midnightBtn = page.locator('button[aria-label="Midnight theme"]');
      if (await midnightBtn.count()) {
        await midnightBtn.click();
        await page.waitForTimeout(400);
        await page.screenshot({ path: path.join(screenshotsDir, 'homepage-midnight-1440x900.png') });
        console.log('✓ Captured desktop midnight theme screenshot');
      }

      // Test Light Theme
      const lightBtn = page.locator('button[aria-label="Light theme"]');
      if (await lightBtn.count()) {
        await lightBtn.click();
        await page.waitForTimeout(400);
        await page.screenshot({ path: path.join(screenshotsDir, 'homepage-light-1440x900.png') });
        console.log('✓ Captured desktop light theme screenshot');
      }

      // Test search filter
      await page.locator('button[aria-label="Dark theme"]').click();
      await page.waitForTimeout(200);
      const searchInput = page.locator('input[aria-label="Search uploaded novels"]');
      await searchInput.fill('Fist');
      await page.waitForTimeout(300);
      await page.screenshot({ path: path.join(screenshotsDir, 'homepage-search-filtered.png') });
      console.log('✓ Captured search filter screenshot');

      // Test with saved reading progress
      await searchInput.fill('');
      await page.evaluate(() => {
        const progressData = {
          state: {
            progressByNovel: {
              'supremacy-games': {
                chapterId: 'chapter-5',
                percent: 42,
                updatedAt: Date.now(),
              },
            },
            bookmarks: [],
            readChapterIds: ['chapter-1', 'chapter-2', 'chapter-3', 'chapter-4'],
          },
          version: 0,
        };
        localStorage.setItem('wn-progress', JSON.stringify(progressData));
      });
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForSelector('article', { timeout: 8000 });
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(screenshotsDir, 'homepage-with-resume-banner.png') });
      console.log('✓ Captured homepage with resume banner screenshot');

      // Clean up localStorage
      await page.evaluate(() => localStorage.removeItem('wn-progress'));

      await context.close();
    }

    console.log('All homepage screenshots verified successfully!');
  } finally {
    await browser.close();
    await server.close();
  }
}

verifyHomepage().catch((err) => {
  console.error('Homepage verification failed:', err);
  process.exit(1);
});

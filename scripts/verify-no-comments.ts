import { chromium } from 'playwright';
import { preview } from 'vite';

async function verifyNoComments() {
  const server = await preview({
    preview: { port: 4174 },
  });

  const browser = await chromium.launch();

  const viewports = [
    { width: 390, height: 844, name: 'reader-clean-390x844.png' },
    { width: 768, height: 1024, name: 'reader-clean-768x1024.png' },
    { width: 1440, height: 900, name: 'reader-clean-1440x900.png' },
  ];

  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();

    await page.goto('http://localhost:4174/novel/shattered-reach/chapter/chapter-1', {
      waitUntil: 'networkidle',
    });

    const badges = await page.locator('button[data-interactive="comment-badge"]').count();
    console.log(`[${vp.width}x${vp.height}] Shuttered Reach comment badge count: ${badges}`);
    if (badges !== 0) {
      throw new Error(`Expected 0 comment badges, found ${badges}`);
    }

    await page.screenshot({ path: `screenshots/${vp.name}` });
    await context.close();
  }

  const contextScraped = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const pageScraped = await contextScraped.newPage();
  await pageScraped.goto('http://localhost:4174/novel/supremacy-games/chapter/chapter-1', {
    waitUntil: 'networkidle',
  });

  const scrapedBadges = await pageScraped.locator('button[data-interactive="comment-badge"]').count();
  console.log(`[1440x900] Supremacy Games comment badge count: ${scrapedBadges}`);
  if (scrapedBadges !== 0) {
    throw new Error(`Expected 0 comment badges in scraped novel, found ${scrapedBadges}`);
  }

  await pageScraped.screenshot({ path: 'screenshots/reader-supremacy-clean-1440x900.png' });
  await contextScraped.close();

  await browser.close();
  await new Promise<void>((resolve) => server.httpServer.close(() => resolve()));
  console.log('Verification successful: 0 comments per line found across all novels.');
}

verifyNoComments().catch((err) => {
  console.error(err);
  process.exit(1);
});

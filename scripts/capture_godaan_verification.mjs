import { chromium } from 'playwright';
import fs from 'fs';

async function main() {
  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots', { recursive: true });
  }

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Capturing Desktop Homepage at 1440x900...');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:4173/');
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'screenshots/desktop_home_godaan.png' });

  console.log('Capturing Desktop Reader Chapter 1 at 1440x900...');
  await page.goto('http://localhost:4173/novel/godaan/chapter/chapter-1');
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'screenshots/desktop_reader_godaan_ch1.png' });

  console.log('Capturing Desktop Reader Chapter 1 (Top & Header) at 1440x900...');
  await page.evaluate(() => {
    localStorage.removeItem('wn-progress');
  });
  await page.goto('http://localhost:4173/novel/godaan/chapter/chapter-1');
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'screenshots/desktop_reader_godaan_ch1_top.png' });

  console.log('Capturing Desktop Reader TOC Drawer at 1440x900...');
  // Click middle of canvas to reveal reader chrome & dock
  await page.mouse.click(720, 450);
  await page.waitForTimeout(400);

  const tocBtn = page.locator('button[aria-label="Table of Contents"]').first();
  await tocBtn.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'screenshots/desktop_reader_godaan_toc.png' });
  // Close drawer with Escape
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  console.log('Capturing Tablet Reader at 768x1024...');
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto('http://localhost:4173/novel/godaan/chapter/chapter-1');
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'screenshots/tablet_reader_godaan_ch1.png' });

  console.log('Capturing Mobile Reader at 390x844...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:4173/novel/godaan/chapter/chapter-1');
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'screenshots/mobile_reader_godaan_ch1.png' });

  await browser.close();
  console.log('✅ All Godaan verification screenshots captured successfully!');
}

main().catch((err) => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});

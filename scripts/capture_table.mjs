import { chromium } from 'playwright';

async function testTable() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  await context.addInitScript(() => {
    localStorage.setItem('study_materials_auth', 'true');
  });
  const page = await context.newPage();
  await page.setViewportSize({ width: 1200, height: 900 });
  await page.goto('http://localhost:4173/novel/ai-and-ds-engineering-handbook/chapter/chapter-2');
  await page.waitForTimeout(1000);

  // Scroll to Permissions heading
  const heading = page.locator('h3:has-text("Permissions, Ownership")');
  await heading.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshots/table_fixed_rendered.png' });
  await browser.close();
  console.log('✅ Captured table_fixed_rendered.png');
}

testTable();

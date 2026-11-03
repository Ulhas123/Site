import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { preview } from 'vite';

async function auditAllStates() {
  const server = await preview({
    preview: { port: 4173 },
  });

  const url = 'http://localhost:4173/novel/shattered-reach/chapter/chapter-1';
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.goto(url, { waitUntil: 'networkidle' });

  // 1. Reader state
  console.log('\n--- Checking State: Reader ---');
  let axe = await new AxeBuilder({ page }).analyze();
  console.log('Violations in Reader:', axe.violations.map(v => `${v.id} (${v.nodes.length})`).join(', ') || 'None');

  // 2. Settings Drawer
  console.log('\n--- Checking State: Settings Drawer ---');
  await page.getByRole('button', { name: 'Reading Settings' }).click();
  await page.waitForTimeout(300);
  axe = await new AxeBuilder({ page }).analyze();
  console.log('Violations in Settings Drawer:', axe.violations.map(v => `${v.id} (${v.nodes.length})`).join(', ') || 'None');
  for (const v of axe.violations) {
    console.log(`  [${v.impact}] ${v.id}: ${v.description}`);
    for (const node of v.nodes) console.log(`    Target: ${node.target.join(' ')} | Failure: ${node.failureSummary}`);
  }
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // 3. TOC Drawer
  console.log('\n--- Checking State: TOC Drawer ---');
  await page.getByRole('button', { name: 'Table of Contents' }).click();
  await page.waitForTimeout(300);
  axe = await new AxeBuilder({ page }).analyze();
  console.log('Violations in TOC Drawer:', axe.violations.map(v => `${v.id} (${v.nodes.length})`).join(', ') || 'None');
  for (const v of axe.violations) {
    console.log(`  [${v.impact}] ${v.id}: ${v.description}`);
    for (const node of v.nodes) console.log(`    Target: ${node.target.join(' ')} | Failure: ${node.failureSummary}`);
  }

  // 4. Locked Modal (click chapter 5 in TOC)
  console.log('\n--- Checking State: Locked Modal ---');
  // Chapter 5 is locked
  const ch5 = page.getByText(/Chapter 5/i).first();
  if (await ch5.isVisible()) {
    await ch5.click();
    await page.waitForTimeout(300);
    axe = await new AxeBuilder({ page }).analyze();
    console.log('Violations in Locked Modal:', axe.violations.map(v => `${v.id} (${v.nodes.length})`).join(', ') || 'None');
    for (const v of axe.violations) {
      console.log(`  [${v.impact}] ${v.id}: ${v.description}`);
      for (const node of v.nodes) console.log(`    Target: ${node.target.join(' ')} | Failure: ${node.failureSummary}`);
    }
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }
  await page.keyboard.press('Escape'); // close TOC
  await page.waitForTimeout(300);

  // 5. Comments Drawer
  console.log('\n--- Checking State: Comments Drawer ---');
  const commentBtn = page.getByRole('button', { name: /Comments/i }).first();
  await commentBtn.click();
  await page.waitForTimeout(300);
  axe = await new AxeBuilder({ page }).analyze();
  console.log('Violations in Comments Drawer:', axe.violations.map(v => `${v.id} (${v.nodes.length})`).join(', ') || 'None');
  for (const v of axe.violations) {
    console.log(`  [${v.impact}] ${v.id}: ${v.description}`);
    for (const node of v.nodes) console.log(`    Target: ${node.target.join(' ')} | Failure: ${node.failureSummary}`);
  }
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // 6. Chapter End
  console.log('\n--- Checking State: Chapter End ---');
  await page.evaluate(() => {
    const ch1 = document.querySelector('article[data-chapter-id="chapter-1"]');
    if (ch1) ch1.scrollIntoView({ block: 'end' });
  });
  await page.waitForTimeout(400);
  axe = await new AxeBuilder({ page }).analyze();
  console.log('Violations in Chapter End:', axe.violations.map(v => `${v.id} (${v.nodes.length})`).join(', ') || 'None');
  for (const v of axe.violations) {
    console.log(`  [${v.impact}] ${v.id}: ${v.description}`);
    for (const node of v.nodes) console.log(`    Target: ${node.target.join(' ')} | Failure: ${node.failureSummary}`);
  }

  await context.close();
  await browser.close();
  await new Promise<void>((resolve) => server.httpServer.close(() => resolve()));
}

auditAllStates().catch(console.error);

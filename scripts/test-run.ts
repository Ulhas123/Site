import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { preview } from 'vite';

async function testSite() {
  const server = await preview({
    preview: { port: 4173 },
  });

  const url = 'http://localhost:4173/novel/shattered-reach/chapter/chapter-1';
  console.log('Preview server started at', url);

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();

  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => {
    consoleErrors.push(err.message);
  });

  await page.goto(url, { waitUntil: 'networkidle' });

  // Check Axe on reader
  const axeResults = await new AxeBuilder({ page }).analyze();
  console.log('Reader violations:', axeResults.violations.length);
  for (const v of axeResults.violations) {
    console.log(`- [${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} nodes)`);
    for (const node of v.nodes) {
      console.log(`    Target: ${node.target.join(' ')}`);
      console.log(`    Failure: ${node.failureSummary}`);
    }
  }

  console.log('Console errors:', consoleErrors);

  await context.close();
  await browser.close();
  await new Promise<void>((resolve) => server.httpServer.close(() => resolve()));
}

testSite().catch(console.error);

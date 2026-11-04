import { chromium } from 'playwright';
import fs from 'fs';

async function capture() {
  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots', { recursive: true });
  }

  const browser = await chromium.launch();
  
  // 1. Authenticated session
  const authContext = await browser.newContext();
  await authContext.addInitScript(() => {
    localStorage.setItem('study_materials_auth', 'true');
  });

  const authPage = await authContext.newPage();

  // Desktop (1440x900) - Homepage Study Tab
  await authPage.setViewportSize({ width: 1440, height: 900 });
  await authPage.goto('http://localhost:4173/');
  await authPage.waitForTimeout(600);
  
  // Switch to study tab
  const studyTab = authPage.locator('button:has-text("Study Materials")');
  await studyTab.click();
  await authPage.waitForTimeout(400);
  await authPage.screenshot({ path: 'screenshots/desktop_home_study_tab.png' });

  // Desktop (1440x900) - Reader Chapter 2 with Diagram & Boxes
  await authPage.goto('http://localhost:4173/novel/ai-and-ds-engineering-handbook/chapter/chapter-2');
  await authPage.waitForTimeout(800);
  await authPage.screenshot({ path: 'screenshots/desktop_reader_ch2_diagram.png' });

  // Tablet (768x1024) - Reader
  await authPage.setViewportSize({ width: 768, height: 1024 });
  await authPage.waitForTimeout(400);
  await authPage.screenshot({ path: 'screenshots/tablet_reader_ch2.png' });

  // Mobile (390x844) - Reader
  await authPage.setViewportSize({ width: 390, height: 844 });
  await authPage.waitForTimeout(400);
  await authPage.screenshot({ path: 'screenshots/mobile_reader_ch2.png' });

  // 2. Unauthenticated session - Password Modal Check
  const lockedContext = await browser.newContext();
  const lockedPage = await lockedContext.newPage();
  await lockedPage.setViewportSize({ width: 1440, height: 900 });
  await lockedPage.goto('http://localhost:4173/');
  await lockedPage.waitForTimeout(600);

  const lockedTab = lockedPage.locator('button:has-text("Study Materials")');
  await lockedTab.click();
  await lockedPage.waitForTimeout(500);
  await lockedPage.screenshot({ path: 'screenshots/desktop_password_modal.png' });

  await browser.close();
  console.log('✅ Captured all verification screenshots at 390x844, 768x1024, and 1440x900');
}

capture().catch((err) => {
  console.error('Error during screenshot capture:', err);
  process.exit(1);
});

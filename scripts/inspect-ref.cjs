const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const files = fs.readdirSync('reference').filter(f => f.endsWith('.png'));
  
  for (const f of files) {
    const _fullPath = path.resolve('reference', f).replace(/\\/g, '/');
    const dataUrl = 'data:image/png;base64,' + fs.readFileSync(path.resolve('reference', f)).toString('base64');
    
    await page.setContent(`
      <html>
        <head>
          <script src="https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js"></script>
        </head>
        <body style="margin:0; background:#000;">
          <img id="img" src="${dataUrl}" />
        </body>
      </html>
    `);

    try {
      const text = await page.evaluate(async () => {
        const worker = await Tesseract.createWorker('eng');
        const ret = await worker.recognize(document.getElementById('img'));
        await worker.terminate();
        return ret.data.text;
      });
      console.log(`\n=== ${f} ===\n${text.split('\n').filter(l => l.trim().length > 0).slice(0, 10).join('\n')}`);
    } catch (e) {
      console.error(f, e.message);
    }
  }
  await browser.close();
})();

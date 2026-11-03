const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const file = 'Screenshot 2026-11-02 202006.png';
  const dataUrl = 'data:image/png;base64,' + fs.readFileSync(path.resolve('reference', file)).toString('base64');
  
  await page.setContent(`
    <html>
      <head>
        <script src="https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js"></script>
      </head>
      <body>
        <img id="img" src="${dataUrl}" />
      </body>
    </html>
  `);
  
  const text = await page.evaluate(async () => {
    const worker = await Tesseract.createWorker('eng');
    const ret = await worker.recognize(document.getElementById('img'));
    await worker.terminate();
    return ret.data.text;
  });
  console.log(`=== FULL OCR: ${file} ===\n`, text);
  await browser.close();
})();

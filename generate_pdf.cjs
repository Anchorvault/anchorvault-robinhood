const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files']
  });
  const page = await browser.newPage();

  const filePath = path.resolve(__dirname, 'pitch_deck.html');
  await page.goto('file:///' + filePath.replace(/\\/g, '/'), {
    waitUntil: 'networkidle0',
    timeout: 30000
  });

  await page.pdf({
    path: path.resolve(__dirname, 'AnchorVault_Pitch_Deck.pdf'),
    width: '1280px',
    height: '720px',
    printBackground: true,
    preferCSSPageSize: false,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  console.log('PDF generated successfully: AnchorVault_Pitch_Deck.pdf');
  await browser.close();
})();

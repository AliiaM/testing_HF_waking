const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const url = process.env.SPACE_URL;
  if (!url) {
    throw new Error('SPACE_URL is not set');
  }

  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const logPath = path.join('artifacts', 'logs', `run-${ts}.log`);
  const screenshotPath = path.join('artifacts', 'screenshots', `space-${ts}.png`);

  const appendLog = (msg) => {
    const line = `[${new Date().toISOString()}] ${msg}\n`;
    fs.appendFileSync(logPath, line);
    process.stdout.write(line);
  };

  appendLog(`Opening ${url}`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1024 } });

  try {
    const response = await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 120000
    });

    appendLog(`HTTP status: ${response ? response.status() : 'no response'}`);

    await page.waitForTimeout(15000);

    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });

    appendLog(`Screenshot saved: ${screenshotPath}`);
    appendLog(`Page title: ${await page.title()}`);
  } catch (err) {
    appendLog(`ERROR: ${err.message}`);
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });
    throw err;
  } finally {
    await browser.close();
    appendLog('Browser closed');
  }
})();

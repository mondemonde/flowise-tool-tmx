const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const browserProcess = browser.process();
    if (browserProcess) {
        console.log('Chromium process path:', browserProcess.spawnfile);
    } else {
        console.log('Could not determine Chromium process path.');
    }
    await browser.close();
})();

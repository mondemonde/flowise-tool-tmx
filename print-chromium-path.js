const { chromium } = require('playwright');

(async () => {
    const executablePath = chromium.executablePath();
    console.log('Chromium executable path:', executablePath);
})();

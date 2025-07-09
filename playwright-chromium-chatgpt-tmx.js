const { chromium } = require('playwright');

(async () => {
  const userDataDir = './chromium-profile'; // Persistent profile directory

  // Launch Playwright's bundled Chromium with persistent context
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: ['--start-maximized'],
  });

  const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();

  // Step 1: Ensure Google login
  await page.goto('https://accounts.google.com', { waitUntil: 'domcontentloaded' });
  console.log('If not already logged in, please log in to your Google account in the browser.');

  // Wait for user to confirm Google login
  await new Promise(resolve => {
    process.stdin.resume();
    console.log('Press Enter after you have logged in to Google...');
    process.stdin.once('data', () => resolve());
  });

  // Step 2: Navigate to ChatGPT
  await page.goto('https://chatgpt.com/', { waitUntil: 'domcontentloaded' });
  console.log('If not already logged in to ChatGPT, please log in manually.');

  // Wait for user to confirm ChatGPT login
  await new Promise(resolve => {
    process.stdin.resume();
    console.log('Press Enter after you have logged in to ChatGPT...');
    process.stdin.once('data', () => resolve());
  });

  // Step 3: Navigate to TMX project (example URL, change as needed)
  const tmxUrl = 'https://chatgpt.com/g/g-p-68660da68b2c8191af885bf728d0ef81-tmx-dl/project';
  await page.goto(tmxUrl, { waitUntil: 'domcontentloaded' });
  console.log('Navigated to TMX project. You can now interact with ChatGPT TMX.');

  // Keep browser open for manual or automated actions
  console.log('Browser will remain open. Press Ctrl+C to exit.');
})();

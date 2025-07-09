const { chromium } = require('playwright');

(async () => {
  const userDataDir = './google-profile'; // Use the saved Google session

  // Launch Chromium with the persistent profile
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: ['--start-maximized'],
  });

  // Use the first page or create a new one
  const pages = context.pages();
  const page = pages.length > 0 ? pages[0] : await context.newPage();

  // Example: open Google homepage (you can change this)
  await page.goto('https://www.google.com');

  console.log('Chromium launched with your saved Google profile.');
  console.log('You should be logged in automatically.');

  // Prevent script from exiting
  await new Promise(() => {});
})();

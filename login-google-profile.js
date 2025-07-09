const { chromium } = require('playwright');

(async () => {
  const userDataDir = './google-profile'; // Directory to store session

  // Launch Chromium with persistent context
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false, // Show browser so you can log in
    args: [
      '--start-maximized',
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-infobars',
      '--disable-dev-shm-usage',
      '--disable-extensions',
      '--disable-gpu',
      '--disable-setuid-sandbox'
    ],
    // Remove executablePath to use Playwright's Chromium
  });

  // Set a real browser user agent to reduce detection
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });
  const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
  context.setDefaultUserAgent && context.setDefaultUserAgent(userAgent);

  // Use the first page or create a new one
  const pages = context.pages();
  const page = pages.length > 0 ? pages[0] : await context.newPage();

  // Navigate to Google login
  await page.goto('https://accounts.google.com');

  // Wait for manual login
  console.log('Please log in manually in the opened browser window.');
  console.log('Your session will be saved in ./google-profile for future use.');
  console.log('Keep this script running until you finish logging in. Press Ctrl+C to exit when done.');

  // Prevent script from exiting
  await new Promise(() => {});
})();

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { chromium, Browser, Page } from 'playwright';
import { SendChatgptTmxMessageDto } from './dto/send-chatgpt-tmx-message.dto';

@Injectable()
export class PlaywrightService {
  private readonly logger = new Logger(PlaywrightService.name);
  private readonly CHATGPT_EMAIL: string;
  private readonly CHATGPT_PASSWORD: string;
  private readonly CHROME_CDP_URL: string;
  private readonly TMX_URL = 'https://chatgpt.com/g/g-p-6833ee4454248191b3d0277129630c33-tmx/project';

  constructor(private readonly configService: ConfigService) {
    this.CHATGPT_EMAIL = this.configService.get<string>('CHATGPT_EMAIL', '');
    this.CHATGPT_PASSWORD = this.configService.get<string>('CHATGPT_PASSWORD', '');
    this.CHROME_CDP_URL = this.configService.get<string>('CHROME_CDP_URL', '');
  }

  async sendMessageToChatGPT(dto: SendChatgptTmxMessageDto): Promise<string> {
    const { message, timeout = 30, headless = true } = dto;
    let browser: Browser | null = null;
    let page: Page | null = null;

    try {
      if (this.CHROME_CDP_URL) {
        browser = await chromium.connectOverCDP(this.CHROME_CDP_URL);
      } else {
        browser = await chromium.launch({
          headless,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
          ],
        });
      }

      const context = browser.contexts().length > 0
        ? browser.contexts()[0]
        : await browser.newContext({
            userAgent:
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport: { width: 1280, height: 720 },
          });

      page = await context.newPage();
      page.setDefaultTimeout(timeout * 1000);

      // Step 1: Navigate to ChatGPT main page for login
      await page.goto('https://chatgpt.com/', {
        waitUntil: 'networkidle',
        timeout: 60000,
      });

      // Wait for login or chat input
      let loggedIn = false;
      for (let i = 0; i < 30; i++) {
        const chatInputVisible = await page
          .locator('#prompt-textarea')
          .first()
          .isVisible({ timeout: 1000 })
          .catch(() => false);
        const newChatButtonVisible = await page
          .locator('button:has-text("New chat")')
          .first()
          .isVisible({ timeout: 1000 })
          .catch(() => false);
        if (chatInputVisible || newChatButtonVisible) {
          loggedIn = true;
          break;
        }
        await page.waitForTimeout(2000);
      }
      if (!loggedIn) {
        throw new Error('Manual login to ChatGPT was not detected. Please log in and try again.');
      }

      // Step 2: Navigate to TMX project
      await page.goto(this.TMX_URL, {
        waitUntil: 'domcontentloaded',
        timeout: 60000,
      });
      await page.waitForLoadState('domcontentloaded', { timeout: 60000 });

      // Wait for chat input to appear
      let chatInputReady = false;
      for (let i = 0; i < 60; i++) {
        const chatInputVisible = await page
          .locator('#prompt-textarea')
          .first()
          .isVisible({ timeout: 1000 })
          .catch(() => false);
        if (chatInputVisible) {
          chatInputReady = true;
          break;
        }
        await page.waitForTimeout(2000);
      }
      if (!chatInputReady) {
        throw new Error('Chat input did not appear. Please ensure you have solved any security challenge and the page is fully loaded.');
      }

      // Find chat input
      const chatInputSelectors = [
        'textarea[placeholder*="Message"]',
        'textarea[data-id="root"]',
        '#prompt-textarea',
        'textarea[placeholder*="Send a message"]',
        'div[contenteditable="true"]',
        'textarea',
      ];
      let chatInput = null;
      for (const selector of chatInputSelectors) {
        try {
          chatInput = page.locator(selector).first();
          if (await chatInput.isVisible({ timeout: 3000 })) {
            break;
          }
        } catch (e) {
          continue;
        }
      }
      if (!chatInput || !(await chatInput.isVisible({ timeout: 5000 }).catch(() => false))) {
        throw new Error('Could not find chat input field. Make sure you are logged in and the page is loaded.');
      }

      // Send message
      await chatInput.click();
      await chatInput.fill('');
      await chatInput.fill(message);
      await page.waitForTimeout(5000);
      await chatInput.press('Enter');
      await page.waitForTimeout(2000);

      // Wait for response
      const responseSelectors = [
        '[data-message-author-role="assistant"]',
        '.markdown',
        '[role="presentation"] p',
        '.prose',
        'div[data-testid*="conversation-turn"]',
      ];
      let responseText = '';
      for (let attempt = 0; attempt < 10; attempt++) {
        for (const selector of responseSelectors) {
          try {
            const elements = page.locator(selector);
            const count = await elements.count();
            if (count > 0) {
              const responseElement = elements.last();
              responseText = await responseElement.textContent();
              if (responseText && responseText.trim().length > 0) {
                break;
              }
            }
          } catch (e) {
            continue;
          }
        }
        if (responseText && responseText.trim().length > 0) {
          break;
        }
        await page.waitForTimeout(2000);
      }
      if (!responseText || responseText.trim().length === 0) {
        const pageContent = await page.textContent('body');
        const lines = pageContent
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line.length > 0);
        const messageIndex = lines.findIndex((line) => line.includes(message));
        if (messageIndex >= 0 && messageIndex < lines.length - 1) {
          for (let i = messageIndex + 1; i < lines.length; i++) {
            if (
              lines[i].length > 20 &&
              !lines[i].includes('Send message') &&
              !lines[i].includes('ChatGPT')
            ) {
              responseText = lines[i];
              break;
            }
          }
        }
        if (!responseText) {
          throw new Error('Could not extract AI response from the page. The response might be taking longer than expected.');
        }
      }
      return responseText.trim();
    } finally {
      try {
        if (page) await page.close();
        if (browser) await browser.close();
      } catch (cleanupError) {
        // ignore
      }
    }
  }
}

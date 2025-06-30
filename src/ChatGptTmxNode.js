const { INode, INodeData, INodeParams } = require('flowise-components');
const { chromium } = require('playwright');

class ChatGptTmxNode {
    label = 'ChatGPT TMX';
    name = 'chatGptTmx';
    version = 1.0;
    type = 'ChatGptTmxNode';
    icon = 'chatgpt.svg';
    category = 'Custom Tools';
    description = 'Send messages to ChatGPT TMX project and get AI responses';
    baseClasses = ['ChatGptTmxNode'];
    inputs = [
        {
            label: 'Message',
            name: 'message',
            type: 'string',
            description: 'The message to send to ChatGPT TMX',
            placeholder: 'Enter your message here...'
        },
        {
            label: 'Timeout (seconds)',
            name: 'timeout',
            type: 'number',
            description: 'Maximum time to wait for response',
            default: 30,
            optional: true
        },
        {
            label: 'Headless Mode',
            name: 'headless',
            type: 'boolean',
            description: 'Run browser in headless mode',
            default: true,
            optional: true
        }
    ];

    constructor() {
        this.browser = null;
        this.context = null;
        this.page = null;
    }

    async init(nodeData) {
        const message = nodeData.inputs?.message;
        const timeout = nodeData.inputs?.timeout || 30;
        const headless = nodeData.inputs?.headless !== false;

        if (!message) {
            throw new Error('Message is required');
        }

        try {
            const response = await this.sendMessageToChatGPT(message, timeout * 1000, headless);
            return {
                response: response,
                timestamp: new Date().toISOString(),
                status: 'success'
            };
        } catch (error) {
            throw new Error(`ChatGPT TMX interaction failed: ${error.message}`);
        }
    }

    async sendMessageToChatGPT(message, timeout, headless) {
        let browser = null;
        let context = null;
        let page = null;

        try {
            // Connect to existing Chromium via CDP if CHROME_CDP_URL is set
            if (process.env.CHROME_CDP_URL) {
                console.log('Connecting to existing Chromium via CDP:', process.env.CHROME_CDP_URL);
                browser = await chromium.connectOverCDP(process.env.CHROME_CDP_URL);
                // Use the first context (default context)
                context = browser.contexts()[0];
            } else {
                // Launch browser
                browser = await chromium.launch({ 
                    headless: headless,
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-accelerated-2d-canvas',
                        '--no-first-run',
                        '--no-zygote',
                        '--disable-gpu'
                    ]
                });

                // Create context with realistic user agent and custom user data dir for Google login
                context = await browser.newContext({
                    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    viewport: { width: 1280, height: 720 },
                    storageState: undefined,
                    // Use persistent context to reuse Google login session
                });
            }

            page = await context.newPage();

            // Set timeout
            page.setDefaultTimeout(timeout);

            // Step 1: Navigate to ChatGPT main page for manual login
            const chatgptMainUrl = 'https://chatgpt.com/';
            const tmxUrl = 'https://chatgpt.com/g/g-p-6833ee4454248191b3d0277129630c33-tmx/project';
            console.log('Navigating to ChatGPT main page for manual login...');
            await page.goto(chatgptMainUrl, {
                waitUntil: 'networkidle',
                timeout: 60000
            });

            // Wait for user to log in manually (wait for chat input or "New chat" button)
            let loggedIn = false;
            for (let i = 0; i < 30; i++) { // up to 60 seconds
                const chatInputVisible = await page.locator('#prompt-textarea').first().isVisible({ timeout: 1000 }).catch(() => false);
                const newChatButtonVisible = await page.locator('button:has-text("New chat")').first().isVisible({ timeout: 1000 }).catch(() => false);
                if (chatInputVisible || newChatButtonVisible) {
                    loggedIn = true;
                    break;
                }
                await page.waitForTimeout(2000);
            }
            if (!loggedIn) {
                throw new Error('Manual login to ChatGPT was not detected. Please log in and try again.');
            }
            console.log('Manual login detected. Navigating to TMX project...');

            // Step 2: Navigate to ChatGPT TMX project
            await page.goto(tmxUrl, {
                waitUntil: 'domcontentloaded',
                timeout: 60000
            });
            console.log('Navigated to TMX project, current URL:', page.url());

            // Wait for page to load and check if login is required
            await page.waitForLoadState('domcontentloaded', { timeout: 60000 });

            // Wait for the correct URL to be loaded
            for (let i = 0; i < 10; i++) {
                const currentUrl = page.url();
                console.log('Current URL:', currentUrl);
                if (currentUrl.startsWith(tmxUrl)) break;
                await page.waitForTimeout(2000);
            }

            // Wait for user to solve any Cloudflare or security challenge
            let chatInputReady = false;
            console.log('If you see a security or Cloudflare challenge in the browser, please solve it manually. Waiting for chat input to appear...');
            for (let i = 0; i < 60; i++) { // up to 2 minutes
                const chatInputVisible = await page.locator('#prompt-textarea').first().isVisible({ timeout: 1000 }).catch(() => false);
                if (chatInputVisible) {
                    chatInputReady = true;
                    break;
                }
                await page.waitForTimeout(2000);
            }
            if (!chatInputReady) {
                throw new Error('Chat input did not appear. Please ensure you have solved any security challenge and the page is fully loaded.');
            }
            const loginButton = await page.locator('button:has-text("Log in")').first();
            if (await loginButton.isVisible({ timeout: 5000 }).catch(() => false)) {
                // Attempt automated login
                console.log('Login required. Attempting automated login...');
                await loginButton.click();

                // Wait for email input
                const emailInput = await page.locator('input[type="email"]').first();
                await emailInput.waitFor({ timeout: 10000 });
                await emailInput.fill(process.env.CHATGPT_EMAIL || '');
                await page.locator('button[type="submit"],button:has-text("Continue")').first().click();

                // Wait for password input
                const passwordInput = await page.locator('input[type="password"]').first();
                await passwordInput.waitFor({ timeout: 10000 });
                await passwordInput.fill(process.env.CHATGPT_PASSWORD || '');
                await page.locator('button[type="submit"],button:has-text("Continue")').first().click();

                // Wait for navigation to chat interface
                await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 20000 }).catch(() => {});
                // Optionally, wait for chat input to appear
                await page.waitForSelector('#prompt-textarea', { timeout: 20000 }).catch(() => {});

                // Check if login was successful
                if (await page.locator('button:has-text("Log in")').first().isVisible({ timeout: 5000 }).catch(() => false)) {
                    throw new Error('Automated login failed. Please check your credentials or login manually.');
                }
            }

            // Wait for chat interface to be ready
            console.log('Waiting for chat interface...');
            
            // Try multiple selectors for the chat input
            const chatInputSelectors = [
                'textarea[placeholder*="Message"]',
                'textarea[data-id="root"]',
                '#prompt-textarea',
                'textarea[placeholder*="Send a message"]',
                'div[contenteditable="true"]',
                'textarea'
            ];

            let chatInput = null;
            for (const selector of chatInputSelectors) {
                try {
                    chatInput = page.locator(selector).first();
                    if (await chatInput.isVisible({ timeout: 3000 })) {
                        console.log(`Found chat input with selector: ${selector}`);
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }

            if (!chatInput || !await chatInput.isVisible({ timeout: 5000 }).catch(() => false)) {
                throw new Error('Could not find chat input field. Make sure you are logged in and the page is loaded.');
            }

            // Clear any existing text and send message
            console.log('Sending message...');
            await chatInput.click();
            await chatInput.fill('');
            await chatInput.fill(message);

            // Add delay before sending the message
            await page.waitForTimeout(5000); // 5 seconds

            // Send the message (try Enter key first, then look for send button)
            await chatInput.press('Enter');

            // Wait for response - look for various response indicators
            console.log('Waiting for AI response...');
            
            // Wait a moment for the message to be sent
            await page.waitForTimeout(2000);

            // Try to find the response using multiple strategies
            const responseSelectors = [
                '[data-message-author-role="assistant"]',
                '.markdown',
                '[role="presentation"] p',
                '.prose',
                'div[data-testid*="conversation-turn"]'
            ];

            let responseElement = null;
            let responseText = '';

            // Wait for response to appear
            for (let attempt = 0; attempt < 10; attempt++) {
                for (const selector of responseSelectors) {
                    try {
                        const elements = page.locator(selector);
                        const count = await elements.count();
                        
                        if (count > 0) {
                            // Get the last response (most recent)
                            responseElement = elements.last();
                            responseText = await responseElement.textContent();
                            
                            if (responseText && responseText.trim().length > 0) {
                                console.log(`Found response with selector: ${selector}`);
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
                
                // Wait before next attempt
                await page.waitForTimeout(2000);
            }

            if (!responseText || responseText.trim().length === 0) {
                // Fallback: get all text content from the page and try to extract response
                const pageContent = await page.textContent('body');
                
                // Look for patterns that might indicate a response
                const lines = pageContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
                
                // Try to find the response after our message
                const messageIndex = lines.findIndex(line => line.includes(message));
                if (messageIndex >= 0 && messageIndex < lines.length - 1) {
                    // Look for substantial text after our message
                    for (let i = messageIndex + 1; i < lines.length; i++) {
                        if (lines[i].length > 20 && !lines[i].includes('Send message') && !lines[i].includes('ChatGPT')) {
                            responseText = lines[i];
                            break;
                        }
                    }
                }
                
                if (!responseText) {
                    throw new Error('Could not extract AI response from the page. The response might be taking longer than expected.');
                }
            }

            console.log('Response received successfully');
            return responseText.trim();

        } catch (error) {
            console.error('Error in ChatGPT interaction:', error);
            throw error;
        } finally {
            // Cleanup
            try {
                if (page) await page.close();
                if (context) await context.close();
                if (browser) await browser.close();
            } catch (cleanupError) {
                console.error('Error during cleanup:', cleanupError);
            }
        }
    }
}

module.exports = { nodeClass: ChatGptTmxNode };

const { INode, INodeData, INodeParams } = require('flowise-components');
const { chromium } = require('patchright');

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

    async sendMessageToChatGPT(message, timeout, headless, tmxProjectUrl) {
        let context = null;
        let page = null;

        try {
            // Always use the saved Patchright profile for stealth and login persistence
            const profileDir = './patchright-profile';
            context = await chromium.launchPersistentContext(profileDir, {
                headless: headless,
                channel: "chrome",
                viewport: { width: 1280, height: 720 },
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu',
                    '--start-maximized'
                ]
                // Do NOT set userAgent or executablePath for best stealth
            });

            page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();
            page.setDefaultTimeout(timeout);

            // Go directly to the TMX project URL
            const tmxUrl = tmxProjectUrl || process.env.TMX_PROJECT_URL || 'https://chatgpt.com/g/g-p-68660da68b2c8191af885bf728d0ef81-tmx-dl/project';
            console.log('Navigating directly to TMX project:', tmxUrl);
            await page.goto(tmxUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
            // Wait extra time for dynamic content to load
            await page.waitForTimeout(5000);

            // Wait for chat input to be ready
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
                // Check for login prompt or security challenge
                const loginButton = await page.locator('button:has-text("Log in")').first();
                const loginVisible = await loginButton.isVisible({ timeout: 3000 }).catch(() => false);

                if (loginVisible) {
                    console.warn('Login required. Please log in manually in the opened browser window.');
                    const readline = require('readline');
                    const rl = readline.createInterface({
                        input: process.stdin,
                        output: process.stdout
                    });
                    await new Promise(resolve => rl.question('Press Enter after you have logged in to ChatGPT...', () => {
                        rl.close();
                        resolve();
                    }));
                    // Retry finding the chat input after manual login
                    for (const selector of chatInputSelectors) {
                        try {
                            chatInput = page.locator(selector).first();
                            if (await chatInput.isVisible({ timeout: 3000 })) {
                                console.log(`Found chat input with selector: ${selector} after manual login`);
                                break;
                            }
                        } catch (e) {
                            continue;
                        }
                    }
                } else {
                    // Prompt user to solve any security challenge
                    console.warn('Chat input not found. If there is a security or Cloudflare challenge, please solve it manually.');
                    const readline = require('readline');
                    const rl = readline.createInterface({
                        input: process.stdin,
                        output: process.stdout
                    });
                    await new Promise(resolve => rl.question('Press Enter after you have solved any challenge and the chat input is visible...', () => {
                        rl.close();
                        resolve();
                    }));
                    // Retry finding the chat input after challenge
                    for (const selector of chatInputSelectors) {
                        try {
                            chatInput = page.locator(selector).first();
                            if (await chatInput.isVisible({ timeout: 3000 })) {
                                console.log(`Found chat input with selector: ${selector} after challenge`);
                                break;
                            }
                        } catch (e) {
                            continue;
                        }
                    }
                }

                if (!chatInput || !await chatInput.isVisible({ timeout: 5000 }).catch(() => false)) {
                    throw new Error('Could not find chat input field after manual intervention. Make sure you are logged in and the page is loaded.');
                }
            }

            // Clear any existing text and send message
            console.log('Sending message...');
            await chatInput.click();
            await chatInput.fill('');
            await chatInput.fill(message);

            // Add delay before sending the message
            await page.waitForTimeout(2000);

            // Send the message (try Enter key first)
            await chatInput.press('Enter');

            // Wait for the "Good response" button to appear, indicating the answer is complete
            console.log('Waiting for AI to finish responding (waiting for good response button)...');
            const goodResponseButton = page.locator('button[data-testid="good-response-turn-action-button"]');
            let goodResponseVisible = false;
            let waitAttempts = 0;
            // Wait up to 2 minutes (120 attempts x 1s)
            while (!goodResponseVisible && waitAttempts < 120) {
                await page.waitForTimeout(1000);
                goodResponseVisible = await goodResponseButton.isVisible().catch(() => false);
                waitAttempts++;
            }
            if (!goodResponseVisible) {
                console.warn('Timed out waiting for AI to finish responding (good response button not found). Extracting whatever is available.');
            }

            // Extract the full answer from the outermost assistant message div
            const assistantDivs = page.locator('div[data-message-author-role="assistant"]');
            const count = await assistantDivs.count();
            let responseText = '';
            if (count > 0) {
                // Get the last assistant message (most recent)
                const lastAssistantDiv = assistantDivs.nth(count - 1);
                responseText = await lastAssistantDiv.textContent();
            }
            if (!responseText || responseText.trim().length === 0) {
                throw new Error('Could not extract AI response from the assistant message div. The response might be taking longer than expected.');
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
            } catch (cleanupError) {
                console.error('Error during cleanup:', cleanupError);
            }
        }
    }
}

module.exports = { nodeClass: ChatGptTmxNode };

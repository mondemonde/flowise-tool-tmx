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

            // Create context with realistic user agent
            context = await browser.newContext({
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                viewport: { width: 1280, height: 720 }
            });

            page = await context.newPage();

            // Set timeout
            page.setDefaultTimeout(timeout);

            // Navigate to ChatGPT TMX project
            console.log('Navigating to ChatGPT TMX project...');
            await page.goto('https://chatgpt.com/g/g-p-6833ee4454248191b3d0277129630c33-tmx/project', {
                waitUntil: 'networkidle'
            });

            // Wait for page to load and check if login is required
            await page.waitForLoadState('domcontentloaded');
            
            // Check if we need to login
            const loginButton = await page.locator('button:has-text("Log in")').first();
            if (await loginButton.isVisible({ timeout: 5000 }).catch(() => false)) {
                throw new Error('Authentication required. Please log in to ChatGPT first in your browser.');
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

/**
 * Test runner for src/ChatGptTmxNode.js using Patchright.
 * This script will instantiate the node and send a sample message.
 */

const { nodeClass: ChatGptTmxNode } = require('../src/ChatGptTmxNode.js');

(async () => {
    const node = new ChatGptTmxNode();
    try {
        const result = await node.init({
            inputs: {
                message: 'Give the status of the project and dont give suggestion what to do next.',
                timeout: 60,
                headless: false
            }
        });
        console.log('Node result:', result);
    } catch (err) {
        console.error('Error running ChatGptTmxNode:', err);
    }
})();

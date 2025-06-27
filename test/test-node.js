const { nodeClass: ChatGptTmxNode } = require('../src/ChatGptTmxNode');

async function testChatGptTmxNode() {
    console.log('Testing ChatGPT TMX Node...');
    
    const node = new ChatGptTmxNode();
    
    // Test data
    const testData = {
        inputs: {
            message: 'Hello, can you help me with a simple test?',
            timeout: 30,
            headless: false // Set to false for debugging
        }
    };
    
    try {
        console.log('Sending test message:', testData.inputs.message);
        const result = await node.init(testData);
        
        console.log('Success! Response received:');
        console.log('Response:', result.response);
        console.log('Timestamp:', result.timestamp);
        console.log('Status:', result.status);
        
    } catch (error) {
        console.error('Test failed:', error.message);
        console.error('Full error:', error);
    }
}

// Run the test
if (require.main === module) {
    testChatGptTmxNode();
}

module.exports = { testChatGptTmxNode };

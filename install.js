const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 ChatGPT TMX Flowise Node Installation Script');
console.log('================================================');

async function installNode() {
    try {
        // Check if we're in the right directory
        if (!fs.existsSync('package.json')) {
            throw new Error('package.json not found. Please run this script from the project root directory.');
        }

        console.log('📦 Installing npm dependencies...');
        execSync('npm install', { stdio: 'inherit' });

        console.log('🎭 Installing Playwright browsers...');
        execSync('npx playwright install chromium', { stdio: 'inherit' });

        console.log('✅ Installation completed successfully!');
        console.log('');
        console.log('Next steps:');
        console.log('1. Test the node: node test/test-node.js');
        console.log('2. Copy src/ folder to your Flowise custom nodes directory');
        console.log('3. Restart Flowise to load the new node');
        console.log('');
        console.log('For detailed instructions, see README.md');

    } catch (error) {
        console.error('❌ Installation failed:', error.message);
        process.exit(1);
    }
}

// Run installation
installNode();



# OVERVIEW

        ┌─┐                                                                                                                          
        ║"│                                                                                                                          
        └┬┘                                                                                                                          
        ┌┼┐             ┌───────────────────────────┐          ┌─────────────────────────┐             ┌────────────────┐            
         │              │Relay Project              │          │Azure Service Bus        │             │Listener Project│            
        ┌┴┐             │(mcp-nest-servicebus-relay)│          │(Request/Response Queues)│             │(mcp-server)    │            
      Client            └─────────────┬─────────────┘          └────────────┬────────────┘             └────────┬───────┘            
         │  POST /relay { prompt }    │                                     │                                   │                    
         │───────────────────────────>│                                     │                                   │                    
         │                            │                                     │                                   │                    
         │                            │   Send message to Request Queue     │                                   │                    
         │                            │   (correlationId, prompt)           │                                   │                    
         │                            │────────────────────────────────────>│                                   │                    
         │                            │                                     │                                   │                    
         │                            │                                     │Deliver message from Request Queue │                    
         │                            │                                     │──────────────────────────────────>│                    
         │                            │                                     │                                   │                    
         │                            │                                     │                                   │────┐               
         │                            │                                     │                                   │    │ Process prompt
         │                            │                                     │                                   │<───┘               
         │                            │                                     │                                   │                    
         │                            │                                     │ Send response to Response Queue   │                    
         │                            │                                     │ (correlationId, response)         │                    
         │                            │                                     │<──────────────────────────────────│                    
         │                            │                                     │                                   │                    
         │                            │Deliver response from Response Queue │                                   │                    
         │                            │<────────────────────────────────────│                                   │                    
         │                            │                                     │                                   │                    
         │      Return response       │                                     │                                   │                    
         │<───────────────────────────│                                     │                                   │                    
      Client            ┌─────────────┴─────────────┐          ┌────────────┴────────────┐             ┌────────┴───────┐            
        ┌─┐             │Relay Project              │          │Azure Service Bus        │             │Listener Project│            
        ║"│             │(mcp-nest-servicebus-relay)│          │(Request/Response Queues)│             │(mcp-server)    │            
        └┬┘             └───────────────────────────┘          └─────────────────────────┘             └────────────────┘            
        ┌┼┐                                                                                                                          
         │                                                                                                                           
        ┌┴┐                                                                                                                          


# TESTING ALL

You are now ready for a test run:

1. Start both projects in separate terminals:

   - `cd mcp-nest-servicebus-relay && npm run start`
   - `cd mcp-server && npm run start`

2. Send a POST request to `http://localhost:3000/relay` (the relay project) with a JSON body like `{ "prompt": "your test prompt" }`.

3. The relay project will forward the prompt to Azure Service Bus, the listener (mcp-server) will process it and send a response, and the relay will return the response to the client.


# PROJECT MCP-SEVER 


# ChatGPT TMX Flowise Node

A custom Flowise node that enables headless browser automation to interact with your ChatGPT TMX project. Send messages and receive AI responses directly within your Flowise workflows.

graph TD
    A[Flowise Node Input] --> B[Headless Browser Launch]
    B --> C[Navigate to ChatGPT TMX URL]
    C --> D[Handle Authentication/Login]
    D --> E[Send Input Message]
    E --> F[Wait for AI Response]
    F --> G[Extract Response Text]
    G --> H[Return JSON Response]
    H --> I[Flowise Node Output]


## Features

- 🤖 **Headless Browser Automation**: Uses Playwright to interact with ChatGPT TMX
- 🔄 **Seamless Integration**: Works as a custom Flowise node
- ⚡ **Configurable Timeouts**: Set custom response wait times
- 🎯 **Robust Response Detection**: Multiple fallback strategies for capturing AI responses
- 🛡️ **Error Handling**: Comprehensive error handling and cleanup
- 🔧 **Debug Mode**: Option to run in non-headless mode for debugging

## Prerequisites

- Node.js (v16 or higher)
- Flowise installation
- Active ChatGPT account with access to your TMX project

## Installation

1. **Clone or download this repository**
   ```bash
   git clone <repository-url>
   cd flowise-tool-tmx
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Playwright browsers**
   ```bash
   npm run install-playwright
   ```

## Usage

### As a Flowise Custom Node

1. **Copy the node to your Flowise custom nodes directory**
   ```bash
   # Copy the entire src folder to your Flowise custom nodes directory
   cp -r src/ /path/to/flowise/packages/components/nodes/tools/ChatGptTmx/
   ```

2. **Restart Flowise** to load the new node

3. **Use in Flowise workflows**:
   - Find "ChatGPT TMX" in the Custom Tools category
   - Configure the input parameters:
     - **Message**: The text to send to ChatGPT TMX
     - **Timeout**: Maximum wait time in seconds (default: 30)
     - **Headless Mode**: Run browser in background (default: true)

### Standalone Testing

#### Recommended: Use Persistent Chrome Session with Remote Debugging

1. **Launch Chrome with remote debugging enabled**  
   In one terminal, run:
   ```bash
   npm run launch-chrome-cdp
   ```
   This will open a new Chrome window using a dedicated profile. Log in to ChatGPT in this window and keep it open.

2. **Run the test script in a separate terminal**  
   In another terminal, run:
   ```bash
   npm run test-cdp
   ```
   This will connect Playwright to the running Chrome instance and automate the ChatGPT TMX workflow using your logged-in session.

#### (Legacy) Direct Test Script

You can still run the test script directly (not recommended for persistent login):
```bash
node test/test-node.js
```

## Configuration

### Input Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| Message | string | Yes | - | The message to send to ChatGPT TMX |
| Timeout | number | No | 30 | Maximum time to wait for response (seconds) |
| Headless Mode | boolean | No | true | Run browser in headless mode |

### Output Format

The node returns a JSON object with:

```json
{
  "response": "AI response text from ChatGPT TMX",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "status": "success"
}
```

## Authentication

**Important**: This tool requires you to be logged into ChatGPT in your default browser. The node will detect if authentication is required and provide an appropriate error message.

### Authentication Setup

1. Open your browser and log into ChatGPT
2. Navigate to your TMX project to ensure access
3. The node will use your existing session cookies

## Troubleshooting

### Common Issues

1. **"Authentication required" error**
   - Solution: Log into ChatGPT in your browser first

2. **"Could not find chat input field" error**
   - Solution: Ensure the TMX project URL is accessible and the page loads correctly
   - Try running with `headless: false` to debug visually

3. **Timeout errors**
   - Solution: Increase the timeout value for slower responses
   - Check your internet connection

4. **Response extraction failures**
   - Solution: The node has multiple fallback strategies, but ChatGPT's UI may have changed
   - Run in non-headless mode to inspect the page structure

### Debug Mode

For troubleshooting, set `headless: false` to see the browser in action:

```javascript
const testData = {
    inputs: {
        message: 'Your test message',
        headless: false  // This will show the browser window
    }
};
```

## Technical Details

### Browser Configuration

1. chromium directory
   - C:\Users\RaymundGalvez.AzureAD\AppData\Local\ms-playwright
   - C:\Users\RaymundGalvez.AzureAD\AppData\Local\ms-playwright\chromium_headless_shell-1179
2. Make your google account stick with chromuim using...
   -set CHROME_CDP_URL=http://localhost:9222 && node test/test-node.js  
   -start chrome --remote-debugging-port=9222 --user-data-dir="C:\chrome-profile-playwright"



The node uses Chromium with optimized settings:
- Realistic user agent
- Disabled GPU acceleration for stability
- No sandbox mode for server environments
- 1280x720 viewport

### Response Detection Strategy

The node employs multiple strategies to detect AI responses:

1. **Primary selectors**: Standard ChatGPT response elements
2. **Fallback selectors**: Alternative DOM patterns
3. **Content analysis**: Text pattern matching as last resort

### Error Handling

- Automatic browser cleanup on success/failure
- Detailed error messages for debugging
- Graceful handling of network issues

## Development

### Project Structure

```
flowise-tool-tmx/
├── package.json              # Dependencies and scripts
├── README.md                 # This file
├── src/
│   ├── index.js             # Main export file
│   └── ChatGptTmxNode.js    # Core node implementation
└── test/
    └── test-node.js         # Test script
```




### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Run in debug mode (`headless: false`) to inspect behavior
3. Check browser console logs for additional error details

## Changelog

### v1.0.0
- Initial release
- Basic ChatGPT TMX interaction
- Playwright-based browser automation
- Flowise node integration
- Comprehensive error handling

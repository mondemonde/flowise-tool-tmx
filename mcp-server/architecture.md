# MCP Server Architecture (with chatgpt-tmx-config.json)

```
+-----------------------------+
|      chatgpt-tmx-config.json|
|  (local config for testing) |
+-------------+---------------+
              |
              v
+-----------------------------+
|   test/test-node.js         |
|  (loads config, sets        |
|   process.env variables)    |
+-------------+---------------+
              |
              v
+-----------------------------+
|     MCP Server (NestJS)     |
|  (reads process.env for     |
|   config on startup)        |
+-------------+---------------+
              |
              v
+-----------------------------+
| PlaywrightService (Singleton)|
|  - On startup:              |
|    * Reads env vars         |
|    * Launches static        |
|      Chromium instance      |
|    * Keeps browser alive    |
+-------------+---------------+
              |
              v
+-----------------------------+
|  Static Chromium Instance   |
|  (headless or visible,      |
|   depending on config)      |
+-------------+---------------+
              |
              v
+-----------------------------+
|   ChatGPT TMX Web App       |
| (Automated browser actions) |
+-----------------------------+

API Flow:
1. Client sends POST /mcp/send-chatgpt-tmx-message to MCP Server
2. MCP Server uses PlaywrightService to:
   - Use static Chromium instance
   - Automate login, navigation, and message sending to ChatGPT TMX
   - Collect AI response
3. MCP Server returns response to client

Config Flow:
- chatgpt-tmx-config.json → test/test-node.js → process.env → MCP Server/PlaywrightService

Legend:
- All browser automation is performed by the static Chromium instance, which is configured and controlled by environment variables loaded from chatgpt-tmx-config.json (for local/test runs).
```

# MCP Server (NestJS + Playwright)

A microservice for automating ChatGPT TMX project interactions via REST API, built with [NestJS](https://nestjs.com/) and [Playwright](https://playwright.dev/). Designed for cloud-native, microservice-based architectures (Aspire, Azure Service Bus, API Management, Terraform).

---

## Features

- **REST API**: Exposes `/mcp/send-chatgpt-tmx-message` for sending messages to a ChatGPT TMX project and retrieving AI responses.
- **Playwright Automation**: Headless browser automation for robust ChatGPT web interaction.
- **Environment Variable Support**: Secure config via `.env`.
- **Dockerized**: Production-ready Dockerfile with all Playwright dependencies.
- **Extensible**: Modular codebase for future Azure Service Bus, API Management, and Terraform integration.

---

## Prerequisites

- Node.js 18+ and npm
- (Optional) Docker
- (Optional) Chrome DevTools Protocol endpoint for remote browser automation

---

## Setup

1. **Clone and configure environment:**
   ```sh
   cp .env.example .env
   # Edit .env as needed
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Install Playwright browsers:**
   ```sh
   npx playwright install --with-deps
   ```

---

## Running the Server

- **Development:**
  ```sh
  npm run start
  ```

- **Production:**
  ```sh
  npm run build
  npm run start:prod
  ```

- **Docker:**
  ```sh
  docker build -t mcp-server .
  docker run -p 3000:3000 --env-file .env mcp-server
  ```

---

## API Usage

### Endpoint

`POST /mcp/send-chatgpt-tmx-message`

### Request Body

```json
{
  "message": "Hello, ChatGPT!",
  "timeout": 30,
  "headless": true
}
```

- `message` (string, required): The message to send to ChatGPT TMX.
- `timeout` (number, optional): Max seconds to wait for a response (default: 30).
- `headless` (boolean, optional): Run browser in headless mode (default: true).

### Response

```json
{
  "content": [
    {
      "type": "text",
      "text": "AI response here"
    }
  ]
}
```

On error:

```json
{
  "content": [
    {
      "type": "text",
      "text": "Error: <error message>"
    }
  ],
  "isError": true
}
```

---

## Environment Variables

See `.env.example` for all options:

- `CHATGPT_EMAIL` (optional): Reserved for future login automation.
- `CHATGPT_PASSWORD` (optional): Reserved for future login automation.
- `CHROME_CDP_URL` (optional): Use a remote Chrome instance via DevTools Protocol.

---

## Extensibility

- **Azure Service Bus**: Ready for event-driven microservice integration.
- **Azure API Management**: REST endpoints are compatible with API gateway exposure.
- **Terraform**: Infrastructure as code ready; document ports and env vars for IaC.

---

## Project Structure

```
src/
  mcp/
    mcp.module.ts
    mcp.controller.ts
    mcp.service.ts
    playwright.service.ts
    dto/
      send-chatgpt-tmx-message.dto.ts
  app.module.ts
  main.ts
.env.example
Dockerfile
```

---

## License

MIT

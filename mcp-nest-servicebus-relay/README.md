# MCP NestJS Service Bus Relay Server

This project is a NestJS-based MCP server designed to relay requests and responses between Flowise and backend services via Azure Service Bus. It acts as a bridge, forwarding prompt/query requests from Flowise to a Service Bus queue and waiting for a response from another backend service listening on the response queue.

## Features

- **POST /relay** endpoint: Accepts a prompt/query and relays it via Azure Service Bus.
- Waits for a response with the same correlation ID and returns it to the client.
- Designed for integration with Flowise and Azure Service Bus-based microservice architectures.

## Environment Variables

Copy `.env.example` to `.env` and fill in your Azure Service Bus details:

```
AZURE_SERVICEBUS_CONNECTION_STRING=Endpoint=sb://<your-servicebus-namespace>.servicebus.windows.net/;SharedAccessKeyName=<key-name>;SharedAccessKey=<key>
AZURE_SERVICEBUS_REQUEST_QUEUE=<request-queue-name>
AZURE_SERVICEBUS_RESPONSE_QUEUE=<response-queue-name>
```

## Usage

1. **Install dependencies:**
   ```
   npm install
   ```

2. **Configure environment:**
   - Copy `.env.example` to `.env` and update with your Service Bus details.

3. **Run the server:**
   ```
   npm run start
   ```

4. **Relay a prompt:**
   - Send a POST request to `http://localhost:3000/relay` with JSON body:
     ```json
     { "prompt": "your query or prompt here" }
     ```
   - The server will relay the prompt to the request queue and wait for a response on the response queue.

## How it works

- The server sends the prompt to the request queue with a unique correlation ID.
- Another backend service (listener) processes the message and sends a response to the response queue, using the same correlation ID.
- The server waits for the response and returns it to the original HTTP client.

## Notes

- Ensure your backend listener service is configured to read from the request queue and write responses to the response queue with the correct correlation ID.
- Timeout for waiting for a response is 60 seconds (configurable in code).

## License

MIT

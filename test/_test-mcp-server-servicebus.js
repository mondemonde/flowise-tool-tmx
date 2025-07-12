const { ServiceBusClient } = require("@azure/service-bus");
require("dotenv").config({ path: "mcp-server/.env" });

async function purgeQueue(sbClient, queueName) {
  const receiver = sbClient.createReceiver(queueName, { receiveMode: "receiveAndDelete" });
  let messagesReceived = 0;
  while (true) {
    const messages = await receiver.receiveMessages(10, { maxWaitTimeInMs: 1000 });
    if (messages.length === 0) break;
    messagesReceived += messages.length;
  }
  await receiver.close();
  return messagesReceived;
}

async function main() {
  const connectionString = process.env.AZURE_SERVICEBUS_CONNECTION_STRING;
  if (!connectionString) {
    console.error("AZURE_SERVICEBUS_CONNECTION_STRING not set in .env");
    process.exit(1);
  }
  const requestQueue = process.env.AZURE_SERVICEBUS_REQUEST_QUEUE || "mcpqueue-request";
  const responseQueue = process.env.AZURE_SERVICEBUS_RESPONSE_QUEUE || "mcpqueue-response";
  // Debug: Log connection string and queue names (mask key for security)
  const maskedConnStr = connectionString.replace(/(SharedAccessKey=)[^;]+/, "$1****");
  console.log("Using connection string:", maskedConnStr);
  console.log("Using request queue:", requestQueue);
  console.log("Using response queue:", responseQueue);

  const sbClient = new ServiceBusClient(connectionString);

  try {
    // Purge only the response queue
    console.log(`Purging response queue: ${responseQueue}`);
    const purgedRes = await purgeQueue(sbClient, responseQueue);
    console.log(`Purged ${purgedRes} messages from response queue ${responseQueue}`);

    // Send a test message to the request queue
    const sender = sbClient.createSender(requestQueue);
    const testBody = "Test from test-mcp-server-servicebus.js";
    const message = { body: testBody };
    await sender.sendMessages(message);
    console.log("Test message sent to request queue.");

    // Optionally: receive from response queue to verify (if mcp-server echoes or processes)
    // For now, just verify send
    await sender.close();
  } catch (err) {
    console.error("Error during test:", err);
  } finally {
    await sbClient.close();
  }
}

main();

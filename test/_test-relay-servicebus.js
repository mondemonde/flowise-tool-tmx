const { ServiceBusClient } = require("@azure/service-bus");
require("dotenv").config({ path: "mcp-nest-servicebus-relay/.env" });

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
  const queueName = process.env.AZURE_SERVICEBUS_REQUEST_QUEUE || "mcpqueue";
  // Debug: Log connection string and queue name (mask key for security)
  const maskedConnStr = connectionString.replace(/(SharedAccessKey=)[^;]+/, "$1****");
  console.log("Using connection string:", maskedConnStr);
  console.log("Using queue name:", queueName);

  const sbClient = new ServiceBusClient(connectionString);

  try {
    // Purge the queue
    console.log(`Purging queue: ${queueName}`);
    const purged = await purgeQueue(sbClient, queueName);
    console.log(`Purged ${purged} messages from queue ${queueName}`);

    // Send a test message
    const sender = sbClient.createSender(queueName);
    const testBody = "Test from test-relay-servicebus.js";
    const message = { body: testBody };
    await sender.sendMessages(message);
    console.log("Test message sent.");

    // Receive the message to verify
    const receiver = sbClient.createReceiver(queueName, { receiveMode: "receiveAndDelete" });
    const received = await receiver.receiveMessages(1, { maxWaitTimeInMs: 5000 });
    if (received.length > 0 && received[0].body === testBody) {
      console.log("Test message received successfully from queue.");
    } else {
      console.error("Test message NOT received from queue.");
    }
    await receiver.close();
    await sender.close();
  } catch (err) {
    console.error("Error during test:", err);
  } finally {
    await sbClient.close();
  }
}

main();

const { ServiceBusClient } = require("@azure/service-bus");
require("dotenv").config({ path: "mcp-nest-servicebus-relay/.env" });

async function main() {
  const connectionString = process.env.AZURE_SERVICEBUS_CONNECTION_STRING;
  const queueName = process.env.AZURE_SERVICEBUS_REQUEST_QUEUE || "mcpqueue";
  const sbClient = new ServiceBusClient(connectionString);
  const sender = sbClient.createSender(queueName);

  try {
    const message = { body: "Test from Node.js CLI" };
    await sender.sendMessages(message);
    console.log("Message sent successfully!");
  } catch (err) {
    console.error("Error sending message:", err);
  } finally {
    await sender.close();
    await sbClient.close();
  }
}

main();

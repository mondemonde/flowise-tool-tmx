const axios = require('axios');

async function main() {
  const url = 'http://localhost:3000/relay';
  const data = {
    prompt: 'What is the name of the project?',
    correlationId: 'test-correlation-id-' + Date.now()
  };

  try {
    const response = await axios.post(url, data);
    console.log('Relay API response:', response.data);
  } catch (err) {
    console.error('Error calling relay API:', err.response ? err.response.data : err.message);
  }
}

main();

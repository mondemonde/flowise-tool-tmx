/*
* Flowise Custom Tool Script: MCP POST Action
* This script mimics the POST action of the relay MCP server project.
* Input variables: $message (string), $timeout (number, optional), $headless (boolean, optional)
* You can adjust the endpoint URL as needed.
*/

const fetch = require('node-fetch');

const url = $tmxProjectUrl; // Provided dynamically from the Flowise tool input

const payload = {};
for (const key in $input) {
    if (key !== 'tmxProjectUrl' && Object.prototype.hasOwnProperty.call($input, key)) {
        payload[key] = $input[key];
    }
}

const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
};

try {
    const response = await fetch(url, options);
    const text = await response.text();
    return text;
} catch (error) {
    console.error(error);
    return '';
}

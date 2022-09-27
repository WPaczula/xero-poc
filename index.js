const { XeroClient } = require('xero-node');
const express = require('express');
const path = require('path');

const port = process.env.PORT || 8080;

const xero = new XeroClient({
  clientId: '7B0DDDBFA1C04610AD6E4EC9AF452CA7',
  clientSecret: 'MCeAoRQuLdSP7GvsoxCAQmMUWewBg1sZJqRP6ERFkf1uYJeN',
  redirectUris: [`http://https://xero-poc.herokuapp.com/callback`],
  scopes: 'openid profile email accounting.transactions offline_access'.split(" "),
});

const app = express();

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'))
})

app.get('/callback', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/callback.html'))
})

app.listen(port);
console.log('Server started at http://localhost:' + port);
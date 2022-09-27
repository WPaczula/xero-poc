const { XeroClient } = require('xero-node');
const express = require('express');
const path = require('path');
const jwtDecode = require('jwt-decode');

const port = process.env.PORT || 8080;

const xero = new XeroClient({
  clientId: '7B0DDDBFA1C04610AD6E4EC9AF452CA7',
  clientSecret: 'MCeAoRQuLdSP7GvsoxCAQmMUWewBg1sZJqRP6ERFkf1uYJeN',
  redirectUris: [`https://xero-poc.herokuapp.com/callback`],
  scopes: 'openid profile email offline_access accounting.settings'.split(" "),
});

const app = express();

app.get('/', (req, res) => {
  res.redirect('https://login.xero.com/identity/connect/authorize?response_type=code&client_id=7B0DDDBFA1C04610AD6E4EC9AF452CA7&redirect_uri=https://xero-poc.herokuapp.com/callback&scope=offline_access openid profile email accounting.settings')
})

const getTenantId = async () => {
  await xero.updateTenants(false);
  const activeTenant = xero.tenants[0];

  return activeTenant.tenantId;
}

const getOrganisation = async (tenantId) => {
  const organisation = (await xero.accountingApi.getOrganisations(tenantId)).body.organisations[0];
  return organisation
}

app.get('/callback', async (req, res) => {
  const { id_token } = await xero.apiCallback(req.url);
  const { given_name, family_name, email } = jwtDecode(id_token);

  try {
    console.log('======================================')
    console.log('getting tenant')
    const tenantId = await getTenantId()
    console.log('tenantId:', tenantId)
    console.log('======================================')
    console.log('getting organisation')
    const organisation = await getOrganisation(tenantId);
    console.log('organisation: ', organisation)
    console.log('======================================')
    console.log('redirect')
    res.redirect(`https://yordex.webflow.io/book-a-demo?lastName=${encodeURIComponent(family_name)}&firstName=${encodeURIComponent(given_name)}&email=${encodeURIComponent(email)}&company=${encodeURIComponent(organisation.legalName)}`)
  } catch (error) {
    console.error(error)
    res.send('Error occurred! ☠')
    return
  }
})

app.listen(port);
console.log('Server started at http://localhost:' + port);
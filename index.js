const { XeroClient } = require('xero-node');
const express = require('express');
const path = require('path');
const jwtDecode = require('jwt-decode');

const port = process.env.PORT || 8080;

const xero = new XeroClient({
  clientId: '7B0DDDBFA1C04610AD6E4EC9AF452CA7',
  clientSecret: 'MCeAoRQuLdSP7GvsoxCAQmMUWewBg1sZJqRP6ERFkf1uYJeN',
  redirectUris: [`https://xero-poc.herokuapp.com/callback`],
  scopes: 'openid profile email accounting.transactions offline_access'.split(" "),
});

const app = express();

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'))
})

const getTenantId = async () => {
  await xero.updateTenants(false);
  const activeTenant = xero.tenants[0];

  return activeTenant;
}

const getOrganisation = async (tenantId) => {
  const organisation = (await xero.accountingApi.getOrganisations(tenantId)).body.organisations[0];
  return organisation
}

const getContactsCount = async (tenantId) => {
  const contactsCount = 0;
  let page = 1;
  let shouldContinue = true;

  while (shouldContinue) {
    const contactsPerPage = (await xero.accountingApi.getContacts(tenantId, undefined, undefined, undefined, undefined, page)).body.contacts;

    if (contactsPerPage && contactsPerPage.length) {
      page += 1;
      contactsCount += contactsPerPage.length
    } else {
      shouldContinue = false
    }
  }

  return contactsCount
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
    console.log('getting contact counts')
    const contactsCount = await getContactsCount(tenantId);
    console.log('count: ', contactsCount)
    res.send(`
      <html>
        <body>
          <div>
            first name: ${given_name}
          </div>
          <div>
            last name: ${family_name}
          </div>
          <div>
            email: ${email}
          </div>
          <div>
            company name: ${JSON.stringify(organisation || {})}
          </div>
          <div>
            number of employees: ${contactsCount}
          </div>
        </body>
      </html>
    `)
  } catch (error) {
    console.error(error)
    res.send('Error occurred! ☠')
    return
  }
})

app.listen(port);
console.log('Server started at http://localhost:' + port);
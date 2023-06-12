const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config({ path: "./config/.env" });
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
        'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
        'PLAID-SECRET': process.env.PLAID_SECRET,
        'PLAID-PRODUCTS': process.env.PLAID_PRODUCTS
    },
  },
});


const plaidClient = new PlaidApi(configuration);
const app = express();
app.use(cors());
app.use(bodyParser.json())


app.post('/hello', (request, response) => {
    response.json({message: "Hello " + request.body.name});
});

app.post('/create_link_token', async function (request, response) {
    const plaidRequest = {
        user: {
            client_user_id: 'user',
        },
        client_name: 'Plaid Test App',
        products: ['auth'],
        language: 'en',
        redirect_uri: 'http://localhost:3001',
        country_codes: ['US'],
    };
    try {
        const createTokenResponse = await plaidClient.linkTokenCreate(plaidRequest);
        response.json(createTokenResponse.data);
    } catch (error) {
        response.status(500).send("failure");
    }
});

app.post("/auth", async function(request, response) {
    try {
        const access_token = request.body.access_token;
        const plaidRequest = {
            access_token: access_token,
        };
        const plaidResponse = await plaidClient.authGet(plaidRequest);
        response.json(plaidResponse.data);
    } catch (e) {
        response.status(500).send("failed");
    }
 });

app.post('/exchange_public_token', async function (
    request,
    response,
    next,
) {
    const publicToken = request.body.public_token;
    try {
        const plaidResponse = await plaidClient.itemPublicTokenExchange({
            public_token: publicToken,
        });
        // These values should be saved to a persistent database and
        // associated with the currently signed-in user
        const accessToken = plaidResponse.data.access_token;
        response.json({ accessToken });
    } catch (error) {
        response.status(500).send("failed");
    }
});


transactions: async (request, response) => {
    try {
      const now = moment();
      const today = now.format("YYYY-MM-DD");
      const thirtyDaysAgo = now
        .subtract(30 * request.body.month, "days")
        .format("YYYY-MM-DD");
      let transactions = [];
      const items = request.body.account;
      const requests = items.map(async (item) => {
        let accessToken = item.accessToken;
        let institutionName = item.institutionName;
        const req = {
          access_token: accessToken,
          start_date: thirtyDaysAgo,
          end_date: today,
        };
        const res = await plaidClient.transactionsGet(req);
        transactions.push({
          accountName: institutionName,
          transactions: res.data.transactions,
          totalTransactions: res.data.total_transactions,
        });
      });
      // requests is an array of promises. Wait for all of them to complete:
      await Promise.all(requests);
      response.json(transactions);
      // transactions is now full.

      // items.forEach((item) => {
      //   let accessToken = item.accessToken;
      //   let institutionName = item.institutionName;
      //   const req = {
      //     access_token: accessToken,
      //     start_date: thirtyDaysAgo,
      //     end_date: today,
      //   };
      //   plaidClient.transactionsGet(req).then((res) => {
      //     transactions.push({
      //       accountName: institutionName,
      //       transactions: res.data.transactions,
      //     });
      //     if (transactions.length === items.length) {
      //       response.json(transactions);
      //     }
      //   });
      // });
    } catch (err) {
      response.status(500).json({ message: "Could not fetch transaction" });
    }
};



app.listen(3000, () => {
    console.log("Server is running, on 3000 you better catch it!");
});
  
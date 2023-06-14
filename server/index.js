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
        'PLAID-SECRET': process.env.PLAID_SECRET
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
        client_name: 'Spend Wise',
        products: ['auth', 'transactions'],
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
        console.log(error)
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

// get accounts 
// app.get('/accounts', async function (request, response, next) {
//     try {
//       const accountsResponse = await client.accountsGet({
//         access_token: accessToken,
//       });
//       prettyPrintResponse(accountsResponse);
//       response.json(accountsResponse.data);
//     } catch (error) {
//       prettyPrintResponse(error);
//       return response.json(formatError(error.response));
//     }
//   });

//get transactions
app.post('/transactions', async function (request, response) {
    const accessToken = request.body.access_token;
    try {
      const transactionsResponse = await plaidClient.transactionsGet({
        access_token: accessToken,
        start_date: '2022-01-01',
        end_date: '2023-06-30',
      });
  
      const transactions = transactionsResponse.data.transactions;
      response.json({ transactions });
    } catch (error) {
      console.log(error);
      response.status(500).send("failed");
    }
});


// // Pull real-time balance information for each account associated with the Item
// app.post('/balance', async function (request, response) {
//     const accessToken = request.body.access_token;
//     try {
//         const balanceResponse = await plaidClient.balanceGet({
//             access_token: accessToken
//         });
//     const balance = balanceResponse.data.balance;
//     response.json({ balance });
//     } catch (err) {
//     console.log(err)
//     response.status(500).json({ message: "Failed to get balance" });    
//     }
// });




app.listen(3000, () => {
    console.log("Server is running, on 3000 you better catch it!");
});
  
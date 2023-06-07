const { Configuration, PlaidApi, PlaidEnvironments } = require("plaid");
const Account = require("../models/Account");
const moment = require("moment");

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
      "PLAID-SECRET": process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);


module.exports = {
  
  handler = Plaid.create({
    clientName: "Plaid Quickstart",
    // Optional, specify an array of ISO-3166-1 alpha-2 country
    // codes to initialize Link; European countries will have GDPR
    // consent panel
    countryCodes: ["US"],
    env: "sandbox",
    // Replace with your public_key from the Dashboard
    key: "067daf1cd400ac6ef1e15d35f6edb5",
    product: ["transactions"],
    // Optional, use webhooks to get transaction and error updates
    webhook: "https://requestb.in",
    // Optional, specify a language to localize Link
    language: "en",
    // Optional, specify userLegalName and userEmailAddress to
    // enable all Auth features
    userLegalName: "John Appleseed",
    userEmailAddress: "jappleseed@yourapp.com",
    onLoad: function() {
      // Optional, called when Link loads
    },
    onSuccess: function(public_token, metadata) {
      // Send the public_token to your app server.
      // The metadata object contains info about the institution the
      // user selected and the account ID or IDs, if the
      // Select Account view is enabled.
      $.post("/plaid_token_exchange", {
        publicToken: public_token
      });
    },
    onExit: function(err, metadata) {
      // The user exited the Link flow.
      if (err != null) {
        // The user encountered a Plaid API error prior to exiting.
      }
      // metadata contains information about the institution
      // that the user selected and the most recent API request IDs.
      // Storing this information can be helpful for support.
    },
    onEvent: function(eventName, metadata) {
      // Optionally capture Link flow events, streamed through
      // this callback as your users connect an Item to Plaid.
      // For example:
      // eventName = "TRANSITION_VIEW"
      // metadata  = {
      //   link_session_id: "123-abc",
      //   mfa_type:        "questions",
      //   timestamp:       "2017-09-14T14:42:19.350Z",
      //   view_name:       "MFA",
      // }
    }
  });





  linkTokenCreateRequest: async (request, response) => {
    //   Get the client_user_id by searching for the current user);
    const clientUserId = request.body.id;
    console.log(clientUserId);
    const plaidRequest = {
      user: {
        client_user_id: clientUserId,
      },
      client_name: "SpendWise",
      products: ["transactions, auth, balance"],
      language: "en",
      redirect_uri: "/localhost:3000",
      country_codes: ["US"],
    };
    try {
      const createTokenResponse = await plaidClient.linkTokenCreate(
        plaidRequest
      );
      response.json(createTokenResponse.data);
    } catch (error) {
      console.error(error);
      response.status(500).send("failure");
    }
  },
  exchangePublicToken: async (request, response) => {
    const { public_token, id } = request.body;
    const { name, institution_id } = request.body.metadata.institution;
    try {
      const plaidResponse = await plaidClient.itemPublicTokenExchange({
        public_token: public_token,
      });
      // These values should be saved to a persistent database and
      // associated with the currently signed-in user
      const { access_token, item_id } = plaidResponse.data;
      let account = await Account.findOne({
        userId: id,
        institutionId: institution_id,
      });
      if (account) {
        console.log("Account already exists");
      } else {
        account = await Account.create({
          userId: id,
          accessToken: access_token,
          itemId: item_id,
          institutionId: institution_id,
          institutionName: name,
        });
      }
      response.json(account);
    } catch (error) {
      response.status(500).send("failed");
    }
  },
  deleteAccount: async (request, response) => {
    try {
      await Account.deleteOne({ _id: request.params.id });
      response.json({ message: "Successfully deleted" });
    } catch (err) {
      console.log(err);
      response.status(500).json({ message: err });
    }
  },
  getAccounts: async (request, response) => {
    try {
      const accounts = await Account.find({ userId: request.params.id });
      response.json(accounts);
    } catch (err) {
      response.status(500).json({ message: err });
    }
  },
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
  },
  balance: async (request, response) => {
    try {
      const items = request.body.account;
      let accounts = [];
      const requests = items.map(async (item) => {
        let { _id, accessToken, institutionName } = item;
        const req = {
          access_token: accessToken,
        };
        const res = await plaidClient.accountsBalanceGet(req);
        res.data.accounts.forEach((account) => {
          accounts.push({
            id: _id,
            bank: institutionName,
            accountName: account.name,
            balance: account.balances,
            type: account.type,
          });
        });
      });
      await Promise.all(requests);

      response.json(accounts);
    } catch (err) {
      response.status(500).json({ message: "Failed to get balance" });
    }
  },
};
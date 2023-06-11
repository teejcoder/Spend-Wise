const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const methodOverride = require("method-override")
const logger = require("morgan");
const cors = require("cors");
const connectDB = require("./config/database");
const mainRoutes = require("./routes/main");
// const apiRoutes = require("./routes/api");
require("dotenv").config({ path: "./config/.env" });
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid')

const PORT = 3000;

const app = express();

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);


app.post('/create_link_token', async function (request, response) {
  const plaidRequest = {
    user: {
      client_user_id: 'user',
    },
    client_name: 'Plaid Test App',
    products: ['auth'],
    language: 'en',
    redirect_uri: 'http://localhost:3000/',
    country_codes: ['US'],
  };
  try {
    const createTokenResponse = await plaidClient.linkTokenCreate(plaidRequest);
    response.json(createTokenResponse.data);
  } catch (error) {
    console.error(error)
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






app.use(cors());

// Passport config
require("./config/passport")(passport);

// Connect To Database
connectDB();

// Body Parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Logging
app.use(logger("dev"));

app.use(methodOverride("_method"));

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

//sessions
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use("/", mainRoutes);
// app.use("/api", apiRoutes);


app.listen(process.env.PORT, () => {
  console.log(`Server is running on ${PORT}, you better catch it!`);
});
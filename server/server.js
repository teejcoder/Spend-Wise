const express = require("express");
const app = express();
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const methodOverride = require("method-override");
const flash = require("express-flash");
const logger = require("morgan");
const moment = require("moment");
const plaid = require("plaid")
const connectDB = require("./config/database");
const mainRoutes = require("./routes/main");
const apiRoutes = require("./routes/api");
const path = require('path');

// Use .env file in config folder
require("dotenv").config({ path: "./config/.env" });

// Passport config
require("./config/passport")(passport);

// Connect To Database
connectDB();

// Body Parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Logging
app.use(logger("dev"));

// Use forms for put / delete
app.use(methodOverride("_method"));

// Setup Sessions - stored in MongoDB
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Use flash messages for errors, info, etc.
app.use(flash());

// Setup Routes for which the server is listening
app.use("/api", apiRoutes)
app.use("/main", mainRoutes);


// Serve the React app for any other routes
app.get('/', (req, res) => {
  res.render('')
});

// Server Running
app.set('view engine', 'react');
app.listen(process.env.PORT, () => {
  console.log("Server is running, you better catch it!");
});

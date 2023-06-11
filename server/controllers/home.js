const User = require("../models/User");

module.exports = {
    getIndex: (req, res) => {
      res.render("index.ejs");
    },

    getDashboard: async (req, res) => { 
      console.log(req.user)
      try {

        res.render("dashboard.ejs");
      } catch (err) {
        console.log(err);
      }
    },

  };
  
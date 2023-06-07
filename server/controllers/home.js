const User = require("../models/User");

module.exports = {
    getIndex: (req, res) => {
      res.render("index.ejs");
    },

    getDashboard: async (req, res) => { 
      console.log(req.user)
      try {
        //Since we have a session each request (req) contains the logged-in users info: req.user
        //console.log(req.user) to see everything
        //Grabbing just the posts of the logged-in user
        const posts = await User.find({ user: req.user.id });
        //Sending post data from mongodb and user data to ejs template
        res.render("dashboard.ejs", { posts: posts, user: req.user });
      } catch (err) {
        console.log(err);
      }
    },

  };
  
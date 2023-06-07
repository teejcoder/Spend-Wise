const router = require("express").Router();
const { ensureAuth } = require("../middleware/auth");
const authController = require("../controllers/auth");
const homeController = require("../controllers/home");

router.get("/", homeController.getIndex);
router.get("/dashboard", ensureAuth, homeController.getDashboard);

//Routes for user login/signup
router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);
router.get("/logout", authController.logout);
router.get("/signup", authController.getSignup);
router.post("/signup", authController.postSignup);

module.exports = router;
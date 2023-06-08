const router = require("express").Router();
const apiController = require("../controllers/api");

router.post("/api/create_link_token", apiController.createLink);
router.post("/api/set_access_token", apiController.setAccess);
router.post("/transactions", apiController.transactions);
router.delete("/account/:id", apiController.deleteAccount);
router.get("/accounts/:id", apiController.getAccounts);
router.post("/balance", apiController.balance);

module.exports = router;


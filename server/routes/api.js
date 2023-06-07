const router = require("express").Router();
const apiController = require("../controllers/api");

router.post("/link/token/create", apiController.linkTokenCreateRequest);
router.post("/item/public_token/exchange", apiController.exchangePublicToken);
router.post("/transactions", apiController.transactions);
router.delete("/account/:id", apiController.deleteAccount);
router.get("/accounts/:id", apiController.getAccounts);
router.post("/balance", apiController.balance);

module.exports = router;


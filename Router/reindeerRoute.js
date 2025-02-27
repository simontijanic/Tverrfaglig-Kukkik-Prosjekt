const router = require("express").Router();

const authUser = require("../Middleware/authUser");
const registrationController = require("../Controllers/registrationController");
const transactionController = require("../Controllers/transactionController");

router.get("/reindeer-registration", authUser.isAuthenticated, registrationController.getReinsdyrRegister);
router.post("/reindeer-registration", authUser.isAuthenticated, registrationController.postReinsdyrRegister);
router.post("/reindeer/delete/:id", authUser.isAuthenticated, registrationController.postDeleteReinsdyr);

router.get("/flokk/create", authUser.isAuthenticated, registrationController.getFlokkCreation);
router.post("/flokk/create", authUser.isAuthenticated, registrationController.postFlokkRegister);

router.get("/transactions", authUser.isAuthenticated, transactionController.getTransaksjoner);


module.exports = router
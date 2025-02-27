const router = require("express").Router();

const registrationController = require("../Controllers/registrationController");

router.get("/login", registrationController.getLogin);
router.get("/register", registrationController.getRegister);

router.post("/login", registrationController.postLogin);
router.post("/register", registrationController.postRegister);

router.post("/logout", registrationController.postLogout);


module.exports = router
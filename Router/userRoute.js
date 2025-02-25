const router = require("express").Router()

const userController = require("../Controllers/userController")
const registrationController = require("../Controllers/registrationController")

const authUser = require("../Middleware/authUser")

router.get("/", userController.getIndex)

router.get("/faq", userController.getFAQ)
router.get("/map", userController.getMap)
router.get("/database-info", userController.getDatabaseInfo)

router.get("/login", registrationController.getLogin)
router.get("/register", registrationController.getRegister)

router.post("/login", registrationController.postLogin)
router.post("/register", registrationController.postRegister)

router.post("/logout", registrationController.postLogout)

router.get("/reindeer-registration", authUser.isAuthenticated, registrationController.getReinsdyrRegister)
router.post("/reindeer-registration", authUser.isAuthenticated, registrationController.postReinsdyrRegister)

router.get("/flokk/create", authUser.isAuthenticated, registrationController.getFlokk)
router.post("/flokk/create", authUser.isAuthenticated, registrationController.postFlokkRegister)

router.get('/search', userController.getSearch);

router.get('/flokk/:id', userController.getFlokk);


module.exports = router
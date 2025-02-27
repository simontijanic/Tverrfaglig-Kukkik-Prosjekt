const router = require("express").Router();

const userController = require("../Controllers/userController");

router.get("/", userController.getIndex);

router.get("/faq", userController.getFAQ);
router.get("/map", userController.getMap);
router.get("/database-info", userController.getDatabaseInfo);
router.get("/search", userController.getSearch);
router.get("/flokk/:id", userController.getFlokk);

module.exports = router;
    
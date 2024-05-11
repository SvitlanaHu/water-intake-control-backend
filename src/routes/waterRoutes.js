const express = require("express");
const router = express.Router();
const waterController = require("../../controllers/waterController");

router.get("/waters", waterController.getWaters);
router.post("/waters", waterController.addWater);

module.exports = router;
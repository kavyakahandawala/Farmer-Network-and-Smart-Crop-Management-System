const express = require("express");
const router = express.Router();

//insert model
const Forum = require("../Model/QandAModel");

//insert controller
const QandAController = require("../Controllers/QandAController");

router.get("/",QandAController.getAllForum);
router.post("/",QandAController.addForum);
router.get("/:id",QandAController.getById);
router.put("/:id",QandAController.updateForum);
router.delete("/:id",QandAController.deleteForum);

//export
module.exports = router;
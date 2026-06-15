const express = require ("express");
const router = express.Router();
//insert model
const Market = require("../Model/MarketWMModel");
//insert controller
const MarketWMControl = require("../Controllers/MarketWMControl");
router.get("/",MarketWMControl.getAllMarketWM);
router.post("/",MarketWMControl.AddAllMarketWM);
router.get("/:id",MarketWMControl.getById);
router.put("/:id",MarketWMControl.updateMarketWM);
router.delete("/:id",MarketWMControl.deleteMarketWM);

//export
module.exports = router;
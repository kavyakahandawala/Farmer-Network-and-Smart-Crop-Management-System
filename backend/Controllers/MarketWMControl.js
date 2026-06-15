const MarketWMModel = require("../Model/MarketWMModel");

const getAllMarketWM = async (req, res, next) => {
  try {
    const markets = await MarketWMModel.find();
    if (!markets || markets.length === 0) {
      return res.status(404).json({ message: "No prices found" });
    }
    return res.status(200).json({ Market: markets });
  } catch (err) {
    console.error("Error fetching marketwmmodels:", err);
    return res.status(500).json({ error: err.message });
  }
};

const AddAllMarketWM = async (req, res, next) => {
  const { cropId, cropName, marketLocation, pricePerKg, priceDate, TrendIndicator } = req.body;
  console.log("POST payload:", req.body); // Debug incoming data
  try {
    const market = new MarketWMModel({
      cropId,
      cropName,
      marketLocation,
      pricePerKg,
      priceDate: priceDate ? new Date(priceDate) : undefined,
      TrendIndicator
    });
    const savedMarket = await market.save();
    console.log("Saved market:", savedMarket); // Debug saved data
    return res.status(201).json(savedMarket);
  } catch (err) {
    console.error("Error saving marketwmmodel:", err);
    return res.status(400).json({ error: err.message });
  }
};

const getById = async (req, res, next) => {
  const id = req.params.id;
  try {
    const market = await MarketWMModel.findById(id);
    if (!market) {
      return res.status(404).json({ message: "Price not found" });
    }
    return res.status(200).json(market);
  } catch (err) {
    console.error("Error fetching market by ID:", err);
    return res.status(500).json({ error: err.message });
  }
};

const updateMarketWM = async (req, res, next) => {
  const id = req.params.id;
  const { cropId, cropName, marketLocation, pricePerKg, priceDate, TrendIndicator } = req.body;
  try {
    const market = await MarketWMModel.findByIdAndUpdate(
      id,
      { cropId, cropName, marketLocation, pricePerKg, priceDate: priceDate ? new Date(priceDate) : undefined, TrendIndicator },
      { new: true, runValidators: true }
    );
    if (!market) {
      return res.status(404).json({ message: "Unable to update price details" });
    }
    return res.status(200).json(market);
  } catch (err) {
    console.error("Error updating marketwmmodel:", err);
    return res.status(400).json({ error: err.message });
  }
};

const deleteMarketWM = async (req, res, next) => {
  const id = req.params.id;
  try {
    const market = await MarketWMModel.findByIdAndDelete(id);
    if (!market) {
      return res.status(404).json({ message: "Unable to delete price details" });
    }
    return res.status(200).json({ message: "Price deleted" });
  } catch (err) {
    console.error("Error deleting marketwmmodel:", err);
    return res.status(500).json({ error: err.message });
  }
};

exports.getAllMarketWM = getAllMarketWM;
exports.AddAllMarketWM = AddAllMarketWM;
exports.getById = getById;
exports.updateMarketWM = updateMarketWM;
exports.deleteMarketWM = deleteMarketWM;
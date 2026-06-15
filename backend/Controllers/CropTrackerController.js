const Crop = require("../Model/CropTrackerModel");

//display crops - UPDATED FOR USER SPECIFIC
const getAllCrops = async (req, res, next) => {
    
    let crops;
    //Get all crops for logged-in user only
    try{
        const userId = req.user.id; // From verifyToken middleware
        crops = await Crop.find({ userId: userId });
    }catch (err){
        console.log(err);
    }
    //No crops?
    if(!crops){
        return res.status(404).json({message:"No crops found"});
    }
    //display all crops for the user
    return res.status(200).json({crops});
};

// data insert - UPDATED FOR USER SPECIFIC

const addCrops = async (req, res, next) => {

    const {cropLabel, cropName, plot, growthStage, healthStatus, plantingDate, harvestingDate, expectedYield} = req.body;

    let crops;

    try{
        const userId = req.user.id; // From verifyToken middleware
        crops = new Crop({
            cropLabel, 
            cropName, 
            plot, 
            growthStage, 
            healthStatus, 
            plantingDate, 
            harvestingDate, 
            expectedYield,
            userId // Add user ID to associate crop with user
        });
        await crops.save();
    }catch (err){
        console.log(err);
    }
    //not insert crops
    if(!crops){
        return res.status(404).send({message: "unable to add crops"});
    }
    return res.status(200).json({crops});
};

//Get by Id - UPDATED FOR USER SPECIFIC
const getById = async(req,res,next) => {
    const id = req.params.id;

    let crop;

    try{
        const userId = req.user.id; // From verifyToken middleware
        crop = await Crop.findOne({ _id: id, userId: userId }); // Only find if user owns it
    }catch(err){
        console.log(err);
    }

    //not available crops
    if(!crop){
        return res.status(404).send({message: "Crop not found"});
    }
    return res.status(200).json({crop});
}

//update Crop Details - UPDATED FOR USER SPECIFIC
const updateCrop = async (req, res, next) =>{
    const id = req.params.id;
    const {cropLabel, cropName, plot, growthStage, healthStatus, plantingDate, harvestingDate, expectedYield} = req.body;

    let crops;

    try{
        const userId = req.user.id; // From verifyToken middleware
        crops = await Crop.findOneAndUpdate(
            { _id: id, userId: userId }, // Only update if user owns it
            { 
                cropLabel: cropLabel, 
                cropName: cropName, 
                plot: plot, 
                growthStage: growthStage, 
                healthStatus: healthStatus, 
                plantingDate: plantingDate, 
                harvestingDate: harvestingDate, 
                expectedYield: expectedYield 
            },
            { new: true } // Return updated document
        );
    }catch(err){
        console.log(err);
    }
    if(!crops){
        return res.status(404).send({message: "Unable to update crop details or crop not found"});
    }
    return res.status(200).json({crops});
};

//Delete Crop Details - UPDATED FOR USER SPECIFIC
const deleteCrop = async (req, res, next) => {
    const id = req.params.id;

    let crop;

    try {
        const userId = req.user.id; // From verifyToken middleware
        crop = await Crop.findOneAndDelete({ _id: id, userId: userId }); // Only delete if user owns it
    } catch (err) {
        console.log(err);
    }
    if(!crop){
        return res.status(404).send({message: "Unable to delete crop or crop not found"});
    }
    return res.status(200).json({crop});
}

exports.getAllCrops = getAllCrops;
exports.addCrops = addCrops;
exports.getById = getById;
exports.updateCrop = updateCrop;
exports.deleteCrop = deleteCrop;
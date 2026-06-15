const Forum = require("../Model/QandAModel");

//display
const getAllForum = async (req, res, next) => {
    let QandA;

    //get all questions in forum
    try{
        QandA = await Forum.find();
    }catch (err) {
        console.log(err);
    }

    if (!QandA) {
        return res.status(404).json({ message: "No forum entries found" });
    }
    return res.status(200).json({ QandA });
};

//data insert
const addForum = async(req, res, next) => {
    const {question, answer, category, createdDate} = req.body;

    let QandA;

    try{
        QandA = new Forum({question, answer, category, createdDate});
        await QandA.save();
    }catch (err) {
        console.log(err);
    }

    if(!QandA){
        return res.status(404).send({message:"unable to add form"});
    }
    return res.status(200).json({QandA});
};

//get by ID
const getById = async(req, res, next) => {
    const id = req.params.id;
    let QandA;

    try{
        QandA = await Forum.findById(id);
    }catch (err) {
        console.log(err);
    }

    if(!QandA){
        return res.status(404).send({message:"form not find"});
    }
    return res.status(200).json({QandA});
}

//update 
const updateForum = async(req, res, next) => {
    const id = req.params.id;
    const {question, answer, category, createdDate} = req.body;

    let QandA;

    try{
        QandA = await Forum.findByIdAndUpdate(id,
            {question, answer, category, createdDate});
        QandA = await QandA.save();
    }catch (err) {
        console.log(err);
    }

    if(!QandA){
        return res.status(404).send({message:"Unable to update"});
    }
    return res.status(200).json({QandA});

}

//delete 
const deleteForum = async (req, res, next) => {
    const id = req.params.id;

    let QandA;

    try{
        QandA = await Forum.findByIdAndDelete(id);
    }catch (err) {
        console.log(err);
    }

    if(!QandA){
        return res.status(404).send({message:"Unable to delete"});
    }
    return res.status(200).json({QandA});
}

exports.getAllForum = getAllForum;
exports.addForum = addForum;
exports.getById = getById;
exports.updateForum = updateForum;
exports.deleteForum = deleteForum;
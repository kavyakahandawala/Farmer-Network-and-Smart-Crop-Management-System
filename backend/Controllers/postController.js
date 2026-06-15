const Post = require("../Model/postModel");

//display
const getAllPost = async (req, res, next) => {
    let post;

    //get all questions in forum
    try{
        post = await Post.find();
    }catch (err) {
        console.log(err);
    }

    if (!post) {
        return res.status(404).json({ message: "No post entries found" });
    }
    return res.status(200).json({ post });
};

//data insert
const addPost = async(req, res, next) => {
    const {creatorName, creatorEmail, creatorPhone, creatorQuestion, image, postCreatedDate, reply} = req.body;

    let post;

    try{
        post = new Post({creatorName, creatorEmail, creatorPhone, creatorQuestion, image, postCreatedDate, reply});
        await post.save();
    }catch (err) {
        console.log(err);
    }

    if(!post){
        return res.status(404).send({message:"unable to add post"});
    }
    return res.status(200).json({post});
};

//get by ID
const getById = async(req, res, next) => {
    const id = req.params.id;
    let post;

    try{
        post = await Post.findById(id);
    }catch (err) {
        console.log(err);
    }

    if(!post){
        return res.status(404).send({message:"post not find"});
    }
    return res.status(200).json({post});
}

//update 
const updatePost = async (req, res, next) => {
  const id = req.params.id;
  const { creatorName, creatorEmail, creatorPhone, creatorQuestion, image } = req.body;

  try {
    const post = await Post.findByIdAndUpdate(
      id,
      { creatorName, creatorEmail, creatorPhone, creatorQuestion, image },
      { new: true } // return updated document
    );
    if (!post) return res.status(404).json({ message: "Post not found" });

    res.status(200).json({ post });
  } catch (err) {
    res.status(500).json({ message: "Unable to update", error: err });
  }
};

//delete 
const deletePost = async (req, res, next) => {
    const id = req.params.id;

    let post;

    try{
        post = await Post.findByIdAndDelete(id);
    }catch (err) {
        console.log(err);
    }

    if(!post){
        return res.status(404).send({message:"Unable to delete"});
    }
    return res.status(200).json({post});
}

exports.getAllPost = getAllPost;
exports.addPost = addPost;
exports.getById = getById;
exports.updatePost = updatePost;
exports.deletePost = deletePost;
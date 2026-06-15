const express = require("express");
const routerPost = express.Router();
const Post = require("../Model/postModel");
const nodemailer = require("nodemailer");
require("dotenv").config();

// ----------------------------
// Helper: Send Email Function
// ----------------------------
const sendReplyEmail = async (creatorEmail, creatorName, question, responderName) => {
  try {
    // Configure Gmail transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME, // Your Gmail address
        pass: process.env.EMAIL_PASSWORD, // Your Gmail App Password
      },
    });

    // Email content
    const mailOptions = {
      from: `"AgroSphere 🌱" <${process.env.EMAIL_USERNAME}>`,
      to: creatorEmail,
      subject: "You received a new reply on your AgroSphere question!",
      text: `Hi ${creatorName},

Good news! ${responderName} just replied to your question:
"${question}"

Visit AgroSphere to view the reply:
👉 http://localhost:3000/posts

Thanks for contributing to the community 🌾
- The AgroSphere Team`,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully to:", creatorEmail);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};

// ----------------------------
// Import your post controller
// ----------------------------
const postController = require("../Controllers/postController");

routerPost.get("/", postController.getAllPost);
routerPost.post("/", postController.addPost);
routerPost.get("/:id", postController.getById);
routerPost.put("/:id", postController.updatePost);
routerPost.delete("/:id", postController.deletePost);

// ----------------------------
// Add reply + Send email
// ----------------------------
routerPost.post("/:id/reply", async (req, res) => {
  const { responderName, responderEmail, responderAnswer } = req.body;

  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Add the reply
    post.reply.push({ responderName, responderEmail, responderAnswer });
    await post.save();

    // ✅ Send email notification to creator
    if (post.creatorEmail) {
      await sendReplyEmail(
        post.creatorEmail,
        post.creatorName,
        post.creatorQuestion,
        responderName
      );
    }

    res.status(200).json({ message: "Reply added and email sent successfully", post });
  } catch (err) {
    console.error("❌ Error adding reply:", err);
    res.status(500).json({ message: "Error adding reply", error: err });
  }
});

// ----------------------------
// Export the router
// ----------------------------
module.exports = routerPost;

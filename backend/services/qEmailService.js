import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const sendReplyEmail = async (creatorEmail, creatorName, question, responderName) => {
  try {
    // Always send from the notification email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,  // jaevindz03@gmail.com
        pass: process.env.EMAIL_PASSWORD,  // App Password for this email
      },
    });

    const mailOptions = {
      from: `"AgroSphere 🌱" <${process.env.EMAIL_USERNAME}>`, // notification sender
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

    await transporter.sendMail(mailOptions);
    console.log("✅ Notification email sent successfully to:", creatorEmail);
  } catch (error) {
    console.error("❌ Error sending notification email:", error);
  }
};

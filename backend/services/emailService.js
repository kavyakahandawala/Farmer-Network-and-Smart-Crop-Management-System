const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('Email Service - EMAIL_USER:', process.env.EMAIL_USER);
console.log('Email Service - EMAIL_PASS:', process.env.EMAIL_PASS ? 'Loaded' : 'Missing');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (options) => {
  try {
    await transporter.verify();
    console.log('Email Service: SMTP connection verified');

    await transporter.sendMail({
      from: `"AgroSphere" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      attachments: options.attachments || [],
    });
    console.log('Email Service: Email sent successfully to:', options.to);
  } catch (error) {
    console.error('Email Service: Error sending email:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
    });
    throw new Error('Failed to send email');
  }
};

module.exports = { sendEmail };
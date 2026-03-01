// server/utils/mailer.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: process.env.MAILTRAP_PORT,
  secure: false,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  }
});

// Send email function
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const info = await transporter.sendMail({
      from: '"ASTU Complaint System" <reply@astu.com>',
      to,
      subject,
      text,
      html,
      attachments
    });

    console.log("Email sent:", info.messageId);
  } catch (err) {
    console.error("Email error:", err.message);
  }
};

module.exports = sendEmail;
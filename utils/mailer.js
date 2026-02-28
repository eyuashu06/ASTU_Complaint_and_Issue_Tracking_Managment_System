// server/utils/mailer.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
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
      from: '"ASTU Complaint System" <noreply@astu.test>',
      to,
      subject,
      text,
      html
    });

    console.log("Email sent:", info.messageId);
  } catch (err) {
    console.error("Email error:", err.message);
  }
};

module.exports = sendEmail;
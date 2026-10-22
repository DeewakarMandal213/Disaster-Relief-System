const nodemailer = require("nodemailer");

let transporter;
function getTransporter() {
  if (transporter) return transporter;
  const host = process.env.MAIL_HOST || "smtp.gmail.com";
  const port = Number(process.env.MAIL_PORT || 465);
  const secure = String(process.env.MAIL_SECURE || (port === 465)).toLowerCase() === "true";
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    throw new Error("Email is not configured. Set MAIL_USER and MAIL_PASS in backend/.env.");
  }
  transporter = nodemailer.createTransport({
    host, port, secure,
    auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
  });
  return transporter;
}

const escapeHtml = (value = "") => String(value).replace(/[&<>\"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[char]));

async function sendEmail({ to, subject, text, html }) {
  if (!to) return false;
  try {
    const mailer = getTransporter();
    await mailer.sendMail({
      from: process.env.MAIL_FROM || process.env.MAIL_USER,
      to,
      subject,
      text,
      html,
    });
    console.info(`Email notification sent: ${subject}`);
    return true;
  } catch (error) {
    // Notification failures must not undo a successful registration/request/status change.
    console.error("Email notification failed:", error.message);
    return false;
  }
}

module.exports = { sendEmail, escapeHtml };

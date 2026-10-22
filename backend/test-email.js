
require("dotenv").config();

const { sendEmail } = require("./utils/emailService");

async function main() {
  const recipient = process.env.MAIL_USER;

  if (!recipient) {
    throw new Error("MAIL_USER is missing from backend/.env");
  }

  const sent = await sendEmail({
    to: recipient,
    subject: "ReliefConnect — Email Service Test",
    text: "This is a test email from your ReliefConnect backend.",
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>ReliefConnect</h2>
        <p>Your backend email service test was successful.</p>
        <p>Email notifications can now be tested before controller integration.</p>
      </div>
    `,
  });

  if (!sent) {
    throw new Error(
      "Email was not sent. Check the backend terminal for the SMTP error."
    );
  }

  console.log("Test email accepted by the SMTP server.");
}

main().catch((error) => {
  console.error("Test failed:", error.message);
  process.exitCode = 1;
});

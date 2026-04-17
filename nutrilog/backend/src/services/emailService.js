const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 40px 0; }
  .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
  .header { background: linear-gradient(135deg, #10b981, #059669); padding: 32px; text-align: center; }
  .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 700; }
  .body { padding: 40px; color: #374151; line-height: 1.6; }
  .btn { display: inline-block; background: #10b981; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
  .footer { text-align: center; padding: 24px; color: #9ca3af; font-size: 14px; border-top: 1px solid #f3f4f6; }
</style></head>
<body><div class="container">
  <div class="header"><h1>🥗 NutriLog</h1></div>
  <div class="body">${content}</div>
  <div class="footer"><p>© ${new Date().getFullYear()} NutriLog. All rights reserved.<br>nutrilog.com</p></div>
</div></body>
</html>`;

const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({ from: process.env.FROM_EMAIL || 'NutriLog <noreply@nutrilog.com>', to, subject, html });
};

const sendVerificationEmail = async (user, token) => {
  const url = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  await sendEmail({
    to: user.email,
    subject: 'Verify your NutriLog email',
    html: baseTemplate(`
      <h2>Welcome to NutriLog, ${user.name}! 🎉</h2>
      <p>Thanks for signing up. Please verify your email address to get started on your nutrition journey.</p>
      <a href="${url}" class="btn">Verify Email Address</a>
      <p>This link expires in 24 hours. If you didn't create an account, you can ignore this email.</p>
    `),
  });
};

const sendPasswordResetEmail = async (user, token) => {
  const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  await sendEmail({
    to: user.email,
    subject: 'Reset your NutriLog password',
    html: baseTemplate(`
      <h2>Password Reset Request</h2>
      <p>Hi ${user.name},</p>
      <p>We received a request to reset your password. Click the button below to choose a new password.</p>
      <a href="${url}" class="btn">Reset Password</a>
      <p>This link expires in 1 hour. If you didn't request this, please ignore this email and your password will remain unchanged.</p>
    `),
  });
};

const sendWelcomePremiumEmail = async (user, tier) => {
  await sendEmail({
    to: user.email,
    subject: `Welcome to NutriLog ${tier}!`,
    html: baseTemplate(`
      <h2>You're now a ${tier} member! 🚀</h2>
      <p>Hi ${user.name},</p>
      <p>Thank you for upgrading your NutriLog subscription. You now have access to all ${tier} features.</p>
      <a href="${process.env.FRONTEND_URL}/dashboard" class="btn">Go to Dashboard</a>
    `),
  });
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail, sendWelcomePremiumEmail, sendEmail };

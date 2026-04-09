const nodemailer = require('nodemailer');
const config = require('../config');

// ── Create reusable transporter ───────────────────────────
let transporter;

function getTransporter() {
  if (transporter) return transporter;

  // If no email credentials configured, log to console (dev mode)
  if (!config.email.user || !config.email.pass) {
    console.warn('⚠ Email credentials not configured — emails will be logged to console');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });

  return transporter;
}

// ── Send verification email ──────────────────────────────
async function sendVerificationEmail(to, token) {
  const verifyUrl = `${config.clientUrl}/verify/${token}`;

  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="display: inline-block; width: 50px; height: 50px; background: linear-gradient(135deg, #4f46e5, #8b5cf6); border-radius: 12px; line-height: 50px; font-size: 24px; color: white; font-weight: 700;">L</div>
      </div>
      <h2 style="text-align: center; color: #1e293b; margin-bottom: 10px;">Verify Your Email</h2>
      <p style="text-align: center; color: #64748b; margin-bottom: 30px;">Thanks for signing up for Learnozi! Click the button below to verify your email address.</p>
      <div style="text-align: center; margin-bottom: 30px;">
        <a href="${verifyUrl}" style="display: inline-block; background: linear-gradient(135deg, #4f46e5, #8b5cf6); color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px;">Verify Email</a>
      </div>
      <p style="text-align: center; color: #94a3b8; font-size: 13px;">This link expires in 24 hours. If you didn't create an account, just ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
      <p style="text-align: center; color: #94a3b8; font-size: 12px;">Or copy and paste this link: <br/>${verifyUrl}</p>
    </div>
  `;

  return sendEmail(to, 'Verify your Learnozi account ✉️', html);
}

// ── Send password reset email ────────────────────────────
async function sendPasswordResetEmail(to, token) {
  const resetUrl = `${config.clientUrl}/reset-password/${token}`;

  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="display: inline-block; width: 50px; height: 50px; background: linear-gradient(135deg, #4f46e5, #8b5cf6); border-radius: 12px; line-height: 50px; font-size: 24px; color: white; font-weight: 700;">L</div>
      </div>
      <h2 style="text-align: center; color: #1e293b; margin-bottom: 10px;">Reset Your Password</h2>
      <p style="text-align: center; color: #64748b; margin-bottom: 30px;">We received a request to reset your password. Click the button below to set a new one.</p>
      <div style="text-align: center; margin-bottom: 30px;">
        <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #4f46e5, #8b5cf6); color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px;">Reset Password</a>
      </div>
      <p style="text-align: center; color: #94a3b8; font-size: 13px;">This link expires in 1 hour. If you didn't request this, just ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
      <p style="text-align: center; color: #94a3b8; font-size: 12px;">Or copy and paste this link: <br/>${resetUrl}</p>
    </div>
  `;

  return sendEmail(to, 'Reset your Learnozi password 🔑', html);
}

// ── Core send function ───────────────────────────────────
async function sendEmail(to, subject, html) {
  const transport = getTransporter();

  if (!transport) {
    // Dev fallback: log to console
    console.log('\n═══ EMAIL (dev mode) ═══');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    // Extract link from HTML for easy dev testing
    const linkMatch = html.match(/href="([^"]+)"/);
    if (linkMatch) console.log(`Link: ${linkMatch[1]}`);
    console.log('════════════════════════\n');
    return { messageId: 'dev-' + Date.now() };
  }

  const info = await transport.sendMail({
    from: config.email.from,
    to,
    subject,
    html,
  });

  console.log(`Email sent: ${info.messageId}`);
  return info;
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};

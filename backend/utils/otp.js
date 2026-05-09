const nodemailer = require('nodemailer');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOTPEmail = async (email, otp, name) => {
  // For development: log OTP to console if no email config
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@gmail.com') {
    console.log(`\n========== OTP FOR ${email} ==========`);
    console.log(`OTP: ${otp}`);
    console.log(`======================================\n`);
    return { success: true, dev: true };
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"ServiceHub" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your ServiceHub OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; background: #f9f9f9; border-radius: 12px;">
        <h2 style="color: #1a1a2e;">Hi ${name} 👋</h2>
        <p style="color: #555;">Use the OTP below to verify your account. It expires in <strong>10 minutes</strong>.</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #e94560; text-align: center; padding: 24px; background: #fff; border-radius: 8px; margin: 24px 0;">
          ${otp}
        </div>
        <p style="color: #999; font-size: 13px;">If you didn't request this, ignore this email.</p>
      </div>
    `,
  });

  return { success: true };
};

module.exports = { generateOTP, sendOTPEmail };

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST || "smtp.gmail.com",
  port:   process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Accept user object to match controller: sendWelcomeEmail(user)
export const sendWelcomeEmail = async (user) => {
  if (!process.env.EMAIL_USER) return;
  await transporter.sendMail({
    from:    "StorePulse <noreply@storepulse.com>",
    to:      user.email,
    subject: "Welcome to StorePulse!",
    html:    `<h2>Welcome ${user.name}!</h2><p>Thanks for joining StorePulse.</p>`,
  });
};

// ✅ Accept (user, resetUrl) to match controller: sendPasswordResetEmail(user, resetUrl)
export const sendPasswordResetEmail = async (user, resetUrl) => {
  if (!process.env.EMAIL_USER) {
    console.log(`Reset URL for ${user.email}: ${resetUrl}`);
    return;
  }
  await transporter.sendMail({
    from:    "StorePulse <noreply@storepulse.com>",
    to:      user.email,
    subject: "Reset your password",
    html:    `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 1 hour.</p>`,
  });
};
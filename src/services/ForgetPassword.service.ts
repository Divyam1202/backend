import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

// Generate reset token and save it to the user
export const generateResetToken = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
    expiresIn: "1h",
  });

  return { resetToken, user };
};

// Send reset password email
export const sendResetPasswordEmail = async (
  email: string,
  resetToken: string
) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset Request",
    text: `You requested a password reset. Click the link to reset your password: ${resetUrl}`,
    html: `<p>You requested a password reset. Click the link to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
  };

  await transporter.sendMail(mailOptions);
};

// Reset user password
export const resetUserPassword = async (token: string, newPassword: string) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
    userId: string;
  };

  const user = await User.findById(decoded.userId);
  if (!user) {
    throw new Error("User not found");
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);

  await user.save();
};

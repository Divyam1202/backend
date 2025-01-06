import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js"; // Correct import for named export
import Portfolio from "../models/portfolio.models.js";
import {
  generateResetToken,
  sendResetPasswordEmail,
  resetUserPassword,
} from "../services/ForgetPassword.service.js";
import bcrypt from "bcryptjs";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" }
    );

    const userData = {
      id: user._id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };

    res.json({
      token,
      user: userData,
    });
  } catch (error) {
    console.error(
      "Login error:",
      error instanceof Error ? error.message : error
    );
    res.status(500).json({
      message: "Login failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      username,
      firstName,
      lastName,
      role,
      portfolioUrl,
      bio,
      skills,
    } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Check if username exists
    if (username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }
    }

    // Validate role
    if (!["admin", "student", "instructor", "portfolio"].includes(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    // Create user
    const userData: any = {
      email,
      password,
      username,
      firstName,
      lastName,
      role,
    };
    const user = new User(userData);
    await user.save();

    // Create portfolio if portfolio details are provided
    if (portfolioUrl || bio || skills) {
      const portfolio = new Portfolio({
        user: user._id,
        portfolioUrl,
        bio,
        skills,
        published: false, // Default to unpublished
      });
      await portfolio.save();
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" }
    );

    const responseData = {
      id: user._id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };

    res.status(201).json({
      token,
      user: responseData,
    });
  } catch (error) {
    console.error(
      "Registration error:",
      error instanceof Error ? error.message : error
    );
    res.status(500).json({
      message: "Registration failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const { resetToken } = await generateResetToken(email);

    // Send reset password email
    await sendResetPasswordEmail(user.email, resetToken);

    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    console.error(
      "Password reset request error:",
      error instanceof Error ? error.message : error
    );
    res.status(500).json({
      message: "Password reset request failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    // Validate input
    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ message: "Token and new password are required" });
    }

    // Reset user password
    await resetUserPassword(token, newPassword);

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error(
      "Password reset error:",
      error instanceof Error ? error.message : error
    );
    res.status(500).json({
      message: "Password reset failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

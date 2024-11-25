import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js"; // Correct import for named export
import bcrypt from "bcryptjs";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

     // Find user
     const user = await User.findOne({ email });
     if (!user) {
       return res.status(401).json({ message: "Invalid credentials" });
     }

    // Check password (using the model's comparePassword method)
    const isMatch = await user.comparePassword(password);
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
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };

    res.json({
      token,
      user: userData,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Validate role
    if (!["admin", "student", "instructor"].includes(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    // // Hash password
    // const hashedPassword = await bcrypt.hash(password, 10);

     // Create base user data
     const userData: any = {
      email,
      password,
      firstName,
      lastName,
      role,
    };
    const user = new User(userData);
    await user.save();


    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" }
    );

    const responseData = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };

    res.status(201).json({
      token,
      user: responseData,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Registration failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// export const requestPasswordReset = async (req: Request, res: Response) => {
//   try {
//     const { email } = req.body;
//     const { resetToken, user } = await generateResetToken(email);
//     const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
//     await sendResetPasswordEmail(user.email);
//     res.status(200).json({ message: "Password reset email sent" });
//   } catch (error: any) {
//     res.status(400).json({ message: error.message });
//   }
// };

// export const resetPassword = async (req: Request, res: Response) => {
//   try {
//     const { token, newPassword } = req.body;
//     await resetUserPassword(token, newPassword);
//     res.status(200).json({ message: "Password reset successful" });
//   } catch (error: any) {
//     res.status(400).json({ message: error.message });
//   }
// };

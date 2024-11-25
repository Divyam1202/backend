import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/user.model.js";

dotenv.config();

const createAdminUser = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/hostel_management"
    );

    const adminData = {
      email: "admin@hms.com",
      password: "admin123", // This will be hashed automatically by the model
      firstName: "Admin",
      lastName: "User",
      role: "admin",
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });

    if (existingAdmin) {
      console.log("Admin user already exists");
      return;
    }

    // Create new admin user
    const admin = new User(adminData);
    await admin.save();

    console.log("Admin user created successfully");
    console.log("Email:", adminData.email);
    console.log("Password:", adminData.password);
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await mongoose.disconnect();
  }
};

createAdminUser();

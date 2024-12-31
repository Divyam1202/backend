import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

// Define the interface for the User document
export interface IUser extends mongoose.Document {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
  role: "admin" | "student" | "instructor" | "portfolio";
  phoneNumber?: string;
  portfolioUrl?: string; // Portfolio URL
  about?: string; // Brief introduction
  skills?: string[]; // Array of skills
  portfolio?: mongoose.Types.ObjectId; // Reference to the Portfolio model
  courses: mongoose.Types.ObjectId[]; // Courses field, referencing Course model
  comparePassword(candidatePassword: string): Promise<boolean>; // Compare passwords method
}

// Define the User schema
const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "student", "instructor", "portfolio"],
      required: true,
      default: "student",
    },
    phoneNumber: {
      type: String,
      default: null,
    },
    portfolioUrl: {
      type: String,
      unique: true,
      sparse: true, // Allow null or undefined, enforce uniqueness when present
    },
    about: {
      type: String,
      maxlength: 500, // Brief introduction
    },
    skills: {
      type: [String],
      default: [],
    },
    portfolio: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Portfolio", // Reference to the Portfolio model
    },
    courses: [{ type: mongoose.Types.ObjectId, ref: "Course" }], // Add courses field
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Hash the password before saving the User
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare candidate password with hashed password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Export the User model
export const User = mongoose.model<IUser>("User", userSchema);

export interface IPortfolio extends Document {
  username: string;
  displayName: string;
  skills: string[];
  experience: {
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  projects: {
    name: string;
    description: string;
    technologies: string[];
    link: string;
  }[];
  education: {
    institution: string;
    degree: string;
    graduationYear: string;
    major: string;
  }[];
  published: boolean;
  portfolioUrl?: string;
  bio?: string;
  about?: string;
  patentsOrPapers?: string[];
  profileLinks?: string[];
}

const PortfolioSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  skills: { type: [String], required: true },
  experience: [
    {
      title: { type: String, required: true },
      company: { type: String, required: true },
      location: { type: String, required: true },
      startDate: { type: String, required: true },
      endDate: { type: String },
      description: { type: String, required: true },
    },
  ],
  projects: [
    {
      name: { type: String, required: true },
      description: { type: String, required: true },
      technologies: { type: [String], required: true },
      link: { type: String, required: true },
    },
  ],
  education: [
    {
      institution: { type: String, required: true },
      degree: { type: String, required: true },
      graduationYear: { type: String, required: true },
      major: { type: String, required: true },
    },
  ],
  published: { type: Boolean, default: false },
  portfolioUrl: { type: String },
  bio: { type: String },
  about: { type: String },
  patentsOrPapers: { type: [String] },
  profileLinks: { type: [String] },
});

export default mongoose.model<IPortfolio>("Portfolio", PortfolioSchema);

import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

// Define the interface for the User document
export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
  username?: string; // Make username optional
  phoneNumber?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
  courses?: mongoose.Types.ObjectId[]; // Add courses property
}

// Define the User schema
const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    username: { type: String, unique: true, sparse: true }, // Make username unique but optional
    phoneNumber: { type: String },
    courses: [{ type: mongoose.Types.ObjectId, ref: "Course" }], // Add courses field
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  return bcrypt.compare(candidatePassword, this.password);
};

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

import mongoose, { Document } from "mongoose";

// Define the interface for the Course model
export interface ICourse extends Document {
  title: string;
  description: string;
  courseCode: string;
  capacity: number;
  instructor: mongoose.Schema.Types.ObjectId; // Reference to instructor
  students: mongoose.Schema.Types.ObjectId[]; // Array of student IDs
  status: string;
  modules: { title: string; resourceLink: string }[]; // Array of modules
}

const courseSchema = new mongoose.Schema<ICourse>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  courseCode: { type: String, required: true },
  capacity: { type: Number, required: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  // students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  students: [{ type: mongoose.Types.ObjectId, ref: "User" }],
  status: { type: String, required: true, default: "active" },
  modules: [
    {
      title: { type: String, required: true },
      resourceLink: { type: String, required: true },
    },
  ],
});

const Course = mongoose.model<ICourse>("Course", courseSchema);
export default Course;

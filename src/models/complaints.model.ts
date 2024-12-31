import mongoose, { Schema, Document } from "mongoose";

export interface IComplaint extends Document {
  student: mongoose.Types.ObjectId; // Reference to User
  description: string;
  status: string;
  type: string; // New field for complaint type
  studentDetails: {
    firstName: string;
    lastName: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const complaintSchema = new Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["Enroll", "Withdraw", "Completion", "Other", "All"], // Add complaint categories
      required: true,
    },
    description: { type: String, required: true },
    status: { type: String, enum: ["Pending", "Resolved"], default: "Pending" },
    assignedInstructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    }, // New field for assigned instructor
    studentDetails: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IComplaint>("Complaint", complaintSchema);

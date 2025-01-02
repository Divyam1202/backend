import mongoose, { Schema, Document } from "mongoose";

// Shared Submission Schema
const SubmissionSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: "User", required: true },
  answers: { type: [String], required: false }, // For quizzes
  submission: { type: String, required: false }, // For assignments
  submittedAt: { type: Date, default: Date.now },
});

// Quiz Schema
const QuizSchema = new Schema({
  title: { type: String, required: true },
  questions: { type: [String], required: true },
  submissions: { type: [SubmissionSchema], default: [] },
});

// Assignment Schema
const AssignmentSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  dueDate: { type: Date, required: true },
  submissions: { type: [SubmissionSchema], default: [] },
});

// Combined Model
const Quiz = mongoose.model("Quiz", QuizSchema);
const Assignment = mongoose.model("Assignment", AssignmentSchema);

export { Quiz, Assignment };

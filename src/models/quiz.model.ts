import mongoose, { Schema } from "mongoose";

// Shared Submission Schema
const SubmissionSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: "User", required: true },
  answers: { type: [String], required: false }, // For quizzes
  submission: { type: String, required: false }, // For assignments
  submittedAt: { type: Date, default: Date.now },
});

// Question Schema
const QuestionSchema = new Schema({
  question: { type: String, required: true },
  options: { type: [String], required: true },
  answerType: { type: String, required: true },
});

// Quiz Schema
const QuizSchema = new Schema({
  title: { type: String, required: true },
  questions: { type: [QuestionSchema], required: true },
  scheduleTime: { type: Date, required: false },
  submissions: { type: [SubmissionSchema], default: [] },
  instructor: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

// Assignment Schema
const AssignmentSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  dueDate: { type: Date, required: true },
  scheduleTime: { type: Date, required: false },
  submissions: { type: [SubmissionSchema], default: [] },
  instructor: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

// Combined Model
const Quiz = mongoose.model("Quiz", QuizSchema);
const Assignment = mongoose.model("Assignment", AssignmentSchema);

export { Quiz, Assignment };

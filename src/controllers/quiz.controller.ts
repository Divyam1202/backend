import { Request, Response } from "express";
import { Quiz, Assignment } from "../models/quiz.model.js";
import mongoose from "mongoose";

// Middleware to check for roles (Instructor or Student)
const isInstructor = (req: Request) => req.user?.role === "instructor";
const isStudent = (req: Request) => req.user?.role === "student";

// Create Quiz (Instructor only)
export const createQuiz = async (req: Request, res: Response) => {
  if (!isInstructor(req)) {
    return res.status(403).json({
      success: false,
      message: "Permission denied. Only instructors can create quizzes.",
    });
  }

  const { title, questions, scheduleTime } = req.body;
  const instructorId = req.user?._id;

  if (!title || !questions) {
    return res
      .status(400)
      .json({ success: false, message: "Title and questions are required" });
  }

  try {
    const parsedQuestions = JSON.parse(questions);

    const quiz = new Quiz({
      title,
      questions: parsedQuestions,
      scheduleTime,
      instructor: instructorId,
    });
    await quiz.save();

    return res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      quiz,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Submit Quiz (Student only)
export const submitQuiz = async (req: Request, res: Response) => {
  if (!isStudent(req)) {
    return res.status(403).json({
      success: false,
      message: "Permission denied. Only students can submit quizzes.",
    });
  }

  const { quizId, studentId, answers } = req.body;

  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });
    }

    quiz.submissions.push({ student: studentId, answers });
    await quiz.save();

    return res.status(200).json({
      success: true,
      message: "Quiz submitted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Create Assignment (Instructor only)
export const createAssignment = async (req: Request, res: Response) => {
  if (!isInstructor(req)) {
    return res.status(403).json({
      success: false,
      message: "Permission denied. Only instructors can create assignments.",
    });
  }

  const { title, description, dueDate, scheduleTime } = req.body;
  const instructorId = req.user?._id;
  const file = req.file;

  //console.log("Received payload:", req.body); // Log the received payload

  if (!title || !description) {
    return res.status(400).json({
      success: false,
      message: "Title and description are required.",
    });
  }

  try {
    const parsedAssignment = JSON.parse(description);
    const assignment = new Assignment({
      title,
      description: parsedAssignment,
      dueDate,
      scheduleTime,
      file: file ? file.path : null,
      instructor: instructorId,
    });
    await assignment.save();

    return res.status(201).json({
      success: true,
      message: "Assignment created successfully",
      assignment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Submit Assignment (Student only)
export const submitAssignment = async (req: Request, res: Response) => {
  if (!isStudent(req)) {
    return res.status(403).json({
      success: false,
      message: "Permission denied. Only students can submit assignments.",
    });
  }

  const { assignmentId, studentId, submission } = req.body;

  try {
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found" });
    }

    assignment.submissions.push({ student: studentId, submission });
    await assignment.save();

    return res.status(200).json({
      success: true,
      message: "Assignment submitted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// View Quizzes (For instructors only)
export const viewQuizzes = async (req: Request, res: Response) => {
  try {
    const instructorId = req.user?._id; // Assuming `_id` is available
    const quizzes = await Quiz.find({ instructor: instructorId });

    return res.status(200).json({
      success: true,
      quizzes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// View Assignments (For instructors only)
export const viewAssignments = async (req: Request, res: Response) => {
  try {
    const instructorId = req.user?._id; // Assuming `_id` is available
    const assignments = await Assignment.find({ instructor: instructorId });

    return res.status(200).json({
      success: true,
      assignments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get Quiz Details (For instructors only)
export const getTeacherQuizDetails = async (req: Request, res: Response) => {
  const { quizId } = req.params;

  // Validate quizId
  if (!mongoose.Types.ObjectId.isValid(quizId)) {
    return res.status(400).json({ success: false, message: "Invalid quiz ID" });
  }

  try {
    const quiz = await Quiz.findById(quizId).populate("submissions.student");

    if (!quiz) {
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });
    }

    return res.status(200).json({ success: true, quiz });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get Assignment Details (For instructors only)
export const getTeacherAssignmentDetails = async (
  req: Request,
  res: Response
) => {
  const { assignmentId } = req.params;

  // Validate assignmentId
  if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid assignment ID" });
  }

  try {
    const assignment = await Assignment.findById(assignmentId).populate(
      "submissions.student"
    );

    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found" });
    }

    return res.status(200).json({ success: true, assignment });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// View Quizzes (For students only)
export const viewStudentQuizzes = async (req: Request, res: Response) => {
  try {
    const quizzes = await Quiz.find();

    return res.status(200).json({
      success: true,
      quizzes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// View Assignments (For students only)
export const viewStudentAssignments = async (req: Request, res: Response) => {
  try {
    const assignments = await Assignment.find();

    return res.status(200).json({
      success: true,
      assignments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get Quiz Details (For students only)
export const getStudentQuizDetails = async (req: Request, res: Response) => {
  const { quizId } = req.params;

  // Validate quizId
  if (!mongoose.Types.ObjectId.isValid(quizId)) {
    return res.status(400).json({ success: false, message: "Invalid quiz ID" });
  }

  try {
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res
        .status(404)
        .json({ success: false, message: "Quiz not found" });
    }

    return res.status(200).json({ success: true, quiz });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get Assignment Details (For students only)
export const getStudentAssignmentDetails = async (
  req: Request,
  res: Response
) => {
  const { assignmentId } = req.params;

  // Validate assignmentId
  if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid assignment ID" });
  }

  try {
    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found" });
    }

    return res.status(200).json({ success: true, assignment });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

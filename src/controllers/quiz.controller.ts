import { Request, Response } from "express";
import { Quiz, Assignment } from "../models/quiz.model.js";

//create quiz
export const createQuiz = async (req: Request, res: Response) => {
  // Parse the questions array if necessary
  const { title, questions } = req.body;

  if (!title || !questions) {
    return res
      .status(400)
      .json({ success: false, message: "Title and questions are required" });
  }

  try {
    // Ensure questions are an array (if not, parse it)
    const parsedQuestions = Array.isArray(questions)
      ? questions
      : JSON.parse(questions);

    const quiz = new Quiz({ title, questions: parsedQuestions });
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

// Submit Quiz Answers
export const submitQuiz = async (req: Request, res: Response) => {
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

// Create Assignment
export const createAssignment = async (req: Request, res: Response) => {
  const { title, description, dueDate } = req.body;

  try {
    const assignment = new Assignment({ title, description, dueDate });
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

// Submit Assignment
export const submitAssignment = async (req: Request, res: Response) => {
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

// Get Submissions
export const getSubmissions = async (req: Request, res: Response) => {
  const { type, id } = req.params;

  try {
    let item;
    if (type === "quiz") {
      item = await Quiz.findById(id).populate("submissions.student");
    } else if (type === "assignment") {
      item = await Assignment.findById(id).populate("submissions.student");
    }

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: `${type} not found` });
    }

    return res.status(200).json({
      success: true,
      submissions: item.submissions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

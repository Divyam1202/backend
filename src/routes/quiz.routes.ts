import express from "express";
import {
  createQuiz,
  submitQuiz,
  createAssignment,
  submitAssignment,
  getSubmissions,
} from "../controllers/quiz.controller.js";

const router = express.Router();

// Quiz Routes
router.post("/quizzes/create", createQuiz);
router.post("/quizzes/submit", submitQuiz);

// Assignment Routes
router.post("/assignments/create", createAssignment);
router.post("/assignments/submit", submitAssignment);

// Shared Route for Submissions
router.get("/:type/:id/submissions", getSubmissions);

export default router;

import express from "express";
import {
  createQuiz,
  submitQuiz,
  createAssignment,
  submitAssignment,
  getSubmissions,
} from "../controllers/quiz.controller.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

const router = express.Router();

// Quiz Routes
router.post(
  "/quizzes/create",
  authenticateToken,
  authorizeRoles(["instructor"]),
  createQuiz
);
router.post(
  "/quizzes/submit",
  authenticateToken,
  authorizeRoles(["student"]),
  submitQuiz
);

// Assignment Routes
router.post(
  "/assignments/create",
  authenticateToken,
  authorizeRoles(["instructor"]),
  createAssignment
);
router.post(
  "/assignments/submit",
  authenticateToken,
  authorizeRoles(["student"]),
  submitAssignment
);

// Shared Route for Submissions
router.get(
  "/:type/:id/submissions",
  authenticateToken,
  authorizeRoles(["instructor"]),
  getSubmissions
);

export default router;

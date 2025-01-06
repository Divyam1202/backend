import express from "express";
import {
  createQuiz,
  createAssignment,
  viewQuizzes,
  viewAssignments,
  getTeacherQuizDetails,
  getTeacherAssignmentDetails,
  submitQuiz,
  submitAssignment,
  viewStudentQuizzes,
  viewStudentAssignments,
  getStudentQuizDetails,
  getStudentAssignmentDetails,
} from "../controllers/quiz.controller.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

const router = express.Router();

// Teacher Routes
router.post(
  "/quizzes/create",
  authenticateToken,
  authorizeRoles(["instructor"]),
  createQuiz
);
router.post(
  "/assignments/create",
  authenticateToken,
  authorizeRoles(["instructor"]),
  createAssignment
);
router.get(
  "/quizzes",
  authenticateToken,
  authorizeRoles(["instructor"]),
  viewQuizzes
);
router.get(
  "/assignments",
  authenticateToken,
  authorizeRoles(["instructor"]),
  viewAssignments
);
router.get(
  "/quizzes/:quizId",
  authenticateToken,
  authorizeRoles(["instructor"]),
  getTeacherQuizDetails
);
router.get(
  "/assignments/:assignmentId",
  authenticateToken,
  authorizeRoles(["instructor"]),
  getTeacherAssignmentDetails
);

// Student Routes
router.post(
  "/quizzes/submit",
  authenticateToken,
  authorizeRoles(["student"]),
  submitQuiz
);
router.post(
  "/assignments/submit",
  authenticateToken,
  authorizeRoles(["student"]),
  submitAssignment
);
router.get(
  "/student/quizzes",
  authenticateToken,
  authorizeRoles(["student"]),
  viewStudentQuizzes
);
router.get(
  "/student/assignments",
  authenticateToken,
  authorizeRoles(["student"]),
  viewStudentAssignments
);
router.get(
  "/student/quizzes/:quizId",
  authenticateToken,
  authorizeRoles(["student"]),
  getStudentQuizDetails
);
router.get(
  "/student/assignments/:assignmentId",
  authenticateToken,
  authorizeRoles(["student"]),
  getStudentAssignmentDetails
);

export default router;

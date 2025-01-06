import express from "express";
import {
  enrollInCourse,
  viewCourses,
  viewEnrolledCourses,
  createCourse,
  viewTeacherCourses,
  withdrawFromCourse,
  playCourse,
  updateProgress,
} from "../controllers/course.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// ===================== Student Routes =====================

// Route to view all available courses (Students can view but not create or update)
router.get("/courses", authenticateToken, viewCourses);

// Route to view courses the student is enrolled in
router.get("/viewenrolled", authenticateToken, viewEnrolledCourses);

// Route to enroll in a course (Student can enroll in courses)
router.post("/enroll", authenticateToken, enrollInCourse);

// Route to withdraw from a course (Student can withdraw from courses)
router.delete("/withdraw", authenticateToken, withdrawFromCourse);

// Route to Play Course
router.post("/play/:courseId", authenticateToken, playCourse);

// Route to Show Progress of Course
router.put("/progress", authenticateToken, updateProgress);

// ===================== Teacher Routes =====================

// Route to create a new course (Only teachers can create courses)
router.post("/create", authenticateToken, createCourse);

// Route to view the courses created by the teacher
router.get("/allinstructorcourses", authenticateToken, viewTeacherCourses);

export default router;

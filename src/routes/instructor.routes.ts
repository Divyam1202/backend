import express from "express";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware.js";
import {
  getInstructorProfile,
  getInstructorDashboardData,
  changeInstructorPassword,
} from "../controllers/instructor.controller.js";

import { getComplaints, getStudentComplaints } from "../controllers/Complaints.controller.js";

const router = express.Router();

// Add interface for authenticated request
interface AuthenticatedRequest extends express.Request {
  user?: {
    _id: string;
    role: string;
  };
}

// Instructor profile routes
router.get(
  "/profile",
  authenticateToken,
  authorizeRoles(["instructor"]),
  getInstructorProfile
);

// Dashboard route
router.get(
  "/dashboard",
  authenticateToken,
  authorizeRoles(["instructor"]),
  getInstructorDashboardData
);

// Change password route
router.put(
  "/change-password",
  authenticateToken,
  authorizeRoles(["instructor"]),
  changeInstructorPassword
);

// Complaints route
router.get(
  "/complaints",
  authenticateToken,
  authorizeRoles(["instructor"]),
  getComplaints
);

// Optional: Leave management routes
// Note: These are commented out for now, but you can implement them when needed.

// router.get(
//   "/leaves",
//   authenticateToken,
//   authorizeRoles(["instructor"]),
//   getAllLeaves
// );

router.get(
  "/complaint",
  authenticateToken,
  authorizeRoles(["instructor"]),
  getComplaints
);

// router.post(
//   "/leaves/:leaveId/review",
//   authenticateToken,
//   authorizeRoles(["instructor"]),
//   validateLeaveReview,
//   reviewLeave
// );

// Complaint stats route
router.get(
  "/complaint/students",
  authenticateToken,
  authorizeRoles(["instructor"]),
  getStudentComplaints
);

// Mess-related routes (currently commented out)
// router.post(
//   "/upload-mess-menu",
//   authenticateToken,
//   authorizeRoles(["instructor"]),
//   messUpload.single("messPhoto"),
//   uploadMessPhoto
// );

// router.get(
//   "/mess-menu",
//   authenticateToken,
//   authorizeRoles(["instructor"]),
//   getMessPhoto
// );

export default router;

import express from "express";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware.js";
import {
  getStudentProfile,
  // getStudentLeaveStats,
  // getStudentLeaves,
  // submitLeave,
  updateStudentProfile,
  getStudentDashboardData,
  changeStudentPassword,
  // getStudentRoomates,
  // uploadProfilePicture,
} from "../controllers/student.controller.js";
import {
  createComplaint,
  getStudentComplaints,
  updateComplaint,
  deleteStudentComplaint,
} from "../controllers/Complaints.controller.js";
// import { configureMulter } from "../middleware/upload.middleware.js"; // Import the multer configuration
// import { getMessPhoto } from "../controllers/mess.controller.js";

// Configure multer for profile photos
// const profileUpload = configureMulter("profile_photos");

import {
  viewCourses,
  withdrawFromCourse,
  viewEnrolledCourses,
  playCourse,
} from "../controllers/course.controller.js";
const router = express.Router();

// Student profile routes
router.get(
  "/profile",
  authenticateToken,
  authorizeRoles(["student"]),
  getStudentProfile
);
router.put(
  "/profile",
  authenticateToken,
  authorizeRoles(["student"]),
  updateStudentProfile
);

// Password change route
router.put(
  "/change-password",
  authenticateToken,
  authorizeRoles(["student"]),
  changeStudentPassword
);

// // Leave management routes
// router.get(
//   "/leaves",
//   authenticateToken,
//   authorizeRoles(["student"]),
//   // getStudentLeaves
// );
// router.post(
//   "/leaves/apply",
//   authenticateToken,
//   authorizeRoles(["student"]),
//   // submitLeave
// );

router.get(
  "/complaint",
  authenticateToken,
  authorizeRoles(["student"]),
  getStudentComplaints
);

// Dashboard route
router.get(
  "/dashboard",
  authenticateToken,
  authorizeRoles(["student"]),
  getStudentDashboardData
);

// Course route
router.get(
  "/enrollInCourse",
  authenticateToken,
  authorizeRoles(["student"]),
  viewCourses
);

// Withdraw route
router.get(
  "/enrollInCourse",
  authenticateToken,
  authorizeRoles(["student"]),
  withdrawFromCourse
);

// All Enrolled Courses route
router.get(
  "/mycourses",
  authenticateToken,
  authorizeRoles(["student"]),
  viewEnrolledCourses
);

// Play Courses route
router.get(
  "/play/:courseId",
  authenticateToken,
  authorizeRoles(["student"]),
  playCourse
);

// Complaint routes
router.post(
  "/complaints", // Changed from /complaint to /complaints for consistency
  authenticateToken,
  authorizeRoles(["student"]),
  createComplaint
);

router.patch(
  "/complaints/:id", // Changed from complaint-update/:id
  authenticateToken,
  authorizeRoles(["student"]),
  updateComplaint
);

router.delete(
  "/complaints/:id", // Changed from complaint/:id
  authenticateToken,
  authorizeRoles(["student"]),
  deleteStudentComplaint
);

// Profile picture upload route
router.post(
  "/upload-profile-pic",
  authenticateToken,
  authorizeRoles(["student"])
  // profileUpload.single("profilePic"), // Use the configured profileUpload middleware
  // uploadProfilePicture
);

//mess-controls

router.get(
  "/mess-menu",
  authenticateToken,
  authorizeRoles(["student"])
  // getMessPhoto
);

export default router;

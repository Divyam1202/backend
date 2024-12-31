import express from "express"; // Ensure you're importing express only once
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware.js";
import {
  createAdmin,
  getAllInstructors,
  createInstructor,
  deleteInstructor,
  getAllStudents,
} from "../controllers/admin.controller.js";
import { getAllPortfolios } from "../controllers/portfolio.controller.js";
import { getAllComplaints } from "../controllers/instructor.controller.js";

const router = express.Router();

// Protect all admin routes
router.use(authenticateToken, authorizeRoles(["admin"]));

// Admin Management
router.post("/create", createAdmin);

// Student Management Routes
router.get("/students", getAllStudents);

// Instructor Management Routes
router.get("/getAllInstructors", getAllInstructors);
router.post("/instructor-create", createInstructor);
router.delete("/delete-instructor/:id", deleteInstructor);

//Portfolio User Management
router.get("/portfolio", getAllPortfolios);

// Complaint Management
router.get("/getallcomplaints", getAllComplaints);

export default router;

import express from "express";
import {
  createComplaint,
  getComplaints,
  updateComplaint,
  deleteComplaint,
  getStudentComplaints,
  deleteStudentComplaint,
} from "../controllers/Complaints.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js"; // Authentication middleware
import { authorizeAdmin } from "../middleware/authorizeAdmin.js"; // Admin authorization middleware
import { authorizeRoles } from "../middleware/auth.middleware.js";

const router = express.Router();

// Middleware to authenticate the user (e.g., checking the JWT token)
router.use(authenticateToken);

// Route to create a new complaint
router.post("/create", createComplaint);

// Route to get all complaints (Admin only)
router.get("/complaints", authorizeRoles(["instructor"]), getComplaints);

// Route to get complaints of a specific student (authenticated student only)
router.get("/student", getStudentComplaints);

// Route to update an existing complaint (Student only, for their own complaints)
router.patch("/student/:id", updateComplaint);

// Route to delete a complaint (Admin only)
router.delete("/:id", authorizeAdmin, deleteComplaint);

// Route to delete a specific student's complaint (Authenticated student can only delete their own)
router.delete("/student/:id", deleteStudentComplaint);

export default router;

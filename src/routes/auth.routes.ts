import express from "express";
import { login, register } from "../controllers/auth.controller.js";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/login", login);
router.post("/register", register);

// Protected routes for specific roles
router.get(
  "/protected-admin",
  authenticateToken,
  authorizeRoles(["admin"]),
  (req, res) => {
    res.json({ message: "Welcome, Admin!" });
  }
);

router.get(
  "/protected-student",
  authenticateToken,
  authorizeRoles(["student"]),
  (req, res) => {
    res.json({ message: "Welcome, Student!" });
  }
);

router.get(
  "/protected-instructor",
  authenticateToken,
  authorizeRoles(["instructor"]),
  (req, res) => {
    res.json({ message: "Welcome, Instructor!" });
  }
);

router.get(
  "/protected-portfolio",
  authenticateToken,
  authorizeRoles(["portfolio"]),
  (req, res) => {
    res.json({ message: "Welcome, Portfolio User!" });
  }
);

export default router;

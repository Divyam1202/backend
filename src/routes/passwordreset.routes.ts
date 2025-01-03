import express from "express";
import {
  requestPasswordReset,
  resetPassword,
} from "../controllers/auth.controller.js";

const router = express.Router();

// Route to request password reset
router.post("/forgot-password", requestPasswordReset);

// Route to reset password
router.post("/reset-password", resetPassword);

export default router;

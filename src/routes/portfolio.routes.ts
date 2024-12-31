import express from "express";
import {
  getAllPortfolios,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  getPortfolioByUsername,
  togglePublishPortfolio,
  saveProfile,
  getProfile,
} from "../controllers/portfolio.controller.js";

import { authenticateToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Route to get all portfolios (only published portfolios)
router.get("/", getAllPortfolios);

// Route to get a portfolio by username (public route, like LeetCode)
router.get("/username/:username", getPortfolioByUsername);

// Route to create a new portfolio
router.post("/", createPortfolio);

// Route to update an existing portfolio (for updating bio, skills, etc.)
router.put("/:portfolioId", updatePortfolio);

// Route to toggle the publish status of a portfolio (e.g., make it public/private)
router.put("/:portfolioId/publish", togglePublishPortfolio);

// Route to delete a portfolio
router.delete("/:portfolioId", deletePortfolio);

// Save or update the profile
router.put("/profile", saveProfile);

// Get profile data for the logged-in user
router.get("/profile/:userId", getProfile);

export default router;

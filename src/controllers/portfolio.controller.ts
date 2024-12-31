import { Request, Response } from "express";
import Portfolio from "../models/portfolio.models.js";
import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";

// Get all portfolios
export const getAllPortfolios = async (_req: Request, res: Response) => {
  try {
    const portfolios = await Portfolio.find({ published: true })
      .sort({ createdAt: -1 })
      .populate("user", "username firstName lastName bio skills");
    res.status(200).json(portfolios);
  } catch (error) {
    res.status(500).json({ message: "Error fetching portfolios", error });
  }
};

// Get a portfolio by username
export const getPortfolioByUsername = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const portfolio = await Portfolio.findOne({
      user: user._id,
      published: true,
    })
      .populate("user", "firstName lastName bio skills username")
      .select("-__v");
    if (!portfolio) {
      return res
        .status(404)
        .json({ message: "Portfolio not found or not published" });
    }
    res.status(200).json(portfolio);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching portfolio by username", error });
  }
};

// Create a new portfolio
export const createPortfolio = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      portfolioUrl,
      bio,
      skills,
      about,
      projects,
      experience,
      education,
      patentsOrPapers,
      profileLinks,
      username,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingPortfolio = await Portfolio.findOne({ user: userId });
    if (existingPortfolio) {
      return res
        .status(400)
        .json({ message: "Portfolio already exists for this user" });
    }

    const newPortfolio = new Portfolio({
      user: userId,
      portfolioUrl,
      bio,
      skills,
      about,
      projects,
      experience,
      education,
      patentsOrPapers,
      profileLinks,
    });

    if (username) {
      const existingUser = await User.findOne({ username });
      if (existingUser && existingUser._id.toString() !== userId) {
        return res.status(400).json({ message: "Username already taken" });
      }
      user.username = username;
      await user.save();
    }

    await newPortfolio.save();
    res.status(201).json({
      message: "Portfolio created successfully",
      portfolio: newPortfolio,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating portfolio", error });
  }
};

// Update an existing portfolio
export const updatePortfolio = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      portfolioUrl,
      bio,
      skills,
      about,
      projects,
      experience,
      education,
      patentsOrPapers,
      profileLinks,
      published,
      username,
    } = req.body;

    const portfolio = await Portfolio.findOne({ user: userId });
    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }

    if (portfolioUrl) portfolio.portfolioUrl = portfolioUrl;
    if (bio) portfolio.bio = bio;
    if (skills) portfolio.skills = skills;
    if (about) portfolio.about = about;
    if (projects) portfolio.projects = projects;
    if (experience) portfolio.experience = experience;
    if (education) portfolio.education = education;
    if (patentsOrPapers) portfolio.patentsOrPapers = patentsOrPapers;
    if (profileLinks) portfolio.profileLinks = profileLinks;
    if (published !== undefined) portfolio.published = published;

    if (username) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const existingUser = await User.findOne({ username });
      if (existingUser && existingUser._id.toString() !== userId) {
        return res.status(400).json({ message: "Username already taken" });
      }
      user.username = username;
      await user.save();
    }

    await portfolio.save();
    res
      .status(200)
      .json({ message: "Portfolio updated successfully", portfolio });
  } catch (error) {
    res.status(500).json({ message: "Error updating portfolio", error });
  }
};

// Delete a portfolio
export const deletePortfolio = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const portfolio = await Portfolio.findOneAndDelete({ user: userId });
    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }
    res.status(200).json({ message: "Portfolio deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting portfolio", error });
  }
};

// Toggle publish state of a portfolio
export const togglePublishPortfolio = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const portfolio = await Portfolio.findOne({ user: userId });
    if (!portfolio) {
      return res.status(404).json({ message: "Portfolio not found" });
    }
    portfolio.published = !portfolio.published;
    await portfolio.save();
    res.status(200).json({
      message: `Portfolio ${
        portfolio.published ? "published" : "unpublished"
      } successfully`,
      portfolio,
    });
  } catch (error) {
    res.status(500).json({ message: "Error toggling publish state", error });
  }
};

export const saveProfile = async (req: Request, res: Response) => {
  try {
    const {
      username,
      displayName,
      skills,
      experience,
      projects,
      education,
      published,
      portfolioUrl,
      bio,
      about,
      patentsOrPapers,
      profileLinks,
    } = req.body;

    // Ensure the user exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find or create the portfolio
    let portfolio = await Portfolio.findOne({ user: user._id });
    if (!portfolio) {
      portfolio = new Portfolio({ user: user._id });
    }

    // Update profile fields
    portfolio.displayName = displayName;
    portfolio.skills = skills;
    portfolio.experience = experience;
    portfolio.projects = projects;
    portfolio.education = education;
    portfolio.published = published;
    portfolio.portfolioUrl = portfolioUrl;
    portfolio.bio = bio;
    portfolio.about = about;
    portfolio.patentsOrPapers = patentsOrPapers;
    portfolio.profileLinks = profileLinks;

    // Save to the database
    await portfolio.save();

    res.status(200).json({ message: "Profile saved successfully", portfolio });
  } catch (error) {
    console.error("Error saving profile:", error);
    res.status(500).json({ message: "Error updating portfolio", error });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Fetch the portfolio
    const portfolio = await Portfolio.findOne({ user: userId }).populate(
      "user",
      "username firstName lastName"
    );

    if (!portfolio) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.status(200).json({ profile: portfolio });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Error fetching profile", error });
  }
};

// Add the missing functions
export const savePortfolio = async (req: Request, res: Response) => {
  const { username, portfolio } = req.body;

  try {
    const existingPortfolio = await Portfolio.findOne({ username });

    if (existingPortfolio) {
      // Update existing portfolio
      existingPortfolio.set(portfolio);
      await existingPortfolio.save();
    } else {
      // Create new portfolio
      const newPortfolio = new Portfolio({ username, ...portfolio });
      await newPortfolio.save();
    }

    res.status(200).json({ message: "Profile saved successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Failed to save profile.", error });
  }
};

export const getPortfolio = async (req: Request, res: Response) => {
  const { username } = req.params;

  try {
    const portfolio = await Portfolio.findOne({ username });

    if (portfolio) {
      res.status(200).json(portfolio);
    } else {
      res.status(404).json({ message: "Portfolio not found." });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch portfolio.", error });
  }
};

// Change Instructor Password
export const changePortfolioPassword = async (req: Request, res: Response) => {
  const instructorId = req.user?._id; // The authenticated instructor's ID
  const { currentPassword, newPassword } = req.body; // Current and new password

  try {
    // Fetch the instructor's current data
    const instructor = await User.findById(instructorId);
    if (!instructor) {
      return res
        .status(404)
        .json({ success: false, message: "Portfolio not found" });
    }

    // Check if the current password matches the one in the database
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      instructor.password
    );
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Current password is incorrect" });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the password
    instructor.password = hashedNewPassword;
    await instructor.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ success: false, error: error.message });
    } else {
      return res.status(500).json({ success: false, error: "Unknown error" });
    }
  }
};

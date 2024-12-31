import { Request, Response } from "express";
import Complaint from "../models/complaints.model.js";
import { User } from "../models/user.model.js"; // Correct import for named export

// Create Complaint
// const errorMessage = error.message || 'An unknown error occurred';
export const createComplaint = async (req: Request, res: Response) => {
  try {
    const { description, type } = req.body;
    const studentId = req.user?._id;

    if (!description || description.trim().length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Description is required" });
    }

    if (
      !type ||
      !["Enroll", "Withdraw", "Completion", "Other"].includes(type)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid complaint type" });
    }

    if (!studentId) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const student = await User.findById(studentId)
      .select("firstName lastName role")
      .lean();
    if (!student || student.role !== "student") {
      return res
        .status(403)
        .json({
          success: false,
          message: "Only students can create complaints",
        });
    }

    const newComplaint = await Complaint.create({
      student: studentId,
      description: description.trim(),
      type,
      studentDetails: {
        firstName: student.firstName,
        lastName: student.lastName,
      },
    });

    return res.status(201).json({
      success: true,
      complaint: {
        _id: newComplaint._id,
        description: newComplaint.description,
        type: newComplaint.type,
        status: newComplaint.status,
        studentDetails: newComplaint.studentDetails,
        createdAt: newComplaint.createdAt,
        updatedAt: newComplaint.updatedAt,
      },
    });
  } catch (error) {
    console.error("Create complaint error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create complaint",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Get All Complaints (Admin/Staff)
export const getComplaints = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const complaints = await Complaint.find()
      .populate("student", "firstName lastName") // Ensure correct path and field names
      .sort({ createdAt: -1 }) // Optional: Sort by creation date (most recent first)
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    const totalComplaints = await Complaint.countDocuments();

    res.status(200).json({
      success: true,
      complaints,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalComplaints / limit),
        totalComplaints,
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching complaints:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch complaints",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Update Complaint (Student)
export const updateComplaint = async (req: Request, res: Response) => {
  const { id } = req.params; // Extract complaint ID from the route
  const { description, status, type } = req.body; // Extract updates from the request body

  try {
    // Find the complaint by ID
    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res
        .status(404)
        .json({ success: false, message: "Complaint not found" });
    }

    // Apply updates
    if (description) {
      if (description.trim().length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "Description cannot be empty" });
      }
      complaint.description = description.trim();
    }

    if (status) {
      complaint.status = status;
    }

    if (type) {
      if (
        !["Enroll", "Withdraw", "Completion", "Other", "All"].includes(type)
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid complaint type" });
      }
      complaint.type = type;
    }

    // Save the updated complaint
    await complaint.save();

    res.status(200).json({ success: true, complaint });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: "Unknown error" });
    }
  }
};

// Delete Complaint (Admin Only)
export const deleteComplaint = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const complaint = await Complaint.findByIdAndDelete(id);
    if (!complaint) {
      return res
        .status(404)
        .json({ success: false, message: "Complaint not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Complaint deleted successfully" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: "Unknown error" });
    }
  }
};

// Get Student's Own Complaints
export const getStudentComplaints = async (req: Request, res: Response) => {
  try {
    const instructorId = req.user?._id;

    if (!instructorId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Filter complaints optionally based on query params (e.g., status, type)
    const { status, type } = req.query;
    const filter: Record<string, any> = {};

    if (status) {
      filter.status = status;
    }

    if (type) {
      filter.type = type;
    }

    const complaints = await Complaint.find(filter)
      .populate("student", "firstName lastName")
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    res.status(200).json({ success: true, complaints });
  } catch (error: unknown) {
    console.error("Error fetching student complaints:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch student complaints",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteStudentComplaint = async (req: Request, res: Response) => {
  const { id } = req.params;
  const studentId = req.user?._id;

  try {
    // Check if the student is authenticated
    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Find the complaint and ensure it belongs to the student
    const complaint = await Complaint.findOne({
      _id: id,
      student: studentId,
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found or unauthorized",
      });
    }

    // Delete the complaint
    await Complaint.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Complaint deleted successfully",
      deletedComplaint: {
        _id: complaint._id,
        type: complaint.type, // Include the complaint type in the response
        description: complaint.description,
        status: complaint.status,
        createdAt: complaint.createdAt,
        updatedAt: complaint.updatedAt,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ success: false, error: error.message });
    } else {
      return res.status(500).json({ success: false, error: "Unknown error" });
    }
  }
};

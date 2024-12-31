import { Request, Response } from "express";
import { User } from "../models/user.model.js";
import Complaint from "../models/complaints.model.js";
import Course from "../models/course.model.js";
import bcrypt from "bcryptjs";

// ================== Instructor Profile ==================

// Get Instructor Profile
export const getInstructorProfile = async (req: Request, res: Response) => {
  const instructorId = req.user?._id; // The authenticated instructor's ID

  try {
    // Fetch instructor details
    const instructor = await User.findById(instructorId)
      .select("-password")
      .lean(); // Exclude password from the response

    if (!instructor) {
      return res
        .status(404)
        .json({ success: false, message: "Instructor not found" });
    }

    return res.status(200).json({
      success: true,
      instructor,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ success: false, error: error.message });
    } else {
      return res.status(500).json({ success: false, error: "Unknown error" });
    }
  }
};

// ================== Instructor Dashboard ==================

// Get Complaint Statistics for Instructor (Staff Dashboard)
export const getComplaintStatistics = async (req: Request, res: Response) => {
  const instructorId = req.user?._id; // The authenticated instructor's ID

  try {
    // Get total complaints handled by the instructor
    const totalComplaints = await Complaint.countDocuments({
      handledBy: instructorId,
    }).lean();

    // Get total complaints resolved by the instructor
    const resolvedComplaints = await Complaint.countDocuments({
      handledBy: instructorId,
      status: "resolved",
    }).lean();

    // Get total complaints pending
    const pendingComplaints = await Complaint.countDocuments({
      handledBy: instructorId,
      status: "pending",
    }).lean();

    return res.status(200).json({
      success: true,
      statistics: {
        totalComplaints,
        resolvedComplaints,
        pendingComplaints,
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

// Get All Complaints (Instructor can view all complaints they handled)
export const getAllComplaints = async (req: Request, res: Response) => {
  const instructorId = req.user?._id; // The authenticated instructor's ID

  try {
    // Find complaints handled by this instructor
    const complaints = await Complaint.find({ handledBy: instructorId })
      .populate("student", "firstName lastName")
      .populate("courseId", "title courseCode")
      .lean();

    return res.status(200).json({
      success: true,
      complaints,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ success: false, error: error.message });
    } else {
      return res.status(500).json({ success: false, error: "Unknown error" });
    }
  }
};

// Get Instructor Dashboard Data (Summary of courses, student count, etc.)
export const getInstructorDashboardData = async (
  req: Request,
  res: Response
) => {
  const instructorId = req.user?._id; // The authenticated instructor's ID

  try {
    // Find courses taught by this instructor
    const courses = await Course.find({ instructor: instructorId }).lean();

    // Count number of students enrolled in each course
    const courseData = courses.map((course) => ({
      courseId: course._id,
      courseTitle: course.title,
      enrolledStudents: course.students.length,
    }));

    return res.status(200).json({
      success: true,
      dashboardData: {
        totalCourses: courses.length,
        courseData,
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

// ================== Instructor Password Change ==================

// Change Instructor Password
export const changeInstructorPassword = async (req: Request, res: Response) => {
  const instructorId = req.user?._id; // The authenticated instructor's ID
  const { currentPassword, newPassword } = req.body; // Current and new password

  try {
    // Fetch the instructor's current data
    const instructor = await User.findById(instructorId);
    if (!instructor) {
      return res
        .status(404)
        .json({ success: false, message: "Instructor not found" });
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

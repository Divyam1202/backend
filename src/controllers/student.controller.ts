import { Request, Response } from "express";
import { User } from "../models/user.model.js";
import Course from "../models/course.model.js";
import Complaint from "../models/complaints.model.js";
import bcrypt from "bcryptjs";

// ================== Student Profile ==================

// Get Student Profile
export const getStudentProfile = async (req: Request, res: Response) => {
  const studentId = req.user?._id; // The authenticated student's ID

  try {
    // Fetch student details
    const student = await User.findById(studentId).select("-password"); // Exclude password from the response

    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    return res.status(200).json({
      success: true,
      student,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ success: false, error: error.message });
    } else {
      return res.status(500).json({ success: false, error: "Unknown error" });
    }
  }
};

// ================== Student’s Course Statistics ==================

// Get Student’s Course Statistics
export const getStudentCourseStatistics = async (
  req: Request,
  res: Response
) => {
  const studentId = req.user?._id; // The authenticated student's ID

  try {
    // Get all courses the student is enrolled in
    const courses = await Course.find({ students: studentId });

    // Return total courses and completed courses
    const totalCourses = courses.length;
    const completedCourses = courses.filter(
      (course) => course.status === "completed"
    ).length; // No more TypeScript error

    return res.status(200).json({
      success: true,
      statistics: {
        totalCourses,
        completedCourses,
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

// ================== Student Complaints ==================

// Get Student's Complaints
export const getStudentComplaints = async (req: Request, res: Response) => {
  const studentId = req.user?._id; // The authenticated student's ID

  try {
    // Get all complaints made by this student
    const complaints = await Complaint.find({ student: studentId }).populate(
      "courseId",
      "title courseCode"
    );

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

// ================== Update Student Profile ==================

// Update Student Profile
export const updateStudentProfile = async (req: Request, res: Response) => {
  const studentId = req.user?._id; // The authenticated student's ID
  const { firstName, lastName, email, phoneNumber } = req.body; // Fields to update

  try {
    // Find the student by ID
    const student = await User.findById(studentId);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    // Update student details (excluding password)
    student.firstName = firstName || student.firstName;
    student.lastName = lastName || student.lastName;
    student.email = email || student.email;
    student.phoneNumber = phoneNumber || student.phoneNumber;

    // Save the updated student details
    await student.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      student,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ success: false, error: error.message });
    } else {
      return res.status(500).json({ success: false, error: "Unknown error" });
    }
  }
};

// ================== Student Dashboard Data ==================

// Get Student Dashboard Data
export const getStudentDashboardData = async (req: Request, res: Response) => {
  const studentId = req.user?._id; // The authenticated student's ID

  try {
    // Get the student's enrolled courses
    const courses = await Course.find({ students: studentId });

    // Get all complaints filed by the student
    const complaints = await Complaint.find({ student: studentId });

    return res.status(200).json({
      success: true,
      dashboardData: {
        totalCourses: courses.length,
        totalComplaints: complaints.length,
        courses: courses.map((course) => ({
          courseId: course._id,
          courseTitle: course.title,
          courseCode: course.courseCode,
          courseStatus: course.status, // Access the status field
        })),
        complaints: complaints.map((complaint) => ({
          complaintId: complaint._id,
          description: complaint.description,
          status: complaint.status,
        })),
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

// ================== Student Password Change ==================

// Student Password Change
export const changeStudentPassword = async (req: Request, res: Response) => {
  const studentId = req.user?._id; // The authenticated student's ID
  const { currentPassword, newPassword } = req.body; // Current and new password

  try {
    // Fetch the student's current data
    const student = await User.findById(studentId);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    // Check if the current password matches the one in the database
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      student.password
    );
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Current password is incorrect" });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the password
    student.password = hashedNewPassword;
    await student.save();

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

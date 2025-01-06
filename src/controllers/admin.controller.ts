import { Request, Response } from "express";
import { User } from "../models/user.model.js"; // Correct import for named export
import Course from "../models/course.model.js"; // Assuming you have a Course model

// ==================== Admin Actions ====================

// Create new admin user
export const createAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const admin = new User({
      email,
      password,
      firstName,
      lastName,
      role: "admin",
    });

    await admin.save();

    res.status(201).json({
      message: "Admin user created successfully",
      admin: {
        id: admin._id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res
        .status(500)
        .json({ message: "Failed to create admin user", error: error.message });
    } else {
      res.status(500).json({
        message: "Failed to create admin user",
        error: "Unknown error",
      });
    }
  }
};

// ==================== Student Actions ====================

// Create new student
export const createStudent = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    const existingStudent = await User.findOne({ email, role: "student" });
    if (existingStudent) {
      return res.status(400).json({ message: "Student already exists" });
    }

    const student = new User({
      email,
      password,
      firstName,
      lastName,
      role: "student",
    });

    await student.save();

    res.status(201).json({
      message: "Student created successfully",
      student: {
        id: student._id,
        email: student.email,
        firstName: student.firstName,
        lastName: student.lastName,
        role: student.role,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      res
        .status(500)
        .json({ message: "Failed to create student", error: error.message });
    } else {
      res
        .status(500)
        .json({ message: "Failed to create student", error: "Unknown error" });
    }
  }
};

// Get student profile info
export const getStudentProfileInfo = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;

    const student = await User.findById(studentId).populate("courses");

    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({ student });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        message: "Error fetching student profile",
        error: error.message,
      });
    } else {
      res.status(500).json({
        message: "Error fetching student profile",
        error: "Unknown error",
      });
    }
  }
};

// Get all students
export const getAllStudents = async (_req: Request, res: Response) => {
  try {
    const students = await User.find({ role: "student" })
      .select("firstName lastName email")
      .populate("courses");

    res.status(200).json(students);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res
        .status(500)
        .json({ message: "Error fetching students", error: error.message });
    } else {
      res
        .status(500)
        .json({ message: "Error fetching students", error: "Unknown error" });
    }
  }
};

// Delete student
export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;

    const student = await User.findById(studentId);

    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    await student.deleteOne();

    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    if (error instanceof Error) {
      res
        .status(500)
        .json({ message: "Error deleting student", error: error.message });
    } else {
      res
        .status(500)
        .json({ message: "Error deleting student", error: "Unknown error" });
    }
  }
};

// Assign course to student
export const assignCourseToStudent = async (req: Request, res: Response) => {
  try {
    const { studentId, courseId } = req.body;

    if (!studentId || !courseId) {
      return res
        .status(400)
        .json({ message: "Student ID and Course ID are required" });
    }

    const student = await User.findById(studentId);
    const course = await Course.findById(courseId);

    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    student.courses = student.courses ?? []; // Handle case where courses might be undefined
    if (!student.courses.includes(courseId)) {
      student.courses.push(courseId);
      await student.save();
    }

    res.status(200).json({ message: "Course assigned successfully", student });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({
        message: "Error assigning course to student",
        error: error.message,
      });
    } else {
      res.status(500).json({
        message: "Error assigning course to student",
        error: "Unknown error",
      });
    }
  }
};

// Remove course from student
export const removeCourseFromStudent = async (req: Request, res: Response) => {
  try {
    const { studentId, courseId } = req.body;

    if (!studentId || !courseId) {
      return res
        .status(400)
        .json({ message: "Student ID and Course ID are required" });
    }

    const student = await User.findById(studentId);

    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    student.courses =
      student.courses?.filter((course) => course.toString() !== courseId) ?? [];
    await student.save();

    res.status(200).json({ message: "Course removed successfully", student });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({
        message: "Error removing course from student",
        error: error.message,
      });
    } else {
      res.status(500).json({
        message: "Error removing course from student",
        error: "Unknown error",
      });
    }
  }
};

// ==================== Instructor Actions ====================

// Create instructor
export const createInstructor = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    const existingInstructor = await User.findOne({ email });
    if (existingInstructor) {
      return res.status(400).json({ message: "Instructor already exists" });
    }

    const instructor = new User({
      email,
      password,
      firstName,
      lastName,
      role: "instructor",
    });

    await instructor.save();

    res.status(201).json({
      message: "Instructor created successfully",
      instructor,
    });
  } catch (error) {
    if (error instanceof Error) {
      res
        .status(500)
        .json({ message: "Error creating instructor", error: error.message });
    } else {
      res
        .status(500)
        .json({ message: "Error creating instructor", error: "Unknown error" });
    }
  }
};

// Get all instructors
export const getAllInstructors = async (_req: Request, res: Response) => {
  try {
    const instructors = await User.find({ role: "instructor" })
      .select("firstName lastName email")
      .exec();

    if (!instructors || instructors.length === 0) {
      return res.status(404).json({ message: "No instructors found" });
    }

    res.status(200).json(instructors);
  } catch (error) {
    if (error instanceof Error) {
      res
        .status(500)
        .json({ message: "Error fetching instructors", error: error.message });
    } else {
      res.status(500).json({
        message: "Error fetching instructors",
        error: "Unknown error",
      });
    }
  }
};

// Get all courses
export const getAllCourses = async (_req: Request, res: Response) => {
  try {
    const courses = await Course.find()
      .select("name description instructor")
      .populate("instructor", "firstName lastName email") // Populate instructor details
      .exec();

    if (!courses || courses.length === 0) {
      return res.status(404).json({ message: "No courses found" });
    }

    res.status(200).json(courses);
  } catch (error) {
    if (error instanceof Error) {
      res
        .status(500)
        .json({ message: "Error fetching courses", error: error.message });
    } else {
      res
        .status(500)
        .json({ message: "Error fetching courses", error: "Unknown error" });
    }
  }
};
// Delete an instructor
export const deleteInstructor = async (req: Request, res: Response) => {
  try {
    const { instructorId } = req.params;

    // Find the instructor by ID
    const instructor = await User.findById(instructorId);

    if (!instructor || instructor.role !== "instructor") {
      return res.status(404).json({ message: "Instructor not found" });
    }

    // Optionally, you could add logic to check if the instructor has any courses assigned
    // and decide whether to delete them based on your application's business logic.
    // For example:
    // const courses = await Course.find({ instructor: instructorId });
    // if (courses.length > 0) {
    //   return res.status(400).json({ message: "Instructor has courses assigned, cannot delete" });
    // }

    // Delete the instructor
    await instructor.deleteOne();

    res.status(200).json({ message: "Instructor deleted successfully" });
  } catch (error) {
    if (error instanceof Error) {
      res
        .status(500)
        .json({ message: "Error deleting instructor", error: error.message });
    } else {
      res
        .status(500)
        .json({ message: "Error deleting instructor", error: "Unknown error" });
    }
  }
};

// Create a new course (Instructor action)
export const createCourseByInstructor = async (req: Request, res: Response) => {
  try {
    const { instructorId } = req.params; // Instructor's ID
    const { name, description } = req.body;

    // Check if instructor exists
    const instructor = await User.findById(instructorId);
    if (!instructor || instructor.role !== "instructor") {
      return res
        .status(404)
        .json({ message: "Instructor not found or unauthorized" });
    }

    // Create the new course
    const newCourse = new Course({
      name,
      description,
      instructor: instructorId, // Assign course to instructor
    });

    await newCourse.save();

    res
      .status(201)
      .json({ message: "Course created successfully", course: newCourse });
  } catch (error) {
    if (error instanceof Error) {
      res
        .status(500)
        .json({ message: "Error creating course", error: error.message });
    } else {
      res
        .status(500)
        .json({ message: "Error creating course", error: "Unknown error" });
    }
  }
};

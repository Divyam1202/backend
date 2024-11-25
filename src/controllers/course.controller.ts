import { Request, Response } from "express";
import Course from "../models/course.model.js";
import { User } from "../models/user.model.js";
import mongoose, { Schema } from "mongoose";

// ================== Student Course Actions ==================

// Enroll in Course (Students can enroll directly)
export const enrollInCourse = async (req: Request, res: Response) => {
  const studentId = req.user?._id; // Type: string | undefined
  const { courseId } = req.body;  // Type: string | undefined

  // Validate studentId and courseId
  if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid or missing student ID",
    });
  }

  if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid or missing course ID",
    });
  }

  try {
    const studentObjectId = new mongoose.Types.ObjectId(studentId) as unknown as mongoose.Schema.Types.ObjectId;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if the student is already enrolled using .toString() for comparison
    if (course.students.some(student => student.toString() === studentObjectId.toString())) {
      return res.status(400).json({
        success: false,
        message: "You are already enrolled in this course",
      });
    }

    // Enroll the student
    course.students.push(studentObjectId);
    await course.save();

    return res.status(200).json({
      success: true,
      message: "Successfully enrolled in the course",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unexpected error",
    });
  }
};

// Withdraw from Course (Students can withdraw directly)
export const withdrawFromCourse = async (req: Request, res: Response) => {
  const studentId = req.user?._id;

  if (!studentId || typeof studentId !== 'string') {
    return res.status(400).json({ success: false, message: "Student not authenticated" });
  }

  const { courseId } = req.body;
  const studentObjectId = new Schema.Types.ObjectId(studentId);  // Convert string to ObjectId

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    if (!course.students.includes(studentObjectId)) {
      return res.status(400).json({ success: false, message: "You are not enrolled in this course" });
    }

    course.students = course.students.filter(student => student.toString() !== studentObjectId.toString());
    await course.save();

    return res.status(200).json({
      success: true,
      message: "Successfully withdrawn from the course",
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ success: false, error: error.message });
    } else {
      return res.status(500).json({ success: false, error: "Unknown error" });
    }
  }
};

// View Enrolled Courses (Student view their enrolled courses)
export const viewEnrolledCourses = async (req: Request, res: Response) => {
  const studentId = req.user?._id;

  if (!studentId || typeof studentId !== 'string') {
    console.error("Student not authenticated or invalid ID:", studentId);
    return res.status(400).json({ success: false, message: "Student not authenticated" });
  }

  const studentObjectId = new mongoose.Types.ObjectId(studentId); // Convert string to ObjectId

  try {
    console.log("Fetching courses for student:", studentObjectId);
    const courses = await Course.find({ students: studentObjectId });

    if (courses.length === 0) {
      console.log("No courses found for student:", studentObjectId);
      return res.status(404).json({ success: false, message: "No courses found for this student" });
    }

    console.log("Courses found:", courses);
    return res.status(200).json({
      success: true,
      courses,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching courses:", error.message);
      return res.status(500).json({ success: false, error: error.message });
    } else {
      console.error("Unknown error occurred");
      return res.status(500).json({ success: false, error: "Unknown error" });
    }
  }
};


// View All Courses (Students can view courses, not enroll or withdraw directly)
export const viewCourses = async (req: Request, res: Response) => {
  const studentId = req.user?._id;

  if (!studentId || typeof studentId !== 'string') {
    return res.status(400).json({ success: false, message: "Student not authenticated" });
  }

  const studentObjectId = new Schema.Types.ObjectId(studentId);  // Convert string to ObjectId

  try {
    const courses = await Course.find();

    const coursesWithEnrollmentStatus = courses.map(course => ({
      ...course.toObject(),
      isEnrolled: course.students.includes(studentObjectId),
    }));

    return res.status(200).json({
      success: true,
      courses: coursesWithEnrollmentStatus,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ success: false, error: error.message });
    } else {
      return res.status(500).json({ success: false, error: "Unknown error" });
    }
  }
};


// ================== Instructor Course Actions ==================

// Create a Course (Instructors can create courses)
export const createCourse = async (req: Request, res: Response) => {
  const instructorId = req.user?._id; // This is set by the authenticate middleware

  if (!instructorId) {
    return res.status(400).json({ success: false, message: "Instructor not authenticated" });
  }

  const instructorObjectId = new mongoose.Types.ObjectId(instructorId); // Convert string to ObjectId

  const { title, description, courseCode, capacity, modules } = req.body; // No need to destructure 'title' and 'resourceLink' here

  try {
    // Ensure the user is an instructor
    const instructor = await User.findById(instructorObjectId).select("role");
    if (!instructor || instructor.role !== "instructor") {
      return res.status(403).json({ success: false, message: "Only instructors can create courses" });
    }

    // Create the new course
    const newCourse = new Course({
      title,
      description,
      courseCode,
      capacity,
      instructor: instructorObjectId,
      students: [],  // Initialize with an empty array
      modules: modules.map((module: { title: string, resourceLink: string }) => ({
        title: module.title,
        resourceLink: module.resourceLink,
      })),
    });

    await newCourse.save();

    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      course: newCourse,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ success: false, error: error.message });
    } else {
      return res.status(500).json({ success: false, error: "Unknown error" });
    }
  }
};


// View Teacher's Created Courses (Instructor view their own courses)
export const viewTeacherCourses = async (req: Request, res: Response) => {
  const instructorId = req.user?._id;

  if (!instructorId || typeof instructorId !== 'string') {
    return res.status(400).json({ success: false, message: "Instructor not authenticated" });
  }

  const instructorObjectId = new mongoose.Types.ObjectId(instructorId);  // Convert string to ObjectId

  try {
    const courses = await Course.find({ instructor: instructorObjectId });

    if (courses.length === 0) {
      return res.status(404).json({ success: false, message: "No courses found for this instructor" });
    }

    return res.status(200).json({
      success: true,
      courses,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ success: false, error: error.message });
    } else {
      return res.status(500).json({ success: false, error: "Unknown error" });
    }
  }
};

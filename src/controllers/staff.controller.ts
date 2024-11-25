// import { Request, Response } from "express";
// import Leave from "../models/leave.model.js";
// import User from "../models/user.model.js";
// import mongoose from "mongoose";

// // Add interface for authenticated request
// interface AuthRequest extends Request {
//   user?: {
//     _id: string;
//     role: string;
//   };
// }

// // Get staff profile
// export const getStaffProfile = async (req: Request, res: Response) => {
//   try {
//     const staffId = req.user?._id;
//     if (!staffId) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const staff = await User.findById(staffId).select("-password");
//     if (!staff) {
//       return res.status(404).json({ message: "Staff not found" });
//     }

//     res.json(staff);
//   } catch (error) {
//     console.error("Error fetching staff profile:", error);
//     res.status(500).json({ message: "Failed to fetch staff profile" });
//   }
// };

// // Get leave statistics for staff dashboard
// export const getStaffLeaveStats = async (req: Request, res: Response) => {
//   try {
//     const leaves = await Leave.find({});

//     const stats = leaves.reduce(
//       (acc, leave) => {
//         acc.total++;
//         switch (leave.status.toLowerCase()) {
//           case "pending":
//             acc.pending++;
//             break;
//           case "approved":
//             acc.approved++;
//             break;
//         }
//         return acc;
//       },
//       { pending: 0, approved: 0, total: 0 }
//     );

//     res.json(stats);
//   } catch (error) {
//     console.error("Error fetching leave statistics:", error);
//     res.status(500).json({ message: "Failed to fetch leave statistics" });
//   }
// };

// // Get all leaves for staff review
// export const getAllLeaves = async (req: Request, res: Response) => {
//   try {
//     const leaves = await Leave.find({})
//       .sort({ createdAt: -1 })
//       .populate("studentId", "firstName lastName email")
//       .populate("parentReview.reviewedBy", "firstName lastName")
//       .populate("staffReview.reviewedBy", "firstName lastName");

//     res.json(leaves);
//   } catch (error) {
//     console.error("Error fetching leaves:", error);
//     res.status(500).json({ message: "Failed to fetch leaves" });
//   }
// };

// // Get pending leaves for staff review
// export const getPendingLeaves = async (req: Request, res: Response) => {
//   try {
//     const leaves = await Leave.find({ status: "pending" })
//       .sort({ createdAt: -1 })
//       .populate("studentId", "firstName lastName email")
//       .populate("parentReview.reviewedBy", "firstName lastName")
//       .populate("staffReview.reviewedBy", "firstName lastName");

//     res.json(leaves);
//   } catch (error) {
//     console.error("Error fetching pending leaves:", error);
//     res.status(500).json({ message: "Failed to fetch pending leaves" });
//   }
// };

// // Review leave application (approve/reject)
// export const reviewLeave = async (req: AuthRequest, res: Response) => {
//   try {
//     const { leaveId } = req.params;
//     const { action, remarks } = req.body;
//     const staffId = req.user?._id;

//     // Validation checks
//     if (!staffId) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized",
//       });
//     }

//     if (!["approve", "reject"].includes(action)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid action",
//       });
//     }

//     if (!mongoose.Types.ObjectId.isValid(leaveId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid leave ID",
//       });
//     }

//     // Find the leave and use findOneAndUpdate to update it atomically
//     const leave = await Leave.findById(leaveId);
//     if (!leave) {
//       return res.status(404).json({
//         success: false,
//         message: "Leave not found",
//       });
//     }

//     // Check if staff has already reviewed
//     if (leave.staffReview?.status) {
//       return res.status(400).json({
//         success: false,
//         message: "Leave already reviewed by staff",
//       });
//     }

//     try {
//       // Update using findOneAndUpdate to avoid validation issues
//       const updatedLeave = await Leave.findOneAndUpdate(
//         { _id: leaveId },
//         {
//           $set: {
//             "staffReview.status":
//               action === "approve" ? "approved" : "rejected",
//             "staffReview.remarks": remarks || "",
//             "staffReview.reviewedBy": new mongoose.Types.ObjectId(staffId),
//             "staffReview.reviewedAt": new Date(),
//             // Update final status based on both reviews
//             status:
//               leave.parentReview?.status === "approved" && action === "approve"
//                 ? "approved"
//                 : action === "reject" ||
//                   leave.parentReview?.status === "rejected"
//                 ? "rejected"
//                 : "pending",
//           },
//         },
//         {
//           new: true,
//           runValidators: false, // Skip validation for optional fields
//         }
//       )
//         .populate("studentId", "firstName lastName email")
//         .populate("parentReview.reviewedBy", "firstName lastName")
//         .populate("staffReview.reviewedBy", "firstName lastName");

//       if (!updatedLeave) {
//         throw new Error("Failed to update leave");
//       }

//       return res.status(200).json({
//         success: true,
//         message: `Leave ${action}ed successfully`,
//         leave: updatedLeave,
//       });
//     } catch (saveError) {
//       console.error("Error saving leave:", saveError);
//       return res.status(500).json({
//         success: false,
//         message: "Failed to save leave review",
//         error: saveError instanceof Error ? saveError.message : "Unknown error",
//       });
//     }
//   } catch (error) {
//     console.error("Error reviewing leave:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to review leave",
//       error: error instanceof Error ? error.message : "Unknown error",
//     });
//   }
// };

// // Get staff dashboard data
// export const getStaffDashboard = async (req: Request, res: Response) => {
//   try {
//     const staffId = req.user?._id;
//     if (!staffId) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     // Get staff profile
//     const staff = await User.findById(staffId).select("-password");
//     if (!staff) {
//       return res.status(404).json({ message: "Staff not found" });
//     }

//     // Get leave statistics
//     const leaves = await Leave.find({});
//     const stats = leaves.reduce(
//       (acc, leave) => {
//         acc.total++;
//         switch (leave.status.toLowerCase()) {
//           case "pending":
//             acc.pending++;
//             break;
//           case "approved":
//             acc.approved++;
//             break;
//         }
//         return acc;
//       },
//       { pending: 0, approved: 0, total: 0 }
//     );

//     // Get recent leaves
//     const recentLeaves = await Leave.find({})
//       .sort({ createdAt: -1 })
//       .limit(5)
//       .populate("studentId", "firstName lastName email")
//       .populate("reviewedBy", "firstName lastName");

//     res.json({
//       staff,
//       stats,
//       recentLeaves,
//     });
//   } catch (error) {
//     console.error("Error fetching dashboard data:", error);
//     res.status(500).json({ message: "Failed to fetch dashboard data" });
//   }
// };

// export const changestaffPassword = async (req: Request, res: Response) => {
//   try {
//     const staffId = req.user?._id;
//     if (!staffId) {
//       // return res.status(401).json({ message: "Unauthorized" });
//     }
//     const { currentPassword, newPassword } = req.body;

//     const staff = await User.findById(staffId);
//     if (!staff) {
//       return res.status(404).json({ message: "Staff not found" });
//     }

//     const isMatch = await staff.comparePassword(currentPassword);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Current password is incorrect" });
//     }

//     staff.password = newPassword;
//     await staff.save();

//     res.json({ message: "Password updated successfully" });
//   } catch (error) {
//     console.error("Error changing staff password:", error);
//     res.status(500).json({ message: "Failed to change staff password" });
//   }
// };

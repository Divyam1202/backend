// import { Request, Response } from "express";
// import User, { IUser } from "../models/user.model.js";
// import Leave from "../models/leave.model.js";
// import mongoose from "mongoose";

// // Add type for the authenticated request
// interface AuthRequest extends Request {
//   user?: {
//     _id: string;
//     role: string;
//   };
// }

// export const getChildStats = async (req: AuthRequest, res: Response) => {
//   try {
//     const parentId = req.user?._id;

//     // Find parent and their children
//     const parent = await User.findOne({
//       _id: parentId,
//       role: "parent",
//     });

//     if (!parent) {
//       return res.status(404).json({ message: "Parent not found" });
//     }

//     // Find all children using parent's children array
//     const children = await User.find({
//       _id: { $in: parent.children },
//       role: "student",
//     });

//     if (!children.length) {
//       return res.status(404).json({ message: "No children found" });
//     }

//     // Get leave statistics for all children
//     const childrenStats = await Promise.all(
//       children.map(async (child) => {
//         const leaves = await Leave.find({ studentId: child._id });

//         return {
//           childName: `${child.firstName} ${child.lastName}`,
//           roomNumber: child.roomNumber,
//           totalLeaves: leaves.length,
//           pendingLeaves: leaves.filter((leave) => leave.status === "pending")
//             .length,
//           approvedLeaves: leaves.filter((leave) => leave.status === "approved")
//             .length,
//         };
//       })
//     );

//     res.status(200).json({ children: childrenStats });
//   } catch (error) {
//     console.error("Error in getChildStats:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// export const getChildInfo = async (req: AuthRequest, res: Response) => {
//   try {
//     const parentId = req.user?._id;

//     const parent = await User.findOne({
//       _id: parentId,
//       role: "parent",
//     });

//     if (!parent) {
//       return res.status(404).json({ message: "Parent not found" });
//     }

//     const child = await User.findOne({
//       _id: { $in: parent.children },
//       role: "student",
//     }).select("-password");

//     if (!child) {
//       return res.status(404).json({ message: "Child not found" });
//     }

//     res.status(200).json(child);
//   } catch (error) {
//     console.error("Error in getChildInfo:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// export const getChildLeaves = async (req: AuthRequest, res: Response) => {
//   try {
//     const parentId = req.user?._id;

//     const parent = await User.findOne({
//       _id: parentId,
//       role: "parent",
//     });

//     if (!parent) {
//       return res.status(404).json({ message: "Parent not found" });
//     }

//     // Find all children
//     const children = await User.find({
//       _id: { $in: parent.children },
//       role: "student",
//     });

//     if (!children.length) {
//       return res.status(404).json({ message: "No children found" });
//     }

//     // Get leaves for all children
//     const leaves = await Leave.find({
//       studentId: { $in: children.map((child) => child._id) },
//     })
//       .sort({ createdAt: -1 })
//       .populate("studentId", "firstName lastName email")
//       .populate("parentReview.reviewedBy", "firstName lastName")
//       .populate("staffReview.reviewedBy", "firstName lastName");

//     res.status(200).json(leaves);
//   } catch (error) {
//     console.error("Error in getChildLeaves:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// export const getParentProfile = async (req: AuthRequest, res: Response) => {
//   try {
//     const parentId = req.user?._id;

//     const parent = await User.findOne({
//       _id: parentId,
//       role: "parent",
//     })
//       .select("-password")
//       .populate({
//         path: "children",
//         select: "-password",
//         match: { role: "student" },
//       });

//     if (!parent) {
//       return res.status(404).json({ message: "Parent not found" });
//     }

//     res.status(200).json(parent);
//   } catch (error) {
//     console.error("Error in getParentProfile:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// export const getDashboardInfo = async (req: AuthRequest, res: Response) => {
//   try {
//     const parentId = req.user?._id;

//     const parent = await User.findOne({
//       _id: parentId,
//       role: "parent",
//     });

//     if (!parent) {
//       return res.status(404).json({ message: "Parent not found" });
//     }

//     const child = await User.findOne({
//       _id: { $in: parent.children },
//       role: "student",
//     });

//     if (!child) {
//       return res.status(404).json({ message: "Child not found" });
//     }

//     // Get all required dashboard information
//     const [recentLeaves] = await Promise.all([
//       Leave.find({ studentId: child._id }).sort({ createdAt: -1 }).limit(5),
//     ]);

//     const dashboardInfo = {
//       parent: await User.findById(parentId).select("-password"),
//       child: child.toObject(),
//       recentLeaves,
//     };

//     res.status(200).json(dashboardInfo);
//   } catch (error) {
//     console.error("Error in getDashboardInfo:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// export const updateParentProfile = async (req: AuthRequest, res: Response) => {
//   try {
//     const parentId = req.user?._id;
//     const updates = req.body;

//     // Remove sensitive fields from updates
//     delete updates.password;
//     delete updates.children;
//     delete updates.role;

//     const updatedParent = await User.findOneAndUpdate(
//       { _id: parentId, role: "parent" },
//       { $set: updates },
//       { new: true }
//     ).select("-password");

//     if (!updatedParent) {
//       return res.status(404).json({ message: "Parent not found" });
//     }

//     res.status(200).json(updatedParent);
//   } catch (error) {
//     console.error("Error in updateParentProfile:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// export const reviewLeave = async (req: AuthRequest, res: Response) => {
//   try {
//     const { leaveId } = req.params;
//     const { action, remarks } = req.body;
//     const parentId = req.user?._id;

//     if (!parentId) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     if (!["approve", "reject"].includes(action)) {
//       return res.status(400).json({ message: "Invalid action" });
//     }

//     // Find the leave and verify it belongs to parent's child
//     const parent = await User.findOne({ _id: parentId, role: "parent" });
//     if (!parent) {
//       return res.status(404).json({ message: "Parent not found" });
//     }

//     const leave = await Leave.findOne({
//       _id: leaveId,
//       studentId: { $in: parent.children },
//     });

//     if (!leave) {
//       return res
//         .status(404)
//         .json({ message: "Leave not found or unauthorized" });
//     }

//     if (leave.status !== "pending") {
//       return res.status(400).json({ message: "Leave already reviewed" });
//     }

//     // Update parent review status with converted ObjectId
//     leave.parentReview = {
//       status: action === "approve" ? "approved" : "rejected",
//       remarks: remarks,
//       reviewedBy: new mongoose.Types.ObjectId(parentId),
//       reviewedAt: new Date(),
//     };

//     // Only update the final status if both parent and staff have approved
//     if (leave.staffReview?.status === "approved" && action === "approve") {
//       leave.status = "approved";
//     } else if (action === "reject") {
//       leave.status = "rejected";
//     } else {
//       leave.status = "pending"; // Keep pending if waiting for other approval
//     }

//     await leave.save();

//     res.json({ message: `Leave ${action}ed by parent`, leave });
//   } catch (error) {
//     console.error("Error reviewing leave:", error);
//     res.status(500).json({ message: "Failed to review leave" });
//   }
// };

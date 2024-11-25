// import { Request, Response, NextFunction } from "express";
// import Leave from "../models/leave.model.js";
// import mongoose from "mongoose";

// export const validateLeaveReview = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const { leaveId } = req.params;
//     const { action, remarks } = req.body;

//     // Validate leaveId
//     if (!mongoose.Types.ObjectId.isValid(leaveId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid leave ID",
//       });
//     }

//     // Validate action
//     if (!["approve", "reject"].includes(action)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid action. Must be either 'approve' or 'reject'",
//       });
//     }

//     // Validate remarks
//     if (typeof remarks !== "string") {
//       return res.status(400).json({
//         success: false,
//         message: "Remarks must be a string",
//       });
//     }

//     // Find leave
//     const leave = await Leave.findById(leaveId);
//     if (!leave) {
//       return res.status(404).json({
//         success: false,
//         message: "Leave not found",
//       });
//     }

//     // Check if leave is already reviewed
//     if (leave.status !== "pending") {
//       return res.status(400).json({
//         success: false,
//         message: "Leave has already been reviewed",
//       });
//     }

//     next();
//   } catch (error) {
//     console.error("Leave review validation error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };

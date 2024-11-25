// import mongoose from "mongoose";

// const reviewSchema = new mongoose.Schema({
//   status: {
//     type: String,
//     enum: ["pending", "approved", "rejected"],
//     default: "pending",
//   },
//   remarks: {
//     type: String,
//     default: "",
//   },
//   reviewedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//   },
//   reviewedAt: {
//     type: Date,
//     default: null,
//   },
// });

// const leaveSchema = new mongoose.Schema(
//   {
//     studentId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     startDate: {
//       type: Date,
//       required: true,
//     },
//     endDate: {
//       type: Date,
//       required: true,
//     },
//     reason: {
//       type: String,
//       required: true,
//     },
//     leaveType: {
//       type: String,
//       default: "regular",
//     },
//     contactNumber: {
//       type: String,
//       default: "",
//     },
//     parentContact: {
//       type: String,
//       default: "",
//     },
//     address: {
//       type: String,
//       default: "",
//     },
//     status: {
//       type: String,
//       enum: ["pending", "approved", "rejected"],
//       default: "pending",
//     },
//     parentReview: reviewSchema,
//     staffReview: reviewSchema,
//   },
//   { timestamps: true }
// );

// const Leave = mongoose.model("Leave", leaveSchema);

// export default Leave;

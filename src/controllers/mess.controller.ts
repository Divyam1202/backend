// import { Request, Response } from "express";
// import { v2 as cloudinary } from "cloudinary";
// import { MessPhoto } from "../models/mess.model.js";
// import User from "../models/user.model.js";

// // Staff or Admin uploads/replaces a photo
// export const uploadMessPhoto = async (req: Request, res: Response) => {
//   const { description } = req.body;
//   const userId = req.user?._id;
//   const role = req.user?.role;
//   if (role !== "admin" && role !== "staff") {
//     return res.status(403).json({ message: "Permission denied." });
//   }

//   // Find existing photo
//   let messPhoto = await MessPhoto.findOne();
//   if (!req.file) {
//     return res.status(400).json({ message: "No file uploaded." });
//   }

//   try {
//     // Upload to Cloudinary
//     const uploadedPhoto = await cloudinary.uploader.upload(req.file.path, {
//       folder: "mess_photos", // Folder for mess photos in Cloudinary
//     });

//     // Check if there's an existing photo to replace
//     let messPhoto = await MessPhoto.findOne();

//     if (messPhoto) {
//       // Replace the existing photo in Cloudinary
//       await cloudinary.uploader.destroy(messPhoto.publicId); // Remove old photo
//       messPhoto.url = uploadedPhoto.secure_url;
//       messPhoto.publicId = uploadedPhoto.public_id;
//       messPhoto.updatedAt = new Date();
//       messPhoto.description = description;
//     } else {
//       // Create a new photo entry
//       messPhoto = new MessPhoto({
//         url: uploadedPhoto.secure_url,
//         publicId: uploadedPhoto.public_id,
//         uploadedBy: req.user?._id, // User who uploaded
//         description,
//       });
//     }

//     await messPhoto.save();
//     res
//       .status(200)
//       .json({ message: "Photo uploaded successfully.", messPhoto });
//   } catch (err) {
//     res
//       .status(500)
//       .json({
//         message: "Error uploading photo.",
//         error: err instanceof Error ? err.message : "Unknown error",
//       });
//   }
// };

// // View Mess Photo (Students)
// export const getMessPhoto = async (req: Request, res: Response) => {
//   try {
//     const messPhoto = await MessPhoto.findOne();
//     if (!messPhoto)
//       return res.status(404).json({ message: "No mess photo found." });

//     if (!messPhoto.publicId || typeof messPhoto.publicId !== "string") {
//       return res.status(500).json({
//         message: "Invalid photo data: Missing or invalid publicId",
//         messPhoto,
//       });
//     }
//     res.status(200).json(messPhoto);
//   } catch (err) {
//     res
//       .status(500)
//       .json({
//         message: "Error fetching mess photo.",
//         error: err instanceof Error ? err.message : "Unknown error",
//       });
//   }
// };

// // Delete Mess Photo (Admin Only)
// export const deleteMessPhoto = async (req: Request, res: Response) => {
//   const role = req.user?.role;

//   if (role !== "admin") {
//     return res.status(403).json({ message: "Permission denied." });
//   }

//   try {
//     const messPhoto = await MessPhoto.findOne();
//     if (!messPhoto)
//       return res.status(404).json({ message: "No mess photo found." });

//     // Delete from Cloudinary
//     await cloudinary.uploader.destroy(messPhoto.publicId);

//     // Remove from DB
//     await MessPhoto.deleteOne({ _id: messPhoto._id });

//     res.status(200).json({ message: "Mess photo deleted successfully." });
//   } catch (err) {
//     res
//       .status(500)
//       .json({
//         message: "Error deleting photo.",
//         error: err instanceof Error ? err.message : "Unknown error",
//       });
//   }
// };

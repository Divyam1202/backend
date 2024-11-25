// import multer from "multer";
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";

// // Simulate __dirname for ESM
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// export const configureMulter = (folder: string) => {
//   const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       const uploadPath = path.join(__dirname, `../uploads/${folder}`);
//       // Check if the directory exists, and create it if not
//       if (!fs.existsSync(uploadPath)) {
//         fs.mkdirSync(uploadPath, { recursive: true });
//       }
//       cb(null, uploadPath);
//     },
//     filename: function (req, file, cb) {
//       cb(null, `${Date.now()}-${file.originalname}`);
//     },
//   });

//   return multer({ storage });
// };

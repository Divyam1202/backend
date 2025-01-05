import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.routes.js";
import courseRoutes from "./routes/course.routes.js";
import passwordroutes from "./routes/passwordreset.routes.js";
import quizRoutes from "./routes/quiz.routes.js";
import complaintRoutes from "./routes/complaint.routes.js";
import http from "http";

// Configure dotenv
dotenv.config();

const app = express();

// Middleware
app.use(cors());
// app.use(
//   cors({
//     origin: "https://lmsxport-frontend.vercel.app/",
//     credentials: true,
//   })
// );

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/password", passwordroutes);
app.use("/api/quiz", quizRoutes);

// Database connection
mongoose
  .connect(process.env.MONGODB_URI || "")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Basic error handling middleware
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
  }
);

const PORT = process.env.PORT || "5000";
const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

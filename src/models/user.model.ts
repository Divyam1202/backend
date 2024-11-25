import mongoose, { Schema, Document} from "mongoose";
import bcrypt from "bcryptjs"; // Correct default import of bcryptjs

// Define the interface for User document, which extends mongoose.Document
export interface IUser extends mongoose.Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "admin" | "student" | "instructor";
  courses?: string[];
  phoneNumber?: string;
  // educationLevel: "Select Education Level" | "High School" | "Bachelor's Degree" | "Master's Degree" | "Ph.D." | "Other";
  // areaOfInterest: string[];
  comparePassword(candidatePassword: string): Promise<boolean>;
}
// Define the user schema
const userSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "student", "instructor"],
      required: true,
      default: "student",
    },
    // educationLevel: {
    //   type: String,
    //   enum: ["Select Education Level", "High School", "Bachelor's Degree", "Master's Degree", "Ph.D.", "Other"],
    //   required: true,
    //   default: "Select Education Level",
    // },
    // areaOfInterest: {
    //   type: [String],
    //   enum: [
    //     "Web Development",
    //     "Data Science",
    //     "Mobile Development",
    //     "AI/ML",
    //     "Business",
    //     "Design",
    //     "Marketing",
    //   ],
    //   required: true,
    //   default: [],
    //   validate: {
    //     validator: function (value: string[]): boolean {
    //       return value.length > 0; // Ensure at least one selection
    //     },
    //     message: "You must select at least one area of interest.",
    //   },
    // },
    
  },
  {
    timestamps: true,
  }
);



// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Export the models
export const User = mongoose.model<IUser>("User", userSchema);


// // In your course model
// interface ICourse extends Document {
//   title: string;
//   description: string;
//   courseCode: string;
//   instructor: string; // Could be an ObjectId, depending on your model
//   students: Schema.Types.ObjectId[];  // Array of student ObjectIds
//   status: string; // This should include the 'status' property
//   capacity: number;
// }
// // Define the course schema
// const courseSchema = new mongoose.Schema<ICourse>({
//   title: {
//     type: String,
//     required: true,
//   },
//   courseCode: {
//     type: String,
//     required: true,
//   },
//   students: [
//     {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },
//   ],
//   status: {
//     type: String,
//     required: true,
//     status: { type: String, enum: ['ongoing', 'completed'], default: 'ongoing' },
//   },
// });
// export const Course = mongoose.model<ICourse>("Course", courseSchema);

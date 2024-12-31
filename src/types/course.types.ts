// src/types/course.types.ts
import { Document, Types } from 'mongoose';

export interface Module {
  title: string;
  resourceLink: string;
}

export interface ProgressEntry {
  student: Types.ObjectId;
  progress: number;
  lastPlayedModule?: string | null;
}

export interface ICourse extends Document {
  title: string;
  description: string;
  courseCode: string;
  capacity: number;
  instructor: Types.ObjectId;
  students: Types.ObjectId[];
  status: string;
  modules: Module[];
  progress: ProgressEntry[];
}

export interface PlayCourseResponse {
  success: boolean;
  message: string;
  course?: {
    title: string;
    description: string;
    courseCode: string;
    modules: { title: string; resourceLink: string }[];
  };
}
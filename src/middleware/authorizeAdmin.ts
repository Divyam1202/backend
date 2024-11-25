import { Request, Response, NextFunction } from "express";

export const authorizeAdmin = (req: Request, res: Response, next: NextFunction) => {
  const userRole = req.user?.role;
  if (userRole !== "admin") {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }
  next();
};

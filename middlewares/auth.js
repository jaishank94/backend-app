import { User } from "../models/user.js";
import ErrorHandler from "../utils/error.js";
import jwt from "jsonwebtoken";
import { asyncError } from "./error.js";
import { roleHierarchy } from "../constants/index.js";

export const isAuthenticated = asyncError(async (req, res, next) => {
  let token = req.cookies.token || req.headers.authorization.split(' ')[1];
  if (!token) return next(new ErrorHandler("Not Logged In", 401));
  const decodedData = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decodedData._id);
  next();
});

export const checkRole = (role) => asyncError(async (req, res, next) => {
  const userRole = req.user.role;  
  if (![...roleHierarchy[role]].includes(userRole)) {
    return next(new ErrorHandler("You are not authorized for this action", 401));
  }
  next();
});

export const isAdmin = asyncError(async (req, res, next) => {
  if (req.user.role !== "admin")
    return next(new ErrorHandler("Only Admin allowed", 401));
  next();
});

import express from "express";
import {
  changePassword,
  forgetpassword,
  getMyProfile,
  login,
  logOut,
  resetpassword,
  signup,
  updatePic,
  updateProfile,
} from "../controllers/user.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { singleUpload } from "../middlewares/multer.js";
import validate from "../middlewares/validate.js";
import { loginValidator, passwordUpdateValidator, signupValidator, userUpdateValidator } from '../validators/user.js';
const router = express.Router();

router.post("/login", [validate(loginValidator)], login);
router.post("/signup", [validate(signupValidator), singleUpload], signup);
router.get("/profile", isAuthenticated, getMyProfile);

router.get("/logout", isAuthenticated, logOut);

// Updating Routes
router.put("/profile", [validate(userUpdateValidator), isAuthenticated], updateProfile);
router.put("/password", [validate(passwordUpdateValidator), isAuthenticated], changePassword);
router.put("/update-pic", isAuthenticated, singleUpload, updatePic);

// Forget Password & Reset Password
router.route("/forgot-password").post(forgetpassword).put(resetpassword);

export default router;

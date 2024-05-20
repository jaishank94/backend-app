import express from "express";
import { applyCoupon } from "../controllers/coupon.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.get("/applyCoupon", isAuthenticated, applyCoupon);

export default router;

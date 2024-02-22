import express from "express";
import {
  getCoupons,
  createCoupon,
  getCouponById,
  updateCoupon,
  deleteCoupon,
} from "../controllers/coupon.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.get("/coupons", isAuthenticated, getCoupons);
router.get("/coupons/:id", isAuthenticated, getCouponById);

export default router;

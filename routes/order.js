import express from "express";
import {
  createOrder,
  getVendorOrders,
  getMyOrders,
  getOrderDetails,
  processOrder,
} from "../controllers/order.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { authenticationAndAnalyticsWrapped } from "../middlewares/index.js";

const router = express.Router();

router.post("/new", authenticationAndAnalyticsWrapped, createOrder);

router.get("/my", isAuthenticated, getMyOrders);
router.get("/admin", isAuthenticated, getVendorOrders);

router
  .route("/single/:id").get(isAuthenticated, getOrderDetails).put(authenticationAndAnalyticsWrapped, processOrder);

export default router;

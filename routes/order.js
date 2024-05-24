import express from "express";
import {
  createOrder,
  getAdminOrders,
  getMyOrders,
  getOrderDetails,
  proccessOrder,
} from "../controllers/order.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { authenticationAndAnalyticsWrapped } from "../middlewares/index.js";

const router = express.Router();

router.post("/new", authenticationAndAnalyticsWrapped, createOrder);

router.get("/my", authenticationAndAnalyticsWrapped, getMyOrders);
router.get("/admin", isAuthenticated, getAdminOrders);

router
  .route("/single/:id").get(isAuthenticated, getOrderDetails).put(authenticationAndAnalyticsWrapped, proccessOrder);

export default router;

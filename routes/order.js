import express from "express";
import {
  createOrder,
  getAdminOrders,
  getMyOrders,
  getOrderDetails,
  proccessOrder,
  processPayment,
} from "../controllers/order.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/new", isAuthenticated, createOrder);
router.post("/payment", isAuthenticated, processPayment);

router.get("/my", isAuthenticated, getMyOrders);
router.get("/admin", isAuthenticated, getAdminOrders);

router
  .route("/single/:id")
  .get(isAuthenticated, getOrderDetails)
  .put(isAuthenticated, proccessOrder);

export default router;

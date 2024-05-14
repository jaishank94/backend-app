import express from "express";
import {
  updateUserRole,
  getAllUsers,
  updateUser,
  deleteUser,
  restoreUser,
  getProducts,
  updateProduct,
  deleteProduct,
  getProductById,
  getOrders,
  updateOrder,
  updateOrderStatus,
  getPayments,
  getPaymentDetails,
  createPayment
} from "../controllers/admin.js";

import { checkRole } from "../middlewares/auth.js";
import { ROLES } from "../constants/index.js";
import { authenticationAndAnalyticsWrapped } from "../middlewares/index.js";
const { superadmin, admin } = ROLES;

const router = express.Router();

// Set user role: Only allowed for superadmin
router.put(
  "/user/role", 
  [authenticationAndAnalyticsWrapped, checkRole(superadmin)], 
  updateUserRole
);

// Get all users
router.get(
  "/user", 
  [authenticationAndAnalyticsWrapped, checkRole(admin)], 
  getAllUsers
);

// Update user
router.put(
  "/user/:userId",
  [authenticationAndAnalyticsWrapped, checkRole(admin)], 
  updateUser
);

// Delete user
router.delete(
  "/user/:userId",
  [authenticationAndAnalyticsWrapped, checkRole(admin)],
  deleteUser
);

// Restore deleted user
router.put(
  "/user/:userId/restore",
  [authenticationAndAnalyticsWrapped, checkRole(admin)],
  restoreUser
);

// get products
router.get(
  "/product",
  [authenticationAndAnalyticsWrapped, checkRole(admin)],
  getProducts
);

// get products
router.get(
  "/product/:productId",
  [authenticationAndAnalyticsWrapped, checkRole(admin)],
  getProductById
);

// update products
router.put(
  "/product/:productId",
  [authenticationAndAnalyticsWrapped, checkRole(admin)],
  updateProduct
);

// delete products
router.delete(
  "/product/:productId",
  [authenticationAndAnalyticsWrapped, checkRole(admin)],
  deleteProduct
);

// get orders
router.get(
  "/order",
  [authenticationAndAnalyticsWrapped, checkRole(admin)],
  getOrders
);

// update orders before execution
router.put(
  "/order/:orderId", 
  [authenticationAndAnalyticsWrapped, checkRole(admin)], 
  updateOrder
);

// change order status
router.put(
  "/order/:orderId/status", 
  [authenticationAndAnalyticsWrapped, checkRole(admin)], 
  updateOrderStatus
);

// get payments
router.post(
  "/payment",
  [authenticationAndAnalyticsWrapped, checkRole(admin)],
  createPayment
);


// get payments
router.get(
  "/payment",
  [authenticationAndAnalyticsWrapped, checkRole(admin)],
  getPayments
);

// update payments before execution
router.get(
  "/payment/:paymentId", 
  [authenticationAndAnalyticsWrapped, checkRole(admin)], 
  getPaymentDetails
);
export default router;

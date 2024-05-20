import express from "express";
import { 
  createCartAndAddItems, 
  updateCartItems, 
  getCartItems, 
  deleteCart 
} from "../controllers/cart.js";
import { authenticationAndAnalyticsWrapped } from "../middlewares/index.js";

const router = express.Router();

router.post("/", authenticationAndAnalyticsWrapped, createCartAndAddItems);
router.put("/:cartId", authenticationAndAnalyticsWrapped, updateCartItems);
router.get("/:cartId", authenticationAndAnalyticsWrapped, getCartItems);
router.delete("/:cartId", authenticationAndAnalyticsWrapped, deleteCart);



export default router;

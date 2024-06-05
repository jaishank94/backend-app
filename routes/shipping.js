import express from "express";
import { checkServiceability, generateToken, courierListWithCounts, createCustomOrder, getShippingOrders, getShippingOrdersDetails } from "../controllers/shipping.js";
const router = express.Router();

router.post('/login', generateToken);
router.get('/courier/serviceability', checkServiceability);
router.get('/courier/list', courierListWithCounts);
router.post('/orders/create/adhoc', createCustomOrder);
router.get('/orders', getShippingOrders);
router.get('/orders/show/:orderId', getShippingOrdersDetails);

export default router;
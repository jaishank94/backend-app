import express from "express";
import { checkServiceability, generateToken, courierListWithCounts, createCustomOrder, getShippingOrders, getShippingOrdersDetails, getChannelDetails, createChannelSpecificOrder, updateOrder, changePickupAddress, changeDeliveryAddress, cancelOrder, getShipmentDetails, generateAWB, requestPickup, generateManifest, trackWithAWB, trackMultipleAWB, trackWithShipmentId, trackWithOrderId } from "../controllers/shipping.js";
const router = express.Router();

router.post('/login', generateToken);
router.get('/courier/serviceability', checkServiceability);
router.get('/courier/list', courierListWithCounts);
router.get('/channels', getChannelDetails);

router.post('/orders/create/adhoc', createCustomOrder);
router.post('/orders/create/channel', createChannelSpecificOrder);
router.post('/orders/update/adhoc', updateOrder);
router.patch('/orders/address/pickup', changePickupAddress);
router.put('/orders/address/delivery', changeDeliveryAddress);
router.post('/orders/cancel', cancelOrder);
router.get('/orders', getShippingOrders);
router.get('/orders/show/:orderId', getShippingOrdersDetails);

router.get('/shipments', getShipmentDetails);
router.post('/courier/assign/awb', generateAWB);  // KYC required for generating AWB
router.post('/shipments/pickup', requestPickup); // Successful only after AWB is generated
router.post('/shipments/manifests/generate', generateManifest); // To be called immediately after pickup is requested

router.get('/courier/track/awb/:awb', trackWithAWB);
router.post('/courier/track/awbs', trackMultipleAWB);
router.get('/courier/track/shipment/:shipmentId', trackWithShipmentId);
router.get('/courier/track', trackWithOrderId);


export default router;
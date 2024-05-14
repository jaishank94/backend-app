import express from "express";
import bodyParser from 'body-parser';
import { 
  confirmPaymentIntent, 
  createPaymentIntent, 
  createSessionCheckout, 
  initiatePayment, 
  stripeWebhooks,
  initateRefund,
  phonepeCreatePayment,
  cashfreeCreateCheckoutSession,
  cashfreeCheckPaymentStatus,
  cashfreeCheckPaymentSettlements,
  cashfreeAddBeneficiary,
  cashfreeGetBeneficiary
} from "../controllers/payment.js";
import { authenticationAndAnalyticsWrapped } from "../middlewares/index.js";

const router = express.Router();

router.post("/charge", authenticationAndAnalyticsWrapped, initiatePayment);

router.post("/webhooks", bodyParser.raw({type: 'application/json'}), stripeWebhooks);


router.post("/createPaymentIntent", authenticationAndAnalyticsWrapped, createPaymentIntent);
router.post("/confirmPaymentIntent", authenticationAndAnalyticsWrapped, confirmPaymentIntent);

// use this STRIPE - card
router.post("/createSessionCheckout", authenticationAndAnalyticsWrapped, createSessionCheckout);
router.post("/initiateRefund", authenticationAndAnalyticsWrapped, initateRefund);

// PHONEPE - upi
router.post('/phonepe/pay', authenticationAndAnalyticsWrapped, phonepeCreatePayment);

// CASHFREE
router.post('/cashfree/checkoutSession', authenticationAndAnalyticsWrapped, cashfreeCreateCheckoutSession);
router.get('/cashfree/status/:orderId', authenticationAndAnalyticsWrapped, cashfreeCheckPaymentStatus);
router.get('/cashfree/status/:orderId/settlements', authenticationAndAnalyticsWrapped, cashfreeCheckPaymentSettlements);
router.post('/cashfree/payout/beneficiary', authenticationAndAnalyticsWrapped, cashfreeAddBeneficiary);
router.get('/cashfree/payout/beneficiary', authenticationAndAnalyticsWrapped, cashfreeGetBeneficiary);





export default router;
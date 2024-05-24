import express from "express";
import bodyParser from 'body-parser';
import { 
  confirmPaymentIntent, 
  createPaymentIntent, 
  createSessionCheckout, 
  initiatePayment, 
  stripeWebhooks,
  initateRefund,
  // cashfreeCreateCheckoutSession,
  // cashfreeCheckPaymentStatus,
  // cashfreeCheckPaymentSettlements,
  // cashfreeAddBeneficiary,
  // cashfreeGetBeneficiaries,
  // cashfreeGetBeneficiaryDetails,
  // cashfreeDirectBankTransfer,
  // cashfreeGetDirectTransferStatus,
  razorpayCreateOrder,
  razorpayFetchOrders,
  razorpayGetPaymentsList,
  razorpayCapturePayment,
  razorpayGetPaymentDetails,
  razorpayPaymentLink,
  razorpayInitiateRefund,
  razorpayVendorPayout,
  razorpayCreateFundAccount,
  razorpayCreateCustomer,
  razorpayGetCustomers,
  razorpayGetFundAccount,
  razorpayXCreateCustomer,
  razorpayXGetCustomers,
  razorpayXGetCustomerById,
  razorpayXCreateFundAccount,
  razorpayXGetFundAccount,
  razorpayXGetFundByCustomerId,
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

// CASHFREE
// router.post('/cashfree/checkoutSession', authenticationAndAnalyticsWrapped, cashfreeCreateCheckoutSession);
// router.get('/cashfree/status/:orderId', authenticationAndAnalyticsWrapped, cashfreeCheckPaymentStatus);
// router.get('/cashfree/status/:orderId/settlements', authenticationAndAnalyticsWrapped, cashfreeCheckPaymentSettlements);
// router.post('/cashfree/payout/beneficiary', authenticationAndAnalyticsWrapped, cashfreeAddBeneficiary);
// router.get('/cashfree/payout/beneficiary', authenticationAndAnalyticsWrapped, cashfreeGetBeneficiaries);
// router.get('/cashfree/payout/beneficiary/:beneficiaryId', authenticationAndAnalyticsWrapped, cashfreeGetBeneficiaryDetails);
// router.post('/cashfree/payout/directTransfer', authenticationAndAnalyticsWrapped, cashfreeDirectBankTransfer);
// router.get('/cashfree/payout/directTransfer/status', authenticationAndAnalyticsWrapped, cashfreeGetDirectTransferStatus);

// RAZORPAY
router.post('/razorpay/customer', authenticationAndAnalyticsWrapped, razorpayCreateCustomer);
router.get('/razorpay/customers', authenticationAndAnalyticsWrapped, razorpayGetCustomers);
router.post('/razorpay/fundAccount', authenticationAndAnalyticsWrapped, razorpayCreateFundAccount);
router.get('/razorpay/fundAccount/:customerId', authenticationAndAnalyticsWrapped, razorpayGetFundAccount);
router.post('/razorpay/orders', authenticationAndAnalyticsWrapped, razorpayCreateOrder);
router.get('/razorpay/orders', authenticationAndAnalyticsWrapped, razorpayFetchOrders);
router.post('/razorpay/capture', authenticationAndAnalyticsWrapped, razorpayCapturePayment);
router.post('/razorpay/paymentLink', authenticationAndAnalyticsWrapped, razorpayPaymentLink);
router.get('/razorpay/list', authenticationAndAnalyticsWrapped, razorpayGetPaymentsList);
router.post('/razorpay/refund', authenticationAndAnalyticsWrapped, razorpayInitiateRefund);

router.post('/razorpay/x/customer', authenticationAndAnalyticsWrapped, razorpayXCreateCustomer);
router.get('/razorpay/x/customers', authenticationAndAnalyticsWrapped, razorpayXGetCustomers);
router.get('/razorpay/x/customer/:customerId', authenticationAndAnalyticsWrapped, razorpayXGetCustomerById);
router.post('/razorpay/x/fundAccount', authenticationAndAnalyticsWrapped, razorpayXCreateFundAccount);
router.get('/razorpay/x/fundAccount', authenticationAndAnalyticsWrapped, razorpayXGetFundAccount);
router.get('/razorpay/x/customer/:customerId/fundAccount', authenticationAndAnalyticsWrapped, razorpayXGetFundByCustomerId);

router.post('/razorpay/payout', authenticationAndAnalyticsWrapped, razorpayVendorPayout);
router.get('/razorpay/:paymentId', authenticationAndAnalyticsWrapped, razorpayGetPaymentDetails);



export default router;
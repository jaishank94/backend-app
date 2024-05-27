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
  razorpayXVendorPayout,
} from "../controllers/payment.js";
import { checkRole, isAuthenticated } from "../middlewares/auth.js";

import { ROLES } from "../constants/index.js";
const { admin } = ROLES;

const router = express.Router();

router.post("/charge", [isAuthenticated, checkRole(admin)], initiatePayment);

router.post("/webhooks", bodyParser.raw({ type: 'application/json' }), stripeWebhooks);


router.post("/createPaymentIntent", [isAuthenticated, checkRole(admin)], createPaymentIntent);
router.post("/confirmPaymentIntent", [isAuthenticated, checkRole(admin)], confirmPaymentIntent);

// use this STRIPE - card
router.post("/createSessionCheckout", [isAuthenticated, checkRole(admin)], createSessionCheckout);
router.post("/initiateRefund", [isAuthenticated, checkRole(admin)], initateRefund);

// RAZORPAY
router.post('/razorpay/customer', [isAuthenticated, checkRole(admin)], razorpayCreateCustomer);
router.get('/razorpay/customer', [isAuthenticated, checkRole(admin)], razorpayGetCustomers);
router.post('/razorpay/fundAccount', [isAuthenticated, checkRole(admin)], razorpayCreateFundAccount);
router.get('/razorpay/fundAccount/:customerId', [isAuthenticated, checkRole(admin)], razorpayGetFundAccount);
router.post('/razorpay/orders', [isAuthenticated, checkRole(admin)], razorpayCreateOrder);
router.get('/razorpay/orders', [isAuthenticated, checkRole(admin)], razorpayFetchOrders);
router.post('/razorpay/capture', [isAuthenticated, checkRole(admin)], razorpayCapturePayment);
router.post('/razorpay/paymentLink', [isAuthenticated, checkRole(admin)], razorpayPaymentLink);
router.get('/razorpay/list', [isAuthenticated, checkRole(admin)], razorpayGetPaymentsList);
router.post('/razorpay/refund', [isAuthenticated, checkRole(admin)], razorpayInitiateRefund);
router.get('/razorpay/:paymentId', [isAuthenticated, checkRole(admin)], razorpayGetPaymentDetails);

// RAXORPAY X
router.post('/razorpay/x/customer', [isAuthenticated, checkRole(admin)], razorpayXCreateCustomer);
router.get('/razorpay/x/customer', [isAuthenticated, checkRole(admin)], razorpayXGetCustomers);
router.get('/razorpay/x/customer/:customerId', [isAuthenticated, checkRole(admin)], razorpayXGetCustomerById);
router.post('/razorpay/x/fundAccount', [isAuthenticated, checkRole(admin)], razorpayXCreateFundAccount);
router.get('/razorpay/x/fundAccount', [isAuthenticated, checkRole(admin)], razorpayXGetFundAccount);
router.get('/razorpay/x/customer/:customerId/fundAccount', [isAuthenticated, checkRole(admin)], razorpayXGetFundByCustomerId);
router.post('/razorpay/x/payout', [isAuthenticated, checkRole(admin)], razorpayXVendorPayout);




export default router;
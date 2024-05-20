import crypto from 'crypto';
import axios from 'axios';
import mongoose from 'mongoose';
import { Payment } from "../models/payment.js";
import { User } from "../models/user.js";
import { Stripe as StripeModel } from "../models/stripe.js";
import { stripe, razorpay } from "../server.js";
import { asyncError } from "../middlewares/error.js";
import { RazorpayOrder } from '../models/razorpayOrder.js';
import { Order } from '../models/order.js';

// const bearerToken = 'Bearer eyJhbGciOiJIUzM4NCIsInR5cCI6IkpXVCJ9.eyJjbGllbnRJZCI6IkNGMjAyNjBDTDBFM00wSk81UktTN0tPRzA1RyIsImFjY291bnRJZCI6NDc0NTI5LCJzaWduYXR1cmVDaGVjayI6ZmFsc2UsImlwIjoiIiwiYWdlbnQiOiJQQVlPVVQiLCJjaGFubmVsIjoiIiwiYWdlbnRJZCI6NDc0NTI5LCJraWQiOiJDRjIwMjYwQ0wwRTNNMEpPNVJLUzdLT0cwNUciLCJlbmFibGVBcGkiOnRydWUsImV4cCI6MTcxNTc3MTY2MiwiaWF0IjoxNzE1NzcxMDYyLCJzdWIiOiJQQVlPVVRBUElfQVVUSCJ9.mZw45f_9OmFtYyRfUo45l8dIOkOYo7i8sukImv7v-qO-FUPpCoYOmwfW2gUJNaVB';


export const initiatePayment = asyncError(async (req, res, next) => {
  let user = await User.findById(req.user._id);

  if (!user.stripeCustomerId) {
    const customer = await stripe.customers.create({
      name: user.name,
      email: user.email,
    });
    user.stripeCustomerId = customer.id;
    user.save();
  }

  try {
    const { amount, source, receiptEmail } = req.body;

    const charge = await stripe.charges.create({
      amount,
      currency: 'inr',
      customer: user.stripeCustomerId,
      source,
      receiptEmail,
    });

    res.status(200).json({ success: true, charge });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export const createPaymentIntent = asyncError(async (req, res, next) => {
  let user = await User.findById(req.user._id);
  try {
    const { amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Number(amount * 100),
      currency: 'inr',
    });
    res.status(200).json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export const confirmPaymentIntent = asyncError(async (req, res, next) => {
  console.log(process.env.STRIPE_PAYMENT_RETURN_URL);
  try {
    const { paymentIntentId, paymentMethodId } = req.body;

    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
      return_url: process.env.STRIPE_PAYMENT_RETURN_URL
    });

    res.status(200).json({ success: true, paymentIntent });
  } catch (error) {
    console.error('Error confirming Payment Intent:', error);
    res.status(500).json({ error: 'Error confirming Payment Intent' });
  }
});


// STRIPE
export const stripeWebhooks = asyncError(async (request, response, next) => {
  const endpointSecret = process.env.STRIPE_WEBHOOK_ENDPOINT_SECRET;
  const sig = request.headers['stripe-signature'];
  const payload = request.body;
  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err) {
    console.error('Error verifying webhook signature:', err.message);
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }
  let tnxId, chargeId, paymentMethodId, paymentId, orderId, status, amount, currency, amountReceived, receiptUrl;
  // Handle the event
  switch (event.type) {
    case 'payment_intent.requires_action':
      tnxId = event.data.object.id;
      paymentMethodId = event.data.object.payment_method;
      amount = event.data.object.amount;
      currency = event.data.object.currency;
      status = event.data.object.status;
      const description = event.data.object.description;
      // extract orderId and paymentId from description set while session creation
      [orderId, paymentId] = description.split("*");
      const stripeExists = await StripeModel.findOne({ transactionId: tnxId });
      if (!stripeExists) {
        await StripeModel.create({ transactionId: tnxId, status });
        await Payment.findByIdAndUpdate(paymentId, { "transactionDetails.status": status });
      }
      break;

    case 'payment_intent.created':
      tnxId = event.data.object.id;
      status = event.data.object.status || 'requires_payment_method';
      amount = event.data.object.amount;
      currency = event.data.object.currency;
      await StripeModel.findOneAndUpdate({ transactionId: tnxId }, { $set: { status } });
      break;

    case 'payment_intent.succeeded':
      tnxId = event.data.object.id;
      paymentMethodId = event.data.object.payment_method;
      status = event.data.object.status;
      amount = event.data.object.amount;
      currency = event.data.object.currency;
      await StripeModel.findOneAndUpdate({ transactionId: tnxId }, { $set: { status } });
      break;

    case 'charge.succeeded':
      tnxId = event.data.object.payment_intent;
      chargeId = event.data.object.payment_intent;
      paymentMethodId = event.data.object.payment_method;
      status = event.data.object.status;
      amount = event.data.object.amount;
      amountReceived = event.data.object.amount_captured;
      currency = event.data.object.currency;
      receiptUrl = event.data.object.receipt_url;
      await StripeModel.findOneAndUpdate({ transactionId: tnxId }, { $set: { status, receiptUrl } });
      break;

    case 'checkout.session.completed':
      tnxId = event.data.object.payment_intent;
      chargeId = event.data.object.id;
      status = event.data.object.status;
      currency = event.data.object.currency;
      orderId = event.data.object.metadata.order_id;
      paymentId = event.data.object.metadata.payment_id;
      const stripePayment = await StripeModel.findOne({ transactionId: tnxId });
      stripePayment.orderId = orderId;
      stripePayment.paymentId = paymentId;
      stripePayment.status = status;
      await Payment.findOneAndUpdate(
        { _id: stripePayment.paymentId, orderId: stripePayment.orderId },
        {
          $set:
          {
            amount,
            currency,
            transactionDetails: {
              transactionId: tnxId, receiptUrl: stripePayment.receiptUrl, status, paymentMethodId, chargeId
            },
            hasFailed: false, failureCode: null, failureReason: null,
          }
        }
      );
      break;

    // Payment failed due to failed OTP verification  
    case 'payment_intent.payment_failed':
      tnxId = event.data.object.id;
      let failureReason = event.data.object.last_payment_error.message;
      let failureCode = event.data.object.last_payment_error.code;
      status = event.data.object.status;
      await StripeModel.findOneAndUpdate({ transactionId: tnxId }, { $set: { status, paymentFailure: { hasFailed: true, failureCode, failureReason } } });

      [orderId, paymentId] = event.data.object.description.split("*");

      await Payment.findByIdAndUpdate(
        paymentId,
        {
          $set: {
            transactionDetails: {
              hasFailed: true,
              failureReason,
              failureCode,
              status: "payment_failed"
            },
          },
        },
        { new: true }
      );
      break;
    case 'charge.refunded':
      let refundedAmount;
      if (event.data.previous_attributes.amount_refunded) {
        refundedAmount = Number(event.data.object.amount_refunded - event.data.previous_attributes.amount_refunded) / 100;
      } else {
        refundedAmount = Number(event.data.object.amount_refunded / 100);
      }
      await Payment.findOneAndUpdate(
        { "transactionDetails.transactionId": event.data.object.payment_intent },
        {
          $push: {
            refundDetails: {
              refundTransactionId: event.data.object.id,
              refundAmount: refundedAmount,
              status: event.data.object.status,
              receiptUrl: event.data.object.receipt_url
            }
          }
        }
      );
      break;
    case 'charge.refund.updated':
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  return response.json({ received: true });
});

export const createSessionCheckout = asyncError(async (req, res, next) => {
  let payload = {};
  payload.orderId = req.body.orderId;
  payload.userId = req.user._id;
  let totalamount = 0;
  req.body.items.map(item => {
    totalamount += (Number(item.price) * Number(item.quantity));
    return {
      price_data: {
        currency: 'inr',
        product_data: {
          name: item.name,
        },
        unit_amount: Number(item.price * 100),
      },
      quantity: item.quantity,
    };
  });
  payload.amount = totalamount;
  payload.transactionDetails = {};
  let payments = await Payment.create(payload);

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      payment_intent_data: {
        // desription will be extracted in payment_intent.requires_action event to update the DB
        description: `${req.body.orderId}*${payments._id.toString()}`
      },
      line_items: req.body.items.map(item => {
        return {
          price_data: {
            currency: 'inr',
            product_data: {
              name: item.name,
            },
            unit_amount: Number(item.price * 100),
          },
          quantity: item.quantity,
        };
      }),
      client_reference_id: req.body.orderId,
      metadata: {
        order_id: req.body.orderId,
        payment_id: payments._id.toString()
      },
      success_url: process.env.STRIPE_PAYMENT_SUCCESS_URL,
      cancel_url: process.env.STRIPE_PAYMENT_CANCEL_URL,
    });
    res.status(200).json({ success: true, url: session.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export const initateRefund = asyncError(async (req, res, next) => {
  const { transactionId } = req.body;
  let { refundAmount } = req.body;
  refundAmount *= 100;
  try {
    let paymentIntent = await stripe.paymentIntents.retrieve(transactionId);
    if (paymentIntent.status !== 'succeeded') {
      return res.status(500).json({ success: false, error: "Payment is not in a state that allows a refund." });
    }
    let refund;
    if (refundAmount) {
      if (refundAmount > paymentIntent.amount) {
        return res.status(500).json({ success: false, error: "Provided refund amount is greater than original transaction amount." });
      } else {
        refund = await stripe.refunds.create({
          payment_intent: transactionId,
          amount: refundAmount
        });
      }
    } else {
      refund = await stripe.refunds.create({
        payment_intent: transactionId,
      });
    }
    return res.send({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// CASHFREE
// export const cashfreeCreateCheckoutSession = asyncError(async (req, res) => {
//   const { _id: userId, name, email, phoneNumber } = req.user;
//   const { orderId, amount, currency } = req.body;

//   try {
//     const options = {
//       method: 'POST',
//       url: process.env.CASHFREE_URL + "/pg/orders",
//       headers: {
//         accept: 'application/json',
//         'content-type': 'application/json',
//         'x-api-version': process.env.CASHFREE_API_VERSION,
//         'x-client-id': process.env.CASHFREE_APPID,
//         'x-client-secret': process.env.CASHFREE_SECRET_KEY,
//       },
//       data: {
//         "customer_details": {
//           "customer_id": userId,
//           "customer_email": email,
//           "customer_phone": phoneNumber,
//           "customer_name": name
//         },
//         "order_meta": {
//           "notify_url": process.env.CASHFREE_PAYMENT_SUCCESS_URL,
//           "return_url": process.env.CASHFREE_PAYMENT_SUCCESS_URL,
//           "payment_methods": "cc,dc,upi"
//         },
//         "order_id": orderId,
//         "order_amount": amount,
//         "order_currency": currency || "INR"
//       }
//     };

//     const session = await axios.request(options);
//     return res.status(200).json({ success: true, session: session.data.payment_session_id });


//   } catch (error) {
//     res.status(500).send({
//       message: error.message,
//       success: false
//     });
//   }
// });
// export const cashfreeCheckPaymentStatus = asyncError(async (req, res) => {
//   const { orderId } = req.params;

//   try {
//     const url = `${process.env.CASHFREE_URL}/pg/orders/${orderId}`;
//     const headers = {
//       'accept': 'application/json',
//       'x-api-version': process.env.CASHFREE_API_VERSION,
//       'x-client-id': process.env.CASHFREE_APPID,
//       'x-client-secret': process.env.CASHFREE_SECRET_KEY,
//     };
//     const response = await axios.get(url, { headers });

//     return res.status(200).json({ success: true, status: response.data.order_status });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       message: error.message,
//       success: false
//     });
//   }
// });
// export const cashfreeCheckPaymentSettlements = asyncError(async (req, res) => {
//   const { orderId } = req.params;

//   try {
//     const url = `${process.env.CASHFREE_URL}/pg/orders/${orderId}/settlements`;
//     const headers = {
//       'accept': 'application/json',
//       'x-api-version': process.env.CASHFREE_API_VERSION,
//       'x-client-id': process.env.CASHFREE_APPID,
//       'x-client-secret': process.env.CASHFREE_SECRET_KEY,
//     };
//     const response = await axios.get(url, { headers });

//     return res.status(200).json({ success: true, status: response.data });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       message: error.message,
//       success: false
//     });
//   }
// });
// export const cashfreeAddBeneficiary = asyncError(async (req, res) => {
//   const beneficiaryId = new mongoose.Types.ObjectId().toString();
//   const { 
//     name,
//     email, 
//     bankAccountNumber,
//     bankIFSC, 
//     vpa,
//     phone,
//     address1,
//     address2, 
//     city, 
//     state, 
//     pincode, 
//     purpose 
//   } = req.body;
//   try {
//     const url = `https://payout-gamma.cashfree.com/payout/v1/addBeneficiary`;
//     const headers = {
//       Authorization: bearerToken,
//       Accept: 'application/json',
//       'content-type': 'application/json',
//       'x-api-version': process.env.CASHFREE_API_VERSION,
//       'x-client-id': process.env.CASHFREE_APPID,
//       'x-client-secret': process.env.CASHFREE_SECRET_KEY,
//     };
//     const payload = {
//       beneId: beneficiaryId,
//       name,
//       email,
//       phone: phone,
//       bankAccount: bankAccountNumber,
//       ifsc: bankIFSC,
//       vpa,
//       address1,
//       address2,
//       city,
//       state,
//       pincode,
//       purpose
//     };

//     const response = await axios.post(url, payload, { headers });

//     if (response.data.status === "SUCCESS") {
//       const ben = await Beneficiary.create({
//         _id: beneficiaryId, name, email, bankAccountNumber, bankIFSC, vpa, phone, address1, address2, city, state, pincode, purpose  
//       });
//       return res.status(200).json({ success: true, status: response.data });
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       message: error.message,
//       success: false
//     });
//   }
// });

// export const cashfreeGetBeneficiaries = asyncError(async (req, res) => {
//   try {
//     const beneficiaries = await Beneficiary.find();
//     return res.status(200).json({ success: true, data: beneficiaries });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       message: error.message,
//       success: false
//     });
//   }
// });

// export const cashfreeGetBeneficiaryDetails = asyncError(async (req, res) => {
//   try {
//     const url = `https://payout-gamma.cashfree.com/payout/v1/getBeneficiary/${req.params.beneficiaryId}`;
//     const headers = {
//       Authorization: bearerToken,
//       Accept: 'application/json',
//       'content-type': 'application/json',
//       'x-api-version': process.env.CASHFREE_API_VERSION,
//       'x-client-id': process.env.CASHFREE_APPID,
//       'x-client-secret': process.env.CASHFREE_SECRET_KEY,
//     };
//     const response = await axios.get(url, { headers });
//     return res.status(200).json({ success: true, data: response.data.data });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({
//       message: error.message,
//       success: false
//     });
//   }
// });

// export const cashfreeDirectBankTransfer = asyncError(async (req, res) => {
//   const transferId = new mongoose.Types.ObjectId().toString();
//   const { amount, transferMode, bankAccount, ifsc, name, email, phone, address1, remarks } = req.body;
//   const headers = {
//     headers: {
//     'Authorization': bearerToken,
//     'accept': 'application/json',
//     'content-type': 'application/json'
//     }
//   };
//   const requestData = {
//     amount,
//     transferId,
//     transferMode,
//     remarks: remarks || "Vendor Payout",
//     beneDetails: {
//       bankAccount,
//       ifsc,
//       name,
//       email,
//       phone,
//       address1
//     }
//   };

//   try {
//     const response = await axios.post('https://payout-gamma.cashfree.com/payout/v1/directTransfer', requestData, headers);
//     if (response.data.status == 'SUCCESS') {
//       console.log
//       const dbt = await DirectBankTransfer.create({
//         _id: transferId,
//         amount,
//         transferMode,
//         bankAccountNumber: bankAccount,
//         bankIFSC: ifsc,
//         transferReferenceId: response.data.data.referenceId,
//         utr: response.data.data.utr,
//         name, email, phone, address1,
//       })
//       return res.send(dbt);
//     }
//   } catch (error) {
//     console.error('Error:', error);
//     return res.send("Error");
//   }
// });

// export const cashfreeGetDirectTransferStatus = asyncError(async (req, res) => {
//   const { transferId } = req.query;
//   try {
//     const response = await axios.get(`https://payout-gamma.cashfree.com/payout/v1/getTransferStatus?transferId=${transferId}`, {
//       headers: {
//         'Authorization': bearerToken,
//         'accept': 'application/json'
//       }
//     });
//     return res.status(response.data.subCode).json({ success: true, data: response.data });
//   } catch (error) {
//     console.error('Error:', error.response.data);
//     res.send(error);
//   }
// });

// RZRPY
export const razorpayCreateOrder = asyncError(async (req, res) => {
  try {
    const { systemOrderId, amount, currency = "INR" } = req.body;
    const systemOrder = await Order.findById(systemOrderId);
    if (!systemOrder || systemOrder.status === 'cancelled') {
      return res.status(404).json({ success: false, message: `No order found with order id: ${systemOrderId} or order already cancelled` });
    }
    var options = {
      amount,
      currency,
      receipt: systemOrderId // use our orders._id as receipt
    };
    const data = await razorpay.orders.create(options);
    if (data) {
      const { id, amount, amount_paid, amount_due, currency, status, notes, created_at } = data;
      await RazorpayOrder.create({
        _id: systemOrderId,  // systemOrderId is orders._id to link the razorpay order to our system order
        orderId: id,
        amount,
        amountPaid: amount_paid,
        amountDue: amount_due,
        currency, status, notes,
        createdAt: created_at
      });
      await systemOrder.updateOne({ paymentMethod: "ONLINE", paymentGateway: "RAZORPAY", razorpayOrderReference: id }, { new: true });
      return res.status(200).json({ success: true, data });
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(400).send({ success: false, message: error.message });
  }
});

export const razorpayFetchOrders = asyncError(async (req, res) => {
  const { count = null, from = null, to = null, receipt = null } = req.query;
  try {
    const orders = await razorpay.orders.all({ count, from, to, receipt, expand: ["payments"] });
    return res.status(200).json({ success: true, data: orders.items });
  } catch (error) {
    console.error('Error:', error);
    return res.send(error);
  }
});

export const razorpayCapturePayment = asyncError(async (req, res) => {
  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, amount, currency = "INR" } = req.body;
  const { _id: userId } = req.user;
  try {
    // const payment = await razorpay.payments.capture(paymentId, amount, currency);
    hmac.update(razorpayOrderId + "|" + razorpayPaymentId);
    let generatedSignature = hmac.digest('hex');
    let isSignatureValid = generatedSignature == razorpaySignature;
    if (!isSignatureValid) {
      return res.status(400).json({ success: false, message: "Payment could not be verified, please contact customer support hepl@sosuvconsulting.com" });
    }
    const order = await Order.findOne({ razorpayOrderReference: razorpayOrderId });
    const data = await Payment.create({
      userId, 
      orderId: order._id, 
      amount, 
      currency, 
      transactionDetails: {
        paymentGateway: "RAZORPAY",
        transactionId: razorpayPaymentId,
        status: "complete",
      } 
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error:', error);
    return res.send(error);
  }
});

export const razorpayGetPaymentsList = asyncError(async (req, res) => {
  const { fromDate, toDate } = req.query;
  try {
    const data = await razorpay.payments.all({
      from: fromDate,
      to: toDate
    });
    return res.status(200).json({ success: true, data: data.items });
  } catch (error) {
    console.error('Error:', error);
    return res.send(error);
  }
});

export const razorpayGetPaymentDetails = asyncError(async (req, res) => {
  const { paymentId } = req.params;
  try {
    const data = await razorpay.payments.fetch(paymentId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error:', error);
    return res.send(error);
  }
});

export const razorpayPaymentLink = asyncError(async (req, res) => {
  const { 
    upiLink = false, 
    amount,
    description = "Payment", 
    currency = "INR", 
    customerName, 
    customerEmail, 
    customerContact, 
    sendEmail = false, 
    sendSMS = false 
  } = req.body;
  try {
    const options = {
      upi_link: process.env.NODE_ENV === "development" ? false : upiLink,
      amount,
      currency,
      // "accept_partial": true,
      // "first_min_partial_amount": 100,
      description,
      customer: {
        name: customerName || "",
        email: customerEmail || "",
        contact: customerContact || "",
      },
      notify: {
        sms: sendSMS && customerContact ? sendSMS : false,
        email: sendSMS && customerEmail ? sendEmail : false,
      },
      callback_url: process.env.STRIPE_PAYMENT_SUCCESS_URL,
      callback_method: "get"
    }
    const data = await razorpay.paymentLink.create(options);
    return res.status(200).json({ success: true, data: { paymentLink: data.short_url, amount: Number(data.amount / 100) } });
  } catch (error) {
    console.error('Error:', error);
    return res.send(error);
  }
}); 
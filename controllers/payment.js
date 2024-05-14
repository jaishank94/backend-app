import crypto from 'crypto';
import axios from 'axios';
import { Payment } from "../models/payment.js";
import { User } from "../models/user.js";
import { Stripe as StripeModel } from "../models/stripe.js";
import { stripe, cashfree } from "../server.js";
import { asyncError } from "../middlewares/error.js";
import mongoose from 'mongoose';


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
      await Payment.findOneAndUpdate(
        { "transactionDetails.transactionId": event.data.object.payment_intent },
        {
          $push: {
            refundDetails: {
              refundTransactionId: event.data.object.id,
              refundAmount: Number(event.data.object.amount_refunded / 100),
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
    return res.send(refund);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
});


// PHONEPE - under development
export const phonepeCreatePayment = asyncError(async (req, res) => {
  const userId = req.user._id;
  try {
    const merchantTransactionId = 'M' + Date.now();
    let initialPayload = {
      merchantId: process.env.PHONEPE_MERCHANT_ID,
      merchantTransactionId,
      merchantUserId: "MUID123",
      name: "Saquib Nasim",
      amount: 21300,
      redirectUrl: "http://localhost:3000/",
      redirectMode: "POST",
      callbackUrl: "http://localhost:3000/",
      mobileNumber: "9999999999",
      paymentInstrument: {
        type: "PAY_PAGE"
      }
    };
    let saltKey = process.env.PHONEPE_SALT_KEY;
    let saltKeyIndex = 1;
    let base64String = Buffer.from(JSON.stringify(initialPayload)).toString("base64");

    let string = base64String + '/pg/v1/pay' + saltKey;
    let sha256_val = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = sha256_val + '###' + saltKeyIndex;

    const URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";
    const options = {
      method: 'POST',
      url: URL,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
      },
      data: {
        request: base64String
      }
    };

    axios.request(options)
      .then((response) => {
        console.log(response.data);
        return res.status(200).send(response.data.data.intrumentResponse.redirectInfo.url);
      })
      .catch((error) => {
        console.error(error);
        return res.status(500).send("Failed");
      });

    // axios.post("https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay", {
    //   "request": base64String
    // }, {
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'X-VERIFY': checksum,
    //     'accept': 'application/json'
    //   }
    // }).then((res) => {
    //   console.log(res)
    //   res.send(res.data.data.instrumentResponse.redirectInfo.url);
    //   // res.redirect(res.data.data.instrumentResponse.redirectInfo.url);
    // }).catch(err => {
    //   res.send(err)
    // })

    // const merchantTransactionId = 'M' + Date.now();
    // const { price, phone, name } = req.body;
    // const data = {
    //   merchantId: process.env.PHONEPE_MERCHANT_ID,
    //   merchantTransactionId: merchantTransactionId,
    //   merchantUserId: 'MUID' + userId,
    //   name: name,
    //   amount: price * 100,
    //   redirectUrl: process.env.STRIPE_PAYMENT_SUCCESS_URL,
    //   redirectMode: 'POST',
    //   mobileNumber: phone,
    //   paymentInstrument: {
    //     type: 'PAY_PAGE'
    //   }
    // };
    // const payload = JSON.stringify(data);
    // const payloadMain = Buffer.from(payload).toString('base64');
    // const keyIndex = 1;
    // const string = payloadMain + '/pg/v1/pay' + process.env.PHONEPE_SALT_KEY;
    // const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    // const checksum = sha256 + '###' + keyIndex;
    // // const prod_URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay";
    // const prod_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";


    // const postData = {
    //   request: payloadMain
    // };

    //   const config = {
    //     headers: {
    //       'Accept': 'application/json',
    //       'Content-Type': 'application/json',
    //       'X-VERIFY': checksum
    //     }
    //   };
    // try {
    //   let response = await axios.post(prod_URL, postData, config);    
    //   return res.send(response);
    // } catch(err) {
    //   console.log("ERROR", err.message)
    //   return res.send(err)
    // }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: error.message,
      success: false
    });
  }
});

// CASHFREE
export const cashfreeCreateCheckoutSession = asyncError(async (req, res) => {
  const { _id: userId, name, email, phoneNumber } = req.user;
  const { orderId, amount, currency } = req.body;

  try {
    const options = {
      method: 'POST',
      url: process.env.CASHFREE_URL + "/pg/orders",
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'x-api-version': process.env.CASHFREE_API_VERSION,
        'x-client-id': process.env.CASHFREE_APPID,
        'x-client-secret': process.env.CASHFREE_SECRET_KEY,
      },
      data: {
        "customer_details": {
          "customer_id": userId,
          "customer_email": email,
          "customer_phone": phoneNumber,
          "customer_name": name
        },
        "order_meta": {
          "notify_url": process.env.CASHFREE_PAYMENT_SUCCESS_URL,
          "return_url": process.env.CASHFREE_PAYMENT_SUCCESS_URL,
          "payment_methods": "cc,dc,upi"
        },
        "order_id": orderId,
        "order_amount": amount,
        "order_currency": currency || "INR"
      }
    };

    const session = await axios.request(options);
    return res.status(200).json({ success: true, session: session.data.payment_session_id });


  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false
    });
  }
});
export const cashfreeCheckPaymentStatus = asyncError(async (req, res) => {
  const { orderId } = req.params;

  try {
    const url = `${process.env.CASHFREE_URL}/pg/orders/${orderId}`;
    const headers = {
      'accept': 'application/json',
      'x-api-version': process.env.CASHFREE_API_VERSION,
      'x-client-id': process.env.CASHFREE_APPID,
      'x-client-secret': process.env.CASHFREE_SECRET_KEY,
    };
    const response = await axios.get(url, { headers });

    return res.status(200).json({ success: true, status: response.data.order_status });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: error.message,
      success: false
    });
  }
});
export const cashfreeCheckPaymentSettlements = asyncError(async (req, res) => {
  const { orderId } = req.params;

  try {
    const url = `${process.env.CASHFREE_URL}/pg/orders/${orderId}/settlements`;
    const headers = {
      'accept': 'application/json',
      'x-api-version': process.env.CASHFREE_API_VERSION,
      'x-client-id': process.env.CASHFREE_APPID,
      'x-client-secret': process.env.CASHFREE_SECRET_KEY,
    };
    const response = await axios.get(url, { headers });

    return res.status(200).json({ success: true, status: response.data });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: error.message,
      success: false
    });
  }
});
export const cashfreeAddBeneficiary = asyncError(async (req, res) => {
  const customId = mongoose.Types.ObjectId().toString();
  console.log(customId, "cus")
  const { 
    name,
    email, 
    bankAccountNumber,
    bankIFSC, 
    vpa,
    phone,
    address1,
    address2, 
    city, 
    state, 
    pincode, 
    purpose 
  } = req.body;
  try {
    const url = `https://payout-gamma.cashfree.com/payout/v1/addBeneficiary`;
    const headers = {
      Authorization: 'Bearer eyJhbGciOiJIUzM4NCIsInR5cCI6IkpXVCJ9.eyJjbGllbnRJZCI6IkNGMjAyNjBDTDBFM00wSk81UktTN0tPRzA1RyIsImFjY291bnRJZCI6NDc0NTI5LCJzaWduYXR1cmVDaGVjayI6ZmFsc2UsImlwIjoiIiwiYWdlbnQiOiJQQVlPVVQiLCJjaGFubmVsIjoiIiwiYWdlbnRJZCI6NDc0NTI5LCJraWQiOiJDRjIwMjYwQ0wwRTNNMEpPNVJLUzdLT0cwNUciLCJlbmFibGVBcGkiOnRydWUsImV4cCI6MTcxNTY4NzQyNCwiaWF0IjoxNzE1Njg2ODI0LCJzdWIiOiJQQVlPVVRBUElfQVVUSCJ9.4CIIPQo07lRiWREg1PXFZutu5r_3E5DH2Gv8NYY5bB2cdfej74_N84TEUoSwDOnG',
      Accept: 'application/json',
      'content-type': 'application/json',
      'x-api-version': process.env.CASHFREE_API_VERSION,
      'x-client-id': process.env.CASHFREE_APPID,
      'x-client-secret': process.env.CASHFREE_SECRET_KEY,
    };
    const payload = {
      beneId: 'JOHN18011341',
      name,
      email,
      phone: phone,
      bankAccount: bankAccountNumber,
      ifsc: bankIFSC,
      vpa,
      address1,
      address2,
      city,
      state,
      pincode,
      purpose
    };
    
    const response = await axios.post(url, payload, { headers });
    console.log(response.data);
    return res.status(200).json({ success: true, status: response.data });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: error.message,
      success: false
    });
  }
});
export const cashfreeGetBeneficiary = asyncError(async (req, res) => {
  try {
    const url = `${process.env.CASHFREE_URL}/pg/lrs/beneficiaries`;
    const headers = {
      'accept': 'application/json',
      'x-api-version': process.env.CASHFREE_API_VERSION,
      'x-client-id': process.env.CASHFREE_APPID,
      'x-client-secret': process.env.CASHFREE_SECRET_KEY,
    };
    const response = await axios.get(url, { headers });
    console.log(response, "S")
    return res.status(200).json({ success: true, status: response.data });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: error.message,
      success: false
    });
  }
});

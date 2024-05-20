import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
  },
  paymentMethodId: {
    type: String,
  },
  chargeId: {
    type: String,
  },
  status: {
    type: String,
    required: true,
    default: "not_initiated"
  },
  receiptUrl: {
    type: String
  },
  hasFailed: {
    type: Boolean,
    default: false,
  },
  failureReason: {
    type: String,
    default: null,
  },
  failureCode: {
    type: String,
    default: null
  },
}, { _id: false } );

const refundSchema = new mongoose.Schema({
  refundTransactionId: {
    type: String,
  },
  refundAmount: {
    type: Number,
  },
  refundCurrency: {
    type: String,
    default: "INR",
  },
  status: {
    type: String,
  },
  receiptUrl: {
    type: String
  },
}, { _id: false } );

const schema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    enum: ["INR"],
    default: "INR"
  },
  transactionDetails: transactionSchema,
  refundDetails: [refundSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { versionKey: false } );

export const Payment = mongoose.model("Payment", schema);

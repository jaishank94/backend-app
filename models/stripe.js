import mongoose from "mongoose";

const schema = new mongoose.Schema({
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  },
  transactionId: {
    type: String,
  },
  status: {
    type: String,
  },
  receiptUrl: {
    type: String,
  },
  paymentFailure: new mongoose.Schema({
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
      default: null,
    }
  }, { __id: false }),
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  }
}, { versionKey: false } );

export const Stripe = mongoose.model("Stripe", schema);

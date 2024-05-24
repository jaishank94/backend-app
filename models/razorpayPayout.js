import mongoose from "mongoose";

const razorpayPayout = new mongoose.Schema({
  customerId: {
    type: String,
    required: true,
  },
  fundAccountId: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
  },
  currency: {
    type: String,
    enum: ["INR"],
    default: "INR"
  },
  fees: {
    type: Number,
  },
  tax: {
    type: Number,
  },
  status: {
    type: String,
  },
  mode: {
    type: String,
    enum: ["IMPS", "NEFT", "RTGS", "card", "UPI"],
    required: true,
  },
  purpose: {
    type: String,
    enum: ["salary", "refund", "cashback", "payout", "utility bill", "vendor bill"]
  },
  merchantId: {
    type: String,
  },
  notes: [
    {
      type: String
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { versionKey: false } );

export const RazorpayPayout = mongoose.model("razorpayPayout", razorpayPayout);

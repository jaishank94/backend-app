import mongoose from "mongoose";

const razorpayOrder = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  orderId: {
    type: String,
    required: true,
  },
  amount: {
    type: Number
  },
  amountPaid: {
    type: Number
  },
  amountDue: {
    type: Number
  },
  currency: {
    type: String,
  },
  status: {
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

export const RazorpayOrder = mongoose.model("razorpayOrder", razorpayOrder);

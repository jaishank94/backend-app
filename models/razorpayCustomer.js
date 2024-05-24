import mongoose from "mongoose";

const razorpayCustomer = new mongoose.Schema({
  customerId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  contact: {
    type: String,
  },
  gstin: {
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

export const RazorpayCustomer = mongoose.model("razorpayCustomer", razorpayCustomer);

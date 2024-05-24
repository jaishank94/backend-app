import mongoose from "mongoose";

const razorpayXCustomer = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ["vendor", "customer", "employee", "self"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { versionKey: false } );

export const RazorpayXCustomer = mongoose.model("razorpayXCustomer", razorpayXCustomer);

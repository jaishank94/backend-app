import mongoose from "mongoose";

const schema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: [true, "Code Already Exist"],
  },
  discount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
});

export const Coupon = mongoose.model("Coupon", schema);

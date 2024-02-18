import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Name"],
  },
  description: {
    type: String,
    required: [true, "Please Enter Description"],
  },
  price: {
    type: Number,
    required: [true, "Please Enter Price"],
  },
  stock: {
    type: Number,
    required: [true, "Please Enter Stock"],
  },
  tradeType: {
    type: String,
    required: [true, "Please Select Trade Type"],
  },
  images: [{ public_id: String, url: String }],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Product = mongoose.model("Product", schema);

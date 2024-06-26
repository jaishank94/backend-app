import mongoose from "mongoose";

const schema = new mongoose.Schema({
  orderItems: [
    {
      name: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      minOrderQty: {
        type: Number,
      },
      maxOrderQty: {
        type: Number,
      },
      image: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      tradeType: {
        type: String,
        required: true,
      },
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
    },
  ],

  tradeUser: {
    type: Object,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  paymentMethod: {
    type: String,
    enum: ["COD", "ONLINE"],
    default: "ONLINE",
  },

  paidAt: Date,
  paymentInfo: {
    id: String,
    status: String,
  },
  razorpayOrderReference: {
    type: String,
    ref: 'razorpayOrders'
    // order_OBAVRMrxB3zOiu
  },
  itemsPrice: {
    type: Number,
    required: true,
  },
  taxPrice: {
    type: Number,
    // required: true,
  },
  coupon: {
    type: String,
  },
  companycharges: {
    type: Number,
  },
  discount: {
    type: Number,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["Preparing", "Cancelled", "Shipped", "Delivered"],
  },
  deliveredAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { versionKey: false });

export const Order = mongoose.model("Order", schema);

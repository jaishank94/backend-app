import { asyncError } from "../middlewares/error.js";
import { Order } from "../models/order.js";
import { Product } from "../models/product.js";
import ErrorHandler from "../utils/error.js";
import { stripe } from "../server.js";

export const createOrder = asyncError(async (req, res, next) => {
  try {
    const {
      orderItems,
      tradeUser, // Assuming tradeUser is provided in the request body
      paymentMethod,
      paymentInfo,
      itemsPrice,
      // taxPrice,
      coupon,
      companycharges,
      discount,
      totalAmount,
    } = req.body;
  
    const order = await Order.create({
      user: req.user._id,
      tradeUser,
      coupon,
      companycharges,
      discount,
      orderItems,
      paymentMethod,
      paymentInfo,
      itemsPrice,
      // taxPrice,
      totalAmount,
      status: "Preparing"
    });
  
    // for (let i = 0; i < orderItems.length; i++) {
    //   const product = await Product.findById(orderItems[i].product);
    //   product.stock -= orderItems[i].quantity;
    //   await product.save();
    // }
  
    return res.status(201).json({
      success: true,
      message: "Trade Requested Successfully",
      data: { orderId: order._id },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    })
  }
});

export const getVendorOrders = asyncError(async (req, res, next) => {
  const orders = await Order.find({
    "tradeUser._id": req.user._id.toString(),
  }).populate("user");

  return res.status(200).json({
    success: true,
    orders,
  });
});

export const getMyOrders = asyncError(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });

  return res.status(200).json({
    success: true,
    orders,
  });
});

export const getOrderDetails = asyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) return next(new ErrorHandler("Order Not Found", 404));

  return res.status(200).json({
    success: true,
    order,
  });
});


export const processOrder = asyncError(async (req, res, next) => {
  const { status } = req.body;
  try {
    if (status === "Delivered") {
      await Order.findByIdAndUpdate(req.params.id, 
        { $set: { status, deliveredAt: new Date(Date.now()) } });
    } else {
      await Order.findByIdAndUpdate(req.params.id, 
        { $set: { status } });
    }
    return res.status(200).json({
      success: true,
      message: "Order Processed Successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error,
    });
  }
});
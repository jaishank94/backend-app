import { asyncError } from "../middlewares/error.js";
import { User } from "../models/user.js";
import { Product } from "../models/product.js";
import { Order } from "../models/order.js";
import { Payment } from "../models/payment.js";

export const updateUserRole = asyncError(async (req, res, next) => {
  try {
    const {
      email,
      role
    } = req.body;
    await User.findOneAndUpdate({ email }, { role });
    return res.status(200).json({
      success: true,
      message: `Role: ${role} assigned to user: ${email} successfully`,
    });
  } catch (error) {
    return next(new ErrorHandler("Something went wrong", 400));
  }
});

export const getAllUsers = asyncError(async (req, res, next) => {
  try {
    const users = await User.find({});
    return res.status(200).json({
      success: true,
      data: users,
      message: `Users fetched successfully`,
    });
  } catch (error) {
    return next(new ErrorHandler("Something went wrong", 400));
  }
});

export const updateUser = asyncError(async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }
  
    const {
      name,
      email,
      phoneNumber,
      address,
      city,
      country,
      pinCode,
      interests,
      tradeType,
    } = req.body;

    user.name = name || user.name;
    user.email = email || user.email;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.address = address || user.address;
    user.city = city || user.city;
    user.country = country || user.country;
    user.pinCode = pinCode || user.pinCode;
    user.interests = interests || user.interests;
    user.tradeType = tradeType || user.tradeType;
  
    await user.save();
  
    return res.status(200).json({
      success: true,
      message: "Profile Updated Successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
});

export const deleteUser = asyncError(async (req, res, next) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndUpdate(userId, { deleted: true });
    return res.status(200).json({
      success: true,
      message: "User deleted Successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
});

export const restoreUser = asyncError(async (req, res, next) => {
  try {
    const { userEmail } = req.params;
    await User.findByIdAndUpdate({ email: userEmail }, { deleted: false });
    return res.status(200).json({
      success: true,
      message: `User: ${userEmail} restored Successfully`,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Something went wrong. User was not restored.",
    });
  }
});

export const getProducts = asyncError(async (req, res, next) => {
  try {
    const products = await Product.find({});
    return res.status(200).json({
      success: true,
      data: products,
      message: "Products fetched Successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
});

export const getProductById = asyncError(async (req, res, next) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    return res.status(200).json({
      success: true,
      data: product,
      message: "Product fetched Successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
});


export const updateProduct = asyncError(async (req, res, next) => {
  try {
    const { productId } = req.params;
    const payload = req.body;
    const products = await Product.findByIdAndUpdate(productId, payload, { new: true } );
    return res.status(200).json({
      success: true,
      data: products,
      message: "Product updated Successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
});

export const deleteProduct = asyncError(async (req, res, next) => {
  try {
    const { productId } = req.params;
    await Product.findByIdAndDelete(productId);
    return res.status(200).json({
      success: true,
      message: "Product deleted Successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
});


export const getOrders = asyncError(async (req, res, next) => {
  try {
    let { status } = req.query;
    let orders;
    if (!status) {
      orders = await Order.find();
    } else {
      orders = await Order.find({ status });
    }
    return res.status(200).json({
      success: true,
      data: orders,
      message: "Orders fetched Successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
});

export const updateOrder = asyncError(async (req, res, next) => {
  const { orderId } = req.params;
  const payload = req.body;
  try {
    const order = await Order.findByIdAndUpdate(orderId, payload, { new: true } );
    return res.status(200).json({
      success: true,
      data: order,
      message: "Order updated Successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
});

export const updateOrderStatus = asyncError(async (req, res, next) => {
  const { orderId } = req.params;
  const { status } = req.body;
  try {
    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true } );
    return res.status(200).json({
      success: true,
      data: order,
      message: "Order status updated Successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
});

export const getPayments = asyncError(async (req, res, next) => {
  try {
    let payments = await Payment.find();
    return res.status(200).json({
      success: true,
      data: payments,
      message: "Payments fetched Successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
});

export const getPaymentDetails = asyncError(async (req, res, next) => {
  try {
    let { paymentId } = req.params;
    let paymentDetails = await Payment.findById(paymentId);
    return res.status(200).json({
      success: true,
      data: paymentDetails,
      message: "Payment details fetched Successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Something went wrong",
    });
  }
});
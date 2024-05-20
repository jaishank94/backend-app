import { asyncError } from "../middlewares/error.js";
import { Cart } from "../models/cart.js";

export const createCartAndAddItems = asyncError(async (req, res, next) => {
  const userId = req.user._id;
  const payload = { userId, ...req.body };
  try {
    const cart = await Cart.create(payload);
    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export const updateCartItems = asyncError(async (req, res, next) => {
  const { cartId } = req.params;
  const payload = req.body;
  try {
    let cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({ success: false, error: "Cart not found" });
    }
    Object.assign(cart, payload);
    await cart.validate();

    cart.totalCartValue = cart.products.reduce((total, product) => {
      return total + (product.price * product.quantity);
    }, 0);
    cart = await cart.save();
    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


export const getCartItems = asyncError(async (req, res, next) => {
  const { cartId } = req.params;
  try {
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({ success: false, error: "Cart not found" });
    }
    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export const deleteCart = asyncError(async (req, res, next) => {
  const { cartId } = req.params;
  try {
    const cart = await Cart.findByIdAndDelete(cartId);
    if (!cart) {
      return res.status(404).json({ success: false, error: "Cart not found" });
    }
    res.status(200).json({
      success: true,
      message: "Cart successfully deleted!"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

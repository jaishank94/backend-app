// controllers/chargeController.js
import { Coupon } from "../models/coupon.js";
import { CompanyCharge } from "../models/companycharge.js";

// Controller for creating a new company charge
exports.createCharge = async (req, res) => {
  try {
    const { chargeType, amount } = req.body;
    const charge = new CompanyCharge({ chargeType, amount });
    await charge.save();
    res.status(201).json({ success: true, charge });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Controller for creating a new coupon
exports.createCoupon = async (req, res) => {
  try {
    const { code, discount } = req.body;
    const coupon = new Coupon({ code, discount });
    await coupon.save();
    res.status(201).json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Controller for applying a coupon code
exports.applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({ code });
    if (!coupon) {
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found" });
    }
    // Logic to apply the coupon
    // You can implement your own logic here based on your requirements
    res.status(200).json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

import { asyncError } from "../middlewares/error.js";
import { Coupon } from "../models/coupon.js";

export const applyCoupon = asyncError(async (req, res, next) => {
  const { code } = req.query;

  if (!code) {
    return next(new ErrorHandler("Coupon code is required", 400));
  }

  const coupon = await Coupon.findOne({ code });

  if (!coupon) {
    return next(new ErrorHandler("Coupon code does not exists", 404));
  }

  res.status(200).json({
    success: true,
    discount: coupon.discount,
  });
});

// @desc    Fetch all coupons
// @route   GET /api/coupons
// @access  Public
export const getCoupons = asyncError(async (req, res, next) => {
  const coupons = await Coupon.find({});
  res.json(coupons);
});

// @desc    Fetch single coupon by ID
// @route   GET /api/coupons/:id
// @access  Public
export const getCouponById = asyncError(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    return next(new ErrorHandler("Coupon not found", 404));
  }
  res.status(200).json({
    success: true,
    coupon,
  });
});

// @desc    Create a new coupon
// @route   POST /api/coupons
// @access  Private/Admin
export const createCoupon = asyncError(async (req, res, next) => {
  const { code, discount, type } = req.body;

  const couponExists = await Coupon.findOne({ code });

  if (couponExists) {
    return next(new ErrorHandler("Coupon already exists", 400));
  }

  const coupon = await Coupon.create({
    code,
    discount,
    type,
  });

  res.status(201).json({
    success: true,
    coupon,
    message: "Coupon Created Successfully",
  });
});

// @desc    Update a coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
export const updateCoupon = asyncError(async (req, res, next) => {
  const { code, discount, type } = req.body;

  const coupon = await Coupon.findById(req.params.id);

  if (coupon) {
    coupon.code = code;
    coupon.discount = discount;
    coupon.type = type;

    const updatedCoupon = await coupon.save();
    res.status(200).json({
      success: true,
      updatedCoupon,
      message: "Coupon Updated Successfully",
    });
  } else {
    return next(new ErrorHandler("Coupon not found", 404));
  }
});

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
export const deleteCoupon = asyncError(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);

  if (coupon) {
    await coupon.remove();
    res.status(200).json({
      success: true,
      message: "Coupon Deleted Successfully",
    });
  } else {
    return next(new ErrorHandler("Coupon not found", 404));
  }
});

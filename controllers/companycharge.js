import { asyncError } from "../middlewares/error.js";
import { CompanyCharge } from "../models/companycharge.js";

// @desc    Fetch all company charges
// @route   GET /api/company-charges
// @access  Public
const getCompanyCharges = asyncError(async (req, res, next) => {
  const companyCharges = await CompanyCharge.find({});

  // Get the amount of the first entry
  const amount = companyCharges.length > 0 ? companyCharges[0].amount : 0;

  res.status(200).json({
    success: true,
    companyCharges: amount,
  });
});

// @desc    Fetch single company charge by ID
// @route   GET /api/company-charges/:id
// @access  Public
const getCompanyChargeById = asyncError(async (req, res, next) => {
  const companyCharge = await CompanyCharge.findById(req.params.id);
  if (companyCharge) {
    res.status(200).json({
      success: true,
      companyCharge,
    });
  } else {
    return next(new ErrorHandler("Company charge not found", 404));
  }
});

// @desc    Create a company charge
// @route   POST /api/company-charges
// @access  Private/Admin
const createCompanyCharge = asyncError(async (req, res, next) => {
  const { chargeType, amount } = req.body;
  const companyCharge = await CompanyCharge.create({ chargeType, amount });
  res.status(201).json({
    success: true,
    companyCharge,
    message: "Company Charge Created Successfully",
  });
});

// @desc    Update a company charge
// @route   PUT /api/company-charges/:id
// @access  Private/Admin
const updateCompanyCharge = asyncError(async (req, res, next) => {
  const { chargeType, amount } = req.body;
  const companyCharge = await CompanyCharge.findById(req.params.id);
  if (companyCharge) {
    companyCharge.chargeType = chargeType;
    companyCharge.amount = amount;
    const updatedCompanyCharge = await companyCharge.save();
    res.status(200).json({
      success: true,
      updatedCompanyCharge,
      message: "Company Charge Updated Successfully",
    });
  } else {
    return next(new ErrorHandler("Company charge not found", 404));
  }
});

// @desc    Delete a company charge
// @route   DELETE /api/company-charges/:id
// @access  Private/Admin
const deleteCompanyCharge = asyncError(async (req, res, next) => {
  const companyCharge = await CompanyCharge.findById(req.params.id);
  if (companyCharge) {
    await companyCharge.remove();
    res.status(200).json({
      success: true,
      message: "Company charge Deleted Successfully",
    });
  } else {
    return next(new ErrorHandler("Company charge not found", 404));
  }
});

export {
  getCompanyCharges,
  getCompanyChargeById,
  createCompanyCharge,
  updateCompanyCharge,
  deleteCompanyCharge,
};

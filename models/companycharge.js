import mongoose from "mongoose";

const schema = new mongoose.Schema({
  chargeType: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
});

export const CompanyCharge = mongoose.model("CompanyCharge", schema);

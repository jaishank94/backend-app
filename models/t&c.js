import mongoose from "mongoose";

const termsAndConditions = new mongoose.Schema({
  termsAndConditions: {
    type: String,
    required: true,
  },
  version: {
    type: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  updatedAt: {
    type: Date,
  },
}, { versionKey: false } );

export const TermAndCondition = mongoose.model("termAndCondition", termsAndConditions);

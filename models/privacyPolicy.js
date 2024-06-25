import mongoose from "mongoose";

const privacyPolicy = new mongoose.Schema({
  privacyPolicy: {
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

export const PrivacyPolicy = mongoose.model("privacyPolicy", privacyPolicy);

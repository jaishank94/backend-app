import mongoose from "mongoose";

const schema = new mongoose.Schema({
  userId: { 
    type: String,
    required: true, 
    ref: "User",
  },
  message: String,
  timestamp: { type: Date, default: Date.now },
});

export const Message = mongoose.model('Message', schema);
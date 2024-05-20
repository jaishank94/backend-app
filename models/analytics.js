import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema({
  eventType: String,
  userId: String,
  timestamp: { type: Date, default: Date.now },
  properties: Object
});

export const AnalyticsEvent = mongoose.model('AnalyticsEvent', analyticsSchema);

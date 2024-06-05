import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema({
  eventType: String,
  userId: { type: String, ref: 'User' },
  timestamp: { type: Date, default: Date.now },
  properties: Object
});

export const AnalyticsEvent = mongoose.model('AnalyticsEvent', analyticsSchema);

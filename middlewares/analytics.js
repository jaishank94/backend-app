import { AnalyticsEvent } from "../models/analytics.js";
import { asyncError } from "./error.js";
import { eventTypeAnalyzer } from "../helpers/analytics.js";

export const trackEvent = asyncError(async (req, res, next) => {
  try {
    const userId = req.user._id;
    const eventType = eventTypeAnalyzer(req);
    await AnalyticsEvent.create({
      eventType,
      userId,
      properties: { method: req.method, url: req.url, payload: req.body || null }
    });
    next();
  } catch (error) {
    console.error('Error tracking event:', error);
  }
});
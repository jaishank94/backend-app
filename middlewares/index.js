import { trackEvent } from "./analytics.js";
import { isAuthenticated } from "./auth.js";

export function authenticationAndAnalyticsWrapped(req, res, next) {
  isAuthenticated(req, res, function(err) {
    if (err) {
        return next(err);
    }
    trackEvent(req, res, next);
  });
}
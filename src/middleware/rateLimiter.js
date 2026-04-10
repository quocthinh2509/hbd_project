const rateLimit = require('express-rate-limit');

/**
 * Rate limiter: max 30 requests/minute per API key (or IP fallback).
 */
const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 30,
  keyGenerator: (req) => req.headers['x-api-key'] || req.ip,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests. Maximum 30 requests per minute per API key.',
    });
  },
});

module.exports = rateLimiter;

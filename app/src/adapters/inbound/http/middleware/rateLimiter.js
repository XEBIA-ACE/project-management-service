'use strict';

const rateLimit = require('express-rate-limit');
const config = require('../../../../config');

/**
 * Rate-limiting middleware.
 *
 * Limits each IP to RATE_LIMIT_MAX_REQUESTS requests per RATE_LIMIT_WINDOW_MS.
 */
const rateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later.',
    },
  },
});

module.exports = rateLimiter;

import rateLimit from 'express-rate-limit';

/**
 * Per-route login rate limiter:
 * • max 5 requests per minute per IP
 * • helps prevent brute-force attacks.
 */
export const loginLimiter = rateLimit({
  windowMs: 60_000,  // 1 minute
  max: 5,
  message: 'Too many login attempts, please try again later.',
});

/**
 * General API limiter:
 * • max 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60_000,
  max: 100,
});

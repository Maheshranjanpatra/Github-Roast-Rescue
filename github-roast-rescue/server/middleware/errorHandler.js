import { config } from '../config/env.js';

// Use this for errors whose message is safe to show to the user.
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found.`
  });
};

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  const status =
    Number.isInteger(err.status) && err.status >= 400 && err.status < 600 ? err.status : 500;

  console.error(`[Server Error] ${req.method} ${req.originalUrl} -> ${status}:`, err.message);
  if (status >= 500 && !(err instanceof HttpError) && config.nodeEnv !== 'production') {
    console.error(err.stack);
  }

  // Never leak internal error text for unexpected 5xx errors in production
  const hideMessage = status >= 500 && !(err instanceof HttpError) && config.nodeEnv === 'production';

  res.status(status).json({
    success: false,
    error: hideMessage ? 'Internal Server Error' : err.message || 'Internal Server Error'
  });
};

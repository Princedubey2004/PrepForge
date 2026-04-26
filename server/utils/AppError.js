// A small custom error class so we can attach HTTP status codes to thrown errors.
// Using this means we never have to check if something is a "real" error or an app error elsewhere.
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // distinguishes our errors from unexpected crashes
    Error.captureStackTrace(this, this.constructor);
  }
}

// Wrap async route handlers so we don't need try/catch in every controller
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { AppError, catchAsync };

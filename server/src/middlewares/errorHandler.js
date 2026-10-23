import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    logger.error(`[${req.method} ${req.originalUrl}] ${err.statusCode} - ${err.message}`, err.stack);
  }

  // Handle Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate value for ${field}: "${err.keyValue[field]}". Please use another value.`;
    return res.status(400).json({
      status: 'fail',
      message
    });
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(el => el.message);
    return res.status(400).json({
      status: 'fail',
      message: `Invalid input data: ${errors.join('. ')}`,
      errors
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid token. Please authenticate again.'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'fail',
      message: 'Your token has expired. Please authenticate again.'
    });
  }

  // Standard operational or unknown error
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message || 'Internal Server Error',
    ...(err.errors && { errors: err.errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

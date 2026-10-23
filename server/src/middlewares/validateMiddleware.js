import { AppError } from '../utils/AppError.js';

export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params
    });
    
    // Replace req with parsed/sanitized objects
    if (parsed.body) req.body = parsed.body;
    if (parsed.query) req.query = parsed.query;
    if (parsed.params) req.params = parsed.params;
    
    next();
  } catch (error) {
    if (error.errors) {
      const messages = error.errors.map(err => `${err.path.slice(1).join('.')}: ${err.message}`);
      return next(new AppError(`Validation error: ${messages.join(', ')}`, 400, messages));
    }
    return next(new AppError('Invalid request parameters', 400));
  }
};

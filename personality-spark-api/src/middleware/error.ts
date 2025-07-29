import { ErrorHandler } from 'hono';
import type { Context } from '../types/env';
import { logger, Logger } from '../utils/logger';

export const errorHandler: ErrorHandler<Context> = (err, c) => {
  const logContext = Logger.createContext(c);
  
  // Log the error with structured logging
  logger.error(`Error in ${c.req.method} ${c.req.url}`, err, logContext);

  // Handle Zod validation errors
  if (err.name === 'ZodError') {
    return c.json({
      error: 'Validation Error',
      message: 'Invalid request data',
      details: JSON.parse(err.message),
      requestId: c.get('requestId'),
    }, 400);
  }

  // Handle JWT errors
  if (err.name === 'JwtTokenInvalid' || err.name === 'JwtTokenExpired') {
    return c.json({
      error: 'Authentication Error',
      message: 'Invalid or expired token',
      requestId: c.get('requestId'),
    }, 401);
  }

  // Handle rate limit errors
  if (err.message?.includes('rate limit')) {
    return c.json({
      error: 'Rate Limit Exceeded',
      message: 'Too many requests, please try again later',
      requestId: c.get('requestId'),
    }, 429);
  }

  // Handle database errors
  if (err.message?.includes('D1_')) {
    return c.json({
      error: 'Database Error',
      message: 'A database error occurred',
      requestId: c.get('requestId'),
    }, 500);
  }

  // Default error response
  const status = err.status || 500;
  const message = err.message || 'An unexpected error occurred';

  return c.json({
    error: status === 500 ? 'Internal Server Error' : 'Error',
    message: message,
    requestId: c.get('requestId'),
    ...(c.env.ENVIRONMENT === 'development' && { stack: err.stack }),
  }, status);
};
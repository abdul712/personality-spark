import { MiddlewareHandler } from 'hono';
import { verify } from 'hono/jwt';
import type { Context } from '../types/env';

export const authenticate = (options?: {
  required?: boolean;
}): MiddlewareHandler<Context> => {
  const { required = true } = options || {};

  return async (c, next) => {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader) {
      if (required) {
        return c.json({
          error: 'Authentication Required',
          message: 'No authorization header provided',
        }, 401);
      }
      await next();
      return;
    }

    const token = authHeader.replace('Bearer ', '');
    
    try {
      const payload = await verify(token, c.env.JWT_SECRET) as {
        sub: string;
        email: string;
        username?: string;
        exp: number;
      };

      // Check if token is expired
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return c.json({
          error: 'Token Expired',
          message: 'Your session has expired, please login again',
        }, 401);
      }

      // Set user in context
      c.set('user', {
        id: payload.sub,
        email: payload.email,
        username: payload.username,
      });

      await next();
    } catch (error) {
      if (required) {
        return c.json({
          error: 'Invalid Token',
          message: 'The provided token is invalid',
        }, 401);
      }
      await next();
    }
  };
};
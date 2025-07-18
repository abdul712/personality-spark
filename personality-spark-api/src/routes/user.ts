import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { sign } from 'hono/jwt';
import type { Context } from '../types/env';
import { authenticate } from '../middleware/auth';
import { UserService } from '../services/userService';

const userRouter = new Hono<Context>();

// Schemas
const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(3).max(20).optional(),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const UpdateProfileSchema = z.object({
  username: z.string().min(3).max(20).optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'auto']).optional(),
    notifications: z.boolean().optional(),
    shareByDefault: z.boolean().optional(),
  }).optional(),
});

// POST /register - Create account
userRouter.post('/register',
  zValidator('json', RegisterSchema),
  async (c) => {
    const { email, password, username } = c.req.valid('json');
    const userService = new UserService(c.env);
    
    try {
      // Check if user already exists
      const existing = await userService.findByEmail(email);
      if (existing) {
        return c.json({
          error: 'Registration Failed',
          message: 'An account with this email already exists',
        }, 409);
      }
      
      // Create user
      const user = await userService.createUser({
        email,
        password,
        username,
      });
      
      // Generate JWT token
      const token = await sign({
        sub: user.id,
        email: user.email,
        username: user.username,
        exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
      }, c.env.JWT_SECRET);
      
      // Create session
      await c.env.SESSIONS.put(
        `session:${user.id}`,
        JSON.stringify({
          userId: user.id,
          createdAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
        }),
        { expirationTtl: 30 * 24 * 60 * 60 } // 30 days
      );
      
      return c.json({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
        token,
      });
    } catch (error) {
      console.error('Registration error:', error);
      return c.json({
        error: 'Registration Failed',
        message: 'Unable to create account',
      }, 500);
    }
  }
);

// POST /login - Login
userRouter.post('/login',
  zValidator('json', LoginSchema),
  async (c) => {
    const { email, password } = c.req.valid('json');
    const userService = new UserService(c.env);
    
    try {
      // Verify credentials
      const user = await userService.verifyCredentials(email, password);
      if (!user) {
        return c.json({
          error: 'Authentication Failed',
          message: 'Invalid email or password',
        }, 401);
      }
      
      // Update last login
      await userService.updateLastLogin(user.id);
      
      // Generate JWT token
      const token = await sign({
        sub: user.id,
        email: user.email,
        username: user.username,
        exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
      }, c.env.JWT_SECRET);
      
      // Update session
      await c.env.SESSIONS.put(
        `session:${user.id}`,
        JSON.stringify({
          userId: user.id,
          createdAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
        }),
        { expirationTtl: 30 * 24 * 60 * 60 } // 30 days
      );
      
      return c.json({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
        token,
      });
    } catch (error) {
      console.error('Login error:', error);
      return c.json({
        error: 'Login Failed',
        message: 'Unable to login',
      }, 500);
    }
  }
);

// GET /profile - Get user profile
userRouter.get('/profile',
  authenticate(),
  async (c) => {
    const user = c.get('user');
    const userService = new UserService(c.env);
    
    try {
      const profile = await userService.getProfile(user!.id);
      if (!profile) {
        return c.json({
          error: 'Not Found',
          message: 'User profile not found',
        }, 404);
      }
      
      return c.json(profile);
    } catch (error) {
      console.error('Profile retrieval error:', error);
      return c.json({
        error: 'Profile Error',
        message: 'Unable to retrieve profile',
      }, 500);
    }
  }
);

// PUT /preferences - Update preferences
userRouter.put('/preferences',
  authenticate(),
  zValidator('json', UpdateProfileSchema),
  async (c) => {
    const user = c.get('user');
    const updates = c.req.valid('json');
    const userService = new UserService(c.env);
    
    try {
      await userService.updateProfile(user!.id, updates);
      
      return c.json({
        message: 'Preferences updated successfully',
      });
    } catch (error) {
      console.error('Update preferences error:', error);
      return c.json({
        error: 'Update Failed',
        message: 'Unable to update preferences',
      }, 500);
    }
  }
);

// GET /history - Quiz history
userRouter.get('/history',
  authenticate(),
  async (c) => {
    const user = c.get('user');
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '10');
    const offset = (page - 1) * limit;
    
    try {
      // Get quiz history
      const results = await c.env.DB.prepare(`
        SELECT id, quiz_type, results, created_at, shared
        FROM quiz_results
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `)
      .bind(user!.id, limit, offset)
      .all();
      
      // Get total count
      const countResult = await c.env.DB.prepare(`
        SELECT COUNT(*) as count
        FROM quiz_results
        WHERE user_id = ?
      `)
      .bind(user!.id)
      .first();
      
      const total = countResult?.count as number || 0;
      
      // Parse results
      const history = results.results.map((row: any) => ({
        ...row,
        results: JSON.parse(row.results),
      }));
      
      return c.json({
        history,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('History retrieval error:', error);
      return c.json({
        error: 'History Error',
        message: 'Unable to retrieve quiz history',
      }, 500);
    }
  }
);

// POST /logout - Logout
userRouter.post('/logout',
  authenticate(),
  async (c) => {
    const user = c.get('user');
    
    try {
      // Delete session
      await c.env.SESSIONS.delete(`session:${user!.id}`);
      
      return c.json({
        message: 'Logged out successfully',
      });
    } catch (error) {
      console.error('Logout error:', error);
      return c.json({
        error: 'Logout Failed',
        message: 'Unable to logout',
      }, 500);
    }
  }
);

// DELETE /account - Delete account
userRouter.delete('/account',
  authenticate(),
  async (c) => {
    const user = c.get('user');
    const userService = new UserService(c.env);
    
    try {
      // Delete user and all related data
      await userService.deleteUser(user!.id);
      
      // Delete session
      await c.env.SESSIONS.delete(`session:${user!.id}`);
      
      return c.json({
        message: 'Account deleted successfully',
      });
    } catch (error) {
      console.error('Account deletion error:', error);
      return c.json({
        error: 'Deletion Failed',
        message: 'Unable to delete account',
      }, 500);
    }
  }
);

export { userRouter };
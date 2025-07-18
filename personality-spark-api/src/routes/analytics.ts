import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Context } from '../types/env';
import { authenticate } from '../middleware/auth';
import { AnalyticsService } from '../services/analyticsService';

const analyticsRouter = new Hono<Context>();

// Schemas
const TrackEventSchema = z.object({
  event: z.string(),
  properties: z.record(z.string(), z.any()).optional(),
  timestamp: z.string().datetime().optional(),
  sessionId: z.string().optional(),
});

const StatsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  metric: z.enum(['users', 'quizzes', 'completion_rate', 'share_rate']).optional(),
  groupBy: z.enum(['day', 'week', 'month']).optional(),
});

// POST /track - Track events
analyticsRouter.post('/track',
  authenticate({ required: false }),
  zValidator('json', TrackEventSchema),
  async (c) => {
    const event = c.req.valid('json');
    const user = c.get('user');
    const analyticsService = new AnalyticsService(c.env);
    
    try {
      // Get session ID from header or generate new one
      const sessionId = event.sessionId || c.req.header('X-Session-ID') || crypto.randomUUID();
      
      // Track event
      await analyticsService.trackEvent({
        event_type: event.event,
        user_id: user?.id,
        session_id: sessionId,
        properties: event.properties || {},
        timestamp: event.timestamp || new Date().toISOString(),
        ip_address: c.req.header('CF-Connecting-IP'),
        user_agent: c.req.header('User-Agent'),
      });
      
      // Special handling for quiz completion events
      if (event.event === 'quiz_completed' && event.properties?.quiz_type) {
        await analyticsService.updateQuizMetrics({
          quiz_type: event.properties.quiz_type,
          completed: true,
          time_taken: event.properties.time_taken,
          shared: event.properties.shared || false,
        });
      }
      
      return c.json({
        success: true,
        sessionId,
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
      // Don't fail the request for analytics errors
      return c.json({
        success: false,
        message: 'Analytics tracking failed',
      });
    }
  }
);

// GET /stats - Get statistics
analyticsRouter.get('/stats',
  authenticate({ required: false }),
  zValidator('query', StatsQuerySchema),
  async (c) => {
    const query = c.req.valid('query');
    const analyticsService = new AnalyticsService(c.env);
    
    try {
      // Default to last 30 days if no date range specified
      const endDate = query.endDate || new Date().toISOString();
      const startDate = query.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      
      const stats = await analyticsService.getStats({
        startDate,
        endDate,
        metric: query.metric,
        groupBy: query.groupBy || 'day',
      });
      
      return c.json(stats);
    } catch (error) {
      console.error('Analytics stats error:', error);
      return c.json({
        error: 'Stats Error',
        message: 'Unable to retrieve statistics',
      }, 500);
    }
  }
);

// GET /dashboard - Admin dashboard stats
analyticsRouter.get('/dashboard',
  authenticate(),
  async (c) => {
    const user = c.get('user');
    
    // Check if user is admin (you might want to add an admin flag to users)
    if (user?.email !== 'admin@personalityspark.com') {
      return c.json({
        error: 'Forbidden',
        message: 'Admin access required',
      }, 403);
    }
    
    const analyticsService = new AnalyticsService(c.env);
    
    try {
      const dashboard = await analyticsService.getDashboardStats();
      
      return c.json(dashboard);
    } catch (error) {
      console.error('Dashboard stats error:', error);
      return c.json({
        error: 'Dashboard Error',
        message: 'Unable to retrieve dashboard statistics',
      }, 500);
    }
  }
);

// GET /events - Get recent events
analyticsRouter.get('/events',
  authenticate(),
  async (c) => {
    const user = c.get('user');
    
    // Check if user is admin
    if (user?.email !== 'admin@personalityspark.com') {
      return c.json({
        error: 'Forbidden',
        message: 'Admin access required',
      }, 403);
    }
    
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '50');
    const eventType = c.req.query('event_type');
    
    try {
      let query = `
        SELECT * FROM analytics_events
      `;
      
      const params = [];
      if (eventType) {
        query += ' WHERE event_type = ?';
        params.push(eventType);
      }
      
      query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
      params.push(limit, (page - 1) * limit);
      
      const events = await c.env.DB.prepare(query)
        .bind(...params)
        .all();
      
      return c.json({
        events: events.results,
        pagination: {
          page,
          limit,
          hasMore: events.results.length === limit,
        },
      });
    } catch (error) {
      console.error('Events retrieval error:', error);
      return c.json({
        error: 'Events Error',
        message: 'Unable to retrieve events',
      }, 500);
    }
  }
);

// POST /batch - Batch track events
analyticsRouter.post('/batch',
  authenticate({ required: false }),
  zValidator('json', z.object({
    events: z.array(TrackEventSchema),
  })),
  async (c) => {
    const { events } = c.req.valid('json');
    const user = c.get('user');
    const analyticsService = new AnalyticsService(c.env);
    
    try {
      const sessionId = c.req.header('X-Session-ID') || crypto.randomUUID();
      
      // Process events in batch
      await Promise.all(events.map(event =>
        analyticsService.trackEvent({
          event_type: event.event,
          user_id: user?.id,
          session_id: event.sessionId || sessionId,
          properties: event.properties || {},
          timestamp: event.timestamp || new Date().toISOString(),
          ip_address: c.req.header('CF-Connecting-IP'),
          user_agent: c.req.header('User-Agent'),
        })
      ));
      
      return c.json({
        success: true,
        processed: events.length,
      });
    } catch (error) {
      console.error('Batch analytics error:', error);
      return c.json({
        success: false,
        message: 'Batch tracking failed',
      });
    }
  }
);

export { analyticsRouter };
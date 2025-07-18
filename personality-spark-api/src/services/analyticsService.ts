import type { Env } from '../types/env';

export class AnalyticsService {
  constructor(private env: Env) {}

  async trackEvent(event: {
    event_type: string;
    user_id?: string;
    session_id: string;
    properties: Record<string, any>;
    timestamp: string;
    ip_address?: string;
    user_agent?: string;
  }): Promise<void> {
    try {
      // Insert into analytics events table
      await this.env.DB.prepare(`
        INSERT INTO analytics_events (
          event_type, user_id, session_id, properties, 
          timestamp, ip_address, user_agent
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        event.event_type,
        event.user_id || null,
        event.session_id,
        JSON.stringify(event.properties),
        event.timestamp,
        event.ip_address || null,
        event.user_agent || null
      )
      .run();

      // Update real-time counters in KV
      await this.updateRealtimeCounters(event);
    } catch (error) {
      console.error('Analytics tracking error:', error);
      // Don't throw - analytics should not break the app
    }
  }

  async updateQuizMetrics(data: {
    quiz_type: string;
    completed: boolean;
    time_taken?: number;
    shared: boolean;
  }): Promise<void> {
    const date = new Date().toISOString().split('T')[0];
    
    try {
      // Update or insert daily quiz analytics
      await this.env.DB.prepare(`
        INSERT INTO quiz_analytics (quiz_type, created_at, completion_count, share_count, total_time)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(quiz_type, created_at) DO UPDATE SET
          completion_count = completion_count + excluded.completion_count,
          share_count = share_count + excluded.share_count,
          total_time = total_time + excluded.total_time
      `)
      .bind(
        data.quiz_type,
        date,
        data.completed ? 1 : 0,
        data.shared ? 1 : 0,
        data.time_taken || 0
      )
      .run();
    } catch (error) {
      console.error('Quiz metrics update error:', error);
    }
  }

  async getStats(params: {
    startDate: string;
    endDate: string;
    metric?: string;
    groupBy: 'day' | 'week' | 'month';
  }): Promise<any> {
    const { startDate, endDate, metric, groupBy } = params;
    
    try {
      // Base query for aggregated stats
      let query = `
        SELECT 
          DATE(timestamp) as date,
          COUNT(DISTINCT session_id) as unique_sessions,
          COUNT(DISTINCT user_id) as unique_users,
          COUNT(*) as total_events,
          COUNT(CASE WHEN event_type = 'quiz_started' THEN 1 END) as quizzes_started,
          COUNT(CASE WHEN event_type = 'quiz_completed' THEN 1 END) as quizzes_completed,
          COUNT(CASE WHEN event_type = 'result_shared' THEN 1 END) as results_shared
        FROM analytics_events
        WHERE timestamp >= ? AND timestamp <= ?
        GROUP BY DATE(timestamp)
        ORDER BY date DESC
      `;
      
      const stats = await this.env.DB.prepare(query)
        .bind(startDate, endDate)
        .all();
      
      // Calculate derived metrics
      const processedStats = stats.results.map((row: any) => ({
        date: row.date,
        uniqueSessions: row.unique_sessions,
        uniqueUsers: row.unique_users,
        totalEvents: row.total_events,
        quizzesStarted: row.quizzes_started,
        quizzesCompleted: row.quizzes_completed,
        completionRate: row.quizzes_started > 0 
          ? (row.quizzes_completed / row.quizzes_started * 100).toFixed(2)
          : 0,
        resultsShared: row.results_shared,
        shareRate: row.quizzes_completed > 0
          ? (row.results_shared / row.quizzes_completed * 100).toFixed(2)
          : 0,
      }));
      
      // Get quiz type breakdown
      const quizBreakdown = await this.env.DB.prepare(`
        SELECT 
          json_extract(properties, '$.quiz_type') as quiz_type,
          COUNT(*) as count
        FROM analytics_events
        WHERE event_type = 'quiz_completed'
          AND timestamp >= ? AND timestamp <= ?
          AND json_extract(properties, '$.quiz_type') IS NOT NULL
        GROUP BY quiz_type
        ORDER BY count DESC
      `)
      .bind(startDate, endDate)
      .all();
      
      return {
        summary: {
          totalUsers: processedStats.reduce((sum: number, s: any) => sum + s.uniqueUsers, 0),
          totalSessions: processedStats.reduce((sum: number, s: any) => sum + s.uniqueSessions, 0),
          totalQuizzes: processedStats.reduce((sum: number, s: any) => sum + s.quizzesCompleted, 0),
          avgCompletionRate: this.calculateAverage(processedStats.map((s: any) => parseFloat(s.completionRate))),
          avgShareRate: this.calculateAverage(processedStats.map((s: any) => parseFloat(s.shareRate))),
        },
        timeline: processedStats,
        quizBreakdown: quizBreakdown.results,
      };
    } catch (error) {
      console.error('Get stats error:', error);
      throw error;
    }
  }

  async getDashboardStats(): Promise<any> {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    try {
      // Today's stats
      const todayStats = await this.getStats({
        startDate: today,
        endDate: today,
        groupBy: 'day',
      });
      
      // Yesterday's stats for comparison
      const yesterdayStats = await this.getStats({
        startDate: yesterday,
        endDate: yesterday,
        groupBy: 'day',
      });
      
      // Last 7 days
      const weekStats = await this.getStats({
        startDate: lastWeek,
        endDate: today,
        groupBy: 'day',
      });
      
      // Last 30 days
      const monthStats = await this.getStats({
        startDate: lastMonth,
        endDate: today,
        groupBy: 'day',
      });
      
      // Real-time stats from KV
      const realtimeUsers = await this.env.CACHE.get('analytics:realtime:users') || '0';
      const realtimeQuizzes = await this.env.CACHE.get('analytics:realtime:quizzes') || '0';
      
      // Top performing quizzes
      const topQuizzes = await this.env.DB.prepare(`
        SELECT 
          quiz_type,
          AVG(completion_rate) as avg_completion_rate,
          AVG(share_rate) as avg_share_rate,
          SUM(completion_count) as total_completions
        FROM quiz_analytics
        WHERE created_at >= ?
        GROUP BY quiz_type
        ORDER BY total_completions DESC
        LIMIT 5
      `)
      .bind(lastWeek)
      .all();
      
      return {
        realtime: {
          activeUsers: parseInt(realtimeUsers),
          activeQuizzes: parseInt(realtimeQuizzes),
        },
        today: {
          users: todayStats.summary.totalUsers,
          sessions: todayStats.summary.totalSessions,
          quizzes: todayStats.summary.totalQuizzes,
          change: {
            users: this.calculatePercentageChange(
              todayStats.summary.totalUsers,
              yesterdayStats.summary.totalUsers
            ),
            quizzes: this.calculatePercentageChange(
              todayStats.summary.totalQuizzes,
              yesterdayStats.summary.totalQuizzes
            ),
          },
        },
        week: weekStats.summary,
        month: monthStats.summary,
        topQuizzes: topQuizzes.results,
        charts: {
          daily: weekStats.timeline,
          monthly: monthStats.timeline,
        },
      };
    } catch (error) {
      console.error('Dashboard stats error:', error);
      throw error;
    }
  }

  private async updateRealtimeCounters(event: any): Promise<void> {
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    
    try {
      // Update active users counter
      const activeUsersKey = 'analytics:realtime:users';
      const activeUsers = await this.env.CACHE.get<Record<string, number>>(activeUsersKey) || {};
      
      // Add or update user timestamp
      if (event.user_id || event.session_id) {
        const userId = event.user_id || event.session_id;
        activeUsers[userId] = now;
      }
      
      // Remove inactive users
      for (const [userId, timestamp] of Object.entries(activeUsers)) {
        if (timestamp < fiveMinutesAgo) {
          delete activeUsers[userId];
        }
      }
      
      await this.env.CACHE.put(activeUsersKey, JSON.stringify(activeUsers), {
        expirationTtl: 600, // 10 minutes
      });
      
      // Update active users count
      await this.env.CACHE.put(
        'analytics:realtime:users:count',
        Object.keys(activeUsers).length.toString(),
        { expirationTtl: 600 }
      );
      
      // Update quiz counter if relevant
      if (event.event_type === 'quiz_started') {
        const activeQuizzesKey = 'analytics:realtime:quizzes';
        const activeQuizzes = await this.env.CACHE.get<Record<string, number>>(activeQuizzesKey) || {};
        
        activeQuizzes[event.session_id] = now;
        
        // Remove old quiz sessions
        for (const [sessionId, timestamp] of Object.entries(activeQuizzes)) {
          if (timestamp < fiveMinutesAgo) {
            delete activeQuizzes[sessionId];
          }
        }
        
        await this.env.CACHE.put(activeQuizzesKey, JSON.stringify(activeQuizzes), {
          expirationTtl: 600,
        });
        
        await this.env.CACHE.put(
          'analytics:realtime:quizzes:count',
          Object.keys(activeQuizzes).length.toString(),
          { expirationTtl: 600 }
        );
      }
    } catch (error) {
      console.error('Realtime counter update error:', error);
    }
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    const sum = values.reduce((a, b) => a + b, 0);
    return parseFloat((sum / values.length).toFixed(2));
  }

  private calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return parseFloat(((current - previous) / previous * 100).toFixed(2));
  }
}
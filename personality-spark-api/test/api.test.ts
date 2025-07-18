import { describe, it, expect } from 'vitest';
import app from '../src/index';

describe('API Tests', () => {
  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await app.request('/health');
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.status).toBe('healthy');
      expect(data.timestamp).toBeDefined();
    });
  });

  describe('Quiz Endpoints', () => {
    it('should list quiz categories', async () => {
      const response = await app.request('/api/v1/quizzes/categories');
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.categories).toBeDefined();
      expect(Array.isArray(data.categories)).toBe(true);
      expect(data.categories.length).toBeGreaterThan(0);
    });

    it('should handle invalid quiz type', async () => {
      const response = await app.request('/api/v1/quizzes/generate/invalid-type');
      
      expect(response.status).toBe(500);
    });
  });

  describe('Analytics Endpoints', () => {
    it('should track events', async () => {
      const response = await app.request('/api/v1/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'test_event',
          properties: {
            test: true,
          },
        }),
      });
      
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for unknown endpoints', async () => {
      const response = await app.request('/api/v1/unknown');
      const data = await response.json();
      
      expect(response.status).toBe(404);
      expect(data.error).toBe('Not Found');
    });

    it('should validate request body', async () => {
      const response = await app.request('/api/v1/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'invalid-email',
          password: '123', // Too short
        }),
      });
      
      expect(response.status).toBe(400);
    });
  });

  describe('CORS', () => {
    it('should handle CORS headers', async () => {
      const response = await app.request('/health', {
        headers: {
          'Origin': 'http://localhost:3000',
        },
      });
      
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
      expect(response.headers.get('Access-Control-Allow-Credentials')).toBe('true');
    });
  });
});
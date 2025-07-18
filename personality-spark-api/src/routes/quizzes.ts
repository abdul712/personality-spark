import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Context } from '../types/env';
import { QuizSubmissionSchema } from '../types/models';
import { authenticate } from '../middleware/auth';
import { QuizService } from '../services/quizService';
import { CacheService } from '../services/cacheService';

const quizRouter = new Hono<Context>();

// GET /generate/:quiz_type - Generate new AI quiz
quizRouter.get('/generate/:quiz_type',
  authenticate({ required: false }),
  async (c) => {
    const quizType = c.req.param('quiz_type');
    const theme = c.req.query('theme');
    const difficulty = c.req.query('difficulty') as 'easy' | 'medium' | 'hard' | undefined;
    
    const cacheService = new CacheService(c.env.CACHE);
    const quizService = new QuizService(c.env.AI, cacheService);
    
    try {
      // Check cache first
      const cacheKey = `quiz:${quizType}:${theme || 'default'}:${difficulty || 'medium'}`;
      const cached = await cacheService.get(cacheKey);
      
      if (cached) {
        return c.json(cached);
      }
      
      // Generate new quiz
      const quiz = await quizService.generateQuiz({
        type: quizType,
        theme,
        difficulty,
      });
      
      // Cache for 1 hour
      await cacheService.set(cacheKey, quiz, 3600);
      
      return c.json(quiz);
    } catch (error) {
      console.error('Error generating quiz:', error);
      return c.json({
        error: 'Quiz Generation Failed',
        message: 'Unable to generate quiz at this time',
      }, 500);
    }
  }
);

// GET /daily - Get daily challenge
quizRouter.get('/daily', async (c) => {
  const cacheService = new CacheService(c.env.CACHE);
  const quizService = new QuizService(c.env.AI, cacheService);
  
  try {
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `daily-quiz:${today}`;
    
    // Check cache
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return c.json(cached);
    }
    
    // Generate daily quiz
    const quiz = await quizService.generateDailyChallenge();
    
    // Cache until end of day
    const endOfDay = new Date();
    endOfDay.setUTCHours(23, 59, 59, 999);
    const ttl = Math.floor((endOfDay.getTime() - Date.now()) / 1000);
    
    await cacheService.set(cacheKey, quiz, ttl);
    
    return c.json(quiz);
  } catch (error) {
    console.error('Error getting daily challenge:', error);
    return c.json({
      error: 'Daily Challenge Error',
      message: 'Unable to retrieve daily challenge',
    }, 500);
  }
});

// POST /submit - Submit quiz answers
quizRouter.post('/submit',
  authenticate({ required: false }),
  zValidator('json', QuizSubmissionSchema),
  async (c) => {
    const submission = c.req.valid('json');
    const user = c.get('user');
    
    const quizService = new QuizService(c.env.AI, new CacheService(c.env.CACHE));
    
    try {
      // Calculate results
      const result = await quizService.calculateResults(submission);
      
      // Save to database if user is authenticated
      if (user) {
        await c.env.DB.prepare(`
          INSERT INTO quiz_results (id, user_id, quiz_type, results, created_at)
          VALUES (?, ?, ?, ?, ?)
        `)
        .bind(
          result.id,
          user.id,
          result.quiz_type,
          JSON.stringify(result.results),
          result.created_at
        )
        .run();
      }
      
      // Store result in KV for retrieval
      await c.env.CACHE.put(
        `result:${result.id}`,
        JSON.stringify(result),
        { expirationTtl: 86400 } // 24 hours
      );
      
      return c.json(result);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      return c.json({
        error: 'Submission Failed',
        message: 'Unable to process quiz submission',
      }, 500);
    }
  }
);

// GET /result/:result_id - Get quiz results
quizRouter.get('/result/:result_id', async (c) => {
  const resultId = c.req.param('result_id');
  
  try {
    // Check cache first
    const cached = await c.env.CACHE.get(`result:${resultId}`);
    if (cached) {
      return c.json(JSON.parse(cached));
    }
    
    // Check database
    const result = await c.env.DB.prepare(`
      SELECT * FROM quiz_results WHERE id = ?
    `)
    .bind(resultId)
    .first();
    
    if (!result) {
      return c.json({
        error: 'Not Found',
        message: 'Quiz result not found',
      }, 404);
    }
    
    // Parse JSON fields
    const parsedResult = {
      ...result,
      results: JSON.parse(result.results as string),
    };
    
    return c.json(parsedResult);
  } catch (error) {
    console.error('Error retrieving result:', error);
    return c.json({
      error: 'Retrieval Failed',
      message: 'Unable to retrieve quiz result',
    }, 500);
  }
});

// GET /categories - List quiz categories
quizRouter.get('/categories', async (c) => {
  const categories = [
    {
      id: 'big5',
      name: 'Big 5 Personality',
      description: 'Discover your personality across five major dimensions',
      icon: 'brain',
      questions: 20,
      duration: '5-7 minutes',
    },
    {
      id: 'daily',
      name: 'Daily Challenge',
      description: 'A new personality challenge every day',
      icon: 'calendar',
      questions: 10,
      duration: '3-5 minutes',
    },
    {
      id: 'quick5',
      name: 'Quick 5',
      description: 'Get personality insights in just 5 questions',
      icon: 'zap',
      questions: 5,
      duration: '1-2 minutes',
    },
    {
      id: 'thisorthat',
      name: 'This or That',
      description: 'Rapid-fire personality assessment',
      icon: 'shuffle',
      questions: 15,
      duration: '2-3 minutes',
    },
    {
      id: 'mood',
      name: 'Mood-Based',
      description: 'Personality insights based on your current mood',
      icon: 'smile',
      questions: 12,
      duration: '3-4 minutes',
    },
  ];
  
  return c.json({ categories });
});

export { quizRouter };
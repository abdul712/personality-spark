import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Context } from '../types/env';
import { authenticate } from '../middleware/auth';
import { AIService } from '../services/aiService';

const aiRouter = new Hono<Context>();

// Schema for AI requests
const GenerateQuizSchema = z.object({
  type: z.string(),
  theme: z.string().optional(),
  numQuestions: z.number().min(5).max(50).default(10),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  audience: z.string().optional(),
});

const AnalyzePersonalitySchema = z.object({
  responses: z.array(z.object({
    questionId: z.number(),
    answer: z.string(),
    traits: z.record(z.string(), z.number()).optional(),
  })),
  quizType: z.string(),
});

const GenerateInsightsSchema = z.object({
  personalityTraits: z.record(z.string(), z.number()),
  primaryType: z.string(),
  context: z.string().optional(),
});

// POST /generate-quiz - AI quiz generation
aiRouter.post('/generate-quiz',
  authenticate({ required: false }),
  zValidator('json', GenerateQuizSchema),
  async (c) => {
    const params = c.req.valid('json');
    const aiService = new AIService(c.env);
    
    try {
      const quiz = await aiService.generateQuiz(params);
      return c.json(quiz);
    } catch (error) {
      console.error('AI quiz generation error:', error);
      return c.json({
        error: 'Generation Failed',
        message: 'Unable to generate quiz using AI',
      }, 500);
    }
  }
);

// POST /analyze-personality - AI personality analysis
aiRouter.post('/analyze-personality',
  authenticate({ required: false }),
  zValidator('json', AnalyzePersonalitySchema),
  async (c) => {
    const { responses, quizType } = c.req.valid('json');
    const aiService = new AIService(c.env);
    
    try {
      const analysis = await aiService.analyzePersonality(responses, quizType);
      return c.json(analysis);
    } catch (error) {
      console.error('AI personality analysis error:', error);
      return c.json({
        error: 'Analysis Failed',
        message: 'Unable to analyze personality',
      }, 500);
    }
  }
);

// POST /generate-insights - AI insights generation
aiRouter.post('/generate-insights',
  authenticate({ required: false }),
  zValidator('json', GenerateInsightsSchema),
  async (c) => {
    const params = c.req.valid('json');
    const aiService = new AIService(c.env);
    
    try {
      const insights = await aiService.generateInsights(params);
      return c.json(insights);
    } catch (error) {
      console.error('AI insights generation error:', error);
      return c.json({
        error: 'Generation Failed',
        message: 'Unable to generate insights',
      }, 500);
    }
  }
);

// GET /models - List available AI models
aiRouter.get('/models', async (c) => {
  const models = [
    {
      id: '@cf/meta/llama-3.1-8b-instruct',
      name: 'Llama 3.1 8B',
      type: 'text-generation',
      provider: 'workers-ai',
      description: 'Fast and efficient for quiz generation',
    },
    {
      id: '@cf/mistralai/mistral-7b-instruct-v0.2-lora',
      name: 'Mistral 7B',
      type: 'text-generation',
      provider: 'workers-ai',
      description: 'Great for personality analysis',
    },
    {
      id: 'deepseek-chat',
      name: 'DeepSeek Chat',
      type: 'text-generation',
      provider: 'deepseek',
      description: 'Cost-effective for complex analysis',
    },
  ];
  
  return c.json({ models });
});

export { aiRouter };
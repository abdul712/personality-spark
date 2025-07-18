import { z } from 'zod';

// User schema
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  username: z.string().optional(),
  created_at: z.string().datetime(),
  last_login: z.string().datetime().optional(),
});

export type User = z.infer<typeof UserSchema>;

// Quiz schemas
export const QuizQuestionSchema = z.object({
  id: z.number(),
  text: z.string(),
  options: z.array(z.object({
    text: z.string(),
    value: z.string(),
    trait_scores: z.record(z.string(), z.number()).optional(),
  })),
});

export const QuizSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  description: z.string(),
  questions: z.array(QuizQuestionSchema),
  theme: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  created_at: z.string().datetime(),
});

export type Quiz = z.infer<typeof QuizSchema>;
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

// Quiz submission
export const QuizSubmissionSchema = z.object({
  quiz_id: z.string(),
  answers: z.array(z.object({
    question_id: z.number(),
    selected_option: z.number(),
  })),
  time_taken: z.number().optional(),
});

export type QuizSubmission = z.infer<typeof QuizSubmissionSchema>;

// Quiz result
export const QuizResultSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid().optional(),
  quiz_id: z.string(),
  quiz_type: z.string(),
  results: z.object({
    personality_traits: z.record(z.string(), z.number()),
    primary_type: z.string(),
    secondary_type: z.string().optional(),
    strengths: z.array(z.string()),
    areas_for_growth: z.array(z.string()),
    compatibility_insights: z.array(z.string()).optional(),
    career_suggestions: z.array(z.string()).optional(),
    surprising_insight: z.string().optional(),
  }),
  score: z.number().optional(),
  percentile: z.number().optional(),
  created_at: z.string().datetime(),
  shared: z.boolean().default(false),
  share_id: z.string().optional(),
});

export type QuizResult = z.infer<typeof QuizResultSchema>;

// Share card
export const ShareCardSchema = z.object({
  id: z.string(),
  result_id: z.string(),
  image_url: z.string().url(),
  title: z.string(),
  description: z.string(),
  created_at: z.string().datetime(),
});

export type ShareCard = z.infer<typeof ShareCardSchema>;

// Analytics event
export const AnalyticsEventSchema = z.object({
  event_type: z.string(),
  user_id: z.string().optional(),
  session_id: z.string(),
  properties: z.record(z.string(), z.any()),
  timestamp: z.string().datetime(),
});

export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>;
// Quiz-related type definitions

export interface QuizCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  duration: string;
  questions: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface QuizQuestion {
  id: number;
  text: string;
  category?: string;
  questionType?: 'multiple-choice' | 'this-or-that' | 'scale' | 'ranking';
  options: QuizOption[];
  imageUrl?: string;
  timeLimit?: number; // in seconds
}

export interface QuizOption {
  text: string;
  value: string;
  trait_scores?: Record<string, number>;
  imageUrl?: string;
}

export interface Quiz {
  id: string;
  type: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  theme?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  created_at: string;
  estimatedTime?: number; // in minutes
  totalQuestions: number;
}

export interface QuizResponse {
  questionId: number;
  answer: string;
  responseTime?: number; // in milliseconds
  traits?: Record<string, number>;
}

export interface QuizResult {
  id: string;
  quizType: string;
  userId?: string;
  responses: QuizResponse[];
  personality_traits: Record<string, number>;
  primary_type: string;
  secondary_type?: string;
  strengths: string[];
  areas_for_growth: string[];
  compatibility_insights?: string[];
  career_suggestions?: string[];
  surprising_insight?: string;
  shareUrl?: string;
  created_at: string;
}

export interface PersonalityInsights {
  key_insights: string[];
  growth_tips: string[];
  relationship_advice: string[];
  career_guidance: string[];
  daily_habits: string[];
}

export interface ShareCard {
  id: string;
  resultId: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  traits: Array<{
    name: string;
    score: number;
    color: string;
  }>;
  shareText: string;
  shortUrl: string;
}

// Question type specific interfaces
export interface ScaleQuestion extends QuizQuestion {
  questionType: 'scale';
  minValue: number;
  maxValue: number;
  minLabel: string;
  maxLabel: string;
  step?: number;
}

export interface RankingQuestion extends QuizQuestion {
  questionType: 'ranking';
  itemsToRank: string[];
  maxSelections?: number;
}

// Quiz state management
export interface QuizState {
  currentQuiz: Quiz | null;
  currentQuestionIndex: number;
  answers: Record<number, string>;
  startTime: Date;
  endTime?: Date;
  isLoading: boolean;
  error: string | null;
}

// API request/response types
export interface GenerateQuizRequest {
  type: string;
  theme?: string;
  numQuestions?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  audience?: string;
  userPreferences?: Record<string, any>;
}

export interface SubmitQuizRequest {
  quizId: string;
  responses: QuizResponse[];
  completionTime: number; // in seconds
}

export interface QuizAnalyticsData {
  quizType: string;
  completionRate: number;
  avgTimeSeconds: number;
  shareRate: number;
  popularTraits: Array<{
    trait: string;
    percentage: number;
  }>;
  date: string;
}
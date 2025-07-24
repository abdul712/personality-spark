import type { Env } from '../types/env';
import { Quiz, QuizQuestion } from '../types/models';
import quizQuestions from '../../../backend/data/quiz-questions.json';
import quizTemplates from '../../../backend/data/quiz-templates.json';

export class QuestionLoader {
  private questionCache: Map<string, any[]> = new Map();
  
  constructor(private env: Env) {}

  /**
   * Load questions for a specific quiz type
   */
  async loadQuestions(quizType: string, count?: number): Promise<QuizQuestion[]> {
    // Check cache first
    if (this.questionCache.has(quizType)) {
      const cachedQuestions = this.questionCache.get(quizType)!;
      return this.selectRandomQuestions(cachedQuestions, count);
    }

    // Load from question banks
    const questions = await this.loadFromQuestionBank(quizType);
    
    // Cache for future use
    this.questionCache.set(quizType, questions);
    
    return this.selectRandomQuestions(questions, count);
  }

  /**
   * Load questions from the question bank JSON files
   */
  private async loadFromQuestionBank(quizType: string): Promise<any[]> {
    // Check main quiz questions first
    const mainQuizzes = quizQuestions as any;
    if (mainQuizzes[quizType]) {
      return mainQuizzes[quizType].questions;
    }

    // Check template quizzes
    const templates = quizTemplates as any;
    if (templates[quizType]) {
      return templates[quizType].questionBank;
    }

    // Default to quick assessment questions
    return mainQuizzes.quick?.questions || [];
  }

  /**
   * Select random questions from a pool
   */
  private selectRandomQuestions(questions: any[], count?: number): any[] {
    if (!count || count >= questions.length) {
      return [...questions];
    }

    // Fisher-Yates shuffle algorithm for truly random selection
    const shuffled = [...questions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, count);
  }

  /**
   * Get questions based on user context (time of day, mood, etc.)
   */
  async getContextualQuestions(
    quizType: string,
    context: {
      timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
      userMood?: string;
      previousQuizzes?: string[];
    },
    count?: number
  ): Promise<QuizQuestion[]> {
    const allQuestions = await this.loadQuestions(quizType);
    
    // Filter based on context
    let filteredQuestions = allQuestions;
    
    if (quizType === 'daily' && context.timeOfDay) {
      // Filter daily questions based on time
      filteredQuestions = allQuestions.filter((q: any) => {
        if (context.timeOfDay === 'morning' && q.category?.includes('morning')) return true;
        if (context.timeOfDay === 'afternoon' && q.category?.includes('energy')) return true;
        if (context.timeOfDay === 'evening' && q.category?.includes('mood')) return true;
        if (context.timeOfDay === 'night' && q.category?.includes('reflection')) return true;
        return true; // Include general questions
      });
    }

    if (quizType === 'mood' && context.userMood) {
      // Prioritize questions that match current mood
      const moodQuestions = filteredQuestions.filter((q: any) => 
        q.category?.toLowerCase().includes(context.userMood.toLowerCase())
      );
      
      if (moodQuestions.length > 0) {
        filteredQuestions = [
          ...moodQuestions,
          ...filteredQuestions.filter((q: any) => !moodQuestions.includes(q))
        ];
      }
    }

    return this.selectRandomQuestions(filteredQuestions, count);
  }

  /**
   * Get question variations for A/B testing
   */
  async getQuestionVariations(
    quizType: string,
    questionId: number,
    variationCount: number = 2
  ): Promise<any[]> {
    const questions = await this.loadQuestions(quizType);
    const originalQuestion = questions.find((q: any) => q.id === questionId);
    
    if (!originalQuestion) {
      return [];
    }

    // Generate variations
    const variations = [originalQuestion];
    
    // Simple variations by changing phrasing
    const phrasings = [
      { prefix: "How often do you", suffix: "?" },
      { prefix: "To what extent do you", suffix: "?" },
      { prefix: "Would you say you", suffix: "?" },
    ];

    for (let i = 1; i < variationCount && i < phrasings.length; i++) {
      const variation = {
        ...originalQuestion,
        id: `${originalQuestion.id}_v${i}`,
        text: `${phrasings[i].prefix} ${originalQuestion.text.toLowerCase()}${phrasings[i].suffix}`,
        variation: i
      };
      variations.push(variation);
    }

    return variations;
  }

  /**
   * Get quiz metadata
   */
  async getQuizMetadata(quizType: string): Promise<{
    title: string;
    description: string;
    estimatedTime: number;
    totalQuestions: number;
    difficulty: string;
  }> {
    const mainQuizzes = quizQuestions as any;
    const templates = quizTemplates as any;
    
    const quizData = mainQuizzes[quizType] || templates[quizType];
    
    if (!quizData) {
      return {
        title: 'Personality Assessment',
        description: 'Discover insights about your personality',
        estimatedTime: 5,
        totalQuestions: 10,
        difficulty: 'medium'
      };
    }

    const questions = quizData.questions || quizData.questionBank || [];
    
    return {
      title: quizData.title,
      description: quizData.description,
      estimatedTime: Math.ceil(questions.length * 0.5), // Estimate 30 seconds per question
      totalQuestions: questions.length,
      difficulty: quizData.difficulty || 'medium'
    };
  }

  /**
   * Validate question integrity
   */
  validateQuestions(questions: any[]): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    questions.forEach((q, index) => {
      if (!q.id) errors.push(`Question ${index} missing ID`);
      if (!q.text) errors.push(`Question ${index} missing text`);
      if (!q.options || q.options.length < 2) {
        errors.push(`Question ${index} needs at least 2 options`);
      }
      
      q.options?.forEach((opt: any, optIndex: number) => {
        if (!opt.text) errors.push(`Question ${index} option ${optIndex} missing text`);
        if (!opt.value) errors.push(`Question ${index} option ${optIndex} missing value`);
      });
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Clear question cache
   */
  clearCache(quizType?: string): void {
    if (quizType) {
      this.questionCache.delete(quizType);
    } else {
      this.questionCache.clear();
    }
  }
}
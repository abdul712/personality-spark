import type { Ai } from '@cloudflare/workers-types';
import { Quiz, QuizSubmission, QuizResult } from '../types/models';
import { CacheService } from './cacheService';
import { AIService } from './aiService';

export class QuizService {
  private aiService: AIService;

  constructor(
    private ai: Ai,
    private cacheService: CacheService
  ) {
    this.aiService = new AIService({ AI: ai } as any);
  }

  async generateQuiz(params: {
    type: string;
    theme?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
  }): Promise<Quiz> {
    // Use AI service to generate quiz
    return this.aiService.generateQuiz({
      type: params.type,
      theme: params.theme,
      numQuestions: this.getQuestionCount(params.type),
      difficulty: params.difficulty || 'medium',
    });
  }

  async generateDailyChallenge(): Promise<Quiz> {
    // Generate a unique daily challenge based on the date
    const date = new Date();
    const seed = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    
    // Rotate through different quiz types
    const types = ['big5', 'quick5', 'mood', 'thisorthat'];
    const typeIndex = date.getDate() % types.length;
    const quizType = types[typeIndex];
    
    // Generate themed quiz based on day of week
    const themes = [
      'weekend vibes',
      'monday motivation',
      'midweek energy',
      'creative flow',
      'social connections',
      'personal growth',
      'work-life balance',
    ];
    const theme = themes[date.getDay()];
    
    const quiz = await this.generateQuiz({
      type: quizType,
      theme,
      difficulty: 'medium',
    });
    
    // Customize for daily challenge
    quiz.title = `Daily Challenge: ${quiz.title}`;
    quiz.description = `Today's personality challenge explores ${theme}. Complete it to maintain your streak!`;
    
    return quiz;
  }

  async calculateResults(submission: QuizSubmission): Promise<QuizResult> {
    // Get quiz data from cache or generate mock data
    const quizData = await this.cacheService.get(`quiz:${submission.quiz_id}`);
    
    // Calculate personality traits based on answers
    const traits: Record<string, number> = {};
    const traitCounts: Record<string, number> = {};
    
    for (const answer of submission.answers) {
      // In a real implementation, we'd look up the question and selected option
      // to get the trait scores. For now, we'll use a simplified calculation.
      const mockTraits = this.getMockTraitScores(answer.question_id, answer.selected_option);
      
      for (const [trait, score] of Object.entries(mockTraits)) {
        traits[trait] = (traits[trait] || 0) + score;
        traitCounts[trait] = (traitCounts[trait] || 0) + 1;
      }
    }
    
    // Normalize trait scores
    for (const trait in traits) {
      if (traitCounts[trait] > 0) {
        traits[trait] = traits[trait] / traitCounts[trait];
      }
    }
    
    // Determine primary and secondary types
    const sortedTraits = Object.entries(traits).sort((a, b) => b[1] - a[1]);
    const primaryType = this.getPersonalityType(sortedTraits[0]?.[0] || 'balanced');
    const secondaryType = sortedTraits[1] ? this.getPersonalityType(sortedTraits[1][0]) : undefined;
    
    // Generate insights
    const insights = await this.generateInsights(traits, primaryType);
    
    // Calculate score and percentile
    const score = this.calculateOverallScore(traits);
    const percentile = this.calculatePercentile(score);
    
    const result: QuizResult = {
      id: crypto.randomUUID(),
      quiz_id: submission.quiz_id,
      quiz_type: quizData?.type || 'personality',
      results: {
        personality_traits: traits,
        primary_type: primaryType,
        secondary_type: secondaryType,
        strengths: insights.strengths,
        areas_for_growth: insights.areas_for_growth,
        compatibility_insights: insights.compatibility_insights,
        career_suggestions: insights.career_suggestions,
        surprising_insight: insights.surprising_insight,
      },
      score,
      percentile,
      created_at: new Date().toISOString(),
      shared: false,
    };
    
    return result;
  }

  private getQuestionCount(type: string): number {
    const counts: Record<string, number> = {
      big5: 20,
      daily: 10,
      quick5: 5,
      thisorthat: 15,
      mood: 12,
    };
    
    return counts[type] || 10;
  }

  private getMockTraitScores(questionId: number, selectedOption: number): Record<string, number> {
    // Mock trait scores based on question and answer
    // In a real implementation, this would come from the quiz data
    const traits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
    const scores: Record<string, number> = {};
    
    // Generate pseudo-random but consistent scores
    const seed = questionId * 10 + selectedOption;
    traits.forEach((trait, index) => {
      const value = ((seed + index) % 10) / 10;
      scores[trait] = value;
    });
    
    return scores;
  }

  private getPersonalityType(dominantTrait: string): string {
    const typeMap: Record<string, string> = {
      openness: 'The Explorer',
      conscientiousness: 'The Achiever',
      extraversion: 'The Enthusiast',
      agreeableness: 'The Harmonizer',
      neuroticism: 'The Sensitive',
      balanced: 'The Balanced',
    };
    
    return typeMap[dominantTrait] || 'The Individual';
  }

  private async generateInsights(traits: Record<string, number>, primaryType: string) {
    // Use AI service if available, otherwise use templates
    try {
      return await this.aiService.generateInsights({
        personalityTraits: traits,
        primaryType,
      });
    } catch (error) {
      // Fallback to template insights
      return {
        strengths: this.getTemplateStrengths(primaryType),
        areas_for_growth: this.getTemplateGrowthAreas(primaryType),
        compatibility_insights: this.getTemplateCompatibility(primaryType),
        career_suggestions: this.getTemplateCareerSuggestions(primaryType),
        surprising_insight: this.getTemplateSurprisingInsight(traits),
      };
    }
  }

  private getTemplateStrengths(type: string): string[] {
    const strengthsMap: Record<string, string[]> = {
      'The Explorer': ['Creative thinking', 'Adaptability', 'Curiosity'],
      'The Achiever': ['Goal-oriented', 'Organized', 'Reliable'],
      'The Enthusiast': ['Social skills', 'Energy', 'Leadership'],
      'The Harmonizer': ['Empathy', 'Cooperation', 'Kindness'],
      'The Sensitive': ['Emotional intelligence', 'Intuition', 'Depth'],
      'The Balanced': ['Versatility', 'Stability', 'Wisdom'],
    };
    
    return strengthsMap[type] || ['Unique perspective', 'Personal growth', 'Self-awareness'];
  }

  private getTemplateGrowthAreas(type: string): string[] {
    const growthMap: Record<string, string[]> = {
      'The Explorer': ['Focus', 'Routine', 'Completion'],
      'The Achiever': ['Flexibility', 'Spontaneity', 'Relaxation'],
      'The Enthusiast': ['Listening', 'Solitude', 'Depth'],
      'The Harmonizer': ['Assertiveness', 'Boundaries', 'Self-care'],
      'The Sensitive': ['Resilience', 'Optimism', 'Risk-taking'],
      'The Balanced': ['Specialization', 'Passion', 'Decision-making'],
    };
    
    return growthMap[type] || ['Communication', 'Time management', 'Stress management'];
  }

  private getTemplateCompatibility(type: string): string[] {
    return [
      `${type} personalities work well with complementary types`,
      'You thrive in relationships that balance your strengths',
      'Communication is key to your relationship success',
    ];
  }

  private getTemplateCareerSuggestions(type: string): string[] {
    const careerMap: Record<string, string[]> = {
      'The Explorer': ['Research', 'Design', 'Innovation', 'Arts'],
      'The Achiever': ['Management', 'Finance', 'Engineering', 'Law'],
      'The Enthusiast': ['Sales', 'Marketing', 'Entertainment', 'Politics'],
      'The Harmonizer': ['Healthcare', 'Education', 'Social Work', 'HR'],
      'The Sensitive': ['Counseling', 'Writing', 'Arts', 'Psychology'],
      'The Balanced': ['Consulting', 'Teaching', 'Leadership', 'Mediation'],
    };
    
    return careerMap[type] || ['Consulting', 'Management', 'Creative fields', 'Technology'];
  }

  private getTemplateSurprisingInsight(traits: Record<string, number>): string {
    const insights = [
      'Your personality profile is found in less than 10% of the population!',
      'You have a rare combination of analytical and creative abilities.',
      'Your emotional intelligence is higher than you might think.',
      'You possess natural leadership qualities that emerge in unexpected ways.',
      'Your intuition is one of your most underutilized strengths.',
    ];
    
    // Select based on trait combination
    const traitSum = Object.values(traits).reduce((a, b) => a + b, 0);
    const index = Math.floor(traitSum * 10) % insights.length;
    
    return insights[index];
  }

  private calculateOverallScore(traits: Record<string, number>): number {
    // Calculate a balanced score based on all traits
    const values = Object.values(traits);
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    const balance = 1 - this.standardDeviation(values);
    
    // Score rewards both high trait values and balance
    return Math.round((average * 0.7 + balance * 0.3) * 100);
  }

  private calculatePercentile(score: number): number {
    // Mock percentile calculation
    // In production, this would be based on actual user data
    const mean = 65;
    const stdDev = 15;
    const zScore = (score - mean) / stdDev;
    
    // Approximate normal CDF
    const percentile = this.normalCDF(zScore) * 100;
    return Math.round(Math.max(1, Math.min(99, percentile)));
  }

  private standardDeviation(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(avgSquaredDiff);
  }

  private normalCDF(z: number): number {
    // Approximation of the cumulative distribution function for a standard normal distribution
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp(-z * z / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return z > 0 ? 1 - p : p;
  }
}
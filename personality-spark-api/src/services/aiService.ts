import type { Env } from '../types/env';
import { Quiz, QuizQuestion } from '../types/models';

export class AIService {
  constructor(private env: Env) {}

  async generateQuiz(params: {
    type: string;
    theme?: string;
    numQuestions: number;
    difficulty: 'easy' | 'medium' | 'hard';
    audience?: string;
  }): Promise<Quiz> {
    const prompt = this.buildQuizPrompt(params);
    
    try {
      // Try Workers AI first
      const response = await this.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [
          {
            role: 'system',
            content: 'You are a personality quiz generator. Generate engaging and insightful personality quizzes. Always respond with valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 2048,
        temperature: 0.8,
      }) as any;

      const quizData = JSON.parse(response.response);
      
      return {
        id: crypto.randomUUID(),
        type: params.type,
        title: quizData.title,
        description: quizData.description,
        questions: quizData.questions,
        theme: params.theme,
        difficulty: params.difficulty,
        created_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error('AI quiz generation error:', error);
      
      // Fallback to a template-based approach if AI fails
      return this.generateTemplateQuiz(params);
    }
  }

  async analyzePersonality(
    responses: Array<{
      questionId: number;
      answer: string;
      traits?: Record<string, number>;
    }>,
    quizType: string
  ) {
    const analysisPrompt = this.buildAnalysisPrompt(responses, quizType);
    
    try {
      const response = await this.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [
          {
            role: 'system',
            content: 'You are a professional personality psychologist. Analyze quiz responses and provide insightful personality analysis. Always respond with valid JSON.',
          },
          {
            role: 'user',
            content: analysisPrompt,
          },
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }) as any;

      return JSON.parse(response.response);
    } catch (error) {
      console.error('AI personality analysis error:', error);
      
      // Fallback to basic trait calculation
      return this.calculateBasicTraits(responses);
    }
  }

  async generateInsights(params: {
    personalityTraits: Record<string, number>;
    primaryType: string;
    context?: string;
  }) {
    const insightsPrompt = this.buildInsightsPrompt(params);
    
    try {
      const response = await this.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [
          {
            role: 'system',
            content: 'You are an expert in personality psychology. Generate personalized insights based on personality traits. Be positive, encouraging, and actionable. Always respond with valid JSON.',
          },
          {
            role: 'user',
            content: insightsPrompt,
          },
        ],
        max_tokens: 1024,
        temperature: 0.8,
      }) as any;

      return JSON.parse(response.response);
    } catch (error) {
      console.error('AI insights generation error:', error);
      
      // Fallback to template insights
      return this.generateTemplateInsights(params);
    }
  }

  private buildQuizPrompt(params: any): string {
    return `Create a ${params.type} personality quiz with ${params.numQuestions} questions.
Theme: ${params.theme || 'general personality'}
Difficulty: ${params.difficulty}
Target audience: ${params.audience || 'general adult audience'}

Requirements:
- Each question should reveal personality traits
- Include varied question formats
- Make it engaging and fun
- Provide 4 answer options per question
- Each option should map to personality traits

Output format:
{
  "title": "Quiz Title",
  "description": "Brief description",
  "questions": [
    {
      "id": 1,
      "text": "Question text",
      "options": [
        {
          "text": "Option 1",
          "value": "a",
          "trait_scores": {
            "trait_name": 0.8
          }
        }
      ]
    }
  ]
}`;
  }

  private buildAnalysisPrompt(responses: any[], quizType: string): string {
    return `Analyze these quiz responses for a ${quizType} personality assessment:
${JSON.stringify(responses, null, 2)}

Provide:
1. Main personality traits (with scores 0-1)
2. Primary and secondary personality types
3. Strengths and areas for growth
4. Compatibility insights
5. Career suggestions
6. One surprising insight

Output format:
{
  "personality_traits": {
    "trait_name": 0.85
  },
  "primary_type": "Type Name",
  "secondary_type": "Type Name",
  "strengths": ["strength1", "strength2"],
  "areas_for_growth": ["area1", "area2"],
  "compatibility_insights": ["insight1", "insight2"],
  "career_suggestions": ["career1", "career2"],
  "surprising_insight": "Insight text"
}`;
  }

  private buildInsightsPrompt(params: any): string {
    return `Generate personalized insights based on these personality traits:
${JSON.stringify(params.personalityTraits, null, 2)}

Primary personality type: ${params.primaryType}
Context: ${params.context || 'general life and personal growth'}

Provide:
1. Key insights about their personality
2. Practical tips for personal growth
3. Relationship advice
4. Career guidance
5. Daily habits that align with their personality

Output format:
{
  "key_insights": ["insight1", "insight2", "insight3"],
  "growth_tips": ["tip1", "tip2", "tip3"],
  "relationship_advice": ["advice1", "advice2"],
  "career_guidance": ["guidance1", "guidance2"],
  "daily_habits": ["habit1", "habit2", "habit3"]
}`;
  }

  // Fallback methods for when AI is unavailable
  private generateTemplateQuiz(params: any): Quiz {
    // Implement template-based quiz generation
    const templates = {
      big5: this.getBig5Template(),
      quick5: this.getQuick5Template(),
      thisorthat: this.getThisOrThatTemplate(),
    };

    const template = templates[params.type as keyof typeof templates] || this.getDefaultTemplate();
    
    return {
      id: crypto.randomUUID(),
      type: params.type,
      title: template.title,
      description: template.description,
      questions: template.questions.slice(0, params.numQuestions),
      theme: params.theme,
      difficulty: params.difficulty,
      created_at: new Date().toISOString(),
    };
  }

  private calculateBasicTraits(responses: any[]) {
    // Simple trait calculation based on responses
    const traits: Record<string, number> = {};
    
    for (const response of responses) {
      if (response.traits) {
        for (const [trait, score] of Object.entries(response.traits)) {
          traits[trait] = (traits[trait] || 0) + (score as number);
        }
      }
    }
    
    // Normalize scores
    const maxScore = responses.length;
    for (const trait in traits) {
      traits[trait] = traits[trait] / maxScore;
    }
    
    // Determine primary type based on highest traits
    const sortedTraits = Object.entries(traits).sort((a, b) => b[1] - a[1]);
    const primaryType = this.getPersonalityType(sortedTraits[0][0]);
    const secondaryType = sortedTraits[1] ? this.getPersonalityType(sortedTraits[1][0]) : undefined;
    
    return {
      personality_traits: traits,
      primary_type: primaryType,
      secondary_type: secondaryType,
      strengths: this.getStrengths(primaryType),
      areas_for_growth: this.getAreasForGrowth(primaryType),
      compatibility_insights: [],
      career_suggestions: this.getCareerSuggestions(primaryType),
      surprising_insight: this.getSurprisingInsight(traits),
    };
  }

  private generateTemplateInsights(params: any) {
    const { personalityTraits, primaryType } = params;
    
    return {
      key_insights: [
        `As a ${primaryType}, you have a unique perspective on the world.`,
        `Your strongest trait is ${Object.entries(personalityTraits).sort((a, b) => b[1] - a[1])[0][0]}.`,
        `You thrive in environments that value your natural abilities.`,
      ],
      growth_tips: [
        'Practice mindfulness to enhance self-awareness',
        'Set clear boundaries to protect your energy',
        'Seek feedback from trusted friends and mentors',
      ],
      relationship_advice: [
        'Communicate your needs clearly and directly',
        'Practice active listening to deepen connections',
      ],
      career_guidance: [
        'Look for roles that align with your core values',
        'Develop skills that complement your natural strengths',
      ],
      daily_habits: [
        'Start your day with intention-setting',
        'Take regular breaks to recharge',
        'End your day with gratitude reflection',
      ],
    };
  }

  // Template data methods
  private getBig5Template() {
    return {
      title: 'Big 5 Personality Assessment',
      description: 'Discover your personality across five major dimensions',
      questions: [
        {
          id: 1,
          text: 'I enjoy being the center of attention at social gatherings.',
          options: [
            { text: 'Strongly agree', value: 'a', trait_scores: { extraversion: 1.0 } },
            { text: 'Somewhat agree', value: 'b', trait_scores: { extraversion: 0.7 } },
            { text: 'Somewhat disagree', value: 'c', trait_scores: { extraversion: 0.3 } },
            { text: 'Strongly disagree', value: 'd', trait_scores: { extraversion: 0.0 } },
          ],
        },
        // Add more questions...
      ],
    };
  }

  private getQuick5Template() {
    return {
      title: 'Quick 5 Personality Check',
      description: 'Get personality insights in just 5 questions',
      questions: [
        {
          id: 1,
          text: 'When facing a challenge, I prefer to:',
          options: [
            { text: 'Tackle it head-on immediately', value: 'a', trait_scores: { action_oriented: 1.0 } },
            { text: 'Plan carefully before acting', value: 'b', trait_scores: { strategic: 1.0 } },
            { text: 'Seek advice from others', value: 'c', trait_scores: { collaborative: 1.0 } },
            { text: 'Wait and see if it resolves itself', value: 'd', trait_scores: { patient: 1.0 } },
          ],
        },
        // Add more questions...
      ],
    };
  }

  private getThisOrThatTemplate() {
    return {
      title: 'This or That: Rapid Personality',
      description: 'Quick choices that reveal your personality',
      questions: [
        {
          id: 1,
          text: 'Which appeals to you more?',
          options: [
            { text: 'Mountain hiking', value: 'a', trait_scores: { adventurous: 1.0, outdoorsy: 0.8 } },
            { text: 'Beach relaxation', value: 'b', trait_scores: { relaxed: 1.0, social: 0.6 } },
          ],
        },
        // Add more questions...
      ],
    };
  }

  private getDefaultTemplate() {
    return this.getQuick5Template();
  }

  private getPersonalityType(trait: string): string {
    const typeMap: Record<string, string> = {
      extraversion: 'The Social Butterfly',
      openness: 'The Creative Explorer',
      conscientiousness: 'The Organized Achiever',
      agreeableness: 'The Harmonious Helper',
      neuroticism: 'The Sensitive Soul',
      action_oriented: 'The Go-Getter',
      strategic: 'The Mastermind',
      collaborative: 'The Team Player',
      patient: 'The Steady Rock',
      adventurous: 'The Thrill Seeker',
      relaxed: 'The Zen Master',
    };
    
    return typeMap[trait] || 'The Unique Individual';
  }

  private getStrengths(type: string): string[] {
    const strengthMap: Record<string, string[]> = {
      'The Social Butterfly': ['Excellent communication', 'Natural leadership', 'Energizing presence'],
      'The Creative Explorer': ['Innovative thinking', 'Adaptability', 'Artistic vision'],
      'The Organized Achiever': ['Reliability', 'Goal achievement', 'Attention to detail'],
      'The Harmonious Helper': ['Empathy', 'Conflict resolution', 'Team building'],
      'The Go-Getter': ['Initiative', 'Problem-solving', 'Determination'],
      'The Mastermind': ['Strategic planning', 'Analysis', 'Long-term vision'],
    };
    
    return strengthMap[type] || ['Unique perspective', 'Personal authenticity', 'Inner strength'];
  }

  private getAreasForGrowth(type: string): string[] {
    const growthMap: Record<string, string[]> = {
      'The Social Butterfly': ['Deep focus', 'Solitary reflection', 'Listening skills'],
      'The Creative Explorer': ['Follow-through', 'Routine tasks', 'Practical planning'],
      'The Organized Achiever': ['Flexibility', 'Spontaneity', 'Risk-taking'],
      'The Harmonious Helper': ['Assertiveness', 'Self-care', 'Boundary setting'],
      'The Go-Getter': ['Patience', 'Collaboration', 'Work-life balance'],
      'The Mastermind': ['Emotional expression', 'Quick decisions', 'Social connections'],
    };
    
    return growthMap[type] || ['Self-awareness', 'Emotional regulation', 'Personal boundaries'];
  }

  private getCareerSuggestions(type: string): string[] {
    const careerMap: Record<string, string[]> = {
      'The Social Butterfly': ['Sales', 'Public Relations', 'Event Planning', 'Teaching'],
      'The Creative Explorer': ['Design', 'Writing', 'Research', 'Innovation'],
      'The Organized Achiever': ['Project Management', 'Accounting', 'Operations', 'Quality Control'],
      'The Harmonious Helper': ['Counseling', 'Human Resources', 'Healthcare', 'Social Work'],
      'The Go-Getter': ['Entrepreneurship', 'Consulting', 'Emergency Services', 'Sports'],
      'The Mastermind': ['Strategy', 'Analysis', 'Engineering', 'Investment'],
    };
    
    return careerMap[type] || ['Consulting', 'Freelancing', 'Teaching', 'Management'];
  }

  private getSurprisingInsight(traits: Record<string, number>): string {
    const insights = [
      'Your unique combination of traits makes you exceptionally rare - less than 5% of people share your profile!',
      'You have an unusual balance between analytical and creative thinking that could lead to breakthrough innovations.',
      'Your personality suggests you might excel in fields you\'ve never considered before.',
      'You possess a hidden talent for bringing out the best in others, even if you don\'t realize it.',
    ];
    
    return insights[Math.floor(Math.random() * insights.length)];
  }
}
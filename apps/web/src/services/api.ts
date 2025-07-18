// Use REACT_APP_ prefix for Create React App compatibility or __ENV for webpack DefinePlugin
// For integrated deployment, API is on same domain at /api/v1
const API_BASE_URL = process.env.REACT_APP_API_URL || process.env.API_URL || '/api/v1';

export interface QuizCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  duration: string;
  popularity: number;
}

export interface QuizQuestion {
  id: number;
  text: string;
  options: {
    text: string;
    value: string;
  }[];
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  quiz_type: string;
  estimated_time: number;
}

export interface QuizResult {
  id: string;
  personalityType: string;
  title: string;
  description: string;
  traits: {
    name: string;
    score: number;
    description: string;
    color: string;
  }[];
  strengths: string[];
  growthAreas: string[];
  careerMatches: string[];
}

class ApiService {
  private async fetchWithError(url: string, options?: RequestInit) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Quiz endpoints
  async getQuizCategories(): Promise<QuizCategory[]> {
    return this.fetchWithError(`${API_BASE_URL}/quizzes/categories`);
  }

  async generateQuiz(quizType: string): Promise<Quiz> {
    return this.fetchWithError(`${API_BASE_URL}/quizzes/generate/${quizType}`);
  }

  async getDailyChallenge(): Promise<Quiz> {
    return this.fetchWithError(`${API_BASE_URL}/quizzes/daily`);
  }

  async submitQuiz(quizId: string, answers: Record<number, string>): Promise<{ result_id: string }> {
    return this.fetchWithError(`${API_BASE_URL}/quizzes/submit`, {
      method: 'POST',
      body: JSON.stringify({
        quiz_id: quizId,
        answers: Object.entries(answers).map(([questionId, value]) => ({
          question_id: parseInt(questionId),
          answer: value,
        })),
      }),
    });
  }

  async getQuizResult(resultId: string): Promise<QuizResult> {
    return this.fetchWithError(`${API_BASE_URL}/quizzes/result/${resultId}`);
  }

  // AI endpoints
  async generateCustomQuiz(params: {
    theme: string;
    difficulty: string;
    num_questions: number;
  }): Promise<Quiz> {
    return this.fetchWithError(`${API_BASE_URL}/ai/generate-quiz`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async analyzePersonality(responses: any): Promise<any> {
    return this.fetchWithError(`${API_BASE_URL}/ai/analyze-personality`, {
      method: 'POST',
      body: JSON.stringify({ responses }),
    });
  }

  // Share endpoints
  async createShareCard(resultId: string): Promise<{ share_id: string; share_url: string }> {
    return this.fetchWithError(`${API_BASE_URL}/share/create-card`, {
      method: 'POST',
      body: JSON.stringify({ result_id: resultId }),
    });
  }

  async createChallenge(quizId: string, creatorName: string): Promise<{ challenge_id: string; challenge_url: string }> {
    return this.fetchWithError(`${API_BASE_URL}/share/challenge`, {
      method: 'POST',
      body: JSON.stringify({ quiz_id: quizId, creator_name: creatorName }),
    });
  }

  // Analytics
  async trackEvent(event: { event_type: string; event_data: any }): Promise<void> {
    await this.fetchWithError(`${API_BASE_URL}/analytics/track`, {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }
}

export default new ApiService();
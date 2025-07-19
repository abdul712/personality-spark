import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api/v1' 
  : 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

export interface Question {
  id: number;
  text: string;
  options: Option[];
}

export interface Option {
  text: string;
  value: string;
}

export interface QuizResult {
  id: string;
  personality_type: string;
  traits: Record<string, number>;
  description: string;
  strengths: string[];
  weaknesses: string[];
}

export const quizService = {
  async generateQuiz(quizType: string): Promise<Quiz> {
    const response = await api.get(`/quizzes/generate/${quizType}`);
    return response.data;
  },

  async submitQuiz(quizId: string, answers: Record<string, string>): Promise<{ result_id: string }> {
    const response = await api.post('/quizzes/submit', {
      quiz_id: quizId,
      answers,
    });
    return response.data;
  },

  async getResult(resultId: string): Promise<QuizResult> {
    const response = await api.get(`/quizzes/result/${resultId}`);
    return response.data;
  },

  async getCategories() {
    const response = await api.get('/quizzes/categories');
    return response.data;
  },

  async getDailyChallenge() {
    const response = await api.get('/quizzes/daily');
    return response.data;
  },
};

export const shareService = {
  async createShareCard(resultId: string): Promise<{ share_url: string; image_url: string }> {
    const response = await api.post('/share/create-card', { result_id: resultId });
    return response.data;
  },

  async getSharePreview(shareId: string) {
    const response = await api.get(`/share/preview/${shareId}`);
    return response.data;
  },
};

export default api;
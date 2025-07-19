import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { useNavigate, useParams } from 'react-router-dom';
import type { Quiz as QuizType } from '../services/api';

const mockQuizData: QuizType = {
  id: 'mock-quiz-1',
  title: 'Personality Assessment',
  description: 'Discover your personality traits',
  questions: [
    {
      id: 1,
      text: "You enjoy being the center of attention at social gatherings.",
      options: [
        { text: "Strongly Disagree", value: "1" },
        { text: "Disagree", value: "2" },
        { text: "Neutral", value: "3" },
        { text: "Agree", value: "4" },
        { text: "Strongly Agree", value: "5" }
      ]
    },
    {
      id: 2,
      text: "You prefer to plan things in advance rather than being spontaneous.",
      options: [
        { text: "Strongly Disagree", value: "1" },
        { text: "Disagree", value: "2" },
        { text: "Neutral", value: "3" },
        { text: "Agree", value: "4" },
        { text: "Strongly Agree", value: "5" }
      ]
    },
    {
      id: 3,
      text: "You find it easy to empathize with others' emotions.",
      options: [
        { text: "Strongly Disagree", value: "1" },
        { text: "Disagree", value: "2" },
        { text: "Neutral", value: "3" },
        { text: "Agree", value: "4" },
        { text: "Strongly Agree", value: "5" }
      ]
    },
    {
      id: 4,
      text: "You often feel energized after spending time with a group of people.",
      options: [
        { text: "Strongly Disagree", value: "1" },
        { text: "Disagree", value: "2" },
        { text: "Neutral", value: "3" },
        { text: "Agree", value: "4" },
        { text: "Strongly Agree", value: "5" }
      ]
    },
    {
      id: 5,
      text: "You tend to trust your gut feelings when making decisions.",
      options: [
        { text: "Strongly Disagree", value: "1" },
        { text: "Disagree", value: "2" },
        { text: "Neutral", value: "3" },
        { text: "Agree", value: "4" },
        { text: "Strongly Agree", value: "5" }
      ]
    }
  ]
};

const Quiz: React.FC = () => {
  const navigate = useNavigate();
  const { quizType } = useParams<{ quizType: string }>();
  const [quiz, setQuiz] = useState<QuizType | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadQuiz();
  }, [quizType]);

  const loadQuiz = async () => {
    setLoading(true);
    try {
      // In production, this would call the actual API
      // const data = await quizService.generateQuiz(quizType!);
      // setQuiz(data);
      
      // For now, use mock data
      setTimeout(() => {
        setQuiz(mockQuizData);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to load quiz:', error);
      setLoading(false);
    }
  };

  const handleAnswer = (value: string) => {
    setAnswers({
      ...answers,
      [currentQuestion.toString()]: value
    });
  };

  const handleNext = () => {
    if (currentQuestion < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    
    setSubmitting(true);
    try {
      // In production, this would submit to the API
      // const result = await quizService.submitQuiz(quiz.id, answers);
      // navigate(`/result/${result.result_id}`);
      
      // For now, navigate to mock result
      setTimeout(() => {
        navigate(`/result/mock-result-1`);
      }, 1500);
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Failed to load quiz</p>
          <Button onClick={() => navigate('/quiz-list')}>Back to Quiz List</Button>
        </div>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
  const currentQ = quiz.questions[currentQuestion];
  const currentAnswer = answers[currentQuestion.toString()];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={() => navigate('/quiz-list')}>
              <ArrowLeft className="w-5 h-5 mr-2" />
              Exit Quiz
            </Button>
            <Badge>
              Question {currentQuestion + 1} of {quiz.questions.length}
            </Badge>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </header>

      {/* Quiz Content */}
      <section className="px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                  {currentQ.text}
                </h2>

                <div className="space-y-3">
                  {currentQ.options.map((option) => (
                    <motion.button
                      key={option.value}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                        currentAnswer === option.value
                          ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-400'
                      }`}
                      onClick={() => handleAnswer(option.value)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-lg ${
                          currentAnswer === option.value
                            ? 'text-purple-700 dark:text-purple-300 font-semibold'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {option.text}
                        </span>
                        {currentAnswer === option.value && (
                          <Check className="w-5 h-5 text-purple-600" />
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </Card>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Previous
                </Button>

                <div className="text-gray-600 dark:text-gray-400">
                  {Object.keys(answers).length} of {quiz.questions.length} answered
                </div>

                {currentQuestion === quiz.questions.length - 1 ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={Object.keys(answers).length !== quiz.questions.length || submitting}
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        Submit
                        <Check className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    disabled={!currentAnswer}
                  >
                    Next
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
};

export default Quiz;
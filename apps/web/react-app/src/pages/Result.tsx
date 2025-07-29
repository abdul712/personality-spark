import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Share2, Download, RefreshCw, Home, TrendingUp, Heart, Brain, Target, Users, AlertCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Footer } from '../components/Footer';
import { useNavigate, useParams } from 'react-router-dom';
import type { QuizResult } from '../services/api';

const mockResultData: QuizResult = {
  id: 'mock-result-1',
  personality_type: 'The Innovator',
  traits: {
    openness: 85,
    conscientiousness: 72,
    extraversion: 68,
    agreeableness: 76,
    neuroticism: 45
  },
  description: 'You are a creative and innovative thinker who enjoys exploring new ideas and experiences. Your high openness to experience combined with strong conscientiousness makes you both imaginative and reliable.',
  strengths: [
    'Creative problem-solving abilities',
    'Strong adaptability to change',
    'Excellent at seeing the big picture',
    'Natural leadership qualities'
  ],
  weaknesses: [
    'May overlook important details',
    'Can be impatient with routine tasks',
    'Sometimes too idealistic',
    'May struggle with follow-through'
  ]
};

const Result: React.FC = () => {
  const navigate = useNavigate();
  const { resultId } = useParams<{ resultId: string }>();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareSuccess, setShareSuccess] = useState(false);

  useEffect(() => {
    loadResult();
  }, [resultId]);

  const loadResult = async () => {
    setLoading(true);
    setError(null);
    try {
      // In production, this would call the actual API
      // const data = await quizService.getResult(resultId!);
      // setResult(data);
      
      // For now, use mock data
      setTimeout(() => {
        setResult(mockResultData);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to load result:', error);
      setError('Failed to load your results. Please try again.');
      setLoading(false);
    }
  };

  const handleShare = async () => {
    setSharing(true);
    setShareSuccess(false);
    try {
      // In production, this would create a share card
      // const shareData = await shareService.createShareCard(resultId!);
      
      // For now, just copy to clipboard
      const shareUrl = window.location.href;
      await navigator.clipboard.writeText(shareUrl);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to share:', error);
      // Fallback for browsers that don't support clipboard API
      const input = document.createElement('input');
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 3000);
    } finally {
      setSharing(false);
    }
  };

  const getTraitIcon = (trait: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      openness: <Brain className="w-5 h-5" />,
      conscientiousness: <Target className="w-5 h-5" />,
      extraversion: <Users className="w-5 h-5" />,
      agreeableness: <Heart className="w-5 h-5" />,
      neuroticism: <TrendingUp className="w-5 h-5" />
    };
    return icons[trait] || <TrendingUp className="w-5 h-5" />;
  };

  const getTraitColor = (value: number) => {
    if (value >= 80) return 'text-green-600';
    if (value >= 60) return 'text-blue-600';
    if (value >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Analyzing your personality...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Unable to Load Results
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'Your results could not be loaded at this time.'}
          </p>
          <div className="space-y-3">
            <Button onClick={loadResult} className="w-full">
              Try Again
            </Button>
            <Button onClick={() => navigate('/quiz-list')} variant="outline" className="w-full">
              Take Another Quiz
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Share Success Notification */}
      {shareSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Share link copied to clipboard!
        </motion.div>
      )}

      {/* Hero Section with Results */}
      <section className="relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className="relative z-10 px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <Badge className="mb-6" variant="success">
                Analysis Complete
              </Badge>

              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                <span className="text-gray-900 dark:text-white">You are </span>
                <span className="gradient-text">{result.personality_type}</span>
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
                {result.description}
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <Button onClick={handleShare} disabled={sharing}>
                  <Share2 className="w-5 h-5 mr-2" />
                  {sharing ? 'Sharing...' : 'Share Results'}
                </Button>
                <Button variant="outline">
                  <Download className="w-5 h-5 mr-2" />
                  Download Report
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Personality Traits */}
      <section className="px-6 py-16 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Your Personality Traits
          </h2>

          <div className="space-y-6">
            {Object.entries(result.traits).map(([trait, value], index) => (
              <motion.div
                key={trait}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mr-3">
                        {getTraitIcon(trait)}
                      </div>
                      <span className="text-lg font-semibold capitalize text-gray-900 dark:text-white">
                        {trait}
                      </span>
                    </div>
                    <span className={`text-2xl font-bold ${getTraitColor(value)}`}>
                      {value}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${value}%` }}
                      transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                    />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Strengths and Weaknesses */}
      <section className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="h-full">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-3">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  Your Strengths
                </h3>
                <ul className="space-y-3">
                  {result.strengths.map((strength, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-start"
                    >
                      <span className="text-green-600 mr-2 mt-1">•</span>
                      <span className="text-gray-700 dark:text-gray-300">{strength}</span>
                    </motion.li>
                  ))}
                </ul>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="h-full">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center mr-3">
                    <Target className="w-5 h-5 text-yellow-600" />
                  </div>
                  Areas for Growth
                </h3>
                <ul className="space-y-3">
                  {result.weaknesses.map((weakness, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-start"
                    >
                      <span className="text-yellow-600 mr-2 mt-1">•</span>
                      <span className="text-gray-700 dark:text-gray-300">{weakness}</span>
                    </motion.li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <section className="px-6 py-16 bg-gradient-to-br from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready for Another Discovery?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Explore more aspects of your personality with our other assessments
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="lg"
              className="bg-white hover:bg-gray-100 text-purple-600 shadow-xl"
              onClick={() => navigate('/quiz-list')}
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Take Another Quiz
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
              onClick={() => navigate('/')}
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Result;
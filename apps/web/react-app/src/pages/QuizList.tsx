import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Zap, TrendingUp, Layers, Heart, Shield, Clock, HelpCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { useNavigate } from 'react-router-dom';

interface QuizCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  duration: string;
  questions: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

const quizCategories: QuizCategory[] = [
  {
    id: 'big5',
    title: 'Big 5 Personality',
    description: 'Discover your core personality traits through the scientifically-backed Big Five model',
    icon: <Cpu className="w-7 h-7" />,
    color: 'purple',
    duration: '5-7 mins',
    questions: 25,
    difficulty: 'Medium'
  },
  {
    id: 'daily',
    title: 'Daily Challenge',
    description: 'A new personality puzzle every day. Keep your streak going!',
    icon: <Zap className="w-7 h-7" />,
    color: 'orange',
    duration: '3-5 mins',
    questions: 15,
    difficulty: 'Easy'
  },
  {
    id: 'quick',
    title: 'Quick Assessment',
    description: 'Get instant insights with just 5 questions',
    icon: <TrendingUp className="w-7 h-7" />,
    color: 'green',
    duration: '2 mins',
    questions: 5,
    difficulty: 'Easy'
  },
  {
    id: 'thisorthat',
    title: 'This or That',
    description: 'Rapid-fire choices that reveal your true preferences',
    icon: <Layers className="w-7 h-7" />,
    color: 'red',
    duration: '1-2 mins',
    questions: 10,
    difficulty: 'Easy'
  },
  {
    id: 'mood',
    title: 'Mood Personality',
    description: 'Understand how your current mood shapes your personality',
    icon: <Heart className="w-7 h-7" />,
    color: 'pink',
    duration: '3-4 mins',
    questions: 12,
    difficulty: 'Medium'
  },
  {
    id: 'career',
    title: 'Career Match',
    description: 'Find careers that align with your personality type',
    icon: <Shield className="w-7 h-7" />,
    color: 'blue',
    duration: '4-6 mins',
    questions: 20,
    difficulty: 'Hard'
  }
];

const QuizList: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleStartQuiz = async (categoryId: string) => {
    setSelectedCategory(categoryId);
    setLoading(true);
    
    // Simulate loading
    setTimeout(() => {
      navigate(`/quiz/${categoryId}`);
    }, 1000);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'success';
      case 'Medium':
        return 'warning';
      case 'Hard':
        return 'error';
      default:
        return 'default';
    }
  };

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: string } = {
      purple: 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-600',
      orange: 'bg-orange-500/10 dark:bg-orange-500/20 text-orange-600',
      green: 'bg-green-500/10 dark:bg-green-500/20 text-green-600',
      red: 'bg-red-500/10 dark:bg-red-500/20 text-red-600',
      pink: 'bg-pink-500/10 dark:bg-pink-500/20 text-pink-600',
      blue: 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600',
    };
    return colorMap[color] || colorMap.purple;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Choose Your Quiz</h1>
          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-12 bg-gradient-to-b from-purple-50 to-transparent dark:from-purple-900/10">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-4">
              <HelpCircle className="w-4 h-4 mr-1" />
              Choose Your Journey
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Personality Quizzes
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Select from our collection of AI-powered personality assessments designed to reveal your unique traits
            </p>
          </motion.div>
        </div>
      </section>

      {/* Quiz Categories */}
      <section className="px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="h-full hover:scale-105 transition-all duration-300 cursor-pointer"
                  onClick={() => handleStartQuiz(category.id)}
                >
                  <div className="flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-14 h-14 ${getColorClasses(category.color)} rounded-xl flex items-center justify-center`}>
                        {category.icon}
                      </div>
                      <Badge variant={getDifficultyColor(category.difficulty)}>
                        {category.difficulty}
                      </Badge>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {category.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">
                      {category.description}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {category.duration}
                      </span>
                      <span>{category.questions} questions</span>
                    </div>

                    <Button 
                      className="w-full"
                      disabled={loading && selectedCategory === category.id}
                    >
                      {loading && selectedCategory === category.id ? (
                        <span className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Loading...
                        </span>
                      ) : (
                        'Start Quiz'
                      )}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="px-6 py-16 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Not sure which quiz to take?
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Start with our Quick Assessment for a rapid personality overview, or dive deep with the Big 5 Personality test for comprehensive insights.
          </p>
          <Button 
            variant="outline"
            onClick={() => handleStartQuiz('quick')}
          >
            Take Quick Assessment
          </Button>
        </div>
      </section>
    </div>
  );
};

export default QuizList;
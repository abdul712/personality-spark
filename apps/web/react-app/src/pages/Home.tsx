import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Zap, Shield, TrendingUp, Users, RefreshCw, Play, PlayCircle, ArrowRight, Star } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Footer } from '../components/Footer';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [userCount, setUserCount] = useState(0);
  const [quizCount, setQuizCount] = useState(0);
  const [insightCount, setInsightCount] = useState(0);

  useEffect(() => {
    // Animated counters
    const countUp = (setter: Function, target: number, duration: number) => {
      let start = 0;
      const increment = target / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          setter(target);
          clearInterval(timer);
        } else {
          setter(Math.floor(start));
        }
      }, 16);
    };

    countUp(setUserCount, 50000, 2000);
    countUp(setQuizCount, 100, 2000);
    countUp(setInsightCount, 1000000, 2000);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-20 right-0 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.3s' }} />
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.7s' }} />
        </div>

        <div className="relative z-10 px-6 py-16 md:py-24">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <Badge className="mb-6">
                <Zap className="w-4 h-4 mr-1" />
                AI-Powered Personality Analysis
              </Badge>

              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Discover Your{' '}
                <span className="gradient-text">True Self</span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
                Unlock deep insights about your personality with AI-powered quizzes. 
                Join millions discovering what makes them unique.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button size="lg" onClick={() => navigate('/quiz-list')} className="min-w-[180px]">
                  <Play className="w-5 h-5 mr-2" />
                  Start Free Quiz
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="min-w-[180px]"
                  onClick={() => alert('Demo coming soon!')}
                >
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>
            </motion.div>

            {/* Floating Statistics Cards */}
            <div className="flex flex-wrap justify-center gap-6 mt-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="animate-float"
              >
                <Card className="glass-morphism min-w-[160px]">
                  <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                    {userCount.toLocaleString()}+
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Active Users</p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="animate-float"
                style={{ animationDelay: '2s' }}
              >
                <Card className="glass-morphism min-w-[160px]">
                  <p className="text-4xl font-bold text-pink-600 dark:text-pink-400">
                    {quizCount}+
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Unique Quizzes</p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="animate-float"
                style={{ animationDelay: '4s' }}
              >
                <Card className="glass-morphism min-w-[160px]">
                  <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                    {insightCount.toLocaleString()}+
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Insights Shared</p>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Personality Spark?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Experience the most advanced personality analysis platform powered by cutting-edge AI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Cpu className="w-7 h-7" />}
              title="AI-Powered Analysis"
              description="Advanced machine learning algorithms provide deep, accurate personality insights"
              color="purple"
              delay={0}
            />
            <FeatureCard
              icon={<Zap className="w-7 h-7" />}
              title="Instant Results"
              description="Get comprehensive personality analysis in seconds, not hours"
              color="pink"
              delay={0.1}
            />
            <FeatureCard
              icon={<Shield className="w-7 h-7" />}
              title="100% Private"
              description="Your data is encrypted and never shared. Take quizzes anonymously"
              color="blue"
              delay={0.2}
            />
            <FeatureCard
              icon={<TrendingUp className="w-7 h-7" />}
              title="Track Progress"
              description="Monitor your personality evolution over time with detailed analytics"
              color="green"
              delay={0.3}
            />
            <FeatureCard
              icon={<Users className="w-7 h-7" />}
              title="Compare & Share"
              description="See how you match with friends and share insights on social media"
              color="orange"
              delay={0.4}
            />
            <FeatureCard
              icon={<RefreshCw className="w-7 h-7" />}
              title="Always Fresh"
              description="New AI-generated quizzes daily means endless discovery"
              color="indigo"
              delay={0.5}
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-6 py-20 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              Process
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Three simple steps to unlock your personality insights
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <ProcessStep
              number="01"
              title="Choose Your Quiz"
              description="Select from our curated collection of personality assessments, from quick 5-minute tests to deep-dive analyses"
              isLast={false}
            />
            <ProcessStep
              number="02"
              title="Answer Honestly"
              description="Respond to thought-provoking questions designed by psychologists and enhanced by AI"
              isLast={false}
            />
            <ProcessStep
              number="03"
              title="Discover Insights"
              description="Receive a detailed personality profile with actionable insights, strengths, and growth areas"
              isLast={true}
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-6 py-20 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              Testimonials
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Loved by Millions
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              See what our users are saying about their personality discovery journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard
              content="The insights were incredibly accurate! It helped me understand why I make certain decisions and how to improve my relationships."
              author="Sarah Chen"
              role="Product Designer"
              rating={5}
            />
            <TestimonialCard
              content="I've taken many personality tests, but this one stands out. The AI analysis provided nuances I'd never considered before."
              author="Michael Rodriguez"
              role="Software Engineer"
              rating={5}
            />
            <TestimonialCard
              content="Fun, engaging, and surprisingly deep. I learned things about myself that years of therapy hadn't uncovered!"
              author="Emma Thompson"
              role="Marketing Manager"
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-br from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Meet the Real You?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join over 50,000 people who've discovered their authentic selves through our AI-powered personality analysis
          </p>
          <Button
            size="xl"
            className="bg-white hover:bg-gray-100 text-purple-600 shadow-2xl min-w-[200px]"
            onClick={() => navigate('/quiz-list')}
          >
            <ArrowRight className="w-6 h-6 mr-2" />
            Start Your Journey
          </Button>
          
          <p className="text-sm text-white/70 mt-6">
            No registration required • 100% free • 5 minutes to complete
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// Feature Card Component
const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  delay: number;
}> = ({ icon, title, description, color, delay }) => {
  const colorClasses: { [key: string]: string } = {
    purple: 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-600',
    pink: 'bg-pink-500/10 dark:bg-pink-500/20 text-pink-600',
    blue: 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600',
    green: 'bg-green-500/10 dark:bg-green-500/20 text-green-600',
    orange: 'bg-orange-500/10 dark:bg-orange-500/20 text-orange-600',
    indigo: 'bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="h-full hover:scale-105 transition-transform duration-300">
        <div className={`w-16 h-16 ${colorClasses[color]} rounded-2xl flex items-center justify-center mb-6`}>
          {icon}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          {description}
        </p>
      </Card>
    </motion.div>
  );
};

// Process Step Component
const ProcessStep: React.FC<{
  number: string;
  title: string;
  description: string;
  isLast: boolean;
}> = ({ number, title, description, isLast }) => (
  <div className="flex mb-12 relative">
    <div className="relative">
      <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
        <span className="text-white font-bold text-2xl">{number}</span>
      </div>
      {!isLast && (
        <div className="absolute top-20 left-10 w-0.5 h-24 bg-gradient-to-b from-purple-600 to-transparent" />
      )}
    </div>
    <div className="flex-1 ml-6">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
        {title}
      </h3>
      <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
        {description}
      </p>
    </div>
  </div>
);

// Testimonial Card Component
const TestimonialCard: React.FC<{
  content: string;
  author: string;
  role: string;
  rating: number;
}> = ({ content, author, role, rating }) => (
  <Card className="h-full">
    <div className="flex mb-4">
      {[...Array(rating)].map((_, i) => (
        <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
      ))}
    </div>
    <p className="text-gray-700 dark:text-gray-200 text-lg leading-relaxed mb-6 italic">
      "{content}"
    </p>
    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
      <p className="font-semibold text-gray-900 dark:text-white">
        {author}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {role}
      </p>
    </div>
  </Card>
);

export default Home;
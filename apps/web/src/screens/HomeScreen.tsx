import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Icon } from '../components/ui/Icons';
import Footer from '../components/Footer';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

interface HomeScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
  };
}

const { width } = Dimensions.get('window');

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Animated counters
  const [userCount, setUserCount] = useState(0);
  const [quizCount, setQuizCount] = useState(0);
  const [insightCount, setInsightCount] = useState(0);

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

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
    <ScrollView 
      className="flex-1 bg-white dark:bg-gray-900"
      showsVerticalScrollIndicator={false}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true }
      )}
      scrollEventThrottle={16}
    >
      {/* Hero Section with Animated Gradient Mesh */}
      <View className="relative overflow-hidden">
        {/* Animated gradient background */}
        <View className="absolute inset-0">
          <View className="absolute top-0 left-0 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
          <View className="absolute top-20 right-0 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-300" />
          <View className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-700" />
        </View>

        <Animated.View 
          className="px-6 py-16 md:py-24 relative z-10"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          <View className="max-w-6xl mx-auto">
            <View className="text-center mb-12">
              {/* Badge */}
              <View className="mb-6">
                <Badge variant="default" className="inline-flex">
                  <Icon name="zap" size={14} color="#9333ea" />
                  <Text className="ml-1 text-purple-600 dark:text-purple-400 font-semibold">
                    AI-Powered Personality Analysis
                  </Text>
                </Badge>
              </View>

              {/* Heading with gradient text */}
              <Text className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                <Text className="text-gray-900 dark:text-white">Discover Your</Text>
                {'\n'}
                <Text className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                  True Self
                </Text>
              </Text>

              {/* Subtext */}
              <Text className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
                Unlock deep insights about your personality with AI-powered quizzes. 
                Join millions discovering what makes them unique.
              </Text>

              {/* CTA Buttons */}
              <View className="flex-row justify-center gap-4 flex-wrap">
                <Button
                  onPress={() => navigation.navigate('QuizList')}
                  size="lg"
                  className="min-w-[180px] shadow-2xl shadow-purple-500/25"
                >
                  <Icon name="play" size={20} color="white" />
                  <Text className="ml-2 text-white font-semibold">Start Free Quiz</Text>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="min-w-[180px] border-2"
                >
                  <Icon name="play-circle" size={20} color="#9333ea" />
                  <Text className="ml-2 text-purple-600 dark:text-purple-400 font-semibold">
                    Watch Demo
                  </Text>
                </Button>
              </View>
            </View>

            {/* Floating Glass Cards with Statistics */}
            <View className="flex-row justify-center gap-6 mt-16 flex-wrap">
              <Animated.View
                style={{
                  transform: [{
                    translateY: scrollY.interpolate({
                      inputRange: [0, 200],
                      outputRange: [0, -20],
                      extrapolate: 'clamp'
                    })
                  }]
                }}
              >
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-white/20 shadow-xl p-6 min-w-[160px]">
                  <Text className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                    {userCount.toLocaleString()}+
                  </Text>
                  <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1">Active Users</Text>
                </Card>
              </Animated.View>

              <Animated.View
                style={{
                  transform: [{
                    translateY: scrollY.interpolate({
                      inputRange: [0, 200],
                      outputRange: [0, -30],
                      extrapolate: 'clamp'
                    })
                  }]
                }}
              >
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-white/20 shadow-xl p-6 min-w-[160px]">
                  <Text className="text-4xl font-bold text-pink-600 dark:text-pink-400">
                    {quizCount}+
                  </Text>
                  <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1">Unique Quizzes</Text>
                </Card>
              </Animated.View>

              <Animated.View
                style={{
                  transform: [{
                    translateY: scrollY.interpolate({
                      inputRange: [0, 200],
                      outputRange: [0, -25],
                      extrapolate: 'clamp'
                    })
                  }]
                }}
              >
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-white/20 shadow-xl p-6 min-w-[160px]">
                  <Text className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                    {insightCount.toLocaleString()}+
                  </Text>
                  <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1">Insights Shared</Text>
                </Card>
              </Animated.View>
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Features Section with Glass Morphism */}
      <View className="px-6 py-20 bg-gray-50 dark:bg-gray-800/50">
        <View className="max-w-6xl mx-auto">
          <View className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              <Text className="text-purple-600 dark:text-purple-400 font-semibold">Features</Text>
            </Badge>
            <Text className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Personality Spark?
            </Text>
            <Text className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Experience the most advanced personality analysis platform powered by cutting-edge AI
            </Text>
          </View>

          <View className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon="cpu"
              title="AI-Powered Analysis"
              description="Advanced machine learning algorithms provide deep, accurate personality insights"
              color="purple"
              delay={0}
            />
            <FeatureCard
              icon="zap"
              title="Instant Results"
              description="Get comprehensive personality analysis in seconds, not hours"
              color="pink"
              delay={100}
            />
            <FeatureCard
              icon="shield"
              title="100% Private"
              description="Your data is encrypted and never shared. Take quizzes anonymously"
              color="blue"
              delay={200}
            />
            <FeatureCard
              icon="trending-up"
              title="Track Progress"
              description="Monitor your personality evolution over time with detailed analytics"
              color="green"
              delay={300}
            />
            <FeatureCard
              icon="users"
              title="Compare & Share"
              description="See how you match with friends and share insights on social media"
              color="orange"
              delay={400}
            />
            <FeatureCard
              icon="refresh-cw"
              title="Always Fresh"
              description="New AI-generated quizzes daily means endless discovery"
              color="indigo"
              delay={500}
            />
          </View>
        </View>
      </View>

      {/* How It Works Section */}
      <View className="px-6 py-20 bg-white dark:bg-gray-900">
        <View className="max-w-6xl mx-auto">
          <View className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              <Text className="text-purple-600 dark:text-purple-400 font-semibold">Process</Text>
            </Badge>
            <Text className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </Text>
            <Text className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Three simple steps to unlock your personality insights
            </Text>
          </View>

          <View className="max-w-4xl mx-auto">
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
          </View>
        </View>
      </View>

      {/* Testimonials Section */}
      <View className="px-6 py-20 bg-gray-50 dark:bg-gray-800/50">
        <View className="max-w-6xl mx-auto">
          <View className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              <Text className="text-purple-600 dark:text-purple-400 font-semibold">Testimonials</Text>
            </Badge>
            <Text className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Loved by Millions
            </Text>
            <Text className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              See what our users are saying about their personality discovery journey
            </Text>
          </View>

          <View className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
          </View>
        </View>
      </View>

      {/* Final CTA Section */}
      <View className="px-6 py-20 bg-gradient-to-br from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 relative overflow-hidden">
        <View className="absolute inset-0">
          <View className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <View className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        </View>
        
        <View className="max-w-4xl mx-auto text-center relative z-10">
          <Text className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Meet the Real You?
          </Text>
          <Text className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join over 50,000 people who've discovered their authentic selves through our AI-powered personality analysis
          </Text>
          <Button
            size="xl"
            className="bg-white hover:bg-gray-100 shadow-2xl min-w-[200px]"
            onPress={() => navigation.navigate('QuizList')}
          >
            <Icon name="arrow-right" size={24} color="#9333ea" />
            <Text className="ml-2 text-purple-600 font-bold text-lg">Start Your Journey</Text>
          </Button>
          
          <Text className="text-sm text-white/70 mt-6">
            No registration required • 100% free • 5 minutes to complete
          </Text>
        </View>
      </View>

      <Footer />
    </ScrollView>
  );
};

// Feature Card Component with hover animations
const FeatureCard: React.FC<{ 
  icon: string; 
  title: string; 
  description: string; 
  color: string;
  delay: number;
}> = ({ icon, title, description, color, delay }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      delay,
      useNativeDriver: true,
    }).start();
  }, [delay]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const colorClasses: { [key: string]: string } = {
    purple: 'bg-purple-500/10 dark:bg-purple-500/20',
    pink: 'bg-pink-500/10 dark:bg-pink-500/20',
    blue: 'bg-blue-500/10 dark:bg-blue-500/20',
    green: 'bg-green-500/10 dark:bg-green-500/20',
    orange: 'bg-orange-500/10 dark:bg-orange-500/20',
    indigo: 'bg-indigo-500/10 dark:bg-indigo-500/20',
  };

  const iconColors: { [key: string]: string } = {
    purple: '#9333ea',
    pink: '#ec4899',
    blue: '#3b82f6',
    green: '#10b981',
    orange: '#f97316',
    indigo: '#6366f1',
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }]
      }}
    >
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <Card className="p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20 hover:shadow-2xl transition-all duration-300 h-full">
          <View className={`w-16 h-16 ${colorClasses[color]} rounded-2xl flex items-center justify-center mb-6`}>
            <Icon name={icon} size={28} color={iconColors[color]} />
          </View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {title}
          </Text>
          <Text className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {description}
          </Text>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Process Step Component
const ProcessStep: React.FC<{ 
  number: string; 
  title: string; 
  description: string;
  isLast: boolean;
}> = ({ number, title, description, isLast }) => (
  <View className="flex-row mb-12 relative">
    <View className="relative">
      <View className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
        <Text className="text-white font-bold text-2xl">{number}</Text>
      </View>
      {!isLast && (
        <View className="absolute top-20 left-10 w-0.5 h-24 bg-gradient-to-b from-purple-600 to-transparent" />
      )}
    </View>
    <View className="flex-1 ml-6">
      <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
        {title}
      </Text>
      <Text className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
        {description}
      </Text>
    </View>
  </View>
);

// Testimonial Card Component
const TestimonialCard: React.FC<{
  content: string;
  author: string;
  role: string;
  rating: number;
}> = ({ content, author, role, rating }) => (
  <Card className="p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-gray-200/20 dark:border-gray-700/20 h-full">
    <View className="flex-row mb-4">
      {[...Array(rating)].map((_, i) => (
        <Icon key={i} name="star" size={20} color="#f59e0b" />
      ))}
    </View>
    <Text className="text-gray-700 dark:text-gray-200 text-lg leading-relaxed mb-6 italic">
      "{content}"
    </Text>
    <View className="border-t border-gray-200 dark:border-gray-700 pt-4">
      <Text className="font-semibold text-gray-900 dark:text-white">
        {author}
      </Text>
      <Text className="text-sm text-gray-500 dark:text-gray-400">
        {role}
      </Text>
    </View>
  </Card>
);

export default HomeScreen;
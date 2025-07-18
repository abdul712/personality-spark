import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Animated } from 'react-native';
import { Icon } from '../components/ui/Icons';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

interface QuizListScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
  };
}

interface QuizCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
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
    icon: 'cpu',
    color: 'purple',
    duration: '5-7 mins',
    questions: 25,
    difficulty: 'Medium'
  },
  {
    id: 'daily',
    title: 'Daily Challenge',
    description: 'A new personality puzzle every day. Keep your streak going!',
    icon: 'zap',
    color: 'orange',
    duration: '3-5 mins',
    questions: 15,
    difficulty: 'Easy'
  },
  {
    id: 'quick',
    title: 'Quick Assessment',
    description: 'Get instant insights with just 5 questions',
    icon: 'trending-up',
    color: 'green',
    duration: '2 mins',
    questions: 5,
    difficulty: 'Easy'
  },
  {
    id: 'thisorthat',
    title: 'This or That',
    description: 'Rapid-fire choices that reveal your true preferences',
    icon: 'layers',
    color: 'red',
    duration: '1-2 mins',
    questions: 10,
    difficulty: 'Easy'
  },
  {
    id: 'mood',
    title: 'Mood Personality',
    description: 'Understand how your current mood shapes your personality',
    icon: 'heart',
    color: 'pink',
    duration: '3-4 mins',
    questions: 12,
    difficulty: 'Medium'
  },
  {
    id: 'career',
    title: 'Career Match',
    description: 'Find careers that align with your personality type',
    icon: 'shield',
    color: 'blue',
    duration: '4-6 mins',
    questions: 20,
    difficulty: 'Hard'
  }
];

const QuizListScreen: React.FC<QuizListScreenProps> = ({ navigation }) => {
  const [loading, setLoading] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleQuizSelect = (quizType: string) => {
    setSelectedCategory(quizType);
    setLoading(true);
    
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      navigation.navigate('Quiz', { quizType });
      setTimeout(() => {
        setLoading(false);
        setSelectedCategory(null);
      }, 1000);
    });
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
        <View className="items-center">
          <ActivityIndicator size="large" color="#9333ea" />
          <Text className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Generating your unique quiz...
          </Text>
          <Text className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            This won't take long
          </Text>
        </View>
      </View>
    );
  }

  const colorClasses: { [key: string]: string } = {
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600',
    pink: 'from-pink-500 to-pink-600',
    blue: 'from-blue-500 to-blue-600',
  };

  const iconColors: { [key: string]: string } = {
    purple: '#9333ea',
    orange: '#f97316',
    green: '#10b981',
    red: '#ef4444',
    pink: '#ec4899',
    blue: '#3b82f6',
  };

  const difficultyColors: { [key: string]: 'default' | 'secondary' | 'outline' } = {
    Easy: 'secondary',
    Medium: 'default',
    Hard: 'outline',
  };

  return (
    <ScrollView 
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
      <Animated.View 
        className="px-6 pt-8 pb-6"
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}
      >
        <View className="mb-2">
          <Badge variant="secondary" className="inline-flex mb-4">
            <Icon name="star" size={14} color="#9333ea" />
            <Text className="ml-1 text-purple-600 dark:text-purple-400 font-semibold">
              Choose Your Path
            </Text>
          </Badge>
        </View>
        
        <Text className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
          Personality Quizzes
        </Text>
        <Text className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
          Each quiz is uniquely generated just for you by our AI engine
        </Text>
      </Animated.View>

      {/* Quiz Categories Grid */}
      <View className="px-6 pb-6">
        <View className="flex-row flex-wrap justify-between">
          {quizCategories.map((quiz, index) => (
            <Animated.View
              key={quiz.id}
              style={{
                opacity: fadeAnim,
                transform: [{
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 30],
                    outputRange: [0, 30 + index * 10]
                  })
                }],
                width: '48%',
              }}
              className="mb-4"
            >
              <TouchableOpacity
                onPress={() => handleQuizSelect(quiz.id)}
                activeOpacity={0.9}
              >
                <Card className="p-6 bg-white dark:bg-gray-800 h-full min-h-[220px] relative overflow-hidden">
                  {/* Gradient Background */}
                  <View className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClasses[quiz.color]} opacity-10 rounded-full blur-2xl`} />
                  
                  {/* Icon */}
                  <View className={`w-14 h-14 bg-gradient-to-br ${colorClasses[quiz.color]} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
                    <Icon name={quiz.icon} size={24} color="white" />
                  </View>

                  {/* Content */}
                  <Text className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {quiz.title}
                  </Text>
                  <Text className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                    {quiz.description}
                  </Text>

                  {/* Footer */}
                  <View className="mt-auto">
                    <View className="flex-row justify-between items-center mb-3">
                      <Badge variant={difficultyColors[quiz.difficulty]} className="text-xs">
                        <Text className="font-semibold">{quiz.difficulty}</Text>
                      </Badge>
                      <Text className="text-xs text-gray-500 dark:text-gray-400">
                        {quiz.questions} questions
                      </Text>
                    </View>
                    
                    <View className="flex-row justify-between items-center">
                      <Text className="text-sm font-semibold" style={{ color: iconColors[quiz.color] }}>
                        {quiz.duration}
                      </Text>
                      <Icon name="arrow-right" size={16} color={iconColors[quiz.color]} />
                    </View>
                  </View>

                  {selectedCategory === quiz.id && (
                    <View className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center">
                      <ActivityIndicator size="small" color={iconColors[quiz.color]} />
                    </View>
                  )}
                </Card>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* Random Quiz Section */}
      <View className="px-6 pb-10">
        <Card className="p-8 bg-gradient-to-br from-purple-600 to-pink-600 relative overflow-hidden">
          <View className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <View className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
          
          <View className="relative z-10 items-center">
            <View className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4">
              <Text className="text-4xl">🎲</Text>
            </View>
            
            <Text className="text-2xl font-bold text-white mb-3">
              Feeling Lucky?
            </Text>
            <Text className="text-white/90 text-center mb-6 text-base leading-relaxed">
              Let AI surprise you with a completely random personality assessment tailored just for you
            </Text>
            
            <Button
              className="bg-white hover:bg-gray-100 shadow-xl min-w-[160px]"
              onPress={() => {
                const randomQuiz = quizCategories[Math.floor(Math.random() * quizCategories.length)];
                handleQuizSelect(randomQuiz.id);
              }}
            >
              <Icon name="zap" size={20} color="#9333ea" />
              <Text className="ml-2 text-purple-600 font-bold">Surprise Me!</Text>
            </Button>
          </View>
        </Card>
      </View>

      {/* Stats Section */}
      <View className="px-6 pb-10">
        <View className="flex-row justify-around">
          <View className="items-center">
            <Text className="text-3xl font-bold text-purple-600 dark:text-purple-400">50K+</Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1">Quizzes Taken</Text>
          </View>
          <View className="items-center">
            <Text className="text-3xl font-bold text-pink-600 dark:text-pink-400">98%</Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1">Accuracy Rate</Text>
          </View>
          <View className="items-center">
            <Text className="text-3xl font-bold text-blue-600 dark:text-blue-400">4.9</Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1">User Rating</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default QuizListScreen;
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import { Icon } from '../components/ui/Icons';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

interface QuizScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
    goBack: () => void;
  };
  route: {
    params: {
      quizType: string;
      quizId?: string;
    };
  };
}

interface Question {
  id: number;
  text: string;
  options: {
    text: string;
    value: string;
  }[];
}

const { width } = Dimensions.get('window');

const QuizScreen: React.FC<QuizScreenProps> = ({ navigation, route }) => {
  const { quizType } = route.params;

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Simulate loading quiz questions
    setTimeout(() => {
      // Mock questions - in real app, these would come from API
      const mockQuestions: Question[] = [
        {
          id: 1,
          text: "When you're at a party, you typically...",
          options: [
            { text: "Energize by talking to many people", value: "extrovert_high" },
            { text: "Enjoy a few deep conversations", value: "extrovert_medium" },
            { text: "Find a quiet corner with close friends", value: "introvert_medium" },
            { text: "Feel drained and want to leave early", value: "introvert_high" }
          ]
        },
        {
          id: 2,
          text: "When making decisions, you rely more on...",
          options: [
            { text: "Logic and objective analysis", value: "thinking_high" },
            { text: "A mix of logic and feelings", value: "balanced" },
            { text: "How it affects people involved", value: "feeling_medium" },
            { text: "Your gut feeling and emotions", value: "feeling_high" }
          ]
        },
        {
          id: 3,
          text: "Your ideal weekend involves...",
          options: [
            { text: "Trying something completely new", value: "openness_high" },
            { text: "A mix of familiar and new activities", value: "openness_medium" },
            { text: "Relaxing with familiar comforts", value: "openness_low" },
            { text: "Following your usual routine", value: "openness_very_low" }
          ]
        },
        {
          id: 4,
          text: "When working on projects, you...",
          options: [
            { text: "Plan every detail in advance", value: "conscientiousness_high" },
            { text: "Have a general plan but stay flexible", value: "conscientiousness_medium" },
            { text: "Figure it out as you go", value: "conscientiousness_low" },
            { text: "Work best under last-minute pressure", value: "conscientiousness_very_low" }
          ]
        },
        {
          id: 5,
          text: "In stressful situations, you tend to...",
          options: [
            { text: "Stay calm and solution-focused", value: "neuroticism_low" },
            { text: "Feel stressed but manage it well", value: "neuroticism_medium" },
            { text: "Get anxious but work through it", value: "neuroticism_high" },
            { text: "Feel overwhelmed easily", value: "neuroticism_very_high" }
          ]
        }
      ];
      setQuestions(mockQuestions);
      setLoading(false);

      // Animate in
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
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }, 1000);
  }, [quizType]);

  useEffect(() => {
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: (currentQuestion + 1) / questions.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentQuestion, questions.length]);

  const animateTransition = (callback: () => void) => {
    setTransitioning(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -30,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      callback();
      slideAnim.setValue(30);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setTransitioning(false));
    });
  };

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [currentQuestion]: value };
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        animateTransition(() => setCurrentQuestion(currentQuestion + 1));
      } else {
        // Quiz completed - navigate to results
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          navigation.navigate('Result', { resultId: 'mock-result-id' });
        });
      }
    }, 300);
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      animateTransition(() => setCurrentQuestion(currentQuestion - 1));
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
        <View className="items-center">
          <View className="w-20 h-20 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-4">
            <Icon name="cpu" size={32} color="#9333ea" />
          </View>
          <Text className="text-xl text-gray-800 dark:text-gray-200 font-semibold">
            Preparing your personalized quiz...
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Our AI is crafting questions just for you
          </Text>
        </View>
      </View>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Progress Header */}
      <View className="bg-white dark:bg-gray-800 px-6 py-4 shadow-sm">
        <View className="flex-row justify-between items-center mb-3">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="p-2"
          >
            <Icon name="arrow-left" size={24} color="#6b7280" />
          </TouchableOpacity>
          <Text className="text-sm font-semibold text-gray-600 dark:text-gray-300">
            Question {currentQuestion + 1} of {questions.length}
          </Text>
          <View className="w-10" />
        </View>
        
        {/* Progress Bar */}
        <View className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <Animated.View 
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
            style={{
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%']
              })
            }}
          />
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }}
          className="px-6 pt-8"
        >
          {/* Question Card */}
          <Card className="p-8 bg-white dark:bg-gray-800 mb-8 shadow-xl">
            <View className="flex-row items-start mb-4">
              <View className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mr-4">
                <Text className="text-purple-600 dark:text-purple-400 font-bold">
                  {currentQuestion + 1}
                </Text>
              </View>
              <Text className="flex-1 text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                {question.text}
              </Text>
            </View>
            
            <Text className="text-sm text-gray-500 dark:text-gray-400 ml-14">
              Select the option that best describes you
            </Text>
          </Card>

          {/* Options */}
          <View className="mb-8">
            {question.options.map((option, index) => {
              const isSelected = answers[currentQuestion] === option.value;
              const animDelay = index * 50;
              
              return (
                <Animated.View
                  key={index}
                  style={{
                    opacity: fadeAnim,
                    transform: [{
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 30],
                        outputRange: [0, 30 + animDelay / 10]
                      })
                    }]
                  }}
                  className="mb-3"
                >
                  <TouchableOpacity
                    onPress={() => !transitioning && handleAnswer(option.value)}
                    activeOpacity={0.8}
                    disabled={transitioning}
                  >
                    <Card 
                      className={`p-6 ${
                        isSelected 
                          ? 'bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-500' 
                          : 'bg-white dark:bg-gray-800 border-2 border-transparent'
                      } transition-all`}
                    >
                      <View className="flex-row items-center">
                        <View className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                          isSelected
                            ? 'border-purple-500 bg-purple-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {isSelected && (
                            <Icon name="check" size={14} color="white" />
                          )}
                        </View>
                        <Text className={`flex-1 text-base ${
                          isSelected
                            ? 'text-purple-700 dark:text-purple-300 font-semibold'
                            : 'text-gray-700 dark:text-gray-200'
                        }`}>
                          {option.text}
                        </Text>
                      </View>
                    </Card>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 px-6 py-4 shadow-2xl">
        <View className="flex-row justify-between items-center">
          {currentQuestion > 0 ? (
            <Button
              variant="outline"
              onPress={handleBack}
              disabled={transitioning}
              className="flex-1 mr-2"
            >
              <Icon name="arrow-left" size={18} color="#6b7280" />
              <Text className="ml-2 text-gray-600 dark:text-gray-300 font-semibold">
                Previous
              </Text>
            </Button>
          ) : (
            <View className="flex-1 mr-2" />
          )}
          
          <Button
            variant="gradient"
            disabled={!answers[currentQuestion] || transitioning}
            className="flex-1 ml-2"
            onPress={() => {
              // Skip button functionality
              if (currentQuestion < questions.length - 1) {
                animateTransition(() => setCurrentQuestion(currentQuestion + 1));
              }
            }}
          >
            <Text className="text-white font-semibold">
              {currentQuestion === questions.length - 1 ? 'Complete' : 'Skip'}
            </Text>
            <Icon name="arrow-right" size={18} color="white" />
          </Button>
        </View>
      </View>
    </View>
  );
};

export default QuizScreen;
import React, { useState, useEffect, useRef } from 'react';
import { TouchableOpacity, Animated, Dimensions } from 'react-native';
import { View, Text, ScrollView } from '../components/WebView';
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

// Helper function to generate mock questions based on quiz type
const generateMockQuestions = (quizType: string): Question[] => {
  const questionBanks: Record<string, Question[]> = {
    big5: [
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
    ],
    daily: [
      {
        id: 1,
        text: "This morning, your ideal start would be:",
        options: [
          { text: "Quiet meditation and journaling", value: "introspective" },
          { text: "Energetic workout or run", value: "active" },
          { text: "Coffee with friends or family", value: "social" },
          { text: "Diving straight into projects", value: "productive" }
        ]
      },
      {
        id: 2,
        text: "Today's energy feels like:",
        options: [
          { text: "A rocket ready to launch", value: "high_energy" },
          { text: "A steady flowing river", value: "balanced" },
          { text: "A cozy fireplace", value: "relaxed" },
          { text: "A hibernating bear", value: "low_energy" }
        ]
      },
      {
        id: 3,
        text: "Your focus today is on:",
        options: [
          { text: "Achieving big goals", value: "ambitious" },
          { text: "Helping others succeed", value: "supportive" },
          { text: "Learning something new", value: "curious" },
          { text: "Finding inner peace", value: "mindful" }
        ]
      }
    ],
    quick: [
      {
        id: 1,
        text: "Your decision-making style is:",
        options: [
          { text: "Quick and intuitive", value: "intuitive" },
          { text: "Careful and analytical", value: "analytical" },
          { text: "Collaborative and inclusive", value: "collaborative" },
          { text: "Bold and decisive", value: "decisive" }
        ]
      },
      {
        id: 2,
        text: "In social situations, you're:",
        options: [
          { text: "The life of the party", value: "outgoing" },
          { text: "Deep conversation seeker", value: "thoughtful" },
          { text: "The organizer", value: "leader" },
          { text: "Happy observer", value: "observer" }
        ]
      }
    ],
    thisorthat: [
      {
        id: 1,
        text: "Pick your preference:",
        options: [
          { text: "Early morning sunrise", value: "morning_person" },
          { text: "Late night stargazing", value: "night_owl" }
        ]
      },
      {
        id: 2,
        text: "Choose one:",
        options: [
          { text: "Big party with everyone", value: "extroverted" },
          { text: "Cozy dinner with close friends", value: "intimate" }
        ]
      },
      {
        id: 3,
        text: "Would you rather:",
        options: [
          { text: "Explore a new city", value: "adventurous" },
          { text: "Perfect your favorite hobby", value: "focused" }
        ]
      }
    ],
    mood: [
      {
        id: 1,
        text: "Right now, your emotional weather feels like:",
        options: [
          { text: "Sunny and clear", value: "positive" },
          { text: "Cloudy with breaks of sun", value: "mixed" },
          { text: "Stormy and intense", value: "intense" },
          { text: "Calm and misty", value: "peaceful" }
        ]
      },
      {
        id: 2,
        text: "Your current energy could power:",
        options: [
          { text: "A rocket ship", value: "high_energy" },
          { text: "A steady light bulb", value: "stable" },
          { text: "A flickering candle", value: "variable" },
          { text: "A night light", value: "low_energy" }
        ]
      }
    ],
    career: [
      {
        id: 1,
        text: "Your ideal work environment would be:",
        options: [
          { text: "Fast-paced startup", value: "entrepreneurial" },
          { text: "Established corporation", value: "structured" },
          { text: "Creative agency", value: "creative" },
          { text: "Remote/flexible", value: "independent" }
        ]
      },
      {
        id: 2,
        text: "You're most motivated by:",
        options: [
          { text: "Making a difference", value: "purpose_driven" },
          { text: "Financial success", value: "achievement_oriented" },
          { text: "Creative expression", value: "artistic" },
          { text: "Work-life balance", value: "balanced" }
        ]
      }
    ],
    // New quiz types
    relationship: [
      {
        id: 1,
        text: "In relationships, you express love through:",
        options: [
          { text: "Words of affirmation", value: "verbal" },
          { text: "Quality time together", value: "time" },
          { text: "Acts of service", value: "service" },
          { text: "Physical touch", value: "physical" }
        ]
      },
      {
        id: 2,
        text: "Your ideal relationship dynamic is:",
        options: [
          { text: "Equal partners in everything", value: "egalitarian" },
          { text: "Complementary strengths", value: "complementary" },
          { text: "Independent but connected", value: "independent" },
          { text: "Deeply intertwined lives", value: "interdependent" }
        ]
      }
    ],
    emotional_intelligence: [
      {
        id: 1,
        text: "When someone is upset, you:",
        options: [
          { text: "Feel what they're feeling", value: "empathetic" },
          { text: "Understand their perspective", value: "cognitive" },
          { text: "Offer practical solutions", value: "practical" },
          { text: "Give them space", value: "respectful" }
        ]
      },
      {
        id: 2,
        text: "You recognize your emotions:",
        options: [
          { text: "Immediately as they arise", value: "highly_aware" },
          { text: "After some reflection", value: "reflective" },
          { text: "When others point them out", value: "developing" },
          { text: "Rarely think about them", value: "practical" }
        ]
      }
    ],
    leadership: [
      {
        id: 1,
        text: "As a leader, you motivate by:",
        options: [
          { text: "Setting inspiring visions", value: "visionary" },
          { text: "Leading by example", value: "authentic" },
          { text: "Recognizing achievements", value: "supportive" },
          { text: "Providing clear structure", value: "organized" }
        ]
      }
    ],
    creativity: [
      {
        id: 1,
        text: "Your best ideas come when:",
        options: [
          { text: "You're completely relaxed", value: "relaxed" },
          { text: "You're under pressure", value: "pressure" },
          { text: "You're collaborating", value: "collaborative" },
          { text: "You're in nature", value: "environmental" }
        ]
      }
    ],
    stress_response: [
      {
        id: 1,
        text: "Under stress, you tend to:",
        options: [
          { text: "Take immediate action", value: "fight" },
          { text: "Withdraw and reflect", value: "flight" },
          { text: "Seek support from others", value: "social" },
          { text: "Analyze the situation", value: "analytical" }
        ]
      }
    ],
    social_style: [
      {
        id: 1,
        text: "At social gatherings, you're usually:",
        options: [
          { text: "The conversation starter", value: "initiator" },
          { text: "The active listener", value: "listener" },
          { text: "The event organizer", value: "organizer" },
          { text: "The quiet observer", value: "observer" }
        ]
      }
    ]
  };

  // Get questions for the specific quiz type, or default to quick assessment
  const questions = questionBanks[quizType] || questionBanks.quick;
  
  // Return shuffled questions to add variety
  return questions.sort(() => Math.random() - 0.5);
};

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
      // Generate questions based on quiz type
      const mockQuestions = generateMockQuestions(quizType);
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
    const loadingMessages: Record<string, { title: string; subtitle: string; icon: string }> = {
      big5: {
        title: "Preparing your Big 5 assessment...",
        subtitle: "Analyzing personality dimensions",
        icon: "cpu"
      },
      daily: {
        title: "Creating today's challenge...",
        subtitle: "Personalizing based on the time of day",
        icon: "zap"
      },
      quick: {
        title: "Generating quick insights...",
        subtitle: "This will only take a moment",
        icon: "trending-up"
      },
      thisorthat: {
        title: "Loading rapid choices...",
        subtitle: "Preparing fun comparisons",
        icon: "layers"
      },
      mood: {
        title: "Reading your emotional weather...",
        subtitle: "Tuning into your current state",
        icon: "heart"
      },
      career: {
        title: "Analyzing career compatibility...",
        subtitle: "Matching your traits to professions",
        icon: "shield"
      },
      relationship: {
        title: "Exploring relationship dynamics...",
        subtitle: "Understanding your connection style",
        icon: "heart"
      },
      emotional_intelligence: {
        title: "Measuring emotional awareness...",
        subtitle: "Preparing EQ assessment",
        icon: "brain"
      },
      leadership: {
        title: "Identifying leadership traits...",
        subtitle: "Analyzing your influence style",
        icon: "award"
      },
      creativity: {
        title: "Unlocking creative potential...",
        subtitle: "Exploring your innovative side",
        icon: "palette"
      },
      stress_response: {
        title: "Analyzing stress patterns...",
        subtitle: "Understanding your coping style",
        icon: "activity"
      },
      social_style: {
        title: "Mapping social preferences...",
        subtitle: "Discovering your interaction style",
        icon: "users"
      }
    };

    const message = loadingMessages[quizType] || {
      title: "Preparing your personalized quiz...",
      subtitle: "Our AI is crafting questions just for you",
      icon: "cpu"
    };

    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
        <View className="items-center">
          <View className="w-20 h-20 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-4">
            <Icon name={message.icon} size={32} color="#9333ea" />
          </View>
          <Text className="text-xl text-gray-800 dark:text-gray-200 font-semibold">
            {message.title}
          </Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {message.subtitle}
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
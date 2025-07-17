import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';

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

const QuizScreen: React.FC<QuizScreenProps> = ({ navigation, route }) => {
  const { quizType } = route.params;

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const progressAnim = useState(new Animated.Value(0))[0];

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

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [currentQuestion]: value };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Quiz completed - navigate to results
      navigation.navigate('Result', { resultId: 'mock-result-id' });
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Preparing your personalized quiz...</Text>
      </View>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View 
            style={[
              styles.progressFill, 
              { 
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%']
                })
              }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          Question {currentQuestion + 1} of {questions.length}
        </Text>
      </View>

      <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.questionText}>{question.text}</Text>

        <View style={styles.optionsContainer}>
          {question.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                answers[currentQuestion] === option.value && styles.selectedOption
              ]}
              onPress={() => handleAnswer(option.value)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.optionText,
                answers[currentQuestion] === option.value && styles.selectedOptionText
              ]}>
                {option.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {currentQuestion > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>← Previous Question</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#4A5568',
  },
  progressContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6B46C1',
    borderRadius: 4,
  },
  progressText: {
    marginTop: 10,
    fontSize: 14,
    color: '#4A5568',
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  questionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 30,
    marginTop: 20,
    lineHeight: 32,
  },
  optionsContainer: {
    marginBottom: 30,
  },
  optionButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
  },
  selectedOption: {
    borderColor: '#6B46C1',
    backgroundColor: '#F3F0FF',
  },
  optionText: {
    fontSize: 16,
    color: '#2D3748',
    lineHeight: 22,
  },
  selectedOptionText: {
    color: '#6B46C1',
    fontWeight: '600',
  },
  backButton: {
    alignSelf: 'center',
    padding: 15,
  },
  backButtonText: {
    color: '#6B46C1',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default QuizScreen;
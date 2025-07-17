import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';

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
}

const quizCategories: QuizCategory[] = [
  {
    id: 'big5',
    title: 'Big 5 Personality',
    description: 'Discover your core personality traits through the scientifically-backed Big Five model',
    icon: '🧠',
    color: '#6B46C1',
    duration: '5-7 mins'
  },
  {
    id: 'daily',
    title: 'Daily Challenge',
    description: 'A new personality puzzle every day. Keep your streak going!',
    icon: '📅',
    color: '#F59E0B',
    duration: '3-5 mins'
  },
  {
    id: 'quick',
    title: 'Quick Assessment',
    description: 'Get instant insights with just 5 questions',
    icon: '⚡',
    color: '#10B981',
    duration: '2 mins'
  },
  {
    id: 'thisorthat',
    title: 'This or That',
    description: 'Rapid-fire choices that reveal your true preferences',
    icon: '🎯',
    color: '#EF4444',
    duration: '1-2 mins'
  },
  {
    id: 'mood',
    title: 'Mood Personality',
    description: 'Understand how your current mood shapes your personality',
    icon: '😊',
    color: '#8B5CF6',
    duration: '3-4 mins'
  },
  {
    id: 'career',
    title: 'Career Match',
    description: 'Find careers that align with your personality type',
    icon: '💼',
    color: '#3B82F6',
    duration: '4-6 mins'
  }
];

const QuizListScreen: React.FC<QuizListScreenProps> = ({ navigation }) => {
  const [loading, setLoading] = React.useState(false);

  const handleQuizSelect = (quizType: string) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('Quiz', { quizType });
    }, 500);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B46C1" />
        <Text style={styles.loadingText}>Generating your unique quiz...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Choose Your Journey</Text>
        <Text style={styles.headerSubtitle}>
          Each quiz is uniquely generated just for you by AI
        </Text>
      </View>

      <View style={styles.quizGrid}>
        {quizCategories.map((quiz) => (
          <TouchableOpacity
            key={quiz.id}
            style={[styles.quizCard, { borderColor: quiz.color }]}
            onPress={() => handleQuizSelect(quiz.id)}
            activeOpacity={0.8}
          >
            <View style={[styles.iconContainer, { backgroundColor: quiz.color + '20' }]}>
              <Text style={styles.quizIcon}>{quiz.icon}</Text>
            </View>
            <Text style={styles.quizTitle}>{quiz.title}</Text>
            <Text style={styles.quizDescription}>{quiz.description}</Text>
            <View style={styles.quizFooter}>
              <Text style={[styles.duration, { color: quiz.color }]}>{quiz.duration}</Text>
              <Text style={[styles.startText, { color: quiz.color }]}>Start →</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.promoSection}>
        <Text style={styles.promoTitle}>🎲 Feeling Lucky?</Text>
        <Text style={styles.promoText}>
          Let AI surprise you with a completely random personality assessment
        </Text>
        <TouchableOpacity 
          style={styles.randomButton}
          onPress={() => {
            const randomQuiz = quizCategories[Math.floor(Math.random() * quizCategories.length)];
            handleQuizSelect(randomQuiz.id);
          }}
        >
          <Text style={styles.randomButtonText}>Surprise Me!</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    backgroundColor: '#FAFAFA',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#4A5568',
  },
  header: {
    padding: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
  },
  quizGrid: {
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quizCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    width: '48%',
    minHeight: 200,
    borderWidth: 2,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  quizIcon: {
    fontSize: 32,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 8,
  },
  quizDescription: {
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 20,
    flex: 1,
  },
  quizFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },
  duration: {
    fontSize: 12,
    fontWeight: '600',
  },
  startText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  promoSection: {
    margin: 20,
    padding: 30,
    backgroundColor: 'white',
    borderRadius: 16,
    alignItems: 'center',
  },
  promoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 10,
  },
  promoText: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
    marginBottom: 20,
  },
  randomButton: {
    backgroundColor: '#6B46C1',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  randomButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default QuizListScreen;
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';

interface HomeScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
  };
}

const { width } = Dimensions.get('window');

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Personality Spark</Text>
        <Text style={styles.subtitle}>Discover Your True Self Through AI-Powered Quizzes</Text>
      </View>

      <View style={styles.heroSection}>
        <Text style={styles.heroText}>
          Explore your personality with unique, engaging quizzes generated just for you. 
          No registration required, start discovering yourself today!
        </Text>
        
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => navigation.navigate('QuizList')}
        >
          <Text style={styles.primaryButtonText}>Start Your Journey</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Why Personality Spark?</Text>
        
        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>🎯</Text>
          <Text style={styles.featureTitle}>AI-Generated Quizzes</Text>
          <Text style={styles.featureText}>
            Every quiz is unique, created by AI to reveal different aspects of your personality
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>⚡</Text>
          <Text style={styles.featureTitle}>No Registration</Text>
          <Text style={styles.featureText}>
            Jump right in! No sign-ups, no barriers. Just pure personality exploration
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>📱</Text>
          <Text style={styles.featureTitle}>Mobile-First Design</Text>
          <Text style={styles.featureText}>
            Perfectly optimized for any device. Take quizzes anywhere, anytime
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>🎨</Text>
          <Text style={styles.featureTitle}>Beautiful Results</Text>
          <Text style={styles.featureText}>
            Get stunning visualizations of your personality traits and share them with friends
          </Text>
        </View>
      </View>

      <View style={styles.ctaSection}>
        <Text style={styles.ctaText}>Ready to spark your personality journey?</Text>
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('QuizList')}
        >
          <Text style={styles.secondaryButtonText}>Explore Quizzes</Text>
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
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#6B46C1',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#4A5568',
    textAlign: 'center',
    maxWidth: 600,
  },
  heroSection: {
    padding: 40,
    alignItems: 'center',
  },
  heroText: {
    fontSize: 16,
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 30,
    maxWidth: 500,
    lineHeight: 24,
  },
  primaryButton: {
    backgroundColor: '#6B46C1',
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 30,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  featuresSection: {
    padding: 20,
    backgroundColor: 'white',
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A202C',
    textAlign: 'center',
    marginBottom: 40,
  },
  featureCard: {
    backgroundColor: '#F7FAFC',
    padding: 25,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    maxWidth: 400,
    alignSelf: 'center',
    width: width > 400 ? 400 : width - 40,
  },
  featureIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#4A5568',
    textAlign: 'center',
    lineHeight: 20,
  },
  ctaSection: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
  },
  ctaText: {
    fontSize: 20,
    color: '#2D3748',
    marginBottom: 20,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#6B46C1',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  secondaryButtonText: {
    color: '#6B46C1',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
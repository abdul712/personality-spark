import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Share, Platform } from 'react-native';

interface ResultScreenProps {
  navigation: {
    navigate: (screen: string, params?: any) => void;
  };
  route: {
    params: {
      resultId: string;
    };
  };
}

interface PersonalityTrait {
  name: string;
  score: number;
  description: string;
  color: string;
}

interface QuizResult {
  personalityType: string;
  title: string;
  description: string;
  traits: PersonalityTrait[];
  strengths: string[];
  growthAreas: string[];
  careerMatches: string[];
}

const ResultScreen: React.FC<ResultScreenProps> = ({ navigation, route }) => {
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading results
    setTimeout(() => {
      const mockResult: QuizResult = {
        personalityType: "The Innovative Explorer",
        title: "Your Unique Personality Profile",
        description: "You're a creative thinker who thrives on new experiences while maintaining a balanced approach to life's challenges.",
        traits: [
          { name: "Openness", score: 85, description: "Highly creative and curious", color: "#8B5CF6" },
          { name: "Conscientiousness", score: 70, description: "Well-organized with flexibility", color: "#3B82F6" },
          { name: "Extraversion", score: 60, description: "Balanced social energy", color: "#10B981" },
          { name: "Agreeableness", score: 75, description: "Cooperative and trusting", color: "#F59E0B" },
          { name: "Emotional Stability", score: 65, description: "Generally calm and resilient", color: "#EF4444" }
        ],
        strengths: [
          "Creative problem-solving",
          "Adaptable to change",
          "Strong interpersonal skills",
          "Natural curiosity"
        ],
        growthAreas: [
          "Setting clearer boundaries",
          "Managing perfectionist tendencies",
          "Developing routine consistency"
        ],
        careerMatches: [
          "Product Designer",
          "Marketing Strategist",
          "User Experience Researcher",
          "Innovation Consultant"
        ]
      };
      setResult(mockResult);
      setLoading(false);
    }, 1500);
  }, []);

  const handleShare = async () => {
    if (!result) return;
    
    try {
      const shareMessage = `I just discovered I'm "${result.personalityType}" on Personality Spark! 🎯 My top trait is ${result.traits[0].name} at ${result.traits[0].score}%. Take the quiz and discover your unique personality: https://personalityspark.com`;
      
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({
            title: 'My Personality Results',
            text: shareMessage,
            url: 'https://personalityspark.com'
          });
        } else {
          // Fallback for browsers that don't support Web Share API
          alert('Share functionality coming soon!');
        }
      } else {
        await Share.share({
          message: shareMessage,
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleRetakeQuiz = () => {
    navigation.navigate('QuizList');
  };

  if (loading || !result) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Analyzing your personality...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.personalityType}>{result.personalityType}</Text>
        <Text style={styles.title}>{result.title}</Text>
        <Text style={styles.description}>{result.description}</Text>
      </View>

      <View style={styles.traitsSection}>
        <Text style={styles.sectionTitle}>Your Personality Traits</Text>
        {result.traits.map((trait, index) => (
          <View key={index} style={styles.traitContainer}>
            <View style={styles.traitHeader}>
              <Text style={styles.traitName}>{trait.name}</Text>
              <Text style={styles.traitScore}>{trait.score}%</Text>
            </View>
            <View style={styles.traitBarContainer}>
              <View 
                style={[
                  styles.traitBar, 
                  { width: `${trait.score}%`, backgroundColor: trait.color }
                ]} 
              />
            </View>
            <Text style={styles.traitDescription}>{trait.description}</Text>
          </View>
        ))}
      </View>

      <View style={styles.insightsSection}>
        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>💪 Your Strengths</Text>
          {result.strengths.map((strength, index) => (
            <Text key={index} style={styles.insightItem}>• {strength}</Text>
          ))}
        </View>

        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>🌱 Growth Areas</Text>
          {result.growthAreas.map((area, index) => (
            <Text key={index} style={styles.insightItem}>• {area}</Text>
          ))}
        </View>

        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>💼 Career Matches</Text>
          {result.careerMatches.map((career, index) => (
            <Text key={index} style={styles.insightItem}>• {career}</Text>
          ))}
        </View>
      </View>

      <View style={styles.actionSection}>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareButtonText}>Share Your Results 📤</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.retakeButton} onPress={handleRetakeQuiz}>
          <Text style={styles.retakeButtonText}>Take Another Quiz</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          Your results are based on AI analysis and should be viewed as insights rather than definitive assessments.
        </Text>
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
  },
  loadingText: {
    fontSize: 18,
    color: '#4A5568',
  },
  header: {
    padding: 30,
    backgroundColor: 'white',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  personalityType: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6B46C1',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 500,
  },
  traitsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 20,
  },
  traitContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
  },
  traitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  traitName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
  },
  traitScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B46C1',
  },
  traitBarContainer: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: 8,
  },
  traitBar: {
    height: '100%',
    borderRadius: 4,
  },
  traitDescription: {
    fontSize: 14,
    color: '#4A5568',
  },
  insightsSection: {
    padding: 20,
  },
  insightCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 15,
  },
  insightItem: {
    fontSize: 16,
    color: '#4A5568',
    marginBottom: 8,
    lineHeight: 22,
  },
  actionSection: {
    padding: 20,
    alignItems: 'center',
  },
  shareButton: {
    backgroundColor: '#6B46C1',
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 30,
    marginBottom: 15,
    width: '100%',
    maxWidth: 300,
  },
  shareButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  retakeButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#6B46C1',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
    width: '100%',
    maxWidth: 300,
  },
  retakeButtonText: {
    color: '#6B46C1',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  disclaimer: {
    padding: 20,
    marginBottom: 30,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#718096',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ResultScreen;
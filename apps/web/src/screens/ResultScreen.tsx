import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Share, Platform, Animated } from 'react-native';
import { Icon } from '../components/ui/Icons';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

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
  compatibility: {
    bestMatch: string;
    description: string;
  };
}

const ResultScreen: React.FC<ResultScreenProps> = ({ navigation, route }) => {
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'traits' | 'insights' | 'career'>('traits');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progressAnims = useRef(result?.traits.map(() => new Animated.Value(0)) || []).current;

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
        ],
        compatibility: {
          bestMatch: "The Strategic Architect",
          description: "Your creative nature pairs well with structured thinkers who can help bring your ideas to life"
        }
      };
      setResult(mockResult);
      setLoading(false);

      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();

      // Animate trait bars
      setTimeout(() => {
        mockResult.traits.forEach((_, index) => {
          Animated.timing(progressAnims[index], {
            toValue: 1,
            duration: 800,
            delay: index * 100,
            useNativeDriver: false,
          }).start();
        });
      }, 400);
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
      <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
        <View className="items-center">
          <View className="w-24 h-24 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-6">
            <Icon name="cpu" size={40} color="#9333ea" />
          </View>
          <Text className="text-2xl text-gray-800 dark:text-gray-200 font-semibold mb-2">
            Analyzing your personality...
          </Text>
          <Text className="text-base text-gray-500 dark:text-gray-400">
            Our AI is creating your unique profile
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900" showsVerticalScrollIndicator={false}>
      {/* Hero Section with Gradient */}
      <Animated.View 
        className="relative"
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }}
      >
        <View className="bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 px-6 pt-12 pb-24 relative overflow-hidden">
          {/* Background decoration */}
          <View className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <View className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          
          <View className="relative z-10">
            <Badge variant="secondary" className="bg-white/20 mb-4">
              <Icon name="star" size={14} color="white" />
              <Text className="ml-1 text-white font-semibold">AI Analysis Complete</Text>
            </Badge>
            
            <Text className="text-4xl font-bold text-white mb-3">
              {result.personalityType}
            </Text>
            <Text className="text-xl text-white/90 leading-relaxed">
              {result.description}
            </Text>
          </View>
        </View>

        {/* Floating Stats Cards */}
        <View className="px-6 -mt-12 mb-6">
          <View className="flex-row justify-between">
            <Card className="flex-1 mr-2 bg-white dark:bg-gray-800 shadow-xl">
              <CardContent className="p-4 items-center">
                <Text className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {result.traits[0].score}%
                </Text>
                <Text className="text-xs text-gray-600 dark:text-gray-400 mt-1">Top Trait</Text>
              </CardContent>
            </Card>
            <Card className="flex-1 mx-2 bg-white dark:bg-gray-800 shadow-xl">
              <CardContent className="p-4 items-center">
                <Text className="text-3xl font-bold text-pink-600 dark:text-pink-400">
                  {result.strengths.length}
                </Text>
                <Text className="text-xs text-gray-600 dark:text-gray-400 mt-1">Key Strengths</Text>
              </CardContent>
            </Card>
            <Card className="flex-1 ml-2 bg-white dark:bg-gray-800 shadow-xl">
              <CardContent className="p-4 items-center">
                <Text className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  95%
                </Text>
                <Text className="text-xs text-gray-600 dark:text-gray-400 mt-1">Match Score</Text>
              </CardContent>
            </Card>
          </View>
        </View>
      </Animated.View>

      {/* Tabs */}
      <View className="px-6 mb-6">
        <View className="flex-row bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {(['traits', 'insights', 'career'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setSelectedTab(tab)}
              className={`flex-1 py-3 rounded-lg ${
                selectedTab === tab ? 'bg-white dark:bg-gray-700 shadow-sm' : ''
              }`}
            >
              <Text className={`text-center font-semibold ${
                selectedTab === tab 
                  ? 'text-purple-600 dark:text-purple-400' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Tab Content */}
      <Animated.View 
        className="px-6 pb-10"
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}
      >
        {selectedTab === 'traits' && (
          <View>
            {result.traits.map((trait, index) => (
              <Card key={index} className="mb-4 bg-white dark:bg-gray-800">
                <CardContent className="p-6">
                  <View className="flex-row justify-between items-center mb-3">
                    <View className="flex-row items-center">
                      <View 
                        className="w-12 h-12 rounded-full mr-3 flex items-center justify-center"
                        style={{ backgroundColor: `${trait.color}20` }}
                      >
                        <Icon name="trending-up" size={20} color={trait.color} />
                      </View>
                      <View>
                        <Text className="text-lg font-bold text-gray-900 dark:text-white">
                          {trait.name}
                        </Text>
                        <Text className="text-sm text-gray-500 dark:text-gray-400">
                          {trait.description}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-2xl font-bold" style={{ color: trait.color }}>
                      {trait.score}%
                    </Text>
                  </View>
                  
                  <View className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <Animated.View 
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: trait.color,
                        width: progressAnims[index]?.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', `${trait.score}%`]
                        }) || '0%'
                      }}
                    />
                  </View>
                </CardContent>
              </Card>
            ))}
          </View>
        )}

        {selectedTab === 'insights' && (
          <View>
            <Card className="mb-4 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle>
                  <View className="flex-row items-center">
                    <Icon name="star" size={20} color="#10b981" />
                    <Text className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                      Your Strengths
                    </Text>
                  </View>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.strengths.map((strength, index) => (
                  <View key={index} className="flex-row items-center mb-3">
                    <View className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                    <Text className="text-base text-gray-700 dark:text-gray-200">
                      {strength}
                    </Text>
                  </View>
                ))}
              </CardContent>
            </Card>

            <Card className="mb-4 bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle>
                  <View className="flex-row items-center">
                    <Icon name="trending-up" size={20} color="#f59e0b" />
                    <Text className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                      Growth Opportunities
                    </Text>
                  </View>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.growthAreas.map((area, index) => (
                  <View key={index} className="flex-row items-center mb-3">
                    <View className="w-2 h-2 bg-amber-500 rounded-full mr-3" />
                    <Text className="text-base text-gray-700 dark:text-gray-200">
                      {area}
                    </Text>
                  </View>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
              <CardHeader>
                <CardTitle>
                  <View className="flex-row items-center">
                    <Icon name="heart" size={20} color="#ec4899" />
                    <Text className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                      Best Compatibility
                    </Text>
                  </View>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Text className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-2">
                  {result.compatibility.bestMatch}
                </Text>
                <Text className="text-base text-gray-600 dark:text-gray-300">
                  {result.compatibility.description}
                </Text>
              </CardContent>
            </Card>
          </View>
        )}

        {selectedTab === 'career' && (
          <View>
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle>
                  <View className="flex-row items-center">
                    <Icon name="shield" size={20} color="#3b82f6" />
                    <Text className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                      Ideal Career Paths
                    </Text>
                  </View>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Text className="text-base text-gray-600 dark:text-gray-300 mb-4">
                  Based on your personality profile, these careers align perfectly with your strengths:
                </Text>
                {result.careerMatches.map((career, index) => (
                  <View key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-3">
                    <Text className="text-base font-semibold text-gray-800 dark:text-gray-200">
                      {career}
                    </Text>
                  </View>
                ))}
              </CardContent>
            </Card>
          </View>
        )}
      </Animated.View>

      {/* Action Buttons */}
      <View className="px-6 pb-10">
        <Button
          size="lg"
          className="mb-3 shadow-xl"
          onPress={handleShare}
        >
          <Icon name="share-2" size={20} color="white" />
          <Text className="ml-2 text-white font-bold">Share Your Results</Text>
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          onPress={handleRetakeQuiz}
        >
          <Icon name="refresh-cw" size={20} color="#9333ea" />
          <Text className="ml-2 text-purple-600 dark:text-purple-400 font-bold">
            Take Another Quiz
          </Text>
        </Button>

        <Text className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6 italic">
          Your results are based on AI analysis and should be viewed as insights rather than definitive assessments.
        </Text>
      </View>
    </ScrollView>
  );
};

export default ResultScreen;
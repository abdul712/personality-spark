import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import QuizListScreen from './screens/QuizListScreen';
import QuizScreen from './screens/QuizScreen';
import ResultScreen from './screens/ResultScreen';
// import { ButtonDebug } from './components/ButtonDebug'; // Uncomment to debug buttons

export type RootStackParamList = {
  Home: undefined;
  QuizList: undefined;
  Quiz: { quizType: string; quizId?: string };
  Result: { resultId: string };
};

type Screen = 'Home' | 'QuizList' | 'Quiz' | 'Result';

interface NavigationState {
  screen: Screen;
  params?: any;
}

const App: React.FC = () => {
  const [navigationState, setNavigationState] = useState<NavigationState>({
    screen: 'Home'
  });

  const navigate = (screen: Screen, params?: any) => {
    setNavigationState({ screen, params });
  };

  const goBack = () => {
    // Simple back navigation
    if (navigationState.screen === 'QuizList') {
      setNavigationState({ screen: 'Home' });
    } else if (navigationState.screen === 'Quiz') {
      setNavigationState({ screen: 'QuizList' });
    } else if (navigationState.screen === 'Result') {
      setNavigationState({ screen: 'Home' });
    }
  };

  const renderHeader = () => {
    if (navigationState.screen === 'Home') return null;
    
    const titles = {
      QuizList: 'Choose Your Quiz',
      Quiz: 'Personality Quiz',
      Result: 'Your Results'
    };

    return (
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{titles[navigationState.screen as keyof typeof titles]}</Text>
        <View style={styles.headerSpacer} />
      </View>
    );
  };

  const renderScreen = () => {
    const navigationProp = {
      navigate,
      goBack,
      ...navigationState.params
    };

    switch (navigationState.screen) {
      case 'Home':
        return <HomeScreen navigation={navigationProp} />;
      case 'QuizList':
        return <QuizListScreen navigation={navigationProp} />;
      case 'Quiz':
        return <QuizScreen navigation={navigationProp} route={{ params: navigationState.params }} />;
      case 'Result':
        return <ResultScreen navigation={navigationProp} route={{ params: navigationState.params }} />;
      default:
        return <HomeScreen navigation={navigationProp} />;
    }
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderScreen()}
      {/* <ButtonDebug /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#6B46C1',
    paddingTop: Platform.OS === 'web' ? 20 : 40,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  backButton: {
    flex: 1,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    flex: 2,
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSpacer: {
    flex: 1,
  },
});

export default App;
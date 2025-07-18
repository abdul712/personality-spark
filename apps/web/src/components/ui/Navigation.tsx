import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Button } from './Button';

interface NavigationProps {
  onNavigate: (screen: string) => void;
  currentScreen: string;
}

export const Navigation: React.FC<NavigationProps> = ({ onNavigate, currentScreen }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', screen: 'home' },
    { label: 'Quizzes', screen: 'quizList' },
    { label: 'About', screen: 'about' },
    { label: 'Contact', screen: 'contact' },
  ];

  return (
    <View className="fixed top-0 left-0 right-0 z-50 glass-effect dark:glass-dark">
      <View className="container mx-auto px-4">
        <View className="flex-row items-center justify-between h-16">
          {/* Logo */}
          <TouchableOpacity onPress={() => onNavigate('home')} className="flex-row items-center">
            <View className="w-10 h-10 bg-primary-600 rounded-full items-center justify-center mr-3">
              <Text className="text-white font-bold text-lg">PS</Text>
            </View>
            <Text className="text-xl font-bold text-gray-900 dark:text-white">
              Personality Spark
            </Text>
          </TouchableOpacity>

          {/* Desktop Navigation */}
          <View className="hidden md:flex flex-row items-center space-x-8">
            {navItems.map((item) => (
              <TouchableOpacity
                key={item.screen}
                onPress={() => onNavigate(item.screen)}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  currentScreen === item.screen
                    ? 'text-primary-600 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:text-primary-600'
                }`}
              >
                <Text>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* CTA Button */}
          <View className="hidden md:flex">
            <Button
              variant="gradient"
              size="md"
              onPress={() => onNavigate('quizList')}
            >
              Start Quiz
            </Button>
          </View>

          {/* Mobile Menu Button */}
          <TouchableOpacity
            className="md:hidden p-2"
            onPress={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <View className="space-y-1">
              <View className="w-6 h-0.5 bg-gray-900 dark:bg-white" />
              <View className="w-6 h-0.5 bg-gray-900 dark:bg-white" />
              <View className="w-6 h-0.5 bg-gray-900 dark:bg-white" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <View className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            {navItems.map((item) => (
              <TouchableOpacity
                key={item.screen}
                onPress={() => {
                  onNavigate(item.screen);
                  setMobileMenuOpen(false);
                }}
                className={`py-3 px-4 rounded-lg ${
                  currentScreen === item.screen
                    ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-600'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <Text className="text-base">{item.label}</Text>
              </TouchableOpacity>
            ))}
            <View className="mt-4">
              <Button
                variant="gradient"
                size="md"
                fullWidth
                onPress={() => {
                  onNavigate('quizList');
                  setMobileMenuOpen(false);
                }}
              >
                Start Quiz
              </Button>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};
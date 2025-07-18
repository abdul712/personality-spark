import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <View className="bg-gray-900 dark:bg-black px-6 py-12">
      <View className="max-w-6xl mx-auto">
        <View className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <View className="col-span-1">
            <Text className="text-2xl font-bold text-white mb-4">
              Personality Spark
            </Text>
            <Text className="text-gray-400 mb-4">
              Discover your true self through AI-powered personality analysis.
            </Text>
            <View className="flex-row gap-4">
              <TouchableOpacity className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700">
                <Icon name="twitter" size={18} color="#9ca3af" />
              </TouchableOpacity>
              <TouchableOpacity className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700">
                <Icon name="facebook" size={18} color="#9ca3af" />
              </TouchableOpacity>
              <TouchableOpacity className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700">
                <Icon name="instagram" size={18} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Links */}
          <View>
            <Text className="text-white font-semibold mb-4">Quick Links</Text>
            <View className="space-y-2">
              <TouchableOpacity>
                <Text className="text-gray-400 hover:text-white transition-colors">Home</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text className="text-gray-400 hover:text-white transition-colors">Quizzes</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text className="text-gray-400 hover:text-white transition-colors">About</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text className="text-gray-400 hover:text-white transition-colors">Blog</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Resources */}
          <View>
            <Text className="text-white font-semibold mb-4">Resources</Text>
            <View className="space-y-2">
              <TouchableOpacity>
                <Text className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text className="text-gray-400 hover:text-white transition-colors">Terms of Service</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text className="text-gray-400 hover:text-white transition-colors">Cookie Policy</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text className="text-gray-400 hover:text-white transition-colors">Contact</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Newsletter */}
          <View>
            <Text className="text-white font-semibold mb-4">Stay Updated</Text>
            <Text className="text-gray-400 mb-4">
              Get personality insights and updates delivered to your inbox.
            </Text>
            <View className="flex-row">
              <View className="flex-1 bg-gray-800 rounded-l-lg px-4 py-3">
                <Text className="text-gray-500">Enter your email</Text>
              </View>
              <TouchableOpacity className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-r-lg">
                <Text className="text-white font-semibold">Subscribe</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Bottom Bar */}
        <View className="border-t border-gray-800 pt-8 flex-row justify-between items-center">
          <Text className="text-gray-400">
            © {currentYear} Personality Spark. All rights reserved.
          </Text>
          <View className="flex-row gap-6">
            <TouchableOpacity>
              <Text className="text-gray-400 hover:text-white transition-colors">Privacy</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text className="text-gray-400 hover:text-white transition-colors">Terms</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text className="text-gray-400 hover:text-white transition-colors">Cookies</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Footer;
import React from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { Brain, Heart, Sparkles, Users, Target, Rocket } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      <Navigation />
      
      <main className="pt-20 pb-16">
        {/* Hero Section */}
        <section className="px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Personality Spark</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Empowering millions to discover their true selves through AI-powered personality insights
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="px-6 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
              <div className="flex items-center mb-6">
                <Target className="w-10 h-10 text-purple-600 mr-4" />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Our Mission</h2>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                At Personality Spark, we believe that understanding yourself is the first step to personal growth and fulfillment. 
                Our mission is to make personality discovery accessible, engaging, and insightful for everyone.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                We leverage cutting-edge AI technology to create unique, personalized personality assessments that adapt to you. 
                No two quizzes are the same because no two people are the same.
              </p>
            </div>
          </div>
        </section>

        {/* What We Do Section */}
        <section className="px-6 py-12">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">What We Do</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <Brain className="w-12 h-12 text-purple-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">AI-Powered Insights</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Our advanced AI algorithms analyze your responses to provide deep, meaningful insights about your personality traits and tendencies.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <Sparkles className="w-12 h-12 text-pink-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Unique Every Time</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Experience dynamic quizzes that adapt to your responses. Each assessment is uniquely generated to provide fresh perspectives on your personality.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <Heart className="w-12 h-12 text-red-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Free & Accessible</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We believe self-discovery should be available to everyone. All our personality tests are completely free, with no hidden costs or subscriptions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values Section */}
        <section className="px-6 py-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">Our Values</h2>
            <div className="space-y-6">
              <div className="flex items-start">
                <Users className="w-8 h-8 text-purple-600 mr-4 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Privacy First</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Your data is yours. We don't require registration, and we never sell your information. Take quizzes anonymously and share results only if you choose to.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Rocket className="w-8 h-8 text-purple-600 mr-4 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Continuous Innovation</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    We're constantly improving our AI models and adding new quiz types to provide you with the most accurate and engaging personality insights possible.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Heart className="w-8 h-8 text-purple-600 mr-4 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Community Driven</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Your feedback shapes our platform. We listen to our community and build features that help you on your journey of self-discovery.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Ready to Discover Your Personality?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Join millions who have already sparked their journey of self-discovery.
            </p>
            <Link
              to="/quiz-list"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Start Your Journey
              <Sparkles className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
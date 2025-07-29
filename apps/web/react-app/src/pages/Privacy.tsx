import { Link } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { Shield, Lock, Eye, Database, Globe, Mail, Cookie, AlertCircle } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <nav className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl">✨</span>
              <span className="text-xl font-bold text-purple-600">PersonalitySpark</span>
            </Link>
            <div className="flex items-center space-x-6">
              <Link 
                to="/quiz-list"
                className="text-gray-600 hover:text-purple-600 transition-colors"
              >
                Quizzes
              </Link>
              <Link 
                to="/blog"
                className="text-gray-600 hover:text-purple-600 transition-colors"
              >
                Blog
              </Link>
            </div>
          </nav>
        </div>
      </header>
      
      <main className="pt-20 pb-16">
        {/* Hero Section */}
        <section className="px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <Shield className="w-16 h-16 text-purple-600 mx-auto mb-6" />
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Your privacy is our priority. Learn how we protect your data.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              Last updated: January 2024
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 space-y-8">
              
              {/* Introduction */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Lock className="w-6 h-6 mr-3 text-purple-600" />
                  Introduction
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Welcome to Personality Spark ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  By using Personality Spark, you agree to the collection and use of information in accordance with this policy. If you do not agree with the terms of this privacy policy, please do not access the site.
                </p>
              </div>

              {/* Information We Collect */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Database className="w-6 h-6 mr-3 text-purple-600" />
                  Information We Collect
                </h2>
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Information You Provide</h3>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2 mb-4">
                  <li>Quiz responses and personality assessment data</li>
                  <li>Optional account information (email, username) if you choose to register</li>
                  <li>Feedback and communications you send to us</li>
                  <li>Information shared when you use social features</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Information Automatically Collected</h3>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
                  <li>Device information (type, operating system, browser)</li>
                  <li>Usage data (pages viewed, time spent, interactions)</li>
                  <li>IP address and approximate location</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>

              {/* How We Use Your Information */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Eye className="w-6 h-6 mr-3 text-purple-600" />
                  How We Use Your Information
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
                  <li>Provide and maintain our personality assessment services</li>
                  <li>Generate personalized quiz results and insights</li>
                  <li>Improve and optimize our AI algorithms</li>
                  <li>Analyze usage patterns to enhance user experience</li>
                  <li>Send service-related communications (if you've provided contact info)</li>
                  <li>Detect and prevent fraud or abuse</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </div>

              {/* Data Storage and Security */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Shield className="w-6 h-6 mr-3 text-purple-600" />
                  Data Storage and Security
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  We implement industry-standard security measures to protect your information:
                </p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security audits and updates</li>
                  <li>Limited access to personal information by authorized personnel only</li>
                  <li>Secure data centers with physical and digital protection</li>
                </ul>
                <p className="text-gray-600 dark:text-gray-300 mt-4">
                  While we strive to protect your information, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.
                </p>
              </div>

              {/* Cookies */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Cookie className="w-6 h-6 mr-3 text-purple-600" />
                  Cookies and Tracking Technologies
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  We use cookies and similar tracking technologies to:
                </p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
                  <li>Remember your preferences and settings</li>
                  <li>Analyze site traffic and usage patterns</li>
                  <li>Personalize your experience</li>
                  <li>Enable certain site features</li>
                </ul>
                <p className="text-gray-600 dark:text-gray-300 mt-4">
                  You can control cookies through your browser settings. Note that disabling cookies may limit some features of our service.
                </p>
              </div>

              {/* Third-Party Services */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Globe className="w-6 h-6 mr-3 text-purple-600" />
                  Third-Party Services
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  We may use third-party services that collect information for:
                </p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
                  <li>Analytics (Google Analytics)</li>
                  <li>Advertising (Google AdSense)</li>
                  <li>AI services for quiz generation</li>
                  <li>Cloud hosting and infrastructure</li>
                </ul>
                <p className="text-gray-600 dark:text-gray-300 mt-4">
                  These third parties have their own privacy policies. We encourage you to review them.
                </p>
              </div>

              {/* Your Rights */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <AlertCircle className="w-6 h-6 mr-3 text-purple-600" />
                  Your Rights and Choices
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
                  <li>Access the personal information we hold about you</li>
                  <li>Request correction of inaccurate information</li>
                  <li>Request deletion of your personal information</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Disable cookies through your browser settings</li>
                  <li>Use our service anonymously without creating an account</li>
                </ul>
              </div>

              {/* Children's Privacy */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Children's Privacy</h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe we have collected information about your child, please contact us.
                </p>
              </div>

              {/* Changes to Privacy Policy */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Changes to This Privacy Policy</h2>
                <p className="text-gray-600 dark:text-gray-300">
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.
                </p>
              </div>

              {/* Contact Us */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Mail className="w-6 h-6 mr-3 text-purple-600" />
                  Contact Us
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:
                </p>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    Email: privacy@personalityspark.com<br />
                    Address: Personality Spark<br />
                    [Your Address]<br />
                    [City, State ZIP]
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
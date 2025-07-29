import { Link } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { FileText, Scale, UserCheck, Ban, AlertTriangle, Copyright, Globe, Gavel } from 'lucide-react';

export default function Terms() {
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
            <FileText className="w-16 h-16 text-purple-600 mx-auto mb-6" />
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Please read these terms carefully before using our service.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              Effective Date: January 2024
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 space-y-8">
              
              {/* Agreement to Terms */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Scale className="w-6 h-6 mr-3 text-purple-600" />
                  Agreement to Terms
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  By accessing or using Personality Spark ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, then you may not access the Service.
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  These Terms apply to all visitors, users, and others who access or use the Service. We reserve the right to update and change these Terms at any time without notice.
                </p>
              </div>

              {/* Use of Service */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <UserCheck className="w-6 h-6 mr-3 text-purple-600" />
                  Use of Service
                </h2>
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Eligibility</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  You must be at least 13 years old to use our Service. By using the Service, you represent and warrant that you meet this age requirement.
                </p>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Acceptable Use</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-2">You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:</p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
                  <li>Use the Service in any way that violates any applicable law or regulation</li>
                  <li>Engage in any conduct that restricts or inhibits anyone's use or enjoyment of the Service</li>
                  <li>Attempt to interfere with the proper working of the Service</li>
                  <li>Use any robot, spider, or other automatic device to access the Service</li>
                  <li>Introduce any viruses, trojan horses, worms, or other material that is malicious</li>
                  <li>Attempt to gain unauthorized access to any portion of the Service</li>
                  <li>Harass, abuse, or harm another person</li>
                  <li>Impersonate or attempt to impersonate another user or person</li>
                </ul>
              </div>

              {/* Content and Intellectual Property */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Copyright className="w-6 h-6 mr-3 text-purple-600" />
                  Content and Intellectual Property
                </h2>
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Our Content</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  The Service and its original content, features, and functionality are and will remain the exclusive property of Personality Spark and its licensors. The Service is protected by copyright, trademark, and other laws. Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent.
                </p>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">User Content</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  By submitting content to the Service (including quiz responses and feedback), you grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, and distribute such content in connection with the Service.
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  You represent and warrant that you own or have the necessary rights to any content you submit, and that your content does not infringe upon the rights of any third party.
                </p>
              </div>

              {/* Privacy and Data */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Globe className="w-6 h-6 mr-3 text-purple-600" />
                  Privacy and Data
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Your use of the Service is also governed by our Privacy Policy. Please review our Privacy Policy, which also governs the Site and informs users of our data collection practices. By using the Service, you consent to all actions taken by us with respect to your information in compliance with the Privacy Policy.
                </p>
              </div>

              {/* Disclaimers */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <AlertTriangle className="w-6 h-6 mr-3 text-purple-600" />
                  Disclaimers
                </h2>
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">No Professional Advice</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  The personality assessments and insights provided by Personality Spark are for entertainment and educational purposes only. They are not intended to be a substitute for professional psychological advice, diagnosis, or treatment. Always seek the advice of qualified professionals with any questions you may have regarding mental health or personal development.
                </p>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Accuracy of Results</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  While we strive to provide accurate and insightful personality assessments, we make no warranties or representations about the accuracy, reliability, completeness, or timeliness of any results or content provided through the Service.
                </p>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">"As Is" Basis</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  The Service is provided on an "as is" and "as available" basis. We expressly disclaim all warranties of any kind, whether express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
                </p>
              </div>

              {/* Limitation of Liability */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Ban className="w-6 h-6 mr-3 text-purple-600" />
                  Limitation of Liability
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  To the maximum extent permitted by law, Personality Spark and its affiliates, officers, directors, employees, agents, suppliers, or licensors shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from:
                </p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
                  <li>Your use or inability to use the Service</li>
                  <li>Any unauthorized access to or use of our servers and/or any personal information stored therein</li>
                  <li>Any interruption or cessation of transmission to or from the Service</li>
                  <li>Any bugs, viruses, trojan horses, or the like that may be transmitted through the Service</li>
                  <li>Any errors or omissions in any content or for any loss or damage incurred as a result of your use of any content</li>
                </ul>
              </div>

              {/* Indemnification */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Indemnification</h2>
                <p className="text-gray-600 dark:text-gray-300">
                  You agree to defend, indemnify, and hold harmless Personality Spark and its affiliates, officers, directors, employees, agents, suppliers, and licensors from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to your violation of these Terms or your use of the Service.
                </p>
              </div>

              {/* Termination */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Termination</h2>
                <p className="text-gray-600 dark:text-gray-300">
                  We may terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will cease immediately.
                </p>
              </div>

              {/* Governing Law */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Gavel className="w-6 h-6 mr-3 text-purple-600" />
                  Governing Law
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  These Terms shall be governed and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  Any disputes arising out of or relating to these Terms or the Service shall be resolved exclusively in the courts of [Your Jurisdiction].
                </p>
              </div>

              {/* Changes to Terms */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Changes to Terms</h2>
                <p className="text-gray-600 dark:text-gray-300">
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                </p>
              </div>

              {/* Contact Information */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Contact Information</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  If you have any questions about these Terms, please contact us at:
                </p>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    Email: legal@personalityspark.com<br />
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
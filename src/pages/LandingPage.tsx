import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { MessageSquare, Sparkles, Lock, Zap, Globe, PenTool } from 'lucide-react';

const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: <MessageSquare className="h-10 w-10 text-purple-500" />,
      title: "AI-Powered Conversations",
      description: "Engage in natural, context-aware conversations with our advanced AI assistant."
    },
    {
      icon: <Sparkles className="h-10 w-10 text-purple-500" />,
      title: "Smart Suggestions",
      description: "Receive intelligent recommendations and insights based on your conversations."
    },
    {
      icon: <Lock className="h-10 w-10 text-purple-500" />,
      title: "Secure & Private",
      description: "Your conversations are encrypted and your privacy is protected at all times."
    },
    {
      icon: <Zap className="h-10 w-10 text-purple-500" />,
      title: "Lightning Fast",
      description: "Experience rapid responses and minimal latency in all your interactions."
    },
    {
      icon: <Globe className="h-10 w-10 text-purple-500" />,
      title: "Available Anywhere",
      description: "Access your AI assistant from any device, anywhere in the world."
    },
    {
      icon: <PenTool className="h-10 w-10 text-purple-500" />,
      title: "Customizable Experience",
      description: "Tailor the AI to your preferences and needs for a personalized experience."
    }
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative bg-gray-900 py-20 px-4 md:px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-gray-900 to-gray-900"></div>
        <div className="container mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Next-Gen AI Chat <br />
                <span className="text-purple-500">Assistant</span>
              </h1>
              <p className="text-lg text-gray-300 mb-8 max-w-lg">
                Experience the future of conversation with our advanced AI chat assistant. 
                Intelligent, responsive, and designed to make your life easier.
              </p>
              <div className="flex flex-wrap gap-4">
                {user ? (
                  <Button 
                    onClick={() => navigate('/chat')}
                    size="lg" 
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Go to Chat
                    <MessageSquare className="ml-2 h-5 w-5" />
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={() => navigate('/login')}
                      size="lg" 
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Get Started
                    </Button>
                    <Button 
                      onClick={() => navigate('/register')}
                      size="lg" 
                      variant="outline" 
                      className="border-gray-600 text-white hover:bg-gray-800"
                    >
                      Create Account
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden lg:block relative"
            >
              <div className="relative mx-auto w-full max-w-md">
                <div className="aspect-[4/3] rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-xl overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="bg-gray-700 h-8 w-8 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white">U</span>
                        </div>
                        <div className="bg-gray-700 rounded-lg p-3 text-sm text-white max-w-[80%]">
                          <p>Hey, can you help me with a project idea?</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 justify-end">
                        <div className="bg-purple-600 rounded-lg p-3 text-sm text-white max-w-[80%]">
                          <p>Of course! What kind of project are you interested in?</p>
                        </div>
                        <div className="bg-purple-500 h-8 w-8 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white">AI</span>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="bg-gray-700 h-8 w-8 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white">U</span>
                        </div>
                        <div className="bg-gray-700 rounded-lg p-3 text-sm text-white max-w-[80%]">
                          <p>I'm thinking about building a web app using React...</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 md:px-6 bg-gray-900">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Powerful Features</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Our AI assistant comes packed with advanced capabilities designed to enhance your experience.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-purple-500/50 transition-all duration-300"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 md:px-6 bg-gradient-to-br from-purple-900/30 to-gray-900">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Experience the Future?</h2>
          <p className="text-gray-300 max-w-2xl mx-auto mb-8">
            Join thousands of users already enjoying the benefits of our AI assistant. 
            Start your journey today!
          </p>
          {user ? (
            <Button 
              onClick={() => navigate('/chat')}
              size="lg" 
              className="bg-purple-600 hover:bg-purple-700"
            >
              Go to Your Chats
              <MessageSquare className="ml-2 h-5 w-5" />
            </Button>
          ) : (
            <Button 
              onClick={() => navigate('/login')}
              size="lg" 
              className="bg-purple-600 hover:bg-purple-700"
            >
              Get Started Now
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
    </div>
  );
};

export default LandingPage;

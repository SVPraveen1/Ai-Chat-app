import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useAnimation, AnimatePresence, useInView, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { MessageSquare, Sparkles, Lock, Zap, Globe, PenTool, ArrowRight } from 'lucide-react';
import {
  containerVariants,
  itemVariants,
  
  fadeInUpVariants,
  chatBubbleVariants,
  
  staggerContainerVariants,
  rotateVariants,
  
} from '@/animations/landingPageAnimations';

const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const controls = useAnimation();
  
  // References for scroll-based animations
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  
  const heroInView = useInView(heroRef, { once: false, amount: 0.3 });
  const featuresInView = useInView(featuresRef, { once: false, amount: 0.3 });
  const ctaInView = useInView(ctaRef, { once: false, amount: 0.3 });
  
  // Scroll animations
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.5]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  useEffect(() => {
    controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 }
    });
  }, [controls]);

  useEffect(() => {
    if (heroInView) {
      controls.start("visible");
    }
  }, [controls, heroInView]);

  // Animation variants are now imported from '@/animations/landingPageAnimations'

  // Features with staggered entrance
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
    <motion.div 
      className="flex flex-col min-h-[calc(100vh-4rem)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero Section */}
      <section className="relative bg-gray-900 py-20 px-4 md:px-6 overflow-hidden" ref={heroRef}>
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-gray-900 to-gray-900"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        />
        <motion.div 
          className="absolute inset-0 w-full h-full"
          initial={{ backgroundPosition: '0% 0%' }}
          animate={{ backgroundPosition: '100% 100%' }}
          transition={{ 
            repeat: Infinity, 
            repeatType: "reverse", 
            duration: 30,
            ease: "linear"
          }}
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(124, 58, 237, 0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            opacity
          }}
        />
        <motion.div
          className="absolute inset-0 w-full h-full opacity-10"
          animate={{ 
            backgroundPosition: ['0% 0%', '100% 100%']
          }}
          transition={{
            repeat: Infinity,
            repeatType: "mirror",
            duration: 20,
            ease: "linear"
          }}
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%239C92AC\' fill-opacity=\'0.3\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
            backgroundSize: '100px 100px'
          }}
        />
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.1, 0.15, 0.1] }}
          transition={{
            repeat: Infinity,
            duration: 8,
            ease: "easeInOut"
          }}
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.3) 0%, transparent 50%)",
          }}
        />
        <div className="container mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <motion.h1 
                className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.span
                  variants={itemVariants}
                  className="block"
                >
                  Next-Gen AI Chat <br />
                </motion.span>
                <motion.span
                  variants={itemVariants}
                  className="text-purple-500 inline-block"
                >
                  Assistant
                </motion.span>
              </motion.h1>
              <motion.p 
                className="text-lg text-gray-300 mb-8 max-w-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                Experience the future of conversation with our advanced AI chat assistant. 
                Intelligent, responsive, and designed to make your life easier.
              </motion.p>
              <motion.div 
                className="flex flex-wrap gap-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >                {user ? (
                  <motion.div 
                    variants={itemVariants}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      onClick={() => navigate('/chat')}
                      size="lg" 
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Go to Chat
                      <motion.div 
                        animate={{ x: [0, 4, 0] }} 
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        <MessageSquare className="ml-2 h-5 w-5" />
                      </motion.div>
                    </Button>
                  </motion.div>
                ) : (
                  <>
                    <motion.div 
                      variants={itemVariants}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        onClick={() => navigate('/login')}
                        size="lg" 
                        className="bg-purple-600 hover:bg-purple-700 relative overflow-hidden group"
                      >
                        <motion.span
                          className="absolute inset-0 bg-purple-500 opacity-30"
                          initial={{ width: "0%", left: 0 }}
                          whileHover={{ width: "100%" }}
                          transition={{ duration: 0.3 }}
                        />
                        Get Started
                      </Button>
                    </motion.div>
                    <motion.div 
                      variants={itemVariants}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        onClick={() => navigate('/register')}
                        size="lg" 
                        variant="outline" 
                        className="border-gray-600 text-gray-100 hover:bg-gray-800"
                      >
                        Create Account
                      </Button>
                    </motion.div>
                  </>
                )}
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="hidden lg:block relative"
            >
              <motion.div 
                className="relative mx-auto w-full max-w-md"
                animate={{ 
                  y: [0, 10, 0],
                }}
                transition={{ 
                  repeat: Infinity, 
                  repeatType: "reverse",
                  duration: 6,
                  ease: "easeInOut"
                }}
              >
                <motion.div 
                  className="aspect-[4/3] rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-xl overflow-hidden"
                  whileHover={{
                    boxShadow: "0 0 25px rgba(124, 58, 237, 0.5)",
                    borderColor: "rgba(124, 58, 237, 0.5)",
                  }}
                >
                  <div className="p-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <motion.div 
                        className="w-3 h-3 rounded-full bg-red-500"
                        whileHover={{ scale: 1.2 }}
                      />
                      <motion.div 
                        className="w-3 h-3 rounded-full bg-yellow-500"
                        whileHover={{ scale: 1.2 }}
                      />
                      <motion.div 
                        className="w-3 h-3 rounded-full bg-green-500"
                        whileHover={{ scale: 1.2 }}
                      />
                    </div>
                    <div className="space-y-4">
                      <motion.div 
                        className="flex items-start space-x-3"
                        custom={0}
                        variants={chatBubbleVariants}
                        initial="initial"
                        animate="animate"
                      >
                        <div className="bg-gray-700 h-8 w-8 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white">U</span>
                        </div>
                        <div className="bg-gray-700 rounded-lg p-3 text-sm text-white max-w-[80%]">
                          <p>Hey, can you help me with a project idea?</p>
                        </div>
                      </motion.div>
                      <motion.div 
                        className="flex items-start space-x-3 justify-end"
                        custom={1}
                        variants={chatBubbleVariants}
                        initial="initial"
                        animate="animate"
                      >
                        <div className="bg-purple-600 rounded-lg p-3 text-sm text-white max-w-[80%]">
                          <p>Of course! What kind of project are you interested in?</p>
                        </div>
                        <div className="bg-purple-500 h-8 w-8 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white">AI</span>
                        </div>
                      </motion.div>
                      <motion.div 
                        className="flex items-start space-x-3"
                        custom={2}
                        variants={chatBubbleVariants}
                        initial="initial"
                        animate="animate"
                      >
                        <div className="bg-gray-700 h-8 w-8 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white">U</span>
                        </div>
                        <div className="bg-gray-700 rounded-lg p-3 text-sm text-white max-w-[80%]">
                          <p>I'm thinking about building a web app using React...</p>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <motion.section 
        className="py-16 px-4 md:px-6 bg-gray-900"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUpVariants}
        ref={featuresRef}
      >
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-16"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              variants={itemVariants}
            >
              Powerful Features
            </motion.h2>
            <motion.p 
              className="text-gray-400 max-w-2xl mx-auto"
              variants={itemVariants}
            >
              Our AI assistant comes packed with advanced capabilities designed to enhance your experience.
            </motion.p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{ 
                  y: -10, 
                  boxShadow: "0 10px 30px -10px rgba(124, 58, 237, 0.4)",
                  borderColor: "rgba(124, 58, 237, 0.7)",
                  scale: 1.02
                }}
                className="bg-gray-800 border border-gray-700 rounded-lg p-6 transition-all duration-300 relative overflow-hidden group"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-tr from-purple-900/0 via-purple-900/0 to-purple-900/0 group-hover:from-purple-900/5 group-hover:via-purple-900/5 group-hover:to-purple-900/20 z-0"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />

                <motion.div
                  className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-purple-500/5 z-0"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.2, 0.1],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    delay: index * 0.5,
                  }}
                />

                <motion.div 
                  className="mb-4 relative z-10"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {feature.icon}
                </motion.div>
                <motion.h3 
                  className="text-xl font-semibold text-white mb-2 relative z-10"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  {feature.title}
                </motion.h3>
                <motion.p 
                  className="text-gray-400 relative z-10"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  {feature.description}
                </motion.p>

                <motion.div 
                  className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-purple-700"
                  initial={{ width: "0%" }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}      <motion.section 
        className="py-16 px-4 md:px-6 bg-gradient-to-br from-purple-900/30 to-gray-900 relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUpVariants}
        ref={ctaRef}
      >
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          viewport={{ once: true }}
          style={{
            background: 'radial-gradient(circle at center, rgba(124, 58, 237, 0.2) 0%, transparent 70%)',
          }}
        />
        <motion.div
          className="absolute top-0 left-0 right-0 h-px"
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
          viewport={{ once: true }}
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(124, 58, 237, 0.7), transparent)',
            transformOrigin: 'left',
          }}
        />
        <motion.div
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.2 }}
          viewport={{ once: true }}
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            background: 'radial-gradient(circle, rgba(124, 58, 237, 1) 0%, rgba(124, 58, 237, 0) 70%)',
            filter: 'blur(30px)',
          }}
        />        <motion.div
          className="absolute -top-32 -left-32 w-72 h-72 rounded-full opacity-10"
          whileInView={{ opacity: 0.1 }}
          viewport={{ once: true }}
          variants={rotateVariants}
          initial="initial"
          animate="animate"
          style={{
            background: 'radial-gradient(circle, rgba(124, 58, 237, 1) 0%, rgba(124, 58, 237, 0) 70%)',
            filter: 'blur(20px)',
          }}
        />
        <div className="container mx-auto text-center relative z-10">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            Ready to Experience the Future?
          </motion.h2>
          <motion.p 
            className="text-gray-300 max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            viewport={{ once: true }}
          >
            Join thousands of users already enjoying the benefits of our AI assistant. 
            Start your journey today!
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            viewport={{ once: true }}
          >            {user ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  onClick={() => navigate('/chat')}
                  size="lg" 
                  className="bg-purple-600 hover:bg-purple-700 relative"
                >
                  <motion.span
                    className="absolute inset-0 rounded-md"
                    initial={{ boxShadow: "0 0 0px rgba(124, 58, 237, 0)" }}
                    animate={{ 
                      boxShadow: ["0 0 0px rgba(124, 58, 237, 0)", "0 0 15px rgba(124, 58, 237, 0.6)", "0 0 0px rgba(124, 58, 237, 0)"]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  Go to Your Chats
                  <motion.div 
                    animate={{ x: [0, 4, 0] }} 
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <MessageSquare className="ml-2 h-5 w-5" />
                  </motion.div>
                </Button>
              </motion.div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  onClick={() => navigate('/login')}
                  size="lg" 
                  className="bg-purple-600 hover:bg-purple-700 relative"
                >
                  <motion.span
                    className="absolute inset-0 rounded-md"
                    initial={{ boxShadow: "0 0 0px rgba(124, 58, 237, 0)" }}
                    animate={{ 
                      boxShadow: ["0 0 0px rgba(124, 58, 237, 0)", "0 0 15px rgba(124, 58, 237, 0.6)", "0 0 0px rgba(124, 58, 237, 0)"]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  Get Started Now
                  <motion.span 
                    className="inline-block ml-2"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <ArrowRight className="h-5 w-5 inline" />
                  </motion.span>
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.section>      {/* Footer */}
      <motion.footer 
        className="py-8 px-4 md:px-6 bg-gray-900 border-t border-gray-800"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
      >
      </motion.footer>
    </motion.div>
  );
};

export default LandingPage;

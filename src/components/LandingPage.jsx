import React, { useState, useEffect } from 'react';
import { ArrowRight, Brain, TrendingUp, Shield, Zap, Users, Star, ChevronDown, Play, ExternalLink, Github, Twitter } from 'lucide-react';
import NunnoLogo from './NunnoLogo';

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Empathetic AI Educator",
      description: "Learn finance like you're 15 with real-world analogies and beginner-friendly explanations for every technical term."
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Technical Analysis",
      description: "Real-time crypto analysis with actionable insights and confidence indicators tailored for beginners."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Educational Focus",
      description: "Click any financial term to see simple definitions and analogies with our interactive learning system."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Smart Tool Calling",
      description: "AI automatically uses the right tools for price analysis, tokenomics, and market sentiment research."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Complete Beginner",
      content: "Nunno made crypto investing finally understandable. I went from zero knowledge to confident investor in weeks!",
      rating: 5
    },
    {
      name: "Mike Rodriguez",
      role: "Tech Professional",
      content: "The educational cards and analogies helped me grasp complex concepts I struggled with for months elsewhere.",
      rating: 5
    },
    {
      name: "Emma Thompson",
      role: "Student",
      content: "As a college student, Nunno's approach made finance accessible without the intimidating jargon.",
      rating: 5
    }
  ];

  const stats = [
    { number: "10K+", label: "Active Learners" },
    { number: "95%", label: "Success Rate" },
    { number: "500+", label: "Financial Concepts Explained" },
    { number: "24/7", label: "AI Support" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-slate-900/95 backdrop-blur-sm border-b border-slate-700' : 'bg-transparent'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <NunnoLogo size="sm" />
              <span className="text-white text-xl font-bold">Nunno</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#about" className="text-gray-300 hover:text-white transition-colors">About</a>
              <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Reviews</a>
              <a href="/elite-chart" className="bg-gradient-to-r from-purple-600 to-purple-400 text-white px-6 py-2 rounded-full hover:from-purple-700 hover:to-purple-500 transition-all duration-300 transform hover:scale-105">
                Live Charts
              </a>
              <a href="/dashboard" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105">
                Try Now
              </a>
            </div>

            <button className="md:hidden text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-50" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-300 text-sm mb-8">
              <Star className="w-4 h-4 mr-2" />
              Your Empathetic AI Financial Educator
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Learn Finance
              <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Like You're 15
              </span>
            </h1>

            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Nunno Finance transforms complex financial concepts into simple, digestible lessons.
              Powered by advanced AI, we make crypto trading and investing accessible for everyone.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="/dashboard"
                className="group bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
              >
                <span>Try Nunno Now</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>

              <button className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Play className="w-5 h-5 ml-1" />
                </div>
                <span>Watch Demo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-purple-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-pink-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-20 w-16 h-16 bg-purple-500/10 rounded-full blur-xl animate-pulse delay-500"></div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Choose <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Nunno</span>?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Designed specifically for beginners, Nunno makes financial literacy approachable and engaging
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-gradient-to-b from-slate-800/50 to-slate-900/50 p-6 rounded-2xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className="text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Nunno</span> Works
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Three simple steps to start your financial education journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Ask Questions",
                description: "Chat naturally with our AI about any financial concept or crypto investment"
              },
              {
                step: "02",
                title: "Learn Instantly",
                description: "Get beginner-friendly explanations with real-world analogies and visual aids"
              },
              {
                step: "03",
                title: "Practice Safely",
                description: "Apply knowledge with simulated trading and educational insights"
              }
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-6 group-hover:scale-110 transition-transform">
                  {item.step}
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">{item.title}</h3>
                <p className="text-gray-300 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Loved by <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Beginners</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Hear from people who transformed their financial understanding with Nunno
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="bg-gradient-to-b from-slate-800/50 to-slate-900/50 p-8 md:p-12 rounded-3xl border border-slate-700/50">
              <div className="flex items-center mb-6">
                {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-xl text-gray-300 mb-6 leading-relaxed">
                "{testimonials[activeTestimonial].content}"
              </blockquote>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                  {testimonials[activeTestimonial].name.charAt(0)}
                </div>
                <div>
                  <div className="text-white font-semibold">{testimonials[activeTestimonial].name}</div>
                  <div className="text-gray-400">{testimonials[activeTestimonial].role}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${index === activeTestimonial ? 'bg-purple-500' : 'bg-gray-600'
                    }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-900/50 to-pink-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Your Financial Journey?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Join thousands of beginners who learned to invest and trade with confidence using Nunno
          </p>
          <a
            href="/dashboard"
            className="group bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 mx-auto"
          >
            <span>Start Learning Today</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <NunnoLogo size="sm" />
              <span className="text-white text-xl font-bold">Nunno</span>
            </div>

            <div className="flex items-center space-x-6 text-gray-400">
              <a href="#" className="hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-700/50 text-center text-gray-400">
            <p>&copy; 2024 Nunno Finance. Built with ❤️ to make finance accessible for everyone.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
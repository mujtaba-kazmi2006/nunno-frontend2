import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Brain, TrendingUp, Shield, Zap, Users, Star, ChevronDown, Play, ExternalLink, Github, Twitter, Sparkles, Rocket, Globe, Lock } from 'lucide-react';
import NunnoLogo from './NunnoLogo';
import { cn } from '../utils/cn';

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Brain className="w-7 h-7" />,
      title: "Empathetic AI Educator",
      description: "Learn finance like you're 15 with real-world analogies and beginner-friendly explanations.",
      color: "from-purple-500 to-indigo-500"
    },
    {
      icon: <TrendingUp className="w-7 h-7" />,
      title: "Elite Analysis",
      description: "Real-time crypto insights with actionable confidence indicators tailored for newcomers.",
      color: "from-emerald-500 to-teal-500"
    },
    {
      icon: <Sparkles className="w-7 h-7" />,
      title: "Interactive Learning",
      description: "Click any financial term to see simple definitions and analogies instantly.",
      color: "from-amber-500 to-orange-500"
    },
    {
      icon: <Zap className="w-7 h-7" />,
      title: "Smart Execution",
      description: "AI automatically coordinates tools for price analysis and market sentiment research.",
      color: "from-blue-500 to-cyan-500"
    }
  ];

  const stats = [
    { number: "10K+", label: "Active Learners", icon: <Users className="w-4 h-4" /> },
    { number: "95%", label: "Satisfaction", icon: <Star className="w-4 h-4" /> },
    { number: "500+", label: "Concepts", icon: <Brain className="w-4 h-4" /> },
    { number: "24/7", label: "AI Mentor", icon: <Zap className="w-4 h-4" /> }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Complete Beginner",
      content: "Nunno made crypto investing finally understandable. I went from zero knowledge to confident investor in weeks!",
      initials: "SC"
    },
    {
      name: "Mike Rodriguez",
      role: "Tech Professional",
      content: "The educational cards and analogies helped me grasp complex concepts I struggled with for months elsewhere.",
      initials: "MR"
    },
    {
      name: "Emma Thompson",
      role: "Student",
      content: "As a college student, Nunno's approach made finance accessible without the intimidating jargon.",
      initials: "ET"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  };

  return (
    <div className="min-h-screen bg-[#020205] text-white selection:bg-purple-500/30 overflow-x-hidden">
      {/* Optimized Dynamic Background - No Filters */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-[radial-gradient(circle,rgba(147,51,234,0.1),transparent_70%)] animate-pulse will-change-transform" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-[radial-gradient(circle,rgba(37,99,235,0.05),transparent_70%)] animate-pulse delay-700 will-change-transform" />
      </div>

      {/* Navigation - Removed Blur */}
      <nav className={cn(
        "fixed top-0 w-full z-50 transition-[background-color,padding,border-color] duration-500 border-b",
        isScrolled
          ? "bg-[#020205] border-white/5 py-3"
          : "bg-transparent border-transparent py-5"
      )}>

        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3 group cursor-pointer"
          >
            <div className="relative">
              <NunnoLogo size="sm" />
              <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(168,85,247,0.2),transparent_70%)] rounded-full scale-0 group-hover:scale-150 transition-transform duration-500" />
            </div>

            <span className="text-2xl font-black tracking-tighter text-white uppercase italic">Nunno</span>
          </motion.div>

          <div className="hidden md:flex items-center space-x-10">
            {['Features', 'Intelligence', 'Academy'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm font-medium text-slate-400 hover:text-white transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-purple-500 transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
            <div className="h-4 w-px bg-white/10" />
            <a href="/elite-chart" className="text-sm font-semibold hover:text-purple-400 transition-colors">
              Charts
            </a>
            <a href="/dashboard" className="px-5 py-2.5 bg-white text-black rounded-full font-bold text-sm hover:bg-purple-500 hover:text-white transition-[background-color,color,transform] transform active:scale-95">
              Launch App
            </a>
          </div>

          <button className="md:hidden text-white p-2">
            <div className="w-6 h-0.5 bg-white mb-1.5 rounded-full" />
            <div className="w-6 h-0.5 bg-white mb-1.5 rounded-full" />
            <div className="w-4 h-0.5 bg-white rounded-full ml-auto" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 flex flex-col items-center justify-center overflow-hidden z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center px-6 max-w-5xl"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-300 text-xs font-bold uppercase tracking-widest mb-10 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
          >
            <Sparkles className="w-3.5 h-3.5 mr-2" />
            The Future of Financial Literacy
          </motion.div>

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white mb-8 tracking-tighter leading-[0.9]">
            FINANCE <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent italic">
              SIMPLIFIED.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
            Stop guessing. Start knowing. Nunno turns complexity into clarity with empathetic AI designed to make you a confident investor.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              href="/dashboard"
              className="group py-4 px-10 bg-purple-600 rounded-full font-bold text-lg hover:bg-purple-500 transition-all flex items-center space-x-3 shadow-[0_0_30px_rgba(147,51,234,0.3)]"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.a>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-3 py-4 px-8 rounded-full border border-white/10 bg-[#0c0c14] hover:bg-white/10 transition-all font-bold"
            >
              <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                <Play className="w-3 h-3 fill-white text-white ml-0.5" />
              </div>
              <span className="font-bold">See How It Works</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Hero Visual */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-20 px-6 w-full max-w-6xl relative"
        >
          <div className="aspect-[16/9] rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-transparent p-2 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-blue-500/10" />
            <div className="w-full h-full rounded-xl bg-[#0a0a12] border border-white/5 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(147,51,234,0.1),transparent_70%)]" />
              <div className="flex flex-col items-center space-y-4">
                <div className="size-20 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center animate-pulse">
                  <Brain className="size-10 text-purple-400" />
                </div>
                <div className="space-y-2 text-center">
                  <div className="h-2 w-48 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="h-full w-1/2 bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                    />
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 tracking-[0.3em] uppercase">AI Engine Initializing</p>
                </div>
              </div>
            </div>

            {/* Floating UI Elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-10 left-10 p-4 rounded-xl bg-[#0c0c14] border border-white/10 hidden lg:block"
            >
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <TrendingUp className="size-4 text-emerald-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 font-bold">SENTIMENT</p>
                  <p className="text-xs font-bold text-emerald-400">BULLISH • 84%</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute bottom-10 right-10 p-4 rounded-xl bg-[#0c0c14] border border-white/10 hidden lg:block"
            >
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <ArrowRight className="size-4 text-purple-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 font-bold">NEXT MOVE</p>
                  <p className="text-xs font-bold text-purple-400">ACCUMULATE ZONE</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-24 relative overflow-hidden border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center group"
              >
                <div className="inline-flex items-center justify-center p-3 rounded-full bg-white/5 border border-white/5 mb-4 group-hover:bg-purple-500/20 group-hover:border-purple-500/30 transition-all duration-500">
                  <div className="text-purple-400 group-hover:scale-110 transition-transform">{stat.icon}</div>
                </div>
                <div className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter">{stat.number}</div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-black relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row justify-between items-end mb-24 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight italic">
                CRAFTED FOR THE <br />
                <span className="text-purple-500">NEXT GENERATION.</span>
              </h2>
              <p className="text-lg text-slate-400 font-medium">
                We've combined deep technical intelligence with a human-first interface. No jargon, no gatekeeping—just pure financial empowerment.
              </p>
            </div>
            <div className="flex space-x-2">
              <div className="size-2 rounded-full bg-purple-500" />
              <div className="size-2 rounded-full bg-white/10" />
              <div className="size-2 rounded-full bg-white/10" />
            </div>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                className="group relative p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-purple-500/50 transition-all duration-500 overflow-hidden"
              >
                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-500", feature.color)} />
                <div className="relative z-10">
                  <div className="size-14 rounded-2xl bg-white/5 flex items-center justify-center mb-10 group-hover:scale-110 transition-transform ring-1 ring-white/10 group-hover:ring-purple-500/50">
                    <div className="text-purple-400 group-hover:text-white transition-colors">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4 italic uppercase tracking-tight">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed font-medium">{feature.description}</p>
                </div>

                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight size={20} className="text-purple-500" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Intelligence Showcase */}
      <section className="py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-6">
                Live Analysis
              </div>
              <h2 className="text-4xl md:text-6xl font-black mb-8 italic leading-tight uppercase">
                Markets <br />
                <span className="text-emerald-400">Unveiled.</span>
              </h2>
              <div className="space-y-6">
                {[
                  { icon: <Lock className="size-5" />, title: "Secure Insights", text: "Enterprise-grade data security for all your analysis." },
                  { icon: <Globe className="size-5" />, title: "Global Context", text: "News and sentiment from every corner of the financial web." },
                  { icon: <Rocket className="size-5" />, title: "Instant Alpha", text: "Get ahead of trends with AI-detected market shifts." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 group">
                    <div className="size-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1 italic uppercase tracking-tight">{item.title}</h4>
                      <p className="text-slate-400 font-medium">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square rounded-[3rem] bg-gradient-to-tr from-purple-600/20 to-indigo-600/20 p-px">
                <div className="w-full h-full rounded-[3rem] bg-[#0c0c14] overflow-hidden flex items-center justify-center p-12">
                  {/* Abstract UI Representation */}
                  <div className="w-full space-y-6">
                    {[85, 42, 68].map((val, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                          <span>Metric 0{i + 1}</span>
                          <span>{val}%</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${val}%` }}
                            transition={{ duration: 1, delay: i * 0.2 }}
                            className={cn("h-full rounded-full shadow-[0_0_15px_rgba(255,255,255,0.1)]", i === 0 ? "bg-purple-500" : i === 1 ? "bg-emerald-500" : "bg-blue-500")}
                          />
                        </div>
                      </div>
                    ))}
                    <div className="pt-8 grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-3xl bg-white/5 border border-white/10 text-center">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Bias</p>
                        <p className="text-xl font-black text-purple-400 italic">LONG</p>
                      </div>
                      <div className="p-4 rounded-3xl bg-white/5 border border-white/10 text-center">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Risk</p>
                        <p className="text-xl font-black text-emerald-400 italic">LOW</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Glow effect */}
              <div className="absolute -inset-10 bg-[radial-gradient(circle,rgba(168,85,247,0.15),transparent_70%)] -z-10 rounded-full" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="reviews" className="py-32 bg-[#050508]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black mb-6 italic uppercase tracking-tighter">
              The Peer <span className="text-purple-500">Echo.</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto font-medium">
              Join thousands of individuals who have unlocked their financial potential with Nunno.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="relative p-12 md:p-20 rounded-[3rem] bg-[#0c0c14] border border-white/5 overflow-hidden"

              >
                <div className="absolute top-10 left-10 text-purple-500/20">
                  <Zap size={120} weight="fill" />
                </div>

                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="flex gap-1 mb-10">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={16} className="fill-purple-500 text-purple-500" />
                    ))}
                  </div>

                  <blockquote className="text-2xl md:text-4xl font-bold mb-12 italic leading-snug tracking-tight">
                    "{testimonials[activeTestimonial].content}"
                  </blockquote>

                  <div className="flex items-center space-x-4">
                    <div className="size-14 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center font-black text-white text-xl italic shadow-lg">
                      {testimonials[activeTestimonial].initials}
                    </div>
                    <div className="text-left">
                      <div className="text-lg font-black italic uppercase tracking-tight">{testimonials[activeTestimonial].name}</div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{testimonials[activeTestimonial].role}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center mt-12 space-x-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={cn(
                    "h-1.5 transition-all duration-500 rounded-full",
                    index === activeTestimonial ? "w-12 bg-purple-500" : "w-3 bg-white/10 hover:bg-white/20"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-600/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-16 md:p-32 rounded-[4rem] bg-gradient-to-b from-white/10 to-transparent border border-white/10 backdrop-blur-md relative overflow-hidden group shadow-2xl"
          >
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(147,51,234,0.15),transparent_70%)]" />

            <h2 className="text-5xl md:text-8xl font-black mb-8 italic italic tracking-tighter leading-[0.85] uppercase">
              Ready to <br />
              <span className="text-purple-500">Unleash Alpha?</span>
            </h2>
            <p className="text-xl text-slate-400 mb-16 max-w-2xl mx-auto font-medium">
              Join the financial elite. Start your journey with Nunno today for free.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a
                href="/dashboard"
                className="py-5 px-12 bg-white text-black rounded-full font-black text-lg hover:bg-purple-500 hover:text-white transition-all transform hover:scale-105 shadow-2xl uppercase tracking-tight"
              >
                Join the Waitlist
              </a>
              <a
                href="/dashboard"
                className="py-5 px-12 bg-black text-white rounded-full font-black text-lg border border-white/10 hover:bg-white/10 transition-all uppercase tracking-tight"
              >
                Enter the Lab
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 bg-[#020205]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 md:gap-8 mb-20">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-8">
                <NunnoLogo size="md" />
                <span className="text-3xl font-black tracking-tighter italic uppercase underline decoration-purple-500 underline-offset-4">Nunno</span>
              </div>
              <p className="text-slate-500 font-medium max-w-sm leading-relaxed italic">
                Democratizing financial intelligence through empathetic AI since 2024. Building a world where everyone speaks money.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6 italic uppercase tracking-widest text-xs text-white">Laboratory</h4>
              <ul className="space-y-4 text-slate-500 font-medium text-sm italic">
                <li><a href="#" className="hover:text-purple-400 transition-colors">Neural Charts</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Sentiment Engine</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Academy</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 italic uppercase tracking-widest text-xs text-white">Connect</h4>
              <div className="flex space-x-4">
                {[Github, Twitter, ExternalLink, Globe].map((Icon, i) => (
                  <a key={i} href="#" className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-purple-500 hover:border-purple-500 transition-all">
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-slate-600 text-xs font-bold uppercase tracking-[0.2em]">&copy; 2024 NUNNO FINANCE. ALL RIGHTS RESERVED.</p>
            <div className="flex space-x-8 text-[10px] font-black uppercase tracking-widest text-slate-500 italic">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Risk Disclosure</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
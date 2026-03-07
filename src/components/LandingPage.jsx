import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Brain, TrendingUp, Shield, Zap, Sparkles,
  Target, Activity, Globe, Menu, X, Check, ChevronRight
} from 'lucide-react';
import NunnoLogo from './NunnoLogo';
import { cn } from '../utils/cn';
import QuantumBackground from './QuantumBackground';
import SEO from './SEO';
import TerminalLoader from './TerminalLoader';
import VisionDisclaimer from './VisionDisclaimer';

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();

  const handleOpenTerminal = (e) => {
    e.preventDefault();
    setIsTransitioning(true);
    setTimeout(() => {
      navigate('/dashboard');
    }, 1200);
  };


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Neural Analysis",
      description: "Complex market structures and tokenomics translated into clear, actionable human narratives.",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Alpha Stream",
      description: "Real-time institutional-grade indicators simplified for the modern retail investor.",
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Market Simulator",
      description: "Test your strategies in historic market environments without risking real capital.",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Risk Management",
      description: "Advanced safety guardrails to protect capital and prevent emotional trading.",
    }
  ];

  return (
    <div
      className="relative min-h-[100dvh] bg-[#060609] text-slate-200 selection:bg-violet-500/30 overflow-x-hidden font-heading"
      style={{ fontFamily: 'var(--font-heading)' }}
    >
      <SEO
        title="Nunno | Advanced Market Intelligence"
        description="Institutional-grade technical analysis and market intelligence, simplified."
        path="/"
      />

      <TerminalLoader isOpen={isTransitioning} />

      {/* Quantum Background Canvas */}
      <QuantumBackground />

      {/* Navigation */}
      <nav className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        isScrolled ? "bg-[#060609]/80 backdrop-blur-xl border-b border-white/5 py-4" : "bg-transparent py-6"
      )}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <NunnoLogo size="sm" />
            <span
              className="text-2xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 pr-1"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Nunno
            </span>
          </div>

          <div className="hidden md:flex items-center gap-10">
            {['Features', 'Intelligence', 'Academy'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-violet-400 transition-colors"
              >
                {item}
              </a>
            ))}
            <div className="w-px h-4 bg-white/10" />
            <a href="/dashboard" onClick={handleOpenTerminal} className="px-6 py-2.5 bg-white text-[#060609] hover:bg-violet-500 hover:text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              Launch App
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-slate-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={cn(
        "fixed inset-0 z-40 bg-[#060609]/95 backdrop-blur-2xl transition-all duration-300 md:hidden flex flex-col items-center justify-center gap-8",
        mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}>
        {['Features', 'Intelligence', 'Academy'].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
            onClick={() => setMobileMenuOpen(false)}
            className="text-lg font-black uppercase tracking-[0.2em] text-slate-300 hover:text-violet-400"
          >
            {item}
          </a>
        ))}
        <a
          href="/dashboard"
          onClick={handleOpenTerminal}
          className="mt-8 px-8 py-4 bg-violet-600 text-white hover:bg-violet-500 rounded-full text-xs font-black uppercase tracking-widest transition-colors"
        >
          Launch App
        </a>
      </div>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 md:pt-48 md:pb-32 px-6 flex flex-col items-center justify-center min-h-[90dvh] text-center z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 mb-8 shadow-[0_0_20px_rgba(55,159,157,0.15)]"
        >
          <Sparkles size={14} className="text-violet-400" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-violet-300">Next Generation Intelligence</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-violet-200 mb-8 max-w-5xl leading-[1.1]"
        >
          Trade with Unfair <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-violet-600">Clarity.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-base md:text-lg text-slate-400 max-w-2xl mb-12 font-medium leading-relaxed"
        >
          Nunno distills institutional-grade technical analysis and on-chain metrics into
          simple, actionable insights. No noise, just the data you need to execute.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center"
        >
          <a href="/dashboard" onClick={handleOpenTerminal} className="w-full sm:w-auto px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(55,159,157,0.3)]">
            Open Terminal <ArrowRight size={16} />
          </a>
          <a href="#features" className="w-full sm:w-auto px-8 py-4 bg-transparent border border-violet-500/30 text-violet-300 rounded-xl text-[11px] font-bold uppercase tracking-[0.2em] transition-all hover:bg-violet-500/10 hover:border-violet-500/50 flex items-center justify-center">
            Explore Features
          </a>
        </motion.div>
      </section>

      {/* Bento Grid Features */}
      <section id="features" className="py-24 relative z-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 md:text-center">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">The analytical edge.</h2>
            <p className="text-violet-200/60 max-w-xl md:mx-auto">Everything you need to dissect the market, packaged in an interface that doesn't overwhelm.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features && features.map((feature, idx) => (
              <div key={idx} className="group p-8 rounded-3xl bg-[#161824] border border-violet-900/20 hover:border-violet-500/40 transition-all hover:bg-[#1a1c29] flex flex-col h-full shadow-lg hover:shadow-[0_0_30px_rgba(55,159,157,0.1)]">
                <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-400 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-violet-500/20 transition-all">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-violet-300 transition-colors">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed flex-1">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics Preview */}
      <section id="intelligence" className="py-24 relative z-10 px-6 bg-[#0a0b10]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 lg:pl-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/10 mb-6">
              <Activity size={12} className="text-violet-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-violet-300">Live Analysis</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-6 leading-tight">
              Instantly understand <br /> market structure.
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-md leading-relaxed">
              Stop guessing what the indicators mean. Nunno's diagnostic engine
              evaluates risk/reward, trend alignment, and relative volume in seconds.
            </p>
            <ul className="space-y-4 mb-8">
              {['Multi-timeframe Confluence', 'Neural Price Action Reading', 'Automated Risk Mathematics'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300 text-sm font-medium">
                  <div className="w-5 h-5 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400">
                    <Check size={12} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <a href="/dashboard" onClick={handleOpenTerminal} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-violet-900/40 hover:bg-violet-800/60 text-violet-100 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors border border-violet-500/20">
              Launch Terminal <ChevronRight size={14} />
            </a>
          </div>
          <div className="flex-1 w-full flex justify-center lg:justify-end">
            {/* Mockup UI Panel */}
            <div className="w-full max-w-md rounded-3xl bg-[#161824] border border-violet-500/10 shadow-[0_0_50px_rgba(168,85,247,0.05)] overflow-hidden relative">
              {/* Subtle top glow */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
              <div className="p-4 border-b border-white/5 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-purple-500/80" />
                <div className="ml-4 text-[10px] font-mono text-slate-500">btc/usdt - 15m</div>
              </div>
              <div className="p-6 space-y-4">
                <div className="h-24 rounded-xl bg-gradient-to-r from-violet-500/10 to-transparent border border-violet-500/20 flex items-center p-4">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-violet-400 mb-1">Verdict</div>
                    <div className="text-2xl font-black text-white">Bullish Breakout</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-20 rounded-xl bg-white/5 p-4 flex flex-col justify-center">
                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500">R:R Ratio</div>
                    <div className="text-xl font-bold text-slate-200">2.5 : 1</div>
                  </div>
                  <div className="h-20 rounded-xl bg-white/5 p-4 flex flex-col justify-center border border-violet-500/10">
                    <div className="text-[9px] font-bold uppercase tracking-widest text-violet-400">Confluence</div>
                    <div className="text-xl font-bold text-violet-200">84 / 100</div>
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <div className="h-4 w-full bg-[#0a0b10] rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-gradient-to-r from-violet-600 to-violet-400 w-[84%] shadow-[0_0_10px_rgba(55,159,157,0.5)]" />
                  </div>
                  <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-slate-500">
                    <span>Risk Level</span>
                    <span className="text-amber-400">Moderate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <VisionDisclaimer />

      {/* Footer */}
      <footer className="border-t border-violet-900/30 bg-[#0a0b10] pt-16 pb-8 px-6 relative z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <NunnoLogo size="sm" />
            <span
              className="text-lg font-black italic uppercase tracking-tighter text-white/40 pr-1"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Nunno
            </span>
          </div>
          <p className="text-slate-500 text-xs font-medium text-center md:text-left">
            &copy; {new Date().getFullYear()} Nunno Labs. Educational purposes only. Not financial advice.
          </p>
          <div className="flex gap-6">
            {['Twitter', 'Discord', 'Documentation'].map(link => (
              <a key={link} href="#" className="text-xs font-bold text-slate-500 hover:text-violet-400 transition-colors">
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

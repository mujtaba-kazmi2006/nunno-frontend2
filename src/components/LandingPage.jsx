import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Activity, Layers, Shield, Zap, Sparkles,
  Target, Globe, Menu, X, Check, ChevronRight, BarChart3, Database, Fingerprint, Microscope
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
      icon: <Fingerprint className="w-6 h-6" />,
      title: "Structural Diagnostics",
      description: "Deconstruct complex market cycles and tokenomics into high-conviction structural narratives.",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Market Confluence",
      description: "Aggregated institutional-grade indicators and on-chain metrics, simplified for active traders.",
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: "Macro Intelligence",
      description: "Real-time tracking of global liquidity, sentiment vectors, and cross-asset correlations.",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Capital Protection",
      description: "Advanced risk mathematics and behavioral guardrails to prevent emotional market execution.",
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
      <section className="relative pt-40 pb-20 md:pt-48 md:pb-32 px-6 flex flex-col items-center justify-center min-h-[90dvh] text-center z-10 overflow-hidden">
        {/* Background Image Layer */}
        <div 
          className="absolute inset-0 z-[-1] opacity-40 mix-blend-screen pointer-events-none"
          style={{ 
            backgroundImage: 'url(/hero_bg_purple.png)', 
            backgroundSize: 'cover', 
            backgroundPosition: 'center',
            filter: 'grayscale(0.3) contrast(1.1)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#060609] via-transparent to-[#060609] z-[-1]" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 mb-8 shadow-[0_0_20px_rgba(139,92,246,0.15)]"
        >
          <Activity size={14} className="text-violet-400" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-violet-300">Advanced Diagnostic Engine v2.0</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="text-5xl md:text-8xl lg:text-[120px] font-black tracking-[-0.05em] text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40 mb-8 max-w-6xl leading-[0.95] uppercase"
        >
          Institutional <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-500 animate-gradient-x">Intelligence.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-xl text-slate-400 max-w-3xl mb-12 font-medium leading-relaxed"
        >
          Nunno distills institutional-grade technical diagnostics and real-time on-chain confluence into
          precise, actionable literacy. No noise, just the data you need to master the markets.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center"
        >
          <a href="/dashboard" onClick={handleOpenTerminal} className="w-full sm:w-auto px-10 py-5 bg-white text-black hover:bg-violet-400 hover:text-black rounded-xl text-[12px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_50px_rgba(255,255,255,0.1)]">
            Command Center <ArrowRight size={18} />
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
              <div key={idx} className="group p-8 rounded-3xl glass-morphism hover:border-violet-500/40 transition-all hover:bg-white/5 flex flex-col h-full shadow-lg">
                <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-400 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-violet-500/20 transition-all">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-violet-300 transition-colors uppercase tracking-tight">{feature.title}</h3>
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
              <Microscope size={12} className="text-violet-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-violet-300">Live Diagnostics</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-6 leading-tight">
              Instantly understand <br /> market structure.
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-md leading-relaxed">
              Stop guessing what the indicators mean. Nunno's diagnostic engine
              evaluates risk/reward, trend alignment, and relative volume in seconds.
            </p>
            <ul className="space-y-4 mb-8">
              {['Institutional Confluence', 'Structural Diagnostics', 'Advanced Risk Vectors'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300 text-sm font-medium">
                  <div className="w-5 h-5 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-400 border border-violet-500/20">
                    <Check size={12} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <a href="/dashboard" onClick={handleOpenTerminal} className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-violet-500/5 hover:bg-violet-500/10 text-violet-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors border border-violet-500/20 shadow-[0_0_30px_rgba(139,92,246,0.05)]">
              Access Terminal <ChevronRight size={14} />
            </a>
          </div>
          <div className="flex-1 w-full flex justify-center lg:justify-end">
            {/* Mockup UI Panel */}
            <div className="w-full max-w-md rounded-3xl glass-morphism overflow-hidden relative border-violet-500/10">
              {/* Subtle top glow */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
              <div className="p-4 border-b border-white/5 flex items-center gap-2 bg-black/40">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/40 border border-rose-500/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40 border border-amber-500/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-violet-500/40 border border-violet-500/20" />
                </div>
                <div className="ml-4 text-[9px] font-mono text-slate-500 uppercase tracking-widest">engine_diagnostics :: core_liquidity</div>
              </div>
              <div className="p-8 space-y-6">
                <div className="p-5 rounded-2xl bg-violet-500/5 border border-violet-500/10 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-violet-400 mb-1">Structural Bias</div>
                    <div className="text-2xl font-black text-white italic">ACCUMULATION</div>
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-violet-500/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-white/5 p-4 flex flex-col justify-center border border-white/5">
                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1">Divergence</div>
                    <div className="text-lg font-bold text-slate-200">BULLISH [+]</div>
                  </div>
                  <div className="rounded-xl bg-white/5 p-4 flex flex-col justify-center border border-violet-500/10">
                    <div className="text-[9px] font-bold uppercase tracking-widest text-violet-400 mb-1">Confluence</div>
                    <div className="text-lg font-bold text-violet-200">0.922 / 1.0</div>
                  </div>
                </div>
                <div className="space-y-3 mt-4">
                  <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-slate-500">
                    <span>Probability Density</span>
                    <span className="text-violet-400">High Confidence</span>
                  </div>
                  <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-gradient-to-r from-violet-600 to-violet-400 w-[92%] shadow-[0_0_15px_rgba(139,92,246,0.5)]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <VisionDisclaimer />

      {/* Footer */}
      <footer className="border-t border-violet-900/20 bg-[#060609] pt-16 pb-8 px-6 relative z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-violet-500/10 to-transparent" />
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

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, LogIn, UserPlus, X, Sparkles, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NunnoLogo from './NunnoLogo';
import { cn } from '../utils/cn';

export default function LoginSignup({ onClose }) {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        confirmPassword: '',
        experienceLevel: 'beginner'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, signup } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!isLogin && formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        const result = isLogin
            ? await login(formData.email, formData.password)
            : await signup(formData.email, formData.password, formData.name, formData.experienceLevel);

        setLoading(false);

        if (result.success) {
            onClose();
        } else {
            setError(result.error);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 flex items-center justify-center z-[1000] p-4 overflow-hidden">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.1, y: 10 }}
                    className="relative w-full max-w-lg bg-[#0c0c14]/90 border border-white/10 rounded-[3rem] shadow-[0_32px_128px_rgba(0,0,0,0.8)] overflow-hidden backdrop-blur-lg group"
                >
                    {/* Interior Effects */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.1] pointer-events-none" />
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-600/20 blur-[100px] rounded-full pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-600/20 blur-[100px] rounded-full pointer-events-none" />

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-8 right-8 text-white/30 hover:text-white transition-all hover:rotate-90 p-2 z-10"
                    >
                        <X size={24} />
                    </button>

                    <div className="relative p-10 sm:p-12">
                        {/* Header */}
                        <div className="text-center mb-10">
                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="inline-flex justify-center mb-6"
                            >
                                <div className="p-4 rounded-3xl bg-white/5 border border-white/10 shadow-2xl">
                                    <NunnoLogo size="xl" animated />
                                </div>
                            </motion.div>

                            <motion.h2
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none mb-3"
                            >
                                {isLogin ? 'Mission' : 'Enlist'}<br />
                                <span className="text-purple-500 underline decoration-purple-500/30 underline-offset-8">
                                    {isLogin ? 'Control' : 'Protocol'}
                                </span>
                            </motion.h2>
                            <p className="text-slate-400 font-medium italic">
                                {isLogin ? 'Access your financial intelligence node' : 'Initiate your neural market training'}
                            </p>
                        </div>

                        {/* Error Message */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-black uppercase tracking-widest italic"
                                >
                                    ⚠️ ERROR: {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <AnimatePresence mode="popLayout">
                                {!isLogin && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="space-y-2"
                                    >
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-4 italic">Neural Identity</label>
                                        <div className="relative group/input">
                                            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-purple-400 transition-colors" size={18} />
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required={!isLogin}
                                                className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all font-medium"
                                                placeholder="OPERATIVE NAME"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-4 italic">Comm Channel</label>
                                <div className="relative group/input">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-purple-400 transition-colors" size={18} />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all font-medium"
                                        placeholder="EMAIL@PROTOCOL.COM"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-4 italic">Security Key</label>
                                <div className="relative group/input">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-purple-400 transition-colors" size={18} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-14 pr-14 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all font-medium"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <AnimatePresence mode="popLayout">
                                {!isLogin && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-3"
                                    >
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-4 italic">Operative Level</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, experienceLevel: 'beginner' })}
                                                className={cn(
                                                    "flex flex-col items-center gap-2 p-4 rounded-3xl border-2 transition-all duration-300",
                                                    formData.experienceLevel === 'beginner'
                                                        ? "bg-purple-600 border-purple-400 text-white shadow-[0_0_30px_rgba(168,85,247,0.3)]"
                                                        : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20"
                                                )}
                                            >
                                                <Sparkles size={16} className={formData.experienceLevel === 'beginner' ? "animate-pulse" : ""} />
                                                <span className="text-[10px] font-black uppercase tracking-widest italic">Recruit</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, experienceLevel: 'pro' })}
                                                className={cn(
                                                    "flex flex-col items-center gap-2 p-4 rounded-3xl border-2 transition-all duration-300",
                                                    formData.experienceLevel === 'pro'
                                                        ? "bg-indigo-600 border-indigo-400 text-white shadow-[0_0_30px_rgba(99,102,241,0.3)]"
                                                        : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20"
                                                )}
                                            >
                                                <ChevronRight size={16} />
                                                <span className="text-[10px] font-black uppercase tracking-widest italic">Veteran</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full group/btn relative py-5 bg-white text-black rounded-[1.5rem] font-black uppercase tracking-[0.2em] italic hover:bg-purple-600 hover:text-white transition-all duration-500 overflow-hidden shadow-2xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-500 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                <span className="relative z-10 flex items-center gap-3">
                                    {loading ? (
                                        <div className="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin group-hover/btn:border-white group-hover/btn:border-t-transparent" />
                                    ) : (
                                        <>
                                            {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
                                            {isLogin ? 'AUTHORIZE ACCESS' : 'INITIALIZE PROTOCOL'}
                                        </>
                                    )}
                                </span>
                            </button>
                        </form>

                        {/* Toggle */}
                        <div className="mt-8 text-center pt-8 border-t border-white/5">
                            <p className="text-sm font-medium text-slate-500 italic">
                                {isLogin ? "New Operative?" : "Already Authorized?"}
                                <button
                                    onClick={() => {
                                        setIsLogin(!isLogin);
                                        setError('');
                                        setFormData({ email: '', password: '', name: '', confirmPassword: '' });
                                    }}
                                    className="ml-3 text-white font-black uppercase tracking-widest hover:text-purple-400 transition-colors"
                                >
                                    {isLogin ? 'ENLIST NOW' : 'SECURE LOGIN'}
                                </button>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

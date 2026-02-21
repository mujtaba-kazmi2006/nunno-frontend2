import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, LogIn, UserPlus, X, Sparkles, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NunnoLogo from './NunnoLogo';
import OnboardingSurvey from './OnboardingSurvey';
import { cn } from '../utils/cn';
import { analytics } from '../utils/analytics';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';

export default function LoginSignup({ onClose }) {
    const [isLogin, setIsLogin] = useState(true);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        experienceLevel: 'beginner'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, signup, googleLogin } = useAuth();
    const navigate = useNavigate();

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setLoading(true);
            const result = await googleLogin(tokenResponse.access_token);
            setLoading(false);
            if (result.success) {
                analytics.trackLogin('google');
                if (isLogin) {
                    onClose();
                    navigate('/dashboard');
                } else {
                    setShowOnboarding(true);
                }
            } else {
                setError(result.error);
            }
        },
        onError: () => setError('Google Login Failed')
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = isLogin
            ? await login(formData.email, formData.password)
            : await signup(formData.email, formData.password, formData.name, formData.experienceLevel);

        setLoading(false);

        if (result.success) {
            if (isLogin) {
                analytics.trackLogin('email');
                onClose();
                navigate('/dashboard');
            } else {
                analytics.trackSignup('email');
                setShowOnboarding(true);
            }
        } else {
            setError(result.error);
        }
    };

    const handleOnboardingComplete = () => {
        onClose();
        navigate('/dashboard?tutorial=force');
    };

    if (showOnboarding) {
        return <OnboardingSurvey onComplete={handleOnboardingComplete} />;
    }

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

                {/* Modal Container - Optimized Size and Mobile Flow */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.1, y: 10 }}
                    className="relative w-full max-w-md max-h-[92vh] bg-[#0c0c14]/90 border border-white/10 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_32px_128px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden backdrop-blur-lg group"
                >
                    {/* Interior Effects */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.1] pointer-events-none" />
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/30 hover:text-white transition-all hover:rotate-90 p-2 z-10"
                    >
                        <X size={18} />
                    </button>

                    <div className="relative p-6 sm:p-10 overflow-y-auto custom-scrollbar">
                        {/* Header */}
                        <div className="text-center mb-5 sm:mb-8">
                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="inline-flex justify-center mb-3 sm:mb-4 scale-[0.8] sm:scale-90"
                            >
                                <div className="p-2.5 sm:p-3 rounded-2xl bg-white/5 border border-white/10 shadow-2xl">
                                    <NunnoLogo size="lg" animated />
                                </div>
                            </motion.div>

                            <motion.h2
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="text-2xl sm:text-3xl font-black text-white italic uppercase tracking-tighter leading-none mb-1.5"
                            >
                                {isLogin ? 'Welcome' : 'Join'}<br />
                                <span className="text-purple-500 underline decoration-purple-500/30 underline-offset-4">
                                    {isLogin ? 'Back' : 'Nunno'}
                                </span>
                            </motion.h2>
                            <p className="text-slate-400 text-[10px] sm:text-xs font-medium italic">
                                {isLogin ? 'Sign in to your account' : 'Start learning about money today'}
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

                        {/* Google Login Button */}
                        <div className="mb-4 sm:mb-6">
                            <button
                                type="button"
                                onClick={() => handleGoogleLogin()}
                                className="w-full flex items-center justify-center gap-3 py-3 sm:py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold text-[10px] sm:text-xs uppercase tracking-widest hover:bg-white/10 transition-all active:scale-[0.98]"
                            >
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4 sm:w-5 sm:h-5" />
                                {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
                            </button>

                            <div className="relative my-4 sm:my-6 text-center">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/5"></div>
                                </div>
                                <span className="relative z-10 px-4 bg-[#0c0c14] text-[9px] sm:text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] italic">Or use email</span>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                            <AnimatePresence mode="popLayout">
                                {!isLogin && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="space-y-1.5 sm:space-y-2"
                                    >
                                        <label className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] sm:tracking-[0.3em] pl-4 italic">Full Name</label>
                                        <div className="relative group/input">
                                            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-purple-400 transition-colors" size={16} />
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required={!isLogin}
                                                className="w-full pl-12 sm:pl-14 pr-6 py-3 sm:py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all font-medium text-sm"
                                                placeholder="YOUR FULL NAME"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-1.5 sm:space-y-2">
                                <label className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] sm:tracking-[0.3em] pl-4 italic">Email Address</label>
                                <div className="relative group/input">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-purple-400 transition-colors" size={16} />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-12 sm:pl-14 pr-6 py-3 sm:py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all font-medium text-sm"
                                        placeholder="YOU@EMAIL.COM"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5 sm:space-y-2">
                                <label className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] sm:tracking-[0.3em] pl-4 italic">Password</label>
                                <div className="relative group/input">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-purple-400 transition-colors" size={16} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-12 sm:pl-14 pr-12 sm:pr-14 py-3 sm:py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all font-medium text-sm"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <AnimatePresence mode="popLayout">
                                {!isLogin && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-2 sm:space-y-3"
                                    >
                                        <label className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] sm:tracking-[0.3em] pl-4 italic">Experience Level</label>
                                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, experienceLevel: 'beginner' })}
                                                className={cn(
                                                    "flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-[1.5rem] sm:rounded-3xl border-2 transition-all duration-300",
                                                    formData.experienceLevel === 'beginner'
                                                        ? "bg-purple-600 border-purple-400 text-white shadow-[0_0_30px_rgba(168,85,247,0.3)]"
                                                        : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20"
                                                )}
                                            >
                                                <Sparkles size={14} className={formData.experienceLevel === 'beginner' ? "animate-pulse" : ""} />
                                                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest italic text-center leading-tight">Beginner</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, experienceLevel: 'pro' })}
                                                className={cn(
                                                    "flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-[1.5rem] sm:rounded-3xl border-2 transition-all duration-300",
                                                    formData.experienceLevel === 'pro'
                                                        ? "bg-indigo-600 border-indigo-400 text-white shadow-[0_0_30px_rgba(99,102,241,0.3)]"
                                                        : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20"
                                                )}
                                            >
                                                <ChevronRight size={14} />
                                                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest italic text-center leading-tight">Experienced</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <AnimatePresence mode="popLayout">
                                {!isLogin && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="mb-2 sm:mb-4 text-center cursor-default"
                                    >
                                        <p className="text-[9px] sm:text-[10px] text-slate-500 font-medium italic leading-relaxed">
                                            By signing up you agree to the <br />
                                            <button
                                                type="button"
                                                onClick={() => setShowTerms(true)}
                                                className="text-purple-400 font-black uppercase tracking-[0.1em] sm:tracking-widest hover:text-purple-300 transition-colors underline underline-offset-4"
                                            >
                                                Terms and Conditions
                                            </button>
                                            <br />of using nunnoAI
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full group/btn relative py-4 sm:py-5 bg-white text-black rounded-2xl sm:rounded-[1.5rem] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] italic hover:bg-purple-600 hover:text-white transition-all duration-500 overflow-hidden shadow-2xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-500 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                <span className="relative z-10 flex items-center gap-3">
                                    {loading ? (
                                        <div className="w-5 h-5 sm:w-6 sm:h-6 border-3 sm:border-4 border-black border-t-transparent rounded-full animate-spin group-hover/btn:border-white group-hover/btn:border-t-transparent" />
                                    ) : (
                                        <>
                                            {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
                                            {isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}
                                        </>
                                    )}
                                </span>
                            </button>
                        </form>

                        <div className="mt-6 text-center pt-6 border-t border-white/5">
                            <p className="text-[11px] font-medium text-slate-500 italic">
                                {isLogin ? "New here?" : "Already have an account?"}
                                <button
                                    onClick={() => {
                                        setIsLogin(!isLogin);
                                        setError('');
                                        setFormData({ email: '', password: '', name: '', experienceLevel: 'beginner' });
                                    }}
                                    className="ml-2 text-white font-black uppercase tracking-widest hover:text-purple-400 transition-colors"
                                >
                                    {isLogin ? 'SIGN UP' : 'LOGIN'}
                                </button>
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Terms and Conditions Modal */}
                <AnimatePresence>
                    {showTerms && (
                        <div className="fixed inset-0 flex items-center justify-center z-[1100] p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowTerms(false)}
                                className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 1.1, y: 10 }}
                                className="relative w-full max-w-2xl max-h-[80vh] bg-[#0c0c14] border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden"
                            >
                                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                            <Sparkles size={18} className="text-purple-400" />
                                        </div>
                                        <h3 className="text-lg font-black text-white italic uppercase tracking-tight">Legal & Policies</h3>
                                    </div>
                                    <button
                                        onClick={() => setShowTerms(false)}
                                        className="text-slate-500 hover:text-white transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
                                    {/* Refund Policy */}
                                    <section className="space-y-4">
                                        <h4 className="text-purple-400 font-black uppercase tracking-widest text-xs border-b border-purple-400/20 pb-2">Refund Policy for Nunno</h4>
                                        <div className="text-slate-300 text-sm leading-relaxed space-y-4">
                                            <p className="italic text-xs text-slate-500">Effective Date: Feb 15, 2026 | Website: nunno.cloud</p>
                                            <p>Thank you for choosing Nunno. We strive to provide the highest quality cloud solutions and services. To ensure we can maintain our infrastructure and provide consistent value, we have established the following Refund Policy.</p>

                                            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                                <h5 className="text-white font-bold mb-2">1. General Policy</h5>
                                                <p>At Nunno, all sales are final. Due to the digital nature of our services and the immediate allocation of resources provided upon subscription or purchase, <strong>Nunno does not offer refunds, credits, or prorated billing for any services rendered</strong>, regardless of the plan selected.</p>
                                            </div>

                                            <div className="space-y-4">
                                                <h5 className="text-white font-bold">2. Digital Service Nature</h5>
                                                <p>Once a plan is activated, the features, storage, and processing power associated with that plan are immediately made available to you. Because these resources are reserved and utilized upon activation, we are unable to offer refunds once a transaction has been processed.</p>

                                                <h5 className="text-white font-bold">3. "No Refund" Under Any Circumstances</h5>
                                                <p>This policy applies to all circumstances, including but not limited to:</p>
                                                <ul className="list-disc pl-5 space-y-2 text-slate-400">
                                                    <li>Unused subscription time or service features.</li>
                                                    <li>Accidental purchases or plan selections.</li>
                                                    <li>Changes in your project requirements or financial situation.</li>
                                                    <li>Dissatisfaction with the service.</li>
                                                    <li>Account termination due to a violation of our Terms of Service.</li>
                                                </ul>

                                                <h5 className="text-white font-bold">4. Subscription Cancellations</h5>
                                                <p>You may cancel your subscription at any time through your account dashboard. Upon cancellation, you will continue to have access until the end of your current billing cycle.</p>

                                                <h5 className="text-white font-bold">5. Chargebacks and Disputes</h5>
                                                <p>Initiating a chargeback or a payment dispute may result in the permanent suspension of your Nunno account and services.</p>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Privacy Policy */}
                                    <section className="space-y-4 pt-8 border-t border-white/5">
                                        <h4 className="text-blue-400 font-black uppercase tracking-widest text-xs border-b border-blue-400/20 pb-2">Privacy Policy for Nunno</h4>
                                        <div className="text-slate-300 text-sm leading-relaxed space-y-4">
                                            <p>Nunno is committed to protecting the privacy of our users. This policy explains how we collect, use, and safeguard your information.</p>

                                            <div className="space-y-4">
                                                <h5 className="text-white font-bold text-xs uppercase tracking-wider">1. Information We Collect</h5>
                                                <p>We collect Identity Data (Name, Email), Account Data, Education Data (Progress, Quiz scores), and Technical Usage Data (IP, Browser type).</p>

                                                <h5 className="text-white font-bold text-xs uppercase tracking-wider">2. How We Use Information</h5>
                                                <p>To provide/personalize the service, communicate updates, improve analytics, and ensure legal compliance.</p>

                                                <h5 className="text-white font-bold text-xs uppercase tracking-wider">3. Data Protection Rights</h5>
                                                <p>You have the right to access, rectify, or erase your data, and to object to or restrict its processing under certain conditions.</p>

                                                <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                                                    <h5 className="text-blue-400 font-bold mb-2">Contact Us</h5>
                                                    <p className="text-xs">Nunno.cloud Email: <a href="mailto:nunnofinance@gmail.com" className="underline italic">nunnofinance@gmail.com</a></p>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                                <div className="p-8 border-t border-white/5 bg-[#0c0c14]">
                                    <button
                                        onClick={() => setShowTerms(false)}
                                        className="w-full py-4 bg-white text-black font-black uppercase tracking-widest italic rounded-2xl hover:bg-purple-600 hover:text-white transition-all duration-300 shadow-xl"
                                    >
                                        I Understand and Agree
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </AnimatePresence>
    );
}

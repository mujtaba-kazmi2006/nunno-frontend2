import React from 'react';
import { Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from './SEO';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen py-20 px-4 sm:px-6 bg-[#020205] text-white">
            <SEO title="Privacy Policy" description="How Nunno, an educational AI analysis tool, handles your data." path="/privacy" />
            <div className="max-w-3xl mx-auto">
                <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest mb-12 transition-colors">
                    <ArrowLeft size={14} /> Back to Home
                </Link>

                <header className="mb-16">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="size-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-black italic uppercase tracking-tighter">
                                Privacy <span className="text-purple-500">Policy</span>
                            </h1>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Last Updated: February 25, 2026</p>
                        </div>
                    </div>
                </header>

                <div className="space-y-12 text-slate-400 text-sm leading-relaxed font-medium">
                    <section>
                        <h2 className="text-white text-lg font-black italic uppercase tracking-tight mb-4">1. Educational Purpose</h2>
                        <p>Nunno is an <strong className="text-white">educational AI application</strong> built for market analysis, technical education, and financial literacy training. All AI-generated content — including charts, indicators, sentiment scores, and trade narratives — is strictly for <strong className="text-white">informational and educational purposes only</strong>. Nunno does not provide financial advice, brokerage services, or investment recommendations.</p>
                    </section>

                    <section>
                        <h2 className="text-white text-lg font-black italic uppercase tracking-tight mb-4">2. Data We Collect</h2>
                        <ul className="space-y-3 list-none">
                            <li className="flex gap-3"><span className="size-1.5 rounded-full bg-purple-500 mt-2 shrink-0" /><span><strong className="text-white">Account Information:</strong> Email address and display name provided during sign-up (including Google OAuth).</span></li>
                            <li className="flex gap-3"><span className="size-1.5 rounded-full bg-purple-500 mt-2 shrink-0" /><span><strong className="text-white">Usage Data:</strong> Queries submitted, features accessed, and session analytics to improve the educational experience.</span></li>
                            <li className="flex gap-3"><span className="size-1.5 rounded-full bg-purple-500 mt-2 shrink-0" /><span><strong className="text-white">Device Data:</strong> Browser type, screen resolution, and IP address collected automatically for service optimization.</span></li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-white text-lg font-black italic uppercase tracking-tight mb-4">3. How We Use Your Data</h2>
                        <p>Your data is used to deliver and improve the Nunno educational experience, including personalizing AI responses, tracking usage limits, and improving our analysis engine. We never sell your personal information to third parties.</p>
                    </section>

                    <section>
                        <h2 className="text-white text-lg font-black italic uppercase tracking-tight mb-4">4. Third-Party Services</h2>
                        <p>Nunno uses the following third-party services:</p>
                        <ul className="space-y-2 mt-3 list-none">
                            <li className="flex gap-3"><span className="size-1.5 rounded-full bg-slate-600 mt-2 shrink-0" /><span><strong className="text-white">Google Analytics</strong> — for anonymized usage tracking and session analysis.</span></li>
                            <li className="flex gap-3"><span className="size-1.5 rounded-full bg-slate-600 mt-2 shrink-0" /><span><strong className="text-white">Google OAuth</strong> — for secure authentication without password storage.</span></li>
                            <li className="flex gap-3"><span className="size-1.5 rounded-full bg-slate-600 mt-2 shrink-0" /><span><strong className="text-white">Binance API</strong> — for real-time public market data used in analysis features.</span></li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-white text-lg font-black italic uppercase tracking-tight mb-4">5. Your Rights</h2>
                        <p>You may request deletion of your account and associated data at any time by contacting us. Under GDPR/CCPA, you have the right to access, correct, or delete your personal data.</p>
                    </section>

                    <section className="pt-8 border-t border-white/5">
                        <p className="text-slate-600 text-xs italic">For privacy concerns, contact: <a href="mailto:privacy@nunno.finance" className="text-purple-400 hover:text-white transition-colors">privacy@nunno.finance</a></p>
                    </section>
                </div>
            </div>
        </div>
    );
}

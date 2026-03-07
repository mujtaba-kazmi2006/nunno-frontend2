import React from 'react';
import { FileText, ArrowLeft, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from './SEO';

export default function TermsOfService() {
    return (
        <div className="min-h-[100dvh] py-20 px-4 sm:px-6 bg-[#020205] text-white">
            <SEO title="Terms of Service" description="Terms governing your use of Nunno, an educational AI analysis tool." path="/terms" />
            <div className="max-w-3xl mx-auto">
                <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest mb-12 transition-colors">
                    <ArrowLeft size={14} /> Back to Home
                </Link>

                <header className="mb-16">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="size-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-black italic uppercase tracking-tighter">
                                Terms of <span className="text-violet-500">Service</span>
                            </h1>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Last Updated: February 25, 2026</p>
                        </div>
                    </div>
                </header>

                {/* FINANCIAL DISCLAIMER — PROMINENT */}
                <div className="p-6 sm:p-8 rounded-3xl bg-amber-500/5 border border-amber-500/20 mb-12">
                    <div className="flex items-start gap-4">
                        <AlertTriangle className="text-amber-500 shrink-0 mt-1" size={24} />
                        <div>
                            <h3 className="text-amber-400 font-black italic uppercase tracking-tight text-base mb-3">Important Financial Disclaimer</h3>
                            <p className="text-slate-300 text-sm leading-relaxed font-medium">
                                Nunno is an <strong className="text-white">educational AI application</strong> designed to help users learn about market analysis, technical indicators, and financial concepts.
                                <strong className="text-amber-300"> It is NOT financial advice.</strong> All AI-generated analysis, signals, sentiment scores, and narratives are produced for educational and informational purposes only.
                                Nunno Labs does not recommend, endorse, or advise any specific trade, investment, or financial decision. Trading and investing involve significant risk of capital loss.
                                Always consult a licensed financial adviser before making any investment decisions.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-12 text-slate-400 text-sm leading-relaxed font-medium">
                    <section>
                        <h2 className="text-white text-lg font-black italic uppercase tracking-tight mb-4">1. Scope of Service</h2>
                        <p>Nunno provides AI-powered educational tools including market analysis, technical indicator breakdowns, historical simulations, sentiment tracking, and financial literacy training. These features are designed to teach users how markets work — they are not trading signals or investment advice.</p>
                    </section>

                    <section>
                        <h2 className="text-white text-lg font-black italic uppercase tracking-tight mb-4">2. User Responsibility</h2>
                        <p>By using Nunno, you acknowledge that all content is educational in nature. You accept full responsibility for any financial decisions you make. Nunno Labs, its creators, and affiliates bear no liability for any financial losses, missed opportunities, or damages arising from the use of this platform.</p>
                    </section>

                    <section>
                        <h2 className="text-white text-lg font-black italic uppercase tracking-tight mb-4">3. Acceptable Use</h2>
                        <ul className="space-y-3 list-none">
                            <li className="flex gap-3"><span className="size-1.5 rounded-full bg-violet-500 mt-2 shrink-0" /><span>Do not use Nunno for market manipulation, pump-and-dump schemes, or any fraudulent activity.</span></li>
                            <li className="flex gap-3"><span className="size-1.5 rounded-full bg-violet-500 mt-2 shrink-0" /><span>Do not attempt to reverse-engineer, scrape, or abuse the AI analysis engine.</span></li>
                            <li className="flex gap-3"><span className="size-1.5 rounded-full bg-violet-500 mt-2 shrink-0" /><span>Do not redistribute AI-generated content commercially without written permission.</span></li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-white text-lg font-black italic uppercase tracking-tight mb-4">4. Account & Data</h2>
                        <p>You are responsible for maintaining the security of your account. Nunno reserves the right to suspend accounts that violate these terms. Your data is handled in accordance with our <Link to="/privacy" className="text-violet-400 hover:text-white transition-colors underline underline-offset-4">Privacy Policy</Link>.</p>
                    </section>

                    <section>
                        <h2 className="text-white text-lg font-black italic uppercase tracking-tight mb-4">5. Changes to Terms</h2>
                        <p>Nunno Labs reserves the right to update these Terms at any time. Continued use of the platform after changes constitutes acceptance of the updated Terms.</p>
                    </section>

                    <section className="pt-8 border-t border-white/5">
                        <p className="text-slate-600 text-xs italic">For legal inquiries, contact: <a href="mailto:legal@nunno.finance" className="text-violet-400 hover:text-white transition-colors">legal@nunno.finance</a></p>
                    </section>
                </div>
            </div>
        </div>
    );
}

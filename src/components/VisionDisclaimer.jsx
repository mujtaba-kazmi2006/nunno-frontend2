import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { cn } from '../utils/cn';

/**
 * VisionDisclaimer Component
 * Primarily for SEO and user trust. Ensures crawlers understand the 
 * "Education not Advisory" mission through semantic HTML and ARIA.
 */
const VisionDisclaimer = ({ className }) => {
    return (
        <section
            aria-labelledby="vision-title"
            className={cn("max-w-4xl mx-auto my-12 p-8 rounded-[2rem] border border-violet-500/20 bg-violet-500/5 backdrop-blur-sm", className)}
        >
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-shrink-0 p-4 rounded-2xl bg-violet-500/10 text-violet-400">
                    <ShieldCheck size={32} />
                </div>

                <div className="space-y-4">
                    <h2 id="vision-title" className="text-2xl font-black italic uppercase tracking-tighter text-white flex items-center gap-2">
                        Nunno Vision <span className="text-violet-500">// Ethics</span>
                    </h2>

                    <p className="text-slate-300 font-medium leading-relaxed">
                        Nunno is built on a single core principle: <strong className="text-white">Knowledge is the best risk management.</strong>
                        Our vision is to bridge the gap between complex institutional data and the retail investor through empathy and education.
                    </p>

                    <article className="grid md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400 mb-2">Our Mission</h3>
                            <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                To provide transparent, real-time market diagnostics that empower users to make their own informed decisions.
                                We don't tell you what to buy; we teach you how to see.
                            </p>
                        </div>

                        <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-400 mb-2 flex items-center gap-2">
                                <Info size={12} /> Legal Clarity
                            </h3>
                            <p className="text-[11px] text-slate-400 leading-relaxed font-bold italic">
                                Nunno is an educational platform. All neural insights, chart patterns, and simulations are for educational purposes only.
                                We are not financial advisors, and nothing on this platform constitutes investment advice.
                            </p>
                        </div>
                    </article>
                </div>
            </div>
        </section>
    );
};

export default VisionDisclaimer;

import React from 'react';
import { motion } from 'framer-motion';
import { Compass, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from './SEO';

export default function NotFound() {
    return (
        <div className="min-h-[100dvh] bg-[#020205] text-white flex items-center justify-center p-6 relative overflow-hidden font-sans">
            <SEO title="404 - Lost in the Void" description="The page you are looking for does not exist in the Nunno ecosystem." path="*" />

            {/* 3D-like Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 size-[400px] bg-purple-600/5 blur-[100px] rounded-full animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 size-[400px] bg-indigo-600/5 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="relative z-10 max-w-2xl w-full text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="inline-flex items-center justify-center size-24 rounded-[3rem] bg-white/[0.02] border border-white/5 text-purple-500 mb-12 shadow-2xl relative group overflow-hidden">
                        <div className="absolute inset-0 bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                        <Compass size={48} className="relative z-10 group-hover:rotate-45 transition-transform duration-700" />
                    </div>

                    <h1 className="text-[15vw] md:text-[8rem] font-black italic uppercase tracking-tighter leading-none mb-4 md:mb-8 text-white">
                        404<span className="text-purple-600">.</span>
                    </h1>

                    <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tight mb-6\">
                        Lost in <span className="text-slate-500 underline decoration-purple-600 underline-offset-8 transition-colors hover:text-white\">the Void.</span>
                    </h2>

                    <p className="max-w-md mx-auto text-slate-400 text-sm md:text-base font-medium leading-relaxed mb-12 opacity-80 px-4">
                        The coordinate you requested does not exist in this sector of the financial neural network.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
                        <Link
                            to="/"
                            className="px-10 py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs italic hover:bg-purple-600 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-3 shadow-xl shadow-black/40"
                        >
                            <ArrowLeft size={16} />
                            Return to Reality
                        </Link>
                    </div>

                    {/* Fun architectural detail */}
                    <div className="mt-16 flex items-center justify-center gap-4 opacity-20">
                        <div className="h-px w-12 bg-white" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] italic">Sector NaN</span>
                        <div className="h-px w-12 bg-white" />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

import React from 'react';
import { AlertOctagon, RefreshCcw, Home } from 'lucide-react';

export default function ErrorBoundaryFallback({ error, resetErrorBoundary }) {
    return (
        <div className="min-h-[100dvh] bg-[#020205] text-white flex items-center justify-center p-6 font-sans">
            <div className="max-w-xl w-full">
                {/* Decorative Background Glow */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] bg-purple-600/10 blur-[120px] rounded-full" />
                </div>

                <div className="relative z-10 text-center">
                    <div className="inline-flex items-center justify-center size-20 rounded-[2.5rem] bg-red-500/10 border border-red-500/20 text-red-500 mb-10 shadow-2xl shadow-red-500/10">
                        <AlertOctagon size={40} />
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-6 leading-none">
                        Neural <br />
                        <span className="text-red-500">Fragmentation.</span>
                    </h1>

                    <p className="text-slate-400 text-sm md:text-base font-medium leading-relaxed mb-12 opacity-80">
                        Nunno encountered an unexpected architectural failure.
                        The neural link has been severed to protect your data.
                    </p>

                    {/* Error Details (Hidden by default, expandable) */}
                    <div className="mb-12 bg-white/[0.02] border border-white/5 rounded-3xl p-6 text-left overflow-hidden">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 italic">Diagnostic Data</p>
                        <pre className="text-xs font-mono text-red-400/70 whitespace-pre-wrap break-all leading-relaxed max-h-32 overflow-y-auto no-scrollbar">
                            {error?.message || 'Unknown protocol error'}
                        </pre>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={resetErrorBoundary}
                            className="flex-1 sm:flex-none px-8 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[10px] italic hover:bg-purple-600 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-3 shadow-xl"
                        >
                            <RefreshCcw size={16} />
                            Re-establish Link
                        </button>
                        <a
                            href="/"
                            className="flex-1 sm:flex-none px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] italic hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center gap-3"
                        >
                            <Home size={16} />
                            Back to Base
                        </a>
                    </div>

                    <p className="mt-12 text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 italic">
                        Node Error Code: 0xFX_FRAGMENT_CRITICAL
                    </p>
                </div>
            </div>
        </div>
    );
}

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TerminalLoader = ({ isOpen }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0f111a]"
                >
                    <div className="relative">
                        {/* ECG Style Pulse SVG */}
                        <svg width="128px" height="96px" viewBox="0 0 64 48" className="overflow-visible">
                            {/* Back line (faint pulse) */}
                            <polyline
                                points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24"
                                className="fill-none stroke-violet-500/10 stroke-[3] stroke-round stroke-join"
                            />
                            {/* Front line (active pulse) */}
                            <motion.polyline
                                points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24"
                                className="fill-none stroke-violet-500 stroke-[3] stroke-round stroke-join"
                                initial={{ strokeDasharray: "48, 144", strokeDashoffset: 192 }}
                                animate={{ strokeDashoffset: 0 }}
                                transition={{
                                    duration: 1.4,
                                    ease: "linear",
                                    repeat: Infinity,
                                    repeatDelay: 0
                                }}
                            />
                        </svg>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-8 flex flex-col items-center"
                    >
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-violet-500 italic animate-pulse">
                            
                        </span>
                        <div className="mt-4 flex gap-1">
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                    transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                                    className="size-1 rounded-full bg-violet-500"
                                />
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default TerminalLoader;

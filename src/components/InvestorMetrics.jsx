import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
    Users,
    TrendingUp,
    Globe,
    Zap,
    ShieldCheck,
    Activity,
    ArrowUpRight,
    Search,
    Filter,
    Download,
    Database,
    RefreshCw
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../utils/cn';

const MetricCard = ({ icon: Icon, label, value, trend, color, theme }) => (
    <div className={cn(
        "p-6 rounded-[2rem] border-2 transition-all",
        theme === 'dark' ? "bg-white/[0.03] border-white/5" : "bg-white border-slate-100 shadow-sm"
    )}>
        <div className="flex items-start justify-between mb-4">
            <div className={cn("p-3 rounded-2xl", color)}>
                <Icon size={24} className="text-white" />
            </div>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black italic">
                <TrendingUp size={12} />
                {trend}
            </div>
        </div>
        <div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{label}</p>
            <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none">
                {value}
            </h3>
        </div>
    </div>
);

const InvestorMetrics = () => {
    const { theme } = useTheme();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        total_users: 0,
        total_waitlist: 0,
        combined_traction: 0,
        users: [],
        stats: {
            active_today: 0,
            conversion_rate: "0%",
            retention: "0%",
            markets_analyzed: 0
        }
    });

    const itemsPerPage = 12;

    const fetchMetrics = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/admin/metrics');
            setData(response.data);
        } catch (error) {
            console.error('Failed to fetch metrics:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMetrics();
        // Poll for updates every 30 seconds for that "live" feel
        const interval = setInterval(fetchMetrics, 30000);
        return () => clearInterval(interval);
    }, []);

    const filteredUsers = useMemo(() => {
        return data.users.filter(user =>
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.location.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, data.users]);

    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className={cn(
            "min-h-screen p-8 transition-colors duration-500 relative overflow-hidden",
            theme === 'dark' ? "bg-[#020205]" : "bg-slate-50"
        )}>
            {/* Ambient Background Effects */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="size-10 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-600/20">
                                <Database size={24} className="text-white" />
                            </div>
                            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">
                                Traction <span className="text-purple-500">Core</span>
                            </h1>
                        </div>
                        <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">
                            Live Production Registry // Real-time User Data
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                <span className="text-emerald-500">Live</span> Sync
                            </div>
                            <div className={cn("size-2 rounded-full bg-emerald-500 animate-pulse")} />
                        </div>
                        <button
                            onClick={fetchMetrics}
                            disabled={loading}
                            className="p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all disabled:opacity-50"
                        >
                            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                        </button>
                        <button className="p-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white transition-all active:scale-95 shadow-lg shadow-purple-600/20">
                            <Download size={20} />
                        </button>
                    </div>
                </header>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <MetricCard
                        icon={Users}
                        label="Total Traction"
                        value={data.combined_traction.toLocaleString()}
                        trend="Real-time"
                        color="bg-purple-600"
                        theme={theme}
                    />
                    <MetricCard
                        icon={ShieldCheck}
                        label="Verified Users"
                        value={data.total_users.toLocaleString()}
                        trend="Active"
                        color="bg-indigo-600"
                        theme={theme}
                    />
                    <MetricCard
                        icon={Zap}
                        label="Waitlist Queue"
                        value={data.total_waitlist.toLocaleString()}
                        trend="High Intent"
                        color="bg-emerald-600"
                        theme={theme}
                    />
                    <MetricCard
                        icon={Activity}
                        label="Daily Active"
                        value={data.stats.active_today.toLocaleString()}
                        trend="Synced"
                        color="bg-amber-600"
                        theme={theme}
                    />
                </div>

                {/* Database Search & Table */}
                <div className={cn(
                    "rounded-[2.5rem] border-2 border-white/5 bg-white/[0.02] backdrop-blur-md overflow-hidden",
                    theme !== 'dark' && "bg-white border-slate-100 shadow-xl"
                )}>
                    <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 uppercase">
                        <div>
                            <h2 className="text-xl font-black text-white italic tracking-tighter">Live Registry</h2>
                            <p className="text-slate-500 text-[10px] font-bold tracking-widest mt-1">Cross-check: Users & Waitlist</p>
                        </div>
                        <div className="flex items-center gap-4 flex-1 max-w-lg">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by ID, email or node..."
                                    className="w-full pl-12 pr-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm placeholder:text-slate-600"
                                />
                            </div>
                            <button className="p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all">
                                <Filter size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto min-h-[400px]">
                        {loading && data.users.length === 0 ? (
                            <div className="flex items-center justify-center p-20">
                                <div className="text-purple-500 animate-spin">
                                    <RefreshCw size={48} />
                                </div>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                                        <th className="px-8 py-4 border-b border-white/5">Identity</th>
                                        <th className="px-8 py-4 border-b border-white/5">Registry Type</th>
                                        <th className="px-8 py-4 border-b border-white/5">Network Node</th>
                                        <th className="px-8 py-4 border-b border-white/5">Activity</th>
                                        <th className="px-8 py-4 border-b border-white/5">Timestamp</th>
                                        <th className="px-8 py-4 border-b border-white/5"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {paginatedUsers.map((user) => (
                                        <motion.tr
                                            key={user.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="hover:bg-white/[0.02] transition-colors group cursor-default"
                                        >
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-white italic">{user.name}</span>
                                                    <span className="text-[10px] font-bold text-slate-500 tracking-tighter">{user.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className={cn(
                                                    "inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                                                    user.type === 'Signed Up' ? "bg-emerald-500/10 text-emerald-500" :
                                                        "bg-purple-500/10 text-purple-500"
                                                )}>
                                                    <div className={cn("size-1 rounded-full", user.type === 'Signed Up' ? "bg-emerald-500" : "bg-purple-500")} />
                                                    {user.type}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-[11px] font-black text-slate-300 italic uppercase">{user.location}</span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 h-1 w-16 bg-white/5 rounded-full overflow-hidden">
                                                        <div
                                                            className={cn(
                                                                "h-full rounded-full",
                                                                user.activityScore > 80 ? "bg-emerald-500" : "bg-purple-500"
                                                            )}
                                                            style={{ width: `${user.activityScore}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[9px] font-black text-white">{user.activityScore}%</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-[10px] font-bold text-slate-500">
                                                {new Date(user.joinedAt).toLocaleDateString()} {new Date(user.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button className="text-slate-600 hover:text-white transition-colors">
                                                    <ArrowUpRight size={16} />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    <div className="p-8 border-t border-white/5 flex items-center justify-between">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            Showing <span className="text-white">{filteredUsers.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredUsers.length)}</span> of {filteredUsers.length} real entries
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:text-white transition-all uppercase"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => p + 1)}
                                disabled={currentPage * itemsPerPage >= filteredUsers.length}
                                className="px-4 py-2 rounded-xl bg-purple-600 text-[10px] font-black uppercase text-white hover:bg-purple-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all uppercase"
                            >
                                Next Page
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Disclaimer for Investor */}
                <div className="mt-12 flex items-center justify-between px-8 py-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10">
                    <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-emerald-500/10">
                            <ShieldCheck size={20} className="text-emerald-500" />
                        </div>
                        <p className="text-[11px] font-bold text-emerald-500/80 uppercase tracking-widest">
                            Verified Production Data // Directly Synced to Mainnet DB
                        </p>
                    </div>
                    <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">
                        Last Refresh: {new Date().toLocaleTimeString()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvestorMetrics;

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Trophy, Medal, Star, Shield, Zap, Lock,
    Crown, TrendingUp, Award, Target, Flame
} from 'lucide-react';
import { useAuthStore } from '../store';
import { getGamificationStats, BADGES, RANKS } from '../services/gamificationService';
import toast from 'react-hot-toast';

const ProgressPage = () => {
    const { user } = useAuthStore();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [user.id]);

    const loadData = async () => {
        try {
            const data = await getGamificationStats(user.id);
            setStats(data);
        } catch (error) {
            toast.error("Impossible de charger votre légende...");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return null;

    // Calculs pour l'affichage
    const currentRank = stats.currentRank;
    const nextRank = stats.nextRank;
    const progress = stats.xpProgress;
    const unlockedCodes = stats.unlockedBadges.map(b => b.badge_code);

    return (
        <div className="space-y-8 fade-in pb-24">
            {/* HEROS SECTION - RANK CARD */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 shadow-2xl p-8">
                {/* Background Effects */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                    {/* Rank Icon */}
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        className="w-32 h-32 md:w-40 md:h-40 relative group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-300 to-amber-700 rounded-full opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-500"></div>
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border-4 border-amber-500/30 flex items-center justify-center text-7xl md:text-8xl shadow-inner relative z-10">
                            {currentRank.icon}
                        </div>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg whitespace-nowrap">
                            Niveau {stats.level}
                        </div>
                    </motion.div>

                    {/* Rank Info */}
                    <div className="flex-1 w-full">
                        <motion.h2
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tight uppercase"
                        >
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">
                                {currentRank.name}
                            </span>
                        </motion.h2>

                        <div className="flex items-center justify-between text-sm text-slate-400 mb-2 font-mono">
                            <span>{stats.xp} XP</span>
                            <span className="flex items-center gap-1">
                                {nextRank ? (
                                    <>Prochain rang: <strong className="text-white">{nextRank.name}</strong> ({nextRank.minXP} XP)</>
                                ) : (
                                    <span className="text-amber-400 font-bold">RANG MAXIMALE</span>
                                )}
                            </span>
                        </div>

                        {/* XP Bar */}
                        <div className="h-6 bg-slate-950 rounded-full overflow-hidden border border-slate-700/50 shadow-inner relative">
                            {/* Bar effect */}
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-400 relative"
                            >
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
                                <div className="absolute top-0 right-0 bottom-0 w-1 bg-white/50 blur-[2px]"></div>
                            </motion.div>

                            {/* Percentage Text */}
                            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-md">
                                {Math.round(progress)}%
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* STATS GRID */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={<Zap size={24} className="text-yellow-400" />}
                    title="Série Actuelle"
                    value={`${stats.current_streak} Jours`}
                    desc="Consistance"
                    color="bg-yellow-500/10"
                />
                <StatCard
                    icon={<Flame size={24} className="text-orange-500" />}
                    title="Meilleure Série"
                    value={`${stats.best_streak} Jours`}
                    desc="Record Perso"
                    color="bg-orange-500/10"
                />
                <StatCard
                    icon={<Target size={24} className="text-emerald-400" />}
                    title="Total Opérations"
                    value={stats.total_operations}
                    desc="Actions Validées"
                    color="bg-emerald-500/10"
                />
                <StatCard
                    icon={<Medal size={24} className="text-purple-400" />}
                    title="Badges"
                    value={`${stats.unlockedBadgesCount} / ${stats.totalBadges}`}
                    desc="Collection"
                    color="bg-purple-500/10"
                />
            </div>

            {/* BADGES GALLERY */}
            <div>
                <div className="flex items-center gap-3 mb-6">
                    <Trophy className="text-amber-500" size={28} />
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-500">
                        Salle des Trophées
                    </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {BADGES.map((badge, idx) => {
                        const isUnlocked = unlockedCodes.includes(badge.id);

                        return (
                            <motion.div
                                key={badge.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`relative group p-6 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center gap-3 ${isUnlocked
                                        ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-amber-500/30 hover:border-amber-500/60 shadow-lg shadow-amber-900/10'
                                        : 'bg-slate-900/50 border-slate-800 opacity-60 grayscale hover:opacity-100'
                                    }`}
                            >
                                {isUnlocked && (
                                    <div className="absolute top-3 right-3 text-amber-500 animate-pulse">
                                        <Star size={12} fill="currentColor" />
                                    </div>
                                )}

                                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-inner mb-1 relative ${isUnlocked ? 'bg-slate-800' : 'bg-slate-950'
                                    }`}>
                                    {isUnlocked ? (
                                        <>
                                            <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full"></div>
                                            <span className="relative z-10">{badge.icon}</span>
                                        </>
                                    ) : (
                                        <Lock size={24} className="text-slate-600" />
                                    )}
                                </div>

                                <div>
                                    <h3 className={`font-bold text-sm mb-1 ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>
                                        {badge.name}
                                    </h3>
                                    <p className="text-xs text-slate-500 leading-snug">
                                        {badge.desc}
                                    </p>
                                </div>

                                {isUnlocked && (
                                    <div className="absolute inset-0 border-2 border-amber-500/0 group-hover:border-amber-500/20 rounded-2xl transition-all pointer-events-none"></div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* RANKS PREVIEW (Mini Map) */}
            <div className="pt-8 border-t border-slate-800">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 text-center">Échelle des Rangs</h3>
                <div className="flex items-center justify-between relative px-4 overflow-x-auto pb-4 custom-scrollbar">
                    {/* Progress Line */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-800 -z-10 -translate-y-[10px]"></div>

                    {RANKS.map((rank) => {
                        const isReached = stats.xp >= rank.minXP;
                        const isCurrent = currentRank.level === rank.level;

                        return (
                            <div key={rank.level} className="flex flex-col items-center gap-3 min-w-[80px]">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 transition-all z-10 ${isReached
                                        ? 'bg-amber-500 border-slate-900 text-slate-900'
                                        : 'bg-slate-900 border-slate-700 text-slate-600'
                                    } ${isCurrent ? 'scale-150 ring-4 ring-amber-500/20 shadow-lg shadow-amber-500/50' : ''}`}>
                                    {isReached ? <CheckIcon size={14} strokeWidth={4} /> : <div className="w-2 h-2 rounded-full bg-slate-700"></div>}
                                </div>
                                <div className={`text-center transition-colors ${isCurrent ? 'text-amber-400 font-bold' : isReached ? 'text-slate-300' : 'text-slate-600'}`}>
                                    <div className="text-[10px] uppercase font-bold">{rank.name}</div>
                                    <div className="text-[9px] opacity-70">{rank.minXP} XP</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// Sub-components
const StatCard = ({ icon, title, value, desc, color }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className={`p-4 rounded-xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm relative overflow-hidden group`}
    >
        <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full blur-2xl transition-opacity opacity-50 group-hover:opacity-80 ${color}`}></div>

        <div className="relative z-10">
            <div className="mb-3 p-2 w-fit rounded-lg bg-slate-800 border border-slate-700">
                {icon}
            </div>
            <div className="text-2xl font-black text-white tracking-tight mb-0.5">
                {value}
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                {title}
            </div>
            <div className="text-[10px] text-slate-500">
                {desc}
            </div>
        </div>
    </motion.div>
);

const CheckIcon = (props) => (
    <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

export default ProgressPage;

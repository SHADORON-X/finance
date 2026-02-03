import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wallet, TrendingUp, TrendingDown, Target,
    Zap, Calendar, ArrowRight, Shield, Bot, ScrollText
} from 'lucide-react';
import { useAuthStore } from '../store';
import { getBalances, getTotalBalance, getTotalAvailableBalance, getSavingsBalance } from '../services/balanceService';
import { getTransactions } from '../services/transactionService'; // Suppose this exists, otherwise we'll fetch basic
import { getGamificationData, getCurrentRank } from '../services/gamificationService';
import { getGoals } from '../services/goalService';
import { getFinancialAdvice, getProactiveWisdom } from '../services/aiService';
import { getDebts } from '../services/debtService';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [finances, setFinances] = useState({
        total: 0,
        available: 0,
        savings: 0,
        recentTransactions: []
    });
    const [gamification, setGamification] = useState(null);
    const [goalsCount, setGoalsCount] = useState(0);
    const [oracleAdvice, setOracleAdvice] = useState('');
    const [decreeBatch, setDecreeBatch] = useState([]);
    const [currentDecreeIndex, setCurrentDecreeIndex] = useState(0);

    useEffect(() => {
        loadDashboardData();
    }, [user.id]);

    useEffect(() => {
        if (decreeBatch.length > 0) {
            const timer = setInterval(() => {
                setCurrentDecreeIndex((prev) => (prev + 1) % decreeBatch.length);
            }, 15000); // Change toutes les 15 secondes
            return () => clearInterval(timer);
        }
    }, [decreeBatch]);

    const loadDashboardData = async () => {
        try {
            const [total, available, savings, gamifData, goals, debts] = await Promise.all([
                getTotalBalance(user.id),
                getTotalAvailableBalance(user.id),
                getSavingsBalance(user.id),
                getGamificationData(user.id),
                getGoals(user.id),
                getDebts(user.id)
            ]);

            let recents = [];
            try {
                const { data } = await import('../services/transactionService').then(m => m.getTransactions(user.id, 3));
                recents = data || [];
            } catch (e) { }

            setFinances({ total, available, savings, recentTransactions: recents });
            setGamification(gamifData);
            setGoalsCount(goals.length);

            // Récupérer un lot de décrets
            const wisdomBatch = await getProactiveWisdom({ totalBalance: total, debts, goals });
            setDecreeBatch(Array.isArray(wisdomBatch) ? wisdomBatch : [wisdomBatch]);

            generateOracleAdvice(total, gamifData);
        } catch (error) {
            console.error("Dashboard error", error);
        } finally {
            setLoading(false);
        }
    };

    const generateOracleAdvice = async (balance, gamif) => {
        const advice = await getFinancialAdvice({
            balance,
            streak: gamif?.current_streak || 0
        });
        setOracleAdvice(advice);
    };

    const formatCurrency = (amount) => Math.round(amount).toLocaleString('fr-FR');
    const rank = gamification ? getCurrentRank(gamification.xp) : { name: 'Recrue', icon: '🎖️' };

    if (loading) return <div className="p-10 text-center animate-pulse text-amber-500">Chargement du QG...</div>;

    const currentDecree = decreeBatch[currentDecreeIndex] || "La sagesse est le premier pas vers la richesse.";

    return (
        <div className="space-y-6 fade-in pb-24">
            {/* HEADER: WELCOME + DECRET */}
            <div className="flex flex-col gap-4">
                {/* Welcome Card & Oracle Decree */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-purple-600/20 blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    <div className="card p-6 relative overflow-hidden bg-slate-950/80 border-amber-500/10">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Bot size={120} />
                        </div>

                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-2xl shadow-lg shadow-amber-900/40">
                                        {rank.icon}
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">Empire de</div>
                                        <div className="text-xl font-black text-white">{user.user_metadata?.username || 'Guerrier'}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-bold text-slate-500 uppercase">Rang Actuel</div>
                                    <div className="text-sm font-bold text-amber-200">{rank.name}</div>
                                </div>
                            </div>

                            {/* Oracle Decree - Rotating with AnimatePresence */}
                            <div className="bg-gradient-to-r from-amber-500/10 to-transparent border-l-2 border-amber-500 p-4 rounded-r-lg min-h-[80px] flex flex-col justify-center">
                                <div className="flex items-center gap-2 mb-1">
                                    <ScrollText size={14} className="text-amber-500" />
                                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Le Décret de l'Oracle</span>
                                </div>
                                <div className="overflow-hidden">
                                    <AnimatePresence mode="wait">
                                        <motion.p
                                            key={currentDecreeIndex}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.5 }}
                                            className="text-sm sm:text-base text-slate-200 leading-relaxed font-serif italic"
                                        >
                                            "{currentDecree}"
                                        </motion.p>
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Total Balance Card */}
                <div className="card-gold p-6 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 bg-amber-500/20 w-32 h-32 rounded-full blur-2xl group-hover:bg-amber-500/30 transition-all"></div>

                    <div>
                        <div className="flex items-center gap-2 text-amber-200/80 mb-1">
                            <Shield size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Patrimoine Total</span>
                        </div>
                        <div className="text-3xl font-mono font-bold text-white tracking-tight">
                            {formatCurrency(finances.total)} <span className="text-sm text-amber-500">FCFA</span>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-amber-500/10 flex justify-between items-end">
                        <div className="min-w-0">
                            <div className="text-[9px] text-amber-200/50 uppercase font-bold truncate">Disponible</div>
                            <div className="text-base font-bold text-white truncate">{formatCurrency(finances.available)}</div>
                        </div>
                        <div className="text-right min-w-0 pl-2">
                            <div className="text-[9px] text-amber-200/50 uppercase font-bold truncate">Épargne</div>
                            <div className="text-base font-bold text-emerald-400 flex items-center gap-1 justify-end truncate">
                                <Wallet size={12} />
                                {formatCurrency(finances.savings)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* QUICK STATS GRID */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatMetric
                    icon={<Zap size={20} className="text-yellow-400" />}
                    label="Mood"
                    value={`${gamification?.current_streak || 0} Jours`}
                    sub="Série en cours"
                />
                <StatMetric
                    icon={<Target size={20} className="text-blue-400" />}
                    label="Cibles"
                    value={goalsCount}
                    sub="Objectifs actifs"
                />
                <Link to="/transactions" className="card p-4 hover:bg-slate-800/50 transition-colors group cursor-pointer border border-dashed border-slate-700 hover:border-emerald-500/50 flex flex-col justify-center items-center text-center">
                    <div className="bg-emerald-500/20 p-3 rounded-full mb-2 group-hover:scale-110 transition-transform">
                        <TrendingUp className="text-emerald-400" size={24} />
                    </div>
                    <span className="text-xs font-bold text-emerald-400 uppercase">Ajouter Revenu</span>
                </Link>
                <Link to="/transactions" className="card p-4 hover:bg-slate-800/50 transition-colors group cursor-pointer border border-dashed border-slate-700 hover:border-rose-500/50 flex flex-col justify-center items-center text-center">
                    <div className="bg-rose-500/20 p-3 rounded-full mb-2 group-hover:scale-110 transition-transform">
                        <TrendingDown className="text-rose-400" size={24} />
                    </div>
                    <span className="text-xs font-bold text-rose-400 uppercase">Ajouter Dépense</span>
                </Link>
            </div>

            {/* RECENT ACTIVITY & GOALS PREVIEW */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="card p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Calendar className="text-slate-400" size={18} />
                            Activité Récente
                        </h3>
                        <Link to="/transactions" className="text-xs text-amber-500 hover:text-amber-400 flex items-center gap-1">
                            Voir tout <ArrowRight size={12} />
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {finances.recentTransactions.length > 0 ? (
                            finances.recentTransactions.map((t, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-slate-700 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                                            }`}>
                                            {t.type === 'income' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm text-white">
                                                {t.categories?.name || (t.type === 'income' ? 'Revenu' : 'Dépense')}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {new Date(t.timestamp).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`font-mono font-bold ${t.type === 'income' ? 'text-emerald-400' : 'text-slate-200'
                                        }`}>
                                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-500 text-sm">
                                Calme plat sur le front...
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions / Navigation */}
                <div className="grid grid-rows-2 gap-4">
                    <Link to="/goals" className="card relative overflow-hidden group p-6 flex flex-col justify-center hover:bg-slate-800/80 transition-all border-l-4 border-l-blue-500">
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Target size={80} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">Objectifs</h3>
                        <p className="text-sm text-slate-400 mb-4 max-w-[80%]">Visualisez vos cibles et suivez votre progression vers la richesse.</p>
                        <span className="text-xs font-bold text-blue-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                            Voir mes rêves <ArrowRight size={14} />
                        </span>
                    </Link>

                    <Link to="/ai-advisor" className="card relative overflow-hidden group p-6 flex flex-col justify-center hover:bg-slate-800/80 transition-all border-l-4 border-l-purple-500">
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Zap size={80} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">Conseiller IA</h3>
                        <p className="text-sm text-slate-400 mb-4 max-w-[80%]">Discutez stratégie avec l'Oracle pour optimiser vos finances.</p>
                        <span className="text-xs font-bold text-purple-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                            Consulter l'Oracle <ArrowRight size={14} />
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

// Mini Composant pour les stats simples
const StatMetric = ({ icon, label, value, sub }) => (
    <div className="card p-4 flex flex-col justify-between hover:bg-slate-800/40">
        <div className="flex justify-between items-start mb-2">
            <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{label}</div>
            <div className="opacity-80">{icon}</div>
        </div>
        <div>
            <div className="text-xl font-bold text-white tracking-tight">{value}</div>
            {sub && <div className="text-[10px] text-slate-500">{sub}</div>}
        </div>
    </div>
);

export default DashboardPage;

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wallet, TrendingUp, TrendingDown, Target,
    Zap, Calendar, ArrowRight, Shield, Bot, ScrollText, Flame, Crown, Gem, Sword,
    AlertCircle, Search, Trophy, Map
} from 'lucide-react';
import { useAuthStore } from '../store';
import { getTotalBalance, getTotalAvailableBalance, getSavingsBalance } from '../services/balanceService';
import { getTransactions, getHistoricalNetWorth } from '../services/transactionService';
import { getGamificationData, getCurrentRank } from '../services/gamificationService';
import { getGoals } from '../services/goalService';
import { getProactiveWisdom, detectFinancialLeaks } from '../services/aiService';
import { getDebts } from '../services/debtService';
import { getActiveMissions } from '../services/missionService';
import { Link } from 'react-router-dom';

// Composants de Guerre
import WarRoomChart from '../components/WarRoomChart';
import ConquestSimulator from '../components/ConquestSimulator';

const RICHE_LAWS = [
    { id: 1, text: "Commence à garnir ta bourse : Épargne 10% de tout ce que tu gagnes.", ref: "L'Homme le plus riche de Babylone" },
    { id: 2, text: "Contrôle tes denses : Ne confonds pas tes besoins avec tes désirs.", ref: "La Loi de la Richesse" },
    { id: 3, text: "Fais fructifier ton or : Ton capital doit travailler pour toi.", ref: "Sagesse Ancienne" }
];

const DashboardPage = () => {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [finances, setFinances] = useState({ total: 0, available: 0, savings: 0, recentTransactions: [] });
    const [gamification, setGamification] = useState(null);
    const [goalsCount, setGoalsCount] = useState(0);
    const [decreeBatch, setDecreeBatch] = useState([]);
    const [currentDecreeIndex, setCurrentDecreeIndex] = useState(0);
    const [currentLawIndex, setCurrentLawIndex] = useState(0);

    // Nouveaux Modules
    const [missions, setMissions] = useState([]);
    const [leakReport, setLeakReport] = useState(null);
    const [isAnalyzingLeaks, setIsAnalyzingLeaks] = useState(false);
    const [historicalData, setHistoricalData] = useState({ labels: [], values: [] });

    useEffect(() => {
        loadDashboardData();
        const lawTimer = setInterval(() => setCurrentLawIndex(prev => (prev + 1) % RICHE_LAWS.length), 20000);
        return () => clearInterval(lawTimer);
    }, [user.id]);

    const loadDashboardData = async () => {
        try {
            // Étape 1 : Charger les données vitales en parallèle (Vitesse de Guerre)
            const [total, available, savings, gamifData, goals, debts, transactionsData, historical] = await Promise.all([
                getTotalBalance(user.id),
                getTotalAvailableBalance(user.id),
                getSavingsBalance(user.id),
                getGamificationData(user.id),
                getGoals(user.id),
                getDebts(user.id),
                getTransactions(user.id, 5).catch(() => ({ data: [] })),
                getHistoricalNetWorth(user.id)
            ]);

            const recents = transactionsData?.data || [];

            // Étape 2 : Mettre à jour l'interface immédiatement
            setFinances({ total, available, savings, recentTransactions: recents });
            setGamification(gamifData);
            setGoalsCount(goals.length);
            setMissions(getActiveMissions(gamifData?.xp || 0));
            setHistoricalData(historical);

            // Étape 3 : Libérer l'interface (Finn du chargement bloquant)
            setLoading(false);

            // Étape 4 : Charger la Sagesse de l'Oracle en arrière-plan (Post-rendu)
            getProactiveWisdom({ totalBalance: total, debts, goals })
                .then(wisdomBatch => {
                    setDecreeBatch(Array.isArray(wisdomBatch) ? wisdomBatch : [wisdomBatch]);
                })
                .catch(err => console.error("Oracle error in background", err));

        } catch (error) {
            console.error("Dashboard error", error);
            setLoading(false);
        }
    };

    const runLeakDetection = async () => {
        setIsAnalyzingLeaks(true);
        try {
            const report = await detectFinancialLeaks(finances.recentTransactions);
            setLeakReport(report);
        } catch (error) { console.error(error); }
        finally { setIsAnalyzingLeaks(false); }
    };

    const formatCurrency = (amount) => Math.round(amount).toLocaleString('fr-FR');
    const rank = gamification ? getCurrentRank(gamification.xp) : { name: 'Recrue', icon: '🎖️' };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
                <Crown className="absolute inset-0 m-auto text-amber-500 animate-pulse" size={32} />
            </div>
            <p className="font-ancient text-amber-500 tracking-[0.3em] text-xs animate-pulse uppercase">DÉPLOIEMENT DU CENTRE DE COMMANDEMENT...</p>
        </div>
    );

    return (
        <div className="space-y-12 fade-in pb-24 max-w-7xl mx-auto px-4">

            {/* --- TOP BANNER: RANK & WEALTH --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="card-warrior p-6 bg-slate-950/60 flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-4xl shadow-2xl border border-amber-300/30">
                        {rank.icon}
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] font-ancient">Monarque Impérial</div>
                        <h2 className="text-3xl font-black text-white font-ancient tracking-tight uppercase">{user.user_metadata?.username || 'Guerrier'}</h2>
                        <div className="rank-badge mt-2">{rank.name}</div>
                    </div>
                </div>

                <div className="lg:col-span-2 card-warrior p-6 bg-gradient-to-r from-slate-900 to-slate-950 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <div className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] font-ancient flex items-center gap-2">
                            <Gem size={14} /> Trésorerie de l'Empire
                        </div>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="heading-gold text-5xl">{formatCurrency(finances.total)}</span>
                            <span className="text-amber-500 font-ancient font-bold text-sm">FCFA</span>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Link to="/transactions" className="btn-empire-primary px-6 text-xs">NOUVELLE CONQUÊTE</Link>
                    </div>
                </div>
            </div>

            {/* --- MODULE 1: THE WAR ROOM (Graphique) --- */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <Map size={24} className="text-amber-500" />
                    <h3 className="text-xl font-ancient font-black text-white tracking-[0.2em] uppercase">La War Room</h3>
                </div>
                <div className="card-warrior p-8 h-[400px]">
                    <WarRoomChart dataPoints={historicalData} />
                </div>
            </div>

            {/* --- MODULE 2 & 3: LEAKS & MISSIONS --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Détecteur de Fuites */}
                <div className="card-warrior p-8 bg-rose-950/5 border-rose-500/20">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-ancient font-black text-white tracking-widest flex items-center gap-2">
                            <Search size={18} className="text-rose-500" /> DÉTECTEUR DE FUITES
                        </h3>
                        <button
                            onClick={runLeakDetection}
                            disabled={isAnalyzingLeaks}
                            className={`p-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all ${isAnalyzingLeaks ? 'animate-spin' : ''}`}
                        >
                            <Zap size={16} />
                        </button>
                    </div>

                    {leakReport ? (
                        <div className="bg-slate-950/80 p-6 rounded-2xl border border-rose-500/20 prose prose-invert prose-xs max-w-none">
                            <div className="whitespace-pre-wrap font-ancient text-slate-300 italic text-sm">
                                {leakReport}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 flex flex-col items-center">
                            <AlertCircle size={40} className="text-slate-800 mb-4" />
                            <p className="text-xs text-slate-500 uppercase font-black tracking-widest">Aucune analyse de sabotage en cours</p>
                            <button onClick={runLeakDetection} className="mt-4 text-rose-500 font-bold text-xs hover:underline uppercase tracking-widest">Lancer le scan de l'Oracle</button>
                        </div>
                    )}
                </div>

                {/* Missions de Guerre */}
                <div className="card-warrior p-8 bg-amber-500/5 border-amber-500/20">
                    <h3 className="font-ancient font-black text-white tracking-widest flex items-center gap-2 mb-6 uppercase">
                        <Trophy size={18} className="text-amber-500" /> Missions Royales
                    </h3>
                    <div className="space-y-4">
                        {missions.map(m => (
                            <div key={m.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-950/40 border border-white/5 hover:border-amber-500/30 transition-all group">
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl">{m.icon}</span>
                                    <div>
                                        <div className="font-ancient font-bold text-sm text-white group-hover:text-amber-500 transition-colors uppercase">{m.title}</div>
                                        <div className="text-[10px] text-slate-500 leading-tight mt-0.5">{m.description}</div>
                                    </div>
                                </div>
                                <div className="text-amber-500 font-mono font-black text-xs">+{m.reward} XP</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- MODULE 4: CONQUEST SIMULATOR --- */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <Map size={24} className="text-orange-500" />
                    <h3 className="text-xl font-ancient font-black text-white tracking-[0.2em] uppercase">Projection de Puissance</h3>
                </div>
                <ConquestSimulator initialBalance={finances.total} />
            </div>

            {/* --- MODULE 5: LAWS & JOURNAL --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Journal des Conquêtes */}
                <div className="lg:col-span-2 card-warrior p-8">
                    <h3 className="text-lg font-ancient font-black text-white mb-8 tracking-widest uppercase flex items-center gap-3">
                        <Sword size={20} className="text-slate-500" /> Journal des Conquêtes
                    </h3>
                    <div className="space-y-3">
                        {finances.recentTransactions.slice(0, 5).map((t, idx) => (
                            <div key={idx} className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5 hover:border-amber-500/20 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                        <Wallet size={16} />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-white uppercase font-ancient">{t.categories?.name || (t.type === 'income' ? 'REVENU' : 'DÉPENSE')}</div>
                                        <div className="text-[10px] text-slate-500 font-mono">{new Date(t.timestamp).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <span className={`font-mono font-black ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                </span>
                            </div>
                        ))}
                        {finances.recentTransactions.length === 0 && (
                            <p className="text-center py-8 text-slate-600 font-ancient text-xs">Aucune conquête récente inscrite dans les registres.</p>
                        )}
                    </div>
                </div>

                {/* Les Lois Sacrées */}
                <div className="card-warrior p-8 bg-amber-500/5 relative overflow-hidden flex flex-col justify-between border-amber-500/20">
                    <div>
                        <h3 className="font-ancient font-black text-white tracking-widest mb-4 uppercase flex items-center gap-2">
                            <ScrollText size={18} className="text-amber-500" /> Les Lois Sacrées
                        </h3>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentLawIndex}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="italic font-ancient text-amber-200/80 leading-relaxed text-sm p-4 bg-amber-500/5 rounded-xl border border-amber-500/10"
                            >
                                "{RICHE_LAWS[currentLawIndex].text}"
                            </motion.div>
                        </AnimatePresence>
                    </div>
                    <Link to="/ai-advisor" className="btn-empire-primary w-full mt-6 text-center text-[10px] py-4">CONSULTER L'ORACLE</Link>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;

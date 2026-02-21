import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wallet, TrendingUp, TrendingDown, Target,
    Zap, Calendar, ArrowRight, Shield, Bot, ScrollText, Flame, Crown, Gem, Sword,
    AlertCircle, Search, Trophy, Map, BookOpen, Lock, CheckCircle2, Brain
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
import { useCurrency } from '../hooks/useCurrency';

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
    const { formatCurrency } = useCurrency();

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
                <div className="card-warrior p-6 flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-4xl shadow-2xl border border-amber-300/30">
                        {rank.icon}
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] font-ancient">Monarque Impérial</div>
                        <h2 className="text-3xl font-black text-[var(--text-main)] font-ancient tracking-tight uppercase">{user.user_metadata?.username || 'Guerrier'}</h2>
                        <div className="rank-badge mt-2">{rank.name}</div>
                    </div>
                </div>

                <div className="lg:col-span-2 card-warrior p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <div className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] font-ancient flex items-center gap-2">
                            <Gem size={14} /> Trésorerie de l'Empire
                        </div>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="heading-gold text-5xl">{formatCurrency(finances.total)}</span>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Link to="/allocation" className="btn-empire text-xs flex items-center gap-2">
                            <Flame size={14} /> RAPPORT DE BUTIN
                        </Link>
                        <Link to="/transactions" className="btn-empire-primary px-6 text-xs">NOUVELLE CONQUÊTE</Link>
                    </div>
                </div>
            </div>

            {/* --- MOTIVATIONAL ORACLE & LAWS (NEW POSITION AT TOP) --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-3 card-warrior p-8 bg-amber-500/5 relative overflow-hidden border-amber-500/20 shadow-[0_0_50px_-12px_rgba(245,158,11,0.1)]">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <ScrollText size={120} className="text-amber-500 rotate-12" />
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                        <div className="flex-shrink-0 w-24 h-24 rounded-full border-4 border-amber-500/20 flex items-center justify-center shadow-lg bg-amber-500/5 animate-pulse">
                            <Bot size={40} className="text-amber-500" />
                        </div>

                        <div className="flex-grow space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] font-ancient">Directives de l'Oracle</span>
                                <div className="h-px flex-grow bg-gradient-to-r from-amber-500/30 to-transparent"></div>
                            </div>

                            <AnimatePresence mode="wait">
                                {decreeBatch.length > 0 ? (
                                    <motion.div
                                        key={`decree-${currentDecreeIndex}`}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-2"
                                    >
                                        <p className="text-xl lg:text-3xl font-ancient font-black text-[var(--text-main)] italic leading-tight">
                                            "{decreeBatch[currentDecreeIndex]}"
                                        </p>
                                        <div className="flex items-center gap-2 text-amber-500/60 font-ancient text-[10px] uppercase tracking-widest">
                                            <Zap size={12} /> Décret Stratégique Actif
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key={`law-${currentLawIndex}`}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-2"
                                    >
                                        <p className="text-xl lg:text-3xl font-ancient font-black text-[var(--text-main)] italic leading-tight">
                                            "{RICHE_LAWS[currentLawIndex].text}"
                                        </p>
                                        <div className="flex items-center gap-2 text-amber-500/60 font-ancient text-[10px] uppercase tracking-widest">
                                            <ScrollText size={12} /> Loi de {RICHE_LAWS[currentLawIndex].ref}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="flex-shrink-0">
                            <Link to="/ai-advisor" className="btn-empire px-8 py-4 text-xs font-black tracking-[0.2em]">CONSULTER L'ORACLE</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- STRATÈGE COMMAND CENTER --- */}
            <StrategeCommandCenter />

            {/* --- MODULE 1: THE WAR ROOM (Graphique) --- */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <Map size={24} className="text-amber-500" />
                    <h3 className="text-xl font-ancient font-black text-[var(--text-main)] tracking-[0.2em] uppercase">La War Room</h3>
                </div>
                <div className="card-warrior p-8 h-[400px]">
                    <WarRoomChart dataPoints={historicalData} />
                </div>
            </div>

            {/* --- MODULE 2 & 3: LEAKS & MISSIONS --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Détecteur de Fuites */}
                <div className="card-warrior p-8 bg-rose-500/5 border-rose-500/20">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-ancient font-black text-[var(--text-main)] tracking-widest flex items-center gap-2">
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

            {/* --- MODULE 5: JOURNAL --- */}
            <div className="grid grid-cols-1 gap-8">
                {/* Journal des Conquêtes */}
                <div className="card-warrior p-8">
                    <h3 className="text-lg font-ancient font-black text-white mb-8 tracking-widest uppercase flex items-center gap-3">
                        <Sword size={20} className="text-slate-500" /> Journal des Conquêtes
                    </h3>
                    <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {finances.recentTransactions.slice(0, 6).map((t, idx) => (
                            <div key={idx} className="flex justify-between items-center p-5 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-amber-500/20 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                        <Wallet size={18} />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-white uppercase font-ancient">{t.categories?.name || (t.type === 'income' ? 'REVENU' : 'DÉPENSE')}</div>
                                        <div className="text-[10px] text-slate-500 font-mono italic">{new Date(t.timestamp).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</div>
                                    </div>
                                </div>
                                <span className={`font-mono font-black text-lg ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                </span>
                            </div>
                        ))}
                    </div>
                    {finances.recentTransactions.length === 0 && (
                        <p className="text-center py-12 text-slate-700 font-ancient text-xs italic">Les registres des conquêtes sont vierges pour le moment.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;

// ============================================================
// STRATÈGE COMMAND CENTER — Widget autonome
// ============================================================
const DAILY_CHECKS = [
    { id: 'no_impulse', icon: '🛡️', text: 'Zéro dépense impulsive aujourd\'hui' },
    { id: 'log_all', icon: '📝', text: 'J\'ai loggé toutes mes transactions' },
    { id: 'asset_mode', icon: '🔒', text: 'Mon prochain gain va en actif, pas en confort' },
    { id: 'growth_act', icon: '📈', text: 'J\'ai fait 1 action pour mon business aujourd\'hui' },
];

const FUND_DEFS = [
    { key: 'security', label: 'Sécurité', icon: '🔒', color: 'blue', targetKey: 'target' },
    { key: 'business', label: 'Business', icon: '📈', color: 'amber', targetKey: 'target' },
    { key: 'equipment', label: 'Équipement', icon: '🔧', color: 'orange', targetKey: 'target' },
];

const COLOR_FUND = {
    blue: { bar: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500/20', bg: 'bg-blue-500/10' },
    amber: { bar: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/10' },
    orange: { bar: 'bg-orange-500', text: 'text-orange-400', border: 'border-orange-500/20', bg: 'bg-orange-500/10' },
};

const todayKey = () => new Date().toISOString().slice(0, 10);
const fmtK = n => {
    const v = Math.round(n || 0);
    return v >= 1000 ? (v / 1000).toFixed(0) + 'k' : String(v);
};

function StrategeCommandCenter() {
    const { formatCurrency } = useCurrency();
    const storageKey = `dash_strat_${todayKey()}`;
    const [checks, setChecks] = useState(() => {
        try { return JSON.parse(localStorage.getItem(storageKey)) || []; }
        catch { return []; }
    });
    const [funds, setFunds] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('strat_funds')) || {
                security: { current: 0, target: 300000 },
                business: { current: 0, target: 500000 },
                equipment: { current: 0, target: 200000 },
            };
        } catch { return { security: { current: 0, target: 300000 }, business: { current: 0, target: 500000 }, equipment: { current: 0, target: 200000 } }; }
    });

    const toggle = (id) => {
        const next = checks.includes(id) ? checks.filter(c => c !== id) : [...checks, id];
        setChecks(next);
        localStorage.setItem(storageKey, JSON.stringify(next));
    };

    const score = checks.length;
    const scoreColor = score === 4 ? 'text-emerald-400' : score >= 2 ? 'text-amber-400' : 'text-slate-600';
    const scoreLabel = score === 4 ? 'Discipline parfaite ⚔️' : score >= 2 ? `${score}/4 — Continue` : score > 0 ? `${score}/4 — Mobilise-toi` : 'Non démarré';

    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="space-y-4">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Sword size={22} className="text-rose-400" />
                    <h3 className="text-xl font-ancient font-black text-white tracking-[0.2em] uppercase">Stratège Command Center</h3>
                </div>
                <div className={`text-[9px] font-black uppercase tracking-widest ${scoreColor}`}>{scoreLabel}</div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* ── Checklist discipline du jour ── */}
                <div className="card-warrior p-6 bg-slate-900/60">
                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Brain size={12} className="text-purple-400" /> Discipline — {todayKey()}
                    </div>
                    <div className="space-y-2">
                        {DAILY_CHECKS.map((item) => {
                            const done = checks.includes(item.id);
                            return (
                                <button key={item.id} onClick={() => toggle(item.id)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${done ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-slate-950/40 border-slate-800 hover:border-slate-600'
                                        }`}>
                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-700'
                                        }`}>
                                        {done && <CheckCircle2 size={14} className="text-slate-950" />}
                                    </div>
                                    <span className="mr-1">{item.icon}</span>
                                    <span className={`text-[10px] font-bold ${done ? 'text-white line-through opacity-70' : 'text-slate-500'}`}>{item.text}</span>
                                </button>
                            );
                        })}
                    </div>
                    {score === 4 && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                            className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                            <div className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                                ✓ Journée d'opérateur validée — Fonds autorisés à croître
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* ── 3 Fonds Inviolables ── */}
                <div className="card-warrior p-6 bg-slate-900/60">
                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Lock size={12} className="text-blue-400" /> Fonds Inviolables
                    </div>
                    <div className="space-y-3">
                        {FUND_DEFS.map(f => {
                            const fd = funds[f.key] || {};
                            const cur = fd.current || 0;
                            const tgt = fd.target || 1;
                            const pct = Math.min(100, Math.round((cur / tgt) * 100));
                            const c = COLOR_FUND[f.color];
                            return (
                                <div key={f.key} className={`p-3 rounded-xl border ${c.border} ${c.bg}`}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-base">{f.icon}</span>
                                            <span className={`font-ancient font-black text-[9px] uppercase tracking-wider ${c.text}`}>{f.label}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className={`font-mono font-black text-[10px] ${c.text}`}>{formatCurrency(cur)}</span>
                                            <span className="text-[8px] text-slate-700"> / {formatCurrency(tgt)}</span>
                                        </div>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div className={`h-full ${c.bar} rounded-full`}
                                            initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} />
                                    </div>
                                    <div className="text-right text-[7px] text-slate-700 font-black mt-0.5">{pct}%</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── CTAs rapides ── */}
            <div className="grid grid-cols-3 gap-3">
                <Link to="/allocation?tab=distribute"
                    className="card-warrior p-4 flex flex-col items-center gap-2 border-amber-500/20 hover:bg-amber-500/10 hover:border-amber-500/40 transition-all group">
                    <Flame size={20} className="text-amber-500" />
                    <div className="text-[8px] font-black text-slate-500 group-hover:text-amber-400 uppercase tracking-widest text-center transition-colors">Distribuer<br />un revenu</div>
                </Link>
                <Link to="/allocation"
                    className="card-warrior p-4 flex flex-col items-center gap-2 border-blue-500/20 hover:bg-blue-500/10 hover:border-blue-500/40 transition-all group">
                    <Shield size={20} className="text-blue-400" />
                    <div className="text-[8px] font-black text-slate-500 group-hover:text-blue-400 uppercase tracking-widest text-center transition-colors">Blueprint<br />des Blocs</div>
                </Link>
                <Link to="/academie?tab=stratege"
                    className="card-warrior p-4 flex flex-col items-center gap-2 border-rose-500/20 hover:bg-rose-500/10 hover:border-rose-500/40 transition-all group">
                    <BookOpen size={20} className="text-rose-400" />
                    <div className="text-[8px] font-black text-slate-500 group-hover:text-rose-400 uppercase tracking-widest text-center transition-colors">Académie<br />Stratège</div>
                </Link>
            </div>
        </motion.div>
    );
}

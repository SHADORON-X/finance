import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp, TrendingDown, Plus, Filter, Search,
    ArrowUpRight, ArrowDownLeft, Trash2,
    Sparkles, X, Target, Wallet, Briefcase, Gift, Sword, Gem, AlertCircle
} from 'lucide-react';
import { useAuthStore } from '../store';
import { getTransactions, createIncome, createExpense, deleteTransaction, getTransactionStats } from '../services/transactionService';
import { getCategories } from '../services/balanceService';
import { getGoals, contributeToGoal } from '../services/goalService';
import { analyzeTransaction } from '../services/aiService';
import toast from 'react-hot-toast';

const INCOME_SOURCES = [
    { id: 'salary', name: 'Salaire', icon: <Briefcase size={20} />, color: 'emerald' },
    { id: 'business', name: 'Business', icon: <TrendingUp size={20} />, color: 'blue' },
    { id: 'gift', name: 'Cadeau', icon: <Gift size={20} />, color: 'purple' },
    { id: 'other', name: 'Autre', icon: <Wallet size={20} />, color: 'slate' }
];

const TransactionsPage = () => {
    const { user } = useAuthStore();
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0, netBalance: 0 });
    const [categories, setCategories] = useState([]);
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [transactionType, setTransactionType] = useState('expense');
    const [searchTerm, setSearchTerm] = useState('');

    const [amount, setAmount] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [sourceId, setSourceId] = useState('salary');
    const [goalId, setGoalId] = useState('');
    const [note, setNote] = useState('');

    useEffect(() => {
        if (user) loadData();
    }, [user]);

    const loadData = async () => {
        try {
            const [transData, catsData, statsData, goalsData] = await Promise.all([
                getTransactions(user.id, 50),
                getCategories(user.id),
                getTransactionStats(user.id),
                getGoals(user.id)
            ]);
            setTransactions(transData);
            setCategories(catsData);
            setGoals(goalsData);
            setStats(statsData);
            if (catsData.length > 0) setCategoryId(catsData[0].id);
            if (goalsData.length > 0) setGoalId(goalsData[0].id);
        } catch (error) {
            toast.error("Échec des archives");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTransaction = async (e) => {
        e.preventDefault();
        try {
            const val = parseFloat(amount);
            if (isNaN(val) || val <= 0) return toast.error("Montant invalide");

            const loadingToast = toast.loading("Enregistrement de la conquête...");
            if (transactionType === 'income') {
                await createIncome(user.id, val, []);
                toast.success(`Trésor augmenté de ${formatCurrency(val)} !`, { id: loadingToast });
            } else if (transactionType === 'expense') {
                if (!categoryId) return toast.error("Catégorie requise");
                await createExpense(user.id, val, categoryId, note);
                toast.success("Dépense stratégique enregistrée", { id: loadingToast });
            } else if (transactionType === 'goal') {
                if (!goalId) return toast.error("Objectif requis");
                await contributeToGoal(goalId, user.id, val);
                toast.success("Renfort envoyé vers l'objectif !", { id: loadingToast });
            }

            setIsAddModalOpen(false);
            setAmount('');
            setNote('');
            loadData();
        } catch (error) {
            toast.error("Erreur de déploiement");
        }
    };

    const handleAnalyze = async (t) => {
        const toastId = toast.loading("L'Oracle médite...");
        try {
            const advice = await analyzeTransaction(t);
            toast.dismiss(toastId);
            toast((rt) => (
                <div className="flex items-start gap-3">
                    <div className="bg-amber-500/10 p-2 rounded-lg text-amber-500"><Sparkles size={24} /></div>
                    <div>
                        <h4 className="font-ancient font-black text-amber-500 text-xs tracking-widest uppercase">Décret de l'Oracle</h4>
                        <p className="text-sm text-slate-300 mt-1 italic font-ancient">"{advice}"</p>
                    </div>
                </div>
            ), { duration: 8000, style: { background: '#020617', border: '1px solid rgba(245, 158, 11, 0.4)', color: '#fff' } });
        } catch (e) { toast.error("L'Oracle est silencieux", { id: toastId }); }
    };

    const formatCurrency = (amount) => Math.round(amount).toLocaleString('fr-FR') + ' FCFA';

    const filteredTransactions = transactions.filter(t => {
        const matchesFilter = filter === 'all' || t.type === filter;
        const searchLower = searchTerm.toLowerCase();
        return matchesFilter && ((t.note || '').toLowerCase().includes(searchLower) || (t.categories?.name || '').toLowerCase().includes(searchLower));
    });

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Sword className="text-amber-500 animate-bounce" size={40} />
            <p className="font-ancient text-amber-500 text-[10px] tracking-[0.4em] uppercase">OUVERTURE DES ARCHIVES...</p>
        </div>
    );

    return (
        <div className="pb-32 px-4 pt-8 max-w-6xl mx-auto space-y-10">

            {/* Header: Imperial Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card-warrior p-6 bg-slate-900/60 border-blue-500/20">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-ancient font-black text-slate-500 tracking-widest uppercase">Bilan Net</span>
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Gem size={16} /></div>
                    </div>
                    <div className={`text-3xl font-ancient font-black ${stats.netBalance >= 0 ? 'text-white' : 'text-rose-400'}`}>
                        {formatCurrency(stats.netBalance)}
                    </div>
                    <div className="h-1 w-full bg-slate-800 rounded-full mt-4 overflow-hidden">
                        <div className="h-full bg-blue-500 w-[70%]" />
                    </div>
                </div>

                <div className="card-warrior p-6 bg-slate-900/60 border-emerald-500/20">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-ancient font-black text-slate-500 tracking-widest uppercase">Perceptions</span>
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><TrendingUp size={16} /></div>
                    </div>
                    <div className="text-3xl font-ancient font-black text-emerald-400">
                        +{formatCurrency(stats.totalIncome)}
                    </div>
                    <p className="text-[10px] text-slate-600 font-bold mt-2 uppercase">Gains de campagne</p>
                </div>

                <div className="card-warrior p-6 bg-slate-900/60 border-rose-500/20">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-ancient font-black text-slate-500 tracking-widest uppercase">Offrandes & Logistique</span>
                        <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500"><TrendingDown size={16} /></div>
                    </div>
                    <div className="text-3xl font-ancient font-black text-rose-400">
                        -{formatCurrency(stats.totalExpense)}
                    </div>
                    <p className="text-[10px] text-slate-600 font-bold mt-2 uppercase">Coûts de fonctionnement</p>
                </div>
            </div>

            {/* Actions & Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between sticky top-6 z-20">
                <div className="card-warrior p-2 flex items-center gap-4 w-full md:w-auto bg-slate-950/90 backdrop-blur-md border-amber-500/20">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text" placeholder="RECHERCHER DANS LES ARCHIVES..."
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-transparent border-none pl-10 pr-4 py-2 text-[10px] font-ancient font-bold tracking-widest focus:ring-0 text-white placeholder-slate-700"
                        />
                    </div>
                    <div className="h-4 w-[1px] bg-white/10 hidden md:block"></div>
                    <div className="flex items-center gap-1">
                        {['all', 'income', 'expense'].map(f => (
                            <button
                                key={f} onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 rounded-lg text-[9px] font-ancient font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-amber-500 text-slate-950' : 'text-slate-500 hover:text-white'}`}
                            >
                                {f === 'all' ? 'Tout' : f === 'income' ? 'Gains' : 'Coûts'}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={() => { setTransactionType('expense'); setIsAddModalOpen(true); }}
                    className="btn-empire-primary w-full md:w-auto flex items-center justify-center gap-2"
                >
                    <Plus size={18} /> INSCRIRE UNE CONQUÊTE
                </button>
            </div>

            {/* List of Transactions */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {filteredTransactions.map((t, idx) => (
                        <motion.div
                            key={t.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                            className="card-warrior p-5 bg-slate-950/40 border-white/5 group hover:border-amber-500/30 overflow-visible relative"
                        >
                            <div className="flex items-center gap-6">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border ${t.type === 'income' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
                                    {t.type === 'income' ? <TrendingUp size={24} /> : (t.categories?.icon || <Sword size={24} />)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-ancient font-black text-white group-hover:text-amber-500 transition-colors uppercase tracking-widest">
                                                {t.type === 'income' ? (t.note || 'REVENU IMPÉRIAL') : (t.categories?.name || 'LOGISTIQUE')}
                                            </h4>
                                            <p className="text-[10px] font-mono text-slate-500 uppercase mt-1">
                                                {new Date(t.timestamp).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-xl font-mono font-black ${t.type === 'income' ? 'text-emerald-400' : 'text-slate-200'}`}>
                                                {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                            </div>
                                            {t.type === 'expense' && <div className="text-[9px] text-slate-600 font-bold uppercase mt-1">Sortie de trésorerie</div>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Hover Actions */}
                            <div className="absolute -right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex flex-col gap-2 transition-all group-hover:translate-x-full pr-4">
                                <button onClick={() => handleAnalyze(t)} className="p-3 bg-amber-500 text-slate-950 rounded-xl shadow-lg border border-amber-400 hover:scale-110 active:scale-95 transition-all"><Sparkles size={16} /></button>
                                <button onClick={() => { }} className="p-3 bg-slate-900 text-rose-500 rounded-xl shadow-lg border border-rose-500/20 hover:scale-110 active:scale-95 transition-all"><Trash2 size={16} /></button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Modal de Conquête (Add Transaction) */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card-warrior w-full max-w-xl p-8 bg-slate-900 border-amber-500/20 relative">
                            <button onClick={() => setIsAddModalOpen(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X size={24} /></button>

                            <h2 className="heading-gold text-2xl mb-8">NOUVELLE CONQUÊTE</h2>

                            <form onSubmit={handleCreateTransaction} className="space-y-8">
                                <div>
                                    <label className="text-[10px] font-ancient font-black text-slate-500 uppercase tracking-widest mb-3 block">Volume du Trésor</label>
                                    <div className="relative">
                                        <input
                                            type="number" value={amount} onChange={e => setAmount(e.target.value)}
                                            className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-6 py-6 text-4xl font-mono text-white focus:border-amber-500 transition-all placeholder-slate-800"
                                            placeholder="0" autoFocus required
                                        />
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 font-ancient font-bold">FCFA</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    {['expense', 'income', 'goal'].map(type => (
                                        <button
                                            key={type} type="button" onClick={() => setTransactionType(type)}
                                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${transactionType === type ? 'border-amber-500 bg-amber-500/10 text-white' : 'border-slate-800 bg-slate-950 text-slate-600'}`}
                                        >
                                            {type === 'expense' ? <TrendingDown /> : type === 'income' ? <TrendingUp /> : <Target />}
                                            <span className="text-[9px] font-ancient font-bold uppercase tracking-widest">{type === 'expense' ? 'Coût' : type === 'income' ? 'Gain' : 'Cible'}</span>
                                        </button>
                                    ))}
                                </div>

                                {transactionType === 'expense' && (
                                    <div>
                                        <label className="text-[10px] font-ancient font-black text-slate-500 uppercase tracking-widest mb-3 block">Secteur de dépense</label>
                                        <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                            {categories.map(cat => (
                                                <button key={cat.id} type="button" onClick={() => setCategoryId(cat.id)} className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all ${categoryId === cat.id ? 'border-rose-500 bg-rose-500/10' : 'border-slate-800'}`}>
                                                    <span className="text-xl">{cat.icon}</span>
                                                    <span className="text-[8px] font-bold uppercase mt-1 text-slate-500">{cat.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="text-[10px] font-ancient font-black text-slate-500 uppercase tracking-widest mb-3 block">Observation tactique</label>
                                    <input type="text" value={note} onChange={e => setNote(e.target.value)} className="w-full bg-slate-950 border-2 border-slate-800 rounded-xl px-4 py-4 text-white font-ancient text-sm" placeholder="NOTE DE CAMPAGNE..." />
                                </div>

                                <button type="submit" className="btn-empire-primary w-full py-5 text-lg">SCELLER LA CONQUÊTE</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TransactionsPage;

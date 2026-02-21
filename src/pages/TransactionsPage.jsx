import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp, TrendingDown, Plus, Filter, Search,
    ArrowUpRight, Trash2,
    Sparkles, X, Target, Wallet, Briefcase, Gift, Sword, Gem, AlertCircle, ShieldAlert
} from 'lucide-react';
import { useAuthStore } from '../store';
import { getTransactions, createIncome, createExpense, deleteTransaction, getTransactionStats } from '../services/transactionService';
import { getCategories } from '../services/balanceService';
import { getGoals, contributeToGoal } from '../services/goalService';
import { getDebts, addDebtPayment } from '../services/debtService';
import { analyzeTransaction } from '../services/aiService';
import toast from 'react-hot-toast';
import { useCurrency } from '../hooks/useCurrency';

const TransactionsPage = () => {
    const { user } = useAuthStore();
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0, netBalance: 0 });
    const [categories, setCategories] = useState([]);
    const [goals, setGoals] = useState([]);
    const [debts, setDebts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [transactionType, setTransactionType] = useState('income');
    const [searchTerm, setSearchTerm] = useState('');

    const [amount, setAmount] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [goalId, setGoalId] = useState('');
    const [debtId, setDebtId] = useState('');
    const [note, setNote] = useState('');

    const { formatCurrency } = useCurrency();

    useEffect(() => {
        if (user) loadData();
    }, [user]);

    const loadData = async () => {
        try {
            const [transData, catsData, statsData, goalsData, debtsData] = await Promise.all([
                getTransactions(user.id, 50),
                getCategories(user.id),
                getTransactionStats(user.id),
                getGoals(user.id),
                getDebts(user.id)
            ]);
            setTransactions(transData);
            setCategories(catsData);
            setGoals(goalsData);
            setStats(statsData);
            setDebts(debtsData.filter(d => d.status === 'active' && d.remaining_amount > 0));
            if (catsData.length > 0) setCategoryId(catsData[0].id);
            if (goalsData.length > 0) setGoalId(goalsData[0].id);
            if (debtsData.length > 0) setDebtId(debtsData[0].id);
        } catch (error) {
            toast.error("Échec du chargement des archives");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTransaction = async (e) => {
        e.preventDefault();
        const val = parseFloat(amount);
        if (isNaN(val) || val <= 0) return toast.error("Montant invalide");

        const loadingToast = toast.loading("Enregistrement en cours...");
        try {
            if (transactionType === 'income') {
                // Distribuer dans les VRAIES catégories avec leurs vrais pourcentages
                const categoriesWithPercent = categories.filter(c => c.percent > 0);
                await createIncome(user.id, val, categoriesWithPercent);
                toast.success(`+${formatCurrency(val)} distribués dans ${categoriesWithPercent.length} secteurs`, { id: loadingToast });

            } else if (transactionType === 'expense') {
                if (!categoryId) return toast.error("Sélectionne un secteur");
                await createExpense(user.id, val, categoryId, note);
                const cat = categories.find(c => c.id === categoryId);
                toast.success(`Dépense de ${formatCurrency(val)} sur "${cat?.name}"`, { id: loadingToast });

            } else if (transactionType === 'goal') {
                if (!goalId) return toast.error("Sélectionne un objectif");
                await contributeToGoal(goalId, user.id, val, note);
                const g = goals.find(g => g.id === goalId);
                toast.success(`${formatCurrency(val)} vers "${g?.title}" !`, { id: loadingToast });

            } else if (transactionType === 'debt') {
                if (!debtId) return toast.error("Sélectionne une dette");
                const debt = debts.find(d => d.id === debtId);
                const payAmount = Math.min(val, debt.remaining_amount);
                await addDebtPayment(debtId, user.id, payAmount, debt.creditor_name);
                toast.success(`${formatCurrency(payAmount)} remboursés à "${debt.creditor_name}" !`, { id: loadingToast });
            }

            setIsAddModalOpen(false);
            setAmount('');
            setNote('');
            loadData();
        } catch (error) {
            toast.error("Erreur lors de l'enregistrement", { id: loadingToast });
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

    const filteredTransactions = transactions.filter(t => {
        const matchesFilter = filter === 'all' || t.type === filter;
        const searchLower = searchTerm.toLowerCase();
        return matchesFilter && ((t.note || '').toLowerCase().includes(searchLower) || (t.categories?.name || '').toLowerCase().includes(searchLower));
    });

    // Distribution preview pour un revenu
    const incomeAmount = parseFloat(amount) || 0;
    const distributionPreview = categories
        .filter(c => c.percent > 0)
        .map(c => ({ ...c, allocation: Math.round(incomeAmount * c.percent / 100) }));

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Sword className="text-amber-500 animate-bounce" size={40} />
            <p className="font-ancient text-amber-500 text-[10px] tracking-[0.4em] uppercase">Ouverture des archives...</p>
        </div>
    );

    return (
        <div className="pb-32 px-4 pt-8 max-w-6xl mx-auto space-y-10">

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card-warrior p-6 bg-slate-900/60 border-blue-500/20">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-ancient font-black text-slate-500 tracking-widest uppercase">Bilan Net</span>
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Gem size={16} /></div>
                    </div>
                    <div className={`text-3xl font-ancient font-black ${stats.netBalance >= 0 ? 'text-white' : 'text-rose-400'}`}>
                        {formatCurrency(stats.netBalance)}
                    </div>
                </div>
                <div className="card-warrior p-6 bg-slate-900/60 border-emerald-500/20">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-ancient font-black text-slate-500 tracking-widest uppercase">Perceptions</span>
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><TrendingUp size={16} /></div>
                    </div>
                    <div className="text-3xl font-ancient font-black text-emerald-400">+{formatCurrency(stats.totalIncome)}</div>
                    <p className="text-[10px] text-slate-600 font-bold mt-2 uppercase">Gains de campagne</p>
                </div>
                <div className="card-warrior p-6 bg-slate-900/60 border-rose-500/20">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-ancient font-black text-slate-500 tracking-widest uppercase">Offrandes & Logistique</span>
                        <div className="p-2 bg-rose-500/10 rounded-lg text-rose-500"><TrendingDown size={16} /></div>
                    </div>
                    <div className="text-3xl font-ancient font-black text-rose-400">-{formatCurrency(stats.totalExpense)}</div>
                    <p className="text-[10px] text-slate-600 font-bold mt-2 uppercase">Coûts de fonctionnement</p>
                </div>
            </div>

            {/* Filters & CTA */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between sticky top-6 z-20">
                <div className="card-warrior p-2 flex items-center gap-4 w-full md:w-auto bg-slate-950/90 backdrop-blur-md border-amber-500/20">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text" placeholder="Rechercher dans les archives..."
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-transparent border-none pl-10 pr-4 py-2 text-[10px] font-ancient font-bold tracking-widest focus:ring-0 text-white placeholder-slate-700"
                        />
                    </div>
                    <div className="h-4 w-[1px] bg-white/10 hidden md:block"></div>
                    <div className="flex items-center gap-1">
                        {['all', 'income', 'expense'].map(f => (
                            <button key={f} onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 rounded-lg text-[9px] font-ancient font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-amber-500 text-slate-950' : 'text-slate-500 hover:text-white'}`}>
                                {f === 'all' ? 'Tout' : f === 'income' ? 'Gains' : 'Coûts'}
                            </button>
                        ))}
                    </div>
                </div>
                <button
                    onClick={() => { setTransactionType('income'); setIsAddModalOpen(true); }}
                    className="btn-empire-primary w-full md:w-auto flex items-center justify-center gap-2"
                >
                    <Plus size={18} /> INSCRIRE UNE CONQUÊTE
                </button>
            </div>

            {/* Liste des transactions */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {filteredTransactions.map((t) => (
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
                                            {t.note && t.type !== 'income' && <p className="text-[9px] text-slate-600 mt-0.5 italic">{t.note}</p>}
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-xl font-mono font-black ${t.type === 'income' ? 'text-emerald-400' : 'text-slate-200'}`}>
                                                {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex flex-col gap-2 transition-all group-hover:translate-x-full pr-4">
                                <button onClick={() => handleAnalyze(t)} className="p-3 bg-amber-500 text-slate-950 rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all"><Sparkles size={16} /></button>
                                <button onClick={() => { if (confirm('Effacer ce registre ?')) deleteTransaction(t.id, user.id).then(() => loadData()) }} className="p-3 bg-slate-900 text-rose-500 rounded-xl shadow-lg border border-rose-500/20 hover:scale-110 active:scale-95 transition-all"><Trash2 size={16} /></button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                {filteredTransactions.length === 0 && (
                    <div className="text-center py-16 text-slate-700">
                        <Sword size={40} className="mx-auto mb-4 opacity-30" />
                        <p className="font-ancient text-sm uppercase tracking-widest">Aucun registre trouvé</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-[60] overflow-y-auto bg-slate-950/95 backdrop-blur-xl px-4 py-6 md:flex md:items-center md:justify-center">
                        <motion.div
                            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
                            className="card-warrior w-full max-w-xl p-6 md:p-8 bg-slate-900 border-amber-500/20 relative mx-auto"
                        >
                            <button onClick={() => setIsAddModalOpen(false)} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white bg-slate-800/50 rounded-full z-20">
                                <X size={20} />
                            </button>

                            <h2 className="heading-gold text-xl md:text-2xl mb-6 text-center md:text-left mt-2 uppercase">Déclaration de Butin</h2>

                            <form onSubmit={handleCreateTransaction} className="space-y-6">

                                {/* Type selector */}
                                <div className="grid grid-cols-4 gap-2">
                                    {[
                                        { id: 'income', label: 'Gain', icon: <TrendingUp size={16} />, color: 'emerald' },
                                        { id: 'expense', label: 'Coût', icon: <TrendingDown size={16} />, color: 'rose' },
                                        { id: 'goal', label: 'Objectif', icon: <Target size={16} />, color: 'blue' },
                                        { id: 'debt', label: 'Dette', icon: <ShieldAlert size={16} />, color: 'orange' },
                                    ].map(t => (
                                        <button
                                            key={t.id} type="button" onClick={() => setTransactionType(t.id)}
                                            className={`py-3 px-2 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all text-center ${transactionType === t.id
                                                ? 'border-amber-500 bg-amber-500/10 text-white'
                                                : 'border-slate-800 bg-slate-950 text-slate-600 hover:border-slate-700'}`}
                                        >
                                            <span className={transactionType === t.id ? 'text-amber-500' : 'text-slate-700'}>{t.icon}</span>
                                            <span className="text-[8px] font-ancient font-black uppercase tracking-widest leading-none">{t.label}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Amount */}
                                <div>
                                    <label className="text-[10px] font-ancient font-black text-slate-600 uppercase tracking-[0.2em] mb-2 block">Volume</label>
                                    <input
                                        type="number" value={amount} onChange={e => setAmount(e.target.value)}
                                        className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl px-6 py-5 text-3xl md:text-4xl font-mono text-white focus:border-amber-500 transition-all placeholder-slate-900 outline-none"
                                        placeholder="0" autoFocus required min="1"
                                    />
                                </div>

                                {/* === GAIN : preview distribution dynamique === */}
                                {transactionType === 'income' && incomeAmount > 0 && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                                        className="space-y-2 p-5 bg-slate-950 border border-amber-500/10 rounded-2xl">
                                        <div className="flex items-center gap-2 text-amber-500/60 text-[9px] font-black uppercase tracking-widest mb-3">
                                            <Sparkles size={12} /> Distribution dans tes {distributionPreview.length} secteurs
                                        </div>
                                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                                            {distributionPreview.map(cat => (
                                                <div key={cat.id} className="flex justify-between items-center text-[10px] py-1 border-b border-white/5 last:border-0">
                                                    <span className="text-slate-400 uppercase font-bold flex items-center gap-2">
                                                        <span>{cat.icon}</span> {cat.name}
                                                        <span className="text-slate-700">({cat.percent}%)</span>
                                                    </span>
                                                    <span className="text-white font-mono font-bold">+{formatCurrency(cat.allocation)}</span>
                                                </div>
                                            ))}
                                            {distributionPreview.length === 0 && (
                                                <p className="text-[10px] text-rose-500 font-bold text-center py-2">⚠️ Aucun secteur avec un % défini. Configure l'allocation d'abord.</p>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {/* === DÉPENSE : grille de catégories réelles === */}
                                {transactionType === 'expense' && (
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-ancient font-black text-slate-600 uppercase tracking-widest block">
                                            Secteur affecté ({categories.length} disponibles)
                                        </label>
                                        {categories.length === 0 ? (
                                            <p className="text-[10px] text-rose-500 font-bold text-center py-4">Aucune catégorie définie. Crée-en dans les réglages.</p>
                                        ) : (
                                            <div className="grid grid-cols-4 md:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1 custom-scrollbar">
                                                {categories.map(cat => (
                                                    <button key={cat.id} type="button" onClick={() => setCategoryId(cat.id)}
                                                        className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all ${categoryId === cat.id ? 'border-rose-500 bg-rose-500/10 text-white' : 'border-slate-800 text-slate-700 hover:border-slate-600'}`}>
                                                        <span className="text-xl">{cat.icon}</span>
                                                        <span className="text-[7px] font-bold uppercase mt-1 text-center truncate w-full">{cat.name}</span>
                                                        <span className="text-[7px] text-slate-600">{formatCurrency(cat.balances?.[0]?.amount || 0)}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* === OBJECTIF : liste des vrais objectifs actifs === */}
                                {transactionType === 'goal' && (
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-ancient font-black text-slate-600 uppercase tracking-widest block">
                                            Front de conquête ({goals.length} actifs)
                                        </label>
                                        {goals.length === 0 ? (
                                            <p className="text-[10px] text-rose-500 font-bold text-center py-4">Aucun objectif actif. Crée-en dans la page Objectifs.</p>
                                        ) : (
                                            <div className="space-y-2 max-h-48 overflow-y-auto px-1 custom-scrollbar">
                                                {goals.map(goal => {
                                                    const progress = goal.target_amount > 0 ? Math.round((goal.current_amount / goal.target_amount) * 100) : 0;
                                                    return (
                                                        <button key={goal.id} type="button" onClick={() => setGoalId(goal.id)}
                                                            className={`w-full text-left flex items-center justify-between p-4 rounded-xl border-2 transition-all ${goalId === goal.id ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 hover:border-slate-600'}`}>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-2xl">{goal.icon || '🎯'}</span>
                                                                <div>
                                                                    <p className="text-[10px] font-ancient font-black uppercase tracking-wider text-white">{goal.title}</p>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        <div className="w-20 h-1 bg-slate-800 rounded-full overflow-hidden">
                                                                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${progress}%` }} />
                                                                        </div>
                                                                        <span className="text-[8px] text-blue-400 font-mono">{progress}%</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-[9px] font-mono text-slate-400">{formatCurrency(goal.current_amount)}</p>
                                                                <p className="text-[8px] text-slate-700">/ {formatCurrency(goal.target_amount)}</p>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* === DETTE : liste des vraies dettes actives === */}
                                {transactionType === 'debt' && (
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-ancient font-black text-slate-600 uppercase tracking-widest block">
                                            Chaîne à briser ({debts.length} dettes actives)
                                        </label>
                                        {debts.length === 0 ? (
                                            <p className="text-[10px] text-emerald-500 font-bold text-center py-4">🎉 Aucune dette active ! Empire libre.</p>
                                        ) : (
                                            <div className="space-y-2 max-h-48 overflow-y-auto px-1 custom-scrollbar">
                                                {debts.map(debt => {
                                                    const progressPaid = debt.total_amount > 0 ? Math.round(((debt.total_amount - debt.remaining_amount) / debt.total_amount) * 100) : 0;
                                                    return (
                                                        <button key={debt.id} type="button" onClick={() => setDebtId(debt.id)}
                                                            className={`w-full text-left flex items-center justify-between p-4 rounded-xl border-2 transition-all ${debtId === debt.id ? 'border-orange-500 bg-orange-500/10' : 'border-slate-800 hover:border-slate-600'}`}>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-2xl">{debt.icon || '⏳'}</span>
                                                                <div>
                                                                    <p className="text-[10px] font-ancient font-black uppercase tracking-wider text-white">{debt.creditor_name}</p>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        <div className="w-20 h-1 bg-slate-800 rounded-full overflow-hidden">
                                                                            <div className="h-full bg-orange-500 rounded-full" style={{ width: `${progressPaid}%` }} />
                                                                        </div>
                                                                        <span className="text-[8px] text-orange-400 font-mono">{progressPaid}% remboursé</span>
                                                                    </div>
                                                                    {debt.due_date && <p className="text-[7px] text-slate-600 mt-0.5">Échéance : {new Date(debt.due_date).toLocaleDateString('fr-FR')}</p>}
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-[9px] font-mono text-rose-400 font-bold">{formatCurrency(debt.remaining_amount)}</p>
                                                                <p className="text-[8px] text-slate-700">restants</p>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                        {/* Suggestion du montant maximum */}
                                        {debtId && (
                                            <button type="button"
                                                onClick={() => setAmount(String(debts.find(d => d.id === debtId)?.remaining_amount || ''))}
                                                className="text-[9px] text-orange-500 font-bold underline"
                                            >
                                                → Régler le solde total restant
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Note */}
                                <div>
                                    <label className="text-[10px] font-ancient font-black text-slate-600 uppercase tracking-widest mb-2 block">Détails de l'opération</label>
                                    <input
                                        type="text" value={note} onChange={e => setNote(e.target.value)}
                                        className="w-full bg-slate-950 border-2 border-slate-800 rounded-xl px-4 py-4 text-white font-ancient text-sm outline-none focus:border-slate-700 transition-all placeholder-slate-900"
                                        placeholder="Ex: Achat stratégique, source de revenu..."
                                    />
                                </div>

                                {/* Submit */}
                                <button type="submit" className="btn-empire-primary w-full py-5 text-base font-black tracking-[0.3em] shadow-xl shadow-amber-500/10">
                                    {transactionType === 'income' && 'DIVISER & SCELLER'}
                                    {transactionType === 'expense' && "SCELLER L'ACTE"}
                                    {transactionType === 'goal' && 'RENFORCER LE FRONT'}
                                    {transactionType === 'debt' && 'BRISER LA CHAÎNE'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TransactionsPage;


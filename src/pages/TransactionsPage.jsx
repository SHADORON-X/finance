import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp, TrendingDown, Plus, Filter, Search,
    Calendar, ArrowUpRight, ArrowDownLeft, Trash2,
    MoreHorizontal, Sparkles, AlertTriangle, X, Target
} from 'lucide-react';
import { useAuthStore } from '../store';
import { getTransactions, createIncome, createExpense, deleteTransaction, getTransactionStats } from '../services/transactionService';
import { getCategories } from '../services/balanceService';
import { getGoals, contributeToGoal } from '../services/goalService';
import { analyzeTransaction } from '../services/aiService';
import toast from 'react-hot-toast';

const TransactionsPage = () => {
    const { user } = useAuthStore();
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0, netBalance: 0 });
    const [categories, setCategories] = useState([]);
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [transactionType, setTransactionType] = useState('expense'); // expense, income, goal
    const [searchTerm, setSearchTerm] = useState('');

    // Form data
    const [amount, setAmount] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [goalId, setGoalId] = useState('');
    const [note, setNote] = useState('');

    useEffect(() => {
        loadData();
    }, [user.id]);

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
            toast.error("Erreur de chargement");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTransaction = async (e) => {
        e.preventDefault();
        try {
            const val = parseFloat(amount);
            if (isNaN(val) || val <= 0) return toast.error("Montant invalide");

            if (transactionType === 'income') {
                await createIncome(user.id, val, categories);
                toast.success(" Revenu ajouté !");
            } else if (transactionType === 'expense') {
                if (!categoryId) return toast.error("Catégorie requise");
                await createExpense(user.id, val, categoryId, note);
                toast.success("Dépense enregistrée");
            } else if (transactionType === 'goal') {
                if (!goalId) return toast.error("Objectif requis");
                await contributeToGoal(goalId, user.id, val);
                toast.success("Contribution versée !");
            }

            setIsAddModalOpen(false);
            setAmount('');
            setNote('');
            loadData();
        } catch (error) {
            console.error(error);
            toast.error("Erreur lors de l'enregistrement");
        }
    };

    // Modale de Suppression
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [transactionToDelete, setTransactionToDelete] = useState(null);

    const handleDelete = (transaction) => {
        setTransactionToDelete(transaction);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!transactionToDelete) return;
        try {
            await deleteTransaction(transactionToDelete.id, user.id);
            toast.success("Transaction anéantie");
            loadData();
            setIsDeleteModalOpen(false);
            setTransactionToDelete(null);
        } catch (error) {
            toast.error("Échec de la destruction");
        }
    };

    const handleAnalyze = async (transaction) => {
        const toastId = toast.loading("L'Oracle analyse cette transaction...");
        try {
            const advice = await analyzeTransaction(transaction);

            toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-slate-800 shadow-2xl rounded-lg pointer-events-auto flex border border-amber-500/30`}>
                    <div className="flex-1 w-0 p-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 pt-0.5">
                                <Sparkles className="h-10 w-10 text-amber-500" />
                            </div>
                            <div className="ml-3 flex-1">
                                <p className="text-sm font-medium text-amber-500">
                                    Analyse de l'Oracle
                                </p>
                                <p className="mt-1 text-sm text-slate-300">
                                    {advice || "Le silence est parfois la meilleure réponse..."}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex border-l border-slate-700">
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-amber-500 hover:text-amber-400 focus:outline-none"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            ), { id: toastId, duration: 8000 });

        } catch (error) {
            toast.error("L'Oracle est indisponible", { id: toastId });
        }
    };

    // Filter logic
    const filteredTransactions = transactions.filter(t => {
        // Simple filter based on type roughly
        const matchesFilter = filter === 'all' || t.type === filter;
        const matchesSearch = (t.note || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.categories?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.type === 'income' && 'revenu'.includes(searchTerm.toLowerCase())); // Bonus: trouver "Revenus" via recherche
        return matchesFilter && matchesSearch;
    });

    const formatCurrency = (amount) => Math.round(amount).toLocaleString('fr-FR') + ' FCFA';

    return (
        <div className="space-y-6 fade-in pb-24">
            {/* Header stats */}
            <div className="grid grid-cols-3 gap-2">
                <div className="card-gold p-3 flex flex-col justify-center min-w-0">
                    <div className="text-amber-200/60 text-[9px] uppercase font-bold tracking-wider mb-1 truncate">Solde Net</div>
                    <div className={`text-sm sm:text-lg font-bold font-mono truncate ${stats.netBalance >= 0 ? 'text-white' : 'text-rose-400'}`}>
                        {stats.netBalance > 0 ? '+' : ''}{formatCurrency(stats.netBalance).replace(' FCFA', '')}
                    </div>
                </div>
                <div className="card p-3 flex flex-col justify-center border-emerald-500/10 min-w-0">
                    <div className="text-emerald-400/70 text-[9px] uppercase font-bold tracking-wider mb-1 truncate">Revenus</div>
                    <div className="text-sm sm:text-lg font-bold text-emerald-400 font-mono truncate">
                        {formatCurrency(stats.totalIncome).replace(' FCFA', '')}
                    </div>
                </div>
                <div className="card p-3 flex flex-col justify-center border-rose-500/10 min-w-0">
                    <div className="text-rose-400/70 text-[9px] uppercase font-bold tracking-wider mb-1 truncate">Dépenses</div>
                    <div className="text-sm sm:text-lg font-bold text-rose-400 font-mono truncate">
                        {formatCurrency(stats.totalExpense).replace(' FCFA', '')}
                    </div>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md p-2 rounded-xl border border-slate-800/50">
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-1 focus:ring-amber-500 w-full md:w-64 transition-all"
                        />
                    </div>
                    <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
                        <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${filter === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>Tout</button>
                        <button onClick={() => setFilter('income')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${filter === 'income' ? 'bg-emerald-900/30 text-emerald-400' : 'text-slate-400'}`}>Revenus</button>
                        <button onClick={() => setFilter('expense')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${filter === 'expense' ? 'bg-rose-900/30 text-rose-400' : 'text-slate-400'}`}>Dépenses</button>
                    </div>
                </div>
                <button
                    onClick={() => { setTransactionType('expense'); setIsAddModalOpen(true); }}
                    className="w-full md:w-auto btn btn-primary flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                    <Plus size={18} /> Nouvelle Opération
                </button>
            </div>

            {/* Transactions List */}
            <div className="space-y-3">
                <AnimatePresence>
                    {filteredTransactions.map((t, index) => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.05 }}
                            className={`group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm p-4 hover:bg-slate-800/80 transition-all hover:shadow-lg ${t.type === 'income' ? 'hover:shadow-emerald-900/20' : 'hover:shadow-rose-900/20'
                                }`}
                        >
                            {/* Bordure latérale colorée */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${t.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'
                                }`} />

                            <div className="flex items-center gap-4 pl-3">
                                {/* Icône */}
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg shadow-inner ${t.type === 'income'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                    }`}>
                                    {t.type === 'income'
                                        ? <ArrowDownLeft size={20} />
                                        : (t.categories ? t.categories.icon : <ArrowUpRight size={20} />)
                                    }
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-slate-200 truncate group-hover:text-white transition-colors">
                                                {t.type === 'income' ? 'Revenu' : (t.categories?.name || 'Dépense')}
                                            </h3>
                                            <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">
                                                {t.note || (t.type === 'income' ? 'Dépôt' : 'Sans note')}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`block text-lg font-mono font-bold tracking-tight ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                                                }`}>
                                                {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                            </span>
                                            <span className="text-[10px] text-slate-600 uppercase font-bold">
                                                {new Date(t.timestamp).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions masquées (Overlay) */}
                            <div className="absolute inset-0 bg-slate-900/90 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                                <button
                                    onClick={() => handleAnalyze(t)}
                                    className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-500 border border-amber-500/50 rounded-lg hover:bg-amber-500 hover:text-slate-900 font-bold transition-all transform hover:scale-105"
                                >
                                    <Sparkles size={16} /> Oracle
                                </button>
                                <button
                                    onClick={() => handleDelete(t)}
                                    className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-500 border border-rose-500/50 rounded-lg hover:bg-rose-500 hover:text-white font-bold transition-all transform hover:scale-105"
                                >
                                    <Trash2 size={16} /> Supprimer
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredTransactions.length === 0 && !loading && (
                    <div className="text-center py-12 text-slate-500">
                        <Filter className="mx-auto mb-2 opacity-50" size={32} />
                        <p>Aucune transaction trouvée.</p>
                    </div>
                )}
            </div>

            {/* Modal d'Ajout */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4">
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            className="bg-slate-900 w-full md:max-w-md rounded-t-2xl md:rounded-2xl border border-slate-800 shadow-2xl overflow-hidden"
                        >
                            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                                <h2 className="text-lg font-bold">Nouvelle Opération</h2>
                                <button onClick={() => setIsAddModalOpen(false)}><X className="text-slate-400 hover:text-white" /></button>
                            </div>

                            <form onSubmit={handleCreateTransaction} className="p-4 space-y-4">
                                {/* Type Toggle */}
                                <div className="grid grid-cols-3 gap-2 bg-slate-800 p-1 rounded-xl">
                                    <button
                                        type="button"
                                        onClick={() => setTransactionType('expense')}
                                        className={`py-2 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${transactionType === 'expense'
                                            ? 'bg-rose-500 text-white shadow-lg'
                                            : 'text-slate-400 hover:text-white'
                                            }`}
                                    >
                                        <TrendingDown size={14} /> Dépense
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTransactionType('income')}
                                        className={`py-2 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${transactionType === 'income'
                                            ? 'bg-emerald-500 text-white shadow-lg'
                                            : 'text-slate-400 hover:text-white'
                                            }`}
                                    >
                                        <TrendingUp size={14} /> Revenu
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTransactionType('goal')}
                                        className={`py-2 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${transactionType === 'goal'
                                            ? 'bg-blue-500 text-white shadow-lg'
                                            : 'text-slate-400 hover:text-white'
                                            }`}
                                    >
                                        <Target size={14} /> Objectif
                                    </button>
                                </div>

                                <div>
                                    <label className="text-xs text-slate-400 uppercase font-bold ml-1">Montant</label>
                                    <div className="relative mt-1">
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl px-4 py-3 text-2xl font-mono focus:border-amber-500 focus:outline-none transition-colors"
                                            placeholder="0"
                                            autoFocus
                                            required
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">FCFA</span>
                                    </div>
                                </div>

                                {transactionType === 'expense' && (
                                    <div>
                                        <label className="text-xs text-slate-400 uppercase font-bold ml-1">Catégorie</label>
                                        <div className="grid grid-cols-4 gap-2 mt-1 max-h-40 overflow-y-auto custom-scrollbar p-1">
                                            {categories.map(cat => (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => setCategoryId(cat.id)}
                                                    className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-1 border-2 transition-all ${categoryId === cat.id
                                                        ? 'border-amber-500 bg-amber-500/10 text-white'
                                                        : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                                                        }`}
                                                >
                                                    <span className="text-xl">{cat.icon}</span>
                                                    <span className="text-[9px] truncate w-full text-center px-1 leading-none">{cat.name}</span>
                                                </button>
                                            ))}
                                            <button
                                                type="button"
                                                className="aspect-square rounded-xl border-2 border-dashed border-slate-700 bg-slate-800/50 flex items-center justify-center text-slate-500 hover:text-white hover:border-slate-500 transition-colors"
                                            >
                                                <Plus size={20} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {transactionType === 'goal' && (
                                    <div>
                                        <label className="text-xs text-slate-400 uppercase font-bold ml-1">Sélectionner l'Objectif</label>
                                        <div className="space-y-2 mt-1 max-h-40 overflow-y-auto custom-scrollbar">
                                            {goals.length > 0 ? goals.map(g => (
                                                <button
                                                    key={g.id}
                                                    type="button"
                                                    onClick={() => setGoalId(g.id)}
                                                    className={`w-full p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${goalId === g.id
                                                        ? 'border-blue-500 bg-blue-500/10'
                                                        : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                                                        }`}
                                                >
                                                    <span className="text-2xl">{g.icon}</span>
                                                    <div className="text-left">
                                                        <div className="font-bold text-sm text-white">{g.title}</div>
                                                        <div className="text-xs text-slate-400">Reste: {formatCurrency(g.target_amount - g.current_amount)}</div>
                                                    </div>
                                                </button>
                                            )) : (
                                                <div className="text-center p-4 text-slate-500 text-sm border border-dashed border-slate-700 rounded-xl">
                                                    Aucun objectif actif.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {transactionType !== 'goal' && (
                                    <div>
                                        <label className="text-xs text-slate-400 uppercase font-bold ml-1">Note (Optionnel)</label>
                                        <input
                                            type="text"
                                            value={note}
                                            onChange={e => setNote(e.target.value)}
                                            className="w-full bg-slate-800 border-slate-700 rounded-xl px-4 py-3 mt-1 focus:border-amber-500 focus:outline-none transition-colors"
                                            placeholder="..."
                                        />
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className={`btn w-full py-4 text-lg font-bold shadow-xl mt-4 ${transactionType === 'income'
                                        ? 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20'
                                        : transactionType === 'goal'
                                            ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20'
                                            : 'bg-rose-500 hover:bg-rose-400 shadow-rose-500/20'
                                        }`}
                                >
                                    Valider
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODALE DE SUPPRESSION COMPACTE */}
            <AnimatePresence>
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-900 border border-rose-500/30 rounded-xl w-full max-w-[320px] shadow-2xl relative overflow-hidden"
                        >
                            <div className="p-6 text-center">
                                <motion.div
                                    animate={{ rotate: [0, -10, 10, 0] }}
                                    className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-3 text-rose-500 border border-rose-500/20"
                                >
                                    <Trash2 size={24} />
                                </motion.div>

                                <h3 className="text-lg font-bold text-white mb-1">
                                    Supprimer ?
                                </h3>
                                <p className="text-sm text-slate-400 mb-5">
                                    Cette action est irréversible.
                                </p>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setIsDeleteModalOpen(false)}
                                        className="btn bg-slate-800 hover:bg-slate-700 text-xs text-white border border-slate-700 py-2.5 rounded-lg"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        className="btn bg-rose-600 hover:bg-rose-500 text-xs text-white font-bold py-2.5 rounded-lg shadow-lg shadow-rose-900/40"
                                    >
                                        Confirmer
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TransactionsPage;


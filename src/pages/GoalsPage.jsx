import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Target, Plus, TrendingUp, Calendar, CheckCircle2,
    AlertCircle, Wallet, Sparkles, Trash2, Edit2, X
} from 'lucide-react';
import { useAuthStore } from '../store';
import { getGoals, createGoal, deleteGoal, contributeToGoal } from '../services/goalService';
import { suggestGoals } from '../services/aiService';
import { getBalances } from '../services/balanceService';
import toast from 'react-hot-toast';

const GoalsPage = () => {
    const { user } = useAuthStore();
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);

    // Form States
    const [newGoal, setNewGoal] = useState({
        title: '',
        targetAmount: '',
        deadline: '',
        icon: '🎯',
        category: 'savings'
    });
    const [contributionAmount, setContributionAmount] = useState('');

    useEffect(() => {
        loadData();
    }, [user.id]);

    const loadData = async () => {
        try {
            const data = await getGoals(user.id);
            setGoals(data);
        } catch (error) {
            toast.error("Erreur lors du chargement des objectifs");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGoal = async (e) => {
        e.preventDefault();
        try {
            await createGoal(user.id, {
                ...newGoal,
                targetAmount: parseFloat(newGoal.targetAmount)
            });
            toast.success("Objectif créé avec succès !");
            setIsAddModalOpen(false);
            setNewGoal({ title: '', targetAmount: '', deadline: '', icon: '🎯', category: 'savings' });
            loadData();
        } catch (error) {
            toast.error("Erreur lors de la création");
        }
    };

    const handleDeleteGoal = async (id) => {
        if (!confirm("Voulez-vous vraiment supprimer cet objectif ?")) return;
        try {
            await deleteGoal(id, user.id);
            toast.success("Objectif supprimé");
            loadData();
        } catch (error) {
            toast.error("Erreur lors de la suppression");
        }
    };

    const handleContribute = async (e) => {
        e.preventDefault();
        if (!selectedGoal || !contributionAmount) return;
        try {
            await contributeToGoal(selectedGoal.id, user.id, parseFloat(contributionAmount));
            toast.success(" Contribution ajoutée !");
            setIsContributeModalOpen(false);
            setContributionAmount('');
            loadData();
        } catch (error) {
            toast.error("Erreur lors de la contribution");
        }
    };

    const handleAskOracle = async () => {
        setAiLoading(true);
        try {
            // On récupère quelques données pour le contexte
            const balances = await getBalances(user.id);
            const totalBalance = balances.reduce((sum, b) => sum + b.amount, 0);

            // Simulation de données minimales si pas assez d'historique
            const contextData = {
                totalBalance,
                avgMonthlyIncome: 0, // À implémenter plus tard
                avgMonthlyExpense: 0
            };

            const suggestion = await suggestGoals(contextData);

            // Afficher la suggestion dans un toast long ou une modale dédiée
            // Pour l'instant, on utilise une alerte custom
            toast((t) => (
                <div className="flex flex-col gap-2 max-w-md">
                    <span className="font-bold flex items-center gap-2">
                        <Sparkles size={16} className="text-amber-500" />
                        Conseil de l'Oracle
                    </span>
                    <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">
                        {suggestion}
                    </p>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="text-xs bg-slate-700 p-2 rounded mt-2 hover:bg-slate-600"
                    >
                        Merci, j'ai noté
                    </button>
                </div>
            ), { duration: 10000, style: { background: '#1e293b', color: '#fff', border: '1px solid #475569' } });

        } catch (error) {
            toast.error("L'Oracle est silencieux...");
        } finally {
            setAiLoading(false);
        }
    };

    const formatCurrency = (amount) => Math.round(amount).toLocaleString('fr-FR') + ' FCFA';

    const getProgressColor = (current, target) => {
        const percentage = (current / target) * 100;
        if (percentage >= 100) return 'bg-emerald-500';
        if (percentage >= 50) return 'bg-blue-500';
        if (percentage >= 25) return 'bg-amber-500';
        return 'bg-rose-500';
    };

    return (
        <div className="space-y-6 fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center gap-2">
                        <Target className="text-emerald-400" />
                        Objectifs & Rêves
                    </h1>
                    <p className="text-slate-400 text-sm">Visualisez et réalisez vos projets financiers</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleAskOracle}
                        disabled={aiLoading}
                        className="btn bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-900/30 shadow-lg shadow-amber-900/10 flex items-center gap-2"
                    >
                        <Sparkles size={18} className={aiLoading ? "animate-spin" : ""} />
                        {aiLoading ? "Consultation..." : "Oracle"}
                    </button>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="btn btn-primary flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                    >
                        <Plus size={18} />
                        Nouvel Objectif
                    </button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wider">Total Épargné</p>
                            <h3 className="text-2xl font-bold text-emerald-400 mt-1">
                                {formatCurrency(goals.reduce((acc, g) => acc + g.current_amount, 0))}
                            </h3>
                        </div>
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <Wallet className="text-emerald-400" size={20} />
                        </div>
                    </div>
                </div>
                <div className="card bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wider">Objectif Global</p>
                            <h3 className="text-2xl font-bold text-blue-400 mt-1">
                                {formatCurrency(goals.reduce((acc, g) => acc + g.target_amount, 0))}
                            </h3>
                        </div>
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Target className="text-blue-400" size={20} />
                        </div>
                    </div>
                </div>
                <div className="card bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs text-slate-400 uppercase tracking-wider">Progression Moyenne</p>
                            <h3 className="text-2xl font-bold text-amber-400 mt-1">
                                {goals.length > 0
                                    ? Math.round(goals.reduce((acc, g) => acc + (g.current_amount / g.target_amount), 0) / goals.length * 100)
                                    : 0}%
                            </h3>
                        </div>
                        <div className="p-2 bg-amber-500/10 rounded-lg">
                            <TrendingUp className="text-amber-400" size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Goals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {goals.map((goal, index) => {
                        const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
                        const isCompleted = progress >= 100;

                        return (
                            <motion.div
                                key={goal.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.1 }}
                                className={`group relative rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700 hover:border-slate-500 transition-all duration-300 shadow-xl overflow-hidden ${isCompleted ? 'border-emerald-500/50 shadow-emerald-500/10' : ''}`}
                            >
                                {/* Glow Effect Background */}
                                <div className={`absolute -inset-1 bg-gradient-to-r ${isCompleted ? 'from-emerald-500/20 to-cyan-500/20' : 'from-blue-500/10 to-purple-500/10'} opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500`} />

                                <div className="relative p-6 z-10">
                                    {/* Header Carte */}
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg ${isCompleted ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/50' : 'bg-slate-800 text-slate-400 ring-1 ring-slate-700'}`}>
                                            {goal.icon}
                                        </div>
                                        <div className="flex flex-col items-end">
                                            {isCompleted ? (
                                                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                                                    <CheckCircle2 size={12} /> ACCOMPLI
                                                </span>
                                            ) : (
                                                <span className="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded border border-slate-700">
                                                    {Math.round(progress)}%
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Titre et Montants */}
                                    <div className="mb-6">
                                        <h3 className="text-xl font-bold text-white mb-1 truncate leading-tight group-hover:text-blue-400 transition-colors">
                                            {goal.title}
                                        </h3>
                                        <div className="flex items-baseline gap-2 mt-2">
                                            <span className={`text-2xl font-mono font-bold ${isCompleted ? 'text-emerald-400' : 'text-slate-200'}`}>
                                                {formatCurrency(goal.current_amount)}
                                            </span>
                                            <span className="text-xs text-slate-500 font-medium">
                                                / {formatCurrency(goal.target_amount)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Barre de Progression Sci-Fi */}
                                    <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
                                        <motion.div
                                            className={`absolute top-0 left-0 h-full ${isCompleted ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 'bg-blue-500 shadow-[0_0_10px_#3b82f6]'}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 1.2, ease: "circOut" }}
                                        />
                                    </div>

                                    {/* Infos Footer */}
                                    <div className="flex justify-between items-center text-xs text-slate-500 font-medium mb-6">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={12} />
                                            {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'Sans date'}
                                        </div>
                                        <div>
                                            {isCompleted ? 'Félicitations !' : `Reste: ${formatCurrency(Math.max(0, goal.target_amount - goal.current_amount))}`}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="grid grid-cols-5 gap-2">
                                        {!isCompleted && (
                                            <button
                                                onClick={() => { setSelectedGoal(goal); setIsContributeModalOpen(true); }}
                                                className="col-span-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
                                            >
                                                <Plus size={16} /> Contribuer
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDeleteGoal(goal.id)}
                                            className={`py-2.5 rounded-xl border border-slate-700 hover:border-rose-500 hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-all flex items-center justify-center ${isCompleted ? 'col-span-5' : 'col-span-1'}`}
                                            title="Supprimer"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );

                    })}
                </AnimatePresence>

                {goals.length === 0 && !loading && (
                    <div className="col-span-full py-12 text-center text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
                        <Target size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Aucun objectif pour le moment.</p>
                        <button onClick={() => setIsAddModalOpen(true)} className="text-emerald-400 font-medium hover:underline mt-2">Commencez par en créer un !</button>
                    </div>
                )}
            </div>

            {/* Add Goal Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                                <h3 className="text-lg font-bold">Nouvel Objectif</h3>
                                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleCreateGoal} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Titre</label>
                                    <input
                                        type="text"
                                        required
                                        value={newGoal.title}
                                        onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                                        className="input w-full"
                                        placeholder="Ex: Voyage au Japon, MacBook Pro..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Montant Cible (FCFA)</label>
                                    <input
                                        type="number"
                                        required
                                        value={newGoal.targetAmount}
                                        onChange={e => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                                        className="input w-full"
                                        placeholder="1000000"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Date limite</label>
                                        <input
                                            type="date"
                                            value={newGoal.deadline}
                                            onChange={e => setNewGoal({ ...newGoal, deadline: e.target.value })}
                                            className="input w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Icône</label>
                                        <select
                                            value={newGoal.icon}
                                            onChange={e => setNewGoal({ ...newGoal, icon: e.target.value })}
                                            className="input w-full"
                                        >
                                            <option value="🎯">🎯 Cible</option>
                                            <option value="✈️">✈️ Voyage</option>
                                            <option value="🏠">🏠 Maison</option>
                                            <option value="🚗">🚗 Voiture</option>
                                            <option value="💻">💻 Tech</option>
                                            <option value="🎓">🎓 Études</option>
                                            <option value="💍">💍 Mariage</option>
                                            <option value="☂️">☂️ Sécurité</option>
                                        </select>
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary w-full mt-4">Créer l'objectif</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Contribute Modal */}
            <AnimatePresence>
                {isContributeModalOpen && selectedGoal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl"
                        >
                            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-gradient-to-r from-emerald-900/20 to-slate-900">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Plus className="text-emerald-400" size={20} />
                                    Contribuer
                                </h3>
                                <button onClick={() => setIsContributeModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleContribute} className="p-6 space-y-4">
                                <div className="text-center mb-4">
                                    <div className="text-sm text-slate-400">Ajouter à</div>
                                    <div className="text-xl font-bold text-white">{selectedGoal.title}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Montant à ajouter</label>
                                    <input
                                        type="number"
                                        required
                                        autoFocus
                                        value={contributionAmount}
                                        onChange={e => setContributionAmount(e.target.value)}
                                        className="input w-full text-lg font-bold text-emerald-400"
                                        placeholder="0"
                                    />
                                    <div className="text-xs text-slate-500 mt-2">
                                        Reste à financer: {formatCurrency(selectedGoal.target_amount - selectedGoal.current_amount)}
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary w-full bg-emerald-600 hover:bg-emerald-500 border-none">
                                    Confirmer le dépôt
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GoalsPage;

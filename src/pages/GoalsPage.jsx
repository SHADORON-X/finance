import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Target, Plus, TrendingUp, Calendar, CheckCircle2,
    AlertCircle, Wallet, Sparkles, Trash2, Edit2, X, Sword, Crown, Map, Shield, Flame, Trophy
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
            toast.error("Échec des renseignements (Load failed)");
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
            toast.success("Nouveau territoire marqué sur la carte !");
            setIsAddModalOpen(false);
            setNewGoal({ title: '', targetAmount: '', deadline: '', icon: '🎯', category: 'savings' });
            loadData();
        } catch (error) {
            toast.error("Erreur de planification stratégique");
        }
    };

    const handleDeleteGoal = async (id) => {
        if (!confirm("Voulez-vous vraiment abandonner ce territoire ?")) return;
        try {
            await deleteGoal(id, user.id);
            toast.success("Territoire retiré de l'empire");
            loadData();
        } catch (error) {
            toast.error("Erreur tactique lors du retrait");
        }
    };

    const handleContribute = async (e) => {
        e.preventDefault();
        if (!selectedGoal || !contributionAmount) return;
        try {
            await contributeToGoal(selectedGoal.id, user.id, parseFloat(contributionAmount));
            toast.success("Renforts arrivés sur le front !");
            setIsContributeModalOpen(false);
            setContributionAmount('');
            loadData();
        } catch (error) {
            toast.error("Échec du ravitaillement");
        }
    };

    const handleAskOracle = async () => {
        setAiLoading(true);
        const toastId = toast.loading("L'Oracle scrute les futurs possibles...");
        try {
            const balances = await getBalances(user.id);
            const totalBalance = balances.reduce((sum, b) => sum + b.amount, 0);
            const contextData = { totalBalance, avgMonthlyIncome: 0, avgMonthlyExpense: 0 };
            const suggestion = await suggestGoals(contextData);

            toast.dismiss(toastId);
            toast((t) => (
                <div className="flex flex-col gap-3 p-2">
                    <div className="flex items-center gap-2">
                        <Sparkles size={20} className="text-amber-500" />
                        <span className="font-ancient font-black text-amber-500 tracking-widest text-xs uppercase">Vision de l'Oracle</span>
                    </div>
                    <p className="text-sm text-slate-300 italic font-ancient leading-relaxed">"{suggestion}"</p>
                    <button onClick={() => toast.dismiss(t.id)} className="btn-empire text-[9px] py-1">J'AI REÇU LE MESSAGE</button>
                </div>
            ), { duration: 12000, style: { background: '#020617', border: '1px solid rgba(245, 158, 11, 0.4)', color: '#fff' } });
        } catch (error) {
            toast.error("L'Oracle est silencieux...", { id: toastId });
        } finally {
            setAiLoading(false);
        }
    };

    const formatCurrency = (amount) => Math.round(amount).toLocaleString('fr-FR') + ' FCFA';

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <Map className="text-amber-500 animate-pulse" size={48} />
            <p className="font-ancient text-amber-500 tracking-[0.4em] text-[10px] uppercase">DÉPLOIEMENT DE LA CARTE DE GUERRE...</p>
        </div>
    );

    return (
        <div className="space-y-10 fade-in pb-32 max-w-7xl mx-auto px-4 pt-8">

            {/* Header: Battle Command */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Target className="text-amber-500" size={24} />
                        <h1 className="heading-gold text-2xl lg:text-3xl">CARTE DES CONQUÊTES</h1>
                    </div>
                    <p className="font-ancient text-[10px] text-slate-500 tracking-[0.2em] font-bold uppercase">Planifiez l'expansion de votre empire financier</p>
                </div>

                <div className="flex gap-4 w-full lg:w-auto">
                    <button onClick={handleAskOracle} disabled={aiLoading} className="btn-empire flex-1 lg:flex-none flex items-center justify-center gap-3 px-6 h-12">
                        <Sparkles size={16} className={aiLoading ? "animate-spin" : ""} />
                        <span>ORACLE</span>
                    </button>
                    <button onClick={() => setIsAddModalOpen(true)} className="btn-empire-primary flex-1 lg:flex-none flex items-center justify-center gap-3 px-6 h-12">
                        <Plus size={18} />
                        <span>NOUVEAU FRONT</span>
                    </button>
                </div>
            </div>

            {/* Strategic Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card-warrior p-6 bg-slate-900/60 border-emerald-500/20">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[9px] font-ancient font-black text-slate-500 tracking-widest uppercase">Butin de Guerre</span>
                        <Wallet className="text-emerald-500/50" size={16} />
                    </div>
                    <div className="text-3xl font-ancient font-black text-emerald-400">
                        {formatCurrency(goals.reduce((acc, g) => acc + g.current_amount, 0))}
                    </div>
                </div>
                <div className="card-warrior p-6 bg-slate-900/60 border-blue-500/20">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[9px] font-ancient font-black text-slate-500 tracking-widest uppercase">Domination Totale Ciblée</span>
                        <Target className="text-blue-500/50" size={16} />
                    </div>
                    <div className="text-3xl font-ancient font-black text-white">
                        {formatCurrency(goals.reduce((acc, g) => acc + g.target_amount, 0))}
                    </div>
                </div>
                <div className="card-warrior p-6 bg-slate-900/60 border-amber-500/20">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[9px] font-ancient font-black text-slate-500 tracking-widest uppercase">Niveau de Conquête</span>
                        <Trophy className="text-amber-500/50" size={16} />
                    </div>
                    <div className="text-3xl font-ancient font-black text-amber-500">
                        {goals.length > 0
                            ? Math.round(goals.reduce((acc, g) => acc + (g.current_amount / g.target_amount), 0) / goals.length * 100)
                            : 0}%
                    </div>
                </div>
            </div>

            {/* Territories Grid (Goals) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence>
                    {goals.map((goal, index) => {
                        const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
                        const isCompleted = progress >= 100;

                        return (
                            <motion.div
                                key={goal.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className={`card-warrior relative group overflow-visible ${isCompleted ? 'border-amber-500 shadow-amber-900/40 shadow-xl' : 'border-white/5'}`}
                            >
                                <div className="p-8">
                                    {/* Icon & Status */}
                                    <div className="flex justify-between items-start mb-8">
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-xl border ${isCompleted ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-950 border-white/5'}`}>
                                            {goal.icon}
                                        </div>
                                        {isCompleted ? (
                                            <div className="flex flex-col items-end">
                                                <div className="px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full text-[9px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1">
                                                    <Crown size={12} /> TERRITOIRE CONQUIS
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-[10px] font-mono font-black text-slate-500">{Math.round(progress)}% DOMINÉ</div>
                                        )}
                                    </div>

                                    {/* Title & Stats */}
                                    <div className="mb-8">
                                        <h3 className="text-xl font-ancient font-black text-white group-hover:text-amber-500 transition-colors uppercase tracking-widest mb-3">
                                            {goal.title}
                                        </h3>
                                        <div className="flex items-baseline gap-2">
                                            <span className={`text-2xl font-mono font-black ${isCompleted ? 'text-amber-500' : 'text-slate-200'}`}>
                                                {formatCurrency(goal.current_amount)}
                                            </span>
                                        </div>
                                        <div className="text-[9px] font-bold text-slate-600 uppercase mt-1 tracking-widest">Sur un butin de {formatCurrency(goal.target_amount)}</div>
                                    </div>

                                    {/* Progress Bar (The Siege) */}
                                    <div className="relative h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5 mb-4">
                                        <motion.div
                                            initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                                            className={`h-full ${isCompleted ? 'bg-amber-500' : 'bg-gradient-to-r from-blue-600 to-blue-400'}`}
                                        />
                                    </div>

                                    <div className="flex justify-between items-center text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-8">
                                        <div className="flex items-center gap-2"><Calendar size={12} /> {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'INDÉFINI'}</div>
                                        {!isCompleted && <div>MANQUE: {formatCurrency(goal.target_amount - goal.current_amount)}</div>}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        {!isCompleted && (
                                            <button
                                                onClick={() => { setSelectedGoal(goal); setIsContributeModalOpen(true); }}
                                                className="btn-empire-primary flex-1 py-3 text-[10px]"
                                            >
                                                RENFORCER LE SIÈGE
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDeleteGoal(goal.id)}
                                            className={`p-3 rounded-tr-xl rounded-bl-xl border border-white/10 text-slate-600 hover:text-rose-500 hover:border-rose-500/50 transition-all ${isCompleted ? 'flex-1' : ''}`}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Add Goal Modal (Conquest Site Selection) */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card-warrior w-full max-w-xl p-8 bg-slate-900 relative">
                            <button onClick={() => setIsAddModalOpen(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X size={24} /></button>
                            <h2 className="heading-gold text-2xl mb-8 uppercase">Déclarer un Nouveau Front</h2>

                            <form onSubmit={handleCreateGoal} className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-ancient font-black text-slate-500 uppercase tracking-widest mb-3 block">Nom du Territoire</label>
                                    <input type="text" required value={newGoal.title} onChange={e => setNewGoal({ ...newGoal, title: e.target.value })} className="w-full bg-slate-950 border-2 border-slate-800 rounded-xl px-4 py-4 text-white font-ancient text-sm" placeholder="NOM DU RÊVE OU DE L'INVESTISSEMENT..." />
                                </div>
                                <div>
                                    <label className="text-[10px] font-ancient font-black text-slate-500 uppercase tracking-widest mb-3 block">Butin Final Cible</label>
                                    <input type="number" required value={newGoal.targetAmount} onChange={e => setNewGoal({ ...newGoal, targetAmount: e.target.value })} className="w-full bg-slate-950 border-2 border-slate-800 rounded-xl px-4 py-4 text-white font-mono text-xl" placeholder="0" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-ancient font-black text-slate-500 uppercase tracking-widest mb-3 block">Échéance de Guerre</label>
                                        <input type="date" value={newGoal.deadline} onChange={e => setNewGoal({ ...newGoal, deadline: e.target.value })} className="w-full bg-slate-950 border-2 border-slate-800 rounded-xl px-4 py-4 text-white" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-ancient font-black text-slate-500 uppercase tracking-widest mb-3 block">Insigne</label>
                                        <select value={newGoal.icon} onChange={e => setNewGoal({ ...newGoal, icon: e.target.value })} className="w-full bg-slate-950 border-2 border-slate-800 rounded-xl px-4 py-4 text-white">
                                            <option value="🎯">🎯 CIBLE</option>
                                            <option value="🏠">🏠 DOMAINE</option>
                                            <option value="🚗">🚗 CHAR</option>
                                            <option value="💻">💻 TECH</option>
                                            <option value="🎓">🎓 SAGESSE</option>
                                            <option value="✈️">✈️ EXPÉDITION</option>
                                        </select>
                                    </div>
                                </div>
                                <button type="submit" className="btn-empire-primary w-full py-5 text-lg">ANNEXER LE TERRITOIRE</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Contribute Modal (Supply Reinforcements) */}
            <AnimatePresence>
                {isContributeModalOpen && selectedGoal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card-warrior w-full max-w-md p-8 bg-slate-900 border-emerald-500/20">
                            <h3 className="font-ancient font-black text-emerald-500 tracking-widest text-lg mb-6 uppercase flex items-center gap-3">
                                <Sword size={20} /> ENVOYER DES RENFORTS
                            </h3>
                            <div className="text-center mb-8">
                                <div className="text-sm font-ancient text-slate-500 uppercase">Territoire ciblé</div>
                                <div className="text-2xl font-black text-white uppercase tracking-widest">{selectedGoal.title}</div>
                            </div>
                            <form onSubmit={handleContribute} className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-ancient font-black text-slate-500 uppercase tracking-widest mb-3 block">Volume du Ravitaillement</label>
                                    <input type="number" required autoFocus value={contributionAmount} onChange={e => setContributionAmount(e.target.value)} className="w-full bg-slate-950 border-2 border-emerald-500/30 rounded-xl px-6 py-6 text-4xl font-mono text-emerald-400 focus:border-emerald-500" placeholder="0" />
                                </div>
                                <button type="submit" className="btn-empire-primary w-full bg-emerald-600 border-emerald-400 py-4">CONFIRMER LE SIÈGE</button>
                                <button onClick={() => setIsContributeModalOpen(false)} type="button" className="w-full text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-colors">Retraite</button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GoalsPage;

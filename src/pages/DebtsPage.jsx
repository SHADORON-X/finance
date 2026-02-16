import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldAlert, ShieldCheck, Plus, TrendingDown,
    Calendar, AlertTriangle, CheckCircle2, Wallet,
    Trash2, X, ArrowRight, Shield, Flame, Target
} from 'lucide-react';
import { useAuthStore } from '../store';
import { getDebts, createDebt, addDebtPayment, deleteDebt } from '../services/debtService';
import toast from 'react-hot-toast';

const DebtsPage = () => {
    const { user } = useAuthStore();
    const [debts, setDebts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [selectedDebt, setSelectedDebt] = useState(null);

    // Form States
    const [newDebt, setNewDebt] = useState({
        creditor: '',
        amount: '',
        due_date: '',
        icon: '📜',
        notes: ''
    });
    const [paymentAmount, setPaymentAmount] = useState('');

    useEffect(() => {
        loadData();
    }, [user.id]);

    const loadData = async () => {
        try {
            const data = await getDebts(user.id);
            setDebts(data);
        } catch (error) {
            toast.error("Impossible de charger le fardeau");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateDebt = async (e) => {
        e.preventDefault();
        try {
            await createDebt(user.id, {
                ...newDebt,
                amount: parseFloat(newDebt.amount)
            });
            toast.success("Dette enregistrée. Courage !");
            setIsAddModalOpen(false);
            setNewDebt({ creditor: '', amount: '', due_date: '', icon: '📜', notes: '' });
            loadData();
        } catch (error) {
            toast.error("Erreur lors de la création");
        }
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        if (!selectedDebt || !paymentAmount) return;

        const amount = parseFloat(paymentAmount);
        if (amount <= 0) return toast.error("Montant invalide");
        if (amount > selectedDebt.remaining_amount) return toast.error("Tu paies plus que ce que tu dois !");

        const loadingToast = toast.loading("Traitement du remboursement...");
        try {
            await addDebtPayment(selectedDebt.id, user.id, amount);
            toast.success("Honneur sauf ! Paiement enregistré.", { id: loadingToast });
            setIsPayModalOpen(false);
            setPaymentAmount('');
            loadData();
        } catch (error) {
            toast.error("Erreur de paiement", { id: loadingToast });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Supprimer cette archive ?")) return;
        try {
            await deleteDebt(id, user.id);
            toast.success("Archive supprimée");
            loadData();
        } catch (error) {
            toast.error("Erreur suppression");
        }
    };

    const formatCurrency = (amount) => Math.round(amount).toLocaleString('fr-FR') + ' FCFA';

    // Stats Calculs
    const activeDebts = debts.filter(d => d.remaining_amount > 0);
    const totalDebt = debts.reduce((acc, d) => acc + d.remaining_amount, 0);
    const totalOriginal = debts.reduce((acc, d) => acc + (d.total_amount || 0), 0);
    const totalPaid = totalOriginal - totalDebt;
    const progressTotal = totalOriginal > 0 ? (totalPaid / totalOriginal) * 100 : 100;

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin"></div>
            <p className="text-rose-500 font-bold animate-pulse uppercase tracking-widest text-xs">Analyse du Fardeau...</p>
        </div>
    );

    return (
        <div className="space-y-8 fade-in pb-24 max-w-7xl mx-auto px-4">
            {/* --- HERO SECTION --- */}
            <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-rose-600 to-amber-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Balance Card */}
                    <div className="lg:col-span-2 card-premium p-8 bg-slate-950/80 border-rose-500/20">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <div className="flex items-center gap-2 text-rose-500 mb-2">
                                    <ShieldAlert size={18} className="animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Total Fardeau Tactique</span>
                                </div>
                                <h1 className="text-5xl font-mono font-black text-white tracking-tighter">
                                    {formatCurrency(totalDebt)}
                                </h1>
                                <div className="flex items-center gap-4 mt-4">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                        <Target size={14} className="text-slate-500" />
                                        <span>Dette Initiale: {formatCurrency(totalOriginal)}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                                        <ShieldCheck size={14} />
                                        <span>Déjà remboursé: {formatCurrency(totalPaid)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-center md:items-end">
                                <div className="w-24 h-24 rounded-full border-4 border-slate-800 flex items-center justify-center relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-emerald-500/10 animate-pulse"></div>
                                    <span className="text-xl font-black text-emerald-400 z-10">{Math.round(progressTotal)}%</span>
                                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                                        <circle
                                            cx="48" cy="48" r="44"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="transparent"
                                            className="text-emerald-500"
                                            strokeDasharray={276}
                                            strokeDashoffset={276 - (276 * progressTotal) / 100}
                                        />
                                    </svg>
                                </div>
                                <span className="mt-2 text-[10px] font-bold text-slate-500 uppercase">Progression Libération</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Action Card */}
                    <div className="card-premium p-6 bg-rose-950/20 border-rose-500/30 flex flex-col justify-between">
                        <div>
                            <h3 className="text-lg font-black text-white mb-2">Nouvelle Opération</h3>
                            <p className="text-xs text-slate-400 leading-relaxed mb-4">
                                Chaque remboursement est un pas de plus vers votre souveraineté financière. Ne reculez jamais.
                            </p>
                        </div>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="btn-tactical-primary w-full bg-rose-600 hover:bg-rose-500 shadow-rose-900/40"
                        >
                            <Plus size={20} />
                            DÉCLARER UNE DETTE
                        </button>
                    </div>
                </div>
            </div>

            {/* --- LISTING SECTION --- */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black flex items-center gap-2">
                        <Flame size={20} className="text-amber-500" />
                        DÉPLOIEMENT DU FARDEAU
                    </h2>
                    <div className="rank-badge">{activeDebts.length} Actifs</div>
                </div>

                <div className="responsive-grid">
                    <AnimatePresence mode="popLayout">
                        {debts.map((debt, index) => {
                            const progress = ((debt.total_amount - debt.remaining_amount) / debt.total_amount) * 100;
                            const isPaid = debt.remaining_amount <= 0;
                            const isOverdue = debt.due_date && new Date(debt.due_date) < new Date() && !isPaid;

                            return (
                                <motion.div
                                    key={debt.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`card-premium group ${isPaid ? 'border-emerald-500/20 bg-emerald-950/10' : 'border-white/5'} ${isOverdue ? 'border-rose-500/40 ring-1 ring-rose-500/20' : ''}`}
                                >
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-2xl transition-transform group-hover:scale-110 ${isPaid ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-slate-900 border border-white/5'}`}>
                                                {debt.icon}
                                            </div>
                                            <div className="flex gap-2">
                                                {!isPaid && (
                                                    <button
                                                        onClick={() => { setSelectedDebt(debt); setIsPayModalOpen(true); }}
                                                        className="w-10 h-10 flex items-center justify-center bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 rounded-xl transition-all border border-emerald-500/20"
                                                    >
                                                        <Wallet size={18} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(debt.id)}
                                                    className="w-10 h-10 flex items-center justify-center hover:bg-rose-500/10 text-slate-600 hover:text-rose-500 rounded-xl transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-1 mb-6">
                                            <h3 className="text-lg font-black text-white group-hover:text-amber-500 transition-colors uppercase tracking-tight">
                                                {debt.creditor_name}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <Calendar size={12} className={isOverdue ? 'text-rose-500' : 'text-slate-500'} />
                                                <span className={`text-[10px] font-bold uppercase tracking-widest ${isOverdue ? 'text-rose-500' : 'text-slate-500'}`}>
                                                    {isPaid ? 'MISSION ACCOMPLIE' : debt.due_date ? `Échéance: ${new Date(debt.due_date).toLocaleDateString()}` : 'Indéfinie'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Status & Progress */}
                                        <div className="space-y-4">
                                            <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 relative overflow-hidden">
                                                {isPaid && <div className="absolute inset-0 bg-emerald-500/5 backdrop-blur-[1px]"></div>}
                                                <div className="flex justify-between items-end relative z-10">
                                                    <div>
                                                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Reste à Payer</div>
                                                        <div className={`text-xl font-mono font-black ${isPaid ? 'text-emerald-400' : 'text-white'}`}>
                                                            {formatCurrency(debt.remaining_amount)}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-[9px] font-black text-slate-600 uppercase mb-1">Total</div>
                                                        <div className="text-xs font-bold text-slate-400">{formatCurrency(debt.total_amount)}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                    <motion.div
                                                        className={`h-full ${isPaid ? 'bg-emerald-500' : isOverdue ? 'bg-rose-500' : 'bg-amber-500'}`}
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${progress}%` }}
                                                        transition={{ duration: 1, ease: "easeOut" }}
                                                    />
                                                </div>
                                                <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter">
                                                    <span className={isPaid ? "text-emerald-500" : "text-slate-500"}>
                                                        {Math.round(progress)}% Liquidé
                                                    </span>
                                                    {!isPaid && <span className="text-slate-600">En cours...</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {isPaid && (
                                        <div className="absolute top-2 right-2 opacity-20">
                                            <ShieldCheck size={100} className="text-emerald-500" />
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {debts.length === 0 && !loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-24 text-center card-premium border-dashed border-slate-800 bg-slate-900/20"
                    >
                        <ShieldCheck size={80} className="mx-auto text-emerald-500/20 mb-6" />
                        <h3 className="text-2xl font-black text-white mb-2">SOUVERAINETÉ TOTALE</h3>
                        <p className="text-slate-500 font-medium">Aucune dette détectée dans le périmètre.</p>
                    </motion.div>
                )}
            </div>

            {/* --- MODALS (ADD & PAY) --- */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden scanline relative"
                        >
                            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-rose-600/10">
                                <h3 className="text-lg font-black text-white flex items-center gap-2">
                                    <AlertTriangle size={18} className="text-rose-500" />
                                    NOUVEAU FARDEAU
                                </h3>
                                <button onClick={() => setIsAddModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-400 transition-colors"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleCreateDebt} className="p-8 space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Créancier de Guerre</label>
                                    <input
                                        type="text"
                                        required
                                        value={newDebt.creditor}
                                        onChange={e => setNewDebt({ ...newDebt, creditor: e.target.value })}
                                        className="bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 w-full text-white outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20 transition-all placeholder-slate-700"
                                        placeholder="Ex: Banque Centrale, Mercenaire..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Somme Emprisonnée</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            required
                                            value={newDebt.amount}
                                            onChange={e => setNewDebt({ ...newDebt, amount: e.target.value })}
                                            className="bg-slate-950/50 border border-white/5 rounded-xl px-4 py-4 w-full text-2xl font-mono font-black text-rose-500 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20 transition-all pr-16"
                                            placeholder="0"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-rose-900">FCFA</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Date d'Exécution</label>
                                        <input
                                            type="date"
                                            value={newDebt.due_date}
                                            onChange={e => setNewDebt({ ...newDebt, due_date: e.target.value })}
                                            className="bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 w-full text-white outline-none focus:border-rose-500/50 transition-all text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Insigne</label>
                                        <select
                                            value={newDebt.icon}
                                            onChange={e => setNewDebt({ ...newDebt, icon: e.target.value })}
                                            className="bg-slate-950/50 border border-white/5 rounded-xl px-4 py-3 w-full text-white outline-none focus:border-rose-500/50 transition-all text-sm appearance-none"
                                        >
                                            <option value="📜">📜 Contrat</option>
                                            <option value="🏦">🏦 Banque</option>
                                            <option value="🏠">🏠 Loyer</option>
                                            <option value="🚗">🚗 Auto</option>
                                            <option value="⚖️">⚖️ Justice</option>
                                            <option value="🤝">🤝 Prêt Ami</option>
                                        </select>
                                    </div>
                                </div>
                                <button type="submit" className="btn-tactical-primary w-full bg-rose-600 hover:bg-rose-500 py-4 text-sm tracking-widest">
                                    RECONNAÎTRE LA DETTE
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}

                {isPayModalOpen && selectedDebt && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-emerald-600/10">
                                <h3 className="text-lg font-black text-white flex items-center gap-2">
                                    <ShieldCheck size={18} className="text-emerald-500" />
                                    LIBÉRER DU CAPITAL
                                </h3>
                                <button onClick={() => setIsPayModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
                            </div>
                            <form onSubmit={handlePayment} className="p-8 space-y-6 text-center">
                                <div>
                                    <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Remboursement Vers</div>
                                    <div className="text-2xl font-black text-white uppercase tracking-tight">{selectedDebt.creditor_name}</div>
                                    <div className="inline-block mt-3 px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full text-[10px] font-black text-rose-500 uppercase tracking-widest">
                                        Reste: {formatCurrency(selectedDebt.remaining_amount)}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Somme à Verser</label>
                                    <input
                                        type="number"
                                        required
                                        autoFocus
                                        value={paymentAmount}
                                        onChange={e => setPaymentAmount(e.target.value)}
                                        className="bg-slate-950/50 border border-white/10 rounded-2xl px-4 py-6 w-full text-center text-4xl font-mono font-black text-emerald-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                        placeholder="0"
                                    />
                                </div>
                                <button type="submit" className="btn-tactical-primary w-full bg-emerald-600 hover:bg-emerald-500 py-4 font-black tracking-[0.2em]">
                                    CONFIRMER LE PAIEMENT
                                </button>
                                <p className="text-[9px] text-slate-600 font-bold uppercase">Cette action déduira le montant de votre solde actuel.</p>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DebtsPage;

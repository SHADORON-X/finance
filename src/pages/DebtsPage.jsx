import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldAlert, ShieldCheck, Plus, TrendingDown,
    Calendar, AlertTriangle, CheckCircle2, Wallet,
    Trash2, X, ArrowRight, Shield
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

        try {
            await addDebtPayment(selectedDebt.id, user.id, parseFloat(paymentAmount));
            toast.success("Honneur sauf ! Paiement enregistré.");
            setIsPayModalOpen(false);
            setPaymentAmount('');
            loadData();
        } catch (error) {
            toast.error("Erreur de paiement");
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
    const totalDebt = debts.reduce((acc, d) => acc + d.remaining_amount, 0);
    const totalOriginal = debts.reduce((acc, d) => acc + d.total_amount, 0);
    const totalPaid = totalOriginal - totalDebt;
    const progressTotal = totalOriginal > 0 ? (totalPaid / totalOriginal) * 100 : 100;

    return (
        <div className="space-y-6 fade-in pb-24">
            {/* Header / Hero */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card-gold bg-gradient-to-br from-rose-950/40 to-slate-900 border-rose-500/20 p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-rose-400 mb-2">
                            <ShieldAlert size={20} />
                            <span className="text-xs font-bold uppercase tracking-wider">Fardeau Restant</span>
                        </div>
                        <h1 className="text-4xl font-mono font-bold text-white mb-2">
                            {formatCurrency(totalDebt)}
                        </h1>
                        <p className="text-sm text-slate-400">
                            Montant total à rembourser pour retrouver votre liberté.
                        </p>
                    </div>
                </div>

                <div className="card p-6 flex flex-col justify-center">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-bold text-slate-400 uppercase">Libération</span>
                        <span className="text-2xl font-bold text-emerald-400">{Math.round(progressTotal)}%</span>
                    </div>
                    <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                        <motion.div
                            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 relative"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressTotal}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                        >
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
                        </motion.div>
                    </div>
                    <div className="flex justify-between mt-3 text-xs text-slate-500">
                        <span>Paiement Total: {formatCurrency(totalPaid)}</span>
                        <span>Dette Initiale: {formatCurrency(totalOriginal)}</span>
                    </div>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded-xl border border-slate-800 backdrop-blur-sm sticky top-0 z-20">
                <div className="px-3 py-1 bg-slate-800 rounded-lg text-xs font-bold text-slate-400 border border-slate-700">
                    {debts.length} Dossiers Actifs
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="btn bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/20 flex items-center gap-2"
                >
                    <Plus size={18} /> Ajouter une Dette
                </button>
            </div>

            {/* Debts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {debts.map((debt, index) => {
                        const progress = ((debt.total_amount - debt.remaining_amount) / debt.total_amount) * 100;
                        const isPaid = debt.remaining_amount <= 0;

                        return (
                            <motion.div
                                key={debt.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.1 }}
                                className={`card relative overflow-hidden group hover:border-slate-500 transition-all ${isPaid ? 'border-emerald-500/30 bg-emerald-900/5' : 'border-rose-500/20'
                                    }`}
                            >
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner border ${isPaid ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-800 border-slate-700'
                                            }`}>
                                            {debt.icon}
                                        </div>
                                        <div className="flex gap-1">
                                            {!isPaid && (
                                                <button
                                                    onClick={() => { setSelectedDebt(debt); setIsPayModalOpen(true); }}
                                                    className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors border border-emerald-500/20"
                                                    title="Rembourser"
                                                >
                                                    <Wallet size={18} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(debt.id)}
                                                className="p-2 hover:bg-rose-500/10 text-slate-500 hover:text-rose-500 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-white mb-0.5">{debt.creditor_name}</h3>
                                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                                        <Calendar size={12} className={new Date(debt.due_date) < new Date() && !isPaid ? 'text-rose-500' : ''} />
                                        <span className={new Date(debt.due_date) < new Date() && !isPaid ? 'text-rose-500 font-bold' : ''}>
                                            Échéance : {debt.due_date ? new Date(debt.due_date).toLocaleDateString() : 'Non définie'}
                                        </span>
                                    </div>

                                    {/* Amount Display */}
                                    <div className="mb-4 bg-slate-950/50 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                                        <div>
                                            <div className="text-[10px] text-slate-500 uppercase">Restant</div>
                                            <div className={`text-lg font-mono font-bold ${isPaid ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {formatCurrency(debt.remaining_amount)}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] text-slate-500 uppercase">Total</div>
                                            <div className="text-sm text-slate-400">{formatCurrency(debt.total_amount)}</div>
                                        </div>
                                    </div>

                                    {/* Progress */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className={isPaid ? "text-emerald-400 font-bold" : "text-slate-400"}>
                                                {isPaid ? "Dette Acquittée" : `${Math.round(progress)}% Remboursé`}
                                            </span>
                                        </div>
                                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div
                                                className={`h-full ${isPaid ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    {isPaid && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] z-10">
                                            <div className="bg-emerald-500 text-slate-900 px-4 py-2 rounded-xl font-black uppercase tracking-widest -rotate-12 shadow-2xl border-4 border-white/20">
                                                PAYÉ
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {debts.length === 0 && !loading && (
                    <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
                        <ShieldCheck size={64} className="mx-auto text-emerald-500/50 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Aucune Dette Active</h3>
                        <p className="text-slate-400">Vous êtes un guerrier libre de tout fardeau.</p>
                    </div>
                )}
            </div>

            {/* ADD COMPONENT MODAL */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
                        >
                            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-rose-950/30">
                                <h3 className="text-lg font-bold text-rose-100 flex items-center gap-2">
                                    <AlertTriangle size={18} className="text-rose-500" />
                                    Nouveau Fardeau
                                </h3>
                                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleCreateDebt} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Créancier (Qui ?)</label>
                                    <input
                                        type="text"
                                        required
                                        value={newDebt.creditor}
                                        onChange={e => setNewDebt({ ...newDebt, creditor: e.target.value })}
                                        className="input w-full"
                                        placeholder="Ex: Banque, Ami, Impôts..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Montant Dû</label>
                                    <input
                                        type="number"
                                        required
                                        value={newDebt.amount}
                                        onChange={e => setNewDebt({ ...newDebt, amount: e.target.value })}
                                        className="input w-full text-lg font-mono text-rose-400 border-rose-900/50 focus:border-rose-500"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Échéance</label>
                                        <input
                                            type="date"
                                            value={newDebt.due_date}
                                            onChange={e => setNewDebt({ ...newDebt, due_date: e.target.value })}
                                            className="input w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Icône</label>
                                        <select
                                            value={newDebt.icon}
                                            onChange={e => setNewDebt({ ...newDebt, icon: e.target.value })}
                                            className="input w-full"
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
                                <button type="submit" className="btn bg-rose-600 hover:bg-rose-500 text-white w-full mt-2 font-bold shadow-lg shadow-rose-900/30">
                                    Reconnaître la Dette
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* PAY COMPONENT MODAL */}
            <AnimatePresence>
                {isPayModalOpen && selectedDebt && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl"
                        >
                            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-emerald-950/30">
                                <h3 className="text-lg font-bold text-emerald-100 flex items-center gap-2">
                                    <ShieldCheck size={18} className="text-emerald-500" />
                                    Effectuer un Payement
                                </h3>
                                <button onClick={() => setIsPayModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
                            </div>
                            <form onSubmit={handlePayment} className="p-6 space-y-4">
                                <div className="text-center mb-4">
                                    <div className="text-xs text-slate-500 uppercase font-bold">Remboursement pour</div>
                                    <div className="text-xl font-bold text-white">{selectedDebt.creditor_name}</div>
                                    <div className="text-sm text-rose-400 font-mono mt-1">
                                        Reste: {formatCurrency(selectedDebt.remaining_amount)}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Montant versé</label>
                                    <input
                                        type="number"
                                        required
                                        autoFocus
                                        value={paymentAmount}
                                        onChange={e => setPaymentAmount(e.target.value)}
                                        className="input w-full text-center text-2xl font-bold text-emerald-400 border-emerald-900/50 focus:border-emerald-500"
                                        placeholder="0"
                                    />
                                </div>
                                <button type="submit" className="btn bg-emerald-600 hover:bg-emerald-500 text-white w-full mt-2 font-bold shadow-lg shadow-emerald-900/30">
                                    Confirmer le Paiement
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DebtsPage;

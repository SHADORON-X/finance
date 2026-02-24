import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store';
import { getCategories, updateCategory } from '../services/balanceService';
import { createIncome } from '../services/transactionService';
import { useCurrency } from '../hooks/useCurrency';
import toast from 'react-hot-toast';
import { ArrowRight, Activity, Percent, Save, PlusCircle, TrendingUp, TrendingDown, History } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale,
    BarElement, Title, Tooltip, Legend
} from 'chart.js';
import { format, subDays } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function DailyRevenueCard({ onUpdate }) {
    const { user } = useAuthStore();
    const { formatCurrency } = useCurrency();

    const [categories, setCategories] = useState([]);
    const [amount, setAmount] = useState('');
    const [isDistributing, setIsDistributing] = useState(false);

    // Pour l'édition des %
    const [isEditingPercents, setIsEditingPercents] = useState(false);
    const [tempPercents, setTempPercents] = useState({});

    // Graphique
    const [history, setHistory] = useState([]);

    useEffect(() => {
        if (user) {
            loadCategories();
            loadHistory();
        }
    }, [user]);

    const loadCategories = async () => {
        const data = await getCategories(user.id);
        const filtered = data.filter(c => !c.locked); // Optionnel, ou on laisse tout pour allouer. On va tout laisser comme dans le Blueprint.
        setCategories(data);
        const percents = {};
        data.forEach(c => { percents[c.id] = c.percent || 0; });
        setTempPercents(percents);
    };

    const loadHistory = async () => {
        // Transactions 'income' sur les 7 derniers jours
        const past7Days = [...Array(7)].map((_, i) => format(subDays(new Date(), i), 'yyyy-MM-dd')).reverse();

        const { data, error } = await supabase
            .from('transactions')
            .select('amount, timestamp')
            .eq('user_id', user.id)
            .eq('type', 'income')
            .gte('timestamp', format(subDays(new Date(), 7), 'yyyy-MM-dd'));

        if (error) return;

        const grouped = {};
        past7Days.forEach(d => grouped[d] = 0);

        data.forEach(trans => {
            const date = trans.timestamp.split('T')[0];
            if (grouped[date] !== undefined) {
                grouped[date] += Number(trans.amount);
            }
        });

        setHistory(past7Days.map(date => ({
            date: date.substring(8, 10) + '/' + date.substring(5, 7),
            total: grouped[date]
        })));
    };

    const totalPercent = Object.values(tempPercents).reduce((s, val) => s + Number(val || 0), 0);

    const savePercents = async () => {
        if (totalPercent !== 100) {
            toast.error("Le total des pourcentages doit être exactement 100%.");
            return;
        }

        const toastId = toast.loading("Sauvegarde des allocations...");
        try {
            for (const [id, pct] of Object.entries(tempPercents)) {
                await updateCategory(id, user.id, { percent: Number(pct) });
            }
            toast.success("Structure Blueprint mise à jour !", { id: toastId });
            setIsEditingPercents(false);
            loadCategories();
        } catch (error) {
            toast.error("Erreur de sauvegarde", { id: toastId });
        }
    };

    const handleDistribute = async () => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) return toast.error("Montant invalide");

        const totalAlloc = categories.reduce((s, c) => s + (c.percent || 0), 0);
        if (totalAlloc !== 100) return toast.error("Vos secteurs ne sont pas équilibrés à 100% !");

        setIsDistributing(true);
        const toastId = toast.loading("Répartition tactique en cours...");
        try {
            // Créer le revenu et synchroniser les balances (automatiquement dans createIncome)
            const activeCategories = categories.filter(c => c.percent > 0);
            await createIncome(user.id, numAmount, activeCategories);

            toast.success(`Succès ! ${formatCurrency(numAmount)} injectés dans vos secteurs.`, { id: toastId });
            setAmount('');
            loadCategories();
            loadHistory();
            if (onUpdate) onUpdate();
        } catch (error) {
            toast.error("Échec de la répartition.", { id: toastId });
        } finally {
            setIsDistributing(false);
        }
    };

    // Chart Data
    const chartData = {
        labels: history.map(h => h.date),
        datasets: [{
            label: 'Revenus générés',
            data: history.map(h => h.total),
            backgroundColor: '#10b981', // emerald
            borderRadius: 4,
            barThickness: 'flex',
            maxBarThickness: 30
        }]
    };
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: { label: (ctx) => formatCurrency(ctx.raw) }
            }
        },
        scales: {
            x: { grid: { display: false, color: '#334155' }, ticks: { color: '#64748b', font: { size: 10 } } },
            y: { grid: { color: '#1e293b' }, ticks: { color: '#64748b', font: { size: 10 }, callback: (v) => v > 1000 ? (v / 1000) + 'k' : v } }
        }
    };

    return (
        <div className="card-warrior p-6 bg-slate-900 overflow-hidden mb-8 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-emerald-500/10 rounded-2xl">
                    <Activity size={24} className="text-emerald-500" />
                </div>
                <div>
                    <h2 className="text-xl font-ancient font-black text-white uppercase tracking-widest">Saisine Journalière</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Déléguez vos revenus quotidiens dans vos comptes (Blueprint)</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* GAUCHE : Saisie et Paramètres */}
                <div className="flex flex-col gap-6">
                    {/* Input */}
                    <div className="bg-slate-950 p-4 rounded-3xl border border-white/5 flex gap-2">
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Revenu généré du jour (Ex: 60000)"
                            className="flex-1 bg-transparent text-white font-ancient text-sm px-4 outline-none placeholder-slate-700"
                        />
                        <button
                            onClick={handleDistribute}
                            disabled={isDistributing || !amount || parseFloat(amount) <= 0}
                            className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            <ArrowRight size={14} /> Injecter
                        </button>
                    </div>

                    {/* Paramétrage des % */}
                    <div className="bg-slate-950/50 p-5 rounded-3xl border border-white/5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <Percent size={12} className="text-amber-500" /> Routage des flux
                            </h3>
                            <button
                                onClick={() => isEditingPercents ? savePercents() : setIsEditingPercents(true)}
                                className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${isEditingPercents ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                            >
                                {isEditingPercents ? <><Save size={10} /> Sauvegarder</> : <><Activity size={10} /> Modifier Allocations</>}
                            </button>
                        </div>

                        <div className="space-y-3">
                            {categories.map(category => (
                                <div key={category.id} className="flex items-center justify-between gap-4 p-2.5 rounded-xl bg-slate-900/80 border border-white/5">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-lg shrink-0">
                                            {category.icon}
                                        </div>
                                        <div className="truncate text-xs font-ancient font-black text-white">{category.name}</div>
                                    </div>

                                    {isEditingPercents ? (
                                        <div className="flex items-center gap-1 shrink-0">
                                            <input
                                                type="number"
                                                value={tempPercents[category.id]}
                                                onChange={(e) => setTempPercents({ ...tempPercents, [category.id]: e.target.value })}
                                                className="w-14 bg-slate-950 border border-amber-500/50 rounded-lg px-2 py-1 text-center text-xs text-amber-500 font-bold outline-none font-mono"
                                            />
                                            <span className="text-[10px] text-slate-500 font-black">%</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 shrink-0">
                                            {/* PREVIEW EN DIRECT : Affiche le montant projeté si un montant est tapé */}
                                            {parseFloat(amount) > 0 && (
                                                <div className="text-[10px] font-mono text-emerald-400 font-bold opacity-80">
                                                    +{formatCurrency((parseFloat(amount) * category.percent) / 100)}
                                                </div>
                                            )}
                                            <div className="text-[11px] font-mono font-black text-amber-500 bg-amber-500/10 px-2 py-1.5 rounded-lg border border-amber-500/20">
                                                {category.percent}%
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {isEditingPercents && (
                                <div className="pt-2 text-[9px] font-black text-right uppercase tracking-wider">
                                    <span className={totalPercent > 100 ? 'text-rose-500' : 'text-slate-500'}>
                                        TOTAL: {totalPercent}% / 100%
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* DROITE : Historique et Data Graphique */}
                <div className="flex flex-col bg-slate-950 rounded-3xl p-5 border border-white/5 shadow-inner min-h-[300px]">
                    <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2 mb-6">
                        <History size={12} /> Fréquence de Victoire
                    </h3>

                    <div className="flex-1 w-full relative">
                        {history.length > 0 ? (
                            <Bar data={chartData} options={chartOptions} />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-600">
                                Données insuffisantes
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

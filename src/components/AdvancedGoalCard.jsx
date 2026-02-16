// =====================================================
// CARTE D'OBJECTIF AVANCÉE - DESIGN MODERNE
// Avec graphique, prédictions, et conseils IA
// =====================================================

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Target, TrendingUp, Calendar, CheckCircle2, Plus, Trash2,
    ChevronDown, ChevronUp, Sparkles, Zap, AlertTriangle
} from 'lucide-react';
import GoalProgressChart from './GoalProgressChart';
import { analyzeGoalProgress } from '../services/allocationAIService';
import toast from 'react-hot-toast';

export default function AdvancedGoalCard({
    goal,
    contributions = [],
    onContribute,
    onDelete,
    index = 0
}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [aiAdvice, setAiAdvice] = useState(null);
    const [loadingAI, setLoadingAI] = useState(false);

    const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
    const isCompleted = progress >= 100;
    const remaining = Math.max(0, goal.target_amount - goal.current_amount);

    // Calculer les prédictions
    const prediction = calculatePrediction();
    const optimization = calculateOptimization();

    function calculatePrediction() {
        if (contributions.length < 2) return null;

        const avgContribution = contributions.reduce((sum, c) => sum + c.amount, 0) / contributions.length;
        const sortedContribs = [...contributions].sort((a, b) =>
            new Date(a.created_at) - new Date(b.created_at)
        );

        let totalDays = 0;
        for (let i = 1; i < sortedContribs.length; i++) {
            const days = (new Date(sortedContribs[i].created_at) - new Date(sortedContribs[i - 1].created_at)) / (1000 * 60 * 60 * 24);
            totalDays += days;
        }
        const avgDaysBetween = totalDays / (sortedContribs.length - 1);

        const contributionsNeeded = Math.ceil(remaining / avgContribution);
        const daysNeeded = contributionsNeeded * avgDaysBetween;

        const predictedDate = new Date();
        predictedDate.setDate(predictedDate.getDate() + daysNeeded);

        return {
            avgContribution,
            avgDaysBetween,
            contributionsNeeded,
            daysNeeded,
            predictedDate,
            onTrack: goal.deadline ? predictedDate <= new Date(goal.deadline) : true
        };
    }

    function calculateOptimization() {
        if (!goal.deadline) return null;

        const now = new Date();
        const deadline = new Date(goal.deadline);
        const daysRemaining = Math.max(0, (deadline - now) / (1000 * 60 * 60 * 24));

        if (daysRemaining === 0 || remaining <= 0) return null;

        const recommended = {
            amount: remaining / (daysRemaining / 7),
            frequency: 'par semaine'
        };

        return {
            daysRemaining: Math.ceil(daysRemaining),
            remaining,
            recommended,
            urgency: daysRemaining < 30 ? 'high' : daysRemaining < 90 ? 'medium' : 'low'
        };
    }

    const getAIAdvice = async () => {
        setLoadingAI(true);
        try {
            const advice = await analyzeGoalProgress(goal, contributions, prediction, optimization);
            setAiAdvice(advice);
        } catch (error) {
            toast.error("L'Oracle médite...");
        } finally {
            setLoadingAI(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const getUrgencyColor = () => {
        if (!optimization) return 'blue';
        if (optimization.urgency === 'high') return 'rose';
        if (optimization.urgency === 'medium') return 'amber';
        return 'emerald';
    };

    const urgencyColor = getUrgencyColor();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.1 }}
            className={`group relative rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 transition-all duration-500 overflow-hidden ${isCompleted
                    ? 'border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)]'
                    : `border-${urgencyColor}-500/30 hover:border-${urgencyColor}-500/60 shadow-xl hover:shadow-2xl`
                }`}
        >
            {/* Glow Effect */}
            <div className={`absolute -inset-1 bg-gradient-to-r ${isCompleted
                    ? 'from-emerald-500/20 to-cyan-500/20'
                    : `from-${urgencyColor}-500/10 to-purple-500/10`
                } opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500`} />

            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }} />
            </div>

            <div className="relative z-10 p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                        <motion.div
                            className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-lg ${isCompleted
                                    ? 'bg-emerald-500/20 ring-2 ring-emerald-500/50'
                                    : `bg-${urgencyColor}-500/10 ring-2 ring-${urgencyColor}-500/30`
                                }`}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            {goal.icon || '🎯'}
                        </motion.div>

                        <div>
                            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                                {goal.name || goal.title}
                            </h3>
                            {goal.deadline && (
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                    <Calendar size={14} />
                                    <span>{new Date(goal.deadline).toLocaleDateString('fr-FR', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        {isCompleted ? (
                            <motion.span
                                className="px-4 py-2 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-bold border-2 border-emerald-500/50 flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <CheckCircle2 size={16} /> ACCOMPLI
                            </motion.span>
                        ) : (
                            <>
                                <span className={`text-3xl font-mono font-bold text-${urgencyColor}-400`}>
                                    {Math.round(progress)}%
                                </span>
                                {optimization && (
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${optimization.urgency === 'high'
                                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50'
                                            : optimization.urgency === 'medium'
                                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                                        }`}>
                                        {optimization.daysRemaining} jours
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Montants */}
                <div className="mb-6">
                    <div className="flex items-baseline gap-3 mb-2">
                        <span className={`text-3xl font-mono font-bold ${isCompleted ? 'text-emerald-400' : 'text-white'
                            }`}>
                            {formatCurrency(goal.current_amount)}
                        </span>
                        <span className="text-lg text-slate-500 font-medium">
                            / {formatCurrency(goal.target_amount)}
                        </span>
                    </div>
                    {!isCompleted && (
                        <p className="text-sm text-slate-400">
                            Reste: <span className="font-bold text-amber-400">{formatCurrency(remaining)}</span>
                        </p>
                    )}
                </div>

                {/* Barre de progression moderne */}
                <div className="relative h-3 bg-slate-800/50 rounded-full overflow-hidden mb-6 ring-1 ring-slate-700/50">
                    <motion.div
                        className={`absolute top-0 left-0 h-full ${isCompleted
                                ? 'bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-[0_0_15px_rgba(16,185,129,0.6)]'
                                : `bg-gradient-to-r from-${urgencyColor}-400 to-purple-400 shadow-[0_0_15px_rgba(59,130,246,0.6)]`
                            }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                    />
                    {/* Pulse effect */}
                    {!isCompleted && (
                        <motion.div
                            className={`absolute top-0 h-full w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent`}
                            animate={{ left: ['-20%', '120%'] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            style={{ width: `${progress}%` }}
                        />
                    )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                        <p className="text-xs text-slate-400 mb-1">Contributions</p>
                        <p className="text-lg font-bold text-purple-400">{contributions.length}</p>
                    </div>
                    {prediction && (
                        <>
                            <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                                <p className="text-xs text-slate-400 mb-1">Moyenne</p>
                                <p className="text-lg font-bold text-blue-400">
                                    {(prediction.avgContribution / 1000).toFixed(0)}K
                                </p>
                            </div>
                            <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                                <p className="text-xs text-slate-400 mb-1">Fréquence</p>
                                <p className="text-lg font-bold text-cyan-400">
                                    {Math.round(prediction.avgDaysBetween)}j
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mb-4">
                    {!isCompleted && (
                        <button
                            onClick={onContribute}
                            className={`flex-1 py-3 rounded-xl bg-gradient-to-r from-${urgencyColor}-600 to-purple-600 hover:from-${urgencyColor}-500 hover:to-purple-500 text-white font-bold shadow-lg transition-all flex items-center justify-center gap-2`}
                        >
                            <Plus size={18} /> Contribuer
                        </button>
                    )}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="px-4 py-3 rounded-xl border-2 border-slate-700 hover:border-blue-500 hover:bg-blue-500/10 text-slate-400 hover:text-blue-400 transition-all flex items-center gap-2"
                    >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        Détails
                    </button>
                    <button
                        onClick={onDelete}
                        className="px-4 py-3 rounded-xl border-2 border-slate-700 hover:border-rose-500 hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-all"
                        title="Supprimer"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>

                {/* Section Expandable */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-6 border-t-2 border-slate-700/50 space-y-6">
                                {/* Graphique */}
                                {contributions.length > 0 && (
                                    <GoalProgressChart
                                        goal={goal}
                                        contributions={contributions}
                                        onOptimize={(opt) => {
                                            toast.success(`Stratégie: ${formatCurrency(opt.recommended.amount)} ${opt.recommended.frequency}`);
                                        }}
                                    />
                                )}

                                {/* Conseil IA */}
                                <div className="bg-gradient-to-br from-purple-900/20 to-slate-900/50 border-2 border-purple-700/30 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-bold text-purple-400 flex items-center gap-2">
                                            <Sparkles size={16} />
                                            Conseil de l'Oracle
                                        </h4>
                                        <button
                                            onClick={getAIAdvice}
                                            disabled={loadingAI}
                                            className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50"
                                        >
                                            {loadingAI ? 'Méditation...' : 'Consulter'}
                                        </button>
                                    </div>
                                    {aiAdvice && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-sm text-slate-300 leading-relaxed whitespace-pre-line"
                                        >
                                            {aiAdvice}
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

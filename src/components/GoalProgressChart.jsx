// =====================================================
// GRAPHIQUE DE PROGRESSION D'OBJECTIF AVANCÉ
// Avec prédictions, optimisations et conseils
// =====================================================

import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { TrendingUp, TrendingDown, Target, Calendar, Zap, AlertTriangle } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function GoalProgressChart({ goal, contributions = [], onOptimize }) {
    const [prediction, setPrediction] = useState(null);
    const [optimization, setOptimization] = useState(null);

    useEffect(() => {
        calculatePrediction();
        calculateOptimization();
    }, [goal, contributions]);

    const calculatePrediction = () => {
        if (contributions.length < 2) {
            setPrediction(null);
            return;
        }

        // Calculer la moyenne des contributions
        const avgContribution = contributions.reduce((sum, c) => sum + c.amount, 0) / contributions.length;

        // Calculer le temps moyen entre contributions (en jours)
        const sortedContribs = [...contributions].sort((a, b) =>
            new Date(a.created_at) - new Date(b.created_at)
        );

        let totalDays = 0;
        for (let i = 1; i < sortedContribs.length; i++) {
            const days = (new Date(sortedContribs[i].created_at) - new Date(sortedContribs[i - 1].created_at)) / (1000 * 60 * 60 * 24);
            totalDays += days;
        }
        const avgDaysBetween = totalDays / (sortedContribs.length - 1);

        // Calculer combien de contributions restantes nécessaires
        const remaining = goal.target_amount - goal.current_amount;
        const contributionsNeeded = Math.ceil(remaining / avgContribution);
        const daysNeeded = contributionsNeeded * avgDaysBetween;

        const predictedDate = new Date();
        predictedDate.setDate(predictedDate.getDate() + daysNeeded);

        setPrediction({
            avgContribution,
            avgDaysBetween,
            contributionsNeeded,
            daysNeeded,
            predictedDate,
            onTrack: goal.deadline ? predictedDate <= new Date(goal.deadline) : true
        });
    };

    const calculateOptimization = () => {
        if (!goal.deadline) {
            setOptimization(null);
            return;
        }

        const now = new Date();
        const deadline = new Date(goal.deadline);
        const daysRemaining = Math.max(0, (deadline - now) / (1000 * 60 * 60 * 24));
        const remaining = goal.target_amount - goal.current_amount;

        if (daysRemaining === 0 || remaining <= 0) {
            setOptimization(null);
            return;
        }

        // Calculer différentes stratégies
        const strategies = {
            daily: {
                amount: remaining / daysRemaining,
                frequency: 'par jour',
                total: remaining
            },
            weekly: {
                amount: remaining / (daysRemaining / 7),
                frequency: 'par semaine',
                total: remaining
            },
            monthly: {
                amount: remaining / (daysRemaining / 30),
                frequency: 'par mois',
                total: remaining
            }
        };

        // Trouver la stratégie la plus réaliste (hebdomadaire généralement)
        const recommended = strategies.weekly;

        setOptimization({
            daysRemaining: Math.ceil(daysRemaining),
            remaining,
            strategies,
            recommended,
            urgency: daysRemaining < 30 ? 'high' : daysRemaining < 90 ? 'medium' : 'low'
        });
    };

    // Préparer les données pour le graphique
    const prepareChartData = () => {
        const sortedContribs = [...contributions].sort((a, b) =>
            new Date(a.created_at) - new Date(b.created_at)
        );

        // Données historiques
        const labels = ['Début'];
        const actualData = [0];

        sortedContribs.forEach((contrib, index) => {
            const date = new Date(contrib.created_at);
            labels.push(date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }));
            actualData.push(sortedContribs.slice(0, index + 1).reduce((sum, c) => sum + c.amount, 0));
        });

        // Ajouter le point actuel si différent
        if (actualData[actualData.length - 1] !== goal.current_amount) {
            labels.push('Maintenant');
            actualData.push(goal.current_amount);
        }

        // Ligne de l'objectif
        const targetData = new Array(labels.length).fill(goal.target_amount);

        // Données de prédiction
        let predictionData = new Array(labels.length).fill(null);
        if (prediction && prediction.contributionsNeeded > 0) {
            predictionData[predictionData.length - 1] = goal.current_amount;

            // Ajouter des points de prédiction
            const step = prediction.avgContribution;
            let current = goal.current_amount;
            for (let i = 0; i < Math.min(prediction.contributionsNeeded, 10); i++) {
                current += step;
                labels.push(`+${i + 1}`);
                actualData.push(null);
                targetData.push(goal.target_amount);
                predictionData.push(Math.min(current, goal.target_amount));
            }
        }

        return {
            labels,
            datasets: [
                {
                    label: 'Progression Réelle',
                    data: actualData,
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointBackgroundColor: 'rgb(59, 130, 246)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                },
                {
                    label: 'Prédiction',
                    data: predictionData,
                    borderColor: 'rgb(168, 85, 247)',
                    backgroundColor: 'rgba(168, 85, 247, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    tension: 0.4,
                    fill: false,
                    pointRadius: 4,
                    pointHoverRadius: 6
                },
                {
                    label: 'Objectif',
                    data: targetData,
                    borderColor: 'rgb(16, 185, 129)',
                    backgroundColor: 'rgba(16, 185, 129, 0.05)',
                    borderWidth: 2,
                    borderDash: [10, 5],
                    tension: 0,
                    fill: false,
                    pointRadius: 0
                }
            ]
        };
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    color: '#94a3b8',
                    font: {
                        size: 12,
                        weight: 'bold'
                    },
                    usePointStyle: true,
                    padding: 15
                }
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                titleColor: '#fff',
                bodyColor: '#cbd5e1',
                borderColor: '#475569',
                borderWidth: 1,
                padding: 12,
                displayColors: true,
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('fr-FR', {
                                style: 'currency',
                                currency: 'XOF',
                                minimumFractionDigits: 0
                            }).format(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(71, 85, 105, 0.3)',
                    drawBorder: false
                },
                ticks: {
                    color: '#94a3b8',
                    font: {
                        size: 11
                    },
                    callback: function (value) {
                        return (value / 1000000) + 'M';
                    }
                }
            },
            x: {
                grid: {
                    color: 'rgba(71, 85, 105, 0.2)',
                    drawBorder: false
                },
                ticks: {
                    color: '#94a3b8',
                    font: {
                        size: 10
                    },
                    maxRotation: 45,
                    minRotation: 45
                }
            }
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <div className="space-y-6">
            {/* Graphique */}
            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="text-blue-400" size={20} />
                    Progression vers l'objectif
                </h3>
                <div className="h-80">
                    <Line data={prepareChartData()} options={chartOptions} />
                </div>
            </div>

            {/* Prédiction */}
            {prediction && (
                <div className={`bg-gradient-to-br ${prediction.onTrack ? 'from-emerald-900/20 to-slate-900' : 'from-amber-900/20 to-slate-900'} border ${prediction.onTrack ? 'border-emerald-700/50' : 'border-amber-700/50'} rounded-2xl p-6`}>
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${prediction.onTrack ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
                            {prediction.onTrack ? (
                                <TrendingUp className="text-emerald-400" size={24} />
                            ) : (
                                <AlertTriangle className="text-amber-400" size={24} />
                            )}
                        </div>
                        <div className="flex-1">
                            <h4 className="text-lg font-bold text-white mb-2">
                                {prediction.onTrack ? '✅ Sur la bonne voie !' : '⚠️ Ajustement nécessaire'}
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-slate-400">Contribution moyenne</p>
                                    <p className="text-white font-bold">{formatCurrency(prediction.avgContribution)}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400">Fréquence moyenne</p>
                                    <p className="text-white font-bold">Tous les {Math.round(prediction.avgDaysBetween)} jours</p>
                                </div>
                                <div>
                                    <p className="text-slate-400">Contributions restantes</p>
                                    <p className="text-white font-bold">{prediction.contributionsNeeded}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400">Date prévue</p>
                                    <p className="text-white font-bold">{formatDate(prediction.predictedDate)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Optimisation */}
            {optimization && (
                <div className={`bg-gradient-to-br ${optimization.urgency === 'high' ? 'from-rose-900/20' : optimization.urgency === 'medium' ? 'from-amber-900/20' : 'from-blue-900/20'} to-slate-900 border ${optimization.urgency === 'high' ? 'border-rose-700/50' : optimization.urgency === 'medium' ? 'border-amber-700/50' : 'border-blue-700/50'} rounded-2xl p-6`}>
                    <div className="flex items-start gap-4 mb-6">
                        <div className={`p-3 rounded-xl ${optimization.urgency === 'high' ? 'bg-rose-500/20' : optimization.urgency === 'medium' ? 'bg-amber-500/20' : 'bg-blue-500/20'}`}>
                            <Zap className={optimization.urgency === 'high' ? 'text-rose-400' : optimization.urgency === 'medium' ? 'text-amber-400' : 'text-blue-400'} size={24} />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-lg font-bold text-white mb-1">
                                💡 Plan d'optimisation
                            </h4>
                            <p className="text-slate-400 text-sm">
                                {optimization.daysRemaining} jours restants • {formatCurrency(optimization.remaining)} à économiser
                            </p>
                        </div>
                    </div>

                    {/* Stratégies */}
                    <div className="space-y-3">
                        <h5 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Stratégies recommandées</h5>

                        {Object.entries(optimization.strategies).map(([key, strategy]) => (
                            <div key={key} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-white font-bold">{formatCurrency(strategy.amount)}</p>
                                        <p className="text-slate-400 text-sm">{strategy.frequency}</p>
                                    </div>
                                    {key === 'weekly' && (
                                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/30">
                                            Recommandé
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Conseils */}
                    <div className="mt-6 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
                        <p className="text-sm text-slate-300 leading-relaxed">
                            <strong className="text-white">💡 Conseil:</strong> Pour atteindre votre objectif à temps,
                            nous recommandons d'économiser <strong className="text-emerald-400">{formatCurrency(optimization.recommended.amount)}</strong> {optimization.recommended.frequency}.
                            {optimization.urgency === 'high' && ' ⚠️ Le délai est court, envisagez de réduire vos dépenses non essentielles.'}
                        </p>
                    </div>

                    {onOptimize && (
                        <button
                            onClick={() => onOptimize(optimization)}
                            className="w-full mt-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-lg"
                        >
                            Appliquer cette stratégie
                        </button>
                    )}
                </div>
            )}

            {/* Statistiques détaillées */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Progression</p>
                    <p className="text-2xl font-bold text-blue-400">
                        {Math.round((goal.current_amount / goal.target_amount) * 100)}%
                    </p>
                </div>
                <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Économisé</p>
                    <p className="text-2xl font-bold text-emerald-400">
                        {(goal.current_amount / 1000000).toFixed(1)}M
                    </p>
                </div>
                <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Restant</p>
                    <p className="text-2xl font-bold text-amber-400">
                        {((goal.target_amount - goal.current_amount) / 1000000).toFixed(1)}M
                    </p>
                </div>
                <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Contributions</p>
                    <p className="text-2xl font-bold text-purple-400">
                        {contributions.length}
                    </p>
                </div>
            </div>
        </div>
    );
}

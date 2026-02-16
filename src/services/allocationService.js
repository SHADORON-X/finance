// =====================================================
// SERVICE DE RÉPARTITION AUTOMATIQUE
// Distribue l'argent selon les objectifs et stratégies
// =====================================================

import { supabase } from '../lib/supabase';
import { ALLOCATION_STRATEGIES, STRATEGIC_ADVICE } from '../data/financialWisdom';

/**
 * Crée une allocation d'argent basée sur une stratégie
 */
export async function createAllocation(userId, amount, strategyKey, customAllocations = null) {
    try {
        const strategy = ALLOCATION_STRATEGIES[strategyKey];
        if (!strategy && !customAllocations) {
            throw new Error('Stratégie invalide');
        }

        const allocations = customAllocations || strategy.allocation;

        // Calculer les montants pour chaque catégorie
        const distribution = {};
        let totalPercentage = 0;

        for (const [category, percentage] of Object.entries(allocations)) {
            const categoryAmount = (amount * percentage) / 100;
            distribution[category] = {
                percentage,
                amount: categoryAmount
            };
            totalPercentage += percentage;
        }

        // Vérifier que le total fait 100%
        if (Math.abs(totalPercentage - 100) > 0.1) {
            throw new Error(`Le total des pourcentages doit être 100% (actuellement ${totalPercentage}%)`);
        }

        // Enregistrer l'allocation dans la base de données
        const { data, error } = await supabase
            .from('allocations')
            .insert({
                user_id: userId,
                amount,
                strategy_key: strategyKey,
                distribution,
                status: 'pending',
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        return { success: true, allocation: data };
    } catch (error) {
        console.error('Erreur création allocation:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Applique une allocation en créant les transactions correspondantes
 */
export async function applyAllocation(userId, allocationId) {
    try {
        // Récupérer l'allocation
        const { data: allocation, error: allocError } = await supabase
            .from('allocations')
            .select('*')
            .eq('id', allocationId)
            .eq('user_id', userId)
            .single();

        if (allocError) throw allocError;

        // Récupérer les objectifs de l'utilisateur
        const { data: goals, error: goalsError } = await supabase
            .from('goals')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'active');

        if (goalsError) throw goalsError;

        // Mapper les catégories d'allocation aux objectifs
        const transactions = [];
        const goalContributions = [];

        for (const [category, details] of Object.entries(allocation.distribution)) {
            // Trouver un objectif correspondant à cette catégorie
            const matchingGoal = goals.find(g =>
                g.category?.toLowerCase().includes(category.toLowerCase()) ||
                g.name?.toLowerCase().includes(category.toLowerCase())
            );

            if (matchingGoal) {
                // Créer une contribution à l'objectif
                goalContributions.push({
                    goal_id: matchingGoal.id,
                    user_id: userId,
                    amount: details.amount,
                    allocation_id: allocationId,
                    created_at: new Date().toISOString()
                });
            } else {
                // Créer une transaction générique
                transactions.push({
                    user_id: userId,
                    type: 'expense',
                    amount: details.amount,
                    category: category,
                    description: `Allocation automatique: ${category} (${details.percentage}%)`,
                    allocation_id: allocationId,
                    created_at: new Date().toISOString()
                });
            }
        }

        // Insérer les contributions aux objectifs
        if (goalContributions.length > 0) {
            const { error: contribError } = await supabase
                .from('goal_contributions')
                .insert(goalContributions);

            if (contribError) throw contribError;
        }

        // Insérer les transactions
        if (transactions.length > 0) {
            const { error: transError } = await supabase
                .from('transactions')
                .insert(transactions);

            if (transError) throw transError;
        }

        // Mettre à jour le statut de l'allocation
        const { error: updateError } = await supabase
            .from('allocations')
            .update({
                status: 'applied',
                applied_at: new Date().toISOString()
            })
            .eq('id', allocationId);

        if (updateError) throw updateError;

        return {
            success: true,
            contributionsCount: goalContributions.length,
            transactionsCount: transactions.length
        };
    } catch (error) {
        console.error('Erreur application allocation:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Obtient des conseils stratégiques basés sur la situation financière
 */
export async function getStrategicAdvice(userId) {
    try {
        // Récupérer les transactions pour calculer les revenus
        const { data: transactions, error: transError } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(100);

        if (transError) throw transError;

        // Récupérer les dettes actives
        const { data: debts, error: debtsError } = await supabase
            .from('debts')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'active');

        if (debtsError) throw debtsError;

        // Récupérer le solde total
        const { data: balances, error: balError } = await supabase
            .from('balances')
            .select('*')
            .eq('user_id', userId);

        if (balError) throw balError;

        // Calculer les métriques
        const totalIncome = transactions
            ?.filter(t => t.type === 'income')
            .reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

        const totalExpense = transactions
            ?.filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

        const totalDebt = debts
            ?.reduce((sum, d) => sum + (d.remaining_amount || d.amount || 0), 0) || 0;

        const totalSavings = balances
            ?.reduce((sum, b) => sum + (b.amount || 0), 0) || 0;

        // Déterminer la situation
        let situation = 'medium_income';

        if (totalDebt > totalIncome * 0.5) {
            situation = 'in_debt';
        } else if (totalIncome < 50000) {
            situation = 'low_income';
        } else if (totalIncome > 200000) {
            situation = 'high_income';
        }

        const advice = STRATEGIC_ADVICE[situation];
        const recommendedStrategy = ALLOCATION_STRATEGIES[advice.recommendedStrategy];

        return {
            success: true,
            situation,
            advice: advice.advice,
            recommendedStrategy: {
                key: advice.recommendedStrategy,
                ...recommendedStrategy
            },
            financialMetrics: {
                totalIncome,
                totalExpense,
                totalDebt,
                totalSavings,
                debtToIncomeRatio: totalIncome > 0 ? (totalDebt / totalIncome) * 100 : 0,
                savingsRate: totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0
            }
        };
    } catch (error) {
        console.error('Erreur obtention conseils:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Récupère toutes les allocations d'un utilisateur
 */
export async function getAllocations(userId, status = null) {
    try {
        let query = supabase
            .from('allocations')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) throw error;

        return { success: true, allocations: data };
    } catch (error) {
        console.error('Erreur récupération allocations:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Calcule une allocation personnalisée basée sur les objectifs de l'utilisateur
 */
export async function calculateCustomAllocation(userId) {
    try {
        // Récupérer les objectifs actifs
        const { data: goals, error: goalsError } = await supabase
            .from('goals')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'active')
            .order('priority', { ascending: false });

        if (goalsError) throw goalsError;

        if (!goals || goals.length === 0) {
            return {
                success: false,
                error: 'Aucun objectif actif. Créez des objectifs d\'abord.'
            };
        }

        // Calculer le total des priorités
        const totalPriority = goals.reduce((sum, goal) => sum + (goal.priority || 1), 0);

        // Calculer les pourcentages basés sur les priorités
        const customAllocation = {};

        goals.forEach(goal => {
            const percentage = ((goal.priority || 1) / totalPriority) * 100;
            const categoryKey = goal.category?.toLowerCase().replace(/\s+/g, '_') || goal.name.toLowerCase().replace(/\s+/g, '_');
            customAllocation[categoryKey] = Math.round(percentage * 100) / 100;
        });

        return {
            success: true,
            allocation: customAllocation,
            goals: goals.map(g => ({
                id: g.id,
                name: g.name,
                priority: g.priority,
                percentage: customAllocation[g.category?.toLowerCase().replace(/\s+/g, '_') || g.name.toLowerCase().replace(/\s+/g, '_')]
            }))
        };
    } catch (error) {
        console.error('Erreur calcul allocation personnalisée:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Simule une allocation sans l'appliquer
 */
export function simulateAllocation(amount, strategyKey) {
    const strategy = ALLOCATION_STRATEGIES[strategyKey];
    if (!strategy) {
        return { success: false, error: 'Stratégie invalide' };
    }

    const simulation = {};
    let total = 0;

    for (const [category, percentage] of Object.entries(strategy.allocation)) {
        const categoryAmount = (amount * percentage) / 100;
        simulation[category] = {
            percentage,
            amount: Math.round(categoryAmount)
        };
        total += categoryAmount;
    }

    return {
        success: true,
        strategy: strategy.name,
        simulation,
        total: Math.round(total),
        difference: Math.round(amount - total)
    };
}

export default {
    createAllocation,
    applyAllocation,
    getStrategicAdvice,
    getAllocations,
    calculateCustomAllocation,
    simulateAllocation
};

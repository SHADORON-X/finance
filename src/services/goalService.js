// =====================================================
// SERVICE DE GESTION DES OBJECTIFS
// =====================================================
import { supabase } from '../lib/supabase';

/**
 * Créer un nouvel objectif
 */
export const createGoal = async (userId, goalData) => {
    const { data, error } = await supabase
        .from('goals')
        .insert([
            {
                user_id: userId,
                title: goalData.title,
                description: goalData.description || '',
                target_amount: goalData.targetAmount,
                current_amount: 0,
                category: goalData.category || 'savings',
                priority: goalData.priority || 1,
                deadline: goalData.deadline || null,
                icon: goalData.icon || '🎯'
            }
        ])
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Obtenir tous les objectifs d'un utilisateur
 */
export const getGoals = async (userId, status = 'active') => {
    let query = supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('priority', { ascending: false })
        .order('deadline', { ascending: true });

    if (status) {
        query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
};

/**
 * Obtenir un objectif par ID
 */
export const getGoalById = async (goalId, userId) => {
    const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('id', goalId)
        .eq('user_id', userId)
        .single();

    if (error) throw error;
    return data;
};

/**
 * Contribuer à un objectif
 */
export const contributeToGoal = async (goalId, userId, amount, note = '') => {
    try {
        // 1. Créer la contribution
        const { data: contribution, error: contribError } = await supabase
            .from('goal_contributions')
            .insert([
                {
                    goal_id: goalId,
                    user_id: userId,
                    amount: amount,
                    note: note
                }
            ])
            .select()
            .single();

        if (contribError) throw contribError;

        // 2. Mettre à jour le montant actuel de l'objectif
        const { data: goal, error: goalError } = await supabase
            .from('goals')
            .select('current_amount, target_amount')
            .eq('id', goalId)
            .single();

        if (goalError) throw goalError;

        const newAmount = goal.current_amount + amount;

        const { error: updateError } = await supabase
            .from('goals')
            .update({ current_amount: newAmount })
            .eq('id', goalId);

        if (updateError) throw updateError;

        return contribution;
    } catch (error) {
        console.error('Error contributing to goal:', error);
        throw error;
    }
};

/**
 * Mettre à jour un objectif
 */
export const updateGoal = async (goalId, userId, updates) => {
    const { data, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', goalId)
        .eq('user_id', userId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Marquer un objectif comme complété
 */
export const completeGoal = async (goalId, userId) => {
    const { data, error } = await supabase
        .from('goals')
        .update({
            status: 'completed',
            completed_at: new Date().toISOString()
        })
        .eq('id', goalId)
        .eq('user_id', userId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Annuler un objectif
 */
export const cancelGoal = async (goalId, userId) => {
    const { data, error } = await supabase
        .from('goals')
        .update({ status: 'cancelled' })
        .eq('id', goalId)
        .eq('user_id', userId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Supprimer un objectif
 */
export const deleteGoal = async (goalId, userId) => {
    const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId)
        .eq('user_id', userId);

    if (error) throw error;
    return true;
};

/**
 * Obtenir l'historique des contributions d'un objectif
 */
export const getGoalContributions = async (goalId) => {
    const { data, error } = await supabase
        .from('goal_contributions')
        .select('*')
        .eq('goal_id', goalId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

/**
 * Obtenir les statistiques des objectifs
 */
export const getGoalsStats = async (userId) => {
    const { data, error } = await supabase
        .from('goals')
        .select('status, current_amount, target_amount')
        .eq('user_id', userId);

    if (error) throw error;

    const stats = {
        total: data.length,
        active: data.filter(g => g.status === 'active').length,
        completed: data.filter(g => g.status === 'completed').length,
        cancelled: data.filter(g => g.status === 'cancelled').length,
        totalTargetAmount: data.reduce((sum, g) => sum + g.target_amount, 0),
        totalCurrentAmount: data.reduce((sum, g) => sum + g.current_amount, 0),
        averageProgress: data.length > 0
            ? data.reduce((sum, g) => sum + (g.current_amount / g.target_amount * 100), 0) / data.length
            : 0
    };

    return stats;
};

/**
 * Obtenir les objectifs urgents (deadline proche)
 */
export const getUrgentGoals = async (userId, daysThreshold = 7) => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysThreshold);

    const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .lte('deadline', futureDate.toISOString().split('T')[0])
        .order('deadline', { ascending: true });

    if (error) throw error;
    return data;
};

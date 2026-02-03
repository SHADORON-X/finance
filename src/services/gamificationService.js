// =====================================================
// SERVICE DE GAMIFICATION
// =====================================================
import { supabase } from '../lib/supabase';

// Définition des rangs
export const RANKS = [
    { name: 'Recrue', minXP: 0, icon: '🎖️', level: 1 },
    { name: 'Soldat', minXP: 100, icon: '⚔️', level: 2 },
    { name: 'Sergent', minXP: 300, icon: '🗡️', level: 3 },
    { name: 'Lieutenant', minXP: 600, icon: '🛡️', level: 4 },
    { name: 'Capitaine', minXP: 1000, icon: '🏅', level: 5 },
    { name: 'Commandant', minXP: 1500, icon: '👑', level: 6 },
    { name: 'General', minXP: 2500, icon: '⭐', level: 7 },
    { name: 'Legende', minXP: 5000, icon: '🌟', level: 8 }
];

// Définition des badges
export const BADGES = [
    { id: 'first_income', name: 'Premier Pas', icon: '🌱', desc: 'Premier revenu enregistré' },
    { id: 'income_10', name: 'Régulier', icon: '📈', desc: '10 revenus enregistrés' },
    { id: 'income_50', name: 'Discipline', icon: '💪', desc: '50 revenus enregistrés' },
    { id: 'saver', name: 'Épargnant', icon: '🏦', desc: '10000 FCFA en épargne' },
    { id: 'mega_saver', name: 'Coffre Fort', icon: '💎', desc: '100000 FCFA en épargne' },
    { id: 'streak_7', name: 'Semaine Parfaite', icon: '🔥', desc: '7 jours de streak' },
    { id: 'streak_30', name: 'Mois Héroïque', icon: '🏆', desc: '30 jours de streak' },
    { id: 'streak_100', name: 'Centurion', icon: '👑', desc: '100 jours de streak' },
    { id: 'ops_100', name: 'Actif', icon: '⚡', desc: '100 opérations' },
    { id: 'ops_500', name: 'Vétéran', icon: '🎯', desc: '500 opérations' },
    { id: 'level_5', name: 'Capitaine', icon: '🏅', desc: 'Atteindre niveau 5' },
    { id: 'level_8', name: 'Légende', icon: '🌟', desc: 'Atteindre niveau max' },
    { id: 'goal_first', name: 'Visionnaire', icon: '🎯', desc: 'Premier objectif créé' },
    { id: 'goal_completed', name: 'Accomplissement', icon: '✅', desc: 'Premier objectif atteint' },
    { id: 'debt_free', name: 'Liberté', icon: '🦅', desc: 'Toutes les dettes payées' }
];

/**
 * Obtenir les données de gamification d'un utilisateur
 */
export const getGamificationData = async (userId) => {
    let { data, error } = await supabase
        .from('gamification')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(); // maybeSingle ne renvoie pas d'erreur 406 si vide

    if (error) throw error;

    // Si pas de données, on initialise
    if (!data) {
        console.log('Initializing gamification data for user:', userId);
        const { data: newData, error: insertError } = await supabase
            .from('gamification')
            .insert([{ user_id: userId, xp: 0, level: 1, current_streak: 0 }])
            .select()
            .single();

        if (insertError) throw insertError;
        return newData;
    }

    return data;
};

/**
 * Ajouter de l'XP à un utilisateur
 */
export const addXP = async (userId, xpAmount) => {
    try {
        // Récupérer l'XP actuel
        const { data: current, error: fetchError } = await supabase
            .from('gamification')
            .select('xp, level')
            .eq('user_id', userId)
            .single();

        if (fetchError) throw fetchError;

        const newXP = current.xp + xpAmount;
        const newLevel = calculateLevel(newXP);

        const { data, error } = await supabase
            .from('gamification')
            .update({
                xp: newXP,
                level: newLevel
            })
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;

        // Vérifier si niveau supérieur atteint
        const leveledUp = newLevel > current.level;

        return { data, leveledUp, oldLevel: current.level, newLevel };
    } catch (error) {
        console.error('Error adding XP:', error);
        throw error;
    }
};

/**
 * Calculer le niveau basé sur l'XP
 */
export const calculateLevel = (xp) => {
    for (let i = RANKS.length - 1; i >= 0; i--) {
        if (xp >= RANKS[i].minXP) {
            return RANKS[i].level;
        }
    }
    return 1;
};

/**
 * Obtenir le rang actuel
 */
export const getCurrentRank = (xp) => {
    for (let i = RANKS.length - 1; i >= 0; i--) {
        if (xp >= RANKS[i].minXP) {
            return RANKS[i];
        }
    }
    return RANKS[0];
};

/**
 * Obtenir le prochain rang
 */
export const getNextRank = (xp) => {
    for (let i = 0; i < RANKS.length; i++) {
        if (xp < RANKS[i].minXP) {
            return RANKS[i];
        }
    }
    return null; // Niveau max atteint
};

/**
 * Calculer la progression vers le prochain niveau (%)
 */
export const getXPProgress = (xp) => {
    const currentRank = getCurrentRank(xp);
    const nextRank = getNextRank(xp);

    if (!nextRank) return 100; // Niveau max

    const progress = ((xp - currentRank.minXP) / (nextRank.minXP - currentRank.minXP)) * 100;
    return Math.min(100, Math.max(0, progress));
};

/**
 * Mettre à jour le streak
 */
export const updateStreak = async (userId) => {
    try {
        // Appeler la fonction SQL
        const { error } = await supabase.rpc('update_user_streak', {
            p_user_id: userId
        });

        if (error) throw error;

        // Récupérer les nouvelles données
        const { data } = await supabase
            .from('gamification')
            .select('current_streak, best_streak')
            .eq('user_id', userId)
            .single();

        return data;
    } catch (error) {
        console.error('Error updating streak:', error);
        throw error;
    }
};

/**
 * Obtenir tous les badges débloqués
 */
export const getUnlockedBadges = async (userId) => {
    const { data, error } = await supabase
        .from('badges')
        .select('badge_code, unlocked_at')
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false });

    if (error) throw error;
    return data;
};

/**
 * Vérifier et débloquer les badges
 */
export const checkAndUnlockBadges = async (userId) => {
    try {
        // Récupérer les stats de l'utilisateur
        const { data: gamif } = await supabase
            .from('gamification')
            .select('*')
            .eq('user_id', userId)
            .single();

        // Récupérer l'épargne
        const { data: savings } = await supabase
            .from('balances')
            .select('amount')
            .eq('user_id', userId)
            .eq('category_id', (await supabase
                .from('categories')
                .select('id')
                .eq('user_id', userId)
                .eq('is_locked', true)
                .single()
            ).data.id)
            .single();

        // Récupérer les objectifs
        const { data: goals } = await supabase
            .from('goals')
            .select('status')
            .eq('user_id', userId);

        // Récupérer les dettes
        const { data: debts } = await supabase
            .from('debts')
            .select('status')
            .eq('user_id', userId);

        // Récupérer les badges déjà débloqués
        const { data: unlockedBadges } = await supabase
            .from('badges')
            .select('badge_code')
            .eq('user_id', userId);

        const unlockedCodes = unlockedBadges.map(b => b.badge_code);
        const newBadges = [];

        // Vérifier chaque badge
        const checks = {
            'first_income': gamif.total_incomes >= 1,
            'income_10': gamif.total_incomes >= 10,
            'income_50': gamif.total_incomes >= 50,
            'saver': savings?.amount >= 10000,
            'mega_saver': savings?.amount >= 100000,
            'streak_7': gamif.current_streak >= 7,
            'streak_30': gamif.current_streak >= 30,
            'streak_100': gamif.current_streak >= 100,
            'ops_100': gamif.total_operations >= 100,
            'ops_500': gamif.total_operations >= 500,
            'level_5': gamif.level >= 5,
            'level_8': gamif.level >= 8,
            'goal_first': goals?.length >= 1,
            'goal_completed': goals?.filter(g => g.status === 'completed').length >= 1,
            'debt_free': debts?.length > 0 && debts.every(d => d.status === 'paid')
        };

        // Débloquer les nouveaux badges
        for (const [badgeCode, condition] of Object.entries(checks)) {
            if (condition && !unlockedCodes.includes(badgeCode)) {
                await supabase
                    .from('badges')
                    .insert([{ user_id: userId, badge_code: badgeCode }]);

                const badge = BADGES.find(b => b.id === badgeCode);
                newBadges.push(badge);
            }
        }

        return newBadges;
    } catch (error) {
        console.error('Error checking badges:', error);
        throw error;
    }
};

/**
 * Obtenir les statistiques de gamification
 */
export const getGamificationStats = async (userId) => {
    const gamif = await getGamificationData(userId);
    const currentRank = getCurrentRank(gamif.xp);
    const nextRank = getNextRank(gamif.xp);
    const progress = getXPProgress(gamif.xp);
    const unlockedBadges = await getUnlockedBadges(userId);

    return {
        ...gamif,
        currentRank,
        nextRank,
        xpProgress: progress,
        unlockedBadgesCount: unlockedBadges.length,
        totalBadges: BADGES.length,
        unlockedBadges
    };
};

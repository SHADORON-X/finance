// =====================================================
// SERVICE DE GESTION DES CATÉGORIES ET BALANCES
// =====================================================
import { supabase } from '../lib/supabase';

/**
 * Obtenir toutes les catégories d'un utilisateur
 */
export const getCategories = async (userId) => {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .order('is_locked', { ascending: false })
        .order('name', { ascending: true });

    if (error) throw error;
    return data;
};

/**
 * Créer une nouvelle catégorie
 */
export const createCategory = async (userId, categoryData) => {
    const { data, error } = await supabase
        .from('categories')
        .insert([
            {
                user_id: userId,
                name: categoryData.name,
                icon: categoryData.icon || '📦',
                percent: categoryData.percent || 0,
                is_locked: categoryData.isLocked || false,
                color: categoryData.color || '#6366f1'
            }
        ])
        .select()
        .single();

    if (error) throw error;

    // Créer le solde initial
    await supabase
        .from('balances')
        .insert([
            {
                user_id: userId,
                category_id: data.id,
                amount: 0
            }
        ]);

    return data;
};

/**
 * Mettre à jour une catégorie
 */
export const updateCategory = async (categoryId, userId, updates) => {
    const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', categoryId)
        .eq('user_id', userId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Supprimer une catégorie
 */
export const deleteCategory = async (categoryId, userId) => {
    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId)
        .eq('user_id', userId);

    if (error) throw error;
    return true;
};

/**
 * Obtenir tous les soldes d'un utilisateur
 */
export const getBalances = async (userId) => {
    const { data, error } = await supabase
        .from('balances')
        .select(`
      *,
      categories (
        id,
        name,
        icon,
        percent,
        is_locked,
        color
      )
    `)
        .eq('user_id', userId);

    if (error) throw error;
    return data;
};

/**
 * Obtenir le solde d'une catégorie spécifique
 */
export const getCategoryBalance = async (userId, categoryId) => {
    const { data, error } = await supabase
        .from('balances')
        .select('amount')
        .eq('user_id', userId)
        .eq('category_id', categoryId)
        .single();

    if (error) throw error;
    return data.amount;
};

/**
 * Mettre à jour un solde
 */
export const updateBalance = async (userId, categoryId, newAmount) => {
    const { data, error } = await supabase
        .from('balances')
        .upsert({
            user_id: userId,
            category_id: categoryId,
            amount: newAmount
        }, { onConflict: 'user_id,category_id' })
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Calculer le solde total disponible (hors épargne bloquée)
 */
export const getTotalAvailableBalance = async (userId) => {
    const { data, error } = await supabase
        .from('balances')
        .select(`
      amount,
      categories!inner (
        is_locked
      )
    `)
        .eq('user_id', userId)
        .eq('categories.is_locked', false);

    if (error) throw error;

    const total = data.reduce((sum, balance) => sum + balance.amount, 0);
    return total;
};

/**
 * Calculer le solde total (incluant épargne)
 */
export const getTotalBalance = async (userId) => {
    const { data, error } = await supabase
        .from('balances')
        .select('amount')
        .eq('user_id', userId);

    if (error) throw error;

    const total = data.reduce((sum, balance) => sum + balance.amount, 0);
    return total;
};

/**
 * Obtenir le solde de l'épargne
 */
export const getSavingsBalance = async (userId) => {
    const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', userId)
        .eq('is_locked', true)
        .single();

    if (!category) return 0;

    const { data: balance } = await supabase
        .from('balances')
        .select('amount')
        .eq('user_id', userId)
        .eq('category_id', category.id)
        .single();

    return balance?.amount || 0;
};

/**
 * Valider que la somme des pourcentages = 100%
 */
export const validateCategoryPercentages = async (userId) => {
    const categories = await getCategories(userId);
    const total = categories.reduce((sum, cat) => sum + cat.percent, 0);
    return Math.abs(total - 100) < 0.01; // Tolérance pour les arrondis
};

/**
 * Recalculer les balances basées sur l'historique
 */
export const recalculateBalances = async (userId) => {
    try {
        // Réinitialiser tous les soldes à 0
        const categories = await getCategories(userId);

        for (const category of categories) {
            await updateBalance(userId, category.id, 0);
        }

        // Récupérer toutes les transactions
        const { data: transactions } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .order('timestamp', { ascending: true });

        // Rejouer toutes les transactions
        for (const transaction of transactions) {
            if (transaction.type === 'income') {
                // Distribuer selon les pourcentages
                for (const category of categories) {
                    const allocation = Math.round(transaction.amount * category.percent / 100);
                    const currentBalance = await getCategoryBalance(userId, category.id);
                    await updateBalance(userId, category.id, currentBalance + allocation);
                }
            } else if (transaction.type === 'expense') {
                // Déduire de la catégorie
                const currentBalance = await getCategoryBalance(userId, transaction.category_id);
                await updateBalance(userId, transaction.category_id, currentBalance - transaction.amount);
            }
        }

        return true;
    } catch (error) {
        console.error('Error recalculating balances:', error);
        throw error;
    }
};

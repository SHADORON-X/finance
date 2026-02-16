// =====================================================
// SERVICE DE TRANSACTIONS (Optimisé Offline)
// =====================================================
import { supabase } from '../lib/supabase';
import { updateStreak, addXP } from './gamificationService';
import { addToQueue, getQueue, ACTIONS } from './offlineService';

/**
 * Créer une transaction (revenu)
 */
export const createIncome = async (userId, amount, categories, isSyncing = false) => {
    // MODE HORS LIGNE
    if (!navigator.onLine && !isSyncing) {
        addToQueue(ACTIONS.CREATE_INCOME, { userId, amount, categories });
        // Retourner un objet 'fake' pour l'UI
        return {
            id: 'temp-' + Date.now(),
            user_id: userId,
            type: 'income',
            amount: amount,
            month_year: new Date().toISOString().slice(0, 7),
            timestamp: new Date().toISOString(),
            is_offline: true // Flag pour l'UI
        };
    }

    try {
        const monthYear = new Date().toISOString().slice(0, 7); // YYYY-MM

        // 1. Créer la transaction
        const { data: transaction, error: transError } = await supabase
            .from('transactions')
            .insert([
                {
                    user_id: userId,
                    type: 'income',
                    amount: amount,
                    month_year: monthYear,
                    timestamp: new Date().toISOString()
                }
            ])
            .select()
            .single();

        if (transError) throw transError;

        // 2. Distribuer dans les catégories (Logique simplifiée pour éviter complexité offline replication)
        // ... (Logique distribution identique)
        const balanceUpdates = [];
        for (const category of categories) {
            const allocation = Math.round(amount * category.percent / 100);
            const { data: currentBalance } = await supabase
                .from('balances')
                .select('amount')
                .eq('user_id', userId)
                .eq('category_id', category.id)
                .single();

            const newAmount = (currentBalance?.amount || 0) + allocation;
            balanceUpdates.push({
                user_id: userId,
                category_id: category.id,
                amount: newAmount
            });
        }

        for (const update of balanceUpdates) {
            await supabase
                .from('balances')
                .upsert(update, { onConflict: 'user_id,category_id' });
        }

        // 3. Gamification
        if (!isSyncing) { // Si on est en train de sync, on évite de double-counter si géré ailleurs
            await updateStreak(userId);
            await addXP(userId, 10);
        }

        // 4. Update Stats
        const { data: gamifStat } = await supabase
            .from('gamification')
            .select('total_incomes, total_operations')
            .eq('user_id', userId)
            .single();

        if (gamifStat) {
            await supabase
                .from('gamification')
                .update({
                    total_incomes: (gamifStat.total_incomes || 0) + 1,
                    total_operations: (gamifStat.total_operations || 0) + 1
                })
                .eq('user_id', userId);
        }

        return transaction;
    } catch (error) {
        console.error('Error creating income:', error);
        // Fallback si erreur réseau inattendue
        if (!isSyncing) {
            addToQueue(ACTIONS.CREATE_INCOME, { userId, amount, categories });
            return { id: 'temp-' + Date.now(), type: 'income', amount, timestamp: new Date().toISOString(), is_offline: true };
        }
        throw error;
    }
};

/**
 * Créer une dépense
 */
export const createExpense = async (userId, amount, categoryId, note = '', isSyncing = false) => {
    // MODE HORS LIGNE
    if (!navigator.onLine && !isSyncing) {
        addToQueue(ACTIONS.CREATE_EXPENSE, { userId, amount, categoryId, note });
        return {
            id: 'temp-' + Date.now(),
            user_id: userId,
            type: 'expense',
            amount: amount,
            category_id: categoryId,
            note: note,
            month_year: new Date().toISOString().slice(0, 7),
            timestamp: new Date().toISOString(),
            is_offline: true,
            // Mock de la catégorie pour affichage direct
            categories: { name: 'En attente...', icon: '⏳' }
        };
    }

    try {
        const monthYear = new Date().toISOString().slice(0, 7);

        const { data: transaction, error: transError } = await supabase
            .from('transactions')
            .insert([
                {
                    user_id: userId,
                    type: 'expense',
                    amount: amount,
                    category_id: categoryId,
                    note: note,
                    month_year: monthYear,
                    timestamp: new Date().toISOString()
                }
            ])
            .select()
            .single();

        if (transError) throw transError;

        // Update Balance only if category_id is provided
        if (categoryId) {
            const { data: currentBalance } = await supabase
                .from('balances')
                .select('amount')
                .eq('user_id', userId)
                .eq('category_id', categoryId)
                .single();

            const newAmount = (currentBalance?.amount || 0) - amount;

            await supabase
                .from('balances')
                .upsert({
                    user_id: userId,
                    category_id: categoryId,
                    amount: newAmount
                }, { onConflict: 'user_id,category_id' });
        }


        if (!isSyncing) {
            await updateStreak(userId);
            await addXP(userId, 5);
        }

        // Update Stats
        const { data: gamifStat } = await supabase
            .from('gamification')
            .select('total_expenses, total_operations')
            .eq('user_id', userId)
            .single();

        if (gamifStat) {
            await supabase
                .from('gamification')
                .update({
                    total_expenses: (gamifStat.total_expenses || 0) + 1,
                    total_operations: (gamifStat.total_operations || 0) + 1
                })
                .eq('user_id', userId);
        }

        return transaction;
    } catch (error) {
        console.error('Error creating expense:', error);
        if (!isSyncing) {
            addToQueue(ACTIONS.CREATE_EXPENSE, { userId, amount, categoryId, note });
            return { id: 'temp-' + Date.now(), type: 'expense', amount, note, timestamp: new Date().toISOString(), is_offline: true };
        }
        throw error;
    }
};

/**
 * Obtenir toutes les transactions (Supabase + Queue Locale)
 */
export const getTransactions = async (userId, limit = 100, offset = 0) => {
    // 1. Charger depuis Supabase
    let dbTransactions = [];
    try {
        const { data, error } = await supabase
            .from('transactions')
            .select(`
            *,
            categories (id, name, icon, color)
        `)
            .eq('user_id', userId)
            .order('timestamp', { ascending: false })
            .range(offset, offset + limit - 1);

        if (!error) dbTransactions = data;
    } catch (e) {
        console.warn("Offline mode: cannot fetch remote transactions");
    }

    // 2. Charger depuis la Queue Locale (Pending)
    const queue = getQueue();
    const pendingTransactions = queue
        .filter(item => item.type === ACTIONS.CREATE_INCOME || item.type === ACTIONS.CREATE_EXPENSE)
        .map(item => {
            // Reconstruire un objet transaction fake pour l'UI
            const isIncome = item.type === ACTIONS.CREATE_INCOME;
            return {
                id: item.id,
                user_id: userId,
                type: isIncome ? 'income' : 'expense',
                amount: item.payload.amount,
                note: item.payload.note || (isIncome ? 'En attente de synchro...' : ''),
                timestamp: item.timestamp,
                is_offline: true,
                categories: isIncome ? null : { name: 'En attente...', icon: '⏳' }
            };
        });

    // 3. Fusionner et Trier
    // On met les pending en haut
    const all = [...pendingTransactions, ...dbTransactions];
    // Re-trier par date au cas où
    return all.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

export const getTransactionsByMonth = async (userId, monthYear) => {
    const { data, error } = await supabase
        .from('transactions')
        .select(`*, categories (id, name, icon, color)`)
        .eq('user_id', userId)
        .eq('month_year', monthYear)
        .order('timestamp', { ascending: false });

    if (error) throw error;
    return data;
};

export const deleteTransaction = async (transactionId, userId) => {
    // Si c'est une transaction offline (id commence par temp- ou present dans queue)
    // On pourrait la supprimer de la queue, mais pour l'instant restons simple avec Supabase
    try {
        const { error } = await supabase.from('transactions').delete().eq('id', transactionId).eq('user_id', userId);
        if (error) throw error;
        return true;
    } catch (error) {
        throw error;
    }
};

export const getTransactionStats = async (userId) => {
    const { data, error } = await supabase
        .from('transactions')
        .select('type, amount')
        .eq('user_id', userId);

    if (error) return { totalIncome: 0, totalExpense: 0, netBalance: 0 };

    const stats = {
        totalIncome: 0,
        totalExpense: 0,
        netBalance: 0,
        incomeCount: 0,
        expenseCount: 0
    };

    data.forEach(transaction => {
        if (transaction.type === 'income') {
            stats.totalIncome += transaction.amount;
            stats.incomeCount++;
        } else {
            stats.totalExpense += transaction.amount;
            stats.expenseCount++;
        }
    });

    // Ajouter les stats pending aussi pour que UI soit cohérente
    const queue = getQueue();
    queue.forEach(item => {
        if (item.type === ACTIONS.CREATE_INCOME) {
            stats.totalIncome += item.payload.amount;
        } else if (item.type === ACTIONS.CREATE_EXPENSE) {
            stats.totalExpense += item.payload.amount;
        }
    });

    stats.netBalance = stats.totalIncome - stats.totalExpense;
    return stats;
};

/**
 * Calculer l'historique de la fortune nette basé sur les transactions réelles
 */
export const getHistoricalNetWorth = async (userId) => {
    try {
        const { data: transactions, error } = await supabase
            .from('transactions')
            .select('type, amount, timestamp')
            .eq('user_id', userId)
            .order('timestamp', { ascending: true });

        if (error) throw error;

        if (!transactions || transactions.length === 0) {
            return { labels: [], values: [] };
        }

        let runningBalance = 0;
        const consolidated = {};

        transactions.forEach(t => {
            if (t.type === 'income') {
                runningBalance += t.amount;
            } else {
                runningBalance -= t.amount;
            }
            const dateStr = new Date(t.timestamp).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
            consolidated[dateStr] = runningBalance;
        });

        return {
            labels: Object.keys(consolidated),
            values: Object.values(consolidated)
        };
    } catch (error) {
        console.error("Error fetching historical net worth:", error);
        return { labels: [], values: [] };
    }
};

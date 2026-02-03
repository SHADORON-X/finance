import { supabase } from '../lib/supabase';
import { addToQueue, getQueue, ACTIONS } from './offlineService';

// =====================================================
// SERVICE DE GESTION DES DETTES (Offline Ready)
// =====================================================

/**
 * Récupérer toutes les dettes actives
 */
export const getDebts = async (userId) => {
    let dbDebts = [];
    try {
        const { data, error } = await supabase
            .from('debts')
            .select('*')
            .eq('user_id', userId)
            .order('due_date', { ascending: true });

        if (!error) dbDebts = data;
    } catch (e) { console.warn("Offline fetch debts failed"); }

    // Fusionner avec Queue
    const queue = getQueue();
    const pendingDebts = queue
        .filter(item => item.type === ACTIONS.CREATE_DEBT)
        .map(item => ({
            id: item.id,
            user_id: userId,
            creditor_name: item.payload.debtData.creditor,
            total_amount: item.payload.debtData.amount,
            remaining_amount: item.payload.debtData.amount,
            due_date: item.payload.debtData.due_date,
            icon: item.payload.debtData.icon || '⏳',
            status: 'active',
            is_offline: true
        }));

    return [...pendingDebts, ...dbDebts];
};

/**
 * Créer une nouvelle dette
 */
export const createDebt = async (userId, debtData) => {
    if (!navigator.onLine) {
        addToQueue(ACTIONS.CREATE_DEBT, { userId, debtData });
        return { ...debtData, id: 'temp-' + Date.now(), is_offline: true };
    }

    // debtData: { creditor, amount, due_date, notes, icon }
    const { data, error } = await supabase
        .from('debts')
        .insert([{
            user_id: userId,
            creditor_name: debtData.creditor,
            total_amount: debtData.amount,
            remaining_amount: debtData.amount, // Au début, tout reste à payer
            due_date: debtData.due_date ? debtData.due_date : null,
            notes: debtData.notes,
            icon: debtData.icon || '📜',
            status: 'active'
        }])
        .select()
        .single();

    if (error) throw error;
    return data;
};

/**
 * Ajouter un remboursement (Paiement)
 */
export const addDebtPayment = async (debtId, userId, paymentAmount) => {
    if (!navigator.onLine) {
        addToQueue(ACTIONS.PAY_DEBT, { debtId, userId, amount: paymentAmount });
        return { status: 'mock_success' };
    }

    try {
        // 1. Récupérer la dette actuelle
        const { data: debt, error: fetchError } = await supabase
            .from('debts')
            .select('remaining_amount, total_amount')
            .eq('id', debtId)
            .single();

        if (fetchError) throw fetchError;

        // 2. Calculer le nouveau montant
        const newRemaining = Math.max(0, debt.remaining_amount - paymentAmount);
        const newStatus = newRemaining === 0 ? 'paid' : 'active';

        // 3. Mettre à jour la dette
        const { data: updatedDebt, error: updateError } = await supabase
            .from('debts')
            .update({
                remaining_amount: newRemaining,
                status: newStatus,
                last_payment_date: new Date().toISOString()
            })
            .eq('id', debtId)
            .select()
            .single();

        if (updateError) throw updateError;

        return updatedDebt;

    } catch (error) {
        console.error("Erreur remboursement:", error);
        throw error;
    }
};

/**
 * Supprimer une dette
 */
export const deleteDebt = async (debtId, userId) => {
    const { error } = await supabase
        .from('debts')
        .delete()
        .eq('id', debtId)
        .eq('user_id', userId);

    if (error) throw error;
    return true;
};

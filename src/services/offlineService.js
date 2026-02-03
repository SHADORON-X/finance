import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const QUEUE_KEY = 'shadoron_offline_queue';

// Types d'actions supportées
export const ACTIONS = {
    CREATE_INCOME: 'CREATE_INCOME',
    CREATE_EXPENSE: 'CREATE_EXPENSE',
    CREATE_DEBT: 'CREATE_DEBT',
    PAY_DEBT: 'PAY_DEBT',
    CONTRIBUTE_GOAL: 'CONTRIBUTE_GOAL'
};

/**
 * Ajouter une action à la file d'attente
 */
export const addToQueue = (type, payload) => {
    const queue = getQueue();
    const item = {
        id: crypto.randomUUID(),
        type,
        payload,
        timestamp: new Date().toISOString(),
        status: 'pending'
    };

    queue.push(item);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));

    // Notification discrète
    toast('Sauvegardé hors ligne. Synchro en attente...', {
        icon: '📡',
        style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
        },
    });

    return item;
};

/**
 * Récupérer la file d'attente
 */
export const getQueue = () => {
    const stored = localStorage.getItem(QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
};

/**
 * Vider la file (après succès)
 */
export const clearQueue = () => {
    localStorage.removeItem(QUEUE_KEY);
};

/**
 * Supprimer un item spécifique (une fois traité)
 */
export const removeFromQueue = (id) => {
    const queue = getQueue().filter(item => item.id !== id);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

/**
 * TRAITEMENT DE LA SYNCHRONISATION
 * Cette fonction est le coeur du réacteur. Elle rejoue les actions.
 */
export const syncOfflineData = async () => {
    const queue = getQueue();
    if (queue.length === 0) return;

    if (!navigator.onLine) return; // Toujours pas de net, on attend.

    const toastId = toast.loading('Synchronisation avec le QG...');

    // Import dynamique pour éviter les dépendances circulaires
    const transactionService = await import('./transactionService');
    const debtService = await import('./debtService');
    const goalService = await import('./goalService');
    // On a besoin de l'ID utilisateur pour rejouer
    // On suppose que l'auth est persistée et dispo via supabase session

    let processedCount = 0;

    for (const item of queue) {
        try {
            switch (item.type) {
                case ACTIONS.CREATE_INCOME:
                    await transactionService.createIncome(
                        item.payload.userId,
                        item.payload.amount,
                        item.payload.categories,
                        true // flag 'isSyncing' pour éviter les doubles notifs UI
                    );
                    break;
                case ACTIONS.CREATE_EXPENSE:
                    await transactionService.createExpense(
                        item.payload.userId,
                        item.payload.amount,
                        item.payload.categoryId,
                        item.payload.note,
                        true
                    );
                    break;
                case ACTIONS.CREATE_DEBT:
                    await debtService.createDebt(
                        item.payload.userId,
                        item.payload.debtData
                    );
                    break;
                case ACTIONS.PAY_DEBT:
                    await debtService.addDebtPayment(
                        item.payload.debtId,
                        item.payload.userId,
                        item.payload.amount
                    );
                    break;
                case ACTIONS.CONTRIBUTE_GOAL:
                    await goalService.contributeToGoal(
                        item.payload.goalId,
                        item.payload.userId,
                        item.payload.amount
                    );
                    break;
            }
            // Succès -> On retire
            removeFromQueue(item.id);
            processedCount++;
        } catch (error) {
            console.error(`Sync failed for item ${item.id}`, error);
            // On le laisse dans la queue pour réessayer plus tard, sauf si erreur fatale
        }
    }

    if (processedCount > 0) {
        toast.success(`${processedCount} opérations synchronisées !`, { id: toastId });
        // Force reload page pour rafraîchir les vues
        window.dispatchEvent(new Event('storage')); // Déclenche les updates
    } else {
        toast.dismiss(toastId);
    }
};

/**
 * Initialiser l'écouteur Réseau
 */
export const initSyncListener = () => {
    window.addEventListener('online', () => {
        console.log("Connexion rétablie. Lancement synchro...");
        syncOfflineData();
    });
};

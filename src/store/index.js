// =====================================================
// STORE ZUSTAND - STATE MANAGEMENT GLOBAL
// =====================================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: true,

            setUser: (user) => set({ user, isAuthenticated: !!user }),
            setSession: (session) => set({ session }),
            setLoading: (isLoading) => set({ isLoading }),

            logout: () => set({
                user: null,
                session: null,
                isAuthenticated: false
            }),
        }),
        {
            name: 'shadoron-auth-storage',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated
            })
        }
    )
);

export const useFinanceStore = create((set, get) => ({
    // Catégories
    categories: [],
    setCategories: (categories) => set({ categories }),

    // Balances
    balances: [],
    setBalances: (balances) => set({ balances }),

    // Transactions
    transactions: [],
    setTransactions: (transactions) => set({ transactions }),
    addTransaction: (transaction) => set((state) => ({
        transactions: [transaction, ...state.transactions]
    })),
    removeTransaction: (id) => set((state) => ({
        transactions: state.transactions.filter(t => t.id !== id)
    })),

    // Objectifs
    goals: [],
    setGoals: (goals) => set({ goals }),
    addGoal: (goal) => set((state) => ({
        goals: [...state.goals, goal]
    })),
    updateGoal: (id, updates) => set((state) => ({
        goals: state.goals.map(g => g.id === id ? { ...g, ...updates } : g)
    })),
    removeGoal: (id) => set((state) => ({
        goals: state.goals.filter(g => g.id !== id)
    })),

    // Dettes
    debts: [],
    setDebts: (debts) => set({ debts }),
    addDebt: (debt) => set((state) => ({
        debts: [...state.debts, debt]
    })),
    updateDebt: (id, updates) => set((state) => ({
        debts: state.debts.map(d => d.id === id ? { ...d, ...updates } : d)
    })),
    removeDebt: (id) => set((state) => ({
        debts: state.debts.filter(d => d.id !== id)
    })),

    // Gamification
    gamification: null,
    setGamification: (gamification) => set({ gamification }),

    // Badges
    badges: [],
    setBadges: (badges) => set({ badges }),

    // Refresh functions
    refreshAll: async (userId) => {
        // Cette fonction sera appelée pour rafraîchir toutes les données
        // Elle sera implémentée dans les composants
    }
}));

export const useUIStore = create(
    persist(
        (set) => ({
            // Modals
            isGoalModalOpen: false,
            isDebtModalOpen: false,
            isTransactionModalOpen: false,
            isCategoryModalOpen: false,

            openGoalModal: () => set({ isGoalModalOpen: true }),
            closeGoalModal: () => set({ isGoalModalOpen: false }),

            openDebtModal: () => set({ isDebtModalOpen: true }),
            closeDebtModal: () => set({ isDebtModalOpen: false }),

            openTransactionModal: () => set({ isTransactionModalOpen: true }),
            closeTransactionModal: () => set({ isTransactionModalOpen: false }),

            openCategoryModal: () => set({ isCategoryModalOpen: true }),
            closeCategoryModal: () => set({ isCategoryModalOpen: false }),

            // Notifications
            notifications: [],
            addNotification: (notification) => set((state) => ({
                notifications: [...state.notifications, {
                    id: Date.now(),
                    ...notification
                }]
            })),
            removeNotification: (id) => set((state) => ({
                notifications: state.notifications.filter(n => n.id !== id)
            })),

            // Loading states
            isLoading: false,
            setLoading: (isLoading) => set({ isLoading }),

            // active tab
            activeTab: 'dashboard',
            setActiveTab: (tab) => set({ activeTab: tab }),

            // Theme
            theme: 'dark',
            setTheme: (theme) => set({ theme }),
            toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

            // Currency
            currency: 'GNF',
            setCurrency: (currency) => set({ currency }),

            // Visions de l'Oracle
            oracleVisions: [],
            setOracleVisions: (visions) => set({ oracleVisions: visions }),

            // View mode (all/month)
            viewMode: 'all',
            setViewMode: (mode) => set({ viewMode: mode })
        }),
        {
            name: 'shadoron-ui-storage',
            partialize: (state) => ({
                theme: state.theme,
                activeTab: state.activeTab,
                currency: state.currency
            })
        }
    )
);

import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore, useUIStore } from './store';
import { onAuthStateChange } from './lib/supabase';
import { initSyncListener } from './services/offlineService';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import GoalsPage from './pages/GoalsPage';
import DebtsPage from './pages/DebtsPage';
import ProgressPage from './pages/ProgressPage';
import SettingsPage from './pages/SettingsPage';
import AIAdvisorPage from './pages/AIAdvisorPage';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoadingScreen from './components/LoadingScreen';

function App() {
    const { setUser, setSession, setLoading, isLoading } = useAuthStore();
    const { theme } = useUIStore();

    useEffect(() => {
        // Appliquer le thème
        document.documentElement.setAttribute('data-theme', theme);
        // Init Offline Sync Listener
        initSyncListener();
    }, [theme]);

    useEffect(() => {
        // Écouter les changements d'authentification
        const { data: { subscription } } = onAuthStateChange((event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, [setUser, setSession, setLoading]);

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Routes>
                    {/* Routes publiques */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* Routes protégées */}
                    <Route element={<ProtectedRoute />}>
                        <Route element={<Layout />}>
                            <Route path="/" element={<DashboardPage />} />
                            <Route path="/transactions" element={<TransactionsPage />} />
                            <Route path="/goals" element={<GoalsPage />} />
                            <Route path="/debts" element={<DebtsPage />} />
                            <Route path="/progress" element={<ProgressPage />} />
                            <Route path="/ai-advisor" element={<AIAdvisorPage />} />
                            <Route path="/settings" element={<SettingsPage />} />
                        </Route>
                    </Route>

                    {/* Redirection par défaut */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>

            {/* Toast notifications */}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: 'var(--bg-card)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-lg)',
                    },
                    success: {
                        iconTheme: {
                            primary: 'var(--positive)',
                            secondary: 'white',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: 'var(--negative)',
                            secondary: 'white',
                        },
                    },
                }}
            />

            {/* Confetti container */}
            <div id="confetti-container" className="confetti-container"></div>
        </>
    );
}

export default App;

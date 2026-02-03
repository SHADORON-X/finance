-- =====================================================
-- SHADORON FINANCE - SCHEMA SQL POUR SUPABASE
-- =====================================================
-- Ce fichier contient toutes les tables nécessaires pour l'application
-- À exécuter dans Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: users
-- Gestion des utilisateurs
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    theme VARCHAR(20) DEFAULT 'dark',
    is_active BOOLEAN DEFAULT true
);

-- =====================================================
-- TABLE: categories
-- Catégories de budget (Épargne, Nourriture, etc.)
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(10) NOT NULL,
    percent DECIMAL(5,2) NOT NULL CHECK (percent >= 0 AND percent <= 100),
    is_locked BOOLEAN DEFAULT false,
    color VARCHAR(7),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- =====================================================
-- TABLE: balances
-- Soldes actuels par catégorie
-- =====================================================
CREATE TABLE IF NOT EXISTS balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, category_id)
);

-- =====================================================
-- TABLE: transactions
-- Historique de toutes les transactions (revenus/dépenses)
-- =====================================================
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    note TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    month_year VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherche rapide par date
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_month ON transactions(user_id, month_year);

-- =====================================================
-- TABLE: goals
-- Objectifs financiers (acheter disque dur, payer dette, etc.)
-- =====================================================
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    target_amount DECIMAL(15,2) NOT NULL CHECK (target_amount > 0),
    current_amount DECIMAL(15,2) DEFAULT 0,
    category VARCHAR(50), -- 'purchase', 'debt', 'savings', 'investment'
    priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
    deadline DATE,
    icon VARCHAR(10) DEFAULT '🎯',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_goals_user_status ON goals(user_id, status);

-- =====================================================
-- TABLE: goal_contributions
-- Contributions vers les objectifs
-- =====================================================
CREATE TABLE IF NOT EXISTS goal_contributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: gamification
-- XP, niveau, streak pour chaque utilisateur
-- =====================================================
CREATE TABLE IF NOT EXISTS gamification (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    current_streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    total_incomes INTEGER DEFAULT 0,
    total_expenses INTEGER DEFAULT 0,
    total_operations INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: badges
-- Badges débloqués par utilisateur
-- =====================================================
CREATE TABLE IF NOT EXISTS badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    badge_code VARCHAR(50) NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, badge_code)
);

-- =====================================================
-- TABLE: debts
-- Gestion des dettes à rembourser
-- =====================================================
CREATE TABLE IF NOT EXISTS debts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    creditor_name VARCHAR(200) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL CHECK (total_amount > 0),
    remaining_amount DECIMAL(15,2) NOT NULL,
    interest_rate DECIMAL(5,2) DEFAULT 0,
    due_date DATE,
    priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 5),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paid', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- TABLE: debt_payments
-- Historique des paiements de dettes
-- =====================================================
CREATE TABLE IF NOT EXISTS debt_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    debt_id UUID REFERENCES debts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    note TEXT
);

-- =====================================================
-- TABLE: recurring_transactions
-- Transactions récurrentes (salaire mensuel, abonnements, etc.)
-- =====================================================
CREATE TABLE IF NOT EXISTS recurring_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    description VARCHAR(200) NOT NULL,
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
    next_occurrence DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: budgets
-- Budgets mensuels par catégorie
-- =====================================================
CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    month_year VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    budget_amount DECIMAL(15,2) NOT NULL CHECK (budget_amount >= 0),
    spent_amount DECIMAL(15,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, category_id, month_year)
);

-- =====================================================
-- TABLE: notifications
-- Notifications pour l'utilisateur
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'goal_achieved', 'budget_exceeded', 'debt_reminder', etc.
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);

-- =====================================================
-- TABLE: analytics_cache
-- Cache pour les statistiques et analytics
-- =====================================================
CREATE TABLE IF NOT EXISTS analytics_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    metric_value JSONB NOT NULL,
    period VARCHAR(20), -- 'daily', 'weekly', 'monthly', 'yearly'
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, metric_name, period)
);

-- =====================================================
-- FONCTIONS & TRIGGERS
-- =====================================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour users
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour balances
CREATE TRIGGER update_balances_updated_at BEFORE UPDATE ON balances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour gamification
CREATE TRIGGER update_gamification_updated_at BEFORE UPDATE ON gamification
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour calculer le total des transactions
CREATE OR REPLACE FUNCTION calculate_total_balance(p_user_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    total DECIMAL(15,2);
BEGIN
    SELECT COALESCE(SUM(amount), 0) INTO total
    FROM balances
    WHERE user_id = p_user_id;
    RETURN total;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour vérifier si un objectif est atteint
CREATE OR REPLACE FUNCTION check_goal_completion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.current_amount >= NEW.target_amount AND NEW.status = 'active' THEN
        NEW.status = 'completed';
        NEW.completed_at = NOW();
        
        -- Créer une notification
        INSERT INTO notifications (user_id, type, title, message)
        VALUES (
            NEW.user_id,
            'goal_achieved',
            'Objectif atteint! 🎉',
            'Félicitations! Vous avez atteint votre objectif: ' || NEW.title
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour vérifier la complétion des objectifs
CREATE TRIGGER goal_completion_check BEFORE UPDATE ON goals
    FOR EACH ROW EXECUTE FUNCTION check_goal_completion();

-- Fonction pour mettre à jour le streak
CREATE OR REPLACE FUNCTION update_user_streak(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    v_last_activity DATE;
    v_current_streak INTEGER;
    v_best_streak INTEGER;
    v_today DATE := CURRENT_DATE;
BEGIN
    SELECT last_activity_date, current_streak, best_streak
    INTO v_last_activity, v_current_streak, v_best_streak
    FROM gamification
    WHERE user_id = p_user_id;
    
    IF v_last_activity IS NULL THEN
        -- Première activité
        UPDATE gamification
        SET current_streak = 1,
            best_streak = 1,
            last_activity_date = v_today
        WHERE user_id = p_user_id;
    ELSIF v_last_activity = v_today THEN
        -- Déjà actif aujourd'hui, ne rien faire
        RETURN;
    ELSIF v_last_activity = v_today - INTERVAL '1 day' THEN
        -- Activité consécutive
        UPDATE gamification
        SET current_streak = current_streak + 1,
            best_streak = GREATEST(best_streak, current_streak + 1),
            last_activity_date = v_today
        WHERE user_id = p_user_id;
    ELSE
        -- Streak cassé
        UPDATE gamification
        SET current_streak = 1,
            last_activity_date = v_today
        WHERE user_id = p_user_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VUES UTILES
-- =====================================================

-- Vue: Résumé financier par utilisateur
CREATE OR REPLACE VIEW user_financial_summary AS
SELECT 
    u.id as user_id,
    u.username,
    COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) as total_income,
    COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as total_expenses,
    COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE -t.amount END), 0) as net_balance,
    COUNT(DISTINCT t.id) as total_transactions,
    g.xp,
    g.level,
    g.current_streak,
    g.best_streak
FROM users u
LEFT JOIN transactions t ON u.id = t.user_id
LEFT JOIN gamification g ON u.id = g.user_id
GROUP BY u.id, u.username, g.xp, g.level, g.current_streak, g.best_streak;

-- Vue: Objectifs actifs avec progression
CREATE OR REPLACE VIEW active_goals_progress AS
SELECT 
    g.id,
    g.user_id,
    g.title,
    g.description,
    g.target_amount,
    g.current_amount,
    ROUND((g.current_amount / g.target_amount * 100)::numeric, 2) as progress_percent,
    g.deadline,
    g.priority,
    g.icon,
    CASE 
        WHEN g.deadline IS NOT NULL AND g.deadline < CURRENT_DATE THEN 'overdue'
        WHEN g.deadline IS NOT NULL AND g.deadline <= CURRENT_DATE + INTERVAL '7 days' THEN 'urgent'
        ELSE 'normal'
    END as urgency_status
FROM goals g
WHERE g.status = 'active'
ORDER BY g.priority DESC, g.deadline ASC NULLS LAST;

-- Vue: Dettes actives
CREATE OR REPLACE VIEW active_debts_summary AS
SELECT 
    d.id,
    d.user_id,
    d.creditor_name,
    d.total_amount,
    d.remaining_amount,
    ROUND((d.remaining_amount / d.total_amount * 100)::numeric, 2) as remaining_percent,
    d.interest_rate,
    d.due_date,
    d.priority,
    CASE 
        WHEN d.due_date IS NOT NULL AND d.due_date < CURRENT_DATE THEN 'overdue'
        WHEN d.due_date IS NOT NULL AND d.due_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'urgent'
        ELSE 'normal'
    END as urgency_status
FROM debts d
WHERE d.status = 'active'
ORDER BY d.priority DESC, d.due_date ASC NULLS LAST;

-- =====================================================
-- DONNÉES INITIALES (OPTIONNEL)
-- =====================================================

-- Fonction pour initialiser un nouvel utilisateur
CREATE OR REPLACE FUNCTION initialize_new_user(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Créer les catégories par défaut
    INSERT INTO categories (user_id, name, icon, percent, is_locked, color) VALUES
        (p_user_id, 'Épargne', '🔒', 10, true, '#10b981'),
        (p_user_id, 'Nourriture', '🍽️', 30, false, '#f59e0b'),
        (p_user_id, 'Projet', '🎯', 25, false, '#6366f1'),
        (p_user_id, 'Transport', '🚗', 20, false, '#8b5cf6'),
        (p_user_id, 'Autres', '📦', 15, false, '#ef4444');
    
    -- Créer l'entrée gamification
    INSERT INTO gamification (user_id, xp, level, current_streak, best_streak)
    VALUES (p_user_id, 0, 1, 0, 0);
    
    -- Créer les balances initiales
    INSERT INTO balances (user_id, category_id, amount)
    SELECT p_user_id, id, 0
    FROM categories
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- POLICIES RLS (Row Level Security) pour Supabase
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE debt_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies pour users (view, update AND INSERT)
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Policies pour categories
CREATE POLICY "Users can view own categories" ON categories
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON categories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON categories
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON categories
    FOR DELETE USING (auth.uid() = user_id);

-- Policies pour balances
CREATE POLICY "Users can view own balances" ON balances
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own balances" ON balances
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own balances" ON balances
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own balances" ON balances
    FOR DELETE USING (auth.uid() = user_id);

-- Policies pour transactions
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON transactions
    FOR DELETE USING (auth.uid() = user_id);

-- Policies pour gamification
CREATE POLICY "Users can view own gamification" ON gamification
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gamification" ON gamification
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gamification" ON gamification
    FOR UPDATE USING (auth.uid() = user_id);

-- Policies pour goals
CREATE POLICY "Users can view own goals" ON goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON goals
    FOR DELETE USING (auth.uid() = user_id);

-- Policies pour debts
CREATE POLICY "Users can view own debts" ON debts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own debts" ON debts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own debts" ON debts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own debts" ON debts
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- INDEX POUR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_balances_user ON balances(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_debts_user ON debts(user_id);
CREATE INDEX IF NOT EXISTS idx_gamification_user ON gamification(user_id);
CREATE INDEX IF NOT EXISTS idx_badges_user ON badges(user_id);

-- =====================================================
-- FIN DU SCHEMA
-- =====================================================

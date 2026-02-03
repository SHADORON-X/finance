-- =====================================================
-- SHADORON FINANCE - FIX MISSING RLS POLICIES
-- =====================================================
-- Exécuter ce script dans Supabase SQL Editor pour corriger
-- l'erreur "new row violates row-level security policy"
-- =====================================================

-- 1. USERS TABLE
-- Allow users to insert their own profile during signup
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. GAMIFICATION TABLE
-- Allow users to insert their own gamification data
DROP POLICY IF EXISTS "Users can view own gamification" ON gamification;
CREATE POLICY "Users can view own gamification" ON gamification
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own gamification" ON gamification;
CREATE POLICY "Users can insert own gamification" ON gamification
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own gamification" ON gamification;
CREATE POLICY "Users can update own gamification" ON gamification
    FOR UPDATE USING (auth.uid() = user_id);

-- 3. BALANCES TABLE
-- Allow users to manage their balances
DROP POLICY IF EXISTS "Users can view own balances" ON balances;
CREATE POLICY "Users can view own balances" ON balances
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own balances" ON balances;
CREATE POLICY "Users can insert own balances" ON balances
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own balances" ON balances;
CREATE POLICY "Users can update own balances" ON balances
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own balances" ON balances;
CREATE POLICY "Users can delete own balances" ON balances
    FOR DELETE USING (auth.uid() = user_id);

-- 4. TRANSACTIONS TABLE
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
CREATE POLICY "Users can insert own transactions" ON transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
CREATE POLICY "Users can update own transactions" ON transactions
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;
CREATE POLICY "Users can delete own transactions" ON transactions
    FOR DELETE USING (auth.uid() = user_id);

-- 5. GOALS TABLE
DROP POLICY IF EXISTS "Users can view own goals" ON goals;
CREATE POLICY "Users can view own goals" ON goals
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own goals" ON goals;
CREATE POLICY "Users can insert own goals" ON goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own goals" ON goals;
CREATE POLICY "Users can update own goals" ON goals
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own goals" ON goals;
CREATE POLICY "Users can delete own goals" ON goals
    FOR DELETE USING (auth.uid() = user_id);

-- 6. DEBTS TABLE
DROP POLICY IF EXISTS "Users can view own debts" ON debts;
CREATE POLICY "Users can view own debts" ON debts
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own debts" ON debts;
CREATE POLICY "Users can insert own debts" ON debts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own debts" ON debts;
CREATE POLICY "Users can update own debts" ON debts
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own debts" ON debts;
CREATE POLICY "Users can delete own debts" ON debts
    FOR DELETE USING (auth.uid() = user_id);

-- 7. RECURRING_TRANSACTIONS
DROP POLICY IF EXISTS "Users can view own recurring" ON recurring_transactions;
CREATE POLICY "Users can view own recurring" ON recurring_transactions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own recurring" ON recurring_transactions;
CREATE POLICY "Users can insert own recurring" ON recurring_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own recurring" ON recurring_transactions;
CREATE POLICY "Users can update own recurring" ON recurring_transactions
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own recurring" ON recurring_transactions;
CREATE POLICY "Users can delete own recurring" ON recurring_transactions
    FOR DELETE USING (auth.uid() = user_id);

-- 8. NOTIFICATIONS
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own notifications" ON notifications;
CREATE POLICY "Users can insert own notifications" ON notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Correct policies for categories (already mostly there but ensuring completeness)
DROP POLICY IF EXISTS "Users can view own categories" ON categories;
CREATE POLICY "Users can view own categories" ON categories
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own categories" ON categories;
CREATE POLICY "Users can insert own categories" ON categories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own categories" ON categories;
CREATE POLICY "Users can update own categories" ON categories
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own categories" ON categories;
CREATE POLICY "Users can delete own categories" ON categories
    FOR DELETE USING (auth.uid() = user_id);

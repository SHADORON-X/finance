-- ================================================================
-- CORRECTIF D'URGENCE RLS (Row Level Security)
-- Ce script débloque l'insertion pour les tables goals, transactions, etc.
-- ================================================================

-- 1. Activer RLS sur toutes les tables (sécurité de base)
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_contributions ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer les anciennes politiques potentiellement bloquantes
DROP POLICY IF EXISTS "Enable all operations for users based on user_id" ON public.goals;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON public.goals;
DROP POLICY IF EXISTS "Enable select for users based on user_id" ON public.goals;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.goals;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.goals;

-- Idem pour transactions
DROP POLICY IF EXISTS "Enable all operations for users based on user_id" ON public.transactions;

-- 3. CRÉER DES POLITIQUES PERMISSIVES MAIS SÉCURISÉES (Basées sur user_id)

-- === TABLE GOALS ===
CREATE POLICY "Users can manage their own goals" ON public.goals
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- === TABLE TRANSACTIONS ===
CREATE POLICY "Users can manage their own transactions" ON public.transactions
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- === TABLE GOAL_CONTRIBUTIONS ===
CREATE POLICY "Users can manage their own contributions" ON public.goal_contributions
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- === TABLE BALANCES ===
-- Attention, parfois les balances sont créées par des triggers ou requirent des droits spéciaux
-- Ici on autorise l'utilisateur à voir et modifier SES balances
CREATE POLICY "Users can see and update their own balances" ON public.balances
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- === TABLE CATEGORIES ===
CREATE POLICY "Users can manage their categories" ON public.categories
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. Vérification (optionnelle, juste pour log)
-- Si vous exécutez ça dans Supabase SQL Editor, ça devrait renvoyer "Success"

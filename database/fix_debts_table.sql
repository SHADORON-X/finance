-- =====================================================
-- CORRECTIF TABLE DETTES (Erreur 400)
-- Ce script ajoute la colonne manquante 'icon' et s'assure que tout est propre.
-- =====================================================

-- 1. Ajouter la colonne 'icon' si elle n'existe pas
ALTER TABLE public.debts ADD COLUMN IF NOT EXISTS icon VARCHAR(10) DEFAULT '📜';

-- 2. Vérifier les permissions RLS (pour être sûr)
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own debts" ON public.debts;

CREATE POLICY "Users can manage their own debts" ON public.debts
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Confirmez que la colonne creditor_name existe (pas besoin de changer le SQL habituellement, mais utile de savoir)
-- Dans le code JS, nous enverrons 'creditor_name' pour correspondre à la table.

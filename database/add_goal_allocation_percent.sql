-- =====================================================
-- MIGRATION: Ajout de % d'allocation pour les objectifs
-- Permet de distribuer automatiquement le revenu du jour
-- =====================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'goals'
        AND column_name = 'allocation_percent'
    ) THEN
        ALTER TABLE public.goals
        ADD COLUMN allocation_percent DECIMAL(5,2) DEFAULT 0;
    END IF;
END $$;

-- =====================================================
-- TABLE ALLOCATIONS - Répartitions automatiques
-- =====================================================

-- Table pour stocker les allocations d'argent
CREATE TABLE IF NOT EXISTS allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    strategy_key TEXT NOT NULL,
    distribution JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    applied_at TIMESTAMPTZ,
    notes TEXT
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_allocations_user_id ON allocations(user_id);
CREATE INDEX IF NOT EXISTS idx_allocations_status ON allocations(status);
CREATE INDEX IF NOT EXISTS idx_allocations_created_at ON allocations(created_at DESC);

-- RLS (Row Level Security)
ALTER TABLE allocations ENABLE ROW LEVEL SECURITY;

-- Policy: Les utilisateurs peuvent voir leurs propres allocations
CREATE POLICY "Users can view own allocations"
    ON allocations FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Les utilisateurs peuvent créer leurs propres allocations
CREATE POLICY "Users can create own allocations"
    ON allocations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Les utilisateurs peuvent mettre à jour leurs propres allocations
CREATE POLICY "Users can update own allocations"
    ON allocations FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: Les utilisateurs peuvent supprimer leurs propres allocations
CREATE POLICY "Users can delete own allocations"
    ON allocations FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- MODIFICATIONS DES TABLES EXISTANTES
-- =====================================================

-- Ajouter une colonne allocation_id aux transactions
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS allocation_id UUID REFERENCES allocations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_allocation_id ON transactions(allocation_id);

-- Ajouter une colonne allocation_id aux contributions d'objectifs
ALTER TABLE goal_contributions 
ADD COLUMN IF NOT EXISTS allocation_id UUID REFERENCES allocations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_goal_contributions_allocation_id ON goal_contributions(allocation_id);

-- =====================================================
-- FONCTIONS UTILITAIRES
-- =====================================================

-- Fonction pour obtenir le résumé des allocations d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_allocations_summary(p_user_id UUID)
RETURNS TABLE (
    total_allocations BIGINT,
    total_amount DECIMAL,
    pending_allocations BIGINT,
    applied_allocations BIGINT,
    total_pending_amount DECIMAL,
    total_applied_amount DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT as total_allocations,
        COALESCE(SUM(amount), 0) as total_amount,
        COUNT(*) FILTER (WHERE status = 'pending')::BIGINT as pending_allocations,
        COUNT(*) FILTER (WHERE status = 'applied')::BIGINT as applied_allocations,
        COALESCE(SUM(amount) FILTER (WHERE status = 'pending'), 0) as total_pending_amount,
        COALESCE(SUM(amount) FILTER (WHERE status = 'applied'), 0) as total_applied_amount
    FROM allocations
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour annuler une allocation
CREATE OR REPLACE FUNCTION cancel_allocation(p_allocation_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_status TEXT;
BEGIN
    -- Vérifier que l'allocation appartient à l'utilisateur
    SELECT status INTO v_status
    FROM allocations
    WHERE id = p_allocation_id AND user_id = p_user_id;

    IF v_status IS NULL THEN
        RAISE EXCEPTION 'Allocation non trouvée';
    END IF;

    IF v_status = 'applied' THEN
        RAISE EXCEPTION 'Impossible d''annuler une allocation déjà appliquée';
    END IF;

    -- Mettre à jour le statut
    UPDATE allocations
    SET status = 'cancelled'
    WHERE id = p_allocation_id AND user_id = p_user_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VUE POUR LES STATISTIQUES D'ALLOCATION
-- =====================================================

CREATE OR REPLACE VIEW allocation_statistics AS
SELECT
    a.user_id,
    a.strategy_key,
    COUNT(*) as usage_count,
    AVG(a.amount) as avg_amount,
    SUM(a.amount) as total_amount,
    COUNT(*) FILTER (WHERE a.status = 'applied') as applied_count,
    MAX(a.created_at) as last_used
FROM allocations a
GROUP BY a.user_id, a.strategy_key;

-- RLS pour la vue
ALTER VIEW allocation_statistics SET (security_invoker = true);

-- =====================================================
-- COMMENTAIRES
-- =====================================================

COMMENT ON TABLE allocations IS 'Stocke les répartitions automatiques d''argent selon les stratégies de sagesse financière';
COMMENT ON COLUMN allocations.distribution IS 'JSON contenant la répartition par catégorie avec pourcentages et montants';
COMMENT ON COLUMN allocations.strategy_key IS 'Clé de la stratégie utilisée (conservative, balanced, aggressive, etc.)';
COMMENT ON COLUMN allocations.status IS 'Statut de l''allocation: pending (en attente), applied (appliquée), cancelled (annulée)';

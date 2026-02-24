-- =====================================================
-- MIGRATION : Bibliothèque de livres personnelle
-- À exécuter dans le SQL Editor de Supabase
-- =====================================================

-- 1. Table user_books
CREATE TABLE IF NOT EXISTS public.user_books (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size BIGINT,
    file_type TEXT DEFAULT 'pdf',
    title TEXT NOT NULL,
    author TEXT DEFAULT 'Auteur inconnu',
    category TEXT DEFAULT 'Finance',
    cover_color TEXT DEFAULT 'amber',
    cover_emoji TEXT DEFAULT '📕',
    read_progress INT DEFAULT 0 CHECK (read_progress >= 0 AND read_progress <= 100),
    last_read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Index pour recherche rapide par utilisateur
CREATE INDEX IF NOT EXISTS idx_user_books_user_id ON public.user_books(user_id);

-- 3. Row Level Security (RLS)
ALTER TABLE public.user_books ENABLE ROW LEVEL SECURITY;

-- Chaque utilisateur ne voit que SES livres
CREATE POLICY "users can view their own books"
    ON public.user_books
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "users can insert their own books"
    ON public.user_books
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can update their own books"
    ON public.user_books
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "users can delete their own books"
    ON public.user_books
    FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- SUPABASE STORAGE BUCKET "books"
-- Exécuter dans le SQL Editor
-- =====================================================

-- Créer le bucket "books" (privé, non public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'books',
    'books',
    false,               -- Bucket PRIVÉ (URLs signées uniquement)
    52428800,           -- Limite 50 Mo
    ARRAY['application/pdf', 'application/epub+zip']
)
ON CONFLICT (id) DO NOTHING;

-- Policy Storage : lecture par le propriétaire uniquement
CREATE POLICY "users can read their own books" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'books'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "users can upload their own books" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'books'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "users can delete their own books" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'books'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

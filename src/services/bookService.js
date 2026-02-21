// =====================================================
// SERVICE LIVRES — Upload/Lecture via Supabase Storage
// Bucket: "books"
// =====================================================
import { supabase } from '../lib/supabase';

const BUCKET = 'books';

/**
 * Upload un fichier PDF dans Supabase Storage
 * @param {File} file - Fichier PDF à uploader
 * @param {string} userId - ID de l'utilisateur
 * @param {object} meta - { title, author, category }
 * @returns {object} - Données du livre sauvegardé
 */
export const uploadBook = async (file, userId, meta = {}) => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'epub'].includes(ext)) {
        throw new Error('Format non supporté. Utilisez PDF ou EPUB.');
    }

    const fileName = `${userId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    // Upload dans Supabase Storage
    const { data: storageData, error: storageError } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: ext === 'pdf' ? 'application/pdf' : 'application/epub+zip'
        });

    if (storageError) throw storageError;

    // Générer l'URL signée (valide 7 jours)
    const { data: urlData } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(fileName, 60 * 60 * 24 * 7);

    // Sauvegarder les métadonnées dans la table user_books
    const bookRecord = {
        user_id: userId,
        file_path: fileName,
        file_name: file.name,
        file_size: file.size,
        file_type: ext,
        title: meta.title || file.name.replace(`.${ext}`, ''),
        author: meta.author || 'Auteur inconnu',
        category: meta.category || 'Autres',
        cover_color: meta.coverColor || 'amber',
        cover_emoji: meta.coverEmoji || '📕',
        created_at: new Date().toISOString(),
        last_read_at: null,
        read_progress: 0,
    };

    const { data: dbData, error: dbError } = await supabase
        .from('user_books')
        .insert(bookRecord)
        .select()
        .single();

    if (dbError) {
        // Si la table n'existe pas, on stocke en localStorage
        const stored = JSON.parse(localStorage.getItem(`user_books_${userId}`) || '[]');
        const localBook = { ...bookRecord, id: Date.now().toString(), signed_url: urlData?.signedUrl };
        stored.push(localBook);
        localStorage.setItem(`user_books_${userId}`, JSON.stringify(stored));
        return localBook;
    }

    return { ...dbData, signed_url: urlData?.signedUrl };
};

/**
 * Récupère la liste des livres d'un utilisateur
 */
export const getUserBooks = async (userId) => {
    // Essai via Supabase DB
    const { data, error } = await supabase
        .from('user_books')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (!error && data) {
        // Générer des URLs signées pour chaque livre
        const booksWithUrls = await Promise.all(data.map(async (book) => {
            const { data: urlData } = await supabase.storage
                .from(BUCKET)
                .createSignedUrl(book.file_path, 60 * 60 * 24 * 7);
            return { ...book, signed_url: urlData?.signedUrl };
        }));
        return booksWithUrls;
    }

    // Fallback localStorage
    const stored = JSON.parse(localStorage.getItem(`user_books_${userId}`) || '[]');
    return stored;
};

/**
 * Met à jour la progression de lecture d'un livre
 */
export const updateBookProgress = async (userId, bookId, progress) => {
    const { error } = await supabase
        .from('user_books')
        .update({ read_progress: progress, last_read_at: new Date().toISOString() })
        .eq('id', bookId)
        .eq('user_id', userId);

    if (error) {
        // Fallback localStorage
        const stored = JSON.parse(localStorage.getItem(`user_books_${userId}`) || '[]');
        const idx = stored.findIndex(b => b.id === bookId);
        if (idx !== -1) {
            stored[idx].read_progress = progress;
            stored[idx].last_read_at = new Date().toISOString();
            localStorage.setItem(`user_books_${userId}`, JSON.stringify(stored));
        }
    }
};

/**
 * Supprime un livre
 */
export const deleteBook = async (userId, bookId, filePath) => {
    // Supprimer du storage
    await supabase.storage.from(BUCKET).remove([filePath]);

    // Supprimer de la DB
    const { error } = await supabase
        .from('user_books')
        .delete()
        .eq('id', bookId)
        .eq('user_id', userId);

    if (error) {
        // Fallback localStorage
        const stored = JSON.parse(localStorage.getItem(`user_books_${userId}`) || '[]');
        const filtered = stored.filter(b => b.id !== bookId);
        localStorage.setItem(`user_books_${userId}`, JSON.stringify(filtered));
    }
};

/**
 * Génère une URL signée fraîche pour lire un livre
 */
export const getBookUrl = async (filePath) => {
    const { data, error } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(filePath, 60 * 60 * 2); // 2 heures
    if (error) throw error;
    return data.signedUrl;
};

export default {
    uploadBook,
    getUserBooks,
    updateBookProgress,
    deleteBook,
    getBookUrl
};

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut,
    Download, BookOpen, Loader, RotateCcw, Maximize2,
    Minimize2, Moon, Sun, BookMarked
} from 'lucide-react';
import { updateBookProgress } from '../services/bookService';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';

// ──────────────────────────────────────────────────────────────────────
// LECTEUR PDF NATIF (via iframe / object tag)
// ──────────────────────────────────────────────────────────────────────

const BookReader = ({ book, onClose, onProgressUpdate }) => {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [readerTheme, setReaderTheme] = useState('dark');
    const [zoom, setZoom] = useState(100);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentPage, setCurrentPage] = useState(book?.read_progress || 0);
    const containerRef = useRef(null);
    const saveTimeout = useRef(null);

    const fileUrl = book?.signed_url;
    const isPdf = book?.file_type === 'pdf';

    const saveProgress = useCallback(async (progress) => {
        if (!user || !book) return;
        clearTimeout(saveTimeout.current);
        saveTimeout.current = setTimeout(async () => {
            await updateBookProgress(user.id, book.id, progress);
            onProgressUpdate?.(book.id, progress);
        }, 1500);
    }, [user, book, onProgressUpdate]);

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'f' || e.key === 'F') setIsFullscreen(p => !p);
        };
        window.addEventListener('keydown', handleKey);
        return () => {
            window.removeEventListener('keydown', handleKey);
            clearTimeout(saveTimeout.current);
        };
    }, [onClose]);

    const handleLoad = () => setLoading(false);

    const bg = readerTheme === 'dark' ? 'bg-slate-950' : 'bg-slate-100';
    const textC = readerTheme === 'dark' ? 'text-white' : 'text-slate-900';
    const toolbarBg = readerTheme === 'dark'
        ? 'bg-slate-950/95 border-white/5'
        : 'bg-white/95 border-slate-200';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[200] flex flex-col ${bg} ${isFullscreen ? '' : ''}`}
        >
            {/* ── BARRE OUTILS ─────────────────────────────────── */}
            <div className={`flex-shrink-0 flex items-center justify-between px-4 py-3 border-b ${toolbarBg} backdrop-blur-xl gap-3`}>
                {/* Gauche — Infos livre */}
                <div className="flex items-center gap-3 min-w-0">
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all flex-shrink-0"
                        title="Fermer (Esc)"
                    >
                        <X size={16} />
                    </button>
                    <div className="text-2xl flex-shrink-0">{book?.cover_emoji || '📕'}</div>
                    <div className="min-w-0">
                        <div className="text-white font-black text-[11px] uppercase tracking-wider truncate font-ancient">
                            {book?.title}
                        </div>
                        <div className="text-slate-500 text-[8px] font-bold uppercase tracking-widest">
                            {book?.author}
                        </div>
                    </div>
                </div>

                {/* Centre — Contrôles */}
                <div className="hidden md:flex items-center gap-2 flex-shrink-0">
                    {/* Zoom */}
                    <div className="flex items-center gap-1 bg-slate-900 rounded-xl border border-slate-800 px-2 py-1">
                        <button
                            onClick={() => setZoom(z => Math.max(50, z - 10))}
                            className="p-1 text-slate-400 hover:text-white transition-colors"
                        >
                            <ZoomOut size={14} />
                        </button>
                        <span className="text-[10px] font-mono font-black text-amber-500 w-10 text-center">
                            {zoom}%
                        </span>
                        <button
                            onClick={() => setZoom(z => Math.min(200, z + 10))}
                            className="p-1 text-slate-400 hover:text-white transition-colors"
                        >
                            <ZoomIn size={14} />
                        </button>
                    </div>

                    {/* Reset zoom */}
                    <button
                        onClick={() => setZoom(100)}
                        className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-white transition-all"
                        title="Réinitialiser zoom"
                    >
                        <RotateCcw size={14} />
                    </button>
                </div>

                {/* Droite — Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Thème */}
                    <button
                        onClick={() => setReaderTheme(t => t === 'dark' ? 'light' : 'dark')}
                        className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-500 transition-all"
                        title="Changer thème"
                    >
                        {readerTheme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                    </button>

                    {/* Fullscreen */}
                    <button
                        onClick={() => setIsFullscreen(f => !f)}
                        className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all"
                        title="Plein écran (F)"
                    >
                        {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                    </button>

                    {/* Télécharger */}
                    {fileUrl && (
                        <a
                            href={fileUrl}
                            download={book?.file_name}
                            className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500/20 transition-all"
                            title="Télécharger"
                        >
                            <Download size={15} />
                        </a>
                    )}
                </div>
            </div>

            {/* ── ZONE DE LECTURE ──────────────────────────────── */}
            <div ref={containerRef} className="flex-1 overflow-hidden relative">
                {loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950 z-10">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-4xl animate-pulse">
                                {book?.cover_emoji || '📕'}
                            </div>
                            <Loader size={20} className="text-amber-500 animate-spin absolute -bottom-2 -right-2" />
                        </div>
                        <div className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                            Chargement du parchemin...
                        </div>
                    </div>
                )}

                {fileUrl ? (
                    <iframe
                        src={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
                        className="w-full h-full border-0"
                        style={{
                            transform: `scale(${zoom / 100})`,
                            transformOrigin: 'top center',
                            height: zoom !== 100 ? `${100 / (zoom / 100)}%` : '100%',
                        }}
                        onLoad={handleLoad}
                        title={book?.title}
                        allow="fullscreen"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-4">
                        <div className="text-4xl">😔</div>
                        <p className="text-slate-500 text-sm font-bold">
                            Impossible de charger ce livre. L'URL a peut-être expiré.
                        </p>
                        <button onClick={onClose} className="btn-empire-primary px-6 py-3 rounded-xl text-xs font-black uppercase">
                            Retour
                        </button>
                    </div>
                )}
            </div>

            {/* ── BARRE INFO BAS ─────────────────────────────── */}
            <div className={`flex-shrink-0 flex items-center justify-between px-4 py-2 border-t ${toolbarBg} backdrop-blur-xl`}>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-[9px] text-slate-600 font-bold uppercase">
                        <BookMarked size={12} className="text-amber-500" />
                        <span>Progression</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {[0, 25, 50, 75, 100].map(pct => (
                            <button
                                key={pct}
                                onClick={() => { setCurrentPage(pct); saveProgress(pct); }}
                                className={`text-[9px] font-black px-2 py-1 rounded-lg transition-all ${currentPage >= pct ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-600 border border-slate-800 hover:border-slate-600'}`}
                            >
                                {pct}%
                            </button>
                        ))}
                    </div>
                </div>
                <div className="text-[9px] font-black text-slate-700 uppercase tracking-widest hidden sm:block">
                    Appuyez sur <span className="text-amber-500 font-mono">Esc</span> pour fermer
                </div>
            </div>
        </motion.div>
    );
};

export default BookReader;

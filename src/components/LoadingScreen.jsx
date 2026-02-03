import { motion } from 'framer-motion';

const LoadingScreen = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--bg-primary)]">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center"
            >
                <div className="text-6xl mb-4">⚔️</div>
                <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-hover)] bg-clip-text text-transparent">
                    SHADORON
                </h1>
                <p className="text-[var(--text-muted)] mb-8">Budget Discipline</p>
                <div className="spinner mx-auto"></div>
            </motion.div>
        </div>
    );
};

export default LoadingScreen;

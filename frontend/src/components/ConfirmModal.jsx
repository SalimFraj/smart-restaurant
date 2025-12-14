import { motion, AnimatePresence } from 'framer-motion';

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmClass = 'btn-error',
    icon = '⚠️',
    loading = false // New prop for loading state
}) {
    if (!isOpen) return null;

    const handleConfirm = () => {
        // Don't close immediately - let the parent handle closing after async operation
        onConfirm();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={loading ? undefined : onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="modal-box pointer-events-auto shadow-2xl max-w-md"
                        >
                            {/* Icon */}
                            <div className="flex justify-center mb-4">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                                    className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center"
                                >
                                    <span className="text-4xl">{icon}</span>
                                </motion.div>
                            </div>

                            {/* Content */}
                            <h3 className="font-bold text-2xl text-center mb-3">{title}</h3>
                            <p className="text-center text-base-content/70 mb-6">{message}</p>

                            {/* Actions */}
                            <div className="modal-action flex gap-3 justify-center">
                                <motion.button
                                    whileHover={loading ? {} : { scale: 1.05 }}
                                    whileTap={loading ? {} : { scale: 0.95 }}
                                    onClick={onClose}
                                    className="btn btn-ghost"
                                    disabled={loading}
                                >
                                    {cancelText}
                                </motion.button>
                                <motion.button
                                    whileHover={loading ? {} : { scale: 1.05 }}
                                    whileTap={loading ? {} : { scale: 0.95 }}
                                    onClick={handleConfirm}
                                    className={`btn ${confirmClass}`}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <><span className="loading loading-spinner loading-xs"></span> Processing...</>
                                    ) : (
                                        confirmText
                                    )}
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);

            // Show prompt after 30 seconds or on second visit
            const visitCount = parseInt(localStorage.getItem('visitCount') || '0');
            localStorage.setItem('visitCount', (visitCount + 1).toString());

            if (visitCount >= 1) {
                setTimeout(() => {
                    setShowPrompt(true);
                }, 30000);
            }
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setShowPrompt(false);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('PWA installed');
        }

        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('pwaPromptDismissed', 'true');
    };

    return (
        <AnimatePresence>
            {showPrompt && deferredPrompt && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
                >
                    <div className="card glass shadow-2xl">
                        <div className="card-body">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="text-4xl">📱</div>
                                    <div>
                                        <h3 className="card-title text-lg">Install Our App</h3>
                                        <p className="text-sm text-base-content/70 mt-1">
                                            Install Smart Restaurant for a better experience!
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleDismiss}
                                    className="btn btn-ghost btn-sm btn-circle"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="card-actions justify-end mt-4">
                                <button
                                    onClick={handleDismiss}
                                    className="btn btn-ghost btn-sm"
                                >
                                    Not Now
                                </button>
                                <button
                                    onClick={handleInstall}
                                    className="btn btn-primary btn-sm"
                                >
                                    Install
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

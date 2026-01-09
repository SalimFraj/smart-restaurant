import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../store';
import api from '../services/api';

/**
 * AI-powered smart suggestions component that shows contextual upsell recommendations
 * Based on: cart contents, time of day, and popular items
 */
export default function SmartSuggestions({ onAddItem }) {
    const { items: cartItems, addItem } = useCartStore();
    const [dismissed, setDismissed] = useState(false);

    // Get time-based greeting and suggestion context
    const getTimeContext = () => {
        const hour = new Date().getHours();
        if (hour < 11) return { greeting: '🌅 Good morning!', type: 'breakfast', emoji: '☕' };
        if (hour < 14) return { greeting: '☀️ Lunch time!', type: 'lunch', emoji: '🥗' };
        if (hour < 17) return { greeting: '🌤️ Good afternoon!', type: 'snack', emoji: '🍰' };
        if (hour < 21) return { greeting: '🌆 Dinner time!', type: 'dinner', emoji: '🍽️' };
        return { greeting: '🌙 Late night craving?', type: 'late', emoji: '🌮' };
    };

    const timeContext = getTimeContext();

    // Fetch AI pairing suggestions when cart has items
    const { data: pairingSuggestions = [], isLoading: loadingPairings } = useQuery({
        queryKey: ['pairings', cartItems.map(i => i._id).join(',')],
        queryFn: async () => {
            if (cartItems.length === 0) return [];
            const response = await api.post('/ai/pairings', {
                cartItems: cartItems.map(item => ({ name: item.name, category: item.category }))
            });
            return response.data.data || [];
        },
        enabled: cartItems.length > 0 && !dismissed,
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
        retry: 1
    });

    // Fetch order time estimate
    const { data: orderEstimate } = useQuery({
        queryKey: ['orderEstimate'],
        queryFn: async () => {
            const response = await api.get('/ai/estimate');
            return response.data.data;
        },
        enabled: cartItems.length > 0,
        staleTime: 2 * 60 * 1000
    });

    const handleAddSuggestion = (item) => {
        addItem(item);
        if (onAddItem) onAddItem(item);
    };

    // Don't show if dismissed or no suggestions
    if (dismissed || (cartItems.length > 0 && pairingSuggestions.length === 0 && !loadingPairings)) {
        return null;
    }

    // Show order estimate when cart has items
    if (cartItems.length > 0) {
        return (
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="card bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 shadow-lg"
                >
                    <div className="card-body p-4">
                        {/* Order Time Estimate */}
                        {orderEstimate && (
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">⏱️</span>
                                    <div>
                                        <p className="text-sm font-semibold">Estimated Wait</p>
                                        <p className="text-xs text-base-content/70">{orderEstimate.message}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-bold text-primary">{orderEstimate.estimatedMinutes}</span>
                                    <span className="text-xs text-base-content/70"> min</span>
                                    {orderEstimate.isRushHour && (
                                        <span className="badge badge-warning badge-xs ml-2">Rush Hour</span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Pairing Suggestions */}
                        {pairingSuggestions.length > 0 && (
                            <>
                                <div className="divider my-2 text-xs text-base-content/50">
                                    ✨ Perfect with your order
                                </div>
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {pairingSuggestions.map(item => (
                                        <motion.button
                                            key={item._id}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleAddSuggestion(item)}
                                            className="flex-shrink-0 flex items-center gap-2 bg-base-100 rounded-lg p-2 shadow hover:shadow-md transition-all border border-base-300"
                                        >
                                            <img
                                                src={item.image || '/placeholder-food.png'}
                                                alt={item.name}
                                                className="w-10 h-10 rounded object-cover"
                                            />
                                            <div className="text-left">
                                                <p className="text-xs font-medium truncate max-w-[100px]">{item.name}</p>
                                                <p className="text-xs text-primary font-bold">${item.price?.toFixed(2)}</p>
                                            </div>
                                            <span className="text-lg">+</span>
                                        </motion.button>
                                    ))}
                                </div>
                            </>
                        )}

                        <button
                            onClick={() => setDismissed(true)}
                            className="btn btn-ghost btn-xs self-end mt-2"
                        >
                            Dismiss
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>
        );
    }

    // Empty cart - show time-based greeting
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-4"
        >
            <span className="text-4xl">{timeContext.emoji}</span>
            <p className="text-base-content/70 mt-2">{timeContext.greeting}</p>
            <p className="text-sm text-base-content/50">Add items to see AI-powered suggestions!</p>
        </motion.div>
    );
}

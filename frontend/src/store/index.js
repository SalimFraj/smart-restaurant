import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Zustand store for cart management (replacing CartContext)
export const useCartStore = create(
    persist(
        (set, get) => ({
            items: [],
            currentUserId: null, // Track current user

            // Set current user and clear cart if user changes
            setUser: (userId) => {
                const current = get().currentUserId;
                if (current && current !== userId) {
                    // User changed, clear cart
                    set({ items: [], currentUserId: userId });
                } else {
                    set({ currentUserId: userId });
                }
            },

            addItem: (item) => {
                const items = get().items;
                const existingItem = items.find((i) => i._id === item._id);

                if (existingItem) {
                    set({
                        items: items.map((i) =>
                            i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
                        ),
                    });
                } else {
                    set({ items: [...items, { ...item, quantity: 1 }] });
                }
            },

            removeItem: (itemId) => {
                set({ items: get().items.filter((i) => i._id !== itemId) });
            },

            updateQuantity: (itemId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(itemId);
                    return;
                }
                set({
                    items: get().items.map((i) =>
                        i._id === itemId ? { ...i, quantity } : i
                    ),
                });
            },

            incrementQuantity: (itemId) => {
                const item = get().items.find((i) => i._id === itemId);
                if (item) {
                    get().updateQuantity(itemId, item.quantity + 1);
                }
            },

            decrementQuantity: (itemId) => {
                const item = get().items.find((i) => i._id === itemId);
                if (item && item.quantity > 1) {
                    get().updateQuantity(itemId, item.quantity - 1);
                }
            },

            clearCart: () => set({ items: [] }),

            getTotal: () => {
                return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
            },

            getItemCount: () => {
                return get().items.reduce((count, item) => count + item.quantity, 0);
            },
        }),
        {
            name: 'cart-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

// UI preferences store
export const useUIStore = create(
    persist(
        (set, get) => ({
            theme: 'dark', // Default to dark theme
            menuView: 'grid', // 'grid' or 'list'

            setTheme: (theme) => {
                set({ theme });
                document.documentElement.setAttribute('data-theme', theme);
            },
            toggleTheme: () => {
                const newTheme = get().theme === 'light' ? 'dark' : 'light';
                set({ theme: newTheme });
                document.documentElement.setAttribute('data-theme', newTheme);
            },
            setMenuView: (view) => set({ menuView: view }),
            toggleMenuView: () => set((state) => ({ menuView: state.menuView === 'grid' ? 'list' : 'grid' })),

            // Initialize theme on load
            initTheme: () => {
                const theme = get().theme || 'dark'; // Ensure fallback to dark
                set({ theme });
                document.documentElement.setAttribute('data-theme', theme);
            }
        }),
        {
            name: 'ui-preferences',
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.initTheme();
                }
            }
        }
    )
);

// Notification store with enhanced features
export const useNotificationStore = create((set, get) => ({
    notifications: [],

    addNotification: (notification) => {
        const id = Date.now() + Math.random();
        const newNotification = {
            id,
            timestamp: Date.now(),
            read: false,
            ...notification,
        };
        set((state) => ({
            notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep last 50
        }));
    },

    markAsRead: (id) => {
        set((state) => ({
            notifications: state.notifications.map((notif) =>
                notif.id === id ? { ...notif, read: true } : notif
            ),
        }));
    },

    markAllAsRead: () => {
        set((state) => ({
            notifications: state.notifications.map((notif) => ({
                ...notif,
                read: true,
            })),
        }));
    },

    removeNotification: (id) => {
        set((state) => ({
            notifications: state.notifications.filter((notif) => notif.id !== id),
        }));
    },

    clearAll: () => {
        set({ notifications: [] });
    },

    get unreadCount() {
        return get().notifications.filter((notif) => !notif.read).length;
    },
}));

// Favorites store
export const useFavoritesStore = create(
    persist(
        (set, get) => ({
            favorites: [],

            addFavorite: (itemId) => {
                if (!get().favorites.includes(itemId)) {
                    set({ favorites: [...get().favorites, itemId] });
                }
            },

            removeFavorite: (itemId) => {
                set({ favorites: get().favorites.filter((id) => id !== itemId) });
            },

            toggleFavorite: (itemId) => {
                if (get().favorites.includes(itemId)) {
                    get().removeFavorite(itemId);
                } else {
                    get().addFavorite(itemId);
                }
            },

            isFavorite: (itemId) => get().favorites.includes(itemId),
        }),
        {
            name: 'favorites-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

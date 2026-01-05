import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore } from '../store';
import { useNavigate } from 'react-router-dom';

export default function NotificationCenter() {
    const [isOpen, setIsOpen] = useState(false);
    const [filter, setFilter] = useState('all'); // all, unread, order, reservation
    const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotificationStore();
    const navigate = useNavigate();
    const audioRef = useRef(null);

    // Play notification sound
    const playSound = () => {
        if (audioRef.current) {
            audioRef.current.play().catch(() => {
                // Ignore autoplay policy errors
            });
        }
    };

    // Watch for new notifications and play sound
    useEffect(() => {
        if (notifications.length > 0 && !notifications[0].read) {
            playSound();
        }
    }, [notifications.length]);

    const getNotificationIcon = (type) => {
        const icons = {
            order: { emoji: '🍽️', color: 'from-orange-500 to-red-500', bg: 'bg-orange-500/10' },
            reservation: { emoji: '📅', color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/10' },
            promotion: { emoji: '🎉', color: 'from-pink-500 to-purple-500', bg: 'bg-pink-500/10' },
            review: { emoji: '⭐', color: 'from-yellow-500 to-orange-500', bg: 'bg-yellow-500/10' },
            success: { emoji: '✅', color: 'from-green-500 to-emerald-500', bg: 'bg-green-500/10' },
            warning: { emoji: '⚠️', color: 'from-yellow-500 to-amber-500', bg: 'bg-yellow-500/10' },
            error: { emoji: '❌', color: 'from-red-500 to-rose-500', bg: 'bg-red-500/10' },
            info: { emoji: '💡', color: 'from-blue-500 to-indigo-500', bg: 'bg-blue-500/10' },
        };
        return icons[type] || icons.info;
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    const filteredNotifications = notifications.filter(notif => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !notif.read;
        return notif.type === filter;
    });

    const handleNotificationClick = (notification) => {
        markAsRead(notification.id);
        if (notification.link) {
            navigate(notification.link);
            setIsOpen(false);
        }
    };

    const categories = [
        { key: 'all', label: 'All', icon: '📋' },
        { key: 'unread', label: 'Unread', icon: '🔵' },
        { key: 'order', label: 'Orders', icon: '🍽️' },
        { key: 'reservation', label: 'Reservations', icon: '📅' },
    ];

    return (
        <>
            {/* Hidden audio element for notification sounds */}
            <audio ref={audioRef} preload="auto">
                <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBi2Jz/HThzEHHGWy6+ignxgKTKXe7rllHAU2jtJ6zHAnBSd8yO3akj4JG2q066qPQw8PYKD062w3CxlqtO3QjTwJFma066"
                    type="audio/wav" />
            </audio>

            <div className="relative">
                {/* Notification Bell with Animated Badge */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(!isOpen)}
                    className="btn btn-ghost btn-circle relative group"
                >
                    <motion.svg
                        animate={unreadCount > 0 ? {
                            rotate: [0, -15, 15, -15, 15, 0],
                            transition: { repeat: Infinity, duration: 2, repeatDelay: 3 }
                        } : {}}
                        className="w-6 h-6 group-hover:text-primary transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </motion.svg>

                    <AnimatePresence>
                        {unreadCount > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-lg"
                            >
                                <motion.span
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                >
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </motion.span>
                            </motion.span>
                        )}
                    </AnimatePresence>
                </motion.button>

                {/* Premium Notification Dropdown */}
                <AnimatePresence>
                    {isOpen && (
                        <>
                            {/* Backdrop with blur */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsOpen(false)}
                                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                            />

                            {/* Dropdown Panel */}
                            <motion.div
                                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                                className="absolute right-0 mt-2 w-[420px] bg-base-100 rounded-2xl shadow-2xl z-50 max-h-[680px] flex flex-col border border-base-300/50 overflow-hidden"
                            >
                                {/* Gradient Header */}
                                <div className="bg-gradient-to-r from-primary to-secondary p-6 text-primary-content">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="text-2xl font-bold">Notifications</h3>
                                            <p className="text-sm opacity-90 mt-1">
                                                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up! 🎉'}
                                            </p>
                                        </div>
                                        {notifications.length > 0 && (
                                            <div className="flex gap-2">
                                                {unreadCount > 0 && (
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={markAllAsRead}
                                                        className="btn btn-sm btn-ghost text-primary-content hover:bg-white/20"
                                                    >
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Mark all read
                                                    </motion.button>
                                                )}
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={clearAll}
                                                    className="btn btn-sm btn-ghost text-primary-content hover:bg-white/20"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </motion.button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Category Filters */}
                                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                        {categories.map((cat) => (
                                            <motion.button
                                                key={cat.key}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setFilter(cat.key)}
                                                className={`btn btn-sm ${filter === cat.key
                                                    ? 'bg-white text-primary'
                                                    : 'btn-ghost text-primary-content hover:bg-white/20'
                                                    } whitespace-nowrap`}
                                            >
                                                <span className="mr-1">{cat.icon}</span>
                                                {cat.label}
                                                {cat.key === 'unread' && unreadCount > 0 && (
                                                    <span className="ml-1 badge badge-sm bg-primary text-primary-content">
                                                        {unreadCount}
                                                    </span>
                                                )}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                {/* Notifications List with Custom Scrollbar */}
                                <div className="flex-1 overflow-y-auto notification-scroll">
                                    {filteredNotifications.length === 0 ? (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-12 text-center"
                                        >
                                            <motion.div
                                                animate={{
                                                    y: [0, -10, 0],
                                                    rotate: [0, 5, -5, 0]
                                                }}
                                                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                                                className="text-6xl mb-4"
                                            >
                                                {filter === 'unread' ? '📭' : '🎊'}
                                            </motion.div>
                                            <p className="text-xl font-semibold mb-2">
                                                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                                            </p>
                                            <p className="text-sm text-base-content/60">
                                                {filter === 'unread' ? 'You\'re all caught up!' : 'We\'ll notify you when something happens'}
                                            </p>
                                        </motion.div>
                                    ) : (
                                        <div className="divide-y divide-base-300">
                                            <AnimatePresence mode="popLayout">
                                                {filteredNotifications.map((notification, index) => {
                                                    const iconData = getNotificationIcon(notification.type);
                                                    return (
                                                        <motion.div
                                                            key={notification.id}
                                                            layout
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            exit={{ opacity: 0, x: 20, height: 0 }}
                                                            transition={{ delay: index * 0.03 }}
                                                            className={`p-4 hover:bg-base-200/70 cursor-pointer transition-all group relative ${!notification.read ? 'bg-primary/5' : ''
                                                                }`}
                                                            onClick={() => handleNotificationClick(notification)}
                                                        >
                                                            {/* Unread Indicator */}
                                                            {!notification.read && (
                                                                <motion.div
                                                                    layoutId={`unread-${notification.id}`}
                                                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-gradient-to-b from-primary to-secondary rounded-r-full"
                                                                    initial={{ scaleY: 0 }}
                                                                    animate={{ scaleY: 1 }}
                                                                />
                                                            )}

                                                            <div className="flex gap-4 ml-2">
                                                                {/* Icon with Gradient Background */}
                                                                <motion.div
                                                                    whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                                                                    className={`flex-shrink-0 w-12 h-12 rounded-xl ${iconData.bg} flex items-center justify-center relative overflow-hidden group-hover:shadow-lg transition-shadow`}
                                                                >
                                                                    <div className={`absolute inset-0 bg-gradient-to-br ${iconData.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                                                                    <span className="text-2xl relative z-10">{iconData.emoji}</span>
                                                                </motion.div>

                                                                {/* Content */}
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-start justify-between gap-2 mb-1">
                                                                        <h4 className={`font-semibold text-sm ${!notification.read ? 'text-base-content' : 'text-base-content/80'
                                                                            }`}>
                                                                            {notification.title}
                                                                        </h4>
                                                                        <motion.button
                                                                            whileHover={{ scale: 1.2, rotate: 90 }}
                                                                            whileTap={{ scale: 0.9 }}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                removeNotification(notification.id);
                                                                            }}
                                                                            className="btn btn-ghost btn-xs btn-circle opacity-0 group-hover:opacity-100 transition-opacity"
                                                                        >
                                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                            </svg>
                                                                        </motion.button>
                                                                    </div>

                                                                    <p className="text-sm text-base-content/70 line-clamp-2 mb-2">
                                                                        {notification.message}
                                                                    </p>

                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center gap-2 text-xs text-base-content/50">
                                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                            </svg>
                                                                            {formatTime(notification.timestamp)}
                                                                        </div>

                                                                        {notification.link && (
                                                                            <motion.span
                                                                                whileHover={{ x: 3 }}
                                                                                className="text-xs text-primary font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                            >
                                                                                View details
                                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                                                </svg>
                                                                            </motion.span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </div>

                                {/* Footer with Action */}
                                {notifications.length > 3 && (
                                    <div className="p-3 border-t border-base-300 bg-base-200/50">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => {
                                                setIsOpen(false);
                                                // Navigate to notifications page if exists
                                            }}
                                            className="btn btn-ghost btn-sm w-full group"
                                        >
                                            <span>View All Notifications</span>
                                            <motion.svg
                                                className="w-4 h-4 ml-2"
                                                animate={{ x: [0, 4, 0] }}
                                                transition={{ repeat: Infinity, duration: 1.5 }}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </motion.svg>
                                        </motion.button>
                                    </div>
                                )}
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}

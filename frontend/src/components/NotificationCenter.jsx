import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNotificationStore } from '../store';
import { useNavigate } from 'react-router-dom';

export default function NotificationCenter() {
    const [isOpen, setIsOpen] = useState(false);
    const [filter, setFilter] = useState('all');
    const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotificationStore();
    const navigate = useNavigate();
    const audioRef = useRef(null);

    const playSound = () => {
        if (audioRef.current) {
            audioRef.current.play().catch(() => { });
        }
    };

    useEffect(() => {
        if (notifications.length > 0 && !notifications[0].read) {
            playSound();
        }
    }, [notifications.length]);

    const getNotificationIcon = (type) => {
        const icons = {
            order: { emoji: '🍽️', bg: 'bg-orange-500/10' },
            reservation: { emoji: '📅', bg: 'bg-blue-500/10' },
            promotion: { emoji: '🎉', bg: 'bg-pink-500/10' },
            success: { emoji: '✅', bg: 'bg-green-500/10' },
            warning: { emoji: '⚠️', bg: 'bg-yellow-500/10' },
            error: { emoji: '❌', bg: 'bg-red-500/10' },
            info: { emoji: '💡', bg: 'bg-blue-500/10' },
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
            <audio ref={audioRef} preload="auto">
                <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBi2Jz/HThzEHHGWy6+ignxgKTKXe7rllHAU2jtJ6zHAnBSd8yO3akj4JG2q066qPQw8PYKD062w3CxlqtO3QjTwJFma066" type="audio/wav" />
            </audio>

            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="btn btn-ghost btn-circle relative"
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>

                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </button>

                {isOpen && createPortal(
                    <>
                        {/* Backdrop - always fixed full screen */}
                        <div
                            className="fixed inset-0 bg-black/40 z-[9998]"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Panel - Fixed bottom sheet on mobile/tablet, dropdown on desktop */}
                        <div
                            className="fixed left-0 right-0 bottom-0 top-auto z-[9999] bg-base-100 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] rounded-t-2xl border-t border-base-300
                                       lg:left-auto lg:right-4 lg:top-20 lg:bottom-auto lg:w-96 lg:max-h-[500px] lg:rounded-xl lg:border"
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-primary to-secondary p-4 text-primary-content flex-shrink-0">
                                {/* Mobile drag handle */}
                                <div className="w-10 h-1 bg-white/40 rounded-full mx-auto mb-3 lg:hidden" />

                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h3 className="text-lg font-bold">Notifications</h3>
                                        <p className="text-xs opacity-80">
                                            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                                        </p>
                                    </div>
                                    <div className="flex gap-1">
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={markAllAsRead}
                                                className="btn btn-xs btn-ghost text-primary-content"
                                                title="Mark all read"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </button>
                                        )}
                                        <button
                                            onClick={clearAll}
                                            className="btn btn-xs btn-ghost text-primary-content"
                                            title="Clear all"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => setIsOpen(false)}
                                            className="btn btn-xs btn-ghost text-primary-content lg:hidden"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Filters */}
                                <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.key}
                                            onClick={() => setFilter(cat.key)}
                                            className={`btn btn-xs ${filter === cat.key
                                                ? 'bg-white text-primary'
                                                : 'btn-ghost text-primary-content'
                                                } whitespace-nowrap`}
                                        >
                                            <span>{cat.icon}</span>
                                            <span className="text-xs">{cat.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto">
                                {filteredNotifications.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <div className="text-5xl mb-3">
                                            {filter === 'unread' ? '📭' : '🎊'}
                                        </div>
                                        <p className="font-semibold mb-1">
                                            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                                        </p>
                                        <p className="text-sm text-base-content/60">
                                            {filter === 'unread' ? "You're all caught up!" : "We'll notify you when something happens"}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-base-200">
                                        {filteredNotifications.map((notification) => {
                                            const iconData = getNotificationIcon(notification.type);
                                            return (
                                                <div
                                                    key={notification.id}
                                                    className={`p-3 hover:bg-base-200 cursor-pointer transition-colors ${!notification.read ? 'bg-primary/5' : ''}`}
                                                    onClick={() => handleNotificationClick(notification)}
                                                >
                                                    <div className="flex gap-3">
                                                        <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${iconData.bg} flex items-center justify-center`}>
                                                            <span className="text-xl">{iconData.emoji}</span>
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <h4 className={`text-sm font-medium ${!notification.read ? 'font-semibold' : ''}`}>
                                                                    {notification.title}
                                                                </h4>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        removeNotification(notification.id);
                                                                    }}
                                                                    className="btn btn-ghost btn-xs btn-circle"
                                                                >
                                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                            <p className="text-xs text-base-content/70 line-clamp-2 mb-1">
                                                                {notification.message}
                                                            </p>
                                                            <p className="text-xs text-base-content/50">
                                                                {formatTime(notification.timestamp)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>,
                    document.body
                )}
            </div>
        </>
    );
}

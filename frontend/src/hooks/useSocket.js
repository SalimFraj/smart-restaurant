import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { useNotificationStore } from '../store';
import toast from 'react-hot-toast';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';

export const useSocket = () => {
    const socketRef = useRef(null);
    const { user } = useAuth();
    const addNotification = useNotificationStore((state) => state.addNotification);

    useEffect(() => {
        if (!user) return;

        // Initialize socket connection
        socketRef.current = io(SOCKET_URL, {
            withCredentials: true,
            transports: ['websocket', 'polling'],
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
            if (import.meta.env.DEV) {
                console.log('✅ Socket connected:', socket.id);
            }

            // Join user's personal room
            socket.emit('join', user._id);

            // Join admin room if user is admin
            if (user.role === 'admin') {
                socket.emit('join:admin');
            }
        });

        socket.on('disconnect', () => {
            if (import.meta.env.DEV) {
                console.log('🔌 Socket disconnected');
            }
        });

        // Order updates
        socket.on('order:update', (order) => {
            if (import.meta.env.DEV) {
                console.log('Order update received:', order);
            }
            addNotification({
                type: 'order',
                title: 'Order Update',
                message: `Your order #${order._id?.slice(-6)} is now ${order.status}`,
                link: `/orders`,
                data: order,
            });
            toast.success(`Order ${order.status}!`);
        });

        // New order (for admin)
        socket.on('order:new', (order) => {
            if (import.meta.env.DEV) {
                console.log('New order received:', order);
            }
            addNotification({
                type: 'order',
                title: 'New Order',
                message: `New order #${order._id?.slice(-6)} from ${order.user?.name || 'Admin User'}`,
                link: `/admin/orders`,
                data: order,
            });
            toast('New order received!', { icon: '🍕' });
        });

        // Reservation updates
        socket.on('reservation:update', (reservation) => {
            if (import.meta.env.DEV) {
                console.log('Reservation update received:', reservation);
            }
            addNotification({
                type: 'reservation',
                title: 'Reservation Update',
                message: `Your reservation for ${new Date(reservation.date).toLocaleDateString()} is ${reservation.status}`,
                link: `/reservations`,
                data: reservation,
            });
            toast.success(`Reservation ${reservation.status}!`);
        });

        // New reservation (for admin)
        socket.on('reservation:new', (reservation) => {
            if (import.meta.env.DEV) {
                console.log('New reservation received:', reservation);
            }
            addNotification({
                type: 'reservation',
                title: 'New Reservation',
                message: `New reservation for ${new Date(reservation.date).toLocaleDateString()}`,
                link: `/admin/reservations`,
                data: reservation,
            });
            toast('New reservation!', { icon: '📅' });
        });

        // New review (for admin)
        socket.on('review:new', (review) => {
            if (import.meta.env.DEV) {
                console.log('New review received:', review);
            }
            addNotification({
                type: 'review',
                title: 'New Review',
                message: `New ${review.rating}⭐ review from ${review.user?.name}`,
                link: `/admin/reviews`,
                data: review,
            });
            toast('New review received!', { icon: '⭐' });
        });

        // New feedback (for admin)
        socket.on('feedback:new', (feedback) => {
            if (import.meta.env.DEV) {
                console.log('New feedback received:', feedback);
            }
            addNotification({
                type: 'info',
                title: 'New Feedback',
                message: `New feedback received`,
                link: `/admin/feedback`,
                data: feedback,
            });
            toast('New feedback received!', { icon: '💭' });
        });

        // Review response (for user)
        socket.on('review:response', (review) => {
            if (import.meta.env.DEV) {
                console.log('Review response received:', review);
            }
            addNotification({
                type: 'review',
                title: 'Response to your review',
                message: `Admin responded to your review on ${review.menuItem?.name}`,
                link: `/menu/${review.menuItem?._id}`,
                data: review,
            });
            toast.success('New response to your review!');
        });

        // Generic notifications
        socket.on('notification', (notification) => {
            if (import.meta.env.DEV) {
                console.log('Notification received:', notification);
            }
            addNotification(notification);
            if (notification.toast !== false) {
                toast(notification.message, { icon: notification.icon || '🔔' });
            }
        });

        // Socket errors
        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [user, addNotification]);

    return socketRef.current;
};

// Hook for emitting events
export const useSocketEmit = () => {
    const socket = useSocket();

    const emitTyping = (isTyping) => {
        if (socket) {
            socket.emit('typing', { isTyping });
        }
    };

    return { emitTyping };
};

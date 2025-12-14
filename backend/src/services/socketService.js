import { logger } from '../server.js';

let io;

export const setupSocketIO = (socketIO) => {
    io = socketIO;

    io.on('connection', (socket) => {
        logger.info(`🔌 Client connected: ${socket.id}`);

        // Join room based on user ID
        socket.on('join', (userId) => {
            socket.join(`user:${userId}`);
            logger.info(`User ${userId} joined room`);
        });

        // Join admin room
        socket.on('join:admin', () => {
            socket.join('admin');
            logger.info(`Admin joined: ${socket.id}`);
        });

        // Leave admin room
        socket.on('leave:admin', () => {
            socket.leave('admin');
            logger.info(`Admin left: ${socket.id}`);
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            logger.info(`🔌 Client disconnected: ${socket.id}`);
        });

        // Typing indicator for chat
        socket.on('typing', (data) => {
            socket.broadcast.emit('user:typing', data);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO not initialized!');
    }
    return io;
};

/**
 * Sends an order status update notification to a specific user.
 * Used when admins change order status (e.g., preparing, ready, delivered).
 * 
 * @param {string} userId - The user ID to notify
 * @param {Object} order - The updated order object
 */
export const emitOrderUpdate = (userId, order) => {
    if (io) {
        io.to(`user:${userId}`).emit('order:update', order);
        logger.info(`Order update emitted for user ${userId}`);
    }
};

/**
 * Broadcasts a new order notification to all connected admins.
 * Enables immediate order handling and reduces customer wait times.
 * 
 * @param {Object} order - The newly created order object
 */
export const emitNewOrder = (order) => {
    if (io) {
        io.to('admin').emit('order:new', order);
        logger.info(`New order emitted to admins`);
    }
};

/**
 * Sends a reservation status update notification to a specific user.
 * 
 * @param {string} userId - The user ID to notify
 * @param {Object} reservation - The updated reservation object
 */
export const emitReservationUpdate = (userId, reservation) => {
    if (io) {
        io.to(`user:${userId}`).emit('reservation:update', reservation);
        logger.info(`Reservation update emitted for user ${userId}`);
    }
};

/**
 * Broadcasts a new reservation notification to all connected admins.
 * 
 * @param {Object} reservation - The newly created reservation object
 */
export const emitNewReservation = (reservation) => {
    if (io) {
        io.to('admin').emit('reservation:new', reservation);
        logger.info(`New reservation emitted to admins`);
    }
};

/**
 * Broadcasts a new review notification to all connected admins.
 * 
 * @param {Object} review - The newly created review object
 */
export const emitNewReview = (review) => {
    if (io) {
        io.to('admin').emit('review:new', review);
        logger.info(`New review emitted to admins`);
    }
};

/**
 * Broadcasts new feedback to all connected admins.
 * 
 * @param {Object} feedback - The newly submitted feedback object
 */
export const emitNewFeedback = (feedback) => {
    if (io) {
        io.to('admin').emit('feedback:new', feedback);
        logger.info(`New feedback emitted to admins`);
    }
};

/**
 * Sends a notification when an admin responds to a user's review.
 * 
 * @param {string} userId - The user ID to notify
 * @param {Object} review - The review with admin response
 */
export const emitReviewResponse = (userId, review) => {
    if (io) {
        io.to(`user:${userId}`).emit('review:response', review);
        logger.info(`Review response emitted for user ${userId}`);
    }
};

/**
 * Sends a general notification to a specific user.
 * 
 * @param {string} userId - The user ID to notify
 * @param {Object} notification - The notification object
 */
export const emitNotification = (userId, notification) => {
    if (io) {
        io.to(`user:${userId}`).emit('notification', notification);
        logger.info(`Notification sent to user ${userId}`);
    }
};

/**
 * Broadcasts a system-wide message to all connected clients.
 * Useful for maintenance notices, feature announcements, etc.
 * 
 * @param {string} event - The event name to emit
 * @param {*} data - The data to broadcast
 */
export const broadcastMessage = (event, data) => {
    if (io) {
        io.emit(event, data);
        logger.info(`Broadcast: ${event}`);
    }
};

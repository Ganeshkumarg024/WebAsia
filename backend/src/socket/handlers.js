import { verifyAccessToken } from '../utils/jwt.js';

export const socketAuth = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return next(new Error('Authentication required'));
        }

        const decoded = verifyAccessToken(token);
        socket.userId = decoded.id;
        socket.userRole = decoded.role;

        next();
    } catch (error) {
        next(new Error('Invalid token'));
    }
};

export const setupSocketHandlers = (io) => {
    io.use(socketAuth);

    io.on('connection', (socket) => {
        console.log(`✅ User connected: ${socket.userId}`);

        // Join user's personal room
        socket.join(`user_${socket.userId}`);

        // Join request room
        socket.on('join_request', (requestId) => {
            socket.join(`request_${requestId}`);
            console.log(`User ${socket.userId} joined request ${requestId}`);
        });

        // Leave request room
        socket.on('leave_request', (requestId) => {
            socket.leave(`request_${requestId}`);
            console.log(`User ${socket.userId} left request ${requestId}`);
        });

        // Typing indicator
        socket.on('typing:start', ({ requestId }) => {
            socket.to(`request_${requestId}`).emit('typing:start', {
                userId: socket.userId,
                requestId
            });
        });

        socket.on('typing:stop', ({ requestId }) => {
            socket.to(`request_${requestId}`).emit('typing:stop', {
                userId: socket.userId,
                requestId
            });
        });

        // Online status
        socket.on('status:update', (status) => {
            io.emit('user:status', {
                userId: socket.userId,
                status
            });
        });

        // Disconnect
        socket.on('disconnect', () => {
            console.log(`❌ User disconnected: ${socket.userId}`);
            io.emit('user:status', {
                userId: socket.userId,
                status: 'offline'
            });
        });
    });

    return io;
};

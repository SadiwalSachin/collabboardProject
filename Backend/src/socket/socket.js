import http from "http"
import { app } from "../../app.js"
import { Server } from "socket.io"

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: "*", // More flexible for the current network setup
        methods: ["GET", "POST"]
    }
})

// Room tracking: { roomId: { socketId: userInfo } }
const rooms = {};

io.on("connection", (socket) => {
    console.log("Connection established with socket id:-", socket.id)

    socket.on('joinRoom', ({ roomId, user }) => {
        socket.join(roomId);

        if (!rooms[roomId]) rooms[roomId] = {};

        // Save user info for this socket
        rooms[roomId][socket.id] = {
            id: socket.id,
            name: user?.displayName || 'Guest',
            photo: user?.photoURL || '',
            color: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // Random cursor color
            x: 0,
            y: 0
        };

        console.log(`User ${rooms[roomId][socket.id].name} joined room: ${roomId}`);

        // Notify others and send current users list to the new user
        io.to(roomId).emit('usersUpdated', Object.values(rooms[roomId]));
    });

    socket.on('cursorMove', ({ roomId, x, y }) => {
        if (rooms[roomId] && rooms[roomId][socket.id]) {
            rooms[roomId][socket.id].x = x;
            rooms[roomId][socket.id].y = y;
            // Broadcast movement to others in the room (excluding sender to save bandwidth)
            socket.to(roomId).emit('cursorMoved', {
                userId: socket.id,
                x,
                y
            });
        }
    });

    socket.on('whiteboardAction', (action) => {
        // Broadcast drawing actions to everyone else in the room
        socket.to(action.roomId).emit('whiteboardAction', action);
    });

    socket.on('disconnecting', () => {
        // Clean up user from any rooms they were in
        for (const roomId of socket.rooms) {
            if (rooms[roomId] && rooms[roomId][socket.id]) {
                delete rooms[roomId][socket.id];
                if (Object.keys(rooms[roomId]).length === 0) {
                    delete rooms[roomId];
                } else {
                    io.to(roomId).emit('usersUpdated', Object.values(rooms[roomId]));
                }
            }
        }
    });

    socket.on('disconnect', () => {
        console.log("User disconnected:", socket.id);
    });
})

export { io, server }
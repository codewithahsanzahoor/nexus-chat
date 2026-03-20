import http from 'http';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import app from './app.js';
import connectDB from './config/db.js';
import User from './models/User.js';

dotenv.config();

connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Map to track user status
const onlineUsers = new Map<string, string>(); // userId -> socketId

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join_user', async (userId) => {
    if (!userId) return;
    onlineUsers.set(userId, socket.id);
    socket.data.userId = userId;
    
    // Update user status in DB
    try {
      await User.findByIdAndUpdate(userId, { status: 'online' });
      io.emit('user_status_changed', { userId, status: 'online' });
    } catch (err) {
      console.error('Error updating status:', err);
    }
    
    console.log(`User ${userId} is online with socket ${socket.id}`);
  });

  socket.on('join_conversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`Socket ${socket.id} joined conversation: ${conversationId}`);
  });

  socket.on('send_message', (data) => {
    console.log('Message received on server:', data);
    // Emit to all users in the conversation room
    io.to(data.conversationId).emit('receive_message', data);
  });

  socket.on('typing', (data) => {
    socket.to(data.conversationId).emit('user_typing', data);
  });

  socket.on('disconnect', async () => {
    const userId = socket.data.userId;
    if (userId) {
      onlineUsers.delete(userId);
      try {
        await User.findByIdAndUpdate(userId, { status: 'offline', lastSeen: new Date() });
        io.emit('user_status_changed', { userId, status: 'offline' });
      } catch (err) {
        console.error('Error updating status:', err);
      }
      console.log(`User ${userId} disconnected`);
    }
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const server = http.createServer(app);
const prisma = new PrismaClient();

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"], // Accept both Vite ports
    methods: ["GET", "POST"]
  }
});

require('./socket/socketHandler')(io);

// Middleware
app.use(cors());
app.use(express.json());

// Middleware to pass io to controllers
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Routes
const authRoutes = require('./routes/authRoute');
const wikiRoutes = require('./routes/wikiRoute');
const userRoutes = require('./routes/userRoute');
const characterRoutes = require('./routes/characterRoute');
const campaignRoutes = require('./routes/campaignRoute');
const dataRoutes = require('./routes/dataRoute');

app.use('/api/auth', authRoutes);
app.use('/api/wiki', wikiRoutes);
app.use('/api/users', userRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/data', dataRoutes);

// Routes Placeholder
app.get('/', (req, res) => {
  res.send('JDR Server is running');
});

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

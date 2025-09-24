const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
require('dotenv').config({ path: './config.env' });

// Import database and routes
const { testConnection, initializeDatabase } = require('./database');
const ticketsRouter = require('./routes/tickets');
const repliesRouter = require('./routes/communication/replies');
const chatRouter = require('./routes/communication/chat');
const usersRouter = require('./routes/core/users');
const whatsappRouter = require('./routes/communication/whatsapp');
const whatsappMockRouter = require('./routes/communication/whatsapp-mock');
const authRouter = require('./routes/auth');
const slaRouter = require('./routes/management/sla');
const agentsRouter = require('./routes/agents');
const staffRouter = require('./routes/core/staff'); // New staff routes
const supportRouter = require('./routes/support'); // Support integration routes

// Import auto-escalation functionality
const { startScheduledEscalation } = require('./scheduled-escalation');

// Import WebSocket server
const WebSocketServer = require('./websocket-server');

const app = express();
const server = http.createServer(app);
app.set('trust proxy', 1); // <-- Add this line
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 1000, // limit each IP to 1000 requests per windowMs (increased from 100)
//   message: {
//     success: false,
//     message: 'Too many requests from this IP, please try again later.'
//   }
// });
// app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    console.log(`🔍 CORS Check - Origin: ${origin}, NODE_ENV: ${process.env.NODE_ENV}`);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('✅ CORS: Allowing request with no origin');
      return callback(null, true);
    }
    
    // Allow localhost origins in development
    if (process.env.NODE_ENV === 'development') {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001', 
        'http://localhost:5000',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:5000',
        'null' // For file:// protocol
      ];
      
      console.log(`🔍 CORS: Checking against allowed origins:`, allowedOrigins);
      
      if (allowedOrigins.includes(origin)) {
        console.log(`✅ CORS: Origin ${origin} is allowed`);
        return callback(null, true);
      } else {
        console.log(`❌ CORS: Origin ${origin} is NOT allowed`);
      }
    }
    
    // Allow production domain
    if (process.env.NODE_ENV === 'production' && origin === 'https://yourdomain.com') {
      console.log(`✅ CORS: Production origin ${origin} is allowed`);
      return callback(null, true);
    }
    
    console.log(`❌ CORS: Origin ${origin} rejected`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  optionsSuccessStatus: 200
}));

// CORS debugging middleware
app.use((req, res, next) => {
  if (req.path.startsWith('/api/sla')) {
    console.log(`🔍 CORS Debug - ${req.method} ${req.path}`);
    console.log(`   Origin: ${req.headers.origin}`);
    console.log(`   User-Agent: ${req.headers['user-agent']}`);
  }
  next();
});

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static file serving for uploads
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Tick System API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Text formatting middleware for all API routes
// app.use('/api', formatAllData); // Commented out as it's not essential for basic functionality

// API routes
app.use('/api/auth', authRouter);
app.use('/api/tickets', ticketsRouter);
app.use('/api/replies', repliesRouter);
app.use('/api/chat', chatRouter);
app.use('/api/users', usersRouter);
app.use('/api/whatsapp', whatsappRouter);
app.use('/api/whatsapp-mock', whatsappMockRouter);
app.use('/api/sla', slaRouter);
app.use('/api/agents', agentsRouter);
app.use('/api/staff', staffRouter); // Add staff routes
app.use('/api/support', supportRouter); // Support integration routes
app.use('/api/assignments', require('./routes/management/assignments')); // Assignment management routes

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  // Handle specific error types
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.errors
    });
  }
  
  if (error.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: 'File upload error: ' + error.message
    });
  }
  
  // Default error response
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Initialize database tables
    await initializeDatabase();
    
    // Initialize WebSocket server
    const wsServer = new WebSocketServer(server);
    
    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`🔌 WebSocket server ready on ws://localhost:${PORT}/ws`);
      console.log(`📝 API Documentation:`);
      console.log(`   - GET    /api/tickets - Get all tickets`);
      console.log(`   - POST   /api/tickets - Create new ticket`);
      console.log(`   - GET    /api/tickets/:id - Get single ticket`);
      console.log(`   - PUT    /api/tickets/:id/status - Update ticket status`);
      console.log(`   - DELETE /api/tickets/:id - Delete ticket`);
      console.log(`   - GET    /api/replies/:ticketId - Get ticket replies`);
      console.log(`   - POST   /api/replies - Add reply to ticket`);
      console.log(`   - GET    /api/chat/messages/:ticketId - Get chat messages`);
      console.log(`   - POST   /api/chat/messages - Add chat message`);
      console.log(`   - PUT    /api/chat/messages/read/:ticketId - Mark messages as read`);
      console.log(`   - GET    /api/chat/session/:ticketId - Get chat session`);
      console.log(`   - POST   /api/chat/session - Join chat session`);
      console.log(`   - PUT    /api/chat/typing - Update typing status`);
      console.log(`   - PUT    /api/chat/session/leave - Leave chat session`);
      console.log(`   - GET    /api/chat/unread/:ticketId/:userType - Get unread count`);
    });
    
    // Start the automatic escalation system
    startScheduledEscalation();

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer(); 
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const path = require('path')
const bonRoutes = require('./routes/bon.routes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS
// app.use(cors({
//     origin: process.env.NODE_ENV === 'production' 
//         ? process.env.ALLOWED_PROD_URL
//         : '*',
//     methods: ['GET', 'POST'],
//     allowedHeaders: ['Content-Type']
// }));

app.use(cors());
// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Routes
app.use('/api/bon', bonRoutes);
app.use('/public', express.static(path.join(__dirname, 'public')));

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Route non trouvée',
        path: req.originalUrl 
    });
});

// Error handler
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV}`);
    console.log(`📄 API docs: http://localhost:${PORT}/api/bon/docs`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});
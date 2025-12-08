/**
 * Express application setup
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./routes/authRoutes');
const batchRoutes = require('./routes/batchRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const cronRoutes = require('./routes/cronRoutes');
const statsRoutes = require('./routes/statsRoutes');

// Import middlewares
const { notFoundHandler, errorHandler } = require('./middlewares/errorMiddleware');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/cron', cronRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Bulk Payment System API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
    });
});

// Root endpoint
app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'Bulk Mobile Money Payment System API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            batches: '/api/batches',
            webhooks: '/api/webhooks',
            health: '/api/health',
        },
    });
});

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;

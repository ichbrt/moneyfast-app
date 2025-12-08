/**
 * HTTP Server entry point
 */

require('dotenv').config();
const app = require('./app');
const { pool } = require('./config/db');

const PORT = process.env.PORT || 3000;

// Start server
const server = app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚀 Bulk Mobile Money Payment System                     ║
║                                                            ║
║   Server running on port ${PORT}                              ║
║   Environment: ${process.env.NODE_ENV || 'development'}                    ║
║                                                            ║
║   API: http://localhost:${PORT}/api                           ║
║   Web UI: http://localhost:${PORT}                            ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);

    // Start payout worker (processes payments every 60 seconds)
    const { startPayoutWorker } = require('./services/payoutService');
    console.log('🔄 Starting automatic payout worker...');
    startPayoutWorker(60000); // Process every 60 seconds
    console.log('✅ Payout worker started successfully\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        pool.end(() => {
            console.log('Database pool closed');
            process.exit(0);
        });
    });
});

process.on('SIGINT', () => {
    console.log('\nSIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        pool.end(() => {
            console.log('Database pool closed');
            process.exit(0);
        });
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

module.exports = server;

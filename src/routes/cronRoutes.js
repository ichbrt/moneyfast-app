/**
 * Cron/Admin routes - Trigger background jobs
 */

const express = require('express');
const { processPendingItems } = require('../services/payoutService');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { asyncHandler } = require('../middlewares/errorMiddleware');

const router = express.Router();

/**
 * POST /api/cron/run-payouts
 * Manually trigger payout processing
 */
router.post(
    '/run-payouts',
    authenticate,
    authorize('ADMIN'),
    asyncHandler(async (req, res) => {
        const { limit } = req.body;

        const result = await processPendingItems(limit || 50);

        res.json({
            success: true,
            message: 'Payout processing completed',
            result,
        });
    })
);

/**
 * GET /api/cron/status
 * Get system status
 */
router.get(
    '/status',
    authenticate,
    authorize('ADMIN'),
    asyncHandler(async (req, res) => {
        const { query } = require('../config/db');

        // Get counts by status
        const batchStats = await query(`
      SELECT 
        status,
        COUNT(*) as count,
        SUM(total_amount) as total_amount
      FROM bulk_batches
      GROUP BY status
    `);

        const itemStats = await query(`
      SELECT 
        status,
        provider,
        COUNT(*) as count,
        SUM(amount) as total_amount
      FROM bulk_items
      GROUP BY status, provider
    `);

        res.json({
            success: true,
            batchStats: batchStats.rows,
            itemStats: itemStats.rows,
            timestamp: new Date().toISOString(),
        });
    })
);

module.exports = router;

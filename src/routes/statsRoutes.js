/**
 * Stats Routes
 * Endpoints for dashboard statistics and reporting
 */

const express = require('express');
const { pool } = require('../config/db');
const { authenticate } = require('../middlewares/authMiddleware');
const { asyncHandler } = require('../middlewares/errorMiddleware');

const router = express.Router();

/**
 * GET /api/stats/dashboard
 * Get aggregated statistics for the dashboard
 */
router.get(
    '/dashboard',
    authenticate,
    asyncHandler(async (req, res) => {
        // 1. Get Total Volume and Total Successful Payments
        const [volumeResult] = await pool.query(`
            SELECT 
                COALESCE(SUM(amount), 0) as total_volume,
                COUNT(*) as total_payments
            FROM payment_items 
            WHERE status = 'SUCCESS'
        `);

        // 2. Get Total Batches
        const [batchesResult] = await pool.query(`
            SELECT COUNT(*) as total_batches FROM batches
        `);

        // 3. Get Status Distribution (for Pie Chart)
        const [statusResult] = await pool.query(`
            SELECT status, COUNT(*) as count 
            FROM payment_items 
            GROUP BY status
        `);

        const statusDist = {
            success: 0,
            failed: 0,
            pending: 0,
            processing: 0
        };

        let totalItems = 0;
        statusResult.forEach(row => {
            const count = parseInt(row.count);
            totalItems += count;
            if (row.status === 'SUCCESS') statusDist.success = count;
            else if (row.status === 'FAILED') statusDist.failed = count;
            else if (row.status === 'PENDING') statusDist.pending = count;
            else if (row.status === 'PROCESSING') statusDist.processing = count;
        });

        // Calculate success rate
        const successRate = totalItems > 0
            ? ((statusDist.success / totalItems) * 100).toFixed(1)
            : 0;

        // 4. Get Provider Breakdown (for Bar Chart)
        const [providerResult] = await pool.query(`
            SELECT provider, SUM(amount) as volume
            FROM payment_items
            WHERE status = 'SUCCESS'
            GROUP BY provider
        `);

        const providerBreakdown = {
            mtn: 0,
            airtel: 0
        };

        providerResult.forEach(row => {
            if (row.provider === 'MTN') providerBreakdown.mtn = parseInt(row.volume);
            else if (row.provider === 'AIRTEL') providerBreakdown.airtel = parseInt(row.volume);
        });

        res.json({
            success: true,
            stats: {
                total_volume: parseInt(volumeResult[0].total_volume),
                total_payments: parseInt(volumeResult[0].total_payments),
                total_batches: parseInt(batchesResult[0].total_batches),
                success_rate: successRate
            },
            charts: {
                status_distribution: statusDist,
                provider_breakdown: providerBreakdown
            }
        });
    })
);

module.exports = router;

/**
 * Webhook routes - Receive callbacks from MTN and Airtel
 */

const express = require('express');
const { getItemByOperatorTxId, updateItemStatus } = require('../models/itemModel');
const { updateBatchStatus } = require('../models/batchModel');
const { asyncHandler } = require('../middlewares/errorMiddleware');

const router = express.Router();

/**
 * POST /api/webhooks/mtn
 * Receive MTN MoMo callback
 */
router.post(
    '/mtn',
    asyncHandler(async (req, res) => {
        console.log('📥 MTN webhook received:', JSON.stringify(req.body, null, 2));

        // MTN webhook payload structure (adjust based on actual MTN documentation)
        const {
            financialTransactionId,
            externalId,
            status,
            reason,
            amount,
            currency,
        } = req.body;

        try {
            // Find item by operator transaction ID
            const item = await getItemByOperatorTxId(financialTransactionId);

            if (!item) {
                console.warn(`⚠️ MTN webhook: Item not found for tx ${financialTransactionId}`);
                // Still return 200 to avoid retries
                return res.status(200).json({ received: true });
            }

            // Update item status based on MTN status
            const newStatus = status === 'SUCCESSFUL' ? 'SUCCESS' : 'FAILED';
            const errorMessage = status !== 'SUCCESSFUL' ? reason : null;

            await updateItemStatus(item.id, {
                status: newStatus,
                errorMessage,
                operatorRawResponse: req.body,
            });

            // Update batch status
            await updateBatchStatus(item.batch_id);

            console.log(`✅ MTN webhook processed: ${item.phone_number} - ${newStatus}`);

            res.status(200).json({ received: true, processed: true });
        } catch (error) {
            console.error('❌ MTN webhook error:', error);
            res.status(200).json({ received: true, processed: false });
        }
    })
);

/**
 * POST /api/webhooks/airtel
 * Receive Airtel Money callback
 */
router.post(
    '/airtel',
    asyncHandler(async (req, res) => {
        console.log('📥 Airtel webhook received:', JSON.stringify(req.body, null, 2));

        // Airtel webhook payload structure (adjust based on actual Airtel documentation)
        const {
            transaction,
            status,
            message,
        } = req.body;

        try {
            const transactionId = transaction?.id || req.body.reference;

            // Find item by operator transaction ID
            const item = await getItemByOperatorTxId(transactionId);

            if (!item) {
                console.warn(`⚠️ Airtel webhook: Item not found for tx ${transactionId}`);
                return res.status(200).json({ received: true });
            }

            // Update item status based on Airtel status
            const newStatus = status === 'SUCCESS' || status === 'TS' ? 'SUCCESS' : 'FAILED';
            const errorMessage = newStatus === 'FAILED' ? message : null;

            await updateItemStatus(item.id, {
                status: newStatus,
                errorMessage,
                operatorRawResponse: req.body,
            });

            // Update batch status
            await updateBatchStatus(item.batch_id);

            console.log(`✅ Airtel webhook processed: ${item.phone_number} - ${newStatus}`);

            res.status(200).json({ received: true, processed: true });
        } catch (error) {
            console.error('❌ Airtel webhook error:', error);
            res.status(200).json({ received: true, processed: false });
        }
    })
);

/**
 * GET /api/webhooks/test
 * Test webhook endpoint
 */
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Webhook endpoint is working',
        timestamp: new Date().toISOString(),
    });
});

module.exports = router;

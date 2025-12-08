/**
 * Payout Service - Worker that processes pending payments
 */

const { getPendingItems, updateItemStatus, incrementRetryCount } = require('../models/itemModel');
const { updateBatchStatus } = require('../models/batchModel');
const { sendPayout, isPayoutSuccessful, getPayoutError } = require('../providers/payout');

const MAX_RETRY = parseInt(process.env.RETRY_ATTEMPTS) || 3;

/**
 * Process pending payment items
 * @param {number} limit - Maximum number of items to process
 * @returns {Promise<object>} - Processing summary
 */
async function processPendingItems(limit = 50) {
    try {
        console.log(`🔄 Starting payout worker (limit: ${limit})...`);

        // Get pending items
        const items = await getPendingItems(limit);

        if (items.length === 0) {
            console.log('✅ No pending items to process');
            return {
                success: true,
                processed: 0,
                succeeded: 0,
                failed: 0,
            };
        }

        console.log(`📋 Found ${items.length} pending items`);

        let succeeded = 0;
        let failed = 0;
        const batchesUpdated = new Set();

        // Process each item
        for (const item of items) {
            try {
                // Mark as processing
                await updateItemStatus(item.id, { status: 'PROCESSING' });

                // Send payout
                console.log(`💸 Processing ${item.provider} payment to ${item.phone_number} - ${item.amount} UGX`);

                const result = await sendPayout(item.provider, {
                    phone: item.phone_number,
                    amount: item.amount,
                    externalId: item.batch_id,
                    message: 'Bulk payment from SMS Construction',
                });

                // Update based on result
                if (isPayoutSuccessful(result)) {
                    await updateItemStatus(item.id, {
                        status: 'SUCCESS',
                        operatorTxId: result.referenceId || result.airtelTxId,
                        operatorRawResponse: result.rawResponse,
                    });
                    succeeded++;
                    console.log(`✅ Success: ${item.phone_number}`);
                } else {
                    // Check if should retry
                    if (item.retry_count < MAX_RETRY) {
                        await incrementRetryCount(item.id);
                        await updateItemStatus(item.id, {
                            status: 'PENDING', // Back to pending for retry
                            errorMessage: getPayoutError(result),
                            operatorRawResponse: result.rawResponse,
                        });
                        console.log(`⚠️ Retry scheduled (${item.retry_count + 1}/${MAX_RETRY}): ${item.phone_number}`);
                    } else {
                        await updateItemStatus(item.id, {
                            status: 'FAILED',
                            errorMessage: getPayoutError(result),
                            operatorRawResponse: result.rawResponse,
                        });
                        failed++;
                        console.log(`❌ Failed: ${item.phone_number} - ${getPayoutError(result)}`);
                    }
                }

                // Track batch for status update
                batchesUpdated.add(item.batch_id);
            } catch (error) {
                console.error(`❌ Error processing item ${item.id}:`, error);
                await updateItemStatus(item.id, {
                    status: 'FAILED',
                    errorMessage: error.message,
                });
                failed++;
                batchesUpdated.add(item.batch_id);
            }

            // Small delay to avoid rate limiting
            await new Promise((resolve) => setTimeout(resolve, 200));
        }

        // Update batch statuses
        console.log(`📊 Updating ${batchesUpdated.size} batch(es) status...`);
        for (const batchId of batchesUpdated) {
            await updateBatchStatus(batchId);
        }

        console.log(`✅ Payout worker completed: ${succeeded} succeeded, ${failed} failed`);

        return {
            success: true,
            processed: items.length,
            succeeded,
            failed,
        };
    } catch (error) {
        console.error('❌ Payout worker error:', error);
        return {
            success: false,
            error: error.message,
        };
    }
}

/**
 * Start continuous payout worker (runs every interval)
 * @param {number} intervalMs - Interval in milliseconds
 */
function startPayoutWorker(intervalMs = 60000) {
    console.log(`🚀 Starting continuous payout worker (interval: ${intervalMs}ms)`);

    // Run immediately
    processPendingItems();

    // Then run on interval
    setInterval(() => {
        processPendingItems();
    }, intervalMs);
}

module.exports = {
    processPendingItems,
    startPayoutWorker,
};

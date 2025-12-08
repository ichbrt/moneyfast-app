/**
 * Batch model for database operations
 */

const { query, getClient } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

/**
 * Create a new batch with items (transaction-safe)
 * @param {object} batchData - Batch data
 * @param {array} items - Array of payment items
 * @returns {Promise<object>} - Created batch with ID
 */
async function createBatch({ reference, createdBy, items }) {
    const client = await getClient();

    try {
        await client.query('BEGIN');

        const batchId = uuidv4();
        const totalItems = items.length;
        const totalAmount = items.reduce((sum, item) => sum + Number(item.amount), 0);

        // Insert batch
        await client.query(
            `INSERT INTO bulk_batches 
       (id, reference, created_by, total_items, total_amount, currency, status, pending_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [batchId, reference, createdBy, totalItems, totalAmount, 'UGX', 'NEW', totalItems]
        );

        // Insert all items
        for (const item of items) {
            await client.query(
                `INSERT INTO bulk_items 
         (id, batch_id, phone_number, provider, amount, currency, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [uuidv4(), batchId, item.phone_number, item.provider, item.amount, 'UGX', 'PENDING']
            );
        }

        await client.query('COMMIT');

        return {
            batchId,
            reference,
            totalItems,
            totalAmount,
        };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

/**
 * Get batch by ID with items
 * @param {string} batchId - Batch ID
 * @returns {Promise<object|null>} - Batch with items
 */
async function getBatchById(batchId) {
    // Get batch
    const batchResult = await query(
        'SELECT * FROM bulk_batches WHERE id = $1',
        [batchId]
    );

    if (batchResult.rows.length === 0) {
        return null;
    }

    const batch = batchResult.rows[0];

    // Get items
    const itemsResult = await query(
        'SELECT * FROM bulk_items WHERE batch_id = $1 ORDER BY created_at',
        [batchId]
    );

    return {
        ...batch,
        items: itemsResult.rows,
    };
}

/**
 * Get all batches with pagination and filters
 * @param {object} options - Query options
 * @returns {Promise<object>} - Batches and pagination info
 */
async function getBatches({ page = 1, limit = 20, status, createdBy, fromDate, toDate }) {
    const offset = (page - 1) * limit;
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (status) {
        conditions.push(`status = $${paramIndex++}`);
        params.push(status);
    }

    if (createdBy) {
        conditions.push(`created_by = $${paramIndex++}`);
        params.push(createdBy);
    }

    if (fromDate) {
        conditions.push(`created_at >= $${paramIndex++}`);
        params.push(fromDate);
    }

    if (toDate) {
        conditions.push(`created_at <= $${paramIndex++}`);
        params.push(toDate);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await query(
        `SELECT COUNT(*) FROM bulk_batches ${whereClause}`,
        params
    );
    const totalCount = parseInt(countResult.rows[0].count);

    // Get batches
    const batchesResult = await query(
        `SELECT * FROM bulk_batches ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
        [...params, limit, offset]
    );

    return {
        batches: batchesResult.rows,
        pagination: {
            page,
            limit,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
        },
    };
}

/**
 * Update batch status and counts
 * @param {string} batchId - Batch ID
 * @returns {Promise<void>}
 */
async function updateBatchStatus(batchId) {
    const client = await getClient();

    try {
        // Calculate counts from items
        const countsResult = await client.query(
            `SELECT 
        COUNT(*) FILTER (WHERE status = 'SUCCESS') as success_count,
        COUNT(*) FILTER (WHERE status = 'FAILED') as failed_count,
        COUNT(*) FILTER (WHERE status = 'PENDING') as pending_count,
        COUNT(*) FILTER (WHERE status = 'PROCESSING') as processing_count
       FROM bulk_items WHERE batch_id = $1`,
            [batchId]
        );

        const counts = countsResult.rows[0];
        let batchStatus = 'PROCESSING';

        const totalProcessed = parseInt(counts.success_count) + parseInt(counts.failed_count);
        const totalItems = await client.query(
            'SELECT total_items FROM bulk_batches WHERE id = $1',
            [batchId]
        );

        const total = parseInt(totalItems.rows[0].total_items);

        if (totalProcessed === total) {
            // All items processed
            if (parseInt(counts.success_count) === total) {
                batchStatus = 'DONE';
            } else if (parseInt(counts.failed_count) === total) {
                batchStatus = 'FAILED';
            } else {
                batchStatus = 'PARTIAL';
            }
        } else if (parseInt(counts.pending_count) > 0 || parseInt(counts.processing_count) > 0) {
            batchStatus = 'PROCESSING';
        }

        // Update batch
        await client.query(
            `UPDATE bulk_batches 
       SET status = $1, 
           success_count = $2, 
           failed_count = $3, 
           pending_count = $4
       WHERE id = $5`,
            [batchStatus, counts.success_count, counts.failed_count, counts.pending_count, batchId]
        );
    } finally {
        client.release();
    }
}

module.exports = {
    createBatch,
    getBatchById,
    getBatches,
    updateBatchStatus,
};

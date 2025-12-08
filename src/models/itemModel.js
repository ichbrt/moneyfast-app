/**
 * Item model for database operations
 */

const { query } = require('../config/db');

/**
 * Get pending items for processing
 * @param {number} limit - Maximum number of items to fetch
 * @returns {Promise<array>} - Array of pending items
 */
async function getPendingItems(limit = 50) {
    const result = await query(
        `SELECT * FROM bulk_items 
     WHERE status = 'PENDING' 
     ORDER BY created_at 
     LIMIT $1`,
        [limit]
    );

    return result.rows;
}

/**
 * Update item status
 * @param {string} itemId - Item ID
 * @param {object} updates - Updates to apply
 * @returns {Promise<void>}
 */
async function updateItemStatus(itemId, { status, operatorTxId, operatorRawResponse, errorMessage }) {
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (status !== undefined) {
        updates.push(`status = $${paramIndex++}`);
        params.push(status);
    }

    if (operatorTxId !== undefined) {
        updates.push(`operator_tx_id = $${paramIndex++}`);
        params.push(operatorTxId);
    }

    if (operatorRawResponse !== undefined) {
        updates.push(`operator_raw_response = $${paramIndex++}`);
        params.push(JSON.stringify(operatorRawResponse));
    }

    if (errorMessage !== undefined) {
        updates.push(`error_message = $${paramIndex++}`);
        params.push(errorMessage);
    }

    params.push(itemId);

    await query(
        `UPDATE bulk_items 
     SET ${updates.join(', ')} 
     WHERE id = $${paramIndex}`,
        params
    );
}

/**
 * Increment retry count for an item
 * @param {string} itemId - Item ID
 * @returns {Promise<void>}
 */
async function incrementRetryCount(itemId) {
    await query(
        'UPDATE bulk_items SET retry_count = retry_count + 1 WHERE id = $1',
        [itemId]
    );
}

/**
 * Get item by operator transaction ID
 * @param {string} operatorTxId - Operator transaction ID
 * @returns {Promise<object|null>} - Item or null
 */
async function getItemByOperatorTxId(operatorTxId) {
    const result = await query(
        'SELECT * FROM bulk_items WHERE operator_tx_id = $1',
        [operatorTxId]
    );

    return result.rows[0] || null;
}

/**
 * Get items by batch ID
 * @param {string} batchId - Batch ID
 * @returns {Promise<array>} - Array of items
 */
async function getItemsByBatchId(batchId) {
    const result = await query(
        'SELECT * FROM bulk_items WHERE batch_id = $1 ORDER BY created_at',
        [batchId]
    );

    return result.rows;
}

module.exports = {
    getPendingItems,
    updateItemStatus,
    incrementRetryCount,
    getItemByOperatorTxId,
    getItemsByBatchId,
};

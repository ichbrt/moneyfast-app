/**
 * Batch Service - Business logic for batch management
 */

const { createBatch: createBatchModel, getBatchById, getBatches, updateBatchStatus } = require('../models/batchModel');
const { validateBatch, validateBatchReference } = require('../utils/validation');
const { detectProvider, normalizePhone } = require('../utils/phoneUtils');

/**
 * Create a new payment batch
 * @param {object} data - Batch data
 * @param {string} data.reference - Batch reference/name
 * @param {string} data.createdBy - User ID who created the batch
 * @param {array} data.items - Array of payment items
 * @returns {Promise<object>} - Created batch info
 */
async function createBatch({ reference, createdBy, items }) {
    // Validate reference
    const refValidation = validateBatchReference(reference);
    if (!refValidation.valid) {
        throw new Error(refValidation.error);
    }

    // Normalize and validate items
    const normalizedItems = items.map((item) => {
        const normalizedPhone = normalizePhone(item.phone_number);
        return {
            phone_number: normalizedPhone,
            amount: Number(item.amount),
            provider: item.provider || detectProvider(normalizedPhone), // Use existing provider or detect
            reference: item.reference || '',
            description: item.description || '',
        };
    });

    // Validate batch
    const validation = validateBatch(normalizedItems);
    if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Create batch in database
    const batch = await createBatchModel({
        reference,
        createdBy,
        items: validation.validItems,
    });

    return batch;
}

/**
 * Get batch details
 * @param {string} batchId - Batch ID
 * @returns {Promise<object>} - Batch with items
 */
async function getBatch(batchId) {
    const batch = await getBatchById(batchId);
    if (!batch) {
        throw new Error('Batch not found');
    }
    return batch;
}

/**
 * List batches with filters
 * @param {object} filters - Query filters
 * @returns {Promise<object>} - Batches and pagination
 */
async function listBatches(filters) {
    return getBatches(filters);
}

/**
 * Update batch status based on items
 * @param {string} batchId - Batch ID
 * @returns {Promise<void>}
 */
async function refreshBatchStatus(batchId) {
    await updateBatchStatus(batchId);
}

module.exports = {
    createBatch,
    getBatch,
    listBatches,
    refreshBatchStatus,
};

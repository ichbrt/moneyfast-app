/**
 * Validation utilities for payment data
 */

const { validatePhoneFormat } = require('./phoneUtils');

// Get limits from environment or use defaults
const MAX_AMOUNT = parseInt(process.env.MAX_TRANSACTION_AMOUNT) || 5000000; // 5M UGX
const MIN_AMOUNT = parseInt(process.env.MIN_TRANSACTION_AMOUNT) || 1000; // 1K UGX

/**
 * Validate payment amount
 * @param {number} amount - Amount to validate
 * @returns {object} - { valid: boolean, error: string|null }
 */
function validateAmount(amount) {
    if (amount === null || amount === undefined) {
        return { valid: false, error: 'Amount is required' };
    }

    const numAmount = Number(amount);

    if (isNaN(numAmount)) {
        return { valid: false, error: 'Amount must be a valid number' };
    }

    if (numAmount < MIN_AMOUNT) {
        return { valid: false, error: `Amount must be at least ${MIN_AMOUNT} UGX` };
    }

    if (numAmount > MAX_AMOUNT) {
        return { valid: false, error: `Amount cannot exceed ${MAX_AMOUNT} UGX` };
    }

    if (numAmount % 1 !== 0) {
        return { valid: false, error: 'Amount must be a whole number (no decimals)' };
    }

    return { valid: true, error: null };
}

/**
 * Validate a single batch item (payment row)
 * @param {object} item - Item with phone_number and amount
 * @param {number} index - Row index for error reporting
 * @returns {object} - { valid: boolean, errors: array, provider: string|null }
 */
function validateBatchItem(item, index = 0) {
    const errors = [];

    // Validate phone (skip if provider already set - means it was validated)
    if (!item.provider) {
        const phoneValidation = validatePhoneFormat(item.phone_number);
        if (!phoneValidation.valid) {
            errors.push(`Row ${index + 1}: ${phoneValidation.error}`);
            return { valid: false, errors, provider: null };
        }
    }

    // Validate amount
    const amountValidation = validateAmount(item.amount);
    if (!amountValidation.valid) {
        errors.push(`Row ${index + 1}: ${amountValidation.error}`);
    }

    return {
        valid: errors.length === 0,
        errors,
        provider: item.provider || null,
    };
}

/**
 * Validate entire batch of items
 * @param {array} items - Array of payment items
 * @returns {object} - { valid: boolean, errors: array, validItems: array }
 */
function validateBatch(items) {
    if (!Array.isArray(items) || items.length === 0) {
        return {
            valid: false,
            errors: ['Batch must contain at least one item'],
            validItems: [],
        };
    }

    const errors = [];
    const validItems = [];
    const duplicateCheck = new Set();

    items.forEach((item, index) => {
        const validation = validateBatchItem(item, index);

        if (!validation.valid) {
            errors.push(...validation.errors);
        } else {
            // Check for duplicates
            const key = item.phone_number.replace(/\D/g, '');
            if (duplicateCheck.has(key)) {
                errors.push(`Row ${index + 1}: Duplicate phone number ${item.phone_number}`);
            } else {
                duplicateCheck.add(key);
                validItems.push({
                    ...item,
                    provider: validation.provider || item.provider,
                });
            }
        }
    });

    return {
        valid: errors.length === 0,
        errors,
        validItems,
        totalItems: items.length,
        validCount: validItems.length,
        errorCount: errors.length,
    };
}

/**
 * Validate batch reference/name
 * @param {string} reference - Batch reference
 * @returns {object} - { valid: boolean, error: string|null }
 */
function validateBatchReference(reference) {
    if (!reference || typeof reference !== 'string') {
        return { valid: false, error: 'Batch reference is required' };
    }

    if (reference.length < 3) {
        return { valid: false, error: 'Batch reference too short (min 3 characters)' };
    }

    if (reference.length > 150) {
        return { valid: false, error: 'Batch reference too long (max 150 characters)' };
    }

    return { valid: true, error: null };
}

module.exports = {
    validateAmount,
    validateBatchItem,
    validateBatch,
    validateBatchReference,
    MAX_AMOUNT,
    MIN_AMOUNT,
};

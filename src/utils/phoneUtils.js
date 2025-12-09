/**
 * Phone number utilities for Uganda mobile networks
 * Handles provider detection and phone number normalization
 */

// Uganda mobile network prefixes
const MTN_PREFIXES = ['077', '078', '076'];
const AIRTEL_PREFIXES = ['070', '075'];

/**
 * Detect mobile network provider based on phone prefix
 * @param {string} phone - Phone number (local or international format)
 * @returns {string|null} - 'MTN', 'AIRTEL', or null if unknown
 */
function detectProvider(phone) {
    if (!phone) return null;

    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');

    // Normalize to local format for checking (07...)
    let checkStr = cleaned;
    if (checkStr.startsWith('256')) {
        checkStr = '0' + checkStr.substring(3);
    }

    // Ensure we have at least 3 digits
    if (checkStr.length < 3) return null;

    const prefix = checkStr.substring(0, 3);

    if (MTN_PREFIXES.includes(prefix)) {
        return 'MTN';
    }

    if (AIRTEL_PREFIXES.includes(prefix)) {
        return 'AIRTEL';
    }

    return null;
}

/**
 * Normalize phone number to international format (256xxx)
 * @param {string} phone - Phone number in any format
 * @returns {string} - Normalized phone number (256xxxxxxxxx)
 */
function normalizePhone(phone) {
    if (!phone) return '';

    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');

    // If starts with 0, replace with 256
    if (cleaned.startsWith('0')) {
        cleaned = '256' + cleaned.substring(1);
    }

    // If doesn't start with 256, assume it's missing and add it
    if (!cleaned.startsWith('256')) {
        cleaned = '256' + cleaned;
    }

    return cleaned;
}

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {object} - { valid: boolean, error: string|null }
 */
function validatePhoneFormat(phone) {
    if (!phone || typeof phone !== 'string') {
        return { valid: false, error: 'Phone number is required' };
    }

    const cleaned = phone.replace(/\D/g, '');

    // Check minimum length
    if (cleaned.length < 9) {
        return { valid: false, error: 'Phone number too short' };
    }

    // Check maximum length
    if (cleaned.length > 12) {
        return { valid: false, error: 'Phone number too long' };
    }

    // Detect provider
    const provider = detectProvider(phone);
    if (!provider) {
        return { valid: false, error: 'Unknown or unsupported mobile network' };
    }

    return { valid: true, error: null, provider };
}

/**
 * Format phone for display (adds spaces for readability)
 * @param {string} phone - Phone number
 * @returns {string} - Formatted phone (e.g., "+256 77 1234567")
 */
function formatPhoneDisplay(phone) {
    const normalized = normalizePhone(phone);
    if (normalized.length === 12) {
        // 256 77 1234567
        return `+${normalized.substring(0, 3)} ${normalized.substring(3, 5)} ${normalized.substring(5)}`;
    }
    return phone;
}

module.exports = {
    detectProvider,
    normalizePhone,
    validatePhoneFormat,
    formatPhoneDisplay,
    MTN_PREFIXES,
    AIRTEL_PREFIXES,
};

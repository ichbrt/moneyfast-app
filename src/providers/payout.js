/**
 * Unified payout service
 * Routes payments to correct provider (MTN or Airtel)
 */

const { sendMtnPayout } = require('./mtn');
const { sendAirtelPayout } = require('./airtel');
const { sendMockPayout } = require('./mock');

const MOCK_MODE = process.env.MOCK_MODE === 'true';

/**
 * Send payout through the appropriate provider
 * @param {string} provider - 'MTN' or 'AIRTEL'
 * @param {object} params - Payment parameters
 * @param {string} params.phone - Recipient phone number
 * @param {number} params.amount - Amount in UGX
 * @param {string} params.externalId - External reference (batch ID)
 * @param {string} params.message - Optional message/narration
 * @returns {Promise<object>} - Transaction result
 */
async function sendPayout(provider, { phone, amount, externalId, message }) {
    const providerUpper = provider?.toUpperCase();

    // Mock Mode Check
    if (MOCK_MODE) {
        console.log(`[MOCK] Sending ${provider} payout to ${phone}`);
        return sendMockPayout(providerUpper, { phone, amount, externalId });
    }

    if (providerUpper === 'MTN') {
        return sendMtnPayout({
            phone,
            amount,
            externalId,
            payerMessage: message || 'Bulk payment',
            payeeNote: message || 'Payment from SMS Construction',
        });
    }

    if (providerUpper === 'AIRTEL') {
        return sendAirtelPayout({
            phone,
            amount,
            externalId,
            narration: message || 'Bulk payment',
        });
    }

    throw new Error(`Unknown provider: ${provider}`);
}

/**
 * Determine if a payout result represents success
 * @param {object} result - Payout result from sendPayout
 * @returns {boolean} - True if successful
 */
function isPayoutSuccessful(result) {
    return result && result.success === true;
}

/**
 * Extract error message from payout result
 * @param {object} result - Payout result
 * @returns {string} - Error message
 */
function getPayoutError(result) {
    if (!result) return 'Unknown error';
    return result.error || result.rawResponse?.message || 'Payment failed';
}

module.exports = {
    sendPayout,
    isPayoutSuccessful,
    getPayoutError,
};

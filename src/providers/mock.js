/**
 * Mock Provider - Simulates Mobile Money APIs
 * Used for testing and demonstration without real money
 */

const { v4: uuidv4 } = require('uuid');

/**
 * Send mock payout
 * @param {object} params - Payment parameters
 * @returns {Promise<object>} - Transaction result
 */
async function sendMockPayout(provider, { phone, amount, externalId }) {
    // Simulate network delay (0.5 - 1.5 seconds)
    const delay = Math.floor(Math.random() * 1000) + 500;
    await new Promise(resolve => setTimeout(resolve, delay));

    const referenceId = uuidv4();

    // Simulate failures based on phone number patterns
    // Ends with 999 -> Insufficient Funds
    // Ends with 888 -> Account Suspended
    // Ends with 777 -> Network Error

    if (phone.endsWith('999')) {
        return {
            success: false,
            provider,
            referenceId,
            httpStatus: 422, // Unprocessable Entity
            error: 'INSUFFICIENT_FUNDS',
            rawResponse: {
                status: 'FAILED',
                reason: 'Payer account has insufficient funds'
            }
        };
    }

    if (phone.endsWith('888')) {
        return {
            success: false,
            provider,
            referenceId,
            httpStatus: 403, // Forbidden
            error: 'ACCOUNT_SUSPENDED',
            rawResponse: {
                status: 'FAILED',
                reason: 'Payee account is suspended'
            }
        };
    }

    if (phone.endsWith('777')) {
        return {
            success: false,
            provider,
            referenceId,
            httpStatus: 500,
            error: 'NETWORK_ERROR',
            rawResponse: {
                status: 'ERROR',
                reason: 'Upstream provider timeout'
            }
        };
    }

    // Default: Success
    return {
        success: true,
        provider,
        referenceId,
        httpStatus: 202, // Accepted
        rawResponse: {
            status: 'SUCCESSFUL',
            transactionId: `MOCK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            message: 'Transaction processed successfully in Mock Mode'
        }
    };
}

module.exports = {
    sendMockPayout
};

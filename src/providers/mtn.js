/**
 * MTN Mobile Money Disbursement API Integration
 * Documentation: https://momodeveloper.mtn.com/
 */

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { normalizePhone } = require('../utils/phoneUtils');

const MTN_BASE_URL = process.env.MTN_BASE_URL || 'https://sandbox.momodeveloper.mtn.com';
const MTN_SUBSCRIPTION_KEY = process.env.MTN_SUBSCRIPTION_KEY;
const MTN_API_USER = process.env.MTN_API_USER;
const MTN_API_KEY = process.env.MTN_API_KEY;
const MTN_TARGET_ENVIRONMENT = process.env.MTN_TARGET_ENVIRONMENT || 'sandbox';

/**
 * Get MTN access token
 * @returns {Promise<string>} - Access token
 */
async function getMtnToken() {
    try {
        const auth = Buffer.from(`${MTN_API_USER}:${MTN_API_KEY}`).toString('base64');

        const response = await axios.post(
            `${MTN_BASE_URL}/disbursement/token/`,
            {},
            {
                headers: {
                    'Ocp-Apim-Subscription-Key': MTN_SUBSCRIPTION_KEY,
                    'Authorization': `Basic ${auth}`,
                },
                timeout: 20000,
            }
        );

        return response.data.access_token;
    } catch (error) {
        console.error('MTN token error:', error.response?.data || error.message);
        throw new Error(`Failed to get MTN access token: ${error.message}`);
    }
}

/**
 * Send money via MTN MoMo Disbursement
 * @param {object} params - Payment parameters
 * @param {string} params.phone - Recipient phone number
 * @param {number} params.amount - Amount in UGX
 * @param {string} params.externalId - External reference (batch ID)
 * @param {string} params.payerMessage - Message to payer
 * @param {string} params.payeeNote - Note to payee
 * @returns {Promise<object>} - Transaction result
 */
async function sendMtnPayout({ phone, amount, externalId, payerMessage, payeeNote }) {
    try {
        const token = await getMtnToken();
        const referenceId = uuidv4();
        const msisdn = normalizePhone(phone);

        const payload = {
            amount: amount.toString(),
            currency: 'UGX',
            externalId: externalId || referenceId,
            payee: {
                partyIdType: 'MSISDN',
                partyId: msisdn,
            },
            payerMessage: payerMessage || 'Bulk payment',
            payeeNote: payeeNote || 'Payment from SMS Construction',
        };

        const response = await axios.post(
            `${MTN_BASE_URL}/disbursement/v1_0/transfer`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Reference-Id': referenceId,
                    'X-Target-Environment': MTN_TARGET_ENVIRONMENT,
                    'Ocp-Apim-Subscription-Key': MTN_SUBSCRIPTION_KEY,
                    'Authorization': `Bearer ${token}`,
                },
                timeout: 30000,
                validateStatus: (status) => status >= 200 && status < 500,
            }
        );

        // MTN typically returns 202 Accepted for successful disbursement request
        if (response.status === 202 || response.status === 200) {
            return {
                success: true,
                provider: 'MTN',
                referenceId,
                httpStatus: response.status,
                rawResponse: response.data || {},
            };
        } else {
            return {
                success: false,
                provider: 'MTN',
                referenceId,
                httpStatus: response.status,
                rawResponse: response.data || {},
                error: response.data?.message || `HTTP ${response.status}`,
            };
        }
    } catch (error) {
        console.error('MTN payout error:', error.response?.data || error.message);
        return {
            success: false,
            provider: 'MTN',
            error: error.response?.data?.message || error.message,
            httpStatus: error.response?.status || 0,
            rawResponse: error.response?.data || {},
        };
    }
}

/**
 * Get transaction status from MTN
 * @param {string} referenceId - Transaction reference ID
 * @returns {Promise<object>} - Transaction status
 */
async function getMtnTransactionStatus(referenceId) {
    try {
        const token = await getMtnToken();

        const response = await axios.get(
            `${MTN_BASE_URL}/disbursement/v1_0/transfer/${referenceId}`,
            {
                headers: {
                    'Ocp-Apim-Subscription-Key': MTN_SUBSCRIPTION_KEY,
                    'Authorization': `Bearer ${token}`,
                    'X-Target-Environment': MTN_TARGET_ENVIRONMENT,
                },
                timeout: 20000,
            }
        );

        return {
            success: true,
            status: response.data.status,
            data: response.data,
        };
    } catch (error) {
        console.error('MTN status check error:', error.response?.data || error.message);
        return {
            success: false,
            error: error.message,
        };
    }
}

/**
 * Get MTN wallet balance
 * @returns {Promise<object>} - Balance information
 */
async function getMtnBalance() {
    try {
        const token = await getMtnToken();

        const response = await axios.get(
            `${MTN_BASE_URL}/disbursement/v1_0/account/balance`,
            {
                headers: {
                    'Ocp-Apim-Subscription-Key': MTN_SUBSCRIPTION_KEY,
                    'Authorization': `Bearer ${token}`,
                    'X-Target-Environment': MTN_TARGET_ENVIRONMENT,
                },
                timeout: 20000,
            }
        );

        return {
            success: true,
            balance: response.data.availableBalance,
            currency: response.data.currency,
        };
    } catch (error) {
        console.error('MTN balance error:', error.response?.data || error.message);
        return {
            success: false,
            error: error.message,
        };
    }
}

module.exports = {
    sendMtnPayout,
    getMtnTransactionStatus,
    getMtnBalance,
    getMtnToken,
};

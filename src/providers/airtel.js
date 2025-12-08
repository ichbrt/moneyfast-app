/**
 * Airtel Money Disbursement API Integration
 * Documentation: https://developers.airtel.africa/
 */

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { normalizePhone } = require('../utils/phoneUtils');

const AIRTEL_BASE_URL = process.env.AIRTEL_BASE_URL || 'https://openapiuat.airtel.africa';
const AIRTEL_CLIENT_ID = process.env.AIRTEL_CLIENT_ID;
const AIRTEL_CLIENT_SECRET = process.env.AIRTEL_CLIENT_SECRET;

// Token cache to avoid requesting new token for every transaction
let tokenCache = {
    token: null,
    expiresAt: 0,
};

/**
 * Get Airtel OAuth access token
 * @returns {Promise<string>} - Access token
 */
async function getAirtelToken() {
    try {
        // Return cached token if still valid
        const now = Date.now() / 1000;
        if (tokenCache.token && tokenCache.expiresAt > now + 60) {
            return tokenCache.token;
        }

        const response = await axios.post(
            `${AIRTEL_BASE_URL}/auth/oauth2/token`,
            {
                client_id: AIRTEL_CLIENT_ID,
                client_secret: AIRTEL_CLIENT_SECRET,
                grant_type: 'client_credentials',
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 20000,
            }
        );

        const token = response.data.access_token;
        const expiresIn = response.data.expires_in || 3600;

        // Cache the token
        tokenCache = {
            token,
            expiresAt: now + expiresIn,
        };

        return token;
    } catch (error) {
        console.error('Airtel token error:', error.response?.data || error.message);
        throw new Error(`Failed to get Airtel access token: ${error.message}`);
    }
}

/**
 * Send money via Airtel Money Disbursement
 * @param {object} params - Payment parameters
 * @param {string} params.phone - Recipient phone number
 * @param {number} params.amount - Amount in UGX
 * @param {string} params.externalId - External reference (batch ID)
 * @param {string} params.narration - Transaction narration
 * @returns {Promise<object>} - Transaction result
 */
async function sendAirtelPayout({ phone, amount, externalId, narration }) {
    try {
        const token = await getAirtelToken();
        const referenceId = uuidv4();
        const msisdn = normalizePhone(phone);

        const payload = {
            reference: referenceId,
            subscriber: {
                country: 'UG',
                currency: 'UGX',
                msisdn: msisdn,
            },
            transaction: {
                amount: amount.toString(),
                country: 'UG',
                currency: 'UGX',
                id: externalId || referenceId,
            },
            // Note: Exact payload structure may vary based on Airtel's API version
            // Adjust based on official Airtel documentation
        };

        const response = await axios.post(
            `${AIRTEL_BASE_URL}/standard/v1/disbursements/`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-Country': 'UG',
                    'X-Currency': 'UGX',
                },
                timeout: 30000,
                validateStatus: (status) => status >= 200 && status < 500,
            }
        );

        // Airtel typically returns 200 or 201 for successful request
        if (response.status === 200 || response.status === 201) {
            return {
                success: true,
                provider: 'AIRTEL',
                referenceId,
                httpStatus: response.status,
                rawResponse: response.data || {},
                airtelTxId: response.data?.data?.transaction?.id || null,
            };
        } else {
            return {
                success: false,
                provider: 'AIRTEL',
                referenceId,
                httpStatus: response.status,
                rawResponse: response.data || {},
                error: response.data?.message || `HTTP ${response.status}`,
            };
        }
    } catch (error) {
        console.error('Airtel payout error:', error.response?.data || error.message);
        return {
            success: false,
            provider: 'AIRTEL',
            error: error.response?.data?.message || error.message,
            httpStatus: error.response?.status || 0,
            rawResponse: error.response?.data || {},
        };
    }
}

/**
 * Get transaction status from Airtel
 * @param {string} transactionId - Airtel transaction ID
 * @returns {Promise<object>} - Transaction status
 */
async function getAirtelTransactionStatus(transactionId) {
    try {
        const token = await getAirtelToken();

        const response = await axios.get(
            `${AIRTEL_BASE_URL}/standard/v1/disbursements/${transactionId}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-Country': 'UG',
                    'X-Currency': 'UGX',
                },
                timeout: 20000,
            }
        );

        return {
            success: true,
            status: response.data?.data?.transaction?.status,
            data: response.data,
        };
    } catch (error) {
        console.error('Airtel status check error:', error.response?.data || error.message);
        return {
            success: false,
            error: error.message,
        };
    }
}

module.exports = {
    sendAirtelPayout,
    getAirtelTransactionStatus,
    getAirtelToken,
};

/**
 * CSV Service - Parse and validate CSV files
 */

const { parse } = require('csv-parse/sync');
const { validateBatch } = require('../utils/validation');
const { detectProvider, normalizePhone } = require('../utils/phoneUtils');

/**
 * Parse CSV file content
 * @param {Buffer|string} fileContent - CSV file content
 * @returns {Promise<object>} - Parsed and validated data
 */
async function parseCSV(fileContent) {
    try {
        // Parse CSV
        const records = parse(fileContent, {
            columns: true, // Use first row as column names
            skip_empty_lines: true,
            trim: true,
            cast: (value, context) => {
                // Cast amount to number
                if (context.column === 'amount') {
                    return parseFloat(value);
                }
                return value;
            },
        });

        // Map to standard format
        const items = records.map((record, index) => ({
            phone_number: record.phone_number || record.phone || record.msisdn,
            amount: record.amount,
            reference: record.reference || '',
            description: record.description || record.narration || '',
            rowIndex: index + 1,
        }));

        // Validate batch
        const validation = validateBatch(items);

        // Normalize phone numbers and add provider for valid items
        const normalizedItems = validation.validItems.map((item) => ({
            ...item,
            phone_number: normalizePhone(item.phone_number),
            provider: detectProvider(item.phone_number),
        }));

        return {
            success: validation.valid,
            items: normalizedItems,
            errors: validation.errors,
            summary: {
                totalRows: items.length,
                validRows: normalizedItems.length,
                errorRows: validation.errors.length,
                totalAmount: normalizedItems.reduce((sum, item) => sum + Number(item.amount), 0),
            },
        };
    } catch (error) {
        console.error('CSV parsing error:', error);
        return {
            success: false,
            items: [],
            errors: [error.message],
            summary: null,
        };
    }
}

/**
 * Generate sample CSV template
 * @returns {string} - CSV template content
 */
function generateCSVTemplate() {
    return `phone_number,amount,reference,description
0772123456,450000,DEC-2025-001,Site foreman salary
0783987654,1200000,DEC-2025-002,Engineer salary
0751234567,800000,DEC-2025-003,Store keeper salary
0709988776,950000,DEC-2025-004,HSE officer salary`;
}

module.exports = {
    parseCSV,
    generateCSVTemplate,
};

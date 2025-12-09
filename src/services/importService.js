/**
 * Import Service - Parse and validate CSV and Excel files
 */

const { parse } = require('csv-parse/sync');
const xlsx = require('xlsx');
const { validateBatch } = require('../utils/validation');
const { detectProvider, normalizePhone } = require('../utils/phoneUtils');

/**
 * Parse CSV file content
 * @param {Buffer|string} fileContent - CSV file content
 * @returns {object} - Parsed and validated data
 */
function parseCSV(fileContent) {
    try {
        const records = parse(fileContent, {
            columns: true, // Use first row as column names
            skip_empty_lines: true,
            trim: true,
            cast: (value, context) => {
                if (context.column === 'amount') {
                    return parseFloat(value);
                }
                return value;
            },
        });

        return processRecords(records);
    } catch (error) {
        throw new Error(`CSV Parsing Error: ${error.message}`);
    }
}

/**
 * Parse Excel file content
 * @param {Buffer} fileBuffer - Excel file buffer
 * @returns {object} - Parsed and validated data
 */
function parseExcel(fileBuffer) {
    try {
        const workbook = xlsx.read(fileBuffer, { type: 'buffer' });

        // Read the first sheet
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert to JSON
        const records = xlsx.utils.sheet_to_json(sheet, {
            defval: '', // Default value for empty cells
            raw: false, // Parse everything as strings initially
        });

        return processRecords(records);
    } catch (error) {
        throw new Error(`Excel Parsing Error: ${error.message}`);
    }
}

/**
 * Common processing for records from any source
 * @param {Array} records - Raw records
 * @returns {object} - Normalized validation result
 */
function processRecords(records) {
    // Map to standard format
    const items = records.map((record, index) => {
        // Handle various column name possibilities (case insensitive lookup could be added if needed)
        // For Excel, keys might be trimmed or not depending on the file, xlsx utils usually trim headers if configured,
        // but let's be robust.

        // Helper to find a key case-insensitively and flexibly
        const findKey = (obj, keys) => {
            const objKeys = Object.keys(obj);
            for (const key of keys) {
                // Direct match
                if (obj[key] !== undefined) return obj[key];

                // Flexible match (case insensitive, ignore underscores and spaces)
                const normalize = (str) => str.toLowerCase().replace(/[_ ]/g, '').trim();
                const targetKey = normalize(key);

                const found = objKeys.find(k => normalize(k) === targetKey);

                if (found) {
                    return obj[found];
                }
            }
            return undefined;
        };

        const phoneNumber = findKey(record, ['phone_number', 'phone', 'msisdn', 'mobile']);
        let safePhone = phoneNumber;
        if (safePhone !== undefined && safePhone !== null) {
            safePhone = String(safePhone);
        }

        const amount = findKey(record, ['amount', 'value']);
        const reference = findKey(record, ['reference', 'ref']);
        const description = findKey(record, ['description', 'narration', 'desc']);

        // Clean amount (remove commas etc if string)
        let parsedAmount = amount;
        if (typeof amount === 'string') {
            parsedAmount = parseFloat(amount.replace(/,/g, ''));
        }

        return {
            phone_number: safePhone,
            amount: parsedAmount,
            reference: reference || '',
            description: description || '',
            rowIndex: index + 1,
        }
    });

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
}

/**
 * Parse import file based on type
 * @param {Buffer} buffer - File buffer
 * @param {string} mimetype - File mimetype
 * @param {string} originalName - Original filename
 */
function parseImportFile(buffer, mimetype, originalName) {
    const isCsv = mimetype === 'text/csv' || originalName.toLowerCase().endsWith('.csv');
    const isExcel = mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        || mimetype === 'application/vnd.ms-excel'
        || originalName.toLowerCase().endsWith('.xlsx')
        || originalName.toLowerCase().endsWith('.xls');

    if (isCsv) {
        return parseCSV(buffer);
    } else if (isExcel) {
        return parseExcel(buffer);
    } else {
        throw new Error('Unsupported file format. Please upload CSV or Excel file.');
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
    parseImportFile,
    generateCSVTemplate,
};

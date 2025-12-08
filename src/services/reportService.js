/**
 * Report Service - Generate reports for batches
 */

const xlsx = require('xlsx');
const { getBatch } = require('./batchService');

/**
 * Generate Excel report for a batch
 * @param {string} batchId - Batch ID
 * @returns {Promise<Buffer>} - Excel file buffer
 */
async function generateBatchReport(batchId) {
    const batch = await getBatch(batchId);

    // Prepare data for Excel
    const data = batch.items.map(item => ({
        'Phone Number': item.phone_number,
        'Amount': Number(item.amount),
        'Provider': item.provider || 'N/A',
        'Status': item.status,
        'Transaction ID': item.operatorTxId || '',
        'Reference': item.reference || '',
        'Description': item.description || '',
        'Error Message': item.errorMessage || '',
        'Last Updated': item.updated_at ? new Date(item.updated_at).toLocaleString() : ''
    }));

    // Create workbook and worksheet
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(data);

    // Set column widths
    const wscols = [
        { wch: 15 }, // Phone
        { wch: 12 }, // Amount
        { wch: 10 }, // Provider
        { wch: 12 }, // Status
        { wch: 20 }, // Transaction ID
        { wch: 15 }, // Reference
        { wch: 25 }, // Description
        { wch: 30 }, // Error Message
        { wch: 20 }, // Last Updated
    ];
    ws['!cols'] = wscols;

    xlsx.utils.book_append_sheet(wb, ws, 'Batch Report');

    // Generate buffer
    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return {
        buffer,
        filename: `Batch_Report_${batch.reference.replace(/[^a-z0-9]/gi, '_')}.xlsx`
    };
}

module.exports = {
    generateBatchReport
};

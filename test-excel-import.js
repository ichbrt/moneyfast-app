const xlsx = require('xlsx');
const { parseImportFile } = require('./src/services/importService');
const fs = require('fs');
const path = require('path');

// 1. Create a dummy Excel file
const wb = xlsx.utils.book_new();
const data = [
    { phone_number: '0772123456', amount: 50000, reference: 'REF001', description: 'Test 1' },
    { phone_number: '0701234567', amount: '100000', reference: 'REF002', description: 'Test 2' },
    { phone_number: '0759876543', amount: 25000, reference: 'REF003', description: 'Test 3' }
];
const ws = xlsx.utils.json_to_sheet(data);
xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');

const testFilePath = path.join(__dirname, 'test_batch.xlsx');
xlsx.writeFile(wb, testFilePath);

console.log(`Created test file at ${testFilePath}`);

// 2. Read and parse it
try {
    const fileBuffer = fs.readFileSync(testFilePath);
    console.log('Reading file...');

    const result = parseImportFile(fileBuffer, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'test_batch.xlsx');

    console.log('Parsing result:');
    console.log(JSON.stringify(result, null, 2));

    if (result.success && result.items.length === 3) {
        console.log('✅ TEST PASSED: Excel file parsed successfully.');
    } else {
        console.error('❌ TEST FAILED: Parsing failed or incorrect item count.');
    }

} catch (error) {
    console.error('❌ TEST FAILED with error:', error);
} finally {
    // Cleanup
    if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
        console.log('Cleaned up test file.');
    }
}

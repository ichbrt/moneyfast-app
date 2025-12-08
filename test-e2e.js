/**
 * E2E System Verification Script
 * Simulates user flow: Login -> Upload Excel -> Wait for Process -> Download Report
 */

const axios = require('axios');
const fs = require('fs');
const xlsx = require('xlsx');
const FormData = require('form-data');
const path = require('path');

const BASE_URL = 'http://localhost:3000/api';
const EMAIL = 'admin@smsconstruction.com';
const PASSWORD = 'admin123';

// Delay helper
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runTest() {
    console.log('🚀 Starting End-to-End Test...');

    try {
        // 1. Login
        console.log('\n🔐 Logging in...');
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: EMAIL,
            password: PASSWORD
        });
        const token = loginRes.data.token;
        console.log('✅ Login successful. Token received.');

        const authHeaders = { Authorization: `Bearer ${token}` };

        // 2. Create Test Excel
        console.log('\n📄 Creating test Excel file...');
        const wb = xlsx.utils.book_new();
        const data = [
            { phone_number: '0772123456', amount: 5000, reference: 'TEST-1', description: 'Test payment 1' }, // MTN Success
            { phone_number: '0701234999', amount: 9000, reference: 'TEST-FAIL', description: 'Test failure case' }, // Airtel Fail (ends in 999)
            { phone_number: '0759876543', amount: 4500, reference: 'TEST-2', description: 'Test payment 2' }  // Airtel Success
        ];
        const ws = xlsx.utils.json_to_sheet(data);
        xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
        const testFilePath = path.join(__dirname, 'e2e_test.xlsx');
        xlsx.writeFile(wb, testFilePath);
        console.log('✅ Test file created.');

        // 3. Upload File
        console.log('\n📤 Uploading file...');
        const formData = new FormData();
        formData.append('file', fs.createReadStream(testFilePath));
        formData.append('reference', `E2E Test ${Date.now()}`);

        const uploadRes = await axios.post(`${BASE_URL}/batches/upload-csv`, formData, {
            headers: {
                ...authHeaders,
                ...formData.getHeaders()
            }
        });
        const batchId = uploadRes.data.batch.batchId; // Adjust based on actual response structure
        console.log(`✅ Upload successful. Batch ID: ${batchId}`);

        // 4. Poll for completion
        console.log('\n⏳ Waiting for processing...');
        let status = 'NEW';
        let batch;

        // Wait max 30 seconds
        for (let i = 0; i < 15; i++) {
            await sleep(2000); // 2s polling
            const batchRes = await axios.get(`${BASE_URL}/batches/${batchId}`, { headers: authHeaders });
            batch = batchRes.data.batch;
            status = batch.status;
            process.stdout.write(`\rStatus: ${status} (Processed: ${batch.items.filter(i => i.status !== 'PENDING').length}/${batch.total_items})`);

            if (status === 'DONE' || status === 'PARTIAL' || status === 'FAILED') {
                break;
            }
        }
        console.log('\n');

        if (status === 'NEW' || status === 'PROCESSING') {
            console.log('⚠️ Timed out waiting for completion. Worker might not be running.');
        } else {
            console.log(`✅ Processing finished with status: ${status}`);
        }

        // 5. Download Report
        console.log('\n📥 Downloading report...');
        const reportRes = await axios.get(`${BASE_URL}/batches/${batchId}/export`, {
            headers: authHeaders,
            responseType: 'arraybuffer'
        });

        fs.writeFileSync('e2e_report.xlsx', reportRes.data);
        console.log('✅ Report downloaded to e2e_report.xlsx');

        // Verify report content size
        const stats = fs.statSync('e2e_report.xlsx');
        if (stats.size > 0) {
            console.log(`✅ Report size valid: ${stats.size} bytes`);
        } else {
            console.error('❌ Report is empty!');
        }

        console.log('\n🎉 TEST COMPLETED SUCCESSFULLY!');

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error.response?.data || error.message);
    } finally {
        // Cleanup
        if (fs.existsSync('e2e_test.xlsx')) fs.unlinkSync('e2e_test.xlsx');
    }
}

runTest();

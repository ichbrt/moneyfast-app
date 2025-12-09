const xlsx = require('xlsx');
const path = require('path');

// 1. Create Blank Template
const wbBlank = xlsx.utils.book_new();
const wsBlank = xlsx.utils.aoa_to_sheet([
    ['Phone Number', 'Amount', 'Reference', 'Description']
]);
// Add sample row as guidance but kept minimal
xlsx.utils.sheet_add_aoa(wsBlank, [['', '', '', '']], { origin: 1 });

xlsx.utils.book_append_sheet(wbBlank, wsBlank, 'Template');
xlsx.writeFile(wbBlank, 'BulkPayment_Template_Blank.xlsx');
console.log('✅ Created BulkPayment_Template_Blank.xlsx');

// 2. Create Sample Data Template (Test Ready)
const wbSample = xlsx.utils.book_new();
const sampleData = [
    { 'Phone Number': '256772123456', 'Amount': 5000, 'Reference': 'REF001', 'Description': 'Payment 1' },
    { 'Phone Number': '256701234567', 'Amount': 10000, 'Reference': 'REF002', 'Description': 'Payment 2' },
    { 'Phone Number': '0751234567', 'Amount': 7500, 'Reference': 'REF003', 'Description': 'Bonus' },
    { 'Phone Number': '0789123456', 'Amount': 15000, 'Reference': 'REF004', 'Description': 'Salary' },
    { 'Phone Number': '0706123456', 'Amount': 2000, 'Reference': 'REF005', 'Description': 'Refund' }
];

const wsSample = xlsx.utils.json_to_sheet(sampleData);
xlsx.utils.book_append_sheet(wbSample, wsSample, 'Sample Data');
xlsx.writeFile(wbSample, 'BulkPayment_Template_Sample.xlsx');
console.log('✅ Created BulkPayment_Template_Sample.xlsx');

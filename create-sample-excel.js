const xlsx = require('xlsx');

// Create sample data
const data = [
    ['BA', '318/24', ''],
    ['fdts', '17/01/2025', 'P'],
    ['S/Sol', '31/01/2025', 'P'],
    ['Spte', '11/02/2025', 'P'],
    ['RDCH', '24/02/2025', 'P'],
    ['1° etg', '17/03/2025', 'P'],
    ['2° etg', '27/03/2025', 'P'],
    ['3° etg', '18/04/2025', 'P']
];

// Create workbook and worksheet
const wb = xlsx.utils.book_new();
const ws = xlsx.utils.aoa_to_sheet(data);

// Add worksheet to workbook
xlsx.utils.book_append_sheet(wb, ws, 'Planning');

// Write to file
xlsx.writeFile(wb, 'sample-data.xlsx');

console.log('Sample Excel file created: sample-data.xlsx');
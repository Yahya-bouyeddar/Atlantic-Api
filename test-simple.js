/**
 * Simple Backend Test for Excel to PDF API
 * 
 * This script tests the Excel-to-PDF generation directly
 * without needing to start the server or use the web interface.
 */

const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

// Import your services
const excelService = require('./services/excel.service');
const pdfService = require('./services/pdf.service');

console.log('╔════════════════════════════════════════════════╗');
console.log('║  BON DE COULAGE - Backend API Test           ║');
console.log('╚════════════════════════════════════════════════╝\n');

/**
 * STEP 1: Create test Excel file
 */
console.log('📊 Step 1: Creating Excel file...');

const excelData = [
    ['BA', '318/24', ''],
    ['fdts', '17/01/2025', 'P'],
    ['S/Sol', '31/01/2025', 'P'],
    ['Spte', '11/02/2025', 'P'],
    ['RDCH', '24/02/2025', 'P'],
    ['1° etg', '17/03/2025', 'P'],
    ['2° etg', '27/03/2025', 'P'],
    ['3° etg', '18/04/2025', 'P']
];

const workbook = xlsx.utils.book_new();
const worksheet = xlsx.utils.aoa_to_sheet(excelData);
xlsx.utils.book_append_sheet(workbook, worksheet, 'Planning');

const excelPath = path.join(__dirname, 'test-data.xlsx');
xlsx.writeFile(workbook, excelPath);
console.log('✅ Excel created: test-data.xlsx\n');

/**
 * STEP 2: Read and parse Excel
 */
console.log('📖 Step 2: Parsing Excel file...');

const fileBuffer = fs.readFileSync(excelPath);
const parsedRows = excelService.parseExcelFile(fileBuffer);

console.log(`✅ Found ${parsedRows.length} rows:\n`);

// Display parsed data
parsedRows.forEach((row, index) => {
    console.log(`   ${index + 1}. ${row.rowLabel.padEnd(10)} → ${row.etage.padEnd(20)} (${row.date})`);
});
console.log('');

/**
 * STEP 3: Prepare data for PDF generation
 */
console.log('🎨 Step 3: Preparing PDF data...');

// Your project information
const projectInfo = {
    reference_2: 'BA 318/24',
    ville: 'Casa',
    proprietaire: 'SOCIETE ARIF LOGEMENT S.A.R.L. AU.',
    representant: 'MR ARIF MUSTAPHA',
    projet: 'CONSTRUCTION D\'UN IMMEUBLE EN S/SOL + R.D.CH. + SOUPENTE + 3 ETAGES.',
    adresse: 'LOTISSEMENT AL MAMOUNIA LOT N° 3 SIDI HAJJAJ OUED HASSAR. T.F. N° 12231/85.',
    show_notes: true
};

// Create page data (one page per Excel row)
const pagesData = parsedRows.map((row, index) => ({
    etage: row.etage,
    reference: `MM/BC/${String(index + 1).padStart(4, '0')}/24`,
    reference_2: projectInfo.reference_2,
    date: row.date,
    ville: projectInfo.ville,
    proprietaire: projectInfo.proprietaire,
    representant: projectInfo.representant,
    projet: projectInfo.projet,
    adresse: projectInfo.adresse,
    show_notes: projectInfo.show_notes
}));

console.log(`✅ Prepared ${pagesData.length} pages\n`);

/**
 * STEP 4: Generate PDF
 */
async function generatePDF() {
    console.log('📄 Step 4: Generating PDF...');
    console.log('   (This may take a few seconds...)\n');

    try {
        const pdfBuffer = await pdfService.generateMultiPagePDF(pagesData, projectInfo);
        
        // Save PDF
        const pdfPath = path.join(__dirname, 'output.pdf');
        fs.writeFileSync(pdfPath, pdfBuffer);
        
        console.log('✅ PDF generated successfully!\n');
        console.log('═══════════════════════════════════════════════');
        console.log('📁 Output Files:');
        console.log(`   • ${excelPath}`);
        console.log(`   • ${pdfPath}`);
        console.log('═══════════════════════════════════════════════');
        console.log('📊 Statistics:');
        console.log(`   • Excel rows: ${parsedRows.length}`);
        console.log(`   • PDF pages: ${pagesData.length}`);
        console.log(`   • PDF size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);
        console.log('═══════════════════════════════════════════════\n');
        console.log('🎉 SUCCESS! Open output.pdf to see the result.\n');
        
    } catch (error) {
        console.error('❌ Error generating PDF:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run the PDF generation
generatePDF();
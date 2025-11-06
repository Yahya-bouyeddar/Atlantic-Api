const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

// Import services
const excelService = require('./services/excel.service');
const pdfService = require('./services/pdf.service');

/**
 * Test 1: Create Sample Excel File
 */
async function createSampleExcel() {
    console.log('\n📊 TEST 1: Creating Sample Excel File...');
    
    try {
        // Create sample data matching your image
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
        const filePath = path.join(__dirname, 'test-sample.xlsx');
        xlsx.writeFile(wb, filePath);

        console.log('✅ Sample Excel created: test-sample.xlsx');
        return filePath;
    } catch (error) {
        console.error('❌ Error creating sample Excel:', error.message);
        throw error;
    }
}

/**
 * Test 2: Parse Excel File
 */
async function testParseExcel(filePath) {
    console.log('\n📖 TEST 2: Parsing Excel File...');
    
    try {
        // Read the Excel file
        const fileBuffer = fs.readFileSync(filePath);
        
        // Parse the file
        const rows = excelService.parseExcelFile(fileBuffer);
        
        console.log(`✅ Found ${rows.length} rows in Excel file\n`);
        
        // Display parsed data
        console.log('Parsed Data:');
        console.log('─'.repeat(80));
        console.log('│ # │ Label     │ Étage              │ Date       │');
        console.log('─'.repeat(80));
        
        rows.forEach((row, index) => {
            console.log(`│ ${(index + 1).toString().padEnd(1)} │ ${row.rowLabel.padEnd(9)} │ ${row.etage.padEnd(18)} │ ${row.date} │`);
        });
        console.log('─'.repeat(80));
        
        return rows;
    } catch (error) {
        console.error('❌ Error parsing Excel:', error.message);
        throw error;
    }
}

/**
 * Test 3: Validate Excel File
 */
async function testValidateExcel(filePath) {
    console.log('\n✔️  TEST 3: Validating Excel File...');
    
    try {
        const fileBuffer = fs.readFileSync(filePath);
        const validation = excelService.validateExcelFile(fileBuffer);
        
        if (validation.valid) {
            console.log(`✅ Excel file is valid!`);
            console.log(`   • Row count: ${validation.rowCount}`);
        } else {
            console.log(`❌ Excel file is invalid: ${validation.error}`);
        }
        
        return validation;
    } catch (error) {
        console.error('❌ Error validating Excel:', error.message);
        throw error;
    }
}

/**
 * Test 4: Generate Multi-Page PDF
 */
async function testGeneratePDF(rows) {
    console.log('\n🎨 TEST 4: Generating Multi-Page PDF...');
    
    try {
        // Base project information
        const baseOptions = {
            reference_2: 'BA 318/24',
            ville: 'Casa',
            proprietaire: 'SOCIETE ARIF LOGEMENT S.A.R.L. AU.',
            projet: 'CONSTRUCTION D\'UN IMMEUBLE EN S/SOL + R.D.CH. + SOUPENTE + 3 ETAGES.',
            adresse: 'LOTISSEMENT AL MAMOUNIA LOT N° 3 SIDI HAJJAJ OUED HASSAR. T.F. N° 12231/85.',
            show_notes: true
        };
        
        // Create page data for each row
        const pagesData = rows.map((row, index) => ({
            etage: row.etage,
            reference: `MM/BC/${String(index + 1).padStart(4, '0')}/24`,
            reference_2: baseOptions.reference_2,
            date: row.date,
            ville: baseOptions.ville,
            proprietaire: baseOptions.proprietaire,
            projet: baseOptions.projet,
            adresse: baseOptions.adresse,
            show_notes: baseOptions.show_notes
        }));
        
        console.log(`   • Creating ${pagesData.length} pages...`);
        
        // Display page preview
        console.log('\n   Page Preview:');
        pagesData.forEach((page, index) => {
            console.log(`   ${index + 1}. ${page.etage} - ${page.date} (Ref: ${page.reference})`);
        });
        
        // Generate PDF
        console.log('\n   • Launching Puppeteer...');
        const pdfBuffer = await pdfService.generateMultiPagePDF(pagesData, baseOptions);
        
        // Save PDF
        const outputPath = path.join(__dirname, 'test-output.pdf');
        fs.writeFileSync(outputPath, pdfBuffer);
        
        console.log(`\n✅ PDF generated successfully!`);
        console.log(`   • File: test-output.pdf`);
        console.log(`   • Size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);
        console.log(`   • Pages: ${pagesData.length}`);
        
        return outputPath;
    } catch (error) {
        console.error('❌ Error generating PDF:', error.message);
        throw error;
    }
}

/**
 * Test 5: Test Single Page Generation (for comparison)
 */
async function testSinglePage() {
    console.log('\n📄 TEST 5: Testing Single Page Generation...');
    
    try {
        const options = {
            etage: 'PL.HT. S/SOL',
            reference: 'MM/BC/1107/24',
            reference_2: 'BA 318/24',
            date: '31/01/2025',
            ville: 'Casa',
            proprietaire: 'SOCIETE ARIF LOGEMENT S.A.R.L. AU.',
            projet: 'CONSTRUCTION D\'UN IMMEUBLE EN S/SOL + R.D.CH. + SOUPENTE + 3 ETAGES.',
            adresse: 'LOTISSEMENT AL MAMOUNIA LOT N° 3 SIDI HAJJAJ OUED HASSAR. T.F. N° 12231/85.',
            show_notes: true
        };
        
        console.log('   • Generating single page PDF...');
        const pdfBuffer = await pdfService.generatePDF(options);
        
        const outputPath = path.join(__dirname, 'test-single-page.pdf');
        fs.writeFileSync(outputPath, pdfBuffer);
        
        console.log(`✅ Single page PDF generated!`);
        console.log(`   • File: test-single-page.pdf`);
        console.log(`   • Size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);
        
        return outputPath;
    } catch (error) {
        console.error('❌ Error generating single page PDF:', error.message);
        throw error;
    }
}

/**
 * Test 6: Test with Different Excel Formats
 */
async function testDifferentFormats() {
    console.log('\n🔄 TEST 6: Testing Different Date Formats...');
    
    try {
        // Create Excel with different date formats
        const data = [
            ['Type', 'Date', 'Status'],
            ['fdts', '01/01/2025', 'P'],           // DD/MM/YYYY
            ['S/Sol', 44936, 'P'],                 // Excel date number
            ['Spte', '15/02/2025', 'P'],           // DD/MM/YYYY
        ];

        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.aoa_to_sheet(data);
        xlsx.utils.book_append_sheet(wb, ws, 'Test');

        const filePath = path.join(__dirname, 'test-formats.xlsx');
        xlsx.writeFile(wb, filePath);

        // Parse it
        const fileBuffer = fs.readFileSync(filePath);
        const rows = excelService.parseExcelFile(fileBuffer);

        console.log('✅ Different formats parsed successfully:');
        rows.forEach((row, index) => {
            console.log(`   ${index + 1}. ${row.rowLabel} → ${row.date}`);
        });

        return rows;
    } catch (error) {
        console.error('❌ Error testing formats:', error.message);
        throw error;
    }
}

/**
 * Test 7: Test Row Label Mapping
 */
async function testRowMapping() {
    console.log('\n🗺️  TEST 7: Testing Row Label Mapping...');
    
    const testLabels = [
        'fdts',
        'fondation',
        's/sol',
        'ssol',
        'spte',
        'soupente',
        'rdch',
        'r.d.ch',
        '1° etg',
        '2° etg',
        '3° etg'
    ];

    console.log('Label Mapping:');
    console.log('─'.repeat(50));
    
    testLabels.forEach(label => {
        const etage = excelService.mapRowToEtage(label);
        console.log(`   ${label.padEnd(15)} → ${etage}`);
    });
    
    console.log('─'.repeat(50));
    console.log('✅ All mappings tested\n');
}

/**
 * Test 8: Performance Test
 */
async function testPerformance() {
    console.log('\n⚡ TEST 8: Performance Test...');
    
    try {
        // Create a large Excel file
        const data = [['Type', 'Date', 'Status']];
        
        for (let i = 1; i <= 20; i++) {
            data.push([
                `Stage ${i}`,
                `${String(i).padStart(2, '0')}/01/2025`,
                'P'
            ]);
        }

        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.aoa_to_sheet(data);
        xlsx.utils.book_append_sheet(wb, ws, 'Performance');

        const filePath = path.join(__dirname, 'test-performance.xlsx');
        xlsx.writeFile(wb, filePath);

        // Test parsing speed
        const parseStart = Date.now();
        const fileBuffer = fs.readFileSync(filePath);
        const rows = excelService.parseExcelFile(fileBuffer);
        const parseTime = Date.now() - parseStart;

        console.log(`✅ Parsed ${rows.length} rows in ${parseTime}ms`);

        // Note: PDF generation with 20 pages will take longer
        console.log('   (Skipping PDF generation for performance test)');
        console.log('   Tip: For production, consider adding a queue system for large files');

        return { rows: rows.length, parseTime };
    } catch (error) {
        console.error('❌ Error in performance test:', error.message);
        throw error;
    }
}

/**
 * Main Test Runner
 */
async function runAllTests() {
    console.log('╔═══════════════════════════════════════════════════════════════╗');
    console.log('║     BON DE COULAGE - Excel to PDF Test Suite                ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝');
    
    const startTime = Date.now();
    
    try {
        // Run all tests
        const excelPath = await createSampleExcel();
        await testValidateExcel(excelPath);
        const rows = await testParseExcel(excelPath);
        await testRowMapping();
        await testDifferentFormats();
        await testGeneratePDF(rows);
        await testSinglePage();
        await testPerformance();
        
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
        
        console.log('\n╔═══════════════════════════════════════════════════════════════╗');
        console.log('║                    ALL TESTS PASSED! ✅                       ║');
        console.log('╚═══════════════════════════════════════════════════════════════╝');
        console.log(`\nTotal execution time: ${totalTime}s`);
        console.log('\n📁 Generated Files:');
        console.log('   • test-sample.xlsx       - Sample Excel file');
        console.log('   • test-output.pdf        - Multi-page PDF (7 pages)');
        console.log('   • test-single-page.pdf   - Single page PDF');
        console.log('   • test-formats.xlsx      - Format test Excel');
        console.log('   • test-performance.xlsx  - Performance test Excel');
        
        console.log('\n🎉 All tests completed successfully!');
        console.log('You can now open the PDF files to verify the output.\n');
        
    } catch (error) {
        console.error('\n❌ TEST SUITE FAILED');
        console.error(error);
        process.exit(1);
    }
}

/**
 * Individual test functions (can be run separately)
 */
async function quickTest() {
    console.log('🚀 Running Quick Test...\n');
    
    try {
        const excelPath = await createSampleExcel();
        const rows = await testParseExcel(excelPath);
        await testGeneratePDF(rows);
        
        console.log('\n✅ Quick test completed!');
        console.log('Check test-output.pdf to see the result.\n');
    } catch (error) {
        console.error('❌ Quick test failed:', error);
        process.exit(1);
    }
}

// Check command line arguments
const args = process.argv.slice(2);

if (args.includes('--quick')) {
    // Run quick test only
    quickTest();
} else if (args.includes('--help')) {
    console.log(`
BON DE COULAGE - Backend Test Script

Usage:
  node test-backend.js              Run all tests
  node test-backend.js --quick      Run quick test only
  node test-backend.js --help       Show this help message

Tests:
  1. Create Sample Excel
  2. Parse Excel File  
  3. Validate Excel File
  4. Generate Multi-Page PDF
  5. Test Single Page
  6. Test Different Formats
  7. Test Row Mapping
  8. Performance Test

Generated files will be saved in the current directory.
`);
} else {
    // Run all tests
    runAllTests();
}

// Export for programmatic use
module.exports = {
    createSampleExcel,
    testParseExcel,
    testValidateExcel,
    testGeneratePDF,
    testSinglePage,
    testDifferentFormats,
    testRowMapping,
    testPerformance,
    runAllTests,
    quickTest
};
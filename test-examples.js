/**
 * Test examples for BON DE COULAGE API
 * Run with: node test-examples.js
 */

const fs = require('fs');
const path = require('path');

// Base URL
const BASE_URL = 'http://localhost:3000';

/**
 * Test 1: Generate PDF for FONDATIONS
 */
async function testFondations() {
    console.log('\n🧪 Test 1: Generating FONDATIONS PDF...');
    
    const response = await fetch(`${BASE_URL}/api/bon/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            etage: 'FONDATIONS',
            reference: 'MM/BC/1106/24',
            reference_2: 'B/344/24',
            date: '21/11/2024',
            proprietaire: 'SOCIETE ARIF LOGEMENT S.A.R.L. AU.',
            representant: 'MR ARIF MUSTAPHA',
            projet: 'CONSTRUCTION D\'UN IMMEUBLE EN S/SOL + R.D.CH. + SOUPENTE + 3 ETAGES.',
            adresse: 'LOTISSEMENT AL MAMOUNIA LOT N° 3 SIDI HAJJAJ OUED HASSAR. T.F. N° 12231/85.',
            show_notes: false
        })
    });
    
    if (response.ok) {
        const buffer = Buffer.from(await response.arrayBuffer());
        fs.writeFileSync('test_fondations.pdf', buffer);
        console.log('✅ FONDATIONS PDF generated: test_fondations.pdf');
    } else {
        console.error('❌ Error:', await response.text());
    }
}

/**
 * Test 2: Generate PDF for S/SOL with notes
 */
async function testSSol() {
    console.log('\n🧪 Test 2: Generating S/SOL PDF with notes...');
    
    const response = await fetch(`${BASE_URL}/api/bon/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            etage: 'PL.HT. S/SOL',
            reference: 'MM/BC/1107/24',
            reference_2: 'B/344/24',
            date: '29/11/2024',
            proprietaire: 'SOCIETE ARIF LOGEMENT S.A.R.L. AU.',
            representant: 'MR ARIF MUSTAPHA',
            projet: 'CONSTRUCTION D\'UN IMMEUBLE EN S/SOL + R.D.CH. + SOUPENTE + 3 ETAGES.',
            adresse: 'LOTISSEMENT AL MAMOUNIA LOT N° 3 SIDI HAJJAJ OUED HASSAR. T.F. N° 12231/85.',
            show_notes: true
        })
    });
    
    if (response.ok) {
        const buffer = Buffer.from(await response.arrayBuffer());
        fs.writeFileSync('test_ssol.pdf', buffer);
        console.log('✅ S/SOL PDF generated: test_ssol.pdf');
    } else {
        console.error('❌ Error:', await response.text());
    }
}

/**
 * Test 3: Get template
 */
async function testTemplate() {
    console.log('\n🧪 Test 3: Getting SSOL template...');
    
    const response = await fetch(`${BASE_URL}/api/bon/template/SSOL`);
    
    if (response.ok) {
        const data = await response.json();
        console.log('✅ Template received:');
        console.log(JSON.stringify(data, null, 2));
    } else {
        console.error('❌ Error:', await response.text());
    }
}

/**
 * Test 4: Generate HTML preview
 */
async function testPreview() {
    console.log('\n🧪 Test 4: Generating HTML preview...');
    
    const response = await fetch(`${BASE_URL}/api/bon/preview`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            etage: 'PL.HT. 1° ETAGE',
            reference: 'MM/BC/1110/24',
            reference_2: 'B/344/24',
            date: '26/12/2024',
            proprietaire: 'SOCIETE ARIF LOGEMENT S.A.R.L. AU.',
            representant: 'MR ARIF MUSTAPHA',
            projet: 'CONSTRUCTION D\'UN IMMEUBLE EN S/SOL + R.D.CH. + SOUPENTE + 3 ETAGES.',
            adresse: 'LOTISSEMENT AL MAMOUNIA LOT N° 3 SIDI HAJJAJ OUED HASSAR. T.F. N° 12231/85.',
            show_notes: true
        })
    });
    
    if (response.ok) {
        const html = await response.text();
        fs.writeFileSync('test_preview.html', html);
        console.log('✅ HTML preview generated: test_preview.html');
    } else {
        console.error('❌ Error:', await response.text());
    }
}

/**
 * Test 5: API Documentation
 */
async function testDocs() {
    console.log('\n🧪 Test 5: Getting API documentation...');
    
    const response = await fetch(`${BASE_URL}/api/bon/docs`);
    
    if (response.ok) {
        const docs = await response.json();
        console.log('✅ Documentation received');
        console.log(`   Endpoints: ${docs.endpoints.length}`);
        console.log(`   Types d'étage: ${docs.types_etage.length}`);
    } else {
        console.error('❌ Error:', await response.text());
    }
}

/**
 * Test 6: Health check
 */
async function testHealth() {
    console.log('\n🧪 Test 6: Health check...');
    
    const response = await fetch(`${BASE_URL}/health`);
    
    if (response.ok) {
        const health = await response.json();
        console.log('✅ Server is healthy');
        console.log(`   Status: ${health.status}`);
        console.log(`   Uptime: ${Math.floor(health.uptime)}s`);
    } else {
        console.error('❌ Error:', await response.text());
    }
}

/**
 * Test 7: Validation error
 */
async function testValidation() {
    console.log('\n🧪 Test 7: Testing validation (should fail)...');
    
    const response = await fetch(`${BASE_URL}/api/bon/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            etage: 'PL.HT. S/SOL'
            // Missing required fields
        })
    });
    
    if (!response.ok) {
        const error = await response.json();
        console.log('✅ Validation works correctly');
        console.log(`   Error: ${error.error}`);
        console.log(`   Details: ${error.details.length} validation errors`);
    } else {
        console.error('❌ Validation should have failed');
    }
}

/**
 * Run all tests
 */
async function runAllTests() {
    console.log('🚀 Starting BON DE COULAGE API Tests...');
    console.log(`📡 Target: ${BASE_URL}`);
    
    try {
        await testHealth();
        await testDocs();
        await testTemplate();
        await testFondations();
        await testSSol();
        await testPreview();
        await testValidation();
        
        console.log('\n✅ All tests completed!');
        console.log('\n📁 Generated files:');
        console.log('   - test_fondations.pdf');
        console.log('   - test_ssol.pdf');
        console.log('   - test_preview.html');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error('\n💡 Make sure the server is running: npm run dev');
    }
}

// Run tests
runAllTests();
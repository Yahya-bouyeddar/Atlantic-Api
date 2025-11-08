const puppeteer = require('puppeteer');
const puppeteerCore = require('puppeteer-core');
const templateService = require('./template.service');

/**
 * Get browser configuration based on environment
 */
async function getBrowserInstance() {
    const isProduction = process.env.NODE_ENV === 'production';
    
    console.log('🔍 Environment check:', {
        NODE_ENV: process.env.NODE_ENV,
        isProduction: isProduction
    });
    
    if (isProduction) {
        // Configuration pour Render (production)
        console.log('🚀 Attempting to use Chromium for Render environment');
        
        try {
            const chromium = require('@sparticuz/chromium');
            
            const browser = await puppeteerCore.launch({
                args: [
                    ...chromium.args,
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu'
                ],
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath(),
                headless: chromium.headless,
            });
            
            console.log('✅ Successfully launched Chromium from @sparticuz/chromium');
            return browser;
            
        } catch (chromiumError) {
            // Fallback sur Chromium système installé via aptfile
            console.error('⚠️ Error with @sparticuz/chromium:', chromiumError.message);
            console.log('🔄 Trying fallback to system Chromium...');
            
            try {
                const browser = await puppeteerCore.launch({
                    executablePath: '/usr/bin/chromium-browser',
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-gpu',
                        '--disable-extensions'
                    ],
                    headless: 'new'
                });
                
                console.log('✅ Successfully launched system Chromium');
                return browser;
                
            } catch (fallbackError) {
                console.error('❌ Fallback also failed:', fallbackError.message);
                throw new Error(`Failed to launch browser: ${chromiumError.message} | Fallback: ${fallbackError.message}`);
            }
        }
    } else {
        // Configuration pour développement local
        console.log('💻 Using regular Puppeteer for local environment');
        
        const browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ]
        });
        
        console.log('✅ Successfully launched local Puppeteer');
        return browser;
    }
}

/**
 * Generate PDF from HTML using Puppeteer
 * @param {Object} options - PDF generation options
 * @returns {Promise<Buffer>} PDF buffer
 */
exports.generatePDF = async (options) => {
    let browser = null;
    try {
        console.log('📄 Starting PDF generation...');
        
        // Generate HTML
        const html = templateService.generateHTMLATT(options);
        
        // Launch browser with environment-specific config
        browser = await getBrowserInstance();
        
        const page = await browser.newPage();
        
        // Set content
        await page.setContent(html, {
            waitUntil: 'networkidle0'
        });
        
        // Generate PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '15mm',
                right: '20mm',
                bottom: '15mm',
                left: '20mm'
            },
            displayHeaderFooter: true,
            headerTemplate: '<div></div>',
            footerTemplate: `
                <div style="font-size: 6.5pt; color: #444; text-align: center; width: 100%; padding-top: 2mm; border-top: 0.5pt solid #999; margin: 0 20mm;">
                    ${options.footer_text || process.env.FOOTER_TEXT}
                </div>
            `
        });
        
        console.log('✅ PDF generated successfully');
        return pdfBuffer;
        
    } catch (error) {
        console.error('❌ PDF Generation Error:', error);
        throw new Error('Erreur lors de la génération du PDF: ' + error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};

/**
 * Generate multi-page PDF from array of data
 * @param {Array} dataArray - Array of page data
 * @param {Object} baseOptions - Base options for all pages
 * @returns {Promise<Buffer>} PDF buffer with multiple pages
 */
exports.generateMultiPagePDF = async (dataArray, baseOptions = {}) => {
    let browser = null;
    
    try {
        console.log(`📄 Starting multi-page PDF generation (${dataArray.length} pages)...`);
        
        // Launch browser with environment-specific config
        browser = await getBrowserInstance();
        
        const page = await browser.newPage();
        
        // Generate HTML for all pages
        let fullHTML = '';
        
        for (let i = 0; i < dataArray.length; i++) {
            const pageData = dataArray[i];
            
            // Merge base options with page-specific data
            const pageOptions = {
                ...baseOptions,
                ...pageData
            };
            
            // Generate HTML for this page
            const pageHTML = templateService.generateHTMLBCLG(pageOptions);
            
            // Add page break after each page except the last
            if (i < dataArray.length - 1) {
                fullHTML += pageHTML.replace('</body>', '<div style="page-break-after: always;"></div></body>');
            } else {
                fullHTML += pageHTML;
            }
        }
        
        // Set content
        await page.setContent(fullHTML, {
            waitUntil: 'networkidle0'
        });
        
        // Generate PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '15mm',
                right: '20mm',
                bottom: '15mm',
                left: '20mm'
            },
            displayHeaderFooter: true,
            headerTemplate: '<div></div>',
            footerTemplate: `
                <div style="font-size: 6.5pt; color: #444; text-align: center; width: 100%; padding-top: 2mm; border-top: 0.5pt solid #999; margin: 0 20mm;">
                    ${baseOptions.footer_text || process.env.FOOTER_TEXT}
                </div>
            `
        });
        
        console.log('✅ Multi-page PDF generated successfully');
        return pdfBuffer;
        
    } catch (error) {
        console.error('❌ Multi-page PDF Generation Error:', error);
        throw new Error('Erreur lors de la génération du PDF multi-pages: ' + error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};

/**
 * Generate PDF with custom page settings
 * @param {Object} options - PDF options
 * @param {Object} pageSettings - Custom page settings
 * @returns {Promise<Buffer>} PDF buffer
 */
exports.generateCustomPDF = async (options, pageSettings = {}) => {
    let browser = null;
    
    try {
        console.log('📄 Starting custom PDF generation...');
        
        const html = templateService.generateHTMLBCLG(options);
        
        // Launch browser with environment-specific config
        browser = await getBrowserInstance();
        
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        
        const defaultSettings = {
            format: 'A4',
            printBackground: true,
            margin: {
                top: '15mm',
                right: '20mm',
                bottom: '15mm',
                left: '20mm'
            }
        };
        
        const pdfBuffer = await page.pdf({
            ...defaultSettings,
            ...pageSettings
        });
        
        console.log('✅ Custom PDF generated successfully');
        return pdfBuffer;
        
    } catch (error) {
        console.error('❌ Custom PDF Generation Error:', error);
        throw new Error('Erreur lors de la génération du PDF personnalisé: ' + error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};
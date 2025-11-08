const puppeteer = require('puppeteer');
const puppeteerCore = require('puppeteer-core');
const templateService = require('./template.service');

/**
 * Get browser configuration based on environment
 */
async function getBrowserInstance() {
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction) {
        // Configuration pour Render (production)
        const chromium = require('@sparticuz/chromium');
        
        return await puppeteerCore.launch({
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
    } else {
        // Configuration pour développement local
        return await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ]
        });
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
            headerTemplate: '<div></div>', // Empty header
            footerTemplate: `
                <div style="font-size: 6.5pt; color: #444; text-align: center; width: 100%; padding-top: 2mm; border-top: 0.5pt solid #999; margin: 0 20mm;">
                    ${options.footer_text || process.env.FOOTER_TEXT}
                </div>
            `
        });
        
        return pdfBuffer;
        
    } catch (error) {
        console.error('PDF Generation Error:', error);
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
        
        return pdfBuffer;
        
    } catch (error) {
        console.error('Multi-page PDF Generation Error:', error);
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
        
        return pdfBuffer;
        
    } catch (error) {
        throw new Error('Erreur lors de la génération du PDF personnalisé: ' + error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};
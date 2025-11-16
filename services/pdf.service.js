const puppeteer = require("puppeteer");
const puppeteerCore = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");
const templateService = require("./template.service");

/**
 * Get browser configuration based on environment
 */
async function getBrowserInstance() {
  const isProduction = process.env.NODE_ENV === "production";
  const isRender = process.env.RENDER === "true"; // Render sets this env variable
  const isLinux = process.platform === "linux";
  
  // Use chromium for production Linux environments (like Render)
  if (isProduction && (isRender || isLinux)) {
    console.log("🚀 Using @sparticuz/chromium for production environment");
    
    const browser = await puppeteerCore.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,

    });
    
    console.log("✅ Successfully launched Chromium for production");
    return browser;
  } else {
    console.log("💻 Using regular Puppeteer for local environment");

    const browser = await puppeteer.launch({
      headless: "new",
    // headless: false,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        '--font-render-hinting=none', // Désactive le hinting des polices
        '--disable-font-subpixel-positioning', // Améliore le rendu
      ],
    });

    console.log("✅ Successfully launched local Puppeteer");
    return browser;
  }
}

/**
 * Generate PDF from HTML using Puppeteer
 * @param {Object} options - PDF generation options
 * @returns {Promise<Buffer>} PDF buffer
 */
const generatePDF = async (options) => {
  let browser = null;
  try {
    console.log("📄 Starting PDF generation...");

    // Generate HTML
    const html = templateService.generateHTMLATT(options);

    // Launch browser with environment-specific config
    browser = await getBrowserInstance();

    const page = await browser.newPage();

    // Set content
    await page.setContent(html, {
      waitUntil: "networkidle0",
    });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "15mm",
        right: "20mm",
        bottom: "15mm",
        left: "20mm",
      },
      waitForFonts: true,
      displayHeaderFooter: false,
    //   headerTemplate: "<div></div>",
    //   footerTemplate: `
    //             <div style="font-size: 6.5pt; color: #444; text-align: center; width: 100%; padding-top: 2mm; border-top: 0.5pt solid #999; margin: 0 20mm;">
    //                 ${options.footer_text || process.env.FOOTER_TEXT}
    //             </div>
    //         `,
    });

    // Ensure we return a proper Buffer
    if (!Buffer.isBuffer(pdfBuffer)) {
      console.warn('⚠️ Converting to Buffer...');
      const finalBuffer = Buffer.from(pdfBuffer);
      console.log("✅ PDF generated successfully");
      return finalBuffer;
    }

    console.log("✅ PDF generated successfully");
    return pdfBuffer;
  } catch (error) {
    console.error("❌ PDF Generation Error:", error);
    throw new Error("Erreur lors de la génération du PDF: " + error.message);
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
const generateMultiPagePDF = async (dataArray, baseOptions = {}) => {
  let browser = null;

  try {
    console.log(
      `📄 Starting multi-page PDF generation (${dataArray.length} pages)...`
    );
   console.log("avant browser");
   
    // Launch browser with environment-specific config
    browser = await getBrowserInstance();
  console.log("apres browser");
  console.log("avant page");
  
    const page = await browser.newPage();
    console.log("apres page");
    
  
    // Generate HTML for first page to get structure
    const firstPageOptions = {
      ...baseOptions,
      ...dataArray[0],
    };
    const firstPageHTML = templateService.generateHTMLBCLG(firstPageOptions);
   
    // Extract head and body separately
    const headMatch = firstPageHTML.match(/<head>([\s\S]*?)<\/head>/i);
    const head = headMatch ? headMatch[1] : '';

    // Generate body content for all pages
    let combinedBody = '';

    for (let i = 0; i < dataArray.length; i++) {
      const pageData = dataArray[i];

      // Merge base options with page-specific data
      const pageOptions = {
        ...baseOptions,
        ...pageData,
      };
      
      // Generate HTML for this page
      const pageHTML = templateService.generateHTMLBCLG(pageOptions);
      console.log("pageHtmlBCLG");
      
      // Extract body content
      const bodyMatch = pageHTML.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      const bodyContent = bodyMatch ? bodyMatch[1] : '';

      // Add body content with page break
      if (i < dataArray.length - 1) {
        combinedBody += bodyContent + '<div style="page-break-after: always;"></div>';
      } else {
        combinedBody += bodyContent;
      }
    }
      console.log("avant full html");
      
    // Combine everything into a single valid HTML document
    const fullHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          ${head}
        </head>
        <body>
          ${combinedBody}
        </body>
      </html>
    `;
   console.log("avant await");
   
    // Set content
    await page.setContent(fullHTML, {
      waitUntil: "networkidle0",
      timeout: 3000,
    });
     console.log("apres setimeout");
     
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "15mm",
        right: "20mm",
        bottom: "15mm",
        left: "20mm",
      },
      waitForFonts: true,
      displayHeaderFooter: false,
    //   headerTemplate: "<div></div>",
    //   footerTemplate: `
    //             <div style="font-size: 6.5pt; color: #444; text-align: center; width: 100%; padding-top: 2mm; border-top: 0.5pt solid #999; margin: 0 20mm;">
    //                 ${baseOptions.footer_text || process.env.FOOTER_TEXT || ''}
    //             </div>
    //         `,
    });

    // Debug logging
    console.log('PDF Buffer Type:', typeof pdfBuffer);
    console.log('PDF Buffer Length:', pdfBuffer?.length);
    console.log('Is Buffer?', Buffer.isBuffer(pdfBuffer));
    console.log('Constructor:', pdfBuffer?.constructor?.name);

    // Ensure we return a proper Buffer
    if (!Buffer.isBuffer(pdfBuffer)) {
      console.warn('⚠️ Converting to Buffer...');
      const finalBuffer = Buffer.from(pdfBuffer);
      console.log("✅ Multi-page PDF generated successfully");
      return finalBuffer;
    }

    console.log("✅ Multi-page PDF generated successfully");
    return pdfBuffer;
  } catch (error) {
    console.error("❌ Multi-page PDF Generation Error:", error);
    throw new Error(
      "Erreur lors de la génération du PDF multi-pages: " + error.message
    );
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
const generateCustomPDF = async (options, pageSettings = {}) => {
  let browser = null;

  try {
    console.log("📄 Starting custom PDF generation...");

    const html = templateService.generateHTMLBCLG(options);

    // Launch browser with environment-specific config
    browser = await getBrowserInstance();

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const defaultSettings = {
      format: "A4",
      printBackground: true,
      margin: {
        top: "15mm",
        right: "20mm",
        bottom: "15mm",
        left: "20mm",
      },
    };

    const pdfBuffer = await page.pdf({
      ...defaultSettings,
      ...pageSettings,
    });

    console.log("✅ Custom PDF generated successfully");
    return pdfBuffer;
  } catch (error) {
    console.error("❌ Custom PDF Generation Error:", error);
    throw new Error(
      "Erreur lors de la génération du PDF personnalisé: " + error.message
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

// Export all functions
module.exports = {
  generatePDF,
  generateMultiPagePDF,
  generateCustomPDF,
};
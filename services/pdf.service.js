const puppeteer = require("puppeteer");
const puppeteerCore = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");
const templateService = require("./template.service");

/**
 * Get browser configuration based on environment
 */
async function getBrowserInstance() {
  const isProduction = process.env.NODE_ENV === "production";
  
  if (isProduction) {
    console.log("🚀 Using Chromium for production environment");
    
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
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    console.log("✅ Successfully launched local Puppeteer");
    return browser;
  }
}

// Rest of your code remains the same...
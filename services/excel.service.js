const xlsx = require("xlsx");

/**
 * Parse Excel file and extract data rows
 * @param {Buffer} fileBuffer - Excel file buffer
 * @returns {Array} Array of data rows
 */
exports.newParseExcelFile = (fileBuffer) => {
  try {
    const HEADER_INDEX = 0;
    const HEADER_ELEMENTS = ["Etage", "Reference", "Date"];
    // Read the workbook from buffer
    const workbook = xlsx.read(fileBuffer, { type: "buffer" });

    // Get the first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    const firstRow = jsonData[HEADER_INDEX];
    if (
      !firstRow ||
      firstRow.length == 0 ||
      !HEADER_ELEMENTS.every((hd) => firstRow.includes(hd)) // TODO improve to handle column order
    ) {
      throw new Error("Header row not found in Excel file");
    }

    // Extract data rows after header
    const dataRows = [];
    for (let i = HEADER_INDEX + 1; i < jsonData.length; i++) {
      const row = jsonData[i];

      // Skip empty rows or header containing '318/24'
      if (!row || row.length < 3) {
        continue;
      }

      // Extract row data
      const rowLabel = String(row[0] || "").trim();
      const reference = row[1];
      const dateValue = row[2];

      // Skip if no label or date
      if (!rowLabel || !reference || !dateValue) {
        continue;
      }

      // Parse the date
      let parsedDate;
      if (typeof dateValue === "number") {
        // Excel date number
        parsedDate = this.excelDateToJSDate(dateValue);
      } else {
        // String date
        parsedDate = this.parseDate(String(dateValue));
      }

      if (!parsedDate) {
        continue;
      }

      // Map row label to etage type
      const etage = this.mapRowToEtage(rowLabel);

      dataRows.push({
        rowLabel,
        reference,
        etage,
        date: this.formatDate(parsedDate),
        rawDate: dateValue,
      });
    }

    return dataRows;
  } catch (error) {
    console.error("Excel parsing error:", error);
    throw new Error("Error parsing Excel file: " + error.message);
  }
};

/**
 * Parse Excel file and extract data rows
 * @param {Buffer} fileBuffer - Excel file buffer
 * @returns {Array} Array of data rows
 */
exports.parseExcelFile = (fileBuffer) => {
  try {
    // Read the workbook from buffer
    const workbook = xlsx.read(fileBuffer, { type: "buffer" });

    // Get the first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    // Find the header row (looking for 'BA', 'fdts', etc.)
    let headerRowIndex = -1;
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (
        row &&
        row.length > 0 &&
        (String(row[0]).includes("BA") ||
          String(row[0]).toLowerCase().includes("fdts") ||
          String(row[0]).toLowerCase().includes("s/sol"))
      ) {
        headerRowIndex = i;
        break;
      }
    }

    if (headerRowIndex === -1) {
      throw new Error("Header row not found in Excel file");
    }

    // Extract data rows after header
    const dataRows = [];
    for (let i = headerRowIndex; i < jsonData.length; i++) {
      const row = jsonData[i];

      // Skip empty rows or header containing '318/24'
      if (!row || row.length < 2 || String(row[0]).includes("318/24")) {
        continue;
      }

      // Extract row data
      const rowLabel = String(row[0] || "").trim();
      const dateValue = row[1];

      // Skip if no label or date
      if (!rowLabel || !dateValue) {
        continue;
      }

      // Parse the date
      let parsedDate;
      if (typeof dateValue === "number") {
        // Excel date number
        parsedDate = this.excelDateToJSDate(dateValue);
      } else {
        // String date
        parsedDate = this.parseDate(String(dateValue));
      }

      if (!parsedDate) {
        continue;
      }

      // Map row label to etage type
      const etage = this.mapRowToEtage(rowLabel);

      dataRows.push({
        rowLabel,
        etage,
        date: this.formatDate(parsedDate),
        rawDate: dateValue,
      });
    }

    return dataRows;
  } catch (error) {
    console.error("Excel parsing error:", error);
    throw new Error("Error parsing Excel file: " + error.message);
  }
};

/**
 * Map row label to etage type
 * @param {string} label - Row label from Excel
 * @returns {string} Etage type
 */
exports.mapRowToEtage = (label) => {
  const labelLower = label.toLowerCase();

  if (labelLower.includes("fdts") || labelLower.includes("fondation")) {
    return "FONDATIONS";
  }
  if (labelLower.includes("Dalle") || labelLower.includes("dalle")) {
    return "DALLAGE";
  } else if (labelLower.includes("s/sol") || labelLower.includes("ssol")) {
    return "PL.HT. S/SOL";
  } else if (labelLower.includes("spte") || labelLower.includes("soupente")) {
    return "SOUPENTE";
  } else if (labelLower.includes("rdch") || labelLower.includes("r.d.ch")) {
    return "PL.HT. R.D.CH";
  } else if (labelLower.includes("1") && labelLower.includes("etg")) {
    return "PL.HT. 1° ETAGE";
  } else if (labelLower.includes("2") && labelLower.includes("etg")) {
    return "PL.HT. 2° ETAGE";
  } else if (labelLower.includes("3") && labelLower.includes("etg")) {
    return "PL.HT. 3° ETAGE";
  } else if (labelLower.includes("4") && labelLower.includes("etg")) {
    return "PL.HT. 4° ETAGE";
  } else if (labelLower.includes("5") && labelLower.includes("etg")) {
    return "PL.HT. 5° ETAGE";
  } else if (labelLower.includes("6") && labelLower.includes("etg")) {
    return "PL.HT. 6° ETAGE";
  }

  // Default fallback
  return label.toUpperCase();
};

/**
 * Convert Excel date number to JavaScript Date
 * @param {number} excelDate - Excel date number
 * @returns {Date} JavaScript Date object
 */
exports.excelDateToJSDate = (excelDate) => {
  // Excel dates start from 1899-12-30
  const excelEpoch = new Date(1899, 11, 30);
  const jsDate = new Date(excelEpoch.getTime() + excelDate * 86400000);
  return jsDate;
};

/**
 * Parse date string in various formats
 * @param {string} dateStr - Date string
 * @returns {Date|null} JavaScript Date object or null
 */
exports.parseDate = (dateStr) => {
  try {
    // Try DD/MM/YYYY format
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // JS months are 0-indexed
      const year = parseInt(parts[2], 10);

      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        return new Date(year, month, day);
      }
    }

    // Try as ISO date
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date;
    }

    return null;
  } catch {
    return null;
  }
};

/**
 * Format date to DD/MM/YYYY
 * @param {Date} date - JavaScript Date object
 * @returns {string} Formatted date string
 */
exports.formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Validate Excel structure
 * @param {Buffer} fileBuffer - Excel file buffer
 * @returns {Object} Validation result
 */
exports.validateExcelFile = (fileBuffer) => {
  try {
    const workbook = xlsx.read(fileBuffer, { type: "buffer" });

    if (workbook.SheetNames.length === 0) {
      return {
        valid: false,
        error: "Excel file has no sheets",
      };
    }

    const rows = this.newParseExcelFile(fileBuffer);

    if (rows.length === 0) {
      return {
        valid: false,
        error: "No valid data rows found in Excel file",
      };
    }

    return {
      valid: true,
      rowCount: rows.length,
      rows,
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message,
    };
  }
};

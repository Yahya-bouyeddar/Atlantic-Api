const pdfService = require('../services/pdf.service');
const templateService = require('../services/template.service');
const excelService = require('../services/excel.service');
const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');
/**
 * Generate PDF
 */


/**
 * Download Excel template
 */



// --- NOUVELLE FONCTION : Télécharger le modèle Excel existant ---
exports.downloadTemplate = async (req, res, next) => {
  try {
    // si tu renomme le fichier, change ici le nom
    const filename = 'bon_template.xlsx'; // ou 'bon_template.xlsx'
    const filePath = path.join(__dirname, '..', 'public', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Template Excel introuvable' });
    }

    const buffer = await fsp.readFile(filePath);

    // forcer le téléchargement avec un nom propre
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Length': buffer.length,
      'X-Filename': filename,
      'Content-Disposition': `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      'Cache-Control': 'no-store',
      'Access-Control-Expose-Headers': 'X-Filename, Content-Disposition'
    });

    // return res.download(filePath, filename, (err) => {
    //   if (err) next(err);
    // });
    return res.status(200).send(buffer);
  } catch (err) {
    next(err);
  }
};

exports.generatePDF = async (req, res, next) => {
    try {
        const options = req.body;
        
        
        // Generate PDF
        const pdfBuffer = await pdfService.generatePDF(options);
        
        // Set headers
        const filename = `bon_coulage_${options.etage?.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', pdfBuffer.length);
        // Send PDF
        res.send(pdfBuffer);
    } catch (error) {
        next(error);
    }
};

/**
 * Generate multi-page PDF from Excel file
 */
exports.generateFromExcel = async (req, res, next) => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                error: 'No Excel file uploaded',
                message: 'Please upload an Excel file (.xlsx, .xls)'
            });
        }
        
        
        // Parse Excel file
        const excelData = excelService.newParseExcelFile(req.file.buffer);
        
        if (excelData.length === 0) {
            return res.status(400).json({
                error: 'No valid data found in Excel file',
                message: 'Please check your Excel file format'
            });
        }
        
        // Get base options from request body (sent as JSON string)
        let baseOptions = {};
        if (req.body.baseOptions) {
            try {
                baseOptions = JSON.parse(req.body.baseOptions);
            } catch {
                baseOptions = {};
            }
        }
        
        // Generate reference for each row if not provided
        const reference_2 = baseOptions.reference_2 || req.body.reference_2 || '';
        
        // Create page data for each Excel row
        const pagesData = excelData.map((row, index) => ({
            etage: row.etage,
            reference: row.reference , // `MM/BC/${String(index + 1).padStart(4, '0')}/${year}`,
            reference_2: reference_2,
            date: row.date,
            ville: baseOptions.ville || req.body.ville || 'Casa',
            proprietaire: baseOptions.proprietaire || req.body.proprietaire || '',
            projet: baseOptions.projet || req.body.projet || '',
            adresse: baseOptions.adresse || req.body.adresse || '',
            notes: baseOptions.notes || req.body.notes,
            logo_base64: baseOptions.logo_base64 || req.body.logo_base64
        }));
        

        
        
        // Generate multi-page PDF
        const pdfBuffer = await pdfService.generateMultiPagePDF(pagesData, baseOptions);
        
        // Set headers
        const filename = `bon_coulage_multiple_${Date.now()}.pdf`;
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', pdfBuffer.length);
        
        // Send PDF
        res.send(pdfBuffer);
        
    } catch (error) {
        console.error('Excel PDF Generation Error:', error);
        next(error);
    }
};

/**
 * Preview Excel data before generating PDF
 */
exports.previewExcel = async (req, res, next) => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                error: 'No Excel file uploaded',
                message: 'Please upload an Excel file (.xlsx, .xls)'
            });
        }
        
        // Validate and parse Excel file
        const validation = excelService.validateExcelFile(req.file.buffer);
        
        if (!validation.valid) {
            return res.status(400).json({
                error: 'Invalid Excel file',
                message: validation.error
            });
        }
        
        // Return parsed data
        res.json({
            success: true,
            rowCount: validation.rowCount,
            rows: validation.rows,
            message: `Found ${validation.rowCount} valid rows in Excel file`
        });
        
    } catch (error) {
        next(error);
    }
};

/**
 * Generate HTML Preview
 */
exports.generatePreview = async (req, res, next) => {
    try {
        const options = req.body;
        
        // Generate HTML
        const html = templateService.generateHTMLBCLG(options);
        
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html);
        
    } catch (error) {
        next(error);
    }
};

/**
 * Get API Documentation
 */
exports.getDocumentation = (req, res) => {
    const docs = {
        title: "BON DE COULAGE API Documentation",
        version: "2.0.0",
        baseUrl: `${req.protocol}://${req.get('host')}`,
        endpoints: [
            {
                method: "POST",
                path: "/api/bon/generate",
                description: "Générer un PDF BON DE COULAGE (single page)",
                body: {
                    etage: "string (required) - Type d'étage (ex: 'FONDATIONS', 'PL.HT. S/SOL')",
                    reference: "string (required) - Référence (ex: 'MM/BC/1107/24')",
                    reference_2: "string (required) - Référence 2 (ex: 'B/344/24')",
                    date: "string (required) - Date (ex: '29/11/2024')",
                    ville: "string (optional) - Ville (default: 'Casa')",
                    proprietaire: "string (required)",
                    projet: "string (required)",
                    adresse: "string (required)",
                    notes: "array[string] (optional) - Notes personnalisées",
                    logo_base64: "string (optional) - Logo en base64"
                },
                response: "PDF file (application/pdf)"
            },
            {
                method: "POST",
                path: "/api/bon/generate-from-excel",
                description: "Générer un PDF multi-pages à partir d'un fichier Excel",
                contentType: "multipart/form-data",
                body: {
                    file: "file (required) - Excel file (.xlsx, .xls)",
                    baseOptions: "string (optional) - JSON string with base options (proprietaire, representant, projet, adresse, etc.)",
                    reference_2: "string (optional) - BA reference (default: 'BA 318/24')",
                    ville: "string (optional) - Ville",
                    proprietaire: "string (optional)",
                    projet: "string (optional)",
                    adresse: "string (optional)"
                },
                response: "Multi-page PDF file (application/pdf)"
            },
            {
                method: "POST",
                path: "/api/bon/preview-excel",
                description: "Preview Excel data before generating PDF",
                contentType: "multipart/form-data",
                body: {
                    file: "file (required) - Excel file (.xlsx, .xls)"
                },
                response: "JSON with parsed data"
            },
            {
                method: "POST",
                path: "/api/bon/preview",
                description: "Générer un aperçu HTML",
                body: "Same as /generate",
                response: "HTML content (text/html)"
            },
            {
                method: "GET",
                path: "/api/bon/template/:type",
                description: "Obtenir un template prérempli",
                params: {
                    type: "FONDATIONS | SSOL | SOUPENTE | RDCH | ETAGE1 | ETAGE2 | ETAGE3"
                },
                response: "JSON template"
            }
        ],
        types_etage: [
            "FONDATIONS",
            "PL.HT. S/SOL",
            "SOUPENTE",
            "PL.HT. R.D.CH",
            "PL.HT. 1° ETAGE",
            "PL.HT. 2° ETAGE",
            "PL.HT. 3° ETAGE"
        ]
    };
    
    res.json(docs);
};

exports.previewHtml =(req,res)=>{
    try {
        const { type = 'BCLG' } = req.query;
        
        // Options par défaut pour la prévisualisation
        const defaultOptions = {
            date: new Date().toLocaleDateString('fr-FR'),
            ville: 'Casa',
            reference: 'MM/BC/1107/24',
            reference_2: 'BA 318/24',
            proprietaire: 'SOCIETE ARIF LOGEMENT S.A.R.L. AU.',
            projet: "CONSTRUCTION D'UN IMMEUBLE EN S/SOL + R.D.CH. + SOUPENTE + 3 ETAGES.",
            adresse: "LOTISSEMENT AL MAMOUNIA LOT N° 3 SIDI HAJJAJ OUED HASSAR. T.F. N° 12231/85.",
        };

        let html;
        
        if (type === 'ATT') {
            html = templateService.generateHTMLATT({
                ...defaultOptions,
                title: 'ATTESTATION DE CONFORMITE'
            });
        } else {
            html = templateService.generateHTMLBCLG({
                ...defaultOptions,
                title: 'BON DE COULAGE',
                etage: '1° ETAGE',
                notes: [
                    "Augmenter le nombre d'étai.",
                    "Bien caler les fonds de poutres",
                    "Mettre les calles sur les poutres."
                ]
            });
        }

        // Retourner le HTML directement
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html);
        
    } catch (error) {
        console.error('Preview error:', error);
        res.status(500).send(`
            <html>
                <body>
                    <h1>Erreur de prévisualisation</h1>
                    <pre>${error.message}</pre>
                    <pre>${error.stack}</pre>
                </body>
            </html>
        `);
    }
}
const express = require('express');
const router = express.Router();
const multer = require('multer');
const bonController = require('../controllers/bon.controller');
const { validateBonRequest } = require('../middleware/validation');

// Configure multer for file upload (memory storage)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept only Excel files
        const allowedMimes = [
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel.sheet.macroEnabled.12'
        ];
        
        if (allowedMimes.includes(file.mimetype) || 
            file.originalname.match(/\.(xlsx|xls|xlsm)$/i)) {
            cb(null, true);
        } else {
            cb(new Error('Only Excel files are allowed (.xlsx, .xls, .xlsm)'));
        }
    }
});

/**
 * @route   POST /api/bon/generate
 * @desc    Generate BON DE COULAGE PDF (single page)
 * @access  Public
 */

router.get('/template', bonController.downloadTemplate);

router.post('/generate', validateBonRequest, bonController.generatePDF);

router.get('/preview-html',bonController.previewHtml)
/**
 * @route   POST /api/bon/generate-from-excel
 * @desc    Generate multi-page PDF from Excel file
 * @access  Public
 */
router.post('/generate-from-excel', upload.single('file'),validateBonRequest, bonController.generateFromExcel);

/**
 * @route   POST /api/bon/preview-excel
 * @desc    Preview Excel data before generating PDF
 * @access  Public
 */
router.post('/preview-excel', upload.single('file'), bonController.previewExcel);

/**
 * @route   POST /api/bon/preview
 * @desc    Generate HTML preview
 * @access  Public
 */
router.post('/preview', validateBonRequest, bonController.generatePreview);

/**
 * @route   GET /api/bon/docs
 * @desc    API Documentation
 * @access  Public
 */
router.get('/docs', bonController.getDocumentation);

module.exports = router;
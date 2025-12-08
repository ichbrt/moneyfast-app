/**
 * Batch routes
 */

const express = require('express');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const { createBatch, getBatch, listBatches } = require('../services/batchService');
const { parseImportFile, generateCSVTemplate } = require('../services/importService');
const { generateBatchReport } = require('../services/reportService');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { asyncHandler } = require('../middlewares/errorMiddleware');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
    dest: 'uploads/',
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            'text/csv',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
            'application/vnd.ms-excel', // xls
        ];

        if (allowedMimes.includes(file.mimetype) ||
            file.originalname.endsWith('.csv') ||
            file.originalname.endsWith('.xlsx')) {
            cb(null, true);
        } else {
            cb(new Error('Only CSV and Excel files are allowed'));
        }
    },
});

/**
 * POST /api/batches
 * Create batch from JSON (for ERP integration)
 */
router.post(
    '/',
    authenticate,
    authorize('ADMIN', 'FINANCE'),
    asyncHandler(async (req, res) => {
        const { reference, items } = req.body;

        if (!reference) {
            return res.status(400).json({ error: 'Batch reference is required' });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Items array is required and must not be empty' });
        }

        const batch = await createBatch({
            reference,
            createdBy: req.user.id,
            items,
        });

        res.status(201).json({
            success: true,
            message: 'Batch created successfully',
            batch,
        });
    })
);

/**
 * POST /api/batches/upload-csv
 * Create batch from CSV/Excel file upload
 * Note: Keeping route name 'upload-csv' for backward compatibility, but it handles both now.
 */
router.post(
    '/upload-csv',
    authenticate,
    authorize('ADMIN', 'FINANCE'),
    upload.single('file'),
    asyncHandler(async (req, res) => {
        if (!req.file) {
            return res.status(400).json({ error: 'File is required' });
        }

        const { reference } = req.body;

        if (!reference) {
            // Clean up uploaded file
            await fs.unlink(req.file.path);
            return res.status(400).json({ error: 'Batch reference is required' });
        }

        try {
            // Read file
            const fileContent = await fs.readFile(req.file.path);

            // Parse using the new import service
            const parsed = parseImportFile(fileContent, req.file.mimetype, req.file.originalname);

            // Delete uploaded file
            await fs.unlink(req.file.path);

            if (!parsed.success) {
                return res.status(400).json({
                    error: 'Validation failed',
                    errors: parsed.errors,
                    summary: parsed.summary,
                });
            }

            // Create batch
            const batch = await createBatch({
                reference,
                createdBy: req.user.id,
                items: parsed.items,
            });

            res.status(201).json({
                success: true,
                message: 'Batch created successfully',
                batch,
                summary: parsed.summary,
            });
        } catch (error) {
            // Clean up file on error
            try {
                await fs.unlink(req.file.path);
            } catch (e) {
                // Ignore cleanup errors
            }
            // If it's a parsing error, return 400
            if (error.message.includes('Parsing Error') || error.message.includes('Unsupported file')) {
                return res.status(400).json({ error: error.message });
            }
            throw error;
        }
    })
);

/**
 * GET /api/batches/:id
 * Get batch details by ID
 */
router.get(
    '/:id',
    authenticate,
    asyncHandler(async (req, res) => {
        const batch = await getBatch(req.params.id);

        res.json({
            success: true,
            batch,
        });
    })
);

/**
 * GET /api/batches
 * List batches with pagination and filters
 */
router.get(
    '/',
    authenticate,
    asyncHandler(async (req, res) => {
        const { page, limit, status, fromDate, toDate } = req.query;

        // Only admins can see all batches, others see only their own
        const filters = {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 20,
            status,
            fromDate,
            toDate,
        };

        if (req.user.role !== 'ADMIN') {
            filters.createdBy = req.user.id;
        }

        const result = await listBatches(filters);

        res.json({
            success: true,
            ...result,
        });
    })
);

/**
 * GET /api/batches/template/csv
 * Download CSV template
 */
router.get('/template/csv', (req, res) => {
    const template = generateCSVTemplate();

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=batch_template.csv');
    res.send(template);
});

/**
 * GET /api/batches/:id/export
 * Download batch report
 */
router.get(
    '/:id/export',
    authenticate,
    asyncHandler(async (req, res) => {
        const { buffer, filename } = await generateBatchReport(req.params.id);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.send(buffer);
    })
);

module.exports = router;

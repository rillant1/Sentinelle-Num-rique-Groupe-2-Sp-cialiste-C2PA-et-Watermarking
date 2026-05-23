// src/routes/verifyRoutes.js
const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');

const c2paController = require('../controllers/c2paController');
const c2paMiddleware = require('../middleware/c2paValidator');

const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.mp4', '.mov'];

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename:    (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({
    storage,
    limits: { fileSize: 200 * 1024 * 1024 }, // 200 Mo
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ALLOWED_EXTENSIONS.includes(ext)) return cb(null, true);
        cb(new Error(`Format non supporté : ${ext}. Acceptés : ${ALLOWED_EXTENSIONS.join(', ')}`));
    }
});

// POST /api/verify
// curl: curl -X POST http://localhost:3000/api/verify -F "media=@fichier.png"
router.post('/', upload.single('media'), c2paMiddleware, c2paController.verifyMedia);

module.exports = router;

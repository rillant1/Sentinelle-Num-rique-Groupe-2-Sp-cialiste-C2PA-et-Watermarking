// src/middleware/c2paValidator.js
const path = require('path');
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.mp4', '.mov'];

const c2paMiddleware = (req, res, next) => {
    if (!req.file) return res.status(400).json({ success: false, message: 'Fichier manquant.' });
    const ext = path.extname(req.file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return res.status(415).json({ success: false, message: `Format non supporté : ${ext}` });
    }
    console.log(`[Middleware] Fichier valide : ${req.file.originalname}`);
    next();
};

module.exports = c2paMiddleware;

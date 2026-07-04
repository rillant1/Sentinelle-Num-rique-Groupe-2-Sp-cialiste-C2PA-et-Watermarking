// src/index.js — API Gateway
const express = require('express');
const path    = require('path');
const verifyRoutes = require('./routes/verifyRoutes');

const app  = express();
const PORT = process.env.PORT || 3000;

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

app.use(express.json());

// Interface HTML
app.use(express.static(path.join(__dirname, '../public')));

// API
app.use('/api/verify', verifyRoutes);

// Santé
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'API Gateway', timestamp: new Date().toISOString() });
});

// Gestion des erreurs (ex: upload multer rejeté par fileFilter ou limite de taille)
app.use((err, req, res, next) => {
    console.error('[Gateway Error]', err.message);
    res.status(400).json({ success: false, message: err.message });
});

app.listen(PORT, () => {
    console.log(`✅ API Gateway démarré sur le port ${PORT}`);
    console.log(`🌐 Interface disponible sur http://localhost:${PORT}`);
});

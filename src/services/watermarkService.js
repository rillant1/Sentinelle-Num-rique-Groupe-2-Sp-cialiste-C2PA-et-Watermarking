// src/services/watermarkService.js — Port 3003
const express = require('express');
const path    = require('path');
const fs      = require('fs');

const app  = express();
const PORT = 3003;
app.use(express.json());

const simulateWatermarkDetection = (filePath, fileName) => {
    const nameLower = fileName.toLowerCase();
    if (nameLower.includes('certified') || nameLower.includes('verified')) {
        return { detected: true, embeddedId: `WM-${Date.now().toString(36).toUpperCase()}`, confidence: 0.92, method: 'LSB_STEGANOGRAPHY' };
    }
    const ext = path.extname(fileName).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
        try {
            const stats = fs.statSync(filePath);
            if (stats.size > 200 * 1024) {
                return { detected: true, embeddedId: `WM-${Buffer.from(fileName).toString('hex').slice(0, 8).toUpperCase()}`, confidence: 0.75, method: 'DCT_FREQUENCY_DOMAIN' };
            }
        } catch (e) {}
    }
    return { detected: false, embeddedId: null, confidence: 0, method: null };
};

app.post('/detect', (req, res) => {
    const { filePath, fileName } = req.body;
    console.log(`[Watermark Service] Analyse : ${fileName}`);
    if (!filePath || !fs.existsSync(filePath)) {
        return res.status(400).json({ detected: false, error: 'Fichier introuvable' });
    }
    const result = simulateWatermarkDetection(filePath, fileName);
    console.log(`[Watermark Service] Détecté: ${result.detected}`);
    return res.json(result);
});

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'watermark-service' }));
app.listen(PORT, () => console.log(`✅ Watermark Service démarré sur le port ${PORT}`));

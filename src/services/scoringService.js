// src/services/scoringService.js — Port 3002
const express = require('express');
const app  = express();
const PORT = 3002;
app.use(express.json());

const calculateScore = (hasManifest, isSignatureValid, watermarkDetected) => {
    if (hasManifest && isSignatureValid)   return { score: 95, label: 'Fort' };
    if (hasManifest && !isSignatureValid)  return { score: 10, label: 'Critique' };
    if (!hasManifest && watermarkDetected) return { score: 65, label: 'Moyen' };
    return { score: 42, label: 'Faible' };
};

app.post('/calculate', (req, res) => {
    const { hasManifest = false, isSignatureValid = false, watermarkDetected = false } = req.body;
    console.log(`[Scoring] Manifeste=${hasManifest}, Valide=${isSignatureValid}, Watermark=${watermarkDetected}`);
    const { score, label } = calculateScore(hasManifest, isSignatureValid, watermarkDetected);
    return res.json({ confidenceScore: score, status: label, timestamp: new Date().toISOString(), provider: 'C2PA & Watermarking Specialist (Groupe 2)' });
});

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'scoring-service' }));
app.listen(PORT, () => console.log(`✅ Scoring Service démarré sur le port ${PORT}`));

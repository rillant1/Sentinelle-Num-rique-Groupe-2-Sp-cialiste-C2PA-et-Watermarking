// src/services/c2paService.js — Port 3001
const express = require('express');
const path    = require('path');
const fs      = require('fs');

const app  = express();
const PORT = 3001;
app.use(express.json());

function getMimeType(filePath) {
    const map = {
        '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
        '.png': 'image/png',  '.webp': 'image/webp',
        '.mp4': 'video/mp4',  '.mov':  'video/quicktime'
    };
    return map[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

app.post('/analyze', async (req, res) => {
    const { filePath, fileName } = req.body;
    console.log(`[C2PA Service] Analyse : ${fileName}`);

    if (!filePath || !fs.existsSync(filePath)) {
        return res.status(400).json({ hasManifest: false, isSignatureValid: false, error: 'Fichier introuvable' });
    }

    try {
        const { Reader } = await import('@contentauth/c2pa-node');
        const buffer   = fs.readFileSync(filePath);
        const mimeType = getMimeType(filePath);
        const reader   = await Reader.fromAsset({ buffer, mimeType });

        if (!reader) {
            console.log(`[C2PA Service] Aucun manifeste pour ${fileName}`);
            return res.json({ hasManifest: false, isSignatureValid: false, issuer: null, assertions: [] });
        }

        const activeManifest   = reader.getActive();
        const issuer           = activeManifest?.signature_info?.issuer || activeManifest?.claim_generator || 'Inconnu';
        const assertions       = activeManifest?.assertions?.map(a => a.label) || [];
        const validationErrors = (reader.json().validation_status || []).filter(
            s => s.code === 'claimSignature.mismatch' || s.code === 'assertion.dataHash.mismatch'
        );
        const isSignatureValid = validationErrors.length === 0;

        console.log(`[C2PA Service] Manifeste OK — Emetteur: ${issuer}, Valide: ${isSignatureValid}`);
        return res.json({ hasManifest: true, isSignatureValid, issuer, assertions, validationErrors: validationErrors.map(e => e.code) });

    } catch (err) {
        console.error('[C2PA Service] Erreur:', err.message);
        return res.status(500).json({ hasManifest: false, isSignatureValid: false, error: err.message });
    }
});

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'c2pa-service' }));
app.listen(PORT, () => console.log(`✅ C2PA Service démarré sur le port ${PORT}`));

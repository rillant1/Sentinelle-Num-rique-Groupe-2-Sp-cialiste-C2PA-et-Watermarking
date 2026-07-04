// src/controllers/c2paController.js
const axios = require('axios');

const C2PA_SERVICE_URL      = process.env.C2PA_SERVICE_URL      || 'http://c2pa-service:3001';
const WATERMARK_SERVICE_URL = process.env.WATERMARK_SERVICE_URL || 'http://watermark-service:3003';
const SCORING_SERVICE_URL   = process.env.SCORING_SERVICE_URL   || 'http://scoring-service:3002';

exports.verifyMedia = async (req, res) => {
    try {
        console.log('[GATEWAY] Nouveau fichier reçu');
        if (!req.file) return res.status(400).json({ success: false, message: 'Aucun média reçu.' });

        const filePath = req.file.path;
        const fileName = req.file.originalname;

        // 1. C2PA Service
        let c2paData;
        try {
            const r = await axios.post(`${C2PA_SERVICE_URL}/analyze`, { filePath, fileName });
            c2paData = r.data;
            console.log(`[Gateway] C2PA: Manifeste=${c2paData.hasManifest}, Valide=${c2paData.isSignatureValid}`);
        } catch (err) {
            console.error('[Gateway] C2PA injoignable:', err.message);
            c2paData = { hasManifest: false, isSignatureValid: false, issuer: null, assertions: [] };
        }

        // 2. Watermark Service
        let watermarkData;
        try {
            const r = await axios.post(`${WATERMARK_SERVICE_URL}/detect`, { filePath, fileName });
            watermarkData = r.data;
            console.log(`[Gateway] Watermark: Détecté=${watermarkData.detected}`);
        } catch (err) {
            console.error('[Gateway] Watermark injoignable:', err.message);
            watermarkData = { detected: false, embeddedId: null, confidence: 0 };
        }

        // 3. Scoring Service
        let result;
        try {
            const r = await axios.post(`${SCORING_SERVICE_URL}/calculate`, {
                hasManifest:       c2paData.hasManifest,
                isSignatureValid:  c2paData.isSignatureValid,
                watermarkDetected: watermarkData.detected
            });
            result = r.data;
            console.log(`[Gateway] Score: ${result.confidenceScore} (${result.status})`);
        } catch (err) {
            console.error('[Gateway] Scoring injoignable:', err.message);
            result = { confidenceScore: 0, status: 'Erreur Service' };
        }

        const scoreDisplay = String(result.confidenceScore).includes('%')
            ? result.confidenceScore
            : `${result.confidenceScore}%`;

        return res.status(200).json({
            success: true,
            message: `Score de confiance : ${scoreDisplay} (${result.status})`,
            details: {
                mediaName:  fileName,
                provenance: c2paData.hasManifest
                    ? `Manifeste C2PA détecté (émetteur : ${c2paData.issuer || 'inconnu'})`
                    : 'Aucune métadonnée de provenance trouvée',
                assertions:        c2paData.assertions   || [],
                validationErrors:  c2paData.validationErrors || [],
                watermark: {
                    detected:   watermarkData.detected,
                    embeddedId: watermarkData.embeddedId || null,
                    confidence: watermarkData.confidence || 0,
                    method:     watermarkData.method     || null
                },
                timestamp:  result.timestamp || new Date().toISOString(),
                specialist: result.provider  || 'Groupe 2 - C2PA Specialist'
            }
        });

    } catch (error) {
        console.error('[Gateway Error]', error.message);
        return res.status(500).json({ success: false, message: "Erreur lors de l'analyse.", error: error.message });
    }
};

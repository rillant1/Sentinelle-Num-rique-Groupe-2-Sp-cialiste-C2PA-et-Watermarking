# Sentinelle-Numérique-Groupe-2-Spécialiste-C2PA-et-Watermarking
# 🛡️ Projet 2 — Système de Vérification de Provenance C2PA

> Microservices Node.js · Docker · Groupe 2

## 📋 Prérequis

Avant de commencer, installe ces outils sur ta machine :

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (inclut docker compose)
- [Git](https://git-scm.com/downloads)
- Un terminal (PowerShell sur Windows, Terminal sur Mac/Linux)

---

## 🚀 Installation et démarrage

### 1. Cloner le projet
```bash
git clone https://github.com/rillant1/Sentinelle-Num-rique-Groupe-2-Sp-cialiste-C2PA-et-Watermarking.git
cd Sentinelle-Num-rique-Groupe-2-Sp-cialiste-C2PA-et-Watermarking
```

### 2. Télécharger les images Docker requises
```bash
# Image légère pour Gateway, Scoring, Watermark
docker pull node:18-slim

# Image pour le vrai SDK C2PA (Rust natif)
docker pull node:18-bookworm-slim
```

### 3. Build et démarrage
```bash
docker compose build && docker compose up
```

### 4. Ouvrir l'interface
```
http://localhost:3000
```

---

## 🏗️ Architecture

```
projet2-c2pa-service/
├── public/
│   └── index.html              ← Interface utilisateur (http://localhost:3000)
├── src/
│   ├── index.js                ← API Gateway        (port 3000)
│   ├── controllers/
│   │   └── c2paController.js   ← Orchestrateur des appels microservices
│   ├── routes/
│   │   └── verifyRoutes.js     ← Route POST /api/verify
│   ├── middleware/
│   │   └── c2paValidator.js    ← Validation fichier entrant
│   └── services/
│       ├── c2paService.js      ← C2PA Validator      (port 3001)
│       ├── watermarkService.js ← Watermark Detection (port 3003)
│       └── scoringService.js   ← Scoring Service     (port 3002)
├── Dockerfile                  ← Multi-stage (standard + c2pa_heavy)
├── docker-compose.yml
└── package.json
```

## 🔌 Ports

| Service           | Port | Rôle |
|-------------------|------|------|
| API Gateway       | 3000 | Point d'entrée + Interface web |
| C2PA Validator    | 3001 | Extraction et validation manifeste C2PA |
| Scoring Service   | 3002 | Calcul du score de confiance |
| Watermark Service | 3003 | Détection de marque invisible |

---

## 🧪 Test API

```bash
# Image — score attendu 95% Fort (si manifeste C2PA) ou 65% Moyen (watermark)
curl -X POST http://localhost:3000/api/verify -F "media=@photo.png"

# Vidéo — score attendu 42% Faible
curl -X POST http://localhost:3000/api/verify -F "media=@video.mp4"
```

## 📊 Logique de scoring

| Condition | Score | Label |
|-----------|-------|-------|
| Manifeste C2PA valide + signature OK | 95% | 🟢 Fort |
| Manifeste C2PA présent mais signature invalide | 10% | 🔴 Critique |
| Pas de manifeste mais watermark détecté | 65% | 🔵 Moyen |
| Aucune preuve de provenance | 42% | 🟡 Faible |

---

## 🤝 Contribuer

### Workflow Git recommandé

```bash
# 1. Crée une branche pour ta fonctionnalité
git checkout -b feature/nom-de-ta-fonctionnalite

# 2. Fais tes modifications, puis commit
git add .
git commit -m "feat: description de ce que tu as fait"

# 3. Push ta branche
git push origin feature/nom-de-ta-fonctionnalite

# 4. Crée une Pull Request sur GitHub
```

### Convention de commit

| Préfixe | Utilisation |
|---------|-------------|
| `feat:` | Nouvelle fonctionnalité |
| `fix:` | Correction de bug |
| `docs:` | Documentation |
| `refactor:` | Refactorisation de code |
| `test:` | Ajout de tests |

### Exemples
```bash
git commit -m "feat: ajouter la détection DCT dans watermarkService"
git commit -m "fix: corriger le timeout du C2PA Service"
git commit -m "docs: mettre à jour le README"
```

---

## ⚠️ Note importante — c2pa-node

La lib `@contentauth/c2pa-node` compile un binaire Rust natif (~500 Mo).
Elle s'installe uniquement dans le container `c2pa_heavy_service` (`node:18-bookworm-slim` — une base Debian 11 (`bullseye`) ne fournit pas la version de `libstdc++` requise par le binaire natif).
Ne pas essayer de faire `npm install` directement sur ta machine sans les outils de build.

---

*Groupe 2 — Système de Vérification de Provenance C2PA*

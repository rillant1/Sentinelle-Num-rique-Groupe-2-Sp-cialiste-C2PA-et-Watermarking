# ==========================================
# STAGE 1 : Image légère — Gateway, Scoring, Watermark
# ==========================================
FROM node:18-slim AS standard_service

WORKDIR /app
COPY package*.json ./
RUN npm install --ignore-scripts
COPY . .
RUN mkdir -p uploads
EXPOSE 3000 3002 3003

# ==========================================
# STAGE 2 : Image lourde — C2PA Service (Rust/C++)
# ==========================================
FROM node:18-bookworm-slim AS c2pa_heavy_service

WORKDIR /app

RUN apt-get update && apt-get install -y \
    python3 make g++ curl \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm config set fetch-retry-maxtimeout 300000 && \
    npm config set fetch-retries 5 && \
    npm install
COPY . .
RUN mkdir -p uploads
EXPOSE 3001

FROM node:20-slim AS base

# Install Chromium dependencies for Puppeteer
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libnss3 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxkbcommon0 \
    libgbm1 \
    libasound2 \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Copy workspace root
COPY package.json package-lock.json ./
COPY shared/ ./shared/
COPY server/package.json ./server/

# Install dependencies
RUN npm ci --workspace=server --workspace=shared

# Copy server source
COPY server/ ./server/

# Build
RUN npm run build -w shared && npm run build -w server

EXPOSE 3001

CMD ["node", "server/dist/index.js"]

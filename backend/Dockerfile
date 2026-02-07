# --- Stage 1: Build ---
FROM node:18-alpine AS builder

WORKDIR /app

# FIX: Install OpenSSL for Prisma
RUN apk add --no-cache openssl libc6-compat

# Copy configuration files
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy source code
COPY src ./src

# Generate Prisma Client & Build TypeScript
RUN npx prisma generate
RUN npx tsc 

# --- Stage 2: Production ---
FROM node:18-alpine

WORKDIR /app

# FIX: Install OpenSSL in production image too
RUN apk add --no-cache openssl libc6-compat

# Copy built files from previous stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Expose the API port
EXPOSE 5000

# Start command
CMD ["sh", "-c", "npx prisma db push && node dist/index.js"]
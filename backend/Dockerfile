
FROM node:18-alpine AS builder

WORKDIR /app


RUN apk add --no-cache openssl libc6-compat


COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/


RUN npm install


COPY src ./src


RUN npx prisma generate
RUN npx tsc 


FROM node:18-alpine

WORKDIR /app


RUN apk add --no-cache openssl libc6-compat


COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Expose the API port
EXPOSE 5000

# Start command
# Change your last line to this:
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node dist/index.js"]

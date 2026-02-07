# --- Stage 1: The Build Stage ---
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the React app for production (creates a /dist folder)
RUN npm run build

# --- Stage 2: The Serving Stage ---
# Use Nginx, a lightweight web server
FROM nginx:alpine

# Copy the build output from Stage 1 to Nginx's html folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 (Standard web port)
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
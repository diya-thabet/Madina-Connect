# Stage 1: Build the React Application
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the app (creates /app/dist)
RUN npm run build

# Stage 2: Serve the Application
FROM node:20-alpine
WORKDIR /app

# FIX 1: Create a minimal package.json with type="module" to silence warnings
RUN npm init -y && npm pkg set type="module"

# FIX 2: Install Express 4 specifically (Express 5 breaks the '*' wildcard)
RUN npm install express@4 http-proxy-middleware

# Copy the built assets from the builder stage
COPY --from=builder /app/dist ./dist

# Copy the server file
COPY server.js .

# Expose port 3000
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
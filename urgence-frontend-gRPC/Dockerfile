# Stage 1: Build React
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Minimal Nginx
# "alpine-slim" is the smallest possible standard Nginx image
FROM nginx:alpine-slim

# Remove default assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Copy your Proxy Config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
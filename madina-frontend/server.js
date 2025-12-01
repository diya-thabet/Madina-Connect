import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration for the backend API URL
// In K8s, this will point to the service name
const API_URL = process.env.API_URL || 'http://planner-service:8001';

console.log(`Setting up proxy to: ${API_URL}`);

// 1. Proxy API requests (Matches your vite.config.js logic)
app.use('/api', createProxyMiddleware({
    target: API_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/api': '', // Remove /api prefix when sending to backend
    },
}));

// 2. Serve static files from the build directory
app.use(express.static(path.join(__dirname, 'dist')));

// 3. Handle React Client-side routing
// For any request that isn't an API call or static file, send index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Frontend server running on port ${PORT}`);
});
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5173;

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'dist')));

// Reverse proxy for backend services
app.use('/service/mobility', createProxyMiddleware({
  target: 'http://localhost:8000',
  changeOrigin: true,
  pathRewrite: {'^/service/mobility': ''},
}));

app.use('/service/planner', createProxyMiddleware({
  target: 'http://localhost:8001',
  changeOrigin: true,
  pathRewrite: {'^/service/planner': ''},
}));

app.use('/service/urgence', createProxyMiddleware({
  target: 'http://localhost:30090',
  changeOrigin: true,
  pathRewrite: {'^/service/urgence': ''},
}));

app.use('/service/events', createProxyMiddleware({
  target: 'http://localhost:8082',
  changeOrigin: true,
  pathRewrite: {'^/service/events': ''},
}));

// For SPA routing: fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

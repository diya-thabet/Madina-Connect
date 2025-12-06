import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',        // listen on all interfaces
    port: 5173,
    strictPort: true,
    // allow all hosts (should work in many cases)
    allowedHosts: [
  'abc.trycloudflare.com',
  'localhost',
  '127.0.0.1'
],

    // HMR: make the client connect via wss on standard https port (helps tunnels)
    hmr: {
      protocol: 'wss',
      clientPort: 443
      // optional: host: 'your-tunnel-host'  <-- use only if you have a stable hostname
    },

    proxy: {
      '/service/mobility': { target: 'http://localhost:8000', changeOrigin: true, rewrite: p => p.replace(/^\/service\/mobility/, '') },
      '/service/planner' : { target: 'http://localhost:8001', changeOrigin: true, rewrite: p => p.replace(/^\/service\/planner/, '') },
      '/service/urgence' : { target: 'http://localhost:30090', changeOrigin: true, rewrite: p => p.replace(/^\/service\/urgence/, '') },
      '/service/events'   : { target: 'http://localhost:8082', changeOrigin: true, rewrite: p => p.replace(/^\/service\/events/, '') },
      '/planner-api'      : { target: 'http://localhost:8001', changeOrigin: true, rewrite: p => p.replace(/^\/planner-api/, '') }
    }
  }
})

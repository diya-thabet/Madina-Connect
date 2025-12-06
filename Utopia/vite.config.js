import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all addresses
    allowedHosts: [
      // Add your specific tunnel domain here, or use 'all' to allow everything (easiest for tunnels)
      'bidding-ear-occurring-conservation.trycloudflare.com', 
      'all' 
    ],
    proxy: {
      '/planner-api': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/planner-api/, ''),
      },
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
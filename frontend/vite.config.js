import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        ws: true,
        // Only log errors, not every request
        configure: (proxy, _options) => {
          proxy.on('error', (err, req, _res) => {
            // Only log if it's not a connection refused (server restarting)
            if (err.code !== 'ECONNREFUSED') {
              console.error('Proxy error:', err.message);
            }
          });
        },
      }
    }
  }
})


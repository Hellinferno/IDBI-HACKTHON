import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In dev we proxy /api → orchestrator (:8005) to avoid CORS.
// In prod, set VITE_API_BASE to the deployed orchestrator URL (see src/api.js).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.ORCHESTRATOR_URL || 'http://localhost:8005',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
  },
});

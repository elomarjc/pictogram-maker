import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: './', // Ensures relative assets work on GitHub Pages regardless of repo or subdomain path
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/jspdf')) return 'jspdf';
          if (id.includes('node_modules/lucide-react')) return 'lucide';
        },
      },
    },
  },
});

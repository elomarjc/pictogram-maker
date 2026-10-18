import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import {
  savePersonaToDisk,
  archivePersonaOnDisk,
  restorePersonaOnDisk,
  listPersonasOnDisk,
} from './scripts/manage-personas.mjs';

function parseJsonBody<T = any>(req: any): Promise<T> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: any) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : ({} as T));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: any, status: number, data: any) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

function personaFileSaverPlugin(): Plugin {
  return {
    name: 'persona-file-saver-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0];

        if (url === '/api/personas/save' && req.method === 'POST') {
          try {
            const body = await parseJsonBody(req);
            const saved = savePersonaToDisk(body);
            sendJson(res, 200, { success: true, persona: saved });
          } catch (err: any) {
            sendJson(res, 500, { success: false, error: err.message || String(err) });
          }
          return;
        }

        if (url === '/api/personas/delete' && req.method === 'POST') {
          try {
            const body = await parseJsonBody(req);
            const result = archivePersonaOnDisk(body.id);
            sendJson(res, 200, result);
          } catch (err: any) {
            sendJson(res, 500, { success: false, error: err.message || String(err) });
          }
          return;
        }

        if (url === '/api/personas/restore' && req.method === 'POST') {
          try {
            const body = await parseJsonBody(req);
            const result = restorePersonaOnDisk(body.id);
            sendJson(res, 200, result);
          } catch (err: any) {
            sendJson(res, 500, { success: false, error: err.message || String(err) });
          }
          return;
        }

        if (url === '/api/personas/list' && req.method === 'GET') {
          try {
            const result = listPersonasOnDisk();
            sendJson(res, 200, { success: true, ...result });
          } catch (err: any) {
            sendJson(res, 500, { success: false, error: err.message || String(err) });
          }
          return;
        }

        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    personaFileSaverPlugin(),
  ],
  base: './', // Ensures relative assets work on GitHub Pages regardless of repo or subdomain path
  server: {
    cors: true,
  },
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


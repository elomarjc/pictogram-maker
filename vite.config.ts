import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import {
  savePersonaToDisk,
  archivePersonaOnDisk,
  restorePersonaOnDisk,
  listPersonasOnDisk,
  deleteSceneOnDisk,
  deleteAllScenesOnDisk,
  deletePersonaPermanentlyOnDisk,
} from './scripts/manage-personas.mjs';
import {
  checkChatGPTStatus,
  openChatGPTInBrowser,
  runChatGPTGeneration,
} from './scripts/generate-with-chatgpt.mjs';

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
            const result = body.permanent
              ? deletePersonaPermanentlyOnDisk(body.id)
              : archivePersonaOnDisk(body.id);
            sendJson(res, 200, result);
          } catch (err: any) {
            sendJson(res, 500, { success: false, error: err.message || String(err) });
          }
          return;
        }

        if (url === '/api/personas/delete-scene' && req.method === 'POST') {
          try {
            const body = await parseJsonBody(req);
            const result = deleteSceneOnDisk(body.personaId, body.sceneKey);
            sendJson(res, 200, result);
          } catch (err: any) {
            sendJson(res, 500, { success: false, error: err.message || String(err) });
          }
          return;
        }

        if (url === '/api/personas/delete-all-scenes' && req.method === 'POST') {
          try {
            const body = await parseJsonBody(req);
            const result = deleteAllScenesOnDisk(body.personaId);
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

        if (url === '/api/chatgpt/status' && req.method === 'GET') {
          try {
            const status = checkChatGPTStatus();
            sendJson(res, 200, { success: true, ...status });
          } catch (err: any) {
            sendJson(res, 500, { success: false, error: err.message || String(err) });
          }
          return;
        }

        if (url === '/api/chatgpt/open' && req.method === 'POST') {
          try {
            const result = openChatGPTInBrowser();
            sendJson(res, 200, result);
          } catch (err: any) {
            sendJson(res, 500, { success: false, error: err.message || String(err) });
          }
          return;
        }

        if (url === '/api/chatgpt/generate' && req.method === 'POST') {
          try {
            const body = await parseJsonBody(req);
            const personaId = body.personaId || 'avatar_1';
            const scene = body.scene || '--grid';
            const customPrompt = body.customPrompt || body.sceneDescription || null;

            // Use Server-Sent Events (SSE) for real-time progress streaming
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache, no-transform');
            res.setHeader('Connection', 'keep-alive');

            const sendEvent = (event: string, data: any) => {
              res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
            };

            sendEvent('progress', { stage: 'init', percent: 5, message: 'Forbereder ChatGPT session...' });

            const result = await runChatGPTGeneration({
              avatar: personaId,
              scene,
              customPrompt,
              onProgress: (p: any) => {
                sendEvent('progress', p);
              },
            });

            sendEvent('complete', result);
            res.end();
          } catch (err: any) {
            res.write(`event: error\ndata: ${JSON.stringify({ error: err.message || String(err) })}\n\n`);
            res.end();
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
    watch: {
      ignored: [
        '**/public/reference/**',
        '**/reference/**',
        '**/.git/**',
        '**/personas_manifest.json',
        '**/.archive/**',
      ],
    },
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


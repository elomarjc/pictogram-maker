/**
 * Service to generate pictogram images directly via Cloudflare Workers AI API.
 * Eliminates the need to copy-paste reference images and prompts into ChatGPT.
 */

const STORAGE_KEY_WORKER_URL = 'pictogram_cf_ai_worker_url';
const STORAGE_KEY_API_KEY = 'pictogram_cf_ai_api_key';

export const DEFAULT_WORKER_URL = 'https://free-image-generation-api.elomarjc.workers.dev';

// Default worker URL fallback or user-configured endpoint
export function getStoredWorkerUrl(): string {
  return localStorage.getItem(STORAGE_KEY_WORKER_URL) || DEFAULT_WORKER_URL;
}

export function setStoredWorkerUrl(url: string): void {
  localStorage.setItem(STORAGE_KEY_WORKER_URL, url.trim());
}

export function getStoredApiKey(): string {
  return localStorage.getItem(STORAGE_KEY_API_KEY) || '';
}

export function setStoredApiKey(key: string): void {
  localStorage.setItem(STORAGE_KEY_API_KEY, key.trim());
}

export interface WorkerHealthResult {
  ok: boolean;
  status?: string;
  models?: string[];
  defaultModel?: string;
  error?: string;
}

/**
 * Checks if the configured Cloudflare Worker is reachable and healthy.
 */
export async function checkWorkerHealth(customUrl?: string): Promise<WorkerHealthResult> {
  const workerUrl = (customUrl || getStoredWorkerUrl()).replace(/\/+$/, '');
  if (!workerUrl) {
    return { ok: false, error: 'Ingen Cloudflare Worker URL konfigureret endnu.' };
  }

  try {
    const res = await fetch(`${workerUrl}/health`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      return { ok: false, error: `Worker svarede med status ${res.status}` };
    }

    const data = await res.json();
    return {
      ok: true,
      status: data.status,
      models: data.supportedModels || [],
      defaultModel: data.defaultModel,
    };
  } catch (err) {
    return {
      ok: false,
      error: `Kunne ikke forbinde til ${workerUrl}: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

export interface GenerateSceneOptions {
  workerUrl?: string;
  apiKey?: string;
  model?: string;
  numSteps?: number;
  referenceImage?: string;
  strength?: number;
  provider?: 'auto' | 'cloudflare' | 'openai';
}

/**
 * Generates an image using the Cloudflare Workers AI API (with optional OpenAI rotation).
 * Supports text-to-image and image-to-image (with reference images).
 * Returns a Base64 data URL string ready to be set directly on a pictogram or avatar.
 */
export async function generateSceneImage(
  prompt: string,
  options?: GenerateSceneOptions
): Promise<string> {
  const workerUrl = (options?.workerUrl || getStoredWorkerUrl()).replace(/\/+$/, '');
  const apiKey = options?.apiKey ?? getStoredApiKey();

  if (!workerUrl) {
    throw new Error(
      'Cloudflare Worker URL mangler. Indtast din Worker URL under indstillingerne.'
    );
  }

  if (!prompt || prompt.trim().length < 3) {
    throw new Error('Prompten skal være mindst 3 tegn lang.');
  }

  const endpoint = `${workerUrl}/v1/generate`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const bodyPayload: Record<string, unknown> = {
    prompt: prompt.trim(),
    model: options?.model || '@cf/black-forest-labs/flux-1-schnell',
    num_steps: options?.numSteps || 4,
    format: 'base64',
    provider: options?.provider || 'auto',
  };

  if (options?.referenceImage) {
    bodyPayload.image_b64 = options.referenceImage;
    if (typeof options.strength === 'number') {
      bodyPayload.strength = options.strength;
    }
  }

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(bodyPayload),
    });
  } catch (fetchErr) {
    throw new Error(
      `Netværksfejl under forbindelse til Cloudflare Worker: ${fetchErr instanceof Error ? fetchErr.message : String(fetchErr)}`
    );
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 429) {
      const waitTime = data?.retryAfterSeconds || 15;
      throw new Error(
        data?.message || `Hastighedsgrænse nået. Vent venligst ${waitTime} sekunder før næste forsøg.`
      );
    }
    if (response.status === 401) {
      throw new Error('Ugyldig eller manglende API-nøgle til Cloudflare Worker.');
    }
    throw new Error(
      data?.message || data?.error || `Billedgenerering fejlede med HTTP status ${response.status}.`
    );
  }

  if (!data?.imageUrl) {
    throw new Error('Cloudflare Worker returnerede ikke noget gyldigt billede.');
  }

  return data.imageUrl as string;
}

/**
 * Removes solid background from an image client-side using flood-fill.
 * Turns the solid border/background into 100% transparent alpha.
 * Returns a transparent PNG Data URL.
 */
export async function removeImageBackground(imageDataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(imageDataUrl);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const w = canvas.width;
        const h = canvas.height;

        // Sample background reference from corners
        const samplePoints = [
          [0, 0],
          [w - 1, 0],
          [0, h - 1],
          [w - 1, h - 1],
          [Math.floor(w / 2), 0],
        ];

        let bgR = 0, bgG = 0, bgB = 0;
        for (const [cx, cy] of samplePoints) {
          const idx = (cy * w + cx) * 4;
          bgR += data[idx];
          bgG += data[idx + 1];
          bgB += data[idx + 2];
        }
        bgR = Math.round(bgR / samplePoints.length);
        bgG = Math.round(bgG / samplePoints.length);
        bgB = Math.round(bgB / samplePoints.length);

        // Flood fill from outer boundaries
        const threshold = 48;
        const visited = new Uint8Array(w * h);
        const queue: number[] = [];

        for (let x = 0; x < w; x++) {
          queue.push(0 * w + x);
          queue.push((h - 1) * w + x);
          visited[0 * w + x] = 1;
          visited[(h - 1) * w + x] = 1;
        }
        for (let y = 0; y < h; y++) {
          queue.push(y * w + 0);
          queue.push(y * w + (w - 1));
          visited[y * w + 0] = 1;
          visited[y * w + (w - 1)] = 1;
        }

        let head = 0;
        while (head < queue.length) {
          const pos = queue[head++];
          const px = pos % w;
          const py = Math.floor(pos / w);
          const idx = (py * w + px) * 4;

          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
          if (dist <= threshold) {
            data[idx + 3] = 0; // Transparent

            const neighbors = [
              [px - 1, py],
              [px + 1, py],
              [px, py - 1],
              [px, py + 1],
            ];

            for (const [nx, ny] of neighbors) {
              if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                const nPos = ny * w + nx;
                if (!visited[nPos]) {
                  visited[nPos] = 1;
                  queue.push(nPos);
                }
              }
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch {
        resolve(imageDataUrl);
      }
    };
    img.onerror = () => resolve(imageDataUrl);
    img.src = imageDataUrl;
  });
}

/**
 * Converts a real person's photo into a 2D cartoon pictogram avatar sticker.
 * Captures facial traits (glasses, hair, beard, expression) in the style of persona_man_avatar.webp.
 * Automatically removes background to return a transparent PNG.
 * The original photo is used strictly in-memory during inference and is NEVER saved or sent to GitHub.
 */
export async function createAvatarFromPhoto(
  photoDataUrl: string,
  personaName?: string,
  options?: { workerUrl?: string }
): Promise<string> {
  const subject = personaName && personaName.trim() ? personaName.trim() : 'a person';
  const prompt = `A cute 2D cartoon pictogram avatar sticker of ${subject}, friendly round head, big happy open smile, simple black cartoon eyes, bold thick black vector outline, flat vibrant colors, clean cel-shading, modern pictogram sticker illustration style, isolated on solid white background`;

  const rawGeneratedUrl = await generateSceneImage(prompt, {
    workerUrl: options?.workerUrl,
    referenceImage: photoDataUrl,
    strength: 0.7,
    model: '@cf/black-forest-labs/flux-1-schnell',
    numSteps: 4,
  });

  return removeImageBackground(rawGeneratedUrl);
}


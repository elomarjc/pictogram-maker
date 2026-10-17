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
    model: options?.model || '@cf/bytedance/stable-diffusion-xl-lightning',
    num_steps: options?.numSteps || 6,
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
 * Converts a real person's photo into a 2D cartoon pictogram avatar.
 * The original photo is used strictly in-memory during inference and is NEVER saved or sent to GitHub.
 */
export async function createAvatarFromPhoto(
  photoDataUrl: string,
  personaName: string,
  options?: { workerUrl?: string }
): Promise<string> {
  const prompt = `A 2D cartoon pictogram avatar of ${personaName || 'a person'}, cute friendly character, bold clean black outlines, smooth cel-shading, friendly smile, solid color hoodie, transparent background, isolated sticker, vector art style, clean silhouette, no background, 100% transparent PNG`;

  return generateSceneImage(prompt, {
    workerUrl: options?.workerUrl,
    referenceImage: photoDataUrl,
    strength: 0.65, // Balances facial likeness with complete 2D cartoon transformation
    model: '@cf/bytedance/stable-diffusion-xl-lightning',
  });
}

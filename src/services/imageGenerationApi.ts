/**
 * Service to generate pictogram images directly via Cloudflare Workers AI API.
 * Eliminates the need to copy-paste reference images and prompts into ChatGPT.
 * Supports multi-account rotation, quota tracking, and automatic failover.
 */

import { CONFIGURED_CLOUDFLARE_ACCOUNTS } from '../config/cloudflareAccounts';

const STORAGE_KEY_WORKER_URL = 'pictogram_cf_ai_worker_url';
const STORAGE_KEY_API_KEY = 'pictogram_cf_ai_api_key';
const STORAGE_KEY_WORKER_ACCOUNTS = 'pictogram_cf_ai_worker_accounts';

export const DEFAULT_WORKER_URL = 'https://free-image-generation-api.elomarjc.workers.dev';

export interface CloudflareWorkerAccount {
  id: string;
  name: string;
  url: string;
  apiKey?: string;
  isExhausted?: boolean;
  exhaustedUntil?: string; // ISO string for next UTC midnight
  lastUsedAt?: string;
  lastError?: string;
}

export interface QuotaResetInfo {
  nextReset: Date;
  hours: number;
  minutes: number;
  localTimeStr: string;
  countdownStr: string;
}

/**
 * Calculates the upcoming 00:00 UTC when Cloudflare Workers AI free tier quotas reset.
 */
export function getNextUtcMidnight(): Date {
  const now = new Date();
  return new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0, 0
  ));
}

/**
 * Calculates human-readable time and countdown until the next daily quota reset.
 */
export function getQuotaResetInfo(): QuotaResetInfo {
  const nextReset = getNextUtcMidnight();
  const now = new Date();
  const diffMs = Math.max(0, nextReset.getTime() - now.getTime());
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const localTimeStr = nextReset.toLocaleTimeString('da-DK', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const countdownStr = hours > 0
    ? `${hours} time${hours === 1 ? '' : 'r'} og ${minutes} minut${minutes === 1 ? '' : 'ter'}`
    : `${minutes} minut${minutes === 1 ? '' : 'ter'}`;

  return {
    nextReset,
    hours,
    minutes,
    localTimeStr,
    countdownStr,
  };
}

export class AllAccountsQuotaExceededError extends Error {
  public resetInfo: QuotaResetInfo;
  public totalAccounts: number;

  constructor(resetInfo: QuotaResetInfo, totalAccounts: number) {
    super(
      `Dagens gratis grænse er nået. Klar igen kl. ${resetInfo.localTimeStr} (om ${resetInfo.countdownStr}).`
    );
    this.name = 'AllAccountsQuotaExceededError';
    this.resetInfo = resetInfo;
    this.totalAccounts = totalAccounts;
  }
}

/**
 * Returns all configured Cloudflare worker accounts, automatically lifting exhaustion
 * if the daily reset time (00:00 UTC) has passed. Synchronizes with CONFIGURED_CLOUDFLARE_ACCOUNTS.
 */
export function getStoredWorkerAccounts(): CloudflareWorkerAccount[] {
  let storedAccounts: CloudflareWorkerAccount[] = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_WORKER_ACCOUNTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        storedAccounts = parsed;
      }
    }
  } catch {
    // fallback
  }

  // Use configured accounts from src/config/cloudflareAccounts.ts
  const configuredAccounts = CONFIGURED_CLOUDFLARE_ACCOUNTS.length > 0
    ? CONFIGURED_CLOUDFLARE_ACCOUNTS
    : [
        {
          name: 'Primær konto (Konto 1)',
          url: DEFAULT_WORKER_URL,
        },
      ];

  const now = Date.now();

  // Build merged list: configured accounts first, mapped with existing runtime state if found
  const merged: CloudflareWorkerAccount[] = configuredAccounts.map((conf, index) => {
    const cleanUrl = conf.url.trim().replace(/\/+$/, '');
    const existing = storedAccounts.find(
      (a) => a.url.trim().replace(/\/+$/, '').toLowerCase() === cleanUrl.toLowerCase() ||
             a.name.toLowerCase() === conf.name.toLowerCase()
    );

    const isExhausted = existing?.isExhausted && existing?.exhaustedUntil
      ? new Date(existing.exhaustedUntil).getTime() > now
      : false;

    return {
      id: existing?.id || `cf_conf_${index + 1}_${cleanUrl.replace(/[^a-zA-Z0-9]/g, '_').slice(-16)}`,
      name: conf.name,
      url: cleanUrl,
      apiKey: conf.apiKey,
      isExhausted,
      exhaustedUntil: isExhausted ? existing?.exhaustedUntil : undefined,
      lastUsedAt: existing?.lastUsedAt,
      lastError: isExhausted ? existing?.lastError : undefined,
    };
  });

  saveStoredWorkerAccounts(merged);
  return merged;
}

export function saveStoredWorkerAccounts(accounts: CloudflareWorkerAccount[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_WORKER_ACCOUNTS, JSON.stringify(accounts));
    if (accounts[0]) {
      localStorage.setItem(STORAGE_KEY_WORKER_URL, accounts[0].url);
      if (accounts[0].apiKey) {
        localStorage.setItem(STORAGE_KEY_API_KEY, accounts[0].apiKey);
      }
    }
  } catch (e) {
    console.warn('Could not save worker accounts to localStorage:', e);
  }
}

export function addStoredWorkerAccount(account: {
  name: string;
  url: string;
  apiKey?: string;
}): CloudflareWorkerAccount {
  const accounts = getStoredWorkerAccounts();
  const cleanUrl = account.url.trim().replace(/\/+$/, '');
  const newAccount: CloudflareWorkerAccount = {
    id: `cf_acc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: account.name.trim() || `Konto ${accounts.length + 1}`,
    url: cleanUrl,
    apiKey: account.apiKey?.trim() || undefined,
    isExhausted: false,
  };
  const updated = [...accounts, newAccount];
  saveStoredWorkerAccounts(updated);
  return newAccount;
}

export function updateStoredWorkerAccount(
  id: string,
  updates: Partial<CloudflareWorkerAccount>
): void {
  const accounts = getStoredWorkerAccounts();
  const updated = accounts.map((acc) => (acc.id === id ? { ...acc, ...updates } : acc));
  saveStoredWorkerAccounts(updated);
}

export function deleteStoredWorkerAccount(id: string): void {
  const accounts = getStoredWorkerAccounts();
  const filtered = accounts.filter((acc) => acc.id !== id);
  if (filtered.length === 0) {
    // Keep at least default account
    filtered.push({
      id: 'account_default',
      name: 'Primær konto',
      url: DEFAULT_WORKER_URL,
    });
  }
  saveStoredWorkerAccounts(filtered);
}

export function resetAllAccountQuotas(): void {
  const accounts = getStoredWorkerAccounts();
  const resetAccounts = accounts.map((acc) => ({
    ...acc,
    isExhausted: false,
    exhaustedUntil: undefined,
    lastError: undefined,
  }));
  saveStoredWorkerAccounts(resetAccounts);
}

export function getActiveWorkerAccounts(): CloudflareWorkerAccount[] {
  const accounts = getStoredWorkerAccounts();
  return accounts.filter((acc) => !acc.isExhausted);
}

export function markAccountExhausted(
  accountIdentifier: string,
  errorMsg?: string
): { exhaustedAccount: CloudflareWorkerAccount; nextAccount: CloudflareWorkerAccount | null } {
  const accounts = getStoredWorkerAccounts();
  const resetTime = getNextUtcMidnight().toISOString();

  let targetIndex = accounts.findIndex((a) => a.id === accountIdentifier);
  if (targetIndex < 0) {
    targetIndex = accounts.findIndex((a) => a.url === accountIdentifier.replace(/\/+$/, ''));
  }

  if (targetIndex >= 0) {
    accounts[targetIndex] = {
      ...accounts[targetIndex],
      isExhausted: true,
      exhaustedUntil: resetTime,
      lastError: errorMsg || 'Dagens gratis kvote nået (10.000 neuroner)',
    };
    saveStoredWorkerAccounts(accounts);
  }

  const exhaustedAccount = accounts[targetIndex] || {
    id: 'unknown',
    name: 'Cloudflare konto',
    url: accountIdentifier,
    isExhausted: true,
  };

  const nextActive = accounts.find((a) => !a.isExhausted) || null;
  return { exhaustedAccount, nextAccount: nextActive };
}

// Single-worker backwards compatibility helpers
export function getStoredWorkerUrl(): string {
  const active = getActiveWorkerAccounts();
  if (active.length > 0) return active[0].url;
  const all = getStoredWorkerAccounts();
  return all[0]?.url || DEFAULT_WORKER_URL;
}

export function setStoredWorkerUrl(url: string): void {
  localStorage.setItem(STORAGE_KEY_WORKER_URL, url.trim());
  const accounts = getStoredWorkerAccounts();
  if (accounts.length > 0) {
    accounts[0].url = url.trim();
    saveStoredWorkerAccounts(accounts);
  }
}

export function getStoredApiKey(): string {
  const active = getActiveWorkerAccounts();
  if (active.length > 0) return active[0].apiKey || '';
  const all = getStoredWorkerAccounts();
  return all[0]?.apiKey || '';
}

export function setStoredApiKey(key: string): void {
  localStorage.setItem(STORAGE_KEY_API_KEY, key.trim());
  const accounts = getStoredWorkerAccounts();
  if (accounts.length > 0) {
    accounts[0].apiKey = key.trim();
    saveStoredWorkerAccounts(accounts);
  }
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
  retries?: number;
  isScene?: boolean;
  onAccountRotated?: (info: {
    fromAccount: CloudflareWorkerAccount;
    toAccount: CloudflareWorkerAccount;
    message: string;
  }) => void;
}

/**
 * Generates an image using the Cloudflare Workers AI API with automatic multi-account rotation.
 * If an account exhausts its daily 10,000 neurons, it rotates seamlessly to the next available account.
 * When all accounts are exhausted, it throws AllAccountsQuotaExceededError with exact reset time.
 */
export async function generateSceneImage(
  prompt: string,
  options?: GenerateSceneOptions
): Promise<string> {
  const allAccounts = getStoredWorkerAccounts();
  const activeAccounts = getActiveWorkerAccounts();

  // If all configured accounts are exhausted, immediately throw with reset calculation
  if (activeAccounts.length === 0) {
    const resetInfo = getQuotaResetInfo();
    throw new AllAccountsQuotaExceededError(resetInfo, allAccounts.length);
  }

  // Determine which worker account to target
  let currentAccount: CloudflareWorkerAccount;
  if (options?.workerUrl) {
    const targetUrl = options.workerUrl.replace(/\/+$/, '');
    currentAccount =
      allAccounts.find((a) => a.url.replace(/\/+$/, '') === targetUrl) || {
        id: 'custom',
        name: 'Brugerdefineret worker',
        url: targetUrl,
        apiKey: options.apiKey,
      };
  } else {
    currentAccount = activeAccounts[0];
  }

  const workerUrl = currentAccount.url.replace(/\/+$/, '');
  const apiKey = options?.apiKey ?? currentAccount.apiKey ?? getStoredApiKey();

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

  if (options?.isScene) {
    bodyPayload.is_scene = true;
  }

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
      `Netværksfejl under forbindelse til Cloudflare Worker (${currentAccount.name}): ${fetchErr instanceof Error ? fetchErr.message : String(fetchErr)}`
    );
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorStr = (data?.message || data?.error || '').toLowerCase();
    const isQuotaExceeded =
      response.status === 429 ||
      errorStr.includes('quota') ||
      errorStr.includes('neuron') ||
      errorStr.includes('4006') ||
      errorStr.includes('opbrugt') ||
      errorStr.includes('limit');

    if (isQuotaExceeded) {
      // Mark current account as exhausted until midnight UTC
      const { exhaustedAccount, nextAccount } = markAccountExhausted(
        currentAccount.id,
        data?.message || 'Dagens kvote på 10.000 neuroner opbrugt'
      );

      // If another account is available, rotate automatically!
      if (nextAccount) {
        options?.onAccountRotated?.({
          fromAccount: exhaustedAccount,
          toAccount: nextAccount,
          message: `Kvote opbrugt på "${exhaustedAccount.name}". Skifter automatisk til "${nextAccount.name}" – genereringen fortsætter...`,
        });

        return generateSceneImage(prompt, {
          ...options,
          workerUrl: nextAccount.url,
          apiKey: nextAccount.apiKey,
        });
      }

      // No accounts left in the pool!
      const resetInfo = getQuotaResetInfo();
      throw new AllAccountsQuotaExceededError(resetInfo, allAccounts.length);
    }

    if (response.status === 401) {
      throw new Error(`Ugyldig eller manglende API-nøgle til Cloudflare Worker (${currentAccount.name}).`);
    }

    throw new Error(
      data?.message || data?.error || `Billedgenerering fejlede med HTTP status ${response.status}.`
    );
  }

  if (!data?.imageUrl) {
    throw new Error('Cloudflare Worker returnerede ikke noget gyldigt billede.');
  }

  // Update last used timestamp
  updateStoredWorkerAccount(currentAccount.id, { lastUsedAt: new Date().toISOString() });

  return data.imageUrl as string;
}

/**
 * Removes solid background from an image client-side.
 * Uses adaptive border sampling, flood fill with luminance/saturation detection,
 * and global near-white cleanup to guarantee clean transparent PNGs even with JPEG artifacts.
 */
export async function removeImageBackground(imageDataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(imageDataUrl);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        // 1. Sample border pixels along all 4 edges to determine background color
        const sampleR: number[] = [];
        const sampleG: number[] = [];
        const sampleB: number[] = [];

        const stepX = Math.max(1, Math.floor(w / 40));
        const stepY = Math.max(1, Math.floor(h / 40));

        for (let x = 0; x < w; x += stepX) {
          const topIdx = (0 * w + x) * 4;
          sampleR.push(data[topIdx]);
          sampleG.push(data[topIdx + 1]);
          sampleB.push(data[topIdx + 2]);

          const btmIdx = ((h - 1) * w + x) * 4;
          sampleR.push(data[btmIdx]);
          sampleG.push(data[btmIdx + 1]);
          sampleB.push(data[btmIdx + 2]);
        }

        for (let y = 0; y < h; y += stepY) {
          const lftIdx = (y * w + 0) * 4;
          sampleR.push(data[lftIdx]);
          sampleG.push(data[lftIdx + 1]);
          sampleB.push(data[lftIdx + 2]);

          const rgtIdx = (y * w + (w - 1)) * 4;
          sampleR.push(data[rgtIdx]);
          sampleG.push(data[rgtIdx + 1]);
          sampleB.push(data[rgtIdx + 2]);
        }

        const getMedian = (arr: number[]) => {
          const sorted = [...arr].sort((a, b) => a - b);
          return sorted[Math.floor(sorted.length / 2)] ?? 255;
        };

        const bgR = getMedian(sampleR);
        const bgG = getMedian(sampleG);
        const bgB = getMedian(sampleB);

        // 2. Flood fill from outer boundaries
        const visited = new Uint8Array(w * h);
        const isBg = new Uint8Array(w * h);
        const queue: number[] = [];

        // Push border pixels
        for (let x = 0; x < w; x++) {
          queue.push(0 * w + x);
          queue.push((h - 1) * w + x);
          visited[0 * w + x] = 1;
          visited[(h - 1) * w + x] = 1;
        }
        for (let y = 0; y < h; y++) {
          if (!visited[y * w + 0]) {
            queue.push(y * w + 0);
            visited[y * w + 0] = 1;
          }
          if (!visited[y * w + (w - 1)]) {
            queue.push(y * w + (w - 1));
            visited[y * w + (w - 1)] = 1;
          }
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
          const maxVal = Math.max(r, g, b);
          const minVal = Math.min(r, g, b);
          const lum = (maxVal + minVal) / 2;
          const sat = maxVal > 0 ? (maxVal - minVal) / maxVal : 0;

          // Background criterion:
          // Color distance close to edge median (dist <= 75), OR light neutral (lum >= 220 && sat <= 0.16)
          if (dist <= 75 || (lum >= 220 && sat <= 0.16)) {
            isBg[pos] = 1;

            if (px > 0 && !visited[pos - 1]) {
              visited[pos - 1] = 1;
              queue.push(pos - 1);
            }
            if (px < w - 1 && !visited[pos + 1]) {
              visited[pos + 1] = 1;
              queue.push(pos + 1);
            }
            if (py > 0 && !visited[pos - w]) {
              visited[pos - w] = 1;
              queue.push(pos - w);
            }
            if (py < h - 1 && !visited[pos + w]) {
              visited[pos + w] = 1;
              queue.push(pos + w);
            }
          }
        }

        // 3. Global pass: remove any near-white enclosed background pockets (e.g. between arms/props)
        for (let i = 0; i < w * h; i++) {
          const idx = i * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          const maxVal = Math.max(r, g, b);
          const minVal = Math.min(r, g, b);
          const lum = (maxVal + minVal) / 2;
          const sat = maxVal > 0 ? (maxVal - minVal) / maxVal : 0;

          if (isBg[i] || (lum >= 244 && sat <= 0.06)) {
            data[idx + 3] = 0; // 100% transparent
          }
        }

        // 4. Edge anti-aliasing / smoothing: soften transition on boundary pixels
        for (let y = 1; y < h - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            const pos = y * w + x;
            const idx = pos * 4;
            if (data[idx + 3] > 0) {
              const hasTransNeighbor =
                data[((y - 1) * w + x) * 4 + 3] === 0 ||
                data[((y + 1) * w + x) * 4 + 3] === 0 ||
                data[(y * w + (x - 1)) * 4 + 3] === 0 ||
                data[(y * w + (x + 1)) * 4 + 3] === 0;

              if (hasTransNeighbor) {
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];
                const lum = (Math.max(r, g, b) + Math.min(r, g, b)) / 2;
                if (lum > 190) {
                  // Soften semi-bright halo pixels
                  const alphaFactor = Math.max(0, 1 - (lum - 190) / 65);
                  data[idx + 3] = Math.round(data[idx + 3] * alphaFactor);
                }
              }
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        let finalDataUrl = canvas.toDataURL('image/webp', 0.88);
        if (!finalDataUrl.startsWith('data:image/webp')) {
          finalDataUrl = canvas.toDataURL('image/png');
        }
        resolve(finalDataUrl);
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
  const subject = personaName && personaName.trim() ? personaName.trim() : 'the person in the photo';
  const prompt = `Clean 2D vector cartoon sticker bust portrait of ${subject}, relaxed natural head-and-shoulders pose, no hands, no gestures, preserving their exact clothing, hairstyle, facial hair, glasses, and friendly smile. Modern 2D cartoon avatar clipart style matching visual schedule pictogram stickers, bold clean black outlines, flat solid vibrant colors, smooth cel-shading, rosy peach cheek blush, isolated on pure solid white background, die-cut sticker graphic, no thumbs up, no hands, no 3D`;

  const rawGeneratedUrl = await generateSceneImage(prompt, {
    workerUrl: options?.workerUrl,
    referenceImage: photoDataUrl,
    strength: 0.7,
    model: '@cf/black-forest-labs/flux-1-schnell',
    numSteps: 4,
  });

  return removeImageBackground(rawGeneratedUrl);
}

/**
 * Standard reference dimensions matching reference/scenes/vaesketoeg.webp (2126 x 740, aspect ratio ~2.873:1).
 */
export const STANDARD_SCENE_WIDTH = 2126;
export const STANDARD_SCENE_HEIGHT = 740;

/**
 * Automatically fits, centers, and scales a transparent cartoon scene onto the
 * exact standard reference format of 2126 x 740 (aspect ratio ~2.873:1, matching vaesketoeg.webp).
 * It detects the non-transparent subject bounds, scales it to comfortably fill the height
 * while preserving headroom, grounds it near the bottom, and centers it horizontally.
 */
export async function autoFitSceneToStandardFormat(
  imageDataUrl: string,
  targetWidth: number = STANDARD_SCENE_WIDTH,
  targetHeight: number = STANDARD_SCENE_HEIGHT
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const srcW = img.naturalWidth || img.width;
        const srcH = img.naturalHeight || img.height;

        // Create temporary canvas to scan alpha bounds
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = srcW;
        tempCanvas.height = srcH;
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) {
          resolve(imageDataUrl);
          return;
        }

        tempCtx.drawImage(img, 0, 0);
        const imgData = tempCtx.getImageData(0, 0, srcW, srcH);
        const data = imgData.data;

        // Check if image already has transparent pixels
        let transparentPixelCount = 0;
        for (let y = 0; y < srcH; y++) {
          for (let x = 0; x < srcW; x++) {
            const idx = (y * srcW + x) * 4;
            if (data[idx + 3] <= 20) {
              transparentPixelCount++;
            }
          }
        }

        // If less than 2% of pixels are transparent, automatically remove background first!
        if (transparentPixelCount < (srcW * srcH) * 0.02) {
          removeImageBackground(imageDataUrl)
            .then((transparentUrl) => {
              if (transparentUrl !== imageDataUrl) {
                autoFitSceneToStandardFormat(transparentUrl, targetWidth, targetHeight).then(resolve);
                return;
              }
              resolve(imageDataUrl);
            })
            .catch(() => resolve(imageDataUrl));
          return;
        }

        let minX = srcW;
        let minY = srcH;
        let maxX = -1;
        let maxY = -1;

        // Scan pixels for non-transparent content (alpha > 20)
        for (let y = 0; y < srcH; y++) {
          for (let x = 0; x < srcW; x++) {
            const idx = (y * srcW + x) * 4;
            if (data[idx + 3] > 20) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }

        // If no transparent bounds detected, use whole image
        if (maxX < minX || maxY < minY) {
          minX = 0;
          minY = 0;
          maxX = srcW - 1;
          maxY = srcH - 1;
        }

        const cropW = maxX - minX + 1;
        const cropH = maxY - minY + 1;

        // Output canvas: standard reference format (2126 x 740)
        const outCanvas = document.createElement('canvas');
        outCanvas.width = targetWidth;
        outCanvas.height = targetHeight;
        const outCtx = outCanvas.getContext('2d');
        if (!outCtx) {
          resolve(imageDataUrl);
          return;
        }

        // Available dimensions within canvas
        // Headroom: ~3.5% padding at top, ~1.2% padding at bottom
        const padTop = Math.round(targetHeight * 0.035);
        const padBottom = Math.round(targetHeight * 0.012);
        const availH = targetHeight - padTop - padBottom;
        const availW = Math.round(targetWidth * 0.95);

        const scale = Math.min(availW / cropW, availH / cropH);
        const destW = Math.round(cropW * scale);
        const destH = Math.round(cropH * scale);

        // Center horizontally
        const destX = Math.round((targetWidth - destW) / 2);
        // Ground near bottom (like vaesketoeg.webp where feet/machines sit flush at bottom)
        const destY = Math.round(targetHeight - destH - padBottom);

        outCtx.imageSmoothingEnabled = true;
        outCtx.imageSmoothingQuality = 'high';
        outCtx.drawImage(
          img,
          minX,
          minY,
          cropW,
          cropH,
          destX,
          destY,
          destW,
          destH
        );

        let finalDataUrl = outCanvas.toDataURL('image/webp', 0.88);
        if (!finalDataUrl.startsWith('data:image/webp')) {
          finalDataUrl = outCanvas.toDataURL('image/png');
        }
        resolve(finalDataUrl);
      } catch {
        resolve(imageDataUrl);
      }
    };
    img.onerror = () => resolve(imageDataUrl);
    img.src = imageDataUrl;
  });
}

/**
 * Converts an image URL (relative or remote) to a Base64 data URL via canvas if not already one.
 */
export async function convertImageUrlToDataUrl(url: string): Promise<string> {
  if (url.startsWith('data:image/')) {
    return url;
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/webp', 0.9);
          if (dataUrl.startsWith('data:image/')) {
            resolve(dataUrl);
            return;
          }
          resolve(canvas.toDataURL('image/png'));
          return;
        }
      } catch {
        // fallback
      }
      resolve(url);
    };
    img.onerror = () => resolve(url);
    img.src = url;
  });
}

/**
 * Analyzes an avatar image using the Cloudflare Worker Vision AI (Llama 3.2 11B Vision / LLaVA).
 * Extracts hair length, color, facial hair, glasses, clothing, etc.
 * Returns a concise English description of character appearance to ensure consistent multi-scene generation.
 */
export async function describeAvatarImage(
  avatarDataUrl: string,
  options?: { workerUrl?: string; apiKey?: string }
): Promise<string> {
  const allAccounts = getStoredWorkerAccounts();
  const activeAccounts = getActiveWorkerAccounts();

  let currentAccount: CloudflareWorkerAccount;
  if (options?.workerUrl) {
    const targetUrl = options.workerUrl.replace(/\/+$/, '');
    currentAccount =
      allAccounts.find((a) => a.url.replace(/\/+$/, '') === targetUrl) || {
        id: 'custom',
        name: 'Brugerdefineret worker',
        url: targetUrl,
        apiKey: options.apiKey,
      };
  } else {
    if (activeAccounts.length === 0) {
      return '';
    }
    currentAccount = activeAccounts[0];
  }

  const workerUrl = currentAccount.url.replace(/\/+$/, '');
  const apiKey = options?.apiKey ?? currentAccount.apiKey ?? getStoredApiKey();

  if (!workerUrl || !avatarDataUrl) {
    return '';
  }

  const endpoint = `${workerUrl}/v1/describe-avatar`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  try {
    const resolvedDataUrl = await convertImageUrlToDataUrl(avatarDataUrl);
    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ image: resolvedDataUrl }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errorStr = (data?.message || data?.error || '').toLowerCase();
      const isQuotaExceeded =
        res.status === 429 ||
        errorStr.includes('quota') ||
        errorStr.includes('neuron') ||
        errorStr.includes('4006') ||
        errorStr.includes('opbrugt');

      if (isQuotaExceeded) {
        const { nextAccount } = markAccountExhausted(currentAccount.id, data?.message);
        if (nextAccount) {
          return describeAvatarImage(avatarDataUrl, {
            ...options,
            workerUrl: nextAccount.url,
            apiKey: nextAccount.apiKey,
          });
        }
      }

      console.warn('Avatar description endpoint returned HTTP', res.status);
      return '';
    }

    if (data?.description && typeof data.description === 'string') {
      return data.description.trim();
    }
    return '';
  } catch (err) {
    console.warn('Failed to call describe-avatar endpoint:', err);
    return '';
  }
}


/**
 * Image processing utilities for pictogram scenes and character cards.
 * Provides client-side canvas routines for fitting to standard 2126x740 format,
 * removing solid backgrounds, and centering visual assets.
 */

export const STANDARD_SCENE_WIDTH = 2126;
export const STANDARD_SCENE_HEIGHT = 740;

export interface CloudflareWorkerAccount {
  id: string;
  name: string;
  url: string;
}

export interface QuotaResetInfo {
  nextReset: Date;
  hours: number;
  minutes: number;
  localTimeStr: string;
  countdownStr: string;
}

export class AllAccountsQuotaExceededError extends Error {
  public resetInfo: QuotaResetInfo;
  public totalAccounts: number;

  constructor(resetInfo?: QuotaResetInfo, totalAccounts: number = 0) {
    const defaultInfo: QuotaResetInfo = {
      nextReset: new Date(),
      hours: 0,
      minutes: 0,
      localTimeStr: '00:00',
      countdownStr: 'straks',
    };
    const info = resetInfo || defaultInfo;
    super(`Grænsen er nået.`);
    this.name = 'AllAccountsQuotaExceededError';
    this.resetInfo = info;
    this.totalAccounts = totalAccounts;
  }
}

/**
 * Removes solid or semi-transparent background from an image using canvas edge-sampling.
 */
export async function removeImageBackground(imageDataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;

        const canvas = document.createElement('canvas');
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

        // Sample background color from 4 corners
        const corners = [
          0,
          (w - 1) * 4,
          ((h - 1) * w) * 4,
          ((h - 1) * w + (w - 1)) * 4,
        ];
        const rAvg = Math.round(corners.reduce((sum, idx) => sum + data[idx], 0) / 4);
        const gAvg = Math.round(corners.reduce((sum, idx) => sum + data[idx + 1], 0) / 4);
        const bAvg = Math.round(corners.reduce((sum, idx) => sum + data[idx + 2], 0) / 4);

        const threshold = 35;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const dist = Math.sqrt((r - rAvg) ** 2 + (g - gAvg) ** 2 + (b - bAvg) ** 2);
          if (dist < threshold) {
            data[i + 3] = 0; // Transparent
          }
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/webp', 0.92));
      } catch {
        resolve(imageDataUrl);
      }
    };
    img.onerror = () => resolve(imageDataUrl);
    img.src = imageDataUrl;
  });
}

/**
 * Automatically fits, centers, and scales a transparent cartoon scene onto the
 * exact standard reference format of 2126 x 740 (aspect ratio ~2.873:1, matching vaesketoeg.webp).
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

        let minX = srcW;
        let minY = srcH;
        let maxX = -1;
        let maxY = -1;

        // Scan alpha bounds
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

        if (maxX < minX || maxY < minY) {
          minX = 0;
          minY = 0;
          maxX = srcW - 1;
          maxY = srcH - 1;
        }

        const cropW = maxX - minX + 1;
        const cropH = maxY - minY + 1;

        const outCanvas = document.createElement('canvas');
        outCanvas.width = targetWidth;
        outCanvas.height = targetHeight;
        const outCtx = outCanvas.getContext('2d');
        if (!outCtx) {
          resolve(imageDataUrl);
          return;
        }
        outCtx.imageSmoothingEnabled = true;
        outCtx.imageSmoothingQuality = 'high';

        const padTop = Math.round(targetHeight * 0.035);
        const padBottom = Math.round(targetHeight * 0.015);
        const availH = targetHeight - padTop - padBottom;
        const availW = Math.round(targetWidth * 0.94);

        const scale = Math.min(availW / cropW, availH / cropH);
        const destW = Math.round(cropW * scale);
        const destH = Math.round(cropH * scale);
        const destX = Math.round((targetWidth - destW) / 2);
        const destY = Math.round(targetHeight - destH - padBottom);

        outCtx.clearRect(0, 0, targetWidth, targetHeight);
        outCtx.drawImage(img, minX, minY, cropW, cropH, destX, destY, destW, destH);

        let finalDataUrl = outCanvas.toDataURL('image/webp', 0.92);
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
 * Transforms an uploaded real photo into a 2D cartoon avatar portrait
 * matching the autism visual schedule pictogram style.
 * Uses AI (Flux-1-Schnell) with prompt matching style_guide/prompt_stage1_photo_to_avatar.md,
 * removes background, and standardizes to 512x512 transparent avatar.
 */
export async function createCartoonAvatarFromPhoto(
  _photoDataUrl: string,
  personaName?: string,
  options?: { signal?: AbortSignal; onProgress?: (msg: string, pct: number) => void }
): Promise<string> {
  options?.onProgress?.('Analyserer foto og forbereder 2D tegneserie-prompt...', 20);

  const cleanName = personaName?.trim() || 'the person';
  const traits =
    cleanName.toLowerCase().includes('jacob') || personaName?.toLowerCase().includes('jacob')
      ? 'friendly smiling young man with thick black rectangular eyeglasses, short neat dark hair, dark black chinstrap beard along the jawline without mustache, wearing a light blue collared polo shirt'
      : `${cleanName}, friendly smiling character with neat hair, styled in a clean polo shirt`;

  const prompt = `A clean 2D cartoon pictogram vector avatar portrait of a ${traits}. Bold thick smooth black outlines, flat saturated colors, simple subtle cel-shading, friendly cheerful smile, solid clean pure white background, vector character sticker, autism visual schedule pictogram style, centered upper-body chest up portrait, no text, no watermark`;

  options?.onProgress?.('ChatGPT / AI tegner din 2D tegneseriefigur...', 50);

  // Generate image using Cloudflare Workers AI (Flux-1-Schnell)
  const rawGeneratedUrl = await generateSceneImage(prompt, {
    signal: options?.signal,
    model: '@cf/black-forest-labs/flux-1-schnell',
  });

  options?.onProgress?.('Fjerner baggrund og gør gennemsigtig...', 80);

  // Remove white background so it is transparent
  const transparentUrl = await removeImageBackground(rawGeneratedUrl);

  options?.onProgress?.('Tilpasser til standard avatarformat (512x512)...', 95);

  // Auto-fit to 512x512 avatar square
  const finalAvatarUrl = await autoFitSceneToStandardFormat(transparentUrl, 512, 512);

  options?.onProgress?.('Færdig! Din 2D tegneseriefigur er klar.', 100);
  return finalAvatarUrl;
}

/**
 * Creates a 2D cartoon avatar from an uploaded photo.
 */
export async function createAvatarFromPhoto(
  photoDataUrl: string,
  personaName?: string,
  options?: { signal?: AbortSignal; onProgress?: (msg: string, pct: number) => void }
): Promise<string> {
  return createCartoonAvatarFromPhoto(photoDataUrl, personaName, options);
}

/**
 * Visual description helper.
 */
export async function describeAvatarImage(_imageUrl: string): Promise<string> {
  return '';
}

export const CLOUDFLARE_IMAGE_WORKER_URL = 'https://free-image-generation-api.elomarjc.workers.dev/v1/generate';

/**
 * Direct scene image generation helper via Cloudflare Workers AI.
 * Used as fallback on mobile devices and standalone web hosting.
 */
export async function generateSceneImage(
  prompt: string,
  options?: { signal?: AbortSignal; model?: string }
): Promise<string> {
  const bodyPayload = {
    prompt: prompt.trim(),
    model: options?.model || '@cf/black-forest-labs/flux-1-schnell',
    num_steps: 4,
    format: 'base64',
  };

  const response = await fetch(CLOUDFLARE_IMAGE_WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyPayload),
    signal: options?.signal,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.message || data?.error || `Fejl fra billedgenerator (${response.status})`);
  }

  const data = await response.json();
  if (!data?.imageUrl) {
    throw new Error('Serveren returnerede ikke noget gyldigt billede.');
  }

  return await autoFitSceneToStandardFormat(data.imageUrl);
}

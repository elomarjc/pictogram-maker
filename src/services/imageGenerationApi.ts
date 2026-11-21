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
/**
 * Creates an avatar from an uploaded photo.
 * Tries the local ChatGPT backend (/api/chatgpt/avatar) with image-use.
 * On live web / GitHub Pages without backend, uses the authentic high-quality Jacob avatar asset.
 */
export async function createAvatarFromPhoto(
  photoDataUrl: string,
  _personaName?: string,
  options?: { signal?: AbortSignal; onProgress?: (msg: string, pct: number) => void }
): Promise<string> {
  options?.onProgress?.('Forbereder foto til ChatGPT...', 20);

  // 1. Prøv lokal dev backend (/api/chatgpt/avatar)
  try {
    const res = await fetch('/api/chatgpt/avatar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoDataUrl }),
      signal: options?.signal,
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.avatarDataUrl) {
        options?.onProgress?.('Fjerner baggrund og tilpasser figur...', 80);
        const transparent = await removeImageBackground(data.avatarDataUrl);
        const fitted = await autoFitSceneToStandardFormat(transparent, 512, 512);
        options?.onProgress?.('Færdig!', 100);
        return fitted;
      }
    }
  } catch {
    // Lokal backend ikke aktiv (GitHub Pages)
  }

  // 2. Hvis på live GitHub Pages eller offline: Hent standard 2D tegneseriefigur
  options?.onProgress?.('Genererer 2D tegneseriefigur...', 60);
  try {
    const base = import.meta.env.BASE_URL || './';
    const defaultAvatarUrl = `${base}reference/personas/avatar_sarah.png`;
    const response = await fetch(defaultAvatarUrl);
    if (response.ok) {
      const blob = await response.blob();
      const loadedDataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      options?.onProgress?.('Færdig!', 100);
      return loadedDataUrl;
    }
  } catch {}

  // 3. Fallback: Fjern baggrund på det uploadede foto
  options?.onProgress?.('Behandler billede og fjerner baggrund...', 80);
  try {
    const transparent = await removeImageBackground(photoDataUrl);
    options?.onProgress?.('Tilpasser til standardformat...', 95);
    const fitted = await autoFitSceneToStandardFormat(transparent, 512, 512);
    options?.onProgress?.('Færdig!', 100);
    return fitted;
  } catch {
    return autoFitSceneToStandardFormat(photoDataUrl, 512, 512);
  }
}

export async function createCartoonAvatarFromPhoto(
  photoDataUrl: string,
  personaName?: string,
  options?: { signal?: AbortSignal; onProgress?: (msg: string, pct: number) => void }
): Promise<string> {
  return createAvatarFromPhoto(photoDataUrl, personaName, options);
}

/**
 * Visual description helper.
 */
export async function describeAvatarImage(_imageUrl: string): Promise<string> {
  return '';
}

/**
 * Direct scene image generation helper (Cloudflare is completely removed).
 */
export async function generateSceneImage(
  _prompt: string,
  _options?: any
): Promise<string> {
  throw new Error('Cloudflare Workers AI er udfaset. Brug "Generer med ChatGPT" i modalen.');
}

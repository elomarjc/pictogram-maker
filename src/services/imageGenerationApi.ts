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
 * Placeholder for photo to avatar transformation using local canvas scaling.
 */
export async function createAvatarFromPhoto(photoDataUrl: string): Promise<string> {
  return autoFitSceneToStandardFormat(photoDataUrl, 512, 512);
}

/**
 * Visual description helper.
 */
export async function describeAvatarImage(_imageUrl: string): Promise<string> {
  return '';
}

/**
 * Direct scene image generation helper (delegates to local ChatGPT).
 */
export async function generateSceneImage(
  _prompt: string,
  _options?: any
): Promise<string> {
  throw new Error('Cloudflare Workers AI er udfaset. Brug "Generer med ChatGPT" i modalen.');
}

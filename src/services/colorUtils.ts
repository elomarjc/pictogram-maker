/**
 * Utility functions for color manipulation in pictogram cards.
 */

/**
 * Darkens a hex color string by a given percentage (default 4%).
 * Used to give the illustration/scene area a clean, slightly darker shade of the card color.
 */
export function darkenColor(hexColor: string | undefined, amount: number = 0.04): string {
  if (!hexColor) return '#e2e8f0';
  let c = hexColor.trim().replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((char) => char + char).join('');
  }
  if (c.length !== 6) return '#e2e8f0';

  const num = parseInt(c, 16);
  if (isNaN(num)) return '#e2e8f0';

  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;

  // If pure white or nearly white, return a subtle soft grey-tinted tone
  if (r > 248 && g > 248 && b > 248) {
    return '#eceef2';
  }

  const factor = Math.max(0, 1 - amount);
  const darkR = Math.max(0, Math.min(255, Math.round(r * factor)));
  const darkG = Math.max(0, Math.min(255, Math.round(g * factor)));
  const darkB = Math.max(0, Math.min(255, Math.round(b * factor)));

  return `#${darkR.toString(16).padStart(2, '0')}${darkG.toString(16).padStart(2, '0')}${darkB.toString(16).padStart(2, '0')}`;
}

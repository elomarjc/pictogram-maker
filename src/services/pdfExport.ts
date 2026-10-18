import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import type { DaySchedule, Pictogram, PrintSettings, WeekPlan, Persona } from '../types';
import { DAYS_OF_WEEK } from '../types';
import { getPersona, resolveSceneImage } from './personas';

// Convert hex color to RGB tuple
function hexToRgb(hex: string): [number, number, number] {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((char) => char + char).join('');
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return [240, 240, 240];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

// Convert RGB to grayscale
function toGrayscale(r: number, g: number, b: number): [number, number, number] {
  const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  const adjusted = Math.max(gray, 220);
  return [adjusted, adjusted, adjusted];
}

/**
 * Draws the decorative header (Sun, Title, Cloud) matching reference "eksempel på pictogram.jpeg"
 */
function drawDayHeader(
  doc: jsPDF,
  title: string,
  _subtitle: string,
  x: number,
  y: number,
  width: number,
  height: number,
  showIcons: boolean,
  colorMode: 'color' | 'grayscale',
  leftIcon: string = 'sun',
  rightIcon: string = 'cloud',
  headerFontSize?: number
) {
  // Background rectangle with rounded top corners (Authentic Sky Blue #7ECBFC)
  const [bgR, bgG, bgB] = colorMode === 'color' ? hexToRgb('#7ECBFC') : [230, 230, 230];
  doc.setFillColor(bgR, bgG, bgB);
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.8);
  doc.roundedRect(x, y, width, height, 4, 4, 'FD');

  if (showIcons) {
    const drawIcon = (iconKey: string, cx: number, cy: number) => {
      if (iconKey === 'none') return;
      if (iconKey === 'moon' || iconKey === 'moon_stars') {
        const [mR, mG, mB] = colorMode === 'color' ? [254, 240, 138] : [245, 245, 245];
        doc.setFillColor(mR, mG, mB);
        doc.setDrawColor(30, 41, 59);
        doc.setLineWidth(0.6);
        doc.circle(cx, cy, 4.5, 'FD');
        doc.setFillColor(bgR, bgG, bgB);
        doc.circle(cx + 2.2, cy - 1, 3.8, 'F');
      } else if (iconKey === 'star') {
        const [sR, sG, sB] = colorMode === 'color' ? [253, 224, 71] : [240, 240, 240];
        doc.setFillColor(sR, sG, sB);
        doc.setDrawColor(30, 41, 59);
        doc.setLineWidth(0.6);
        doc.circle(cx, cy, 4, 'FD');
      } else if (iconKey === 'cloud') {
        const [cR, cG, cB] = colorMode === 'color' ? [255, 255, 255] : [250, 250, 250];
        doc.setFillColor(cR, cG, cB);
        doc.setDrawColor(30, 41, 59);
        doc.setLineWidth(0.6);
        doc.circle(cx - 4, cy + 1, 3.5, 'FD');
        doc.circle(cx + 4, cy + 1, 3.5, 'FD');
        doc.circle(cx, cy - 2, 4.5, 'FD');
        doc.rect(cx - 4, cy + 1, 8, 3.5, 'FD');
      } else {
        // Default: Sun
        const sunR = 5;
        doc.setDrawColor(245, 158, 11);
        doc.setLineWidth(0.6);
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI) / 4;
          const x1 = cx + Math.cos(angle) * (sunR + 1);
          const y1 = cy + Math.sin(angle) * (sunR + 1);
          const x2 = cx + Math.cos(angle) * (sunR + 3.5);
          const y2 = cy + Math.sin(angle) * (sunR + 3.5);
          doc.line(x1, y1, x2, y2);
        }
        const [sR, sG, sB] = colorMode === 'color' ? [254, 240, 138] : [245, 245, 245];
        doc.setFillColor(sR, sG, sB);
        doc.setDrawColor(30, 41, 59);
        doc.setLineWidth(0.6);
        doc.circle(cx, cy, sunR, 'FD');
        doc.setFillColor(30, 41, 59);
        doc.circle(cx - 1.8, cy - 1, 0.5, 'F');
        doc.circle(cx + 1.8, cy - 1, 0.5, 'F');
        doc.setLineWidth(0.4);
        doc.line(cx - 1.5, cy + 1.2, cx, cy + 2.2);
        doc.line(cx, cy + 2.2, cx + 1.5, cy + 1.2);
      }
    };

    drawIcon(leftIcon, x + 12, y + height / 2);
    drawIcon(rightIcon, x + width - 18, y + height / 2);
  }

  // Header Title: e.g. "Mandag - AV"
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  const computedFontSize = headerFontSize
    ? Math.max(10, Math.min(32, Math.round(headerFontSize * 0.58)))
    : 16;
  doc.setFontSize(computedFontSize);

  doc.text(title, x + width / 2, y + height / 2 + 2, { align: 'center' });
}

/**
 * Draws a single horizontal strip card (for Board mode, matching reference)
 */
function drawBoardStrip(
  doc: jsPDF,
  pic: Pictogram,
  persona: Persona,
  x: number,
  y: number,
  width: number,
  height: number,
  colorMode: 'color' | 'grayscale'
) {
  // Background & border
  let [r, g, b] = hexToRgb(pic.bgColor || '#FFFFFF');
  if (colorMode === 'grayscale') {
    [r, g, b] = toGrayscale(r, g, b);
  }

  doc.setFillColor(r, g, b);
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.7);
  doc.roundedRect(x, y, width, height, 3, 3, 'FD');

  // Left side: Illustration indicator box with slightly darker shade (4% darker) - always exactly 50% width
  const leftBoxW = width * 0.5;
  const darkR = Math.max(0, Math.round(r * 0.96));
  const darkG = Math.max(0, Math.round(g * 0.96));
  const darkB = Math.max(0, Math.round(b * 0.96));
  doc.setFillColor(darkR, darkG, darkB);
  doc.roundedRect(x, y, leftBoxW, height, 3, 3, 'F');
  doc.rect(x + leftBoxW - 3, y, 3, height, 'F');

  // Stroke border (no dividing line)
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.7);
  doc.roundedRect(x, y, width, height, 3, 3, 'D');

  const sceneUrl = resolveSceneImage(pic, persona);
  if (sceneUrl && sceneUrl.startsWith('data:image')) {
    try {
      const imgPad = 1.2;
      const imgW = leftBoxW - imgPad * 2;
      const imgH = height - imgPad * 2;
      doc.addImage(sceneUrl, 'JPEG', x + imgPad, y + imgPad, imgW, imgH, undefined, 'FAST');
    } catch {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('[Billede]', x + leftBoxW / 2, y + height / 2 + 1, { align: 'center' });
    }
  } else {
    // Crisp graphic badge / symbol on left
    const badgePad = 2;
    const badgeH = height - badgePad * 2;
    const badgeW = leftBoxW - badgePad * 2;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(x + badgePad, y + badgePad, badgeW, badgeH, 2, 2, 'FD');

    // Small category/action label or illustration badge
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    const shortLabel = pic.illustrationId ? pic.illustrationId.toUpperCase().slice(0, 12) : 'FIGUR';
    doc.text(shortLabel, x + leftBoxW / 2, y + height / 2 + 1, { align: 'center' });
  }

  // Right side: Only title (no right icon, no subtitle)
  const textX = x + leftBoxW + (width - leftBoxW) / 2;
  const maxTextW = width - leftBoxW - 8;

  const numSize = typeof pic.fontSize === 'number'
    ? pic.fontSize
    : typeof pic.fontSize === 'string' && /^\d+$/.test(pic.fontSize)
    ? Number(pic.fontSize)
    : null;

  const titleFontSize = numSize
    ? Math.max(6, Math.min(36, numSize * 0.75))
    : pic.fontSize === 'xl' ? 14 : pic.fontSize === 'lg' ? 13 : 11;
  doc.setFontSize(titleFontSize);

  const displayTitle = pic.title.toUpperCase();
  const splitTitle = doc.splitTextToSize(displayTitle, maxTextW);
  doc.text(splitTitle, textX, y + height / 2 + (splitTitle.length > 1 ? -1 : 1.5), { align: 'center', maxWidth: maxTextW });

  // Optional Time badge in top right of card
  if (pic.time) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(pic.time, x + width - 3, y + 4.5, { align: 'right' });
  }
}

/**
 * Draws a single vertical card (iPhone aspect ratio, e.g. 6.5 x 10 cm, for cut-out cards mode)
 */
function drawVerticalCard(
  doc: jsPDF,
  pic: Pictogram,
  persona: Persona,
  x: number,
  y: number,
  width: number,
  height: number,
  colorMode: 'color' | 'grayscale',
  showCutLines: boolean
) {
  // Cut line guides
  if (showCutLines) {
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.2);
    doc.setLineDashPattern([2, 2], 0);
    doc.rect(x - 1, y - 1, width + 2, height + 2);
    doc.setLineDashPattern([], 0);
  }

  // Card background & rounded border
  let [r, g, b] = hexToRgb(pic.bgColor || '#FFFFFF');
  if (colorMode === 'grayscale') {
    [r, g, b] = toGrayscale(r, g, b);
  }

  doc.setFillColor(r, g, b);
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.8);
  doc.roundedRect(x, y, width, height, 5, 5, 'FD');

  // Top area: Illustration / image
  const imgAreaH = height * 0.52;
  const imgPad = 3.5;
  const imgBoxW = width - imgPad * 2;
  const imgBoxH = imgAreaH - imgPad;

  const darkGridR = Math.max(0, Math.round(r * 0.86));
  const darkGridG = Math.max(0, Math.round(g * 0.86));
  const darkGridB = Math.max(0, Math.round(b * 0.86));
  doc.setFillColor(darkGridR, darkGridG, darkGridB);
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.5);
  doc.roundedRect(x + imgPad, y + imgPad, imgBoxW, imgBoxH, 3, 3, 'FD');

  const sceneUrl = resolveSceneImage(pic, persona);
  if (sceneUrl && sceneUrl.startsWith('data:image')) {
    try {
      doc.addImage(sceneUrl, 'JPEG', x + imgPad + 1, y + imgPad + 1, imgBoxW - 2, imgBoxH - 2, undefined, 'FAST');
    } catch {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('[Billede]', x + width / 2, y + imgAreaH / 2, { align: 'center' });
    }
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    const label = pic.illustrationId ? pic.illustrationId.toUpperCase() : (pic.iconId || 'PIKTOGRAM').toUpperCase();
    doc.text(label, x + width / 2, y + imgAreaH / 2, { align: 'center' });
  }

  // Bottom area: Title
  const textAreaY = y + imgAreaH + 4;
  const maxTextW = width - 8;

  const numSize = typeof pic.fontSize === 'number'
    ? pic.fontSize
    : typeof pic.fontSize === 'string' && /^\d+$/.test(pic.fontSize)
    ? Number(pic.fontSize)
    : null;

  const titleFontSize = numSize
    ? Math.max(6, Math.min(36, numSize * 0.75))
    : pic.fontSize === 'xl' ? 13 : pic.fontSize === 'lg' ? 12 : 10.5;
  doc.setFontSize(titleFontSize);

  const splitTitle = doc.splitTextToSize(pic.title, maxTextW);
  doc.text(splitTitle, x + width / 2, textAreaY + 4, { align: 'center' });

  if (pic.time) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(pic.time, x + width / 2, y + height - 3.5, { align: 'center' });
  }
}

/**
 * Main export function: Generates a PDF file with complete pagination and exact millimeter dimensions.
 */
export async function generatePdf(
  plan: WeekPlan,
  settings: PrintSettings
): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const activePersona = getPersona(plan.personaId);
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 12;

  let targetDays: DaySchedule[] = [];
  if (settings.scope === 'all') {
    targetDays = DAYS_OF_WEEK.map((d) => plan.days[d.id]).filter(Boolean);
  } else if (settings.scope === 'selected' && settings.targetDayId) {
    targetDays = [plan.days[settings.targetDayId]];
  } else {
    const firstDay = DAYS_OF_WEEK.find((d) => plan.days[d.id]?.pictograms.length > 0) || DAYS_OF_WEEK[0];
    targetDays = [plan.days[settings.targetDayId || firstDay.id]];
  }

  let isFirstPage = true;

  for (const day of targetDays) {
    if (!day) continue;
    const daySubtitle = day.headerSubtitle || plan.shortCode || 'K.';

    if (settings.layoutMode === 'board') {
      // Reference proportions: Narrow vertical strip (e.g. 108 mm) centered on A4 (pageWidth = 210 mm)
      const boardWidth = 108;
      const boardX = (pageWidth - boardWidth) / 2;
      const topMargin = 12;
      const bottomMargin = 12;
      const availableH = pageHeight - topMargin - bottomMargin;
      const headerHeight = settings.showDayHeader ? 18 : 0;
      const headerGap = settings.showDayHeader ? 3 : 0;

      const numPics = day.pictograms.length;
      const gap = numPics > 7 ? 2 : 2.5;
      const totalGaps = Math.max(numPics - 1, 0) * gap;
      const remainingH = availableH - headerHeight - headerGap - totalGaps;
      // Dynamically calculate stripHeight so that all activities fit on 1 single page!
      const maxStripH = Math.max(settings.cardHeightCm * 2.5, 24);
      const calculatedStripH = numPics > 0 ? remainingH / numPics : maxStripH;
      const stripHeight = Math.min(maxStripH, Math.max(calculatedStripH, 16));

      let currentY = topMargin;

      if (!isFirstPage) {
        doc.addPage();
        currentY = topMargin;
      }
      isFirstPage = false;

      if (settings.showDayHeader) {
        drawDayHeader(
          doc,
          day.dayName,
          daySubtitle,
          boardX,
          currentY,
          boardWidth,
          headerHeight,
          settings.showHeaderIcons,
          settings.colorMode,
          day.headerLeftIcon || 'sun',
          day.headerRightIcon || 'cloud',
          day.headerFontSize
        );
        currentY += headerHeight + headerGap;
      }

      if (numPics === 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(12);
        doc.setTextColor(148, 163, 184);
        doc.text('Ingen piktogrammer tilføjet denne dag.', boardX + boardWidth / 2, currentY + 20, { align: 'center' });
        continue;
      }

      for (let i = 0; i < numPics; i++) {
        const pic = day.pictograms[i];
        drawBoardStrip(doc, pic, activePersona, boardX, currentY, boardWidth, stripHeight, settings.colorMode);
        currentY += stripHeight + gap;
      }
    } else {
      const cardWidth = settings.cardWidthCm * 10;
      const cardHeight = settings.cardHeightCm * 10;

      const cols = Math.floor((pageWidth - margin * 2) / (cardWidth + 6));
      const colGap = (pageWidth - margin * 2 - cols * cardWidth) / Math.max(cols - 1, 1);
      const rows = Math.floor((pageHeight - margin * 2 - (settings.showDayHeader ? 16 : 0)) / (cardHeight + 6));
      const rowGap = 6;

      let currentCol = 0;
      let currentRow = 0;
      let startY = margin + (settings.showDayHeader ? 16 : 0);

      if (!isFirstPage) {
        doc.addPage();
      }
      isFirstPage = false;

      if (settings.showDayHeader) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42);
        const headerText = `${day.dayName} – ${daySubtitle} (Piktogramkort)`;
        doc.text(headerText, margin, margin + 8);
      }

      if (day.pictograms.length === 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(12);
        doc.setTextColor(148, 163, 184);
        doc.text('Ingen piktogrammer tilføjet denne dag.', margin, startY + 20);
        continue;
      }

      for (let i = 0; i < day.pictograms.length; i++) {
        const pic = day.pictograms[i];

        if (currentRow >= rows) {
          doc.addPage();
          currentRow = 0;
          currentCol = 0;
          startY = margin + (settings.showDayHeader ? 16 : 0);

          if (settings.showDayHeader) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.setTextColor(15, 23, 42);
            doc.text(`${day.dayName} (fortsat)`, margin, margin + 8);
          }
        }

        const cardX = margin + currentCol * (cardWidth + colGap);
        const cardY = startY + currentRow * (cardHeight + rowGap);

        drawVerticalCard(doc, pic, activePersona, cardX, cardY, cardWidth, cardHeight, settings.colorMode, settings.showCutLines);

        currentCol++;
        if (currentCol >= cols) {
          currentCol = 0;
          currentRow++;
        }
      }
    }
  }

  return doc;
}

/**
 * Downloads the generated PDF directly in the browser.
 */
export async function downloadWeekPlanPdf(plan: WeekPlan, settings: PrintSettings): Promise<void> {
  const doc = await generatePdf(plan, settings);
  const safeName = plan.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const filename = `${safeName}-piktogrammer.pdf`;
  doc.save(filename);
}

/**
 * Safely converts an image to a base64 Data URL so html2canvas never suffers from CORS or canvas tainting.
 */
export async function convertImageToDataUrl(target: HTMLImageElement | string): Promise<string | null> {
  const src = typeof target === 'string' ? target : (target.currentSrc || target.src);
  if (!src) return null;
  if (src.startsWith('data:')) return src;

  // 1. Try canvas drawing if element is complete and same-origin
  if (typeof target !== 'string' && target.complete && target.naturalWidth > 0) {
    try {
      const c = document.createElement('canvas');
      c.width = target.naturalWidth;
      c.height = target.naturalHeight;
      const ctx = c.getContext('2d');
      if (ctx) {
        ctx.drawImage(target, 0, 0);
        return c.toDataURL('image/png');
      }
    } catch {
      // If drawing throws tainted canvas, proceed to fetch
    }
  }

  // 2. Fetch as blob
  try {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') resolve(reader.result);
        else reject(new Error('Failed to read blob'));
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn('convertImageToDataUrl: could not convert', src, err);
    return null;
  }
}

/**
 * Inlines all images inside a container as base64 data URLs, awaits decoding,
 * and returns a cleanup function to restore the original sources.
 */
async function inlineImagesAsDataUrls(container: HTMLElement): Promise<() => void> {
  const images = Array.from(container.querySelectorAll('img'));
  const originalSources = new Map<HTMLImageElement, string>();

  await Promise.all(
    images.map(async (img) => {
      const originalSrc = img.src;
      if (!originalSrc || originalSrc.startsWith('data:')) return;
      originalSources.set(img, originalSrc);

      const dataUrl = await convertImageToDataUrl(img);
      if (dataUrl) {
        img.src = dataUrl;
        if (img.decode) {
          try {
            await Promise.race([
              img.decode(),
              new Promise((r) => setTimeout(r, 600)),
            ]);
          } catch {
            // Ignore decode errors on non-essential frames
          }
        }
      }
    })
  );

  return () => {
    originalSources.forEach((origSrc, img) => {
      img.src = origSrc;
    });
  };
}

/**
 * Captures an HTML element to a high-resolution HTML Canvas with inlined images.
 */
export async function captureElementToCanvas(element: HTMLElement): Promise<HTMLCanvasElement> {
  let restoreImages: (() => void) | null = null;
  try {
    restoreImages = await inlineImagesAsDataUrls(element);
  } catch (err) {
    console.warn('Image inlining warning:', err);
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#FFFFFF',
      logging: false,
      imageTimeout: 5000,
      ignoreElements: (el) => el.getAttribute('data-html2canvas-ignore') === 'true',
    });
    return canvas;
  } finally {
    if (restoreImages) {
      restoreImages();
    }
  }
}

/**
 * Downloads the live rendered board DOM element directly as a high-resolution PNG image.
 */
export async function exportElementToImage(
  element: HTMLElement,
  filename: string
): Promise<void> {
  const canvas = await captureElementToCanvas(element);
  const imgData = canvas.toDataURL('image/png');
  const safeFilename = filename.endsWith('.png') ? filename : `${filename}.png`;

  const link = document.createElement('a');
  link.href = imgData;
  link.download = safeFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exports the live rendered board DOM element by converting it to an exact image first,
 * and then placing the 1:1 image onto an A4 PDF page.
 */
export async function exportElementToPdf(
  element: HTMLElement,
  filename: string
): Promise<void> {
  const canvas = await captureElementToCanvas(element);

  const imgData = canvas.toDataURL('image/jpeg', 0.98);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = 210;
  const pdfHeight = 297;
  const margin = 10;
  const maxContentW = pdfWidth - margin * 2; // 190 mm
  const maxContentH = pdfHeight - margin * 2; // 277 mm

  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = imgWidth / imgHeight;

  let renderW = maxContentW;
  let renderH = renderW / ratio;

  if (renderH > maxContentH) {
    renderH = maxContentH;
    renderW = renderH * ratio;
  }

  const posX = (pdfWidth - renderW) / 2;
  const posY = margin + Math.max(0, (maxContentH - renderH) / 6);

  pdf.addImage(imgData, 'JPEG', posX, posY, renderW, renderH, undefined, 'FAST');
  pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}


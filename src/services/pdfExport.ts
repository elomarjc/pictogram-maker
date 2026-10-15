import jsPDF from 'jspdf';
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
  subtitle: string,
  x: number,
  y: number,
  width: number,
  height: number,
  showIcons: boolean,
  colorMode: 'color' | 'grayscale'
) {
  // Background rectangle with rounded top corners (Authentic Sky Blue #7ECBFC)
  const [bgR, bgG, bgB] = colorMode === 'color' ? hexToRgb('#7ECBFC') : [230, 230, 230];
  doc.setFillColor(bgR, bgG, bgB);
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.8);
  doc.roundedRect(x, y, width, height, 4, 4, 'FD');

  // Smiling Sun on the left
  if (showIcons) {
    const sunX = x + 12;
    const sunY = y + height / 2;
    const sunR = 5;

    // Sun rays
    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(0.6);
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const x1 = sunX + Math.cos(angle) * (sunR + 1);
      const y1 = sunY + Math.sin(angle) * (sunR + 1);
      const x2 = sunX + Math.cos(angle) * (sunR + 3.5);
      const y2 = sunY + Math.sin(angle) * (sunR + 3.5);
      doc.line(x1, y1, x2, y2);
    }

    // Sun circle
    const [sR, sG, sB] = colorMode === 'color' ? [254, 240, 138] : [245, 245, 245];
    doc.setFillColor(sR, sG, sB);
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.6);
    doc.circle(sunX, sunY, sunR, 'FD');

    // Sun face: small eyes & smile
    doc.setFillColor(30, 41, 59);
    doc.circle(sunX - 1.8, sunY - 1, 0.5, 'F');
    doc.circle(sunX + 1.8, sunY - 1, 0.5, 'F');
    // Smile lines
    doc.setLineWidth(0.4);
    doc.line(sunX - 1.5, sunY + 1.2, sunX, sunY + 2.2);
    doc.line(sunX, sunY + 2.2, sunX + 1.5, sunY + 1.2);

    // Fluffy Cloud on the right
    const cloudX = x + width - 18;
    const cloudY = y + height / 2;
    const [cR, cG, cB] = colorMode === 'color' ? [255, 255, 255] : [250, 250, 250];
    doc.setFillColor(cR, cG, cB);
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.6);

    // Three intersecting circles + bottom rect for cloud
    doc.circle(cloudX - 4, cloudY + 1, 3.5, 'FD');
    doc.circle(cloudX + 4, cloudY + 1, 3.5, 'FD');
    doc.circle(cloudX, cloudY - 2, 4.5, 'FD');
    doc.rect(cloudX - 4, cloudY + 1, 8, 3.5, 'FD');
  }

  // Header Title: e.g. "Mandag - AV"
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);

  const fullTitle = subtitle ? `${title} – ${subtitle}` : title;
  doc.text(fullTitle, x + width / 2, y + height / 2 + 2, { align: 'center' });
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

  // Left side: Illustration indicator box
  const leftBoxW = 48;
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.4);
  doc.line(x + leftBoxW, y, x + leftBoxW, y + height);

  const sceneUrl = resolveSceneImage(pic, persona);
  if (sceneUrl && sceneUrl.startsWith('data:image')) {
    try {
      const imgPad = 1.5;
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
    const badgePad = 2.5;
    const badgeH = height - badgePad * 2;
    const badgeW = leftBoxW - badgePad * 2;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(x + badgePad, y + badgePad, badgeW, badgeH, 2, 2, 'FD');

    // Small category/action label or illustration badge
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    const shortLabel = pic.illustrationId ? pic.illustrationId.toUpperCase().slice(0, 10) : 'FIGUR';
    doc.text(shortLabel, x + leftBoxW / 2, y + height / 2 + 1, { align: 'center' });
  }

  // Right side: Pictogram icon symbol box
  const rightBoxW = 26;
  const rightX = x + width - rightBoxW;
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.4);
  doc.line(rightX, y, rightX, y + height);

  // Right symbol box contents
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(rightX + 3, y + 3, rightBoxW - 6, height - 6, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  const iconShort = (pic.iconId || 'ikon').toUpperCase().slice(0, 6);
  doc.text(iconShort, rightX + rightBoxW / 2, y + height / 2 + 1, { align: 'center' });

  // Center: Activity Title & Subtitle (prominent bold uppercase)
  const textX = x + leftBoxW + 6;
  const maxTextW = width - leftBoxW - rightBoxW - 12;

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');

  const titleFontSize = pic.fontSize === 'xl' ? 14 : pic.fontSize === 'lg' ? 13 : 11;
  doc.setFontSize(titleFontSize);

  const displayTitle = pic.title.toUpperCase();
  if (pic.subtitle) {
    doc.text(displayTitle, textX, y + height / 2 - 1.5, { maxWidth: maxTextW });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(pic.subtitle, textX, y + height / 2 + 4, { maxWidth: maxTextW });
  } else {
    doc.text(displayTitle, textX, y + height / 2 + 2, { maxWidth: maxTextW });
  }

  // Optional Time badge in top right of center area
  if (pic.time) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(pic.time, rightX - 3, y + 6, { align: 'right' });
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

  doc.setFillColor(255, 255, 255);
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

  // Bottom area: Title & Subtitle
  const textAreaY = y + imgAreaH + 4;
  const maxTextW = width - 8;

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');

  const titleFontSize = pic.fontSize === 'xl' ? 13 : pic.fontSize === 'lg' ? 12 : 10.5;
  doc.setFontSize(titleFontSize);

  const splitTitle = doc.splitTextToSize(pic.title, maxTextW);
  doc.text(splitTitle, x + width / 2, textAreaY + 4, { align: 'center' });

  if (pic.subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    const titleLinesH = splitTitle.length * 4.5;
    const splitSub = doc.splitTextToSize(pic.subtitle, maxTextW);
    doc.text(splitSub, x + width / 2, textAreaY + 4 + titleLinesH, { align: 'center' });
  }

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
      const boardWidth = pageWidth - margin * 2;
      const headerHeight = 18;
      const stripHeight = Math.max(settings.cardHeightCm * 2.5, 22);
      const gap = 3;

      let currentY = margin;

      if (!isFirstPage) {
        doc.addPage();
        currentY = margin;
      }
      isFirstPage = false;

      if (settings.showDayHeader) {
        drawDayHeader(
          doc,
          day.dayName,
          daySubtitle,
          margin,
          currentY,
          boardWidth,
          headerHeight,
          settings.showHeaderIcons,
          settings.colorMode
        );
        currentY += headerHeight + 4;
      }

      if (day.pictograms.length === 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(12);
        doc.setTextColor(148, 163, 184);
        doc.text('Ingen piktogrammer tilføjet denne dag.', margin + boardWidth / 2, currentY + 20, { align: 'center' });
        continue;
      }

      for (let i = 0; i < day.pictograms.length; i++) {
        const pic = day.pictograms[i];

        if (currentY + stripHeight > pageHeight - margin) {
          doc.addPage();
          currentY = margin;

          if (settings.showDayHeader) {
            drawDayHeader(
              doc,
              day.dayName,
              `${daySubtitle} (fortsat)`,
              margin,
              currentY,
              boardWidth,
              headerHeight * 0.8,
              settings.showHeaderIcons,
              settings.colorMode
            );
            currentY += headerHeight * 0.8 + 4;
          }
        }

        drawBoardStrip(doc, pic, activePersona, margin, currentY, boardWidth, stripHeight, settings.colorMode);
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

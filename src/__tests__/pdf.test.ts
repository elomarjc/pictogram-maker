import { describe, it, expect } from 'vitest';
import { generatePdf } from '../services/pdfExport';
import { BUILTIN_TEMPLATES, createWeekPlanFromTemplate } from '../data/templates';
import type { PrintSettings } from '../types';

describe('PDF Generering og Udskrivning', () => {
  const testPlan = createWeekPlanFromTemplate(BUILTIN_TEMPLATES[0]);

  it('genererer en gyldig PDF i Tavle-visning (Board mode)', async () => {
    const settings: PrintSettings = {
      layoutMode: 'board',
      cardWidthCm: 6.5,
      cardHeightCm: 10.0,
      showDayHeader: true,
      showHeaderIcons: true,
      showCutLines: false,
      colorMode: 'color',
      scope: 'current',
      targetDayId: 'mandag',
    };

    const doc = await generatePdf(testPlan, settings);
    expect(doc).toBeDefined();
    // Check that pages were created
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
  });

  it('genererer en gyldig PDF i Klippekort-visning (Cards mode) med skæremærker', async () => {
    const settings: PrintSettings = {
      layoutMode: 'cards',
      cardWidthCm: 6.5,
      cardHeightCm: 10.0,
      showDayHeader: true,
      showHeaderIcons: false,
      showCutLines: true,
      colorMode: 'grayscale',
      scope: 'current',
      targetDayId: 'mandag',
    };

    const doc = await generatePdf(testPlan, settings);
    expect(doc).toBeDefined();
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
  });

  it('håndterer eksport af alle 7 ugedage og tilføjer flere sider', async () => {
    const settings: PrintSettings = {
      layoutMode: 'board',
      cardWidthCm: 6.5,
      cardHeightCm: 10.0,
      showDayHeader: true,
      showHeaderIcons: true,
      showCutLines: false,
      colorMode: 'color',
      scope: 'all',
    };

    const doc = await generatePdf(testPlan, settings);
    expect(doc).toBeDefined();
    // With 7 days, there must be at least 7 pages
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(7);
  });
});

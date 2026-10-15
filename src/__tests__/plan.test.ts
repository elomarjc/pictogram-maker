import { describe, it, expect, beforeEach } from 'vitest';
import { BUILTIN_TEMPLATES, createWeekPlanFromTemplate } from '../data/templates';
import { loadPlansFromSession, savePlansToSession, clearAllUserData, importPlansFromJsonFile } from '../services/storage';
import { DAYS_OF_WEEK } from '../types';

describe('Ugeplaner og Skabeloner', () => {
  it('indeholder standardskabeloner med alle 7 ugedage', () => {
    expect(BUILTIN_TEMPLATES.length).toBeGreaterThanOrEqual(3);

    const kristianTemplate = BUILTIN_TEMPLATES.find((t) => t.id === 'kristian_fuld_uge');
    expect(kristianTemplate).toBeDefined();

    DAYS_OF_WEEK.forEach((day) => {
      expect(kristianTemplate?.days[day.id]).toBeDefined();
    });

    // Check that Monday has the specific pictograms from the reference picture
    const mondayPics = kristianTemplate!.days.mandag.pictograms;
    expect(mondayPics.length).toBe(9);
    expect(mondayPics[0].title).toBe('Hænge vasketøj op');
    expect(mondayPics[1].title).toBe('The & Kaffe');
    expect(mondayPics[2].title).toBe('Medicin');
    expect(mondayPics[3].title).toBe('Badetid');
    expect(mondayPics[4].title).toBe('Spisetid');
    expect(mondayPics[5].title).toBe('Aktiviteter');
    expect(mondayPics[6].title).toBe('Vaske op');
    expect(mondayPics[7].title).toBe('Bolle');
    expect(mondayPics[8].title).toBe('Sengetid');
  });

  it('genererer unikke IDer for hver oprettet plan og hvert piktogram', () => {
    const plan1 = createWeekPlanFromTemplate(BUILTIN_TEMPLATES[0]);
    const plan2 = createWeekPlanFromTemplate(BUILTIN_TEMPLATES[0]);

    expect(plan1.id).not.toBe(plan2.id);

    const allIds = new Set<string>();
    Object.values(plan1.days).forEach((day) => {
      day.pictograms.forEach((pic) => {
        expect(allIds.has(pic.id)).toBe(false);
        allIds.add(pic.id);
      });
    });
  });
});

describe('Privatliv og Lokal Lagring (sessionStorage)', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('gemmer og indlæser planer udelukkende fra sessionStorage', () => {
    const plan = createWeekPlanFromTemplate(BUILTIN_TEMPLATES[0], 'Test Plan');
    savePlansToSession([plan], plan.id);

    const loaded = loadPlansFromSession();
    expect(loaded.plans.length).toBe(1);
    expect(loaded.plans[0].name).toBe('Test Plan');
    expect(loaded.activePlanId).toBe(plan.id);
  });

  it('rydder alle brugerdata korrekt ved clearAllUserData', () => {
    const customPlan = createWeekPlanFromTemplate(BUILTIN_TEMPLATES[2], 'Skal slettes');
    savePlansToSession([customPlan], customPlan.id);

    const reset = clearAllUserData();
    expect(reset.plans.length).toBe(1);
    expect(reset.plans[0].name).toBe(BUILTIN_TEMPLATES[0].name.split(' (')[0]);
  });

  it('validerer JSON backup under import og afviser ugyldige filer', async () => {
    const invalidJsonFile = new File(['{"invalid": true}'], 'bad.json', { type: 'application/json' });
    await expect(importPlansFromJsonFile(invalidJsonFile)).rejects.toThrow();

    const plan = createWeekPlanFromTemplate(BUILTIN_TEMPLATES[0], 'Gyldig Backup');
    const validJsonStr = JSON.stringify({
      app: 'Piktogram Maker',
      plans: [plan],
      activePlanId: plan.id,
    });
    const validFile = new File([validJsonStr], 'valid.json', { type: 'application/json' });
    const imported = await importPlansFromJsonFile(validFile);
    expect(imported.plans[0].name).toBe('Gyldig Backup');
  });
});

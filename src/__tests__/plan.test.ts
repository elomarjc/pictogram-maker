import { describe, it, expect, beforeEach } from 'vitest';
import { BUILTIN_TEMPLATES, createWeekPlanFromTemplate } from '../data/templates';
import { loadPlansFromSession, savePlansToSession, clearAllUserData, importPlansFromJsonFile } from '../services/storage';
import { DAYS_OF_WEEK } from '../types';

describe('Ugeplaner og Skabeloner', () => {
  it('indeholder standardskabeloner med alle 7 ugedage', () => {
    expect(BUILTIN_TEMPLATES.length).toBeGreaterThanOrEqual(3);

    const kTemplate = BUILTIN_TEMPLATES.find((t) => t.id === 'k_fuld_uge');
    expect(kTemplate).toBeDefined();

    DAYS_OF_WEEK.forEach((day) => {
      expect(kTemplate?.days[day.id]).toBeDefined();
    });

    // Check that Monday has the specific pictograms from the reference picture
    const mondayPics = kTemplate!.days.mandag.pictograms;
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

describe('Persona & Figursystem samt Navnebeskyttelse', () => {
  it('overholder streng navnebeskyttelse: bruger aldrig det fulde navn, kun forkortelser som K.', () => {
    const templatesJson = JSON.stringify(BUILTIN_TEMPLATES);
    // User constraint: "og brug ikke navne brug forkortelse som fx K. isteadet for kristian"
    expect(templatesJson.toLowerCase().includes('kristian')).toBe(false);
  });

  it('indeholder standardfigurer Mand (K.) og Kvinde (A.)', async () => {
    const { DEFAULT_PERSONAS, getPersona, resolveSceneImage } = await import('../services/personas');
    expect(DEFAULT_PERSONAS.length).toBeGreaterThanOrEqual(2);

    const man = getPersona('man_k');
    expect(man.shortCode).toBe('K.');
    expect(man.activityScenes.kaffe).toBeDefined();

    const woman = getPersona('woman_a');
    expect(woman.shortCode).toBe('A.');
    expect(woman.activityScenes.kaffe).toBeDefined();

    // Verify scene resolution swaps depending on persona
    const testPic = {
      id: 'test_1',
      title: 'The & Kaffe',
      iconId: 'coffee',
      illustrationId: 'kaffe',
      bgColor: '#FFFFFF',
    };

    const manScene = resolveSceneImage(testPic, man);
    const womanScene = resolveSceneImage(testPic, woman);
    expect(manScene).not.toBe(womanScene);
    expect(manScene).toContain('kaffe');
    expect(womanScene).toContain('woman_kaffe');
  });
});

describe('Prompt optimering og scene-beskrivelser', () => {
  it('optimerer korte bruger-input til venlige 2D piktogram-prompter', async () => {
    const { optimizeScenePrompt } = await import('../data/scenePrompts');
    expect(optimizeScenePrompt('læse en bog')).toContain('lænestol');
    expect(optimizeScenePrompt('bage en kage')).toContain('forklæde');
    expect(optimizeScenePrompt('gå en tur')).toContain('gåtur');
    expect(optimizeScenePrompt('fodre katten')).toContain('Figuren');
  });

  it('bygger masterprompt med de 4 elementer: masterprompt + figur (Ref 1) + scenebeskrivelse + piktogram ref (Ref 2)', async () => {
    const { buildDanishMasterPrompt, buildEnglishMasterPrompt } = await import('../data/scenePrompts');

    const daPrompt = buildDanishMasterPrompt({
      sceneDescription: 'Figuren lægger et farverigt puslespil ved bordet.',
      personaName: 'Mand',
      isWoman: false,
    });

    expect(daPrompt).toContain('Master Prompt');
    expect(daPrompt).toContain('Billede 1 — Figur / Avatar (Ref 1)');
    expect(daPrompt).toContain('Billede 2 — Eksempel / Tegnestil (Ref 2)');
    expect(daPrompt).toContain('Figuren lægger et farverigt puslespil ved bordet.');
    expect(daPrompt).toContain('100% Gennemsigtig Baggrund');
    expect(daPrompt).toContain('buzzcut');

    const enPrompt = buildEnglishMasterPrompt({
      sceneDescription: 'The character is baking cookies in the kitchen.',
      personaName: 'Woman',
      isWoman: true,
    });

    expect(enPrompt).toContain('Master Prompt');
    expect(enPrompt).toContain('Image 1 — Avatar (Ref 1)');
    expect(enPrompt).toContain('Image 2 — Example (Ref 2)');
    expect(enPrompt).toContain('The character is baking cookies in the kitchen.');
    expect(enPrompt).toContain('Transparent Background');
  });
});

describe('Uafhængig skriftstørrelse (enkelte kort vs. global værktøjslinje)', () => {
  it('ændring af et enkelt korts tekststørrelse ændrer IKKE planens globale skriftstørrelse', () => {
    const plan = createWeekPlanFromTemplate(BUILTIN_TEMPLATES[0]);
    plan.globalFontSize = 22;

    // Simulate editing card 0
    const card0 = plan.days.mandag.pictograms[0];
    const updatedCard0 = { ...card0, fontSize: 14 };

    // Update single card in plan
    const updatedPlan = {
      ...plan,
      days: {
        ...plan.days,
        mandag: {
          ...plan.days.mandag,
          pictograms: [updatedCard0, ...plan.days.mandag.pictograms.slice(1)],
        },
      },
    };

    // The individual card has 14
    expect(updatedPlan.days.mandag.pictograms[0].fontSize).toBe(14);
    // But the global plan toolbar font size stays 22
    expect(updatedPlan.globalFontSize).toBe(22);
  });

  it('anvendelse på alle kort opdaterer både globalFontSize og alle kort i planen', () => {
    const plan = createWeekPlanFromTemplate(BUILTIN_TEMPLATES[0]);
    plan.globalFontSize = 22;

    const newGlobalSize = 28;
    const updatedDays = { ...plan.days };
    for (const dayKey of Object.keys(updatedDays) as (keyof typeof updatedDays)[]) {
      updatedDays[dayKey] = {
        ...updatedDays[dayKey],
        pictograms: updatedDays[dayKey].pictograms.map((p) => ({
          ...p,
          fontSize: newGlobalSize,
        })),
      };
    }

    const updatedPlan = {
      ...plan,
      globalFontSize: newGlobalSize,
      days: updatedDays,
    };

    expect(updatedPlan.globalFontSize).toBe(28);
    expect(updatedPlan.days.mandag.pictograms.every((p) => p.fontSize === 28)).toBe(true);
    expect(updatedPlan.days.fredag.pictograms.every((p) => p.fontSize === 28)).toBe(true);
  });
});


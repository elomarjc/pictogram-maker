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

  it('indeholder standardfigurer avatar_1 og avatar_2 uden køn eller navne', async () => {
    const { DEFAULT_PERSONAS, getPersona, resolveSceneImage } = await import('../services/personas');
    expect(DEFAULT_PERSONAS.length).toBeGreaterThanOrEqual(2);

    const a1 = getPersona('avatar_1');
    expect(a1.id).toBe('avatar_1');
    expect(a1.name).toBe('avatar_1');
    expect(a1.shortCode).toBe('avatar_1');
    expect(a1.activityScenes.kaffe).toBeDefined();

    const a2 = getPersona('avatar_2');
    expect(a2.id).toBe('avatar_2');
    expect(a2.name).toBe('avatar_2');
    expect(a2.shortCode).toBe('avatar_2');
    expect(a2.activityScenes.kaffe).toBeDefined();

    // Verify scene resolution swaps depending on persona
    const testPic = {
      id: 'test_1',
      title: 'The & Kaffe',
      iconId: 'coffee',
      illustrationId: 'kaffe',
      bgColor: '#FFFFFF',
    };

    const a1Scene = resolveSceneImage(testPic, a1);
    const a2Scene = resolveSceneImage(testPic, a2);
    expect(a1Scene).not.toBe(a2Scene);
    expect(a1Scene).toContain('personas/avatar_1/scenes/kaffe');
    expect(a2Scene).toContain('personas/avatar_2/scenes/kaffe');
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
    });

    expect(daPrompt).toContain('Master Prompt');
    expect(daPrompt).toContain('Billede 1 — Figur / Avatar (Ref 1)');
    expect(daPrompt).toContain('Billede 2 — Eksempel / Tegnestil (Ref 2)');
    expect(daPrompt).toContain('Figuren lægger et farverigt puslespil ved bordet.');
    expect(daPrompt).toContain('100% Gennemsigtig Baggrund');
    expect(daPrompt).toContain('Karakter- & Tøjkonsistens (Ref 1)');
    expect(daPrompt).not.toContain('buzzcut');
    expect(daPrompt).not.toContain('hættetrøje');

    const enPrompt = buildEnglishMasterPrompt({
      sceneDescription: 'The character is baking cookies in the kitchen.',
    });

    expect(enPrompt).toContain('Master Prompt');
    expect(enPrompt).toContain('Image 1 — Avatar (Ref 1)');
    expect(enPrompt).toContain('Image 2 — Example (Ref 2)');
    expect(enPrompt).toContain('The character is baking cookies in the kitchen.');
    expect(enPrompt).toContain('Transparent Background');
    expect(enPrompt).toContain('Character & Clothing Consistency (Ref 1)');
    expect(enPrompt).not.toContain('hoodie');
    expect(enPrompt).not.toContain('ponytail');
  });

  it('genererer præcise Flux-1-Schnell scener med karakter og aktivitet til Cloudflare AI', async () => {
    const { buildCloudflareAiPrompt } = await import('../data/scenePrompts');

    const promptA1Sengetid = buildCloudflareAiPrompt({
      sceneDescription: 'sengetid',
      personaId: 'avatar_1',
    });
    expect(promptA1Sengetid).toContain('buzzcut');
    expect(promptA1Sengetid).toContain('pillow');
    expect(promptA1Sengetid).toContain('ZZZ');
    expect(promptA1Sengetid).toContain('Clean 2D cartoon pictogram vector illustration');

    const promptA2Laundry = buildCloudflareAiPrompt({
      sceneDescription: 'vasketøj',
      personaId: 'avatar_2',
    });
    expect(promptA2Laundry).toContain('ponytail');
    expect(promptA2Laundry).toContain('turquoise teal hoodie');
    expect(promptA2Laundry).toContain('laundry basket');
    expect(promptA2Laundry).toContain('washing machine');
  });

  it('har standard 2126 x 740 scene-dimensioner matchende vaesketoeg.webp og beregner mørkere nuance', async () => {
    const { STANDARD_SCENE_WIDTH, STANDARD_SCENE_HEIGHT } = await import('../services/imageGenerationApi');
    expect(STANDARD_SCENE_WIDTH).toBe(2126);
    expect(STANDARD_SCENE_HEIGHT).toBe(740);
    expect((STANDARD_SCENE_WIDTH / STANDARD_SCENE_HEIGHT).toFixed(3)).toBe('2.873');

    const { darkenColor } = await import('../services/colorUtils');
    // Yellow card
    const darkYellow = darkenColor('#fdef8c', 0.14);
    expect(darkYellow).not.toBe('#fdef8c');
    expect(darkYellow.startsWith('#')).toBe(true);

    // Pink card
    const darkPink = darkenColor('#fbb6db', 0.14);
    expect(darkPink).not.toBe('#fbb6db');

    // White fallback
    const darkWhite = darkenColor('#ffffff', 0.14);
    expect(darkWhite).toBe('#eceef2');
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

describe('Korte scene-titler og automatisk standardscene-generator', () => {
  it('genererer præcise, korte danske titler ud fra scenebeskrivelser', async () => {
    const { getShortSceneTitle } = await import('../utils/sceneTitleHelper');

    // Activity matching
    expect(getShortSceneTitle('Figuren er i gang med at hænge vasketøj op i haven')).toBe('Vasketøj');
    expect(getShortSceneTitle('Manden børster tænder foran spejlet')).toBe('Børste tænder');
    expect(getShortSceneTitle('Drikke en varm kop kaffe om morgenen')).toBe('Kaffe & The');
    expect(getShortSceneTitle('tage sin daglige medicin')).toBe('Medicin');
    expect(getShortSceneTitle('i bad med sæbe')).toBe('Badetid');
    expect(getShortSceneTitle('spise lækker aftensmad')).toBe('Aftensmad');
    expect(getShortSceneTitle('ligge i sengen og sove godnat')).toBe('Sengetid');
    expect(getShortSceneTitle('gå en frisk gåtur i skoven')).toBe('Gåtur');

    // Strips narrative prefixes and cuts cleanly on word boundaries
    const custom = getShortSceneTitle('Figuren bygger et kæmpe tårn af store klodser i stuen');
    expect(custom).not.toContain('Figuren');
    expect(custom.length).toBeLessThanOrEqual(25);
    expect(custom.endsWith(' ')).toBe(false);

    // Fallbacks
    expect(getShortSceneTitle('', 'Tegnetid')).toBe('Tegnetid');
    expect(getShortSceneTitle('', 'Aktivitetsnavn')).toBe('Ny scene');
  });

  it('beregner manglende scener for nye figurer vs standard figurer', async () => {
    const {
      DEFAULT_SCENE_DEFINITIONS,
      getMissingScenesForPersona,
      getReadyScenesCount,
      buildScenePromptForPersona,
    } = await import('../services/characterSceneGenerator');

    expect(DEFAULT_SCENE_DEFINITIONS.length).toBe(14);

    // Standard avatar_1 has all 14 scenes
    const { DEFAULT_PERSONAS } = await import('../services/personas');
    const defaultA1 = DEFAULT_PERSONAS[0];
    const a1Missing = getMissingScenesForPersona(defaultA1);
    expect(a1Missing.length).toBe(0);
    const a1Ready = getReadyScenesCount(defaultA1);
    expect(a1Ready.ready).toBe(14);
    expect(a1Ready.total).toBe(14);

    // A brand new custom persona has 0 scenes ready and 14 missing
    const newPersona = {
      id: 'avatar_test_123',
      name: 'Min testfigur',
      shortCode: 'M.',
      avatarUrl: 'data:image/png;base64,test',
      description: 'glad person med briller',
      activityScenes: {},
    };
    const missing = getMissingScenesForPersona(newPersona);
    expect(missing.length).toBe(14);
    const readyCount = getReadyScenesCount(newPersona);
    expect(readyCount.ready).toBe(0);
    expect(readyCount.total).toBe(14);

    // Test prompt construction for a scene
    const laundryDef = DEFAULT_SCENE_DEFINITIONS.find((d) => d.key === 'vaesketoeg')!;
    const prompt = buildScenePromptForPersona(newPersona, laundryDef);
    expect(prompt).toContain('Clean 2D cartoon pictogram vector illustration');
    expect(prompt).toContain('Min testfigur');
    expect(prompt).toContain('laundry');
  });
});

describe('Hurtig redigering (quickCardHelper)', () => {
  it('tildeler relevante ikoner og reference-farver baseret på aktivitetens titel', async () => {
    const { guessIconAndColor } = await import('../utils/quickCardHelper');

    // Mad & Kaffe
    const coffee = guessIconAndColor('The & Kaffe', 0);
    expect(coffee.iconId).toBe('coffee');
    expect(coffee.bgColor).toBe('#fdef8c');

    const food = guessIconAndColor('Frokost og pause', 1);
    expect(food.iconId).toBe('utensils');
    expect(food.bgColor).toBe('#fdc67c');

    // Medicin & hygiejne
    const medicine = guessIconAndColor('Husk medicin', 2);
    expect(medicine.iconId).toBe('pill');
    expect(medicine.bgColor).toBe('#c1ea9a');

    const bath = guessIconAndColor('Badetid og hårvask', 3);
    expect(bath.iconId).toBe('shower');
    expect(bath.bgColor).toBe('#9adafd');

    // Pligter og gåtur
    const walk = guessIconAndColor('Gåtur i skoven', 4);
    expect(walk.iconId).toBe('walk');

    const laundry = guessIconAndColor('Vasketøj', 5);
    expect(laundry.iconId).toBe('shirt');
    expect(laundry.bgColor).toBe('#fbb6db');

    // Ukendt titel cykler igennem farver
    const generic = guessIconAndColor('Helt speciel aktivitet', 0);
    expect(generic.iconId).toBe('smile');
    expect(generic.bgColor).toBe('#fdef8c');
  });
});




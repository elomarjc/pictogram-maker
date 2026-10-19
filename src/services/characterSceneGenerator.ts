import type { Persona } from '../types';
import {
  type QuotaResetInfo,
} from './imageGenerationApi';
import { saveCustomPersona, getAllPersonas } from './personas';
import {
  generateScenesWithChatGPT,
  generateSingleSceneWithChatGPT,
} from './chatgptGeneration';

export interface DefaultSceneDef {
  key: string;
  title: string;
  descriptionDanish: string;
  englishActivity: string;
  defaultBgColor: string;
  aliases?: string[];
}

export const BATCH_1_SCENE_DEFINITIONS: DefaultSceneDef[] = [
  {
    key: 'vaesketoeg',
    title: 'Hænge vasketøj op',
    descriptionDanish: 'Hænge vasketøj op ved vaskemaskinen',
    englishActivity:
      'hanging freshly washed colorful laundry clothes on a drying rack next to a modern white washing machine',
    defaultBgColor: '#fbb6db',
    aliases: ['vasketoj'],
  },
  {
    key: 'kaffe',
    title: 'The & Kaffe',
    descriptionDanish: 'Drikke en varm kop kaffe eller the',
    englishActivity:
      'sitting comfortably at a kitchen table holding a warm steaming ceramic mug of coffee, smiling happily',
    defaultBgColor: '#fdef8c',
    aliases: ['the_kaffe'],
  },
  {
    key: 'medicin',
    title: 'Medicin',
    descriptionDanish: 'Tage sin daglige medicin eller vitaminer',
    englishActivity:
      'sitting at a tidy table with a weekly pill dispenser box and a glass of fresh water, smiling',
    defaultBgColor: '#c1ea9a',
  },
  {
    key: 'badetid',
    title: 'Badetid',
    descriptionDanish: 'Tage et forfriskende brusebad med sæbe',
    englishActivity:
      'taking a warm cozy shower with bubbly soap lather, clean water splashes, happy and refreshed',
    defaultBgColor: '#9adafd',
    aliases: ['brusebad', 'toej_af'],
  },
  {
    key: 'spisetid',
    title: 'Spisetid',
    descriptionDanish: 'Spise et lækkert måltid mad ved bordet',
    englishActivity:
      'sitting at a dining table happily eating a delicious nutritious meal with plate, fork and knife',
    defaultBgColor: '#fdc67c',
    aliases: ['forberede_mad'],
  },
  {
    key: 'boerste_taender',
    title: 'Børste tænder',
    descriptionDanish: 'Børste tænder foran badeværelsesspejlet',
    englishActivity:
      'brushing teeth at bathroom mirror with toothbrush and foamy toothpaste, smiling',
    defaultBgColor: '#9adafd',
    aliases: ['borste_taender', 'borste_tander', 'tandborste'],
  },
  {
    key: 'vaske_op',
    title: 'Vaske op',
    descriptionDanish: 'Vaske kopper og tallerkener op i køkkenet',
    englishActivity:
      'standing at the kitchen sink happily washing dishes with bubbly soap suds and dish brush',
    defaultBgColor: '#9ceacc',
    aliases: ['opvask'],
  },
  {
    key: 'bolle',
    title: 'Bolle / Mellemmåltid',
    descriptionDanish: 'Spise en frisk bolle til mellemmåltid',
    englishActivity:
      'sitting relaxed enjoying a delicious freshly baked bun or pastry snack on a small plate',
    defaultBgColor: '#cdb7f8',
    aliases: ['bolle_ikon'],
  },
  {
    key: 'sengetid',
    title: 'Sengetid & Sove',
    descriptionDanish: 'Ligge trygt i sengen og sove under dynen',
    englishActivity:
      'lying peacefully and cozy asleep in bed resting head on fluffy white pillow under warm blanket with small Zzz icons',
    defaultBgColor: '#97d9fc',
    aliases: ['sove', 'sovetid'],
  },
  {
    key: 'gatur',
    title: 'Gåtur',
    descriptionDanish: 'Gå en frisk gåtur udendørs i godt vejr',
    englishActivity:
      'walking happily outdoors on a sunny footpath in a green park with lush trees and pleasant breeze',
    defaultBgColor: '#9adafd',
    aliases: ['gaatur'],
  },
  {
    key: 'rede_seng',
    title: 'Rede seng',
    descriptionDanish: 'Rede sin seng pænt om morgenen',
    englishActivity:
      'neatly making a bed, smoothing out a fresh blanket and fluffing up pillows with a cheerful proud smile',
    defaultBgColor: '#97d9fc',
  },
  {
    key: 'pause_sofa',
    title: 'Pause på sofa / TV',
    descriptionDanish: 'Slappe af på en blød sofa foran tv',
    englishActivity:
      'sitting comfortably relaxed on a cozy living room sofa resting with a warm friendly smile',
    defaultBgColor: '#fdef8c',
    aliases: ['sofa', 'tv_skaerm'],
  },
  {
    key: 'skraldespand',
    title: 'Skraldespand & Pant',
    descriptionDanish: 'Gå ud til skraldespanden med affaldsposen',
    englishActivity:
      'carrying a tied green garbage trash bag to put into an outdoor wheelie dustbin, smiling',
    defaultBgColor: '#c1ea9a',
    aliases: ['skrald'],
  },
  {
    key: 'handle',
    title: 'Handle indkøb',
    descriptionDanish: 'Handle ind i supermarkedet med indkøbskurv',
    englishActivity:
      'holding a colorful shopping basket with groceries happily walking down a neat supermarket aisle',
    defaultBgColor: '#fdc67c',
    aliases: ['indkoeb'],
  },
  {
    key: 'morgenmad',
    title: 'Morgenmad',
    descriptionDanish: 'Spise morgenmad med skål mælk eller havregryn',
    englishActivity:
      'sitting at the table enjoying a bowl of breakfast cereal with milk, holding a spoon happily',
    defaultBgColor: '#fdef8c',
  },
  {
    key: 'frokost',
    title: 'Frokost',
    descriptionDanish: 'Spise frokost med rugbrødsmadder',
    englishActivity:
      'eating delicious open-faced sandwiches from a plate with a friendly smile at lunch table',
    defaultBgColor: '#fdc67c',
  },
  {
    key: 'aftensmad',
    title: 'Aftensmad',
    descriptionDanish: 'Spise et varmt aftensmåltid',
    englishActivity:
      'enjoying a warm dinner plate with knife and fork at the dining table with a drink',
    defaultBgColor: '#fdc67c',
  },
  {
    key: 'aktiviteter',
    title: 'Aktiviteter & Hobby',
    descriptionDanish: 'Kreative hyggelige aktiviteter eller puslespil',
    englishActivity:
      'sitting at a craft table doing fun creative activities with colored pencils and a jigsaw puzzle, smiling',
    defaultBgColor: '#ccadfb',
  },
  {
    key: 'cykeltur',
    title: 'Cykeltur',
    descriptionDanish: 'Køre på cykel i frisk luft med hjelm',
    englishActivity:
      'riding a bicycle outdoors wearing a safety bike helmet with a joyful adventurous smile',
    defaultBgColor: '#9adafd',
    aliases: ['tage_toej_paa'],
  },
  {
    key: 'weekend',
    title: 'Weekendhygge',
    descriptionDanish: 'Hygge og afslapning i weekenden',
    englishActivity:
      'relaxing in comfortable casual clothes enjoying calm weekend leisure time with a bright smile',
    defaultBgColor: '#ccadfb',
  },
];

export const BATCH_2_SCENE_DEFINITIONS: DefaultSceneDef[] = [
  {
    key: 'skifte_sengetoj',
    title: 'Skifte sengetøj',
    descriptionDanish: 'Skifte dynebetræk og pudebetræk til rent vasketøj',
    englishActivity:
      'changing bedsheets, putting fresh clean linen cover on duvet and pillow cheerfully',
    defaultBgColor: '#97d9fc',
  },
  {
    key: 'stovsuge',
    title: 'Støvsuge gulv',
    descriptionDanish: 'Støvsuge værelset eller bag sofaen',
    englishActivity:
      'vacuuming the floor with a modern vacuum cleaner wand with an active focused smile',
    defaultBgColor: '#fbb6db',
  },
  {
    key: 'torre_bord',
    title: 'Tørre bord af',
    descriptionDanish: 'Tørre bordet af med en våd klud efter maden',
    englishActivity:
      'wiping down a dining table clean and shiny using a damp cloth',
    defaultBgColor: '#9ceacc',
  },
  {
    key: 'tomme_opvaskemaskine',
    title: 'Tømme opvaskemaskine',
    descriptionDanish: 'Sætte rent service på plads fra opvaskemaskinen',
    englishActivity:
      'unloading clean sparkling plates and glasses from an open dishwasher into a kitchen cabinet',
    defaultBgColor: '#9ceacc',
  },
  {
    key: 'legge_toj_sammen',
    title: 'Lægge tøj sammen',
    descriptionDanish: 'Folde rent tøj og lægge det i pæne bunker',
    englishActivity:
      'neatly folding clean colorful laundry clothes and stacking them in a tidy pile on a table',
    defaultBgColor: '#fbb6db',
  },
  {
    key: 'forberede_mad',
    title: 'Forberede mad',
    descriptionDanish: 'Hjælpe med madlavning og hakke grøntsager',
    englishActivity:
      'standing happily at the kitchen counter chopping carrots and preparing dinner ingredients',
    defaultBgColor: '#fdc67c',
  },
  {
    key: 'hore_musik',
    title: 'Høre musik',
    descriptionDanish: 'Lytte til musik med store høretelefoner på',
    englishActivity:
      'wearing large comfortable over-ear headphones, tapping feet and happily enjoying favorite music',
    defaultBgColor: '#ccadfb',
  },
  {
    key: 'ipad_tablet',
    title: 'iPad / Tablet-tid',
    descriptionDanish: 'Pause med iPad, tablet eller smartphone',
    englishActivity:
      'sitting cozily in an armchair holding a tablet device, tapping screen with a smile',
    defaultBgColor: '#fdef8c',
  },
  {
    key: 'perler',
    title: 'Lave perler',
    descriptionDanish: 'Lave farverige perleplader ved hobbybordet',
    englishActivity:
      'sitting at a table carefully placing colorful beads onto a beaded pegboard craft design',
    defaultBgColor: '#ccadfb',
  },
  {
    key: 'havearbejde',
    title: 'Havearbejde',
    descriptionDanish: 'Vande blomster eller hjælpe i haven',
    englishActivity:
      'watering potted outdoor plants with a cute green watering can in a sunny garden',
    defaultBgColor: '#c1ea9a',
  },
  {
    key: 'svommehal',
    title: 'Svømmehal',
    descriptionDanish: 'Bade og svømme i svømmehallen',
    englishActivity:
      'standing by the edge of a clear blue swimming pool with a towel and swim trunks ready for a swim',
    defaultBgColor: '#9adafd',
  },
  {
    key: 'bus_tog',
    title: 'Køre i bus / tog',
    descriptionDanish: 'Køre med bus eller tog på tur',
    englishActivity:
      'sitting comfortably by a window on a public bus or train looking outside holding travel card',
    defaultBgColor: '#fdc67c',
  },
  {
    key: 'pakke_taske',
    title: 'Pakke taske til weekend',
    descriptionDanish: 'Pakke weekendtaske med tøj og fornødenheder',
    englishActivity:
      'packing a duffel travel bag on top of the bed with neatly folded clothes for a weekend trip',
    defaultBgColor: '#cdb7f8',
  },
  {
    key: 'besog_far',
    title: 'Besøg hos far / familie',
    descriptionDanish: 'Ankomme til familiebesøg med et stort vink',
    englishActivity:
      'standing outside front door of a welcoming family home holding bag and waving hello happily',
    defaultBgColor: '#c1ea9a',
  },
  {
    key: 'pant_flasker',
    title: 'Aflevere pant',
    descriptionDanish: 'Aflevere tomme flasker og dåser i pantautomaten',
    englishActivity:
      'inserting empty soda cans and bottles into a grocery store bottle recycling reverse vending machine',
    defaultBgColor: '#c1ea9a',
  },
  {
    key: 'tage_toj_paa',
    title: 'Tage tøj / jakke på',
    descriptionDanish: 'Tage overtøj og sko på før udflugt',
    englishActivity:
      'zipping up outdoor jacket and putting on shoes cheerfully getting ready to head outside',
    defaultBgColor: '#9adafd',
  },
  {
    key: 'drikke_vand',
    title: 'Drikke et glas vand',
    descriptionDanish: 'Drikke et forfriskende koldt glas vand',
    englishActivity:
      'drinking from a fresh clear glass of water with a satisfied refreshed smile',
    defaultBgColor: '#9adafd',
  },
  {
    key: 'spille_spil',
    title: 'Brætspil / Puslespil',
    descriptionDanish: 'Spille et sjovt spil eller lægge puslespil',
    englishActivity:
      'sitting at a table playing a colorful board game with dice, cards and game tokens with a friend',
    defaultBgColor: '#ccadfb',
  },
  {
    key: 'rydde_op',
    title: 'Rydde op på værelset',
    descriptionDanish: 'Sætte ting på plads i kasser og på hylder',
    englishActivity:
      'organizing the room placing toys and books neatly into a storage box organizer, smiling proudly',
    defaultBgColor: '#9ceacc',
  },
  {
    key: 'sansehus',
    title: 'Sansehus / Sanserum',
    descriptionDanish: 'Rolig sansestimulering og afslapning i Snoezelen rum',
    englishActivity:
      'relaxing peacefully in a soothing sensory Snoezelen room with soft glowing fiber-optic lights and cozy cushions',
    defaultBgColor: '#cdb7f8',
  },
];

export const DEFAULT_SCENE_DEFINITIONS: DefaultSceneDef[] = [
  ...BATCH_1_SCENE_DEFINITIONS,
  ...BATCH_2_SCENE_DEFINITIONS,
];

/**
 * Checks which standard default scenes are missing from a given persona.
 */
export function getMissingScenesForPersona(persona: Persona): DefaultSceneDef[] {
  const scenes = persona.activityScenes || {};
  return DEFAULT_SCENE_DEFINITIONS.filter((def) => !scenes[def.key]);
}

/**
 * Checks which Batch 1 scenes are missing from a given persona.
 */
export function getBatch1MissingScenesForPersona(persona: Persona): DefaultSceneDef[] {
  const scenes = persona.activityScenes || {};
  return BATCH_1_SCENE_DEFINITIONS.filter((def) => !scenes[def.key]);
}

/**
 * Checks which Batch 2 scenes are missing from a given persona.
 */
export function getBatch2MissingScenesForPersona(persona: Persona): DefaultSceneDef[] {
  const scenes = persona.activityScenes || {};
  return BATCH_2_SCENE_DEFINITIONS.filter((def) => !scenes[def.key]);
}

/**
 * Returns total ready count across batches.
 */
export function getReadyScenesCount(persona: Persona): {
  ready: number;
  total: number;
  batch1Ready: number;
  batch1Total: number;
  batch2Ready: number;
  batch2Total: number;
} {
  const scenes = persona.activityScenes || {};
  let batch1Ready = 0;
  for (const def of BATCH_1_SCENE_DEFINITIONS) {
    if (scenes[def.key]) batch1Ready++;
  }
  let batch2Ready = 0;
  for (const def of BATCH_2_SCENE_DEFINITIONS) {
    if (scenes[def.key]) batch2Ready++;
  }
  return {
    ready: batch1Ready + batch2Ready,
    total: DEFAULT_SCENE_DEFINITIONS.length,
    batch1Ready,
    batch1Total: BATCH_1_SCENE_DEFINITIONS.length,
    batch2Ready,
    batch2Total: BATCH_2_SCENE_DEFINITIONS.length,
  };
}

/**
 * Constructs a prompt for Cloudflare Workers AI for a specific scene and persona.
 */
export function buildScenePromptForPersona(persona: Persona, sceneDef: DefaultSceneDef): string {
  let characterDesc: string;

  if (persona.id === 'avatar_1' || persona.id === 'man_k') {
    characterDesc =
      'A cheerful friendly cartoon character with closely shaved buzzcut hair, round friendly face, rosy cheeks, warm open smile, wearing a grey hoodie jacket over a white t-shirt';
  } else if (persona.description && persona.description.trim() && persona.description !== persona.id) {
    const nameStr = persona.name && !persona.name.startsWith('avatar_') ? ` (${persona.name})` : '';
    characterDesc = `A cheerful friendly cartoon character${nameStr}, ${persona.description}`;
  } else {
    // Custom avatar persona
    const nameStr = persona.name && !persona.name.startsWith('avatar_') ? ` (${persona.name})` : '';
    characterDesc = `A cheerful friendly 2D cartoon character${nameStr}, round friendly face, rosy cheeks, warm open smile, dressed in comfortable casual clothes matching avatar style`;
  }

  return `Clean 2D cartoon pictogram vector illustration, horizontal aspect ratio. ${characterDesc}, ${sceneDef.englishActivity}. Bold thick smooth black outlines, simple flat cel-shading, colorful and cheerful, isolated on pure solid white background, cute visual schedule pictogram, no text, no frame, wide horizontal composition.`;
}

/**
  * Generates a single scene for a persona and fits it into 2126x740 format.
  */
export async function generateSingleScene(
  persona: Persona,
  sceneDef: DefaultSceneDef,
  options?: {
    signal?: AbortSignal;
  }
): Promise<string> {
  const res = await generateSingleSceneWithChatGPT(
    persona.id,
    sceneDef.key,
    undefined,
    options?.signal
  );
  if (res.sceneUrl) {
    return res.sceneUrl;
  }
  throw new Error('Kunne ikke generere scenen via ChatGPT.');
}

export interface SceneGenProgress {
  total: number;
  completed: number;
  currentSceneKey?: string;
  currentSceneTitle?: string;
  percent: number;
  latestSceneUrl?: string;
  error?: string;
  done: boolean;
  accountSwitchInfo?: string;
  allQuotaExceeded?: boolean;
  resetInfo?: QuotaResetInfo;
}

/**
 * Batch generates all missing default scenes for a persona using ChatGPT 20-in-1 Master Sheet.
 * batch = 1 (20 Grundrutiner) or batch = 2 (20 Supplerende rutiner, pligter & udflugter).
 */
export async function generateAllMissingScenes(
  persona: Persona,
  onProgress: (p: SceneGenProgress) => void,
  options?: {
    batch?: 1 | 2;
    signal?: AbortSignal;
  }
): Promise<Persona> {
  const batchNum = options?.batch || 1;
  const missing = batchNum === 2 ? getBatch2MissingScenesForPersona(persona) : getBatch1MissingScenesForPersona(persona);
  const total = missing.length || 20;

  onProgress({
    total,
    completed: 0,
    currentSceneTitle: `Starter ChatGPT 20-i-1 sceneark generering (Batch ${batchNum})...`,
    percent: 5,
    done: false,
  });

  const res = await generateScenesWithChatGPT(
    persona.id,
    batchNum,
    (prog) => {
      onProgress({
        total,
        completed: Math.round((prog.percent / 100) * total),
        currentSceneTitle: prog.message,
        percent: prog.percent,
        done: prog.percent === 100,
      });
    },
    options?.signal
  );

  if (res.persona) {
    saveCustomPersona(res.persona);
    return res.persona;
  }

  const all = getAllPersonas();
  const fresh = all.find((p) => p.id === persona.id) || persona;
  return fresh;
}

/**
 * Generates only one specific scene for a persona on demand via ChatGPT.
 */
export async function generateSingleSceneForPersona(
  persona: Persona,
  sceneDef: DefaultSceneDef,
  onProgress?: (p: SceneGenProgress) => void,
  options?: {
    signal?: AbortSignal;
  }
): Promise<Persona> {
  onProgress?.({
    total: 1,
    completed: 0,
    currentSceneKey: sceneDef.key,
    currentSceneTitle: `Starter ChatGPT for "${sceneDef.title}"...`,
    percent: 10,
    done: false,
  });

  const res = await generateSingleSceneWithChatGPT(
    persona.id,
    sceneDef.key,
    (prog) => {
      onProgress?.({
        total: 1,
        completed: prog.percent === 100 ? 1 : 0,
        currentSceneKey: sceneDef.key,
        currentSceneTitle: prog.message,
        percent: prog.percent,
        done: prog.percent === 100,
        latestSceneUrl: prog.percent === 100 && res.sceneUrl ? res.sceneUrl : undefined,
      });
    },
    options?.signal
  );

  const all = getAllPersonas();
  const refreshed = all.find((p) => p.id === persona.id) || { ...persona };
  if (res.sceneUrl) {
    const updatedScenes = { ...(refreshed.activityScenes || {}) };
    updatedScenes[sceneDef.key] = res.sceneUrl;
    if (sceneDef.aliases) {
      for (const a of sceneDef.aliases) {
        updatedScenes[a] = res.sceneUrl;
      }
    }
    refreshed.activityScenes = updatedScenes;
    saveCustomPersona(refreshed);
  }

  onProgress?.({
    total: 1,
    completed: 1,
    currentSceneKey: sceneDef.key,
    currentSceneTitle: `Scenen "${sceneDef.title}" er klar!`,
    percent: 100,
    done: true,
    latestSceneUrl: res.sceneUrl,
  });

  return refreshed;
}

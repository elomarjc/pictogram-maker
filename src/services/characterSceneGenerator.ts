import type { Persona } from '../types';
import {
  generateSceneImage,
  removeImageBackground,
  autoFitSceneToStandardFormat,
  getStoredWorkerUrl,
  getStoredApiKey,
} from './imageGenerationApi';
import { saveCustomPersona } from './personas';

export interface DefaultSceneDef {
  key: string;
  title: string;
  descriptionDanish: string;
  englishActivity: string;
  defaultBgColor: string;
  aliases?: string[];
}

export const DEFAULT_SCENE_DEFINITIONS: DefaultSceneDef[] = [
  {
    key: 'vaesketoeg',
    title: 'Vasketøj',
    descriptionDanish: 'Hænge vasketøj op ved vaskemaskinen',
    englishActivity:
      'hanging freshly washed colorful laundry clothes on a drying rack next to a modern white washing machine',
    defaultBgColor: '#fbb6db',
  },
  {
    key: 'kaffe',
    title: 'Kaffe & The',
    descriptionDanish: 'Drikke en varm kop kaffe eller the',
    englishActivity:
      'sitting comfortably at a kitchen table holding a warm steaming ceramic mug of coffee, smiling happily',
    defaultBgColor: '#fdef8c',
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
  },
  {
    key: 'spisetid',
    title: 'Spisetid',
    descriptionDanish: 'Spise et lækkert måltid mad ved bordet',
    englishActivity:
      'sitting at a dining table happily eating a delicious nutritious meal with plate, fork and knife',
    defaultBgColor: '#fdc67c',
    aliases: ['morgenmad', 'frokost', 'aftensmad', 'forberede_mad'],
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
    key: 'vaske_op',
    title: 'Vaske op',
    descriptionDanish: 'Vaske kopper og tallerkener op i køkkenet',
    englishActivity:
      'standing at the kitchen sink happily washing dishes with bubbly soap suds and dish brush',
    defaultBgColor: '#9ceacc',
  },
  {
    key: 'bolle',
    title: 'Bolle / Mellemmåltid',
    descriptionDanish: 'Spise en frisk bolle til mellemmåltid',
    englishActivity:
      'sitting relaxed enjoying a delicious freshly baked bun or pastry snack on a small plate',
    defaultBgColor: '#cdb7f8',
  },
  {
    key: 'sengetid',
    title: 'Sengetid & Sove',
    descriptionDanish: 'Ligge trygt i sengen og sove under dynen',
    englishActivity:
      'lying peacefully and cozy asleep in bed resting head on fluffy white pillow under warm blanket with small Zzz icons',
    defaultBgColor: '#97d9fc',
  },
  {
    key: 'gatur',
    title: 'Gåtur',
    descriptionDanish: 'Gå en frisk gåtur udendørs i godt vejr',
    englishActivity:
      'walking happily outdoors on a sunny footpath in a green park with lush trees and pleasant breeze',
    defaultBgColor: '#9adafd',
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
    title: 'Pause på sofa',
    descriptionDanish: 'Slappe af på en blød sofa foran tv',
    englishActivity:
      'sitting comfortably relaxed on a cozy living room sofa resting with a warm friendly smile',
    defaultBgColor: '#fdef8c',
    aliases: ['tv_skaerm'],
  },
  {
    key: 'skraldespand',
    title: 'Skraldespand',
    descriptionDanish: 'Gå ud til skraldespanden med affaldsposen',
    englishActivity:
      'carrying a tied green garbage trash bag to put into an outdoor wheelie dustbin, smiling',
    defaultBgColor: '#c1ea9a',
  },
  {
    key: 'handle',
    title: 'Handle ind',
    descriptionDanish: 'Handle ind i supermarkedet med indkøbskurv',
    englishActivity:
      'holding a colorful shopping basket with groceries happily walking down a neat supermarket aisle',
    defaultBgColor: '#fdc67c',
  },
];

/**
 * Checks which standard default scenes are missing from a given persona.
 */
export function getMissingScenesForPersona(persona: Persona): DefaultSceneDef[] {
  const scenes = persona.activityScenes || {};
  return DEFAULT_SCENE_DEFINITIONS.filter((def) => !scenes[def.key]);
}

/**
 * Returns total ready count out of standard 14 scenes.
 */
export function getReadyScenesCount(persona: Persona): { ready: number; total: number } {
  const scenes = persona.activityScenes || {};
  let ready = 0;
  for (const def of DEFAULT_SCENE_DEFINITIONS) {
    if (scenes[def.key]) ready++;
  }
  return { ready, total: DEFAULT_SCENE_DEFINITIONS.length };
}

/**
 * Constructs a prompt for Cloudflare Workers AI for a specific scene and persona.
 */
export function buildScenePromptForPersona(persona: Persona, sceneDef: DefaultSceneDef): string {
  const isWoman = persona.id === 'woman_a' || /kvinde/i.test(persona.name);
  const nameStr =
    persona.name && !persona.name.startsWith('avatar_') ? persona.name : 'the friendly character';
  let characterDesc: string;

  if (isWoman) {
    characterDesc =
      'A cheerful friendly cartoon woman with brown hair tied in a neat ponytail, round friendly face, rosy cheeks, warm smile, wearing a turquoise teal hoodie jacket over a t-shirt';
  } else if (persona.description && persona.description.trim() && persona.id !== 'man_k') {
    characterDesc = `A cheerful friendly cartoon character (${nameStr}), ${persona.description}`;
  } else if (persona.id === 'man_k') {
    characterDesc =
      'A cheerful friendly cartoon man with closely shaved buzzcut hair, round friendly face, rosy cheeks, warm open smile, wearing a grey hoodie jacket over a white t-shirt';
  } else {
    // Custom avatar persona
    characterDesc = `A cheerful friendly 2D cartoon character (${nameStr}), round friendly face, rosy cheeks, warm open smile, dressed in comfortable casual clothes matching avatar style`;
  }

  return `Clean 2D cartoon pictogram vector illustration, horizontal aspect ratio. ${characterDesc}, ${sceneDef.englishActivity}. Bold thick smooth black outlines, simple flat cel-shading, colorful and cheerful, isolated on pure solid white background, cute autism schedule pictogram, no text, no frame, wide horizontal composition.`;
}

/**
 * Generates a single scene for a persona, strips the background, and fits it into 2126x740 format.
 */
export async function generateSingleScene(
  persona: Persona,
  sceneDef: DefaultSceneDef,
  options?: { workerUrl?: string; apiKey?: string }
): Promise<string> {
  const workerUrl = options?.workerUrl || getStoredWorkerUrl();
  const apiKey = options?.apiKey || getStoredApiKey();

  const prompt = buildScenePromptForPersona(persona, sceneDef);
  const rawUrl = await generateSceneImage(prompt, {
    workerUrl,
    apiKey,
    model: '@cf/black-forest-labs/flux-1-schnell',
    numSteps: 4,
  });

  const transparentUrl = await removeImageBackground(rawUrl);
  const fittedUrl = await autoFitSceneToStandardFormat(transparentUrl);
  return fittedUrl;
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
}

/**
 * Batch generates all missing default scenes for a persona with live progress updates.
 * Automatically persists to localStorage after every single completed scene.
 */
export async function generateAllMissingScenes(
  persona: Persona,
  onProgress: (p: SceneGenProgress) => void,
  options?: {
    workerUrl?: string;
    apiKey?: string;
    signal?: AbortSignal;
  }
): Promise<Persona> {
  const missing = getMissingScenesForPersona(persona);
  const total = missing.length;
  if (total === 0) {
    onProgress({ total: 0, completed: 0, percent: 100, done: true });
    return persona;
  }

  let completed = 0;
  const updatedScenes = { ...(persona.activityScenes || {}) };

  for (const sceneDef of missing) {
    if (options?.signal?.aborted) {
      break;
    }

    onProgress({
      total,
      completed,
      currentSceneKey: sceneDef.key,
      currentSceneTitle: sceneDef.title,
      percent: Math.round((completed / total) * 100),
      done: false,
    });

    try {
      const finalUrl = await generateSingleScene(persona, sceneDef, options);
      updatedScenes[sceneDef.key] = finalUrl;

      // Also set aliases
      if (sceneDef.aliases) {
        for (const alias of sceneDef.aliases) {
          if (!updatedScenes[alias]) {
            updatedScenes[alias] = finalUrl;
          }
        }
      }

      completed++;

      // Immediately persist persona update so partial progress is never lost
      const updatedPersona: Persona = {
        ...persona,
        activityScenes: updatedScenes,
      };
      saveCustomPersona(updatedPersona);

      onProgress({
        total,
        completed,
        currentSceneKey: sceneDef.key,
        currentSceneTitle: sceneDef.title,
        percent: Math.round((completed / total) * 100),
        latestSceneUrl: finalUrl,
        done: completed === total,
      });
    } catch (err) {
      onProgress({
        total,
        completed,
        currentSceneKey: sceneDef.key,
        currentSceneTitle: sceneDef.title,
        percent: Math.round((completed / total) * 100),
        error: `Fejl ved ${sceneDef.title}: ${err instanceof Error ? err.message : String(err)}`,
        done: false,
      });
    }
  }

  const finalPersona: Persona = {
    ...persona,
    activityScenes: updatedScenes,
  };
  saveCustomPersona(finalPersona);
  return finalPersona;
}

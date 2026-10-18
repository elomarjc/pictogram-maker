import type { Persona, Pictogram } from '../types';

export const REFERENCE_PALETTE = {
  header: '#7ecbfc', // Sky blue with Sun and Cloud
  pink: '#fbb6db', // Vasketøj
  yellow: '#fdef8c', // The & Kaffe / Morgenmad
  green: '#c1ea9a', // Medicin
  cyan: '#9adafd', // Badetid
  orange: '#fdc67c', // Spisetid
  purple: '#ccadfb', // Aktiviteter
  mint: '#9ceacc', // Vaske op
  lavender: '#cdb7f8', // Bolle
  blue: '#97d9fc', // Sengetid
};

// Base URL helper to ensure assets load properly on GitHub Pages and local Vite preview
export const BASE = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;

export const PICTO_STYLE_REF_URL = `${BASE}reference/ref2_example.jpg`;

export const DEFAULT_PERSONAS: Persona[] = [
  {
    id: 'man_k',
    name: 'Mand',
    shortCode: 'K.',
    avatarUrl: `${BASE}reference/personas/man/avatar.webp`,
    description: 'Mandlig figur med kort hår og grå hættetrøje',
    activityScenes: {
      vaesketoeg: `${BASE}reference/personas/man/scenes/vaesketoeg.webp`,
      kaffe: `${BASE}reference/personas/man/scenes/kaffe.webp`,
      medicin: `${BASE}reference/personas/man/scenes/medicin.webp`,
      badetid: `${BASE}reference/personas/man/scenes/badetid.webp`,
      spisetid: `${BASE}reference/personas/man/scenes/spisetid.webp`,
      morgenmad: `${BASE}reference/personas/man/scenes/spisetid.webp`,
      frokost: `${BASE}reference/personas/man/scenes/spisetid.webp`,
      aftensmad: `${BASE}reference/personas/man/scenes/spisetid.webp`,
      aktiviteter: `${BASE}reference/personas/man/scenes/aktiviteter.webp`,
      vaske_op: `${BASE}reference/personas/man/scenes/vaske_op.webp`,
      bolle: `${BASE}reference/personas/man/scenes/bolle.webp`,
      sengetid: `${BASE}reference/personas/man/scenes/sengetid.webp`,
      gatur: `${BASE}reference/personas/man/scenes/gatur.webp`,
      rede_seng: `${BASE}reference/personas/man/scenes/rede_seng.webp`,
      pause_sofa: `${BASE}reference/personas/man/scenes/pause_sofa.webp`,
      tv_skaerm: `${BASE}reference/personas/man/scenes/pause_sofa.webp`,
      skraldespand: `${BASE}reference/personas/man/scenes/skraldespand.webp`,
      handle: `${BASE}reference/personas/man/scenes/handle.webp`,
      forberede_mad: `${BASE}reference/personas/man/scenes/spisetid.webp`,
    },
  },
  {
    id: 'woman_a',
    name: 'Kvinde',
    shortCode: 'A.',
    avatarUrl: `${BASE}reference/personas/woman/avatar.webp?v=transparent`,
    description: 'Kvindelig figur med hestehale og turkis hættetrøje',
    activityScenes: {
      vaesketoeg: `${BASE}reference/personas/woman/scenes/woman_vasketoj.webp`,
      kaffe: `${BASE}reference/personas/woman/scenes/woman_kaffe.webp`,
      medicin: `${BASE}reference/personas/woman/scenes/woman_medicin.webp`,
      badetid: `${BASE}reference/personas/woman/scenes/woman_badetid.webp`,
      spisetid: `${BASE}reference/personas/woman/scenes/woman_spisetid.webp`,
      morgenmad: `${BASE}reference/personas/woman/scenes/woman_spisetid.webp`,
      frokost: `${BASE}reference/personas/woman/scenes/woman_spisetid.webp`,
      aftensmad: `${BASE}reference/personas/woman/scenes/woman_spisetid.webp`,
      aktiviteter: `${BASE}reference/personas/man/scenes/aktiviteter.webp`,
      vaske_op: `${BASE}reference/personas/woman/scenes/woman_vasketoj.webp`,
      bolle: `${BASE}reference/personas/woman/scenes/woman_kaffe.webp`,
      sengetid: `${BASE}reference/personas/woman/scenes/woman_sengetid.webp`,
      gatur: `${BASE}reference/personas/man/scenes/gatur.webp`,
      rede_seng: `${BASE}reference/personas/man/scenes/rede_seng.webp`,
      pause_sofa: `${BASE}reference/personas/man/scenes/pause_sofa.webp`,
      tv_skaerm: `${BASE}reference/personas/man/scenes/pause_sofa.webp`,
      skraldespand: `${BASE}reference/personas/man/scenes/skraldespand.webp`,
      handle: `${BASE}reference/personas/man/scenes/handle.webp`,
      forberede_mad: `${BASE}reference/personas/woman/scenes/woman_spisetid.webp`,
    },
  },
];

export const REFERENCE_ICONS: Record<string, string> = {
  toej_snor: `${BASE}reference/icons/toej_snor.webp`,
  kop: `${BASE}reference/icons/kop.webp`,
  piller: `${BASE}reference/icons/piller.webp`,
  bruser: `${BASE}reference/icons/bruser.webp`,
  tallerken_bestik: `${BASE}reference/icons/tallerken_bestik.webp`,
  opvask: `${BASE}reference/icons/opvask.webp`,
  bolle_ikon: `${BASE}reference/icons/bolle_ikon.webp`,
  seng_ikon: `${BASE}reference/icons/seng_ikon.webp`,
  sun: `${BASE}reference/icons/sun.webp`,
  cloud: `${BASE}reference/icons/cloud.webp`,
};

// Activity key to standard icon mapping
export const ACTIVITY_DEFAULT_ICONS: Record<string, string> = {
  vaesketoeg: `${BASE}reference/icons/toej_snor.webp`,
  kaffe: `${BASE}reference/icons/kop.webp`,
  medicin: `${BASE}reference/icons/piller.webp`,
  badetid: `${BASE}reference/icons/bruser.webp`,
  spisetid: `${BASE}reference/icons/tallerken_bestik.webp`,
  morgenmad: `${BASE}reference/icons/tallerken_bestik.webp`,
  frokost: `${BASE}reference/icons/tallerken_bestik.webp`,
  aftensmad: `${BASE}reference/icons/tallerken_bestik.webp`,
  vaske_op: `${BASE}reference/icons/opvask.webp`,
  bolle: `${BASE}reference/icons/bolle_ikon.webp`,
  sengetid: `${BASE}reference/icons/seng_ikon.webp`,
};

import { getDbItem, setDbItem } from './storageDb';

const STORAGE_KEY_CUSTOM_PERSONAS = 'pictogram_custom_personas';

let memoryCustomPersonas: Persona[] | null = null;

// Background hydration from IndexedDB for large assets
if (typeof window !== 'undefined') {
  getDbItem<Persona[]>(STORAGE_KEY_CUSTOM_PERSONAS)
    .then((idbPersonas) => {
      if (idbPersonas && Array.isArray(idbPersonas) && idbPersonas.length > 0) {
        memoryCustomPersonas = idbPersonas;
      }
    })
    .catch(() => {});
}

export function getCustomPersonas(): Persona[] {
  if (memoryCustomPersonas) {
    return memoryCustomPersonas;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_PERSONAS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      memoryCustomPersonas = parsed;
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

export function saveCustomPersona(newPersona: Persona): void {
  const current = [...getCustomPersonas()];
  const existingIndex = current.findIndex((p) => p.id === newPersona.id);
  if (existingIndex >= 0) {
    current[existingIndex] = newPersona;
  } else {
    current.push(newPersona);
  }
  memoryCustomPersonas = current;

  // 1. Always persist to IndexedDB (virtually unlimited quota for images)
  setDbItem(STORAGE_KEY_CUSTOM_PERSONAS, current);

  // 2. Safely attempt localStorage with try/catch to avoid QuotaExceededError crashes
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_PERSONAS, JSON.stringify(current));
  } catch (quotaErr) {
    console.warn('[personas] localStorage kvote overskredet, gemt sikkert i IndexedDB:', quotaErr);
  }
}

export function deleteCustomPersona(id: string): void {
  const current = getCustomPersonas();
  const filtered = current.filter((p) => p.id !== id);
  memoryCustomPersonas = filtered;

  setDbItem(STORAGE_KEY_CUSTOM_PERSONAS, filtered);

  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_PERSONAS, JSON.stringify(filtered));
  } catch (quotaErr) {
    console.warn('[personas] Fejl ved sletning i localStorage:', quotaErr);
  }
}

export function isDefaultPersona(id: string): boolean {
  return DEFAULT_PERSONAS.some((p) => p.id === id);
}

export function getAllPersonas(): Persona[] {
  const custom = getCustomPersonas();
  const defaultList = DEFAULT_PERSONAS.map((def) => {
    const override = custom.find((c) => c.id === def.id);
    return override || def;
  });
  const purelyCustom = custom.filter((c) => !DEFAULT_PERSONAS.some((d) => d.id === c.id));
  return [...defaultList, ...purelyCustom];
}

export function getPersona(id?: string): Persona {
  const all = getAllPersonas();
  const found = all.find((p) => p.id === id);
  return found || DEFAULT_PERSONAS[0];
}

export function resolveSceneImage(pic: Pictogram, persona: Persona): string | null {
  if (pic.customImageUrl) return pic.customImageUrl;
  if (pic.sceneImageUrl) return pic.sceneImageUrl;

  const key = pic.illustrationId;
  if (key && persona.activityScenes[key]) {
    return persona.activityScenes[key];
  }
  return null;
}

export function resolveRightIcon(pic: Pictogram): string | null {
  if (pic.rightIconUrl) return pic.rightIconUrl;
  const key = pic.illustrationId;
  if (key && ACTIVITY_DEFAULT_ICONS[key]) {
    return ACTIVITY_DEFAULT_ICONS[key];
  }
  return null;
}

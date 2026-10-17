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
const BASE = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;

export const DEFAULT_PERSONAS: Persona[] = [
  {
    id: 'man_k',
    name: 'Mand',
    shortCode: 'K.',
    avatarUrl: `${BASE}reference/persona_man_avatar.webp`,
    description: 'Mandlig figur med kort hår og grå hættetrøje',
    activityScenes: {
      vaesketoeg: `${BASE}reference/scenes/vaesketoeg.webp`,
      kaffe: `${BASE}reference/scenes/kaffe.webp`,
      medicin: `${BASE}reference/scenes/medicin.webp`,
      badetid: `${BASE}reference/scenes/badetid.webp`,
      spisetid: `${BASE}reference/scenes/spisetid.webp`,
      morgenmad: `${BASE}reference/scenes/spisetid.webp`,
      frokost: `${BASE}reference/scenes/spisetid.webp`,
      aftensmad: `${BASE}reference/scenes/spisetid.webp`,
      aktiviteter: `${BASE}reference/scenes/aktiviteter.webp`,
      vaske_op: `${BASE}reference/scenes/vaske_op.webp`,
      bolle: `${BASE}reference/scenes/bolle.webp`,
      sengetid: `${BASE}reference/scenes/sengetid.webp`,
      gatur: `${BASE}reference/scenes/gatur.webp`,
      rede_seng: `${BASE}reference/scenes/rede_seng.webp`,
      pause_sofa: `${BASE}reference/scenes/pause_sofa.webp`,
      tv_skaerm: `${BASE}reference/scenes/pause_sofa.webp`,
      skraldespand: `${BASE}reference/scenes/skraldespand.webp`,
      handle: `${BASE}reference/scenes/handle.webp`,
      forberede_mad: `${BASE}reference/scenes/spisetid.webp`,
    },
  },
  {
    id: 'woman_a',
    name: 'Kvinde',
    shortCode: 'A.',
    avatarUrl: `${BASE}reference/persona_woman_avatar.webp`,
    description: 'Kvindelig figur med hestehale og turkis hættetrøje',
    activityScenes: {
      vaesketoeg: `${BASE}reference/scenes/woman_vasketoj.webp`,
      kaffe: `${BASE}reference/scenes/woman_kaffe.webp`,
      medicin: `${BASE}reference/scenes/woman_medicin.webp`,
      badetid: `${BASE}reference/scenes/woman_badetid.webp`,
      spisetid: `${BASE}reference/scenes/woman_spisetid.webp`,
      morgenmad: `${BASE}reference/scenes/woman_spisetid.webp`,
      frokost: `${BASE}reference/scenes/woman_spisetid.webp`,
      aftensmad: `${BASE}reference/scenes/woman_spisetid.webp`,
      aktiviteter: `${BASE}reference/scenes/aktiviteter.webp`,
      vaske_op: `${BASE}reference/scenes/woman_vasketoj.webp`,
      bolle: `${BASE}reference/scenes/woman_kaffe.webp`,
      sengetid: `${BASE}reference/scenes/woman_sengetid.webp`,
      gatur: `${BASE}reference/scenes/gatur.webp`,
      rede_seng: `${BASE}reference/scenes/rede_seng.webp`,
      pause_sofa: `${BASE}reference/scenes/pause_sofa.webp`,
      tv_skaerm: `${BASE}reference/scenes/pause_sofa.webp`,
      skraldespand: `${BASE}reference/scenes/skraldespand.webp`,
      handle: `${BASE}reference/scenes/handle.webp`,
      forberede_mad: `${BASE}reference/scenes/woman_spisetid.webp`,
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

const STORAGE_KEY_CUSTOM_PERSONAS = 'pictogram_custom_personas';

export function getCustomPersonas(): Persona[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_PERSONAS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCustomPersona(newPersona: Persona): void {
  const current = getCustomPersonas();
  const existingIndex = current.findIndex((p) => p.id === newPersona.id);
  if (existingIndex >= 0) {
    current[existingIndex] = newPersona;
  } else {
    current.push(newPersona);
  }
  localStorage.setItem(STORAGE_KEY_CUSTOM_PERSONAS, JSON.stringify(current));
}

export function getAllPersonas(): Persona[] {
  const custom = getCustomPersonas();
  return [...DEFAULT_PERSONAS, ...custom];
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

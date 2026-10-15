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

export const DEFAULT_PERSONAS: Persona[] = [
  {
    id: 'man_k',
    name: 'Mand (K.)',
    shortCode: 'K.',
    avatarUrl: '/reference/persona_man_avatar.png',
    description: 'Mandlig figur med kort hår og grå hættetrøje – tro kopi af reference-skabelonen',
    activityScenes: {
      vaesketoeg: '/reference/scenes/vaesketoeg.png',
      kaffe: '/reference/scenes/kaffe.png',
      medicin: '/reference/scenes/medicin.png',
      badetid: '/reference/scenes/badetid.png',
      spisetid: '/reference/scenes/spisetid.png',
      morgenmad: '/reference/scenes/spisetid.png',
      frokost: '/reference/scenes/spisetid.png',
      aftensmad: '/reference/scenes/spisetid.png',
      aktiviteter: '/reference/scenes/aktiviteter.png',
      vaske_op: '/reference/scenes/vaske_op.png',
      bolle: '/reference/scenes/bolle.png',
      sengetid: '/reference/scenes/sengetid.png',
      gatur: '/reference/scenes/gatur.png',
      rede_seng: '/reference/scenes/rede_seng.png',
      pause_sofa: '/reference/scenes/pause_sofa.png',
      tv_skaerm: '/reference/scenes/pause_sofa.png',
      skraldespand: '/reference/scenes/skraldespand.png',
      handle: '/reference/scenes/handle.png',
      forberede_mad: '/reference/scenes/spisetid.png',
    },
  },
  {
    id: 'woman_a',
    name: 'Kvinde (A.)',
    shortCode: 'A.',
    avatarUrl: '/reference/persona_woman_avatar.png',
    description: 'Kvindelig figur med hestehale og turkis hættetrøje i samme visuelle stil',
    activityScenes: {
      vaesketoeg: '/reference/scenes/woman_vasketoj.png',
      kaffe: '/reference/scenes/woman_kaffe.png',
      medicin: '/reference/scenes/woman_medicin.png',
      badetid: '/reference/scenes/woman_badetid.png',
      spisetid: '/reference/scenes/woman_spisetid.png',
      morgenmad: '/reference/scenes/woman_spisetid.png',
      frokost: '/reference/scenes/woman_spisetid.png',
      aftensmad: '/reference/scenes/woman_spisetid.png',
      aktiviteter: '/reference/scenes/aktiviteter.png',
      vaske_op: '/reference/scenes/woman_vasketoj.png',
      bolle: '/reference/scenes/woman_kaffe.png',
      sengetid: '/reference/scenes/woman_sengetid.png',
      gatur: '/reference/scenes/gatur.png',
      rede_seng: '/reference/scenes/rede_seng.png',
      pause_sofa: '/reference/scenes/pause_sofa.png',
      tv_skaerm: '/reference/scenes/pause_sofa.png',
      skraldespand: '/reference/scenes/skraldespand.png',
      handle: '/reference/scenes/handle.png',
      forberede_mad: '/reference/scenes/woman_spisetid.png',
    },
  },
];

export const REFERENCE_ICONS: Record<string, string> = {
  toej_snor: '/reference/icons/toej_snor.png',
  kop: '/reference/icons/kop.png',
  piller: '/reference/icons/piller.png',
  bruser: '/reference/icons/bruser.png',
  tallerken_bestik: '/reference/icons/tallerken_bestik.png',
  opvask: '/reference/icons/opvask.png',
  bolle_ikon: '/reference/icons/bolle_ikon.png',
  seng_ikon: '/reference/icons/seng_ikon.png',
  sun: '/reference/icons/sun.png',
  cloud: '/reference/icons/cloud.png',
};

// Activity key to standard icon mapping
export const ACTIVITY_DEFAULT_ICONS: Record<string, string> = {
  vaesketoeg: '/reference/icons/toej_snor.png',
  kaffe: '/reference/icons/kop.png',
  medicin: '/reference/icons/piller.png',
  badetid: '/reference/icons/bruser.png',
  spisetid: '/reference/icons/tallerken_bestik.png',
  morgenmad: '/reference/icons/tallerken_bestik.png',
  frokost: '/reference/icons/tallerken_bestik.png',
  aftensmad: '/reference/icons/tallerken_bestik.png',
  vaske_op: '/reference/icons/opvask.png',
  bolle: '/reference/icons/bolle_ikon.png',
  sengetid: '/reference/icons/seng_ikon.png',
};

export function getPersona(id?: string): Persona {
  const found = DEFAULT_PERSONAS.find((p) => p.id === id);
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

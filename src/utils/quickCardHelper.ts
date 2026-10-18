import { REFERENCE_PALETTE } from '../services/personas';

export interface QuickCardDefaults {
  iconId: string;
  bgColor: string;
}

const PALETTE_CYCLE = [
  REFERENCE_PALETTE.yellow,
  REFERENCE_PALETTE.cyan,
  REFERENCE_PALETTE.pink,
  REFERENCE_PALETTE.green,
  REFERENCE_PALETTE.orange,
  REFERENCE_PALETTE.purple,
  REFERENCE_PALETTE.mint,
  REFERENCE_PALETTE.lavender,
];

export function guessIconAndColor(title: string, index = 0): QuickCardDefaults {
  const lower = title.toLowerCase();

  // Mad & Drikke
  if (
    lower.includes('kaffe') ||
    lower.includes(' the') ||
    lower.includes('te ') ||
    lower.includes('te&') ||
    lower.includes('the&') ||
    lower.includes('the og kaffe') ||
    lower.includes('kaffe & the')
  ) {
    return { iconId: 'coffee', bgColor: REFERENCE_PALETTE.yellow };
  }
  if (lower.includes('morgenmad')) {
    return { iconId: 'utensils', bgColor: REFERENCE_PALETTE.yellow };
  }
  if (
    lower.includes('frokost') ||
    lower.includes('middag') ||
    lower.includes('aftensmad') ||
    lower.includes('spisetid') ||
    lower.includes('lave mad') ||
    lower.includes('spise')
  ) {
    return { iconId: 'utensils', bgColor: REFERENCE_PALETTE.orange };
  }
  if (lower.includes('frugt') || lower.includes('snack') || lower.includes('æble')) {
    return { iconId: 'apple', bgColor: REFERENCE_PALETTE.orange };
  }
  if (lower.includes('bolle') || lower.includes('brød') || lower.includes('kage')) {
    return { iconId: 'bun', bgColor: REFERENCE_PALETTE.lavender };
  }

  // Hygiejne & Pleje
  if (
    lower.includes('medicin') ||
    lower.includes('pille') ||
    lower.includes('vitamin') ||
    lower.includes('dråber')
  ) {
    return { iconId: 'pill', bgColor: REFERENCE_PALETTE.green };
  }
  if (
    lower.includes('bad') ||
    lower.includes('brusebad') ||
    lower.includes('karbad') ||
    lower.includes('bade')
  ) {
    return { iconId: 'shower', bgColor: REFERENCE_PALETTE.cyan };
  }
  if (lower.includes('tand') || lower.includes('børste tænder')) {
    return { iconId: 'sparkles', bgColor: REFERENCE_PALETTE.cyan };
  }

  // Pligter
  if (lower.includes('vask') || lower.includes('tøj')) {
    return { iconId: 'shirt', bgColor: REFERENCE_PALETTE.pink };
  }
  if (
    lower.includes('skrald') ||
    lower.includes('affald') ||
    lower.includes('flaske') ||
    lower.includes('pant')
  ) {
    return { iconId: 'trash', bgColor: REFERENCE_PALETTE.green };
  }
  if (lower.includes('rede seng')) {
    return { iconId: 'bed_make', bgColor: REFERENCE_PALETTE.cyan };
  }
  if (lower.includes('handle') || lower.includes('indkøb') || lower.includes('købe')) {
    return { iconId: 'shopping', bgColor: REFERENCE_PALETTE.orange };
  }
  if (lower.includes('opvask') || lower.includes('rengør') || lower.includes('støvsuge')) {
    return { iconId: 'brush', bgColor: REFERENCE_PALETTE.mint };
  }

  // Aktiviteter
  if (
    lower.includes('gåtur') ||
    lower.includes('gå tur') ||
    lower.includes('luft') ||
    lower.includes('spadsere')
  ) {
    return { iconId: 'walk', bgColor: REFERENCE_PALETTE.green };
  }
  if (lower.includes('cyk') || lower.includes('cykel')) {
    return { iconId: 'bike', bgColor: REFERENCE_PALETTE.green };
  }
  if (lower.includes('kreativ') || lower.includes('male') || lower.includes('perler')) {
    return { iconId: 'palette', bgColor: REFERENCE_PALETTE.purple };
  }
  if (lower.includes('musik') || lower.includes('sang') || lower.includes('klaver')) {
    return { iconId: 'music', bgColor: REFERENCE_PALETTE.purple };
  }
  if (lower.includes('natur') || lower.includes('have') || lower.includes('skov')) {
    return { iconId: 'trees', bgColor: REFERENCE_PALETTE.green };
  }
  if (lower.includes('svøm')) {
    return { iconId: 'swim', bgColor: REFERENCE_PALETTE.cyan };
  }
  if (lower.includes('spil') || lower.includes('gaming') || lower.includes('playstation')) {
    return { iconId: 'games', bgColor: REFERENCE_PALETTE.purple };
  }
  if (lower.includes('bog') || lower.includes('læse')) {
    return { iconId: 'book', bgColor: REFERENCE_PALETTE.yellow };
  }
  if (lower.includes('træn') || lower.includes('gymnastik') || lower.includes('salen')) {
    return { iconId: 'workout', bgColor: REFERENCE_PALETTE.purple };
  }

  // Rutine & Ro
  if (
    lower.includes('sengetid') ||
    lower.includes('sove') ||
    lower.includes('i seng') ||
    lower.includes('godnat')
  ) {
    return { iconId: 'bed', bgColor: REFERENCE_PALETTE.blue };
  }
  if (
    lower.includes('tv') ||
    lower.includes('film') ||
    lower.includes('fjernsyn') ||
    lower.includes('serie')
  ) {
    return { iconId: 'tv', bgColor: REFERENCE_PALETTE.blue };
  }
  if (
    lower.includes('pause') ||
    lower.includes('sofa') ||
    lower.includes('slappe') ||
    lower.includes('ro')
  ) {
    return { iconId: 'smile', bgColor: REFERENCE_PALETTE.lavender };
  }

  // Default cycle based on count
  return {
    iconId: 'smile',
    bgColor: PALETTE_CYCLE[index % PALETTE_CYCLE.length],
  };
}

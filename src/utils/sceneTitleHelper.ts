/**
 * Helper to generate concise, friendly Danish scene titles based on activity descriptions.
 * Avoids cut-off words, removes narrative prefixes like "Figuren er i gang med...",
 * and maps common daily schedule routines to standard Danish titles.
 */

export function getShortSceneTitle(description: string, fallbackTitle?: string): string {
  const clean = (description || '').trim();
  if (!clean) {
    if (fallbackTitle && fallbackTitle.trim() && fallbackTitle.trim() !== 'Aktivitetsnavn') {
      return fallbackTitle.trim();
    }
    return 'Ny scene';
  }

  const lower = clean.toLowerCase();

  // 1. Direct keyword mapping for common visual schedule activities
  if (
    lower.includes('vasketøj') ||
    lower.includes('tøjvask') ||
    lower.includes('vaske tøj') ||
    lower.includes('vasker tøj') ||
    lower.includes('hænge tøj op')
  ) {
    return 'Vasketøj';
  }
  if (
    lower.includes('tandbørst') ||
    lower.includes('børste tænder') ||
    lower.includes('børster tænder') ||
    lower.includes('tandpasta')
  ) {
    return 'Børste tænder';
  }
  if (lower.includes('medicin') || lower.includes('pille') || lower.includes('vitamin') || lower.includes('dråber')) {
    return 'Medicin';
  }
  if (
    lower.includes('brusebad') ||
    lower.includes('bruser') ||
    lower.includes('karbad') ||
    lower.includes('bade') ||
    lower.includes('i bad')
  ) {
    return 'Badetid';
  }
  if (
    lower.includes('kaffe') ||
    lower.includes('morgenkaffe') ||
    lower.includes('the') ||
    lower.includes('kop te') ||
    lower.includes('formiddagskop')
  ) {
    return 'Kaffe & The';
  }
  if (lower.includes('morgenmad')) {
    return 'Morgenmad';
  }
  if (lower.includes('frokost')) {
    return 'Frokost';
  }
  if (lower.includes('aftensmad') || lower.includes('aftenmad')) {
    return 'Aftensmad';
  }
  if (
    lower.includes('spisetid') ||
    lower.includes('spise mad') ||
    lower.includes('måltid') ||
    lower.includes('spisning')
  ) {
    return 'Spisetid';
  }
  if (
    lower.includes('vaske op') ||
    lower.includes('vasker op') ||
    lower.includes('opvask') ||
    lower.includes('opvaskemaskine')
  ) {
    return 'Vaske op';
  }
  if (
    lower.includes('bolle') ||
    lower.includes('mellemmåltid') ||
    lower.includes('wienerbrød') ||
    lower.includes('kage')
  ) {
    return 'Bolle & Pause';
  }
  if (
    lower.includes('sengetid') ||
    lower.includes('sove') ||
    lower.includes('i seng') ||
    lower.includes('godnat') ||
    lower.includes('dynen')
  ) {
    return 'Sengetid';
  }
  if (lower.includes('rede seng') || lower.includes('reder seng')) {
    return 'Rede seng';
  }
  if (
    lower.includes('gåtur') ||
    lower.includes('gå tur') ||
    lower.includes('lufte hund') ||
    lower.includes('spadsere') ||
    lower.includes('frisk luft')
  ) {
    return 'Gåtur';
  }
  if (
    lower.includes('sofa') ||
    lower.includes('slappe af') ||
    lower.includes('pause') ||
    lower.includes('fjernsyn') ||
    lower.includes('tv')
  ) {
    return 'Pause på sofa';
  }
  if (
    lower.includes('skrald') ||
    lower.includes('affald') ||
    lower.includes('skraldespand') ||
    lower.includes('pant') ||
    lower.includes('sortere')
  ) {
    return 'Skraldespand';
  }
  if (
    lower.includes('handle') ||
    lower.includes('indkøb') ||
    lower.includes('supermarked') ||
    lower.includes('købe ind') ||
    lower.includes('netto') ||
    lower.includes('rema')
  ) {
    return 'Handle ind';
  }
  if (lower.includes('cykel') || lower.includes('cykle') || lower.includes('cykler')) {
    return 'Cykeltur';
  }
  if (lower.includes('bog') || lower.includes('læse') || lower.includes('læser')) {
    return 'Læse bog';
  }
  if (lower.includes('brætspil') || lower.includes('spil') || lower.includes('kortspil') || lower.includes('puslespil')) {
    return 'Spille spil';
  }
  if (lower.includes('tegne') || lower.includes('male') || lower.includes('kreativ') || lower.includes('farvelægge')) {
    return 'Tegne & Male';
  }
  if (lower.includes('computer') || lower.includes('gamer') || lower.includes('pc') || lower.includes('ipad')) {
    return 'Computer / Skærm';
  }
  if (
    lower.includes('have') ||
    lower.includes('plante') ||
    lower.includes('blomst') ||
    lower.includes('vande') ||
    lower.includes('havearbejde')
  ) {
    return 'Havearbejde';
  }
  if (lower.includes('støvsuge') || lower.includes('støvsug')) {
    return 'Støvsuge';
  }
  if (lower.includes('vaske hænder') || lower.includes('toilet') || lower.includes('håndvask')) {
    return 'Vaske hænder';
  }

  // 2. Strip narrative Danish subject prefixes like "Figuren...", "Han...", "Manden...", "er i gang med at..."
  let text = clean
    .replace(
      /^(figuren|personen|manden|kvinden|han|hun)\s+(er\s+i\s+gang\s+med\s+at\s+|skal\s+|er\s+ved\s+at\s+|sidder\s+og\s+|står\s+og\s+|ligger\s+og\s+|)/i,
      ''
    )
    .trim();

  // 3. Clean word-boundary truncation (max 24 chars) to prevent cut-off words
  if (text.length > 24) {
    const sub = text.slice(0, 24);
    const lastSpace = sub.lastIndexOf(' ');
    if (lastSpace > 6) {
      text = sub.slice(0, lastSpace);
    } else {
      text = sub;
    }
  }

  // 4. Capitalize first letter
  text = text.charAt(0).toUpperCase() + text.slice(1);

  if (!text.trim() && fallbackTitle && fallbackTitle.trim() !== 'Aktivitetsnavn') {
    return fallbackTitle.trim();
  }

  return text.trim() || 'Ny scene';
}

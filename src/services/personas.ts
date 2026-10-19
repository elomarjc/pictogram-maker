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

export const PICTO_STYLE_REF_URL = `${BASE}reference/style_guide/ref2_example.jpg`;

export const DEFAULT_PERSONAS: Persona[] = [
  {
    id: 'avatar_1',
    name: 'avatar_1',
    shortCode: 'avatar_1',
    avatarUrl: `${BASE}reference/personas/avatar_1/avatar.webp`,
    description: 'avatar_1',
    activityScenes: {
      vaesketoeg: `${BASE}reference/personas/avatar_1/scenes/vaesketoeg.webp`,
      kaffe: `${BASE}reference/personas/avatar_1/scenes/kaffe.webp`,
      medicin: `${BASE}reference/personas/avatar_1/scenes/medicin.webp`,
      badetid: `${BASE}reference/personas/avatar_1/scenes/badetid.webp`,
      spisetid: `${BASE}reference/personas/avatar_1/scenes/spisetid.webp`,
      morgenmad: `${BASE}reference/personas/avatar_1/scenes/morgenmad.webp`,
      frokost: `${BASE}reference/personas/avatar_1/scenes/frokost.webp`,
      aftensmad: `${BASE}reference/personas/avatar_1/scenes/spisetid.webp`,
      aktiviteter: `${BASE}reference/personas/avatar_1/scenes/aktiviteter.webp`,
      vaske_op: `${BASE}reference/personas/avatar_1/scenes/vaske_op.webp`,
      bolle: `${BASE}reference/personas/avatar_1/scenes/bolle.webp`,
      sengetid: `${BASE}reference/personas/avatar_1/scenes/sengetid.webp`,
      gatur: `${BASE}reference/personas/avatar_1/scenes/gatur.webp`,
      rede_seng: `${BASE}reference/personas/avatar_1/scenes/rede_seng.webp`,
      pause_sofa: `${BASE}reference/personas/avatar_1/scenes/pause_sofa.webp`,
      tv_skaerm: `${BASE}reference/personas/avatar_1/scenes/pause_sofa.webp`,
      skraldespand: `${BASE}reference/personas/avatar_1/scenes/skraldespand.webp`,
      handle: `${BASE}reference/personas/avatar_1/scenes/handle.webp`,
      forberede_mad: `${BASE}reference/personas/avatar_1/scenes/spisetid.webp`,
      boerste_taender: `${BASE}reference/personas/avatar_1/scenes/boerste_taender.webp`,
      cykeltur: `${BASE}reference/personas/avatar_1/scenes/cykeltur.webp`,
      weekend: `${BASE}reference/personas/avatar_1/scenes/weekend.webp`,
    },
  },
  {
    id: 'avatar_2',
    name: 'avatar_2',
    shortCode: 'avatar_2',
    avatarUrl: `${BASE}reference/personas/avatar_2/avatar.webp?v=transparent`,
    description: 'avatar_2',
    activityScenes: {
      vaesketoeg: `${BASE}reference/personas/avatar_2/scenes/vaesketoeg.webp`,
      kaffe: `${BASE}reference/personas/avatar_2/scenes/kaffe.webp`,
      medicin: `${BASE}reference/personas/avatar_2/scenes/medicin.webp`,
      badetid: `${BASE}reference/personas/avatar_2/scenes/badetid.webp`,
      spisetid: `${BASE}reference/personas/avatar_2/scenes/spisetid.webp`,
      morgenmad: `${BASE}reference/personas/avatar_2/scenes/spisetid.webp`,
      frokost: `${BASE}reference/personas/avatar_2/scenes/spisetid.webp`,
      aftensmad: `${BASE}reference/personas/avatar_2/scenes/spisetid.webp`,
      aktiviteter: `${BASE}reference/personas/avatar_1/scenes/aktiviteter.webp`,
      vaske_op: `${BASE}reference/personas/avatar_2/scenes/vaesketoeg.webp`,
      bolle: `${BASE}reference/personas/avatar_2/scenes/kaffe.webp`,
      sengetid: `${BASE}reference/personas/avatar_2/scenes/sengetid.webp`,
      gatur: `${BASE}reference/personas/avatar_1/scenes/gatur.webp`,
      rede_seng: `${BASE}reference/personas/avatar_1/scenes/rede_seng.webp`,
      pause_sofa: `${BASE}reference/personas/avatar_1/scenes/pause_sofa.webp`,
      tv_skaerm: `${BASE}reference/personas/avatar_1/scenes/pause_sofa.webp`,
      skraldespand: `${BASE}reference/personas/avatar_1/scenes/skraldespand.webp`,
      handle: `${BASE}reference/personas/avatar_1/scenes/handle.webp`,
      forberede_mad: `${BASE}reference/personas/avatar_2/scenes/spisetid.webp`,
    },
  },
];

import { getDbItem, setDbItem } from './storageDb';

export interface DeletedPersona extends Persona {
  deletedAt: string;
}

const STORAGE_KEY_CUSTOM_PERSONAS = 'pictogram_custom_personas';
const STORAGE_KEY_DELETED_PERSONAS = 'pictogram_deleted_personas';

let memoryCustomPersonas: Persona[] | null = null;
let memoryDeletedPersonas: DeletedPersona[] | null = null;

export function resolveAssetUrl(url?: string): string {
  if (!url) return '';
  if (
    url.startsWith('data:') ||
    url.startsWith('blob:') ||
    url.startsWith('http:') ||
    url.startsWith('https:')
  ) {
    return url;
  }
  if (url.startsWith(BASE)) {
    return url;
  }
  let clean = url.startsWith('/') ? url.slice(1) : url;
  // Backward compatibility for legacy paths
  if (clean === 'reference/ref2_example.jpg') {
    clean = 'reference/style_guide/ref2_example.jpg';
  }
  if (clean.includes('personas/man/')) {
    clean = clean.replace('personas/man/', 'personas/avatar_1/');
  }
  if (clean.includes('personas/woman/')) {
    clean = clean.replace('personas/woman/', 'personas/avatar_2/');
  }
  if (clean.includes('personas/man_k/')) {
    clean = clean.replace('personas/man_k/', 'personas/avatar_1/');
  }
  if (clean.includes('personas/woman_a/')) {
    clean = clean.replace('personas/woman_a/', 'personas/avatar_2/');
  }
  return `${BASE}${clean}`;
}

export async function syncPersonasFromManifest(): Promise<void> {
  try {
    const res = await fetch(`${BASE}reference/personas/personas_manifest.json`);
    if (!res.ok) return;
    const manifest: Persona[] = await res.json();
    if (!Array.isArray(manifest) || manifest.length === 0) return;

    const current = getCustomPersonas();
    let changed = false;
    for (const item of manifest) {
      if (!item || !item.id) continue;
      if (item.id === 'man' || item.id === 'woman' || item.id === 'man_k' || item.id === 'woman_a') continue;
      const existingIndex = current.findIndex((p) => p.id === item.id);
      if (existingIndex === -1) {
        current.push(item);
        changed = true;
      }
    }
    if (changed) {
      memoryCustomPersonas = current;
      setDbItem(STORAGE_KEY_CUSTOM_PERSONAS, current);
      try {
        localStorage.setItem(STORAGE_KEY_CUSTOM_PERSONAS, JSON.stringify(current));
      } catch {}
    }
  } catch {}
}

// Background hydration from IndexedDB for large assets
if (typeof window !== 'undefined') {
  getDbItem<Persona[]>(STORAGE_KEY_CUSTOM_PERSONAS)
    .then((idbPersonas) => {
      if (idbPersonas && Array.isArray(idbPersonas) && idbPersonas.length > 0) {
        memoryCustomPersonas = idbPersonas;
      }
    })
    .catch(() => {});

  getDbItem<DeletedPersona[]>(STORAGE_KEY_DELETED_PERSONAS)
    .then((idbDeleted) => {
      if (idbDeleted && Array.isArray(idbDeleted) && idbDeleted.length > 0) {
        memoryDeletedPersonas = idbDeleted;
      }
    })
    .catch(() => {});

  syncPersonasFromManifest();
}

export function getCustomPersonas(): Persona[] {
  let list: Persona[] = [];
  if (memoryCustomPersonas) {
    list = memoryCustomPersonas;
  } else {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_PERSONAS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          list = parsed;
        }
      }
    } catch {
      list = [];
    }
  }

  // Filter out any legacy IDs and enforce clean avatar_1 / avatar_2 names without gender
  const cleanList = list
    .filter((p) => p && p.id && p.id !== 'man' && p.id !== 'woman' && p.id !== 'man_k' && p.id !== 'woman_a')
    .map((p) => {
      if (p.id === 'avatar_1' || p.id === 'avatar_2') {
        return {
          ...p,
          name: p.id,
          shortCode: p.id,
          description: p.id,
        };
      }
      return p;
    });

  memoryCustomPersonas = cleanList;
  return cleanList;
}

export function getDeletedPersonas(): DeletedPersona[] {
  if (memoryDeletedPersonas) {
    return memoryDeletedPersonas;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DELETED_PERSONAS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      memoryDeletedPersonas = parsed;
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

  // 3. Sync to local disk / GitHub directory if dev server is running
  if (typeof window !== 'undefined') {
    fetch('/api/personas/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPersona),
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          if (data?.persona) {
            const diskPersona: Persona = data.persona;
            const updated = [...getCustomPersonas()];
            const idx = updated.findIndex((p) => p.id === diskPersona.id);
            if (idx >= 0) {
              updated[idx] = diskPersona;
              memoryCustomPersonas = updated;
              setDbItem(STORAGE_KEY_CUSTOM_PERSONAS, updated);
              try {
                localStorage.setItem(STORAGE_KEY_CUSTOM_PERSONAS, JSON.stringify(updated));
              } catch {}
            }
          }
        }
      })
      .catch(() => {});
  }
}

export function deleteCustomPersona(id: string, options?: { permanent?: boolean }): Persona | null {
  const current = getCustomPersonas();
  const target = current.find((p) => p.id === id);
  if (!target) return null;

  const filtered = current.filter((p) => p.id !== id);
  memoryCustomPersonas = filtered;

  setDbItem(STORAGE_KEY_CUSTOM_PERSONAS, filtered);

  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_PERSONAS, JSON.stringify(filtered));
  } catch (quotaErr) {
    console.warn('[personas] Fejl ved sletning i localStorage:', quotaErr);
  }

  // Soft-delete to deleted list for undo and recovery
  const deletedList = [...getDeletedPersonas().filter((p) => p.id !== id)];
  const archivedItem: DeletedPersona = {
    ...target,
    deletedAt: new Date().toISOString(),
  };
  deletedList.unshift(archivedItem);
  memoryDeletedPersonas = deletedList;
  setDbItem(STORAGE_KEY_DELETED_PERSONAS, deletedList);
  try {
    localStorage.setItem(STORAGE_KEY_DELETED_PERSONAS, JSON.stringify(deletedList));
  } catch {}

  // Sync to disk (permanent delete in dev if requested, or move to .archive/<id>)
  if (typeof window !== 'undefined') {
    const isPermanent = options?.permanent ?? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    fetch('/api/personas/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, permanent: isPermanent }),
    }).catch(() => {});
  }

  return target;
}

export async function deletePersonaSceneFromDisk(personaId: string, sceneKey: string): Promise<void> {
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    try {
      await fetch('/api/personas/delete-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personaId, sceneKey }),
      });
    } catch {
      // Backend not running (e.g. GitHub Pages or preview)
    }
  }
}

export async function deleteAllPersonaScenesFromDisk(personaId: string): Promise<void> {
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    try {
      await fetch('/api/personas/delete-all-scenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personaId }),
      });
    } catch {
      // Backend not running
    }
  }
}

export function restoreCustomPersona(id: string): Persona | null {
  const deletedList = getDeletedPersonas();
  const target = deletedList.find((p) => p.id === id);
  if (!target) return null;

  // Remove from deleted list
  const updatedDeleted = deletedList.filter((p) => p.id !== id);
  memoryDeletedPersonas = updatedDeleted;
  setDbItem(STORAGE_KEY_DELETED_PERSONAS, updatedDeleted);
  try {
    localStorage.setItem(STORAGE_KEY_DELETED_PERSONAS, JSON.stringify(updatedDeleted));
  } catch {}

  // Add back to active personas
  const { deletedAt: _deletedAt, ...restoredPersona } = target;
  saveCustomPersona(restoredPersona);

  // Sync restore on disk
  if (typeof window !== 'undefined') {
    fetch('/api/personas/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).catch(() => {});
  }

  return restoredPersona;
}

export function permanentlyDeletePersona(id: string): void {
  const deletedList = getDeletedPersonas().filter((p) => p.id !== id);
  memoryDeletedPersonas = deletedList;
  setDbItem(STORAGE_KEY_DELETED_PERSONAS, deletedList);
  try {
    localStorage.setItem(STORAGE_KEY_DELETED_PERSONAS, JSON.stringify(deletedList));
  } catch {}
}

export function isDefaultPersona(id: string): boolean {
  return DEFAULT_PERSONAS.some((p) => p.id === id);
}

export function getAllPersonas(): Persona[] {
  const custom = getCustomPersonas();
  const defaultList = DEFAULT_PERSONAS.map((def) => {
    const override = custom.find((c) => c.id === def.id);
    const p = override || def;
    return {
      ...p,
      avatarUrl: resolveAssetUrl(p.avatarUrl),
    };
  });
  const purelyCustom = custom
    .filter((c) => !DEFAULT_PERSONAS.some((d) => d.id === c.id))
    .map((p) => ({
      ...p,
      avatarUrl: resolveAssetUrl(p.avatarUrl),
    }));
  return [...defaultList, ...purelyCustom];
}

export function getPersona(id?: string): Persona {
  const all = getAllPersonas();
  const cleanId = id === 'man_k' || id === 'man' ? 'avatar_1' : id === 'woman_a' || id === 'woman' ? 'avatar_2' : id;
  const found = all.find((p) => p.id === cleanId || p.id === id);
  return found || DEFAULT_PERSONAS[0];
}

export function resolveSceneImage(pic: Pictogram, persona: Persona): string | null {
  if (pic.customImageUrl) return resolveAssetUrl(pic.customImageUrl);
  if (pic.sceneImageUrl) return resolveAssetUrl(pic.sceneImageUrl);

  const key = pic.illustrationId;
  if (key && persona.activityScenes) {
    if (persona.activityScenes[key]) {
      return resolveAssetUrl(persona.activityScenes[key]);
    }
    // Fallbacks for common aliases
    if (key === 'vaesketoeg' && persona.activityScenes['vasketoj']) {
      return resolveAssetUrl(persona.activityScenes['vasketoj']);
    }
    if (key === 'vasketoj' && persona.activityScenes['vaesketoeg']) {
      return resolveAssetUrl(persona.activityScenes['vaesketoeg']);
    }
  }
  return null;
}

export function resolveRightIcon(pic: Pictogram): string | null {
  if (pic.rightIconUrl) return resolveAssetUrl(pic.rightIconUrl);
  return null;
}


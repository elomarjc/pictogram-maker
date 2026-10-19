#!/usr/bin/env node

/**
 * Tool to manage and organize cartoon personas and scenes directly in local files / GitHub repository.
 *
 * Folder layout:
 *   public/reference/personas/<id>/avatar.webp
 *   public/reference/personas/<id>/scenes/<sceneKey>.webp
 *   public/reference/personas/<id>/persona.json
 *   public/reference/personas/.archive/<id>/... (soft-deleted personas for Undo / recovery)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PERSONAS_ROOT = path.resolve(__dirname, '../public/reference/personas');
const ARCHIVE_ROOT = path.resolve(PERSONAS_ROOT, '.archive');
const MANIFEST_FILE = path.resolve(PERSONAS_ROOT, 'personas_manifest.json');
const ROOT_PERSONAS_DIR = path.resolve(__dirname, '../reference/personas');

function syncToRootPersonas() {
  if (fs.existsSync(ROOT_PERSONAS_DIR) && fs.existsSync(PERSONAS_ROOT)) {
    try {
      fs.cpSync(PERSONAS_ROOT, ROOT_PERSONAS_DIR, { recursive: true });
    } catch {}
  }
}

export function ensureDirectories() {
  if (!fs.existsSync(PERSONAS_ROOT)) {
    fs.mkdirSync(PERSONAS_ROOT, { recursive: true });
  }
  if (!fs.existsSync(ARCHIVE_ROOT)) {
    fs.mkdirSync(ARCHIVE_ROOT, { recursive: true });
  }
  if (!fs.existsSync(ROOT_PERSONAS_DIR)) {
    fs.mkdirSync(ROOT_PERSONAS_DIR, { recursive: true });
  }
}

/**
 * Saves a base64 Data URL to a disk file.
 */
function saveDataUrlToFile(dataUrl, targetFilePath) {
  if (!dataUrl || typeof dataUrl !== 'string') return null;

  // If it's already a relative web path, don't overwrite
  if (!dataUrl.startsWith('data:image/')) {
    return dataUrl;
  }

  const commaIdx = dataUrl.indexOf(',');
  if (commaIdx === -1) return null;

  const base64Data = dataUrl.slice(commaIdx + 1);
  const buffer = Buffer.from(base64Data, 'base64');

  const dir = path.dirname(targetFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(targetFilePath, buffer);
  return targetFilePath;
}

/**
 * Saves a persona and all its activity scenes to public/reference/personas/<id>/
 */
export function savePersonaToDisk(persona) {
  ensureDirectories();
  if (!persona || !persona.id) {
    throw new Error('Persona mangler et gyldigt ID.');
  }

  let cleanId = persona.id;
  if (cleanId === 'man_k' || cleanId === 'man') cleanId = 'avatar_1';

  // Safe folder name for ID
  const safeId = String(cleanId).replace(/[^a-zA-Z0-9_-]/g, '_');
  const personaDir = path.resolve(PERSONAS_ROOT, safeId);
  const scenesDir = path.resolve(personaDir, 'scenes');

  let cleanName = persona.name || safeId;
  let cleanShortCode = persona.shortCode || safeId;
  let cleanDescription = persona.description || safeId;

  if (safeId === 'avatar_1') {
    cleanName = safeId;
    cleanShortCode = safeId;
    cleanDescription = safeId;
  }

  if (!fs.existsSync(scenesDir)) {
    fs.mkdirSync(scenesDir, { recursive: true });
  }

  // 1. Save Avatar
  let relativeAvatarUrl = persona.avatarUrl;
  if (persona.avatarUrl && persona.avatarUrl.startsWith('data:image/')) {
    const ext = persona.avatarUrl.includes('image/png') ? 'png' : 'webp';
    const avatarPath = path.resolve(personaDir, `avatar.${ext}`);
    saveDataUrlToFile(persona.avatarUrl, avatarPath);
    relativeAvatarUrl = `reference/personas/${safeId}/avatar.${ext}`;
  }

  // 2. Save Scenes
  const updatedScenes = {};
  if (persona.activityScenes && typeof persona.activityScenes === 'object') {
    for (const [sceneKey, sceneUrl] of Object.entries(persona.activityScenes)) {
      if (typeof sceneUrl === 'string' && sceneUrl.startsWith('data:image/')) {
        const ext = sceneUrl.includes('image/png') ? 'png' : 'webp';
        const safeSceneKey = sceneKey.replace(/[^a-zA-Z0-9_-]/g, '_');
        const scenePath = path.resolve(scenesDir, `${safeSceneKey}.${ext}`);
        saveDataUrlToFile(sceneUrl, scenePath);
        updatedScenes[sceneKey] = `reference/personas/${safeId}/scenes/${safeSceneKey}.${ext}`;
      } else {
        updatedScenes[sceneKey] = sceneUrl;
      }
    }
  }

  // 2b. Remove any deleted scene files from disk
  if (fs.existsSync(scenesDir)) {
    const activeFileBaseNames = new Set(
      Object.keys(updatedScenes).map((k) => k.replace(/[^a-zA-Z0-9_-]/g, '_'))
    );
    const existingFiles = fs.readdirSync(scenesDir);
    for (const file of existingFiles) {
      const baseName = path.parse(file).name;
      if (!activeFileBaseNames.has(baseName)) {
        try {
          fs.rmSync(path.resolve(scenesDir, file), { force: true });
        } catch {}
      }
    }
  }

  const updatedPersona = {
    ...persona,
    id: safeId,
    name: cleanName,
    shortCode: cleanShortCode,
    description: cleanDescription,
    avatarUrl: relativeAvatarUrl,
    activityScenes: updatedScenes,
    updatedAt: new Date().toISOString(),
  };

  // 3. Save persona.json inside its folder
  fs.writeFileSync(
    path.resolve(personaDir, 'persona.json'),
    JSON.stringify(updatedPersona, null, 2),
    'utf-8'
  );

  // 4. Update manifest
  updateManifest(updatedPersona);

  syncToRootPersonas();

  return updatedPersona;
}

/**
 * Moves a persona to .archive for safe undo / recovery.
 */
export function archivePersonaOnDisk(id) {
  ensureDirectories();
  const safeId = String(id).replace(/[^a-zA-Z0-9_-]/g, '_');
  const sourceDir = path.resolve(PERSONAS_ROOT, safeId);
  const targetDir = path.resolve(ARCHIVE_ROOT, safeId);

  if (!fs.existsSync(sourceDir)) {
    return { success: false, message: `Mappen ${safeId} findes ikke.` };
  }

  // If already exists in archive, remove existing
  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
  }

  fs.renameSync(sourceDir, targetDir);

  // Update manifest to remove active persona
  removeFromManifest(safeId);

  // Also remove from ROOT_PERSONAS_DIR if it exists there
  const rootDir = path.resolve(ROOT_PERSONAS_DIR, safeId);
  if (fs.existsSync(rootDir)) {
    fs.rmSync(rootDir, { recursive: true, force: true });
  }

  syncToRootPersonas();

  return { success: true, id: safeId, archivedPath: targetDir };
}

/**
 * Permanently removes a persona and its scenes from both public and reference directories.
 */
export function deletePersonaPermanentlyOnDisk(id) {
  ensureDirectories();
  const safeId = String(id).replace(/[^a-zA-Z0-9_-]/g, '_');

  const targets = [
    path.resolve(PERSONAS_ROOT, safeId),
    path.resolve(ROOT_PERSONAS_DIR, safeId),
    path.resolve(ARCHIVE_ROOT, safeId),
    path.resolve(ROOT_PERSONAS_DIR, '.archive', safeId),
  ];

  let removed = 0;
  for (const dir of targets) {
    if (fs.existsSync(dir)) {
      try {
        fs.rmSync(dir, { recursive: true, force: true });
        removed++;
      } catch (err) {
        console.error(`[manage-personas] Kunne ikke slette mappe: ${dir}`, err);
      }
    }
  }

  removeFromManifest(safeId);
  syncToRootPersonas();

  return { success: true, id: safeId, removedFolders: removed };
}

/**
 * Deletes a specific scene file from a persona's scenes/ directory on disk,
 * and updates persona.json in both public and root reference folders.
 */
export function deleteSceneOnDisk(personaId, sceneKey) {
  ensureDirectories();
  const safeId = String(personaId).replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeScene = String(sceneKey).replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();

  const baseDirs = [
    path.resolve(PERSONAS_ROOT, safeId),
    path.resolve(ROOT_PERSONAS_DIR, safeId),
  ];

  const deletedFiles = [];

  for (const pDir of baseDirs) {
    if (!fs.existsSync(pDir)) continue;

    const scenesDir = path.resolve(pDir, 'scenes');
    if (fs.existsSync(scenesDir)) {
      const files = fs.readdirSync(scenesDir);
      for (const f of files) {
        const parsed = path.parse(f);
        if (parsed.name.toLowerCase() === safeScene) {
          const filePath = path.resolve(scenesDir, f);
          try {
            fs.rmSync(filePath, { force: true });
            deletedFiles.push(filePath);
          } catch (e) {
            console.error(`[manage-personas] Fejl ved sletning af fil: ${filePath}`, e);
          }
        }
      }
    }

    // Update persona.json
    const personaJsonPath = path.resolve(pDir, 'persona.json');
    if (fs.existsSync(personaJsonPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(personaJsonPath, 'utf-8'));
        if (data.activityScenes && data.activityScenes[sceneKey]) {
          delete data.activityScenes[sceneKey];
          data.updatedAt = new Date().toISOString();
          fs.writeFileSync(personaJsonPath, JSON.stringify(data, null, 2), 'utf-8');
        }
      } catch (e) {
        console.error(`[manage-personas] Fejl ved opdatering af ${personaJsonPath}`, e);
      }
    }
  }

  // Update manifest file
  if (fs.existsSync(MANIFEST_FILE)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf-8'));
      if (Array.isArray(manifest)) {
        const item = manifest.find((p) => p.id === safeId);
        if (item && item.activityScenes && item.activityScenes[sceneKey]) {
          delete item.activityScenes[sceneKey];
          fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2), 'utf-8');
        }
      }
    } catch {}
  }

  syncToRootPersonas();

  return { success: true, personaId: safeId, sceneKey, deletedFiles };
}

/**
 * Deletes all scene files for a persona from disk.
 */
export function deleteAllScenesOnDisk(personaId) {
  ensureDirectories();
  const safeId = String(personaId).replace(/[^a-zA-Z0-9_-]/g, '_');

  const baseDirs = [
    path.resolve(PERSONAS_ROOT, safeId),
    path.resolve(ROOT_PERSONAS_DIR, safeId),
  ];

  let totalDeleted = 0;

  for (const pDir of baseDirs) {
    if (!fs.existsSync(pDir)) continue;

    const scenesDir = path.resolve(pDir, 'scenes');
    if (fs.existsSync(scenesDir)) {
      const files = fs.readdirSync(scenesDir);
      for (const f of files) {
        if (!f.startsWith('.')) {
          try {
            fs.rmSync(path.resolve(scenesDir, f), { force: true });
            totalDeleted++;
          } catch {}
        }
      }
    }

    const personaJsonPath = path.resolve(pDir, 'persona.json');
    if (fs.existsSync(personaJsonPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(personaJsonPath, 'utf-8'));
        data.activityScenes = {};
        data.updatedAt = new Date().toISOString();
        fs.writeFileSync(personaJsonPath, JSON.stringify(data, null, 2), 'utf-8');
      } catch {}
    }
  }

  syncToRootPersonas();

  return { success: true, personaId: safeId, totalDeleted };
}

/**
 * Restores an archived persona from .archive/<id> back to active personas.
 */
export function restorePersonaOnDisk(id) {
  ensureDirectories();
  const safeId = String(id).replace(/[^a-zA-Z0-9_-]/g, '_');
  const archiveDir = path.resolve(ARCHIVE_ROOT, safeId);
  const targetDir = path.resolve(PERSONAS_ROOT, safeId);

  if (!fs.existsSync(archiveDir)) {
    return { success: false, message: `Figuren ${safeId} blev ikke fundet i papirkurven.` };
  }

  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
  }

  fs.renameSync(archiveDir, targetDir);

  // Read persona.json and update manifest
  const personaJsonPath = path.resolve(targetDir, 'persona.json');
  let personaData = { id: safeId, name: safeId };
  if (fs.existsSync(personaJsonPath)) {
    try {
      personaData = JSON.parse(fs.readFileSync(personaJsonPath, 'utf-8'));
    } catch {
      // fallback
    }
  }

  updateManifest(personaData);

  syncToRootPersonas();

  return { success: true, persona: personaData };
}

/**
 * Lists all active and archived personas on disk.
 */
export function listPersonasOnDisk() {
  ensureDirectories();

  const activeDirs = fs
    .readdirSync(PERSONAS_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('.'))
    .map((d) => {
      const pDir = path.resolve(PERSONAS_ROOT, d.name);
      const jsonPath = path.resolve(pDir, 'persona.json');
      const scenesDir = path.resolve(pDir, 'scenes');
      const sceneFiles = fs.existsSync(scenesDir)
        ? fs.readdirSync(scenesDir).filter((f) => !f.startsWith('.'))
        : [];

      let meta = { id: d.name, name: d.name };
      if (fs.existsSync(jsonPath)) {
        try {
          meta = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        } catch {}
      }

      return {
        id: d.name,
        name: meta.name || d.name,
        shortCode: meta.shortCode || '',
        scenesCount: sceneFiles.length,
        isArchived: false,
      };
    });

  const archivedDirs = fs.existsSync(ARCHIVE_ROOT)
    ? fs
        .readdirSync(ARCHIVE_ROOT, { withFileTypes: true })
        .filter((d) => d.isDirectory() && !d.name.startsWith('.'))
        .map((d) => {
          const aDir = path.resolve(ARCHIVE_ROOT, d.name);
          const jsonPath = path.resolve(aDir, 'persona.json');
          let meta = { id: d.name, name: d.name };
          if (fs.existsSync(jsonPath)) {
            try {
              meta = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
            } catch {}
          }
          return {
            id: d.name,
            name: meta.name || d.name,
            isArchived: true,
          };
        })
    : [];

  return { active: activeDirs, archived: archivedDirs };
}

function updateManifest(persona) {
  let manifest = [];
  if (fs.existsSync(MANIFEST_FILE)) {
    try {
      manifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf-8'));
      if (!Array.isArray(manifest)) manifest = [];
    } catch {
      manifest = [];
    }
  }

  // Filter out any legacy IDs
  manifest = manifest.filter(
    (p) => p && p.id !== 'man' && p.id !== 'woman' && p.id !== 'man_k' && p.id !== 'woman_a'
  );

  const idx = manifest.findIndex((p) => p.id === persona.id);
  if (idx >= 0) {
    manifest[idx] = persona;
  } else {
    manifest.push(persona);
  }

  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2), 'utf-8');
}

function removeFromManifest(id) {
  if (!fs.existsSync(MANIFEST_FILE)) return;
  try {
    let manifest = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf-8'));
    if (Array.isArray(manifest)) {
      manifest = manifest.filter((p) => p.id !== id);
      fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2), 'utf-8');
    }
  } catch {}
}

// CLI handler if executed directly
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const [,, cmd, arg1] = process.argv;

  switch (cmd) {
    case 'restore':
      if (!arg1) {
        console.error('Brug: npm run personas:restore <id>');
        process.exit(1);
      }
      const resRestore = restorePersonaOnDisk(arg1);
      if (resRestore.success) {
        console.log(`[OK] Gendannede figur "${arg1}" fra papirkurven.`);
      } else {
        console.error(`[FEJL] ${resRestore.message}`);
      }
      break;

    case 'delete':
    case 'archive':
      if (!arg1) {
        console.error('Brug: node scripts/manage-personas.mjs delete <id>');
        process.exit(1);
      }
      const resArch = archivePersonaOnDisk(arg1);
      if (resArch.success) {
        console.log(`[INFO] Flyttede figur "${arg1}" til papirkurven (.archive/).`);
        console.log(`[INFO] Du kan altid fortryde/gendanne med: npm run personas:restore ${arg1}`);
      } else {
        console.error(`[FEJL] ${resArch.message}`);
      }
      break;

    case 'list':
    default:
      const { active, archived } = listPersonasOnDisk();
      console.log('\n======================================================');
      console.log('Gemte figurer i filer / GitHub');
      console.log('======================================================\n');
      console.log(`Placering: public/reference/personas/<id>/`);

      console.log('\nAktive figurer:');
      if (active.length === 0) {
        console.log('  (Ingen figurer fundet)');
      } else {
        active.forEach((p, i) => {
          console.log(`  [${i + 1}] ID: "${p.id}" | Navn: "${p.name}" | Scener: ${p.scenesCount}`);
        });
      }

      if (archived.length > 0) {
        console.log('\nPapirkurv (.archive / fortryd):');
        archived.forEach((p, i) => {
          console.log(`  [${i + 1}] ID: "${p.id}" | Navn: "${p.name}" (Klar til gendannelse)`);
        });
        console.log('\nFor at gendanne en slettet figur:');
        console.log('  npm run personas:restore <id>');
      }
      console.log('');
      break;
  }
}

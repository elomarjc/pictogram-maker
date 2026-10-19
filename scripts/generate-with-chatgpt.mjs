#!/usr/bin/env node

/**
 * Automatisering til generering af piktogram-scener via ChatGPT-browser session.
 * 
 * Bruger `image-use` (https://github.com/leeguooooo/image-use.git)
 * til at styre din åbne ChatGPT-session i browseren (Google Chrome / Brave)
 * helt uden behov for OpenAI API-nøgler eller Cloudflare Workers!
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync, spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const PERSONAS_ROOT = path.resolve(REPO_ROOT, 'reference/personas');
const PUBLIC_PERSONAS_ROOT = path.resolve(REPO_ROOT, 'public/reference/personas');
const STYLE_REF_PATH = path.resolve(REPO_ROOT, 'reference/style_guide/ref2_example.jpg');

export const STANDARD_SCENE_PROMPTS = {
  vaesketoeg: 'Figuren står ved en vaskemaskine med en vasketøjskurv og hænger farverigt vasketøj op med klemmer på en tørresnor med et glad smil.',
  kaffe: 'Figuren sidder hyggeligt ved et bord med en varm, dampende kaffekop og en tekande og slapper veltilpas af.',
  medicin: 'Figuren sidder ved et bord og tager sin daglige medicin/pille sammen med et frisk glas vand og en blisterpakke.',
  badetid: 'Figuren står under en behagelig bruser med hvidt shampoo-skum i håret og vasker sig glad, mens vanddråber sprøjter blidt.',
  spisetid: 'Figuren sidder glad ved spisebordet foran en tallerken med lækker mad, kniv og gaffel og gør klar til at spise.',
  aktiviteter: 'Figuren sidder ved et arbejdsbord og laver en sjov kreativ aktivitet, f.eks. tegner med farveblyanter eller lægger puslespil.',
  vaske_op: 'Figuren står foran køkkenvasken med opvaskebørste, sæbeskum og vasker tallerkener og kopper rene med et smil.',
  bolle: 'Figuren sidder ved bordet og nyder en lækker, friskbagt bolle med smør og smiler tilfreds.',
  sengetid: 'Figuren ligger behageligt i sin seng med hovedet på en blød hvid pude, puttet under en varm dyne, med små ZZZ søvnbobler.',
  rede_seng: 'Figuren er i fuld gang med at rede sengen pænt, glatter dynen ud og puffer den hvide pude på plads.',
  gatur: 'Figuren er ude at gå en frisk gåtur i naturen med et muntert smil og frisk luft.',
  pause_sofa: 'Figuren sidder og slapper behageligt af på en blød sofa med en lille pude og ser fjernsyn eller hviler sig.',
  skraldespand: 'Figuren bærer en skraldepose ud til en udendørs affaldscontainer eller skraldespand med et rask smil.',
  handle: 'Figuren er ude at handle i et supermarked med en indkøbskurv i hånden og kigger glad på varerne på hylderne.',
  morgenmad: 'Figuren sidder glad ved spisebordet med en skål havregryn eller cornflakes med mælk og spiser morgenmad.',
  frokost: 'Figuren sidder ved frokostbordet og spiser en lækker rugbrødsmad med pålæg og et smil.',
  boerste_taender: 'Figuren står foran badeværelsesspejlet med en tandbørste og hvid tandpasta og børster grundigt tænder.',
  cykeltur: 'Figuren cykler rask afsted i det fri på en moderne cykel med cykelhjelm og et friskt smil.',
  weekend: 'Figuren slapper hyggeligt af i weekenden med en lille snack eller hyggestund i behageligt tøj.'
};

export function checkImageUseInstalled() {
  try {
    const res = execSync('which image-use 2>/dev/null', { encoding: 'utf-8' });
    return res.trim().length > 0;
  } catch {
    return false;
  }
}

export function checkChatGPTStatus() {
  const hasTool = checkImageUseInstalled();
  if (!hasTool) {
    return {
      installed: false,
      ready: false,
      loggedIn: false,
      relayConnected: false,
      profiles: [],
      message: 'Værktøjet "image-use" er ikke installeret.',
    };
  }

  try {
    const doctorOut = execSync('image-use doctor 2>&1', { encoding: 'utf-8', timeout: 5000 });
    const isRelay = doctorOut.includes('[ok]    relay');
    const profilesMatch = doctorOut.match(/profiles\s+(\d+)\s+logged-in:\s*(.*)/i);
    const loggedInCount = profilesMatch ? parseInt(profilesMatch[1], 10) : 0;
    const profileNames = profilesMatch && profilesMatch[2] ? profilesMatch[2].split(',').map((s) => s.trim()) : [];
    const isReady = isRelay || loggedInCount > 0;

    return {
      installed: true,
      ready: isReady,
      loggedIn: isReady,
      relayConnected: isRelay,
      profiles: profileNames,
      message: isReady
        ? `ChatGPT er klar (${profileNames.length > 0 ? profileNames.join(', ') : 'Brave/Chrome relay'})`
        : 'Ingen aktive ChatGPT-sessioner fundet. Åbn ChatGPT i din browser og log ind.',
    };
  } catch (err) {
    return {
      installed: true,
      ready: false,
      loggedIn: false,
      relayConnected: false,
      profiles: [],
      message: 'Kunne ikke tjekke browser status: ' + (err.message || String(err)),
    };
  }
}

export function openChatGPTInBrowser() {
  try {
    const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
    spawn(cmd, ['https://chatgpt.com'], { detached: true, stdio: 'ignore' }).unref();
    return { success: true, message: 'Åbnede https://chatgpt.com i din standardbrowser.' };
  } catch (err) {
    return { success: false, error: err.message || String(err) };
  }
}

export function buildPrompt(sceneKey, sceneDesc) {
  return `Create ONE standalone 2D cartoon illustration for an autism pictogram routine card.
Activity: ${sceneDesc}
Requirements:
1. Character & Clothing consistency: Use Image 1 as the exact character and clothing reference (strictly replicate the face, hair, skin tone, and WHATEVER clothing they are wearing in Image 1; DO NOT assume or default to a hoodie).
2. Art style: 2D cartoon illustration with smooth thick black outlines, saturated flat colors and subtle cel shading, exactly matching the friendly style in Image 2.
3. Composition: Horizontal 16:9 aspect ratio, character centered performing the activity with essential props only.
4. Background: 100% genuine transparent background (PNG alpha channel). NO background walls, NO floor, NO card frames, NO border.
5. No text, letters, or numbers.`;
}

export const GRID_2X10_PROMPT = `# 20-in-1 Master Sheet Prompt — 2x10 Daily Schedule Grid (Transparent Background)

You are creating a comprehensive MASTER SHEET containing exactly 20 distinct autism schedule pictogram scenes arranged neatly in a 2-column by 10-row grid on ONE single tall portrait image.

## Reference Images:
- Image 1 (Subject): Exact character and authentic clothing from avatar reference.
- Image 2 (Style): 2D cartoon pictogram illustration with thick black outlines, flat saturated colors, friendly appearance.

## Format & Composition:
- One tall portrait image (9:16 aspect ratio, 1080 x 1920 pixels).
- Exactly 2 columns × 10 rows (20 distinct standalone scene cells).
- Each cell is wide/horizontal aspect ratio (~2.8:1, ~531 x 185 px at 25% scale).
- 100% Genuine Transparent Background (PNG alpha channel). NO background color, NO walls, NO card frames.
- Ample space between cells so each scene can be sliced cleanly.

## The 20 Distinct Scenes (2x10 Grid):
Row 1: Col 1 = Hænge vasketøj op, Col 2 = The & Kaffe
Row 2: Col 1 = Medicin, Col 2 = Badetid
Row 3: Col 1 = Spisetid, Col 2 = Børste tænder
Row 4: Col 1 = Vaske op, Col 2 = Bolle
Row 5: Col 1 = Sengetid / Sove, Col 2 = Gåtur
Row 6: Col 1 = Rede seng, Col 2 = Pause på sofa / TV
Row 7: Col 1 = Skraldespand & Pant, Col 2 = Handle indkøb
Row 8: Col 1 = Morgenmad, Col 2 = Frokost (rugbrød)
Row 9: Col 1 = Lave aftensmad, Col 2 = Aktiviteter / Hobby
Row 10: Col 1 = Cykeltur, Col 2 = Weekendhygge

## Requirements:
All 20 scenes on this single image, same clothing in all cells, transparent background, no text.`;

export const GRID_2X10_BATCH2_PROMPT = `# 20-in-1 Master Sheet Prompt — Batch 2: Daily Life, Chores & Outings (2x10 Grid)

You are creating a comprehensive MASTER SHEET (Batch 2) containing exactly 20 distinct autism schedule pictogram scenes arranged neatly in a 2-column by 10-row grid on ONE single tall portrait image.

## Reference Images:
- Image 1 (Subject): Exact character and authentic clothing from avatar reference.
- Image 2 (Style): 2D cartoon pictogram illustration with thick black outlines, flat saturated colors, friendly appearance.

## Format & Composition:
- One tall portrait image (9:16 aspect ratio, 1080 x 1920 pixels).
- Exactly 2 columns × 10 rows (20 distinct standalone scene cells).
- Each cell is wide/horizontal aspect ratio (~2.8:1).
- 100% Genuine Transparent Background (PNG alpha channel). NO background color, NO walls, NO card frames.
- Ample space between cells so each scene can be sliced cleanly.

## The 20 Distinct Scenes (Batch 2: 2x10 Grid):
Row 1: Col 1 = Skifte sengetøj (rent betræk på dyne), Col 2 = Støvsuge gulv
Row 2: Col 1 = Tørre bord af med fugtig klud, Col 2 = Tømme opvaskemaskine (service på plads)
Row 3: Col 1 = Lægge tøj sammen i pæne bunker, Col 2 = Forberede mad (hakke grøntsager)
Row 4: Col 1 = Høre musik med store hovedtelefoner, Col 2 = iPad / tablet skærmtid
Row 5: Col 1 = Lave perler / perleplade ved bordet, Col 2 = Havearbejde (vande blomster med vandkande)
Row 6: Col 1 = Svømmehal / bade i pool med håndklæde, Col 2 = Køre i bus eller tog (med rejsekort)
Row 7: Col 1 = Pakke weekendtaske på sengen, Col 2 = Besøg hos far / familie (vinker glad foran huset)
Row 8: Col 1 = Aflevere flasker i pantautomaten, Col 2 = Tage tøj og jakke på
Row 9: Col 1 = Drikke et forfriskende glas vand, Col 2 = Spille brætspil eller puslespil
Row 10: Col 1 = Rydde op på værelset i kasser, Col 2 = Sansehus / sanserum (rolige sanselys)

## Requirements:
All 20 scenes on this single image, same character clothing in all cells, transparent background, no text.`;

/**
 * Runs image-use and slicing pipeline for an avatar.
 */
export async function runChatGPTGeneration({
  avatar = 'avatar_1',
  scene = '--grid',
  customPrompt = null,
  onProgress = () => {},
}) {
  let safeAvatar = avatar.toLowerCase();
  if (safeAvatar === 'man' || safeAvatar === 'man_k') safeAvatar = 'avatar_1';

  const avatarDir = path.resolve(PERSONAS_ROOT, safeAvatar);
  let avatarImgPath = path.resolve(avatarDir, 'avatar.webp');

  if (!fs.existsSync(avatarImgPath)) {
    const publicAvatar = path.resolve(PUBLIC_PERSONAS_ROOT, safeAvatar, 'avatar.webp');
    if (fs.existsSync(publicAvatar)) {
      if (!fs.existsSync(avatarDir)) fs.mkdirSync(avatarDir, { recursive: true });
      fs.copyFileSync(publicAvatar, avatarImgPath);
    } else {
      throw new Error(`Fandt ikke figurens avatar-billede for "${safeAvatar}" (forventet i reference/personas/${safeAvatar}/avatar.webp)`);
    }
  }

  const isGridBatch1 = scene === '--grid' || scene === 'grid' || scene === 'all' || scene === '--batch1' || scene === 'batch1';
  const isGridBatch2 = scene === '--grid-batch2' || scene === 'batch2' || scene === '--batch2';
  const isGrid = isGridBatch1 || isGridBatch2;
  const batchNum = isGridBatch2 ? 2 : 1;

  let prompt = '';
  let outputFilePath = '';
  let webpOutputPath = '';

  if (isGrid) {
    prompt = isGridBatch2 ? GRID_2X10_BATCH2_PROMPT : GRID_2X10_PROMPT;
    outputFilePath = path.resolve(avatarDir, isGridBatch2 ? 'sheet_2x10_batch2.png' : 'sheet_2x10.png');
  } else {
    const sceneDesc = customPrompt || STANDARD_SCENE_PROMPTS[scene] || `Figuren udfører aktiviteten "${scene}" glad og venligt.`;
    prompt = buildPrompt(scene, sceneDesc);
    const targetScenesDir = path.resolve(avatarDir, 'scenes');
    if (!fs.existsSync(targetScenesDir)) {
      fs.mkdirSync(targetScenesDir, { recursive: true });
    }
    outputFilePath = path.resolve(targetScenesDir, `${scene}.png`);
    webpOutputPath = path.resolve(targetScenesDir, `${scene}.webp`);
  }

  onProgress({
    stage: 'starting',
    percent: 10,
    message: isGrid
      ? 'Starter browser-session for 20-i-1 sceneark...'
      : `Starter browser-session for scenen "${scene}"...`,
  });

  return new Promise((resolve, reject) => {
    const child = spawn(
      'image-use',
      [
        prompt,
        '-i', avatarImgPath,
        '--composition-ref', STYLE_REF_PATH,
        '--project', '',
        '--timeout', '360',
        '-o', outputFilePath,
      ],
      { stdio: ['ignore', 'pipe', 'pipe'] }
    );

    let stdoutData = '';
    let stderrData = '';

    child.stdout.on('data', (chunk) => {
      stdoutData += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      const text = chunk.toString();
      stderrData += text;
      
      // Update progress based on image-use logs
      if (text.includes('composer') || text.includes('upload') || text.includes('relay')) {
        onProgress({ stage: 'uploading', percent: 30, message: 'Uploader avatar- og stil-reference til ChatGPT...' });
      } else if (text.includes('generating') || text.includes('render') || text.includes('waiting')) {
        onProgress({ stage: 'generating', percent: 60, message: 'ChatGPT tegner billedet (dette tager ca. 30-50 sek)...' });
      } else if (text.includes('download') || text.includes('saving')) {
        onProgress({ stage: 'downloading', percent: 85, message: 'Henter det færdige billede...' });
      }
    });

    child.on('close', (code) => {
      if (code !== 0 || !fs.existsSync(outputFilePath)) {
        const errorMsg = stderrData || stdoutData || `image-use afsluttede med kode ${code}`;
        return reject(new Error(`Fejl under ChatGPT-generering: ${errorMsg}`));
      }

      if (isGrid) {
        onProgress({ stage: 'slicing', percent: 90, message: 'Beskærer automatisk de 20 scener med OpenCV...' });
        try {
          execSync(`python3 scripts/slice-sheet-2x10.py "${outputFilePath}" "${safeAvatar}" --batch ${batchNum}`, {
            stdio: 'inherit',
          });

          // Sync public folder
          const rootDir = path.resolve(PERSONAS_ROOT, safeAvatar);
          const pubDir = path.resolve(PUBLIC_PERSONAS_ROOT, safeAvatar);
          if (fs.existsSync(rootDir)) {
            fs.cpSync(rootDir, pubDir, { recursive: true });
          }

          const manifestPath = path.resolve(REPO_ROOT, 'public/reference/personas/personas_manifest.json');
          let persona = null;
          if (fs.existsSync(manifestPath)) {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
            persona = manifest.find((p) => p.id === safeAvatar) || null;
          }

          onProgress({ stage: 'done', percent: 100, message: 'Færdig! Alle 20 scener er beskåret og klar.' });
          resolve({ success: true, isGrid: true, persona, outputSheet: outputFilePath });
        } catch (sliceErr) {
          reject(new Error(`Fejl ved beskæring af arket: ${sliceErr.message}`));
        }
      } else {
        // Single scene
        onProgress({ stage: 'converting', percent: 90, message: 'Konverterer og gemmer scenen...' });
        try {
          execSync(`python3 -c "from PIL import Image; im = Image.open('${outputFilePath}'); im.save('${webpOutputPath}', 'WEBP')"`);
          const pubScenesDir = path.resolve(PUBLIC_PERSONAS_ROOT, safeAvatar, 'scenes');
          if (!fs.existsSync(pubScenesDir)) fs.mkdirSync(pubScenesDir, { recursive: true });
          fs.copyFileSync(webpOutputPath, path.resolve(pubScenesDir, `${scene}.webp`));

          // Update manifests
          const manifestPaths = [
            path.resolve(REPO_ROOT, 'reference/personas/personas_manifest.json'),
            path.resolve(REPO_ROOT, 'public/reference/personas/personas_manifest.json'),
          ];
          for (const mp of manifestPaths) {
            if (fs.existsSync(mp)) {
              const manifest = JSON.parse(fs.readFileSync(mp, 'utf-8'));
              const target = manifest.find((p) => p.id === safeAvatar);
              if (target) {
                if (!target.activityScenes) target.activityScenes = {};
                target.activityScenes[scene] = `reference/personas/${safeAvatar}/scenes/${scene}.webp`;
                fs.writeFileSync(mp, JSON.stringify(manifest, null, 2), 'utf-8');
              }
            }
          }

          onProgress({ stage: 'done', percent: 100, message: `Scenen "${scene}" er klar!` });
          resolve({
            success: true,
            isGrid: false,
            scene,
            sceneUrl: `reference/personas/${safeAvatar}/scenes/${scene}.webp`,
          });
        } catch (convErr) {
          reject(new Error(`Fejl ved gemning af scene: ${convErr.message}`));
        }
      }
    });

    child.on('error', (err) => {
      reject(new Error(`Kunne ikke starte image-use: ${err.message}`));
    });
  });
}

async function main() {
  const [,, avatarArg, sceneArg] = process.argv;

  if (!avatarArg || !sceneArg) {
    console.log(`
======================================================================
🎨 Piktogram Generator via ChatGPT Web & image-use
======================================================================

Brug:
  node scripts/generate-with-chatgpt.mjs <avatar_id> <scene>

Eksempler:
  node scripts/generate-with-chatgpt.mjs avatar_1 kaffe
  node scripts/generate-with-chatgpt.mjs avatar_1 vaesketoeg
  node scripts/generate-with-chatgpt.mjs avatar_1 --grid

Status:`);
    console.log(JSON.stringify(checkChatGPTStatus(), null, 2));
    return;
  }

  const res = await runChatGPTGeneration({
    avatar: avatarArg,
    scene: sceneArg,
    onProgress: (p) => {
      console.log(`[${p.percent}%] ${p.message}`);
    },
  });

  console.log('\nResultat:', res);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((err) => {
    console.error('Fejl:', err.message || err);
    process.exit(1);
  });
}

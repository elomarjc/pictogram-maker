#!/usr/bin/env node

/**
 * Automatisering til generering af piktogram-scener via gratis ChatGPT-konti.
 * 
 * Bruger det åbne værktøj `image-use` (https://github.com/leeguooooo/image-use.git)
 * som styrer din allerede loggede ChatGPT-session i browseren (Google Chrome / Brave)
 * helt uden behov for OpenAI API-nøgler eller betalte udviklerkonti!
 * 
 * Brug:
 *   node scripts/generate-with-chatgpt.mjs <avatar> <scene> [tilvalg]
 *   F.eks.:
 *   node scripts/generate-with-chatgpt.mjs man kaffe
 *   node scripts/generate-with-chatgpt.mjs woman badetid
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

const STANDARD_SCENE_PROMPTS = {
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
};

function checkImageUseInstalled() {
  try {
    const res = execSync('which image-use 2>/dev/null', { encoding: 'utf-8' });
    return res.trim().length > 0;
  } catch {
    return false;
  }
}

function buildPrompt(sceneKey, sceneDesc) {
  return `Create ONE standalone 2D cartoon illustration for an autism pictogram routine card.
Activity: ${sceneDesc}
Requirements:
1. Character & Clothing consistency: Use Image 1 as the exact character and clothing reference (strictly replicate the face, hair, skin tone, and WHATEVER clothing they are wearing in Image 1; DO NOT assume or default to a hoodie).
2. Art style: 2D cartoon illustration with smooth thick black outlines, saturated flat colors and subtle cel shading, exactly matching the friendly style in Image 2.
3. Composition: Horizontal 16:9 aspect ratio, character centered performing the activity with essential props only.
4. Background: 100% genuine transparent background (PNG alpha channel). NO background walls, NO floor, NO card frames, NO border.
5. No text, letters, or numbers.`;
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
  node scripts/generate-with-chatgpt.mjs avatar_2 badetid

Tilgængelige standardscener:
  ${Object.keys(STANDARD_SCENE_PROMPTS).join(', ')}
`);
    return;
  }

  let avatar = avatarArg.toLowerCase();
  if (avatar === 'man' || avatar === 'man_k') avatar = 'avatar_1';
  if (avatar === 'woman' || avatar === 'woman_a') avatar = 'avatar_2';
  const scene = sceneArg.toLowerCase();

  const avatarDir = path.resolve(PERSONAS_ROOT, avatar);
  const avatarImgPath = path.resolve(avatarDir, 'avatar.webp');

  if (!fs.existsSync(avatarImgPath)) {
    console.error(`❌ Fejl: Fandt ikke figurens avatar på: ${avatarImgPath}`);
    console.error(`Sørg for at mappen "reference/personas/${avatar}/" indeholder "avatar.webp".`);
    process.exit(1);
  }

  const isGrid = scene === '--grid' || scene === 'grid' || scene === 'all';

  let prompt = '';
  let outputFilePath = '';
  let webpOutputPath = '';

  if (isGrid) {
    prompt = `# 20-in-1 Master Sheet Prompt — 2x10 Daily Schedule Grid (Transparent Background)

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
    outputFilePath = path.resolve(avatarDir, 'sheet_2x10.png');
  } else {
    const sceneDesc = STANDARD_SCENE_PROMPTS[scene] || `Figuren udfører aktiviteten "${scene}" glad og venligt.`;
    prompt = buildPrompt(scene, sceneDesc);
    const targetScenesDir = path.resolve(avatarDir, 'scenes');
    if (!fs.existsSync(targetScenesDir)) {
      fs.mkdirSync(targetScenesDir, { recursive: true });
    }
    outputFilePath = path.resolve(targetScenesDir, `${scene}.png`);
    webpOutputPath = path.resolve(targetScenesDir, `${scene}.webp`);
  }

  console.log('\n======================================================');
  console.log(`🤖 Genererer ${isGrid ? '2x10 SCENEARK (20 scener på én gang)' : `scene: "${scene}"`} for figur: "${avatar}"`);
  console.log('======================================================');
  console.log(`👤 Figur Reference (Ref 1): ${avatarImgPath}`);
  console.log(`🎨 Stil Reference (Ref 2):  ${STYLE_REF_PATH}`);
  console.log(`🎯 Output:                   ${outputFilePath}\n`);

  const hasTool = checkImageUseInstalled();
  if (!hasTool) {
    console.log(`ℹ️ "image-use" er ikke installeret.`);
    console.log(`Du kan kopiere prompten og generere manuelt i ChatGPT, eller køre:`);
    console.log(`image-use "${prompt.replace(/"/g, '\\"')}" -i "${avatarImgPath}" --composition-ref "${STYLE_REF_PATH}" -o "${outputFilePath}"\n`);
    return;
  }

  console.log('🚀 Starter image-use med browser session...');
  const child = spawn(
    'image-use',
    [
      prompt,
      '-i', avatarImgPath,
      '--composition-ref', STYLE_REF_PATH,
      '-o', outputFilePath,
    ],
    { stdio: 'inherit' }
  );

  child.on('close', (code) => {
    if (code === 0 && fs.existsSync(outputFilePath)) {
      console.log(`\n✅ Billedet blev genereret: ${outputFilePath}`);
      if (isGrid) {
        console.log(`✂️  Beskærer automatisk de 20 scener med scripts/slice-sheet-2x10.py...`);
        try {
          execSync(`python3 scripts/slice-sheet-2x10.py "${outputFilePath}" "${avatar}"`, {
            stdio: 'inherit',
          });
        } catch (err) {
          console.error('Fejl ved automatisk beskæring:', err.message);
        }
      } else {
        try {
          fs.copyFileSync(outputFilePath, webpOutputPath);
          const publicScenesDir = path.resolve(PUBLIC_PERSONAS_ROOT, avatar, 'scenes');
          if (!fs.existsSync(publicScenesDir)) {
            fs.mkdirSync(publicScenesDir, { recursive: true });
          }
          fs.copyFileSync(webpOutputPath, path.resolve(publicScenesDir, `${scene}.webp`));
          console.log(`🔄 Synkroniseret til public/reference/personas/${avatar}/scenes/${scene}.webp`);
        } catch (err) {
          console.error('Advarsel ved synkronisering:', err.message);
        }
      }
    } else {
      console.error(`\n❌ image-use afsluttede med fejlkode: ${code}`);
    }
  });
}

main().catch((err) => {
  console.error('Fejl:', err);
  process.exit(1);
});

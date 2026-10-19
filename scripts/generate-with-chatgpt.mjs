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

  const sceneDesc = STANDARD_SCENE_PROMPTS[scene] || `Figuren udfører aktiviteten "${scene}" glad og venligt.`;
  const prompt = buildPrompt(scene, sceneDesc);

  const targetScenesDir = path.resolve(avatarDir, 'scenes');
  if (!fs.existsSync(targetScenesDir)) {
    fs.mkdirSync(targetScenesDir, { recursive: true });
  }

  const outputFilePath = path.resolve(targetScenesDir, `${scene}.png`);
  const webpOutputPath = path.resolve(targetScenesDir, `${scene}.webp`);

  console.log('\n======================================================');
  console.log(`🤖 Genererer scene: "${scene}" for figur: "${avatar}"`);
  console.log('======================================================');
  console.log(`👤 Figur Reference (Ref 1): ${avatarImgPath}`);
  console.log(`🎨 Stil Reference (Ref 2):  ${STYLE_REF_PATH}`);
  console.log(`📝 Beskrivelse:              ${sceneDesc}`);
  console.log(`🎯 Gemmes i:                 ${webpOutputPath}\n`);

  const hasTool = checkImageUseInstalled();
  if (!hasTool) {
    console.log(`ℹ️ "image-use" er ikke installeret på dit system endnu.`);
    console.log(`Sådan installerer du det hurtigt (gratis til ChatGPT web-login):`);
    console.log(`\n  1. Kør installationsscriptet:`);
    console.log(`     curl -fsSL https://raw.githubusercontent.com/leeguooooo/image-use/main/install.sh | sh`);
    console.log(`\n  2. Installer browser-motoren (chrome-use):`);
    console.log(`     curl -fsSL https://raw.githubusercontent.com/leeguooooo/chrome-use/main/install.sh | sh`);
    console.log(`\n  3. Log ind på din gratis ChatGPT-konto i Google Chrome / Brave.`);
    console.log(`\nDerefter kan du køre denne kommando direkte, og billederne gemmes automatisk i dit avatar-bibliotek!`);
    console.log('\n--- Kommando der vil blive udført ---');
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
      // Kopier til webp og public mappe
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
    } else {
      console.error(`\n❌ image-use afsluttede med fejlkode: ${code}`);
    }
  });
}

main().catch((err) => {
  console.error('Fejl:', err);
  process.exit(1);
});

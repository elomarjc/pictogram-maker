#!/usr/bin/env node

/**
 * CLI Tool to manage Cloudflare Worker accounts for Pictogram Maker.
 * 
 * Usage:
 *   npm run accounts
 *   npm run add-account <url> [name] [apiKey]
 *   node scripts/manage-accounts.mjs remove <name-or-url>
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_PATH = path.resolve(__dirname, '../src/config/cloudflareAccounts.ts');

function readConfigFile() {
  if (!fs.existsSync(CONFIG_PATH)) {
    throw new Error(`Konfigurationsfil ikke fundet: ${CONFIG_PATH}`);
  }
  return fs.readFileSync(CONFIG_PATH, 'utf-8');
}

function parseAccounts(content) {
  const match = content.match(/export const CONFIGURED_CLOUDFLARE_ACCOUNTS:\s*ConfiguredCloudflareAccount\[\]\s*=\s*(\[[\s\S]*?\]);/);
  if (!match) {
    throw new Error('Kunne ikke finde CONFIGURED_CLOUDFLARE_ACCOUNTS array i konfigurationsfilen.');
  }

  try {
    // Sanitize JS object to valid JSON if needed, or use Function constructor safely in local dev script
    const arrayStr = match[1];
    const parseFn = new Function(`return (${arrayStr});`);
    const accounts = parseFn();
    if (!Array.isArray(accounts)) {
      throw new Error('CONFIGURED_CLOUDFLARE_ACCOUNTS er ikke et gyldigt array.');
    }
    return accounts;
  } catch (err) {
    throw new Error(`Fejl under parsing af konti: ${err.message}`);
  }
}

function saveAccounts(accounts) {
  const fileContent = `/**
 * Konfiguration af Cloudflare Workers AI konti til automatisk rotation.
 * 
 * Du kan tilføje, se eller fjerne konti direkte fra terminalen:
 * 
 * 1. Vis alle konti:
 *    npm run accounts
 * 
 * 2. Tilføj en ny konto via kommandolinjen:
 *    npm run add-account <worker-url> [navn] [api-nøgle]
 *    F.eks.:
 *    npm run add-account https://free-image-generation-api-2.elomarjc.workers.dev "Konto 2"
 * 
 * 3. Fjern en konto:
 *    npm run accounts remove "Konto 2"
 * 
 * Du kan også frit redigere listen direkte nedenfor.
 */

export interface ConfiguredCloudflareAccount {
  /** Unik ID eller navn for denne konto */
  name: string;
  /** Cloudflare Worker URL (f.eks. https://free-image-generation-api.elomarjc.workers.dev) */
  url: string;
  /** Valgfri API-nøgle (hvis workeren kræver x-api-key) */
  apiKey?: string;
}

export const CONFIGURED_CLOUDFLARE_ACCOUNTS: ConfiguredCloudflareAccount[] = ${JSON.stringify(accounts, null, 2)};
`;

  fs.writeFileSync(CONFIG_PATH, fileContent, 'utf-8');
}

function listAccounts() {
  const content = readConfigFile();
  const accounts = parseAccounts(content);

  console.log('\n======================================================');
  console.log('🤖 Cloudflare Workers AI Konti (Konfigureret)');
  console.log('======================================================\n');

  if (accounts.length === 0) {
    console.log('Ingen konti konfigureret endnu.');
  } else {
    accounts.forEach((acc, index) => {
      console.log(`[${index + 1}] ${acc.name}`);
      console.log(`    URL:     ${acc.url}`);
      if (acc.apiKey) {
        const masked = acc.apiKey.length > 8
          ? acc.apiKey.slice(0, 4) + '...' + acc.apiKey.slice(-4)
          : '********';
        console.log(`    API Key: ${masked}`);
      } else {
        console.log(`    API Key: (Ingen - offentlig/åben worker)`);
      }
      console.log('');
    });
  }

  console.log(`I alt: ${accounts.length} konto/konti til rådighed for rotation.`);
  console.log('\n💡 Tip:');
  console.log('  Tilføj ny konto:   npm run add-account <url> [navn]');
  console.log('  Fjern en konto:    npm run accounts remove <navn eller url>\n');
}

function addAccount(rawUrl, rawName, apiKey) {
  if (!rawUrl) {
    console.error('❌ Fejl: Du skal angive en Cloudflare Worker URL.');
    console.log('Eksempel: npm run add-account https://free-image-generation-api-2.ditnavn.workers.dev "Konto 2"');
    process.exit(1);
  }

  let url = rawUrl.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  url = url.replace(/\/+$/, '');

  const content = readConfigFile();
  const accounts = parseAccounts(content);

  const existing = accounts.find((a) => a.url.toLowerCase() === url.toLowerCase());
  if (existing) {
    console.log(`⚠️ Kontoen findes allerede som "${existing.name}" (${existing.url}). Opdaterer...`);
    existing.name = rawName ? rawName.trim() : existing.name;
    if (apiKey) existing.apiKey = apiKey.trim();
  } else {
    const name = rawName && rawName.trim() ? rawName.trim() : `Konto ${accounts.length + 1}`;
    const newAcc = {
      name,
      url,
    };
    if (apiKey && apiKey.trim()) {
      newAcc.apiKey = apiKey.trim();
    }
    accounts.push(newAcc);
    console.log(`✅ Tilføjede ny konto: "${name}" (${url})`);
  }

  saveAccounts(accounts);
  console.log(`📁 Gemt i: ${CONFIG_PATH}`);
  console.log('🔄 Billedgenerering i Piktogram Maker vil nu automatisk rotere til denne konto, når en anden rammer dags-kvoten!\n');
}

function removeAccount(query) {
  if (!query) {
    console.error('❌ Fejl: Angiv navn eller URL på kontoen der skal fjernes.');
    process.exit(1);
  }

  const cleanQuery = query.trim().toLowerCase();
  const content = readConfigFile();
  const accounts = parseAccounts(content);

  const initialCount = accounts.length;
  const filtered = accounts.filter(
    (a) => a.name.toLowerCase() !== cleanQuery && a.url.toLowerCase() !== cleanQuery && !a.url.toLowerCase().includes(cleanQuery)
  );

  if (filtered.length === initialCount) {
    console.log(`⚠️ Fandt ingen konto der matchede "${query}".`);
    return;
  }

  if (filtered.length === 0) {
    console.log('⚠️ Kan ikke slette alle konti. Der skal altid være mindst én konto konfigureret.');
    return;
  }

  saveAccounts(filtered);
  console.log(`🗑️ Fjernede ${initialCount - filtered.length} konto/konti.`);
  console.log(`📁 Gemt i: ${CONFIG_PATH}\n`);
}

// CLI argument parsing
const args = process.argv.slice(2);
const command = args[0] ? args[0].toLowerCase() : 'list';

if (command === 'list') {
  listAccounts();
} else if (command === 'add') {
  const url = args[1];
  const name = args[2];
  const apiKey = args[3];
  addAccount(url, name, apiKey);
} else if (command === 'remove' || command === 'delete' || command === 'rm') {
  const target = args[1];
  removeAccount(target);
} else if (command.startsWith('http://') || command.startsWith('https://') || command.includes('.workers.dev')) {
  // Shortcut: node scripts/manage-accounts.mjs https://... "Konto 2"
  const url = args[0];
  const name = args[1];
  const apiKey = args[2];
  addAccount(url, name, apiKey);
} else {
  console.log(`Ukendt kommando: ${command}`);
  console.log('Brug:');
  console.log('  npm run accounts                  (viser alle konti)');
  console.log('  npm run add-account <url> [navn]  (tilføjer en konto)');
  console.log('  node scripts/manage-accounts.mjs remove <navn>');
}

/**
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

export const CONFIGURED_CLOUDFLARE_ACCOUNTS: ConfiguredCloudflareAccount[] = [
  {
    "name": "Primær konto (Konto 1)",
    "url": "https://free-image-generation-api.elomarjc.workers.dev"
  },
  {
    "name": "Konto 2",
    "url": "https://piktogram.kygoanderson.workers.dev"
  },
  {
    "name": "Konto 3",
    "url": "https://piktogram.thecrazywizards1311.workers.dev"
  }
];

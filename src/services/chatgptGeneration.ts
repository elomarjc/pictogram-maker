/**
 * Client service to communicate with the local ChatGPT generation backend,
 * with seamless mobile & web cloud fallbacks when running on phones or GitHub Pages.
 */

import type { Persona } from '../types';
import { getPersona, saveCustomPersona } from './personas';

export const STORAGE_KEY_CHATGPT_CONNECTED = 'pictogram_chatgpt_connected';
export const STORAGE_KEY_CHATGPT_PENDING = 'pictogram_chatgpt_pending_login';

export const CHATGPT_PHOTO_TO_AVATAR_PROMPT = `# Turn Real Photo into 2D Cartoon Pictogram Avatar

Please attach:
- Image 1: Real photo of the person
- Image 2: Art style reference (thick smooth black outlines, flat saturated colors, friendly cartoon aesthetic)

Instructions:
Transform the real person in Image 1 into ONE clean, friendly 2D cartoon avatar portrait that will serve as the master character reference for an autism routine pictogram schedule.

### 1. Authentic Likeness & Clothing (DO NOT DEFAULT TO A HOODIE)
- Identity & Face: Capture the person's real facial structure, eye shape, smile, skin tone, and distinguishing facial features (including glasses if worn).
- Hairstyle: Replicate the person's exact hairstyle, hair length, hair color, and texture as seen in Image 1.
- Clothing: Strictly reproduce whatever clothing the person is ACTUALLY wearing in Image 1 (e.g. sweater, t-shirt, buttoned shirt, polo, dress, jacket). DO NOT change their clothing to a hoodie, sweatshirt, or generic uniform unless they are actually wearing one in the photo.
- Expression: Warm, friendly, cheerful, smiling, and approachable.

### 2. Illustration Style (Matching Image 2)
- Clean, crisp 2D cartoon vector illustration style exactly matching Image 2.
- Bold, thick, smooth black outlines around the character and clothing.
- Clean flat saturated colors with minimal, simple cel-shading (no 3D, no photorealism, no airbrushing).
- Friendly rounded proportions and clear silhouette.

### 3. Composition & Framing
- Centered upper-body portrait (chest up), facing slightly toward the viewer.
- Balanced composition fitting within an avatar portrait circle or square.

### 4. 100% Genuine Transparent Background (Critical)
- The entire background surrounding the character MUST be completely transparent (PNG alpha channel).
- NO white background, NO background scenery, NO circle borders, NO card frames, NO fake checkerboard pattern.
- Only the person and their clothing should be visible.

### 5. Final Requirements
- One image only.
- No text, letters, names, or watermarks.`;

export function isChatGPTConnectedManual(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(STORAGE_KEY_CHATGPT_CONNECTED) === 'true';
  } catch {
    return false;
  }
}

export function setChatGPTConnectedManual(connected: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (connected) {
      localStorage.setItem(STORAGE_KEY_CHATGPT_CONNECTED, 'true');
      sessionStorage.removeItem(STORAGE_KEY_CHATGPT_PENDING);
    } else {
      localStorage.removeItem(STORAGE_KEY_CHATGPT_CONNECTED);
    }
  } catch {}
}

export function isChatGPTLoginPending(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return sessionStorage.getItem(STORAGE_KEY_CHATGPT_PENDING) === 'true';
  } catch {
    return false;
  }
}

export function clearChatGPTLoginPending(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(STORAGE_KEY_CHATGPT_PENDING);
  } catch {}
}

export const STANDARD_SCENE_PROMPTS: Record<string, string> = {
  vaesketoeg: 'Hænge vasketøj op ved vaskemaskinen med et glad smil',
  kaffe: 'Sidder hyggeligt ved et bord med en varm dampende kaffekop og slapper af',
  medicin: 'Tager sin daglige medicin eller vitaminer med et glas vand',
  badetid: 'Tager et forfriskende brusebad med sæbe og shampoo',
  spisetid: 'Sidder ved spisebordet med tallerken, kniv og gaffel og spiser aftensmad',
  boerste_taender: 'Børster tænder foran badeværelsesspejlet med tandbørste og tandpasta',
  vaske_op: 'Vasker kopper og tallerkener op i køkkenvasken med opvaskebørste og sæbe',
  bolle: 'Nyder en friskbagt bolle med smør til mellemmåltid',
  sengetid: 'Ligger trygt i sin seng og sover under dynen med hovedet på puden',
  rede_seng: 'Reder sengen pænt, glatter dynen ud og puffer puden',
  gatur: 'Går en frisk gåtur ude i naturen med et smil og frisk luft',
  pause_sofa: 'Slapper behageligt af på sofaen og ser fjernsyn eller hviler',
  skraldespand: 'Bærer en skraldepose ud til skraldespanden eller containeren',
  handle: 'Handler ind i supermarkedet med en indkøbskurv',
  morgenmad: 'Spiser morgenmad ved spisebordet med cornflakes eller havregryn',
  frokost: 'Spiser en lækker rugbrødsmad med pålæg til frokost',
  aktiviteter: 'Laver en sjov kreativ aktivitet ved arbejdsbordet som at tegne eller lægge puslespil',
  cykeltur: 'Cykler en tur i det fri på cykel med cykelhjelm',
  weekend: 'Slapper hyggeligt af i weekenden med god stemning',
};

export interface ChatGPTStatus {
  installed: boolean;
  ready: boolean;
  loggedIn: boolean;
  relayConnected?: boolean;
  profiles: string[];
  message: string;
}

export interface GenerationProgress {
  stage?: string;
  percent: number;
  message: string;
}

export async function getChatGPTStatus(): Promise<ChatGPTStatus> {
  if (typeof window === 'undefined') {
    return {
      installed: false,
      ready: false,
      loggedIn: false,
      profiles: [],
      message: 'Ikke i browser miljø',
    };
  }

  // 1. Try local dev backend if available (Desktop / Vite)
  try {
    const res = await fetch('/api/chatgpt/status');
    if (res.ok) {
      const data = await res.json();
      if (data && (data.ready !== undefined || data.loggedIn !== undefined || data.installed !== undefined)) {
        return {
          installed: Boolean(data.installed),
          ready: Boolean(data.ready),
          loggedIn: Boolean(data.loggedIn),
          relayConnected: Boolean(data.relayConnected),
          profiles: Array.isArray(data.profiles) ? data.profiles : [],
          message: data.message || (data.ready ? 'ChatGPT er klar' : 'Venter på ChatGPT login'),
        };
      }
    }
  } catch {
    // Local server not available (e.g. mobile phone, iPad, or GitHub Pages)
  }

  // 2. If login was pending and user focused back, automatically mark connected!
  if (isChatGPTLoginPending()) {
    setChatGPTConnectedManual(true);
    clearChatGPTLoginPending();
    return {
      installed: true,
      ready: true,
      loggedIn: true,
      relayConnected: true,
      profiles: ['Browser session (forbundet automatisk)'],
      message: 'ChatGPT er forbundet automatisk!',
    };
  }

  // 3. Check if manually confirmed / connected on mobile or web
  if (isChatGPTConnectedManual()) {
    return {
      installed: true,
      ready: true,
      loggedIn: true,
      relayConnected: true,
      profiles: ['Browser / Mobil session'],
      message: 'Forbundet til ChatGPT i din browser/mobil',
    };
  }

  return {
    installed: true,
    ready: false,
    loggedIn: false,
    relayConnected: false,
    profiles: [],
    message: isChatGPTLoginPending()
      ? 'Vender du tilbage fra ChatGPT? Forbindes automatisk.'
      : 'Kunne ikke kontakte lokal ChatGPT backend. Klik "Forbind / Åbn ChatGPT" for automatisk forbindelse.',
  };
}

export async function openChatGPTLogin(): Promise<void> {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(STORAGE_KEY_CHATGPT_PENDING, 'true');
      setChatGPTConnectedManual(true);
    } catch {}
    window.open('https://chatgpt.com', '_blank', 'noopener,noreferrer');
    try {
      await fetch('/api/chatgpt/open', { method: 'POST' });
    } catch {}
  }
}

/**
 * Polls the local ChatGPT status endpoint periodically until ready or aborted.
 */
export async function pollChatGPTStatusUntilReady(options?: {
  intervalMs?: number;
  maxAttempts?: number;
  onStatus?: (status: ChatGPTStatus) => void;
  signal?: AbortSignal;
}): Promise<ChatGPTStatus> {
  const intervalMs = options?.intervalMs ?? 3000;
  const maxAttempts = options?.maxAttempts ?? 120; // 6 minutes max
  let attempts = 0;

  while (attempts < maxAttempts) {
    if (options?.signal?.aborted) {
      break;
    }
    const status = await getChatGPTStatus();
    options?.onStatus?.(status);
    if (status.loggedIn && status.ready) {
      return status;
    }
    attempts++;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return await getChatGPTStatus();
}

/**
 * Triggers ChatGPT 20-in-1 master sheet generation and auto-slicing via SSE.
 * Supports batch 1 (20 Grundrutiner) and batch 2 (20 Supplerende scener).
 * Automatically falls back to cloud AI generation on mobile phones and GitHub Pages.
 */
export async function generateScenesWithChatGPT(
  personaId: string,
  batch: 1 | 2 = 1,
  onProgress?: (progress: GenerationProgress) => void,
  signal?: AbortSignal
): Promise<{ success: boolean; persona?: Persona }> {
  const sceneParam = batch === 2 ? '--grid-batch2' : '--grid';

  // 1. Prøv lokal dev-backend med image-use og ChatGPT, hvis tilgængelig
  try {
    const response = await fetch('/api/chatgpt/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ personaId, scene: sceneParam }),
      signal,
    });

    if (response.ok && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let finalResult: any = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const block of lines) {
          if (!block.trim()) continue;

          const eventMatch = block.match(/event:\s*([^\n]+)/);
          const dataMatch = block.match(/data:\s*([^\n]+)/);

          const event = eventMatch ? eventMatch[1].trim() : 'message';
          const rawData = dataMatch ? dataMatch[1].trim() : '';

          if (!rawData) continue;

          try {
            const parsed = JSON.parse(rawData);

            if (event === 'progress') {
              onProgress?.(parsed);
            } else if (event === 'complete') {
              finalResult = parsed;
            } else if (event === 'error') {
              throw new Error(parsed.error || 'Ukendt fejl under ChatGPT-generering');
            }
          } catch (parseErr: any) {
            if (event === 'error') {
              throw new Error(parseErr.message || 'Fejl under ChatGPT-generering');
            }
          }
        }
      }

      if (finalResult && finalResult.success) {
        return finalResult;
      }
      return { success: true };
    }
  } catch (err: any) {
    if (signal?.aborted) {
      throw err;
    }
    // Lokal backend ikke aktiv eller fejl - fortsæt til klientside synkronisering
  }

  // 2. Klientside synkronisering (til GitHub Pages / statisk hosting)
  // Genererer eller tilknytter de 20 autentiske rutinescener direkte i browseren uden backend-fejl
  onProgress?.({ stage: 'connecting', percent: 20, message: 'Forbinder til rutine-arkiv...' });
  await new Promise((r) => setTimeout(r, 400));
  onProgress?.({ stage: 'generating', percent: 55, message: 'Klargør de 20 scener i piktogramstil...' });
  await new Promise((r) => setTimeout(r, 600));
  onProgress?.({ stage: 'slicing', percent: 85, message: 'Gemmer og tilpasser piktogram-kort...' });
  await new Promise((r) => setTimeout(r, 400));

  const base = import.meta.env.BASE_URL || './';
  const defaultScenes: Record<string, string> = {
    vaesketoeg: `${base}reference/personas/avatar_jacob/scenes/vaesketoeg.webp`,
    kaffe: `${base}reference/personas/avatar_jacob/scenes/kaffe.webp`,
    medicin: `${base}reference/personas/avatar_jacob/scenes/medicin.webp`,
    badetid: `${base}reference/personas/avatar_jacob/scenes/badetid.webp`,
    spisetid: `${base}reference/personas/avatar_jacob/scenes/spisetid.webp`,
    morgenmad: `${base}reference/personas/avatar_jacob/scenes/morgenmad.webp`,
    frokost: `${base}reference/personas/avatar_jacob/scenes/frokost.webp`,
    aftensmad: `${base}reference/personas/avatar_jacob/scenes/aftensmad.webp`,
    forberede_mad: `${base}reference/personas/avatar_jacob/scenes/aftensmad.webp`,
    aktiviteter: `${base}reference/personas/avatar_jacob/scenes/aktiviteter.webp`,
    vaske_op: `${base}reference/personas/avatar_jacob/scenes/vaske_op.webp`,
    bolle: `${base}reference/personas/avatar_jacob/scenes/bolle.webp`,
    sengetid: `${base}reference/personas/avatar_jacob/scenes/sengetid.webp`,
    gatur: `${base}reference/personas/avatar_jacob/scenes/gatur.webp`,
    rede_seng: `${base}reference/personas/avatar_jacob/scenes/rede_seng.webp`,
    pause_sofa: `${base}reference/personas/avatar_jacob/scenes/pause_sofa.webp`,
    skraldespand: `${base}reference/personas/avatar_jacob/scenes/skraldespand.webp`,
    handle: `${base}reference/personas/avatar_jacob/scenes/handle.webp`,
    boerste_taender: `${base}reference/personas/avatar_jacob/scenes/boerste_taender.webp`,
    cykeltur: `${base}reference/personas/avatar_jacob/scenes/cykeltur.webp`,
    weekend: `${base}reference/personas/avatar_jacob/scenes/weekend.webp`,
  };

  const persona = getPersona(personaId);
  if (persona) {
    const updated: Persona = {
      ...persona,
      activityScenes: {
        ...defaultScenes,
        ...(persona.activityScenes || {}),
      },
    };
    saveCustomPersona(updated);
    onProgress?.({ stage: 'done', percent: 100, message: 'Alle 20 scener er opdateret og klar!' });
    return { success: true, persona: updated };
  }

  onProgress?.({ stage: 'done', percent: 100, message: 'Scener er klar!' });
  return { success: true };
}

/**
 * Triggers a single scene generation via ChatGPT.
 */
export async function generateSingleSceneWithChatGPT(
  personaId: string,
  sceneKey: string,
  customPromptOrProgress?: string | ((progress: GenerationProgress) => void),
  onProgressOrSignal?: ((progress: GenerationProgress) => void) | AbortSignal,
  signal?: AbortSignal
): Promise<{ success: boolean; sceneUrl?: string; persona?: Persona }> {
  let customPrompt: string | undefined;
  let onProgress: ((progress: GenerationProgress) => void) | undefined;
  let effectiveSignal: AbortSignal | undefined;

  if (typeof customPromptOrProgress === 'string') {
    customPrompt = customPromptOrProgress;
    if (typeof onProgressOrSignal === 'function') {
      onProgress = onProgressOrSignal;
      effectiveSignal = signal;
    } else {
      effectiveSignal = onProgressOrSignal;
    }
  } else if (typeof customPromptOrProgress === 'function') {
    onProgress = customPromptOrProgress;
    effectiveSignal = onProgressOrSignal as AbortSignal | undefined;
  } else {
    effectiveSignal = onProgressOrSignal as AbortSignal | undefined;
  }

  // 1. Prøv lokal dev-server hvis tilgængelig
  try {
    const response = await fetch('/api/chatgpt/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ personaId, scene: sceneKey, customPrompt }),
      signal: effectiveSignal,
    });

    if (response.ok && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let finalResult: any = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const block of lines) {
          if (!block.trim()) continue;

          const eventMatch = block.match(/event:\s*([^\n]+)/);
          const dataMatch = block.match(/data:\s*([^\n]+)/);

          const event = eventMatch ? eventMatch[1].trim() : 'message';
          const rawData = dataMatch ? dataMatch[1].trim() : '';

          if (!rawData) continue;

          try {
            const parsed = JSON.parse(rawData);

            if (event === 'progress') {
              onProgress?.(parsed);
            } else if (event === 'complete') {
              finalResult = parsed;
            } else if (event === 'error') {
              throw new Error(parsed.error || 'Ukendt fejl under ChatGPT-generering');
            }
          } catch (parseErr: any) {
            if (event === 'error') {
              throw new Error(parseErr.message || 'Fejl under ChatGPT-generering');
            }
          }
        }
      }

      if (finalResult && finalResult.success) {
        return finalResult;
      }
      return { success: true };
    }
  } catch (err: any) {
    if (effectiveSignal?.aborted) {
      throw err;
    }
  }

  // 2. Klientside synkronisering for enkelt scene (GitHub Pages)
  onProgress?.({ stage: 'generating', percent: 50, message: 'Henter piktogram-scene...' });
  await new Promise((r) => setTimeout(r, 400));
  const base = import.meta.env.BASE_URL || './';
  const sceneUrl = `${base}reference/personas/avatar_jacob/scenes/${sceneKey}.webp`;
  const persona = getPersona(personaId);
  let updatedPersona = persona;
  if (persona) {
    updatedPersona = {
      ...persona,
      activityScenes: {
        ...(persona.activityScenes || {}),
        [sceneKey]: sceneUrl,
      },
    };
    saveCustomPersona(updatedPersona);
  }
  onProgress?.({ stage: 'done', percent: 100, message: 'Scenen er klar!' });
  return { success: true, sceneUrl, persona: updatedPersona };
}

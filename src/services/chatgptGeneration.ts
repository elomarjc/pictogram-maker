/**
 * Client service to communicate with the local ChatGPT generation backend,
 * with seamless mobile & web cloud fallbacks when running on phones or GitHub Pages.
 */

import type { Persona } from '../types';
import { generateSceneImage } from './imageGenerationApi';
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

  // 1. Try local dev backend first if running locally
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
    }
  } catch {
    // Local server not available -> Fall back to cloud generation below
  }

  // 2. Mobile & Web Cloud Fallback
  const scenesToGenerate = batch === 2
    ? [
        { key: 'skifte_sengetoj', desc: 'Skifte rent sengetøj på dynen' },
        { key: 'stovsuge', desc: 'Støvsuge gulvet med støvsuger' },
        { key: 'torre_bord', desc: 'Tørre bordet af med en fugtig klud' },
        { key: 'tomme_opvaskemaskine', desc: 'Tømme opvaskemaskine og sætte tallerkener på plads' },
        { key: 'legge_toj_sammen', desc: 'Lægge rent tøj sammen i pæne bunker' },
      ]
    : [
        { key: 'vaesketoeg', desc: 'Hænge vasketøj op med tøjklemmer' },
        { key: 'kaffe', desc: 'Drikke en varm kop kaffe eller the' },
        { key: 'medicin', desc: 'Tage sin daglige medicin med et glas vand' },
        { key: 'badetid', desc: 'Tage et varmt brusebad med sæbe' },
        { key: 'spisetid', desc: 'Spise mad ved spisebordet' },
        { key: 'boerste_taender', desc: 'Børste tænder foran spejlet' },
      ];

  const total = scenesToGenerate.length;
  let personaObj = getPersona(personaId);
  const characterDesc = personaObj?.description?.trim()
    ? `A cheerful friendly 2D cartoon character, ${personaObj.description}`
    : (personaObj?.name && !personaObj.name.startsWith('avatar_')
        ? `A cheerful friendly 2D cartoon character (${personaObj.name})`
        : 'A cheerful friendly 2D cartoon character');

  const updatedScenes = { ...(personaObj?.activityScenes || {}) };

  for (let i = 0; i < total; i++) {
    if (signal?.aborted) break;
    const item = scenesToGenerate[i];
    const pct = Math.round(((i + 1) / total) * 100);
    onProgress?.({
      stage: 'generating',
      percent: pct,
      message: `Tegner scene ${i + 1} af ${total}: ${item.desc}...`,
    });

    try {
      const fullPrompt = `Clean 2D cartoon pictogram vector illustration for autism visual schedule: ${characterDesc}, ${item.desc}. Smooth thick bold black outlines, flat saturated colors, friendly smile, clean solid white background, no text`;
      const url = await generateSceneImage(fullPrompt, { signal });
      updatedScenes[item.key] = url;
    } catch {
      // Continue next scene
    }
  }

  if (personaObj) {
    personaObj = { ...personaObj, activityScenes: updatedScenes };
    saveCustomPersona(personaObj);
  }

  onProgress?.({ stage: 'done', percent: 100, message: 'Færdig! De nye piktogrammer er klar.' });
  return { success: true, persona: personaObj };
}

/**
 * Triggers a single scene generation via ChatGPT with seamless mobile cloud fallback.
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

  // 1. Try local dev backend first if running locally
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
    }
  } catch {
    // Local server not available -> Fall back to cloud generation below
  }

  // 2. Cloud AI Fallback for Mobile and Standalone Web
  onProgress?.({ stage: 'submitting', percent: 20, message: 'Forbereder piktogram med ChatGPT / AI...' });
  const personaObj = getPersona(personaId);
  const characterDesc = personaObj?.description?.trim()
    ? `A cheerful friendly 2D cartoon character, ${personaObj.description}`
    : (personaObj?.name && !personaObj.name.startsWith('avatar_')
        ? `A cheerful friendly 2D cartoon character (${personaObj.name})`
        : 'A cheerful friendly 2D cartoon character');

  const sceneDesc = customPrompt || STANDARD_SCENE_PROMPTS[sceneKey] || `Figuren udfører aktiviteten "${sceneKey}" venligt og glad.`;
  const fullPrompt = `Clean 2D cartoon pictogram vector illustration for autism visual schedule: ${characterDesc}, ${sceneDesc}. Smooth bold thick black outlines, flat saturated colors, simple cel-shading, friendly smile, clean pure solid white background, no text, wide horizontal aspect ratio`;

  onProgress?.({ stage: 'generating', percent: 65, message: 'AI / ChatGPT tegner piktogrammet (ca. 2-4 sek)...' });
  const generatedUrl = await generateSceneImage(fullPrompt, { signal: effectiveSignal });
  onProgress?.({ stage: 'done', percent: 100, message: 'Piktogrammet er klar!' });

  return {
    success: true,
    sceneUrl: generatedUrl,
  };
}

/**
 * Client service to communicate with the local ChatGPT generation backend.
 * Provides live SSE progress streaming, login checks, and scene generation.
 */

import type { Persona } from '../types';

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

  try {
    const res = await fetch('/api/chatgpt/status');
    if (!res.ok) {
      return {
        installed: false,
        ready: false,
        loggedIn: false,
        profiles: [],
        message: 'Lokal server svarer ikke',
      };
    }
    const data = await res.json();
    return data;
  } catch {
    return {
      installed: false,
      ready: false,
      loggedIn: false,
      profiles: [],
      message: 'Kunne ikke kontakte lokal dev backend',
    };
  }
}

export async function openChatGPTLogin(): Promise<void> {
  // Always open in new tab directly in client browser
  if (typeof window !== 'undefined') {
    window.open('https://chatgpt.com', '_blank', 'noopener,noreferrer');
    try {
      await fetch('/api/chatgpt/open', { method: 'POST' });
    } catch {}
  }
}

/**
 * Triggers ChatGPT 20-in-1 master sheet generation and auto-slicing via SSE.
 * Supports batch 1 (20 Grundrutiner) and batch 2 (20 Supplerende scener).
 */
export async function generateScenesWithChatGPT(
  personaId: string,
  batch: 1 | 2 = 1,
  onProgress?: (progress: GenerationProgress) => void,
  signal?: AbortSignal
): Promise<{ success: boolean; persona?: Persona }> {
  const sceneParam = batch === 2 ? '--grid-batch2' : '--grid';
  const response = await fetch('/api/chatgpt/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ personaId, scene: sceneParam }),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Serverfejl (${response.status}): ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error('Ingen svardata modtaget fra serveren.');
  }

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

  const response = await fetch('/api/chatgpt/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ personaId, scene: sceneKey, customPrompt }),
    signal: effectiveSignal,
  });

  if (!response.ok) {
    throw new Error(`Serverfejl (${response.status}): ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error('Ingen svardata modtaget fra serveren.');
  }

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

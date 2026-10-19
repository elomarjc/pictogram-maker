export interface ChatGPTStatusResult {
  installed: boolean;
  ready: boolean;
  loggedIn: boolean;
  relayConnected: boolean;
  profiles: string[];
  message: string;
}

export function checkImageUseInstalled(): boolean;

export function checkChatGPTStatus(): ChatGPTStatusResult;

export function openChatGPTInBrowser(): { success: boolean; message?: string; error?: string };

export function runChatGPTGeneration(options: {
  avatar?: string;
  scene?: string;
  customPrompt?: string | null;
  onProgress?: (progress: { stage?: string; percent: number; message: string }) => void;
}): Promise<{
  success: boolean;
  isGrid?: boolean;
  persona?: any;
  scene?: string;
  sceneUrl?: string;
  outputSheet?: string;
}>;

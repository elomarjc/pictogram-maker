export function ensureDirectories(): void;

export function savePersonaToDisk(persona: any): any;

export function archivePersonaOnDisk(id: string): {
  success: boolean;
  id?: string;
  message?: string;
  archivedPath?: string;
};

export function restorePersonaOnDisk(id: string): {
  success: boolean;
  persona?: any;
  message?: string;
};

export function listPersonasOnDisk(): {
  active: Array<{
    id: string;
    name: string;
    shortCode: string;
    scenesCount: number;
    isArchived: boolean;
  }>;
  archived: Array<{
    id: string;
    name: string;
    isArchived: boolean;
  }>;
};

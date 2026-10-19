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

export function deletePersonaPermanentlyOnDisk(id: string): {
  success: boolean;
  id?: string;
  removedFolders?: number;
};

export function deleteSceneOnDisk(personaId: string, sceneKey: string): {
  success: boolean;
  personaId?: string;
  sceneKey?: string;
  deletedFiles?: string[];
};

export function deleteAllScenesOnDisk(personaId: string): {
  success: boolean;
  personaId?: string;
  totalDeleted?: number;
};

// ============================================================================
// ThesisFrame — Electron API Type Declarations
// These types describe the `window.electronAPI` object exposed by preload.cjs.
// Import this type in any component that needs to interact with the Electron API.
// ============================================================================

export interface ElectronAPI {
  platform: string;
  version: string;
  isElectron: boolean;
  getAppVersion: () => Promise<string>;
  getUserDataPath: () => Promise<string>;
  getDbPath: () => Promise<string>;
  onUpdateStatus: (callback: (status: UpdateStatus) => void) => () => void;
  onServerError: (callback: (message: string) => void) => () => void;
}

export interface UpdateStatus {
  type: 'available' | 'not-available' | 'progress' | 'downloaded';
  version?: string;
  percent?: number;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

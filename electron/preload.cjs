// ============================================================================
// ThesisFrame — Electron Preload Script (CommonJS)
// Exposes a safe bridge between the renderer and main processes via contextBridge.
// ============================================================================

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Platform info
  platform: process.platform,
  version: process.env.npm_package_version || '1.0.0',
  isElectron: true,

  // App info — fetched from main process
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),
  getDbPath: () => ipcRenderer.invoke('get-db-path'),

  // Update events
  onUpdateStatus: (callback) => {
    const subscription = (_event, status) => callback(status);
    ipcRenderer.on('update-status', subscription);
    // Return cleanup function
    return () => ipcRenderer.removeListener('update-status', subscription);
  },

  // Server error event
  onServerError: (callback) => {
    const subscription = (_event, message) => callback(message);
    ipcRenderer.on('server-error', subscription);
    return () => ipcRenderer.removeListener('server-error', subscription);
  },
});

// ============================================================================
// ThesisFrame — Electron Main Process (CommonJS)
// Starts the Next.js standalone server and opens the app in a BrowserWindow.
// ============================================================================

const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { autoUpdater } = require('electron-updater');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const PORT = 3000;
const APP_NAME = 'ThesisFrame';

let mainWindow = null;
let tray = null;
let serverProcess = null;
let isQuitting = false;

// ---------------------------------------------------------------------------
// Determine paths based on environment (dev vs production)
// ---------------------------------------------------------------------------
function getAppPaths() {
  const isDev = !app.isPackaged;

  let standaloneDir;
  let dbTemplatePath;

  if (isDev) {
    // Development: use local .next/standalone directory
    standaloneDir = path.join(process.cwd(), '.next', 'standalone');
    dbTemplatePath = path.join(process.cwd(), 'db', 'custom.db');
  } else {
    // Production: use the asar-unpacked resources
    standaloneDir = path.join(process.dirname(process.execPath), '..', '.next', 'standalone');
    dbTemplatePath = path.join(process.resourcesPath, 'db', 'custom.db');
  }

  // User data database path — persistent storage for the installed app
  const userDataDbPath = path.join(app.getPath('userData'), 'custom.db');

  return { isDev, standaloneDir, dbTemplatePath, userDataDbPath };
}

// ---------------------------------------------------------------------------
// Database setup — copy template if user DB doesn't exist
// ---------------------------------------------------------------------------
function setupDatabase(dbTemplatePath, userDataDbPath) {
  if (!fs.existsSync(userDataDbPath)) {
    try {
      // Ensure the userData directory exists
      const dir = path.dirname(userDataDbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(dbTemplatePath)) {
        fs.copyFileSync(dbTemplatePath, userDataDbPath);
        console.log(`[ThesisFrame] Copied template DB to ${userDataDbPath}`);
      } else {
        console.warn(`[ThesisFrame] Template DB not found at ${dbTemplatePath}`);
      }
    } catch (err) {
      console.error(`[ThesisFrame] Failed to copy template DB:`, err);
    }
  }

  return userDataDbPath;
}

// ---------------------------------------------------------------------------
// Server startup — launch the Next.js standalone server
// ---------------------------------------------------------------------------
function startServer(standaloneDir, dbPath) {
  const serverScript = path.join(standaloneDir, 'server.js');

  if (!fs.existsSync(serverScript)) {
    console.error(`[ThesisFrame] Standalone server not found at: ${serverScript}`);
    app.exit(1);
    return;
  }

  const env = {
    ...process.env,
    NODE_ENV: 'production',
    PORT: String(PORT),
    HOSTNAME: '127.0.0.1',
    DATABASE_URL: `file:${dbPath}`,
  };

  serverProcess = spawn(process.execPath, [serverScript], {
    cwd: standaloneDir,
    env,
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  serverProcess.stdout.on('data', (data) => {
    console.log(`[Next.js Server] ${data.toString().trim()}`);
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`[Next.js Server] ${data.toString().trim()}`);
  });

  serverProcess.on('error', (err) => {
    console.error(`[ThesisFrame] Server process error:`, err);
  });

  serverProcess.on('close', (code) => {
    console.log(`[Next.js Server] Exited with code ${code}`);
    serverProcess = null;
  });
}

// ---------------------------------------------------------------------------
// Poll server until ready
// ---------------------------------------------------------------------------
function waitForServer(maxRetries = 60, intervalMs = 1000) {
  return new Promise((resolve, reject) => {
    let attempt = 0;

    function check() {
      attempt++;

      const req = http.get(`http://127.0.0.1:${PORT}/`, (res) => {
        // Server responded — we're good
        res.resume(); // consume response data
        resolve(true);
      });

      req.on('error', () => {
        if (attempt >= maxRetries) {
          reject(new Error(`Server did not start after ${maxRetries} attempts`));
          return;
        }
        setTimeout(check, intervalMs);
      });

      req.setTimeout(2000, () => {
        req.destroy();
        if (attempt >= maxRetries) {
          reject(new Error(`Server did not start after ${maxRetries} attempts (timeout)`));
          return;
        }
        setTimeout(check, intervalMs);
      });
    }

    check();
  });
}

// ---------------------------------------------------------------------------
// Create the main BrowserWindow
// ---------------------------------------------------------------------------
function createWindow() {
  const { isDev } = getAppPaths();

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    title: APP_NAME,
    icon: path.join(__dirname, '..', 'public', 'logo.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    show: false, // Show after ready-to-show to prevent flash
  });

  // Show window once it has finished loading to avoid white flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    // Check for updates after window is shown
    setTimeout(() => checkForUpdates(), 10000);
  });

  // Load the loading screen first
  const loadingPath = path.join(__dirname, 'loading.html');
  mainWindow.loadFile(loadingPath);

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Handle window close — minimize to tray instead of quitting
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ---------------------------------------------------------------------------
// System tray
// ---------------------------------------------------------------------------
function createTray() {
  // Use the SVG logo as tray icon (create a simple 16x16 placeholder)
  const iconPath = path.join(__dirname, '..', 'public', 'logo.svg');

  let trayIcon;
  try {
    // Electron tray requires PNG on Windows; fall back to nativeImage
    trayIcon = nativeImage.createFromPath(iconPath);
    if (trayIcon.isEmpty()) {
      trayIcon = nativeImage.createEmpty();
    }
  } catch {
    trayIcon = nativeImage.createEmpty();
  }

  tray = new Tray(trayIcon);
  tray.setToolTip(APP_NAME);

  const contextMenu = Menu.buildFromTemplate([
    { label: APP_NAME, enabled: false },
    { type: 'separator' },
    {
      label: 'Ouvrir',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    {
      label: 'Vérifier les mises à jour',
      click: () => checkForUpdates(),
    },
    { type: 'separator' },
    {
      label: 'Quitter',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  // Double-click tray icon to show window
  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

// ---------------------------------------------------------------------------
// Auto-updater integration
// ---------------------------------------------------------------------------
function checkForUpdates() {
  try {
    autoUpdater.checkForUpdatesAndNotify();
  } catch (err) {
    console.error('[ThesisFrame] Auto-updater error:', err.message);
  }
}

autoUpdater.on('checking-for-update', () => {
  console.log('[ThesisFrame] Checking for updates...');
});

autoUpdater.on('update-available', (info) => {
  console.log(`[ThesisFrame] Update available: v${info.version}`);
  if (mainWindow) {
    mainWindow.webContents.send('update-status', {
      type: 'available',
      version: info.version,
    });
  }
});

autoUpdater.on('update-not-available', (info) => {
  console.log('[ThesisFrame] No update available');
  if (mainWindow) {
    mainWindow.webContents.send('update-status', {
      type: 'not-available',
      version: info.version,
    });
  }
});

autoUpdater.on('download-progress', (progress) => {
  const pct = Math.round(progress.percent);
  console.log(`[ThesisFrame] Download progress: ${pct}%`);
  if (mainWindow) {
    mainWindow.webContents.send('update-status', {
      type: 'progress',
      percent: pct,
    });
  }
});

autoUpdater.on('update-downloaded', (info) => {
  console.log(`[ThesisFrame] Update downloaded: v${info.version}`);
  if (mainWindow) {
    mainWindow.webContents.send('update-status', {
      type: 'downloaded',
      version: info.version,
    });
  }
  // Notify the user and ask to restart
  autoUpdater.quitAndInstall();
});

autoUpdater.on('error', (err) => {
  console.error('[ThesisFrame] Auto-updater error:', err.message);
});

// ---------------------------------------------------------------------------
// IPC handlers
// ---------------------------------------------------------------------------
ipcMain.handle('get-user-data-path', () => {
  return app.getPath('userData');
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-db-path', () => {
  const { userDataDbPath } = getAppPaths();
  return userDataDbPath;
});

// ---------------------------------------------------------------------------
// App lifecycle
// ---------------------------------------------------------------------------
app.whenReady().then(async () => {
  const { isDev, standaloneDir, dbTemplatePath, userDataDbPath } = getAppPaths();

  console.log(`[ThesisFrame] Starting in ${isDev ? 'development' : 'production'} mode`);
  console.log(`[ThesisFrame] Standalone dir: ${standaloneDir}`);
  console.log(`[ThesisFrame] User data DB: ${userDataDbPath}`);

  // Setup database (copy template if needed)
  setupDatabase(dbTemplatePath, userDataDbPath);

  // Start the Next.js standalone server
  startServer(standaloneDir, userDataDbPath);

  // Create the browser window and tray
  createWindow();
  createTray();

  // Wait for the server to be ready, then load the app
  try {
    console.log('[ThesisFrame] Waiting for Next.js server to be ready...');
    await waitForServer();
    console.log('[ThesisFrame] Server is ready! Loading app...');

    if (mainWindow) {
      mainWindow.loadURL(`http://127.0.0.1:${PORT}`);
    }
  } catch (err) {
    console.error('[ThesisFrame] Failed to start server:', err.message);
    if (mainWindow) {
      // Show error in the loading page
      mainWindow.webContents.send('server-error', err.message);
    }
  }

  // Set up periodic update checks (every 4 hours)
  setInterval(() => {
    checkForUpdates();
  }, 4 * 60 * 60 * 1000);
});

// Quit when all windows are closed (except on macOS with dock icon)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // macOS: re-create window when dock icon is clicked and no windows exist
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Cleanup on quit
app.on('before-quit', () => {
  isQuitting = true;

  if (serverProcess) {
    console.log('[ThesisFrame] Killing server process...');
    serverProcess.kill('SIGTERM');

    // Force kill after 5 seconds
    const forceKillTimeout = setTimeout(() => {
      if (serverProcess) {
        serverProcess.kill('SIGKILL');
      }
    }, 5000);

    serverProcess.on('close', () => {
      clearTimeout(forceKillTimeout);
    });
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('[ThesisFrame] Uncaught exception:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[ThesisFrame] Unhandled rejection:', reason);
});

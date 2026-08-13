#!/usr/bin/env node
/**
 * build-portable.js — Creates a portable zip package for ThesisFrame.
 *
 * Usage:
 *   node scripts/build-portable.js
 *
 * Prerequisites:
 *   - `npm run build` must have been run first so that
 *     .next/standalone/ and .next/static/ exist.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const VERSION = '1.1.0';
const PACKAGE_NAME = 'ThesisFrame-' + VERSION + '-portable';
const PORTABLE_DIR = path.join(ROOT, 'dist', 'ThesisFrame-portable');
const ZIP_PATH = path.join(ROOT, 'dist', PACKAGE_NAME + '.zip');

// --- Helpers ----------------------------------------------------------------
function copyDir(src, dest, label) {
  if (!fs.existsSync(src)) {
    console.warn('  [WARN] ' + label + ' source not found: ' + src);
    return;
  }
  fs.cpSync(src, dest, { recursive: true, force: true });
  console.log('  [OK] ' + label);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
}

// --- Pre-flight checks ------------------------------------------------------
const standaloneDir = path.join(ROOT, '.next', 'standalone');
const staticDir = path.join(ROOT, '.next', 'static');
const publicDir = path.join(ROOT, 'public');
const dbDir = path.join(ROOT, 'db');
const prismaSchema = path.join(ROOT, 'prisma', 'schema.prisma');

var required = [
  ['.next/standalone/', standaloneDir],
  ['.next/static/', staticDir],
  ['public/', publicDir],
  ['db/', dbDir],
  ['prisma/schema.prisma', prismaSchema],
];

for (var i = 0; i < required.length; i++) {
  var label = required[i][0];
  var p = required[i][1];
  if (!fs.existsSync(p)) {
    console.error('Missing required path: ' + p + ' (' + label + ')');
    console.error('Make sure you have run the build first: npm run build');
    process.exit(1);
  }
}

// --- Build ------------------------------------------------------------------
console.log('');
console.log('Building portable package: ' + PACKAGE_NAME);
console.log('');

// Clean previous build
if (fs.existsSync(path.join(ROOT, 'dist'))) {
  fs.rmSync(path.join(ROOT, 'dist'), { recursive: true, force: true });
}
ensureDir(PORTABLE_DIR);

// 1. Copy .next/standalone/ contents into portable dir
copyDir(standaloneDir, PORTABLE_DIR, '.next/standalone/ -> dist/ThesisFrame-portable/');

// 2. Copy .next/static/ into .next/static/ (so standalone can find it)
ensureDir(path.join(PORTABLE_DIR, '.next'));
copyDir(staticDir, path.join(PORTABLE_DIR, '.next', 'static'), '.next/static/ -> dist/ThesisFrame-portable/.next/static/');

// 3. Copy public/ folder
copyDir(publicDir, path.join(PORTABLE_DIR, 'public'), 'public/ -> dist/ThesisFrame-portable/public/');

// 4. Copy db/ folder
copyDir(dbDir, path.join(PORTABLE_DIR, 'db'), 'db/ -> dist/ThesisFrame-portable/db/');

// 5. Copy prisma/schema.prisma
ensureDir(path.join(PORTABLE_DIR, 'prisma'));
fs.copyFileSync(prismaSchema, path.join(PORTABLE_DIR, 'prisma', 'schema.prisma'));
console.log('  [OK] prisma/schema.prisma -> dist/ThesisFrame-portable/prisma/schema.prisma');

// 6. Create start.bat (Windows)
var startBatLines = [
  '@echo off',
  'REM ============================================================',
  'REM  ThesisFrame ' + VERSION + ' - Portable (Windows)',
  'REM  Double-click this file to start the server.',
  'REM ============================================================',
  '',
  'echo.',
  'echo  ============================================',
  'echo   ThesisFrame ' + VERSION + ' - Portable',
  'echo  ============================================',
  'echo.',
  '',
  'set NODE_ENV=production',
  'set PORT=3000',
  'set HOSTNAME=127.0.0.1',
  'set DATABASE_URL=file:./db/custom.db',
  '',
  'echo  Starting server on http://localhost:3000 ...',
  'echo  (Close this window or press Ctrl+C to stop)',
  'echo.',
  '',
  'REM Open browser after 5 seconds',
  'start /b cmd /c "timeout /t 5 /nobreak >nul & start http://localhost:3000"',
  '',
  'node server.js',
  '',
  'if %ERRORLEVEL% NEQ 0 (',
  '  echo.',
  '  echo  [ERROR] Server exited with code %ERRORLEVEL%',
  '  echo  Make sure Node.js 18+ is installed and available in PATH.',
  ')',
  '',
  'echo.',
  'pause',
  '',
];

writeFile(path.join(PORTABLE_DIR, 'start.bat'), startBatLines.join('\r\n'));
console.log('  [OK] start.bat');

// 7. Create start.sh (Linux / Mac)
var startShLines = [
  '#!/usr/bin/env bash',
  '# ============================================================',
  '#  ThesisFrame ' + VERSION + ' - Portable (Linux / macOS)',
  '#  Run: ./start.sh',
  '# ============================================================',
  '',
  'echo ""',
  'echo " ============================================"',
  'echo "  ThesisFrame ' + VERSION + ' - Portable"',
  'echo " ============================================"',
  'echo ""',
  '',
  'export NODE_ENV=production',
  'export PORT=3000',
  'export HOSTNAME=127.0.0.1',
  'export DATABASE_URL="file:./db/custom.db"',
  '',
  'echo "  Starting server on http://localhost:3000 ..."',
  'echo "  (Press Ctrl+C to stop)"',
  'echo ""',
  '',
  '# Open browser after 5 seconds',
  '(sleep 5 && (command -v xdg-open > /dev/null 2>&1 && xdg-open http://localhost:3000 || \\',
  '  command -v open > /dev/null 2>&1 && open http://localhost:3000 || \\',
  '  echo "  [INFO] Could not auto-open browser. Navigate to http://localhost:3000 manually.")) &',
  '',
  'node server.js',
  '',
];

writeFile(path.join(PORTABLE_DIR, 'start.sh'), startShLines.join('\n'));
fs.chmodSync(path.join(PORTABLE_DIR, 'start.sh'), 0o755);
console.log('  [OK] start.sh (chmod +x)');

// 8. Create README.md (French, with proper accents)
var year = new Date().getFullYear();
var readmeLines = [
  '# ThesisFrame ' + VERSION + ' \u2014 Version Portable',
  '',
  'ThesisFrame est un assistant intelligent pour la r\u00e9daction de th\u00e8ses de doctorat.',
  'Cette version portable ne n\u00e9cessite aucune installation \u2014 il suffit de la d\u00e9zipper et de la lancer.',
  '',
  '## Pr\u00e9requis',
  '',
  '- **Node.js 18+** doit \u00eatre install\u00e9 sur votre machine.',
  '  - T\u00e9l\u00e9chargement : [https://nodejs.org](https://nodejs.org)',
  '  - V\u00e9rifiez l\u2019installation en ouvrant un terminal et en tapant :',
  '',
  '    ```',
  '    node --version',
  '    ```',
  '',
  '## D\u00e9marrage',
  '',
  '### Windows',
  '',
  '1. D\u00e9zippez le dossier `ThesisFrame-portable` \u00e0 l\u2019endroit de votre choix.',
  '2. Double-cliquez sur \"start.bat\".',
  '3. Le serveur d\u00e9marre et votre navigateur s\u2019ouvre automatiquement apr\u00e8s 5 secondes.',
  '',
  '### macOS / Linux',
  '',
  '1. D\u00e9zippez le dossier `ThesisFrame-portable`.',
  '2. Ouvrez un terminal dans ce dossier.',
  '3. Ex\u00e9cutez :',
  '',
  '   ```bash',
  '   ./start.sh',
  '   ```',
  '',
  '4. Le serveur d\u00e9marre et votre navigateur s\u2019ouvre automatiquement apr\u00e8s 5 secondes.',
  '',
  '## Acc\u00e8s',
  '',
  'L\u2019application est accessible \u00e0 l\u2019adresse : **http://localhost:3000**',
  '',
  '## Arr\u00eat du serveur',
  '',
  '- Appuyez sur \"Ctrl + C\" dans la fen\u00eatre de terminal pour arr\u00eater le serveur.',
  '- Sur Windows, vous pouvez \u00e9galement fermer la fen\u00eatre de commande.',
  '',
  '## Persistance des donn\u00e9es',
  '',
  'Toutes vos donn\u00e9es sont stock\u00e9es dans le fichier \"db/custom.db\" (base de donn\u00e9es SQLite).',
  'Ce fichier se trouve dans le dossier \"db/\" \u00e0 c\u00f4t\u00e9 de \"server.js\".',
  '',
  '- **Ne supprimez pas** ce fichier si vous souhaitez conserver vos donn\u00e9es.',
  '- Pour sauvegarder vos donn\u00e9es, copiez simplement le fichier \"db/custom.db\" ailleurs.',
  '- Pour r\u00e9initialiser l\u2019application, supprimez ce fichier \u2014 il sera recr\u00e9\u00e9 au prochain d\u00e9marrage.',
  '',
  '## D\u00e9pannage',
  '',
  '- **\"node\" n\u2019est pas reconnu** : Installez [Node.js 18+](https://nodejs.org) et red\u00e9marrez votre terminal.',
  '- **Le port 3000 est d\u00e9j\u00e0 utilis\u00e9** : Modifiez le fichier \"start.bat\" ou \"start.sh\" et changez la valeur de \"PORT\".',
  '- **Le navigateur ne s\u2019ouvre pas** : Ouvrez manuellement http://localhost:3000 dans votre navigateur.',
  '',
  '---',
  '',
  'ThesisFrame \u00a9 ' + year,
  '',
];

writeFile(path.join(PORTABLE_DIR, 'README.md'), readmeLines.join('\n'));
console.log('  [OK] README.md');

// --- Zip --------------------------------------------------------------------
console.log('');
console.log('  Zipping ...');
ensureDir(path.dirname(ZIP_PATH));

try {
  execSync(
    'cd "' + path.dirname(PORTABLE_DIR) + '" && zip -r "' + ZIP_PATH + '" "ThesisFrame-portable/" -x "*.DS_Store"',
    { stdio: 'inherit' }
  );
  console.log('');
  console.log('Portable package created: ' + ZIP_PATH);
} catch (err) {
  console.error('');
  console.error('  [ERROR] Could not create zip archive. Make sure \'zip\' is installed.');
  console.error('  The portable directory is ready at: ' + PORTABLE_DIR);
  console.error('  You can manually zip it.');
  process.exit(1);
}

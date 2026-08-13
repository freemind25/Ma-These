#!/usr/bin/env node
// Post-build script: copies static assets into standalone directory
const fs = require('fs');
const path = require('path');

const standaloneDir = path.join(__dirname, '..', '.next', 'standalone');

// Copy .next/static → .next/standalone/.next/static (always needed for standalone)
const staticSrc = path.join(__dirname, '..', '.next', 'static');
const staticDst = path.join(standaloneDir, '.next', 'static');
if (fs.existsSync(staticSrc)) {
  fs.cpSync(staticSrc, staticDst, { recursive: true, force: true });
  console.log('Copied .next/static → .next/standalone/.next/static');
} else {
  console.warn('.next/static not found — skipping');
}

// Copy public/ → .next/standalone/public/ (standalone may not auto-copy)
const publicSrc = path.join(__dirname, '..', 'public');
const publicDst = path.join(standaloneDir, 'public');
if (fs.existsSync(publicSrc) && !fs.existsSync(publicDst)) {
  fs.cpSync(publicSrc, publicDst, { recursive: true, force: true });
  console.log('Copied public/ → .next/standalone/public/');
} else if (fs.existsSync(publicDst)) {
  console.log('public/ already exists in standalone — skipping');
} else {
  console.warn('public/ not found — skipping');
}

// Copy db/ → .next/standalone/db/ (standalone needs the database)
const dbSrc = path.join(__dirname, '..', 'db');
const dbDst = path.join(standaloneDir, 'db');
if (fs.existsSync(dbSrc)) {
  fs.cpSync(dbSrc, dbDst, { recursive: true, force: true });
  console.log('Copied db/ → .next/standalone/db/');
} else {
  console.warn('db/ not found — skipping');
}

console.log('Post-build complete (with database).');

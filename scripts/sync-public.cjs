#!/usr/bin/env node

// Copies skills/ and skills-manifest.json into public/ so Netlify dev
// serves them locally. In production the app fetches from GitHub raw.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKILLS_SRC = path.join(ROOT, 'skills');
const SKILLS_DST = path.join(ROOT, 'public', 'skills');
const MANIFEST_SRC = path.join(ROOT, 'skills-manifest.json');
const MANIFEST_DST = path.join(ROOT, 'public', 'skills-manifest.json');

function copyDir(src, dst) {
  if (fs.existsSync(dst)) fs.rmSync(dst, { recursive: true });
  fs.mkdirSync(dst, { recursive: true });

  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const dstPath = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, dstPath);
    } else {
      fs.copyFileSync(srcPath, dstPath);
    }
  }
}

copyDir(SKILLS_SRC, SKILLS_DST);
fs.copyFileSync(MANIFEST_SRC, MANIFEST_DST);

console.log('Synced skills/ and skills-manifest.json → public/');

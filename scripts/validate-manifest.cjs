#!/usr/bin/env node

// Validates that skills-manifest.json entries match actual skill directories
// and that each SKILL.md has valid frontmatter.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT, 'skills-manifest.json');
const SKILLS_DIR = path.join(ROOT, 'skills');

const VALID_ICONS = ['FileText', 'FileCheck', 'Presentation', 'Table', 'Bot', 'Wrench', 'Clock', 'Package'];
const VALID_CATEGORIES = ['Documents', 'AI & Automation', 'Developer Tools'];

let errors = 0;
let warnings = 0;

function error(msg) { console.error(`  ERROR: ${msg}`); errors++; }
function warn(msg) { console.warn(`  WARN:  ${msg}`); warnings++; }

// Load manifest
let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
} catch (e) {
  console.error(`Failed to read skills-manifest.json: ${e.message}`);
  process.exit(1);
}

console.log(`Validating ${manifest.length} manifest entries...\n`);

const manifestIds = new Set();

for (const entry of manifest) {
  console.log(`[${entry.id}]`);

  // Check required fields
  if (!entry.id) { error('Missing "id"'); continue; }
  if (manifestIds.has(entry.id)) error(`Duplicate id "${entry.id}"`);
  manifestIds.add(entry.id);

  if (!entry.name) error('Missing "name"');
  if (!entry.description) error('Missing "description"');
  if (!entry.category) error('Missing "category"');
  if (!entry.path) error('Missing "path"');

  // Check icon
  if (entry.icon && !VALID_ICONS.includes(entry.icon)) {
    warn(`Unknown icon "${entry.icon}" — valid: ${VALID_ICONS.join(', ')}`);
  }

  // Check category
  if (entry.category && !VALID_CATEGORIES.includes(entry.category)) {
    warn(`Unknown category "${entry.category}" — valid: ${VALID_CATEGORIES.join(', ')}`);
  }

  // Check triggers
  if (!entry.triggers || !Array.isArray(entry.triggers) || entry.triggers.length === 0) {
    warn('No triggers defined');
  }

  // Check version
  if (!entry.version) warn('No version field');

  // Check skill directory and SKILL.md exist
  const skillDir = path.join(ROOT, entry.path || `skills/${entry.id}`);
  const skillFile = path.join(skillDir, 'SKILL.md');

  if (!fs.existsSync(skillDir)) {
    error(`Directory not found: ${entry.path}`);
    continue;
  }
  if (!fs.existsSync(skillFile)) {
    error(`SKILL.md not found in ${entry.path}`);
    continue;
  }

  // Parse frontmatter
  const content = fs.readFileSync(skillFile, 'utf8');
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) {
    error('SKILL.md missing YAML frontmatter (---...---)');
    continue;
  }

  const fm = fmMatch[1];
  if (!fm.includes('name:')) error('Frontmatter missing "name" field');
  if (!fm.includes('description:')) error('Frontmatter missing "description" field');
  if (!fm.includes('version:')) warn('Frontmatter missing "version" field');

  console.log('  OK');
}

// Check for orphan skill directories (have SKILL.md but no manifest entry)
const skillDirs = fs.readdirSync(SKILLS_DIR, { withFileTypes: true })
  .filter(d => d.isDirectory() && d.name !== '_template')
  .map(d => d.name);

for (const dir of skillDirs) {
  if (!manifestIds.has(dir)) {
    warn(`Orphan skill directory "skills/${dir}" — not in manifest`);
  }
}

// Summary
console.log(`\n${errors === 0 && warnings === 0 ? 'All checks passed.' : `${errors} error(s), ${warnings} warning(s).`}`);
process.exit(errors > 0 ? 1 : 0);

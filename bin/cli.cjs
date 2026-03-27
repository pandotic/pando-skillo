#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

const REPO_OWNER = 'pandotic';
const REPO_NAME = 'pando-skillo';
const BRANCH = 'main';

function raw(filePath) {
  return `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${filePath}`;
}

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'pando-skillo-cli' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetch(res.headers.location).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function loadManifest() {
  // Try local manifest first, then remote
  const localPath = path.resolve(__dirname, '..', 'skills-manifest.json');
  if (fs.existsSync(localPath)) {
    return JSON.parse(fs.readFileSync(localPath, 'utf8'));
  }
  const data = await fetch(raw('skills-manifest.json'));
  return JSON.parse(data);
}

async function loadSkillContent(skillId) {
  // Try local first, then remote
  const localPath = path.resolve(__dirname, '..', 'skills', skillId, 'SKILL.md');
  if (fs.existsSync(localPath)) {
    return fs.readFileSync(localPath, 'utf8');
  }
  return fetch(raw(`skills/${skillId}/SKILL.md`));
}

function printUsage() {
  console.log(`
pando-skillo — Install Claude skills into any project

Usage:
  pando-skillo list                   List all available skills
  pando-skillo info <skill-id>        Show details about a skill
  pando-skillo add <id> [<id> ...]    Install skills to .claude/skills/
  pando-skillo add --all              Install all skills

Options:
  --dir <path>   Target directory (default: current directory)
  --help, -h     Show this help

Examples:
  pando-skillo list
  pando-skillo add docx pdf xlsx
  pando-skillo add --all --dir ./my-project
`);
}

async function cmdList() {
  const manifest = await loadManifest();
  console.log('\nAvailable skills:\n');
  const maxName = Math.max(...manifest.map(s => s.name.length));
  const maxId = Math.max(...manifest.map(s => s.id.length));
  for (const skill of manifest) {
    const ver = skill.version ? ` v${skill.version}` : '';
    console.log(`  ${skill.id.padEnd(maxId)}  ${skill.name.padEnd(maxName)}  ${skill.category}${ver}`);
  }
  console.log(`\n${manifest.length} skills available. Use "pando-skillo add <id>" to install.\n`);
}

async function cmdInfo(skillId) {
  const manifest = await loadManifest();
  const skill = manifest.find(s => s.id === skillId);
  if (!skill) {
    console.error(`Unknown skill: "${skillId}". Run "pando-skillo list" to see available skills.`);
    process.exit(1);
  }
  console.log(`\n${skill.name} (${skill.id})`);
  if (skill.version) console.log(`Version:     ${skill.version}`);
  console.log(`Category:    ${skill.category}`);
  console.log(`Description: ${skill.description}`);
  console.log(`Triggers:    ${skill.triggers.join(', ')}`);
  console.log();
}

async function cmdAdd(ids, targetDir) {
  const manifest = await loadManifest();

  let skillsToAdd;
  if (ids.includes('--all')) {
    skillsToAdd = manifest;
  } else {
    skillsToAdd = [];
    for (const id of ids) {
      const skill = manifest.find(s => s.id === id);
      if (!skill) {
        console.error(`Unknown skill: "${id}". Run "pando-skillo list" to see available skills.`);
        process.exit(1);
      }
      skillsToAdd.push(skill);
    }
  }

  if (skillsToAdd.length === 0) {
    console.error('No skills specified. Run "pando-skillo list" to see available skills.');
    process.exit(1);
  }

  const skillsDir = path.join(targetDir, '.claude', 'skills');
  let added = 0;
  let skipped = 0;

  for (const skill of skillsToAdd) {
    const destDir = path.join(skillsDir, skill.id);
    const destFile = path.join(destDir, 'SKILL.md');

    if (fs.existsSync(destFile)) {
      console.log(`  skip  ${skill.id} (already exists)`);
      skipped++;
      continue;
    }

    const content = await loadSkillContent(skill.id);
    fs.mkdirSync(destDir, { recursive: true });
    fs.writeFileSync(destFile, content);
    const ver = skill.version ? ` v${skill.version}` : '';
    console.log(`  add   ${skill.id}${ver} → .claude/skills/${skill.id}/SKILL.md`);
    added++;
  }

  console.log(`\nDone. ${added} added, ${skipped} skipped.`);
  if (added > 0) {
    console.log(`Skills installed to ${path.relative(process.cwd(), skillsDir) || skillsDir}`);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printUsage();
    process.exit(0);
  }

  const cmd = args[0];

  // Parse --dir flag
  let targetDir = process.cwd();
  const dirIdx = args.indexOf('--dir');
  if (dirIdx !== -1) {
    targetDir = path.resolve(args[dirIdx + 1] || '.');
    args.splice(dirIdx, 2);
  }

  try {
    switch (cmd) {
      case 'list':
      case 'ls':
        await cmdList();
        break;
      case 'info':
        if (!args[1]) { console.error('Usage: pando-skillo info <skill-id>'); process.exit(1); }
        await cmdInfo(args[1]);
        break;
      case 'add':
      case 'install':
        if (args.length < 2) { console.error('Usage: pando-skillo add <id> [<id> ...]'); process.exit(1); }
        await cmdAdd(args.slice(1), targetDir);
        break;
      default:
        console.error(`Unknown command: "${cmd}". Run "pando-skillo --help" for usage.`);
        process.exit(1);
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

main();

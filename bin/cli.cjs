#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const os = require('os');

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
  const localPath = path.resolve(__dirname, '..', 'skills-manifest.json');
  if (fs.existsSync(localPath)) {
    return JSON.parse(fs.readFileSync(localPath, 'utf8'));
  }
  const data = await fetch(raw('skills-manifest.json'));
  return JSON.parse(data);
}

async function loadSkillContent(skillId) {
  const localPath = path.resolve(__dirname, '..', 'skills', skillId, 'SKILL.md');
  if (fs.existsSync(localPath)) {
    return fs.readFileSync(localPath, 'utf8');
  }
  return fetch(raw(`skills/${skillId}/SKILL.md`));
}

function getGlobalSkillsDir() {
  return path.join(os.homedir(), '.claude', 'skills');
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
  --global       Install to ~/.claude/skills/ (available in all projects)
  --dir <path>   Target directory (default: current directory)
  --force        Overwrite existing skills
  --help, -h     Show this help

Install Scopes:
  (default)      Project-level: .claude/skills/ in current directory
  --global       User-level:    ~/.claude/skills/ (all your projects)
  PR via web     Team-level:    Deploy to any repo via the Skills Store UI

Examples:
  pando-skillo list
  pando-skillo add docx pdf xlsx
  pando-skillo add docx --global
  pando-skillo add --all --dir ./my-project
  pando-skillo add --all --global

One-liner (no install needed):
  curl -sL https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/bin/cli.cjs | node - add docx pdf
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
  console.log(`\nInstall (project):  pando-skillo add ${skill.id}`);
  console.log(`Install (global):   pando-skillo add ${skill.id} --global`);
  console.log();
}

async function cmdAdd(ids, targetDir, { global: isGlobal, force }) {
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

  const skillsDir = isGlobal ? getGlobalSkillsDir() : path.join(targetDir, '.claude', 'skills');
  const scope = isGlobal ? 'global (~/.claude/skills)' : 'project (.claude/skills)';
  console.log(`\nInstalling to ${scope}:\n`);

  let added = 0;
  let updated = 0;
  let skipped = 0;

  for (const skill of skillsToAdd) {
    const destDir = path.join(skillsDir, skill.id);
    const destFile = path.join(destDir, 'SKILL.md');

    if (fs.existsSync(destFile) && !force) {
      console.log(`  skip     ${skill.id} (already exists, use --force to overwrite)`);
      skipped++;
      continue;
    }

    const existed = fs.existsSync(destFile);
    const content = await loadSkillContent(skill.id);
    fs.mkdirSync(destDir, { recursive: true });
    fs.writeFileSync(destFile, content);
    const ver = skill.version ? ` v${skill.version}` : '';
    const relPath = isGlobal ? `~/.claude/skills/${skill.id}/SKILL.md` : `.claude/skills/${skill.id}/SKILL.md`;

    if (existed) {
      console.log(`  update   ${skill.id}${ver} -> ${relPath}`);
      updated++;
    } else {
      console.log(`  add      ${skill.id}${ver} -> ${relPath}`);
      added++;
    }
  }

  console.log(`\nDone. ${added} added, ${updated} updated, ${skipped} skipped.`);
  if (added > 0 || updated > 0) {
    if (isGlobal) {
      console.log(`Skills installed globally — available in all your Claude Code projects.`);
    } else {
      console.log(`Skills installed to ${path.relative(process.cwd(), skillsDir) || skillsDir}`);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printUsage();
    process.exit(0);
  }

  const cmd = args[0];

  // Parse flags
  let targetDir = process.cwd();
  const isGlobal = args.includes('--global');
  const force = args.includes('--force');

  // Remove known flags from args
  const cleanArgs = args.filter(a => a !== '--global' && a !== '--force');

  const dirIdx = cleanArgs.indexOf('--dir');
  if (dirIdx !== -1) {
    targetDir = path.resolve(cleanArgs[dirIdx + 1] || '.');
    cleanArgs.splice(dirIdx, 2);
  }

  if (isGlobal && dirIdx !== -1) {
    console.error('Cannot use --global and --dir together.');
    process.exit(1);
  }

  try {
    switch (cleanArgs[0]) {
      case 'list':
      case 'ls':
        await cmdList();
        break;
      case 'info':
        if (!cleanArgs[1]) { console.error('Usage: pando-skillo info <skill-id>'); process.exit(1); }
        await cmdInfo(cleanArgs[1]);
        break;
      case 'add':
      case 'install':
        if (cleanArgs.length < 2) { console.error('Usage: pando-skillo add <id> [<id> ...]'); process.exit(1); }
        await cmdAdd(cleanArgs.slice(1), targetDir, { global: isGlobal, force });
        break;
      default:
        console.error(`Unknown command: "${cleanArgs[0]}". Run "pando-skillo --help" for usage.`);
        process.exit(1);
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

main();

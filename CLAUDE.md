# Skills Store — CLAUDE.md

## What This Project Is

An internal skills marketplace for Claude Code. Team members browse skills in a web UI and deploy them to any repo via GitHub PR, adding files to `.claude/skills/` in the target project. Skills can also be installed via CLI or downloaded for claude.ai upload.

## Architecture

- **Frontend (Vite)**: Componentized React app in `src/` — React 18 + Tailwind, builds to `dist/`
- **Frontend (CDN fallback)**: `public/index.html` — standalone SPA with CDN React, no build step
- **Backend**: Netlify serverless function (`netlify/functions/github-auth.js`) — GitHub OAuth token exchange only
- **Skills**: Markdown files in `skills/<id>/SKILL.md` with YAML frontmatter
- **Components**: Reusable React/JSX files in `components/<id>/` — installed alongside companion skills
- **Registry**: `skills-manifest.json` at repo root — single source of truth for skill metadata
- **CLI**: `bin/cli.cjs` — Node.js CLI for terminal-based skill installation
- **Deployment**: Netlify static site + functions

## Key Conventions

### Skill Format
Each skill lives in `skills/<id>/SKILL.md`:
```yaml
---
name: <id>
version: "1.0.0"
description: "When to trigger and what the skill does"
---

# Skill Title

Markdown instructions for Claude...
```

### Manifest Format (`skills-manifest.json`)
```json
{
  "id": "my-skill",
  "name": "Human-Readable Name",
  "icon": "FileText",
  "category": "Documents",
  "description": "Short card description",
  "triggers": [".ext", "keyword"],
  "version": "1.0.0",
  "path": "skills/my-skill"
}
```

Available icons: `FileText`, `FileCheck`, `Presentation`, `Table`, `Bot`, `Wrench`, `Clock`, `Package`

Available categories: `Documents`, `AI & Automation`, `Developer Tools`, `UI Components`

### Skills with Components
A skill can include companion component files via the `"components"` field in the manifest:
```json
{
  "id": "ui-kit",
  "components": ["modal", "card", "tabs", "badge"]
}
```
When installed via CLI, both the SKILL.md (to `.claude/skills/`) and component files (to `components/`) are copied. The skill teaches Claude how to use the components; the components are the actual code.

### Adding a New Skill
1. Copy `skills/_template/SKILL.md` to `skills/<id>/SKILL.md`
2. Add an entry to `skills-manifest.json`
3. Run `npm run validate` to verify consistency
4. Run `npm run sync` to sync to `public/` for local dev

### Development
```bash
npm run dev          # Vite dev server
npm run dev:netlify  # Netlify dev server (with functions)
npm run build        # Sync + Vite production build
npm run validate     # Check manifest <-> skill directory consistency
npm run sync         # Copy skills + manifest to public/
```

### CLI Usage
```bash
npx pando-skillo list              # List available skills
npx pando-skillo add docx pdf      # Install to .claude/skills/
npx pando-skillo add docx --global # Install to ~/.claude/skills/
npx pando-skillo add --all         # Install all skills
```

### Skill Install Scopes
- **Project**: `.claude/skills/` in a repo (shared via git)
- **User (global)**: `~/.claude/skills/` (available in all Claude Code projects)
- **Claude.ai**: Download SKILL.md, upload to Settings > Skills
- **Team deploy**: PR via web UI to any repo

### Environment Variables (Netlify)
- `GITHUB_CLIENT_ID` — GitHub OAuth App client ID
- `GITHUB_CLIENT_SECRET` — GitHub OAuth App client secret (never in client code)

## Rules
- `skills-manifest.json` at root is the source of truth — `public/` copies are generated via `npm run sync`
- Never commit secrets or `.env` files
- Every skill must have both a manifest entry and a `SKILL.md` file
- Keep SKILL.md files self-contained — they get deployed individually to target repos
- Both `public/index.html` (CDN) and `src/` (Vite) must stay in sync for feature parity

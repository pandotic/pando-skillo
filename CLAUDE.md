# Skills Store — CLAUDE.md

## What This Project Is

An internal skills marketplace for Claude Code. Team members browse skills in a web UI and deploy them to any repo via GitHub PR, adding files to `.claude/skills/` in the target project.

## Architecture

- **Frontend**: Single-page React app (`public/index.html`) — React 18 + Tailwind via CDN, no build step
- **Backend**: Netlify serverless function (`netlify/functions/github-auth.js`) — GitHub OAuth token exchange only
- **Skills**: Markdown files in `skills/<id>/SKILL.md` with YAML frontmatter
- **Registry**: `skills-manifest.json` at repo root — single source of truth for skill metadata
- **Deployment**: Netlify static site + functions

## Key Conventions

### Skill Format
Each skill lives in `skills/<id>/SKILL.md`:
```yaml
---
name: <id>
description: "When to trigger and what the skill does"
version: "1.0.0"
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

Available categories: `Documents`, `AI & Automation`, `Developer Tools`

### Adding a New Skill
1. Create `skills/<id>/SKILL.md` with frontmatter + content
2. Add an entry to `skills-manifest.json`
3. Run `npm run validate` to verify consistency
4. Run `npm run sync` to sync to `public/` for local dev

### Development
```bash
npm run dev          # Start Netlify dev server
npm run validate     # Check manifest ↔ skill directory consistency
npm run sync         # Copy skills + manifest to public/
```

### Environment Variables (Netlify)
- `GITHUB_CLIENT_ID` — GitHub OAuth App client ID
- `GITHUB_CLIENT_SECRET` — GitHub OAuth App client secret (never in client code)

## Rules
- `skills-manifest.json` at root is the source of truth — `public/` copies are generated
- Never commit secrets or `.env` files
- Every skill must have both a manifest entry and a `SKILL.md` file
- Keep SKILL.md files self-contained — they get deployed individually to target repos

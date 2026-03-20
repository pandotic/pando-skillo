# Skills Store

One repo holds everything: the skills themselves and the web app that lets your team browse and deploy them to any project via GitHub pull request.

```
skills-store/
├── skills/                     ← your skills live here (the source of truth)
│   ├── docx/SKILL.md
│   ├── pdf/SKILL.md
│   └── ...
├── skills-manifest.json        ← registry of skills with metadata
├── public/
│   └── index.html              ← the web app (fetches skills directly from this repo)
├── netlify/
│   └── functions/
│       └── github-auth.js      ← OAuth token exchange (keeps secret server-side)
├── netlify.toml
└── package.json
```

The web app fetches `skills-manifest.json` and individual `SKILL.md` files directly from this repo via `raw.githubusercontent.com`. **Add a skill to the repo → it appears in the store immediately.**

---

## Setup

### 1. Create a GitHub OAuth App

Go to [github.com/settings/developers](https://github.com/settings/developers) → **New OAuth App**:

| Field | Value |
|---|---|
| Homepage URL | Your Netlify URL, e.g. `https://skills-store.netlify.app` |
| Authorization callback URL | Same as Homepage URL |

Copy the **Client ID** and generate a **Client Secret**.

### 2. Configure the app

Edit `public/index.html` and find the `SKILLS_CONFIG` block near the top:

```js
window.SKILLS_CONFIG = {
  repoOwner: 'pandotic',
  repoName:  'pando-skills',
  branch:    'main',
};
```

Also update the `loginWithGitHub` function in the same file:

```js
const clientId = 'your_actual_client_id_here';
```

### 3. Deploy to Netlify

```bash
npm install -g netlify-cli
netlify link                  # link to your Netlify site
netlify env:set GITHUB_CLIENT_ID     "your_client_id"
netlify env:set GITHUB_CLIENT_SECRET "your_client_secret"
netlify deploy --prod
```

Or connect the repo in the Netlify dashboard — it will auto-deploy on every push.

---

## Adding a New Skill

1. Create `skills/your-skill-name/SKILL.md` with YAML frontmatter:
   ```yaml
   ---
   name: your-skill-name
   description: "What this skill does"
   ---
   # Your Skill
   ...
   ```
2. Add an entry to `skills-manifest.json`:
   ```json
   {
     "id": "your-skill-name",
     "name": "Human Readable Name",
     "icon": "Wrench",
     "category": "Developer Tools",
     "description": "Short description shown on the card",
     "triggers": ["keyword1", "keyword2"],
     "path": "skills/your-skill-name"
   }
   ```
3. Commit and push. The store updates automatically.

**Available icons:** `FileText`, `FileCheck`, `Presentation`, `Table`, `Bot`, `Wrench`, `Clock`, `Package`

**Available categories:** `Documents`, `AI & Automation`, `Developer Tools`
(To add a new category, also add it to the `CAT_COLORS` object in `index.html`)

---

## How It Works

1. A teammate opens the Skills Store, signs in with GitHub, and browses the available skills
2. They select the ones they want and choose a target repository
3. The app fetches each `SKILL.md` directly from this repo and creates a PR on the target repo, adding the skills to `.claude/skills/`
4. The team reviews and merges — skills are live in that project

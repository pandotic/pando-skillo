import React, { useState } from 'react';
import { Icons } from './Icons';

function Section({ icon, title, subtitle, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-surface-200 rounded-xl bg-white overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-surface-50 transition-colors">
        <div className="p-2 rounded-lg bg-brand-50 text-brand-600 flex-shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-surface-900 text-base">{title}</h3>
          <p className="text-sm text-surface-500 mt-0.5">{subtitle}</p>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className={`text-surface-400 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && <div className="px-5 pb-5 border-t border-surface-100">{children}</div>}
    </div>
  );
}

function PromptBlock({ title, prompt }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(prompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <h4 className="text-sm font-semibold text-surface-800">{title}</h4>
        <button onClick={copy}
          className="inline-flex items-center gap-1 text-xs text-surface-400 hover:text-brand-600 transition-colors">
          {copied ? <><Icons.Check /> Copied</> : <><Icons.Copy /> Copy prompt</>}
        </button>
      </div>
      <pre className="bg-surface-50 border border-surface-200 rounded-lg p-3 text-xs font-mono text-surface-700 whitespace-pre-wrap leading-relaxed cursor-pointer hover:border-brand-300 transition-colors" onClick={copy}>{prompt}</pre>
    </div>
  );
}

function Step({ number, title, children }) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center mt-0.5">{number}</div>
      <div>
        <p className="text-sm font-medium text-surface-800">{title}</p>
        <div className="text-sm text-surface-600 mt-0.5 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

export default function GuideSections() {
  return (
    <div className="mt-10 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-px flex-1 bg-surface-200" />
        <span className="text-xs font-medium text-surface-400 uppercase tracking-wider">Getting Started</span>
        <div className="h-px flex-1 bg-surface-200" />
      </div>

      {/* HOW TO USE */}
      <Section
        icon={<Icons.Download />}
        title="How to Use Skills & Components"
        subtitle="Grab what you need for your project in seconds"
        defaultOpen={true}
      >
        <div className="pt-4 space-y-5">
          <p className="text-sm text-surface-600 leading-relaxed">
            Skills teach Claude <em>how</em> to do things — generate docs, handle file formats, follow conventions. Components give Claude <em>actual code</em> to use — pre-built UI pieces that keep everything consistent. Pick what you need, install it, and Claude handles the rest.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-surface-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-blue-50 text-blue-500"><Icons.Terminal /></div>
                <h4 className="text-sm font-semibold text-surface-800">Fastest: CLI</h4>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-surface-500 mb-1">Add to current project:</p>
                  <code className="text-xs font-mono bg-surface-100 text-surface-800 px-2 py-1 rounded block">npx pando-skillo add docx pdf</code>
                </div>
                <div>
                  <p className="text-xs text-surface-500 mb-1">Add everywhere (all projects):</p>
                  <code className="text-xs font-mono bg-surface-100 text-surface-800 px-2 py-1 rounded block">npx pando-skillo add docx --global</code>
                </div>
                <div>
                  <p className="text-xs text-surface-500 mb-1">Install everything at once:</p>
                  <code className="text-xs font-mono bg-surface-100 text-surface-800 px-2 py-1 rounded block">npx pando-skillo add --all</code>
                </div>
              </div>
            </div>

            <div className="bg-surface-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-purple-50 text-purple-500"><Icons.Globe /></div>
                <h4 className="text-sm font-semibold text-surface-800">Other Ways</h4>
              </div>
              <div className="space-y-2.5">
                <div className="flex gap-2 items-start">
                  <span className="text-xs text-brand-600 font-bold mt-0.5">PR</span>
                  <p className="text-xs text-surface-600">Select skills above, sign in with GitHub, and deploy to any repo via pull request.</p>
                </div>
                <div className="flex gap-2 items-start">
                  <span className="text-xs text-brand-600 font-bold mt-0.5">DL</span>
                  <p className="text-xs text-surface-600">Click any skill card, download SKILL.md, and drop it into <code className="bg-surface-100 px-1 rounded text-[10px]">.claude/skills/</code> or upload to claude.ai.</p>
                </div>
                <div className="flex gap-2 items-start">
                  <span className="text-xs text-brand-600 font-bold mt-0.5">curl</span>
                  <p className="text-xs text-surface-600">One-liner from any terminal — no install needed. Click a skill card for the copy-paste command.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-brand-50 rounded-lg p-4">
            <p className="text-sm font-medium text-brand-800 mb-1">Skills + Components work together</p>
            <p className="text-xs text-brand-700 leading-relaxed">
              When you install a skill that has companion components (like the UI Kit), both get installed automatically.
              The skill teaches Claude your design conventions; the components give it ready-to-use code.
              Ask Claude to "build a settings page" and it'll assemble one from your component library — consistent every time.
            </p>
          </div>
        </div>
      </Section>

      {/* HOW TO SHARE */}
      <Section
        icon={<Icons.Package />}
        title="How to Share Skills & Components"
        subtitle="Add your own to the library so the whole team benefits"
      >
        <div className="pt-4 space-y-5">
          <p className="text-sm text-surface-600 leading-relaxed">
            Built something useful with Claude? Turn it into a skill so everyone can reuse it.
            Skills are just Markdown files with a bit of YAML frontmatter — nothing to compile, no dependencies.
            Components are the same idea for code: drop in a React file and it's instantly available to the team.
          </p>

          <div>
            <h4 className="text-sm font-semibold text-surface-800 mb-3">Add a Skill</h4>
            <div className="space-y-3.5">
              <Step number="1" title="Create the skill file">
                Copy <code className="text-xs bg-surface-100 px-1 rounded">skills/_template/SKILL.md</code> to <code className="text-xs bg-surface-100 px-1 rounded">skills/your-skill/SKILL.md</code>. Write what Claude should do — the more specific, the better.
              </Step>
              <Step number="2" title="Register it in the manifest">
                Add an entry to <code className="text-xs bg-surface-100 px-1 rounded">skills-manifest.json</code> with name, description, category, icon, and trigger keywords. This is what shows up on this page.
              </Step>
              <Step number="3" title="Validate and push">
                Run <code className="text-xs bg-surface-100 px-1 rounded">npm run validate</code> to check everything lines up, then open a PR. Once merged, it's live here instantly.
              </Step>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-surface-800 mb-3">Add a Component</h4>
            <div className="space-y-3.5">
              <Step number="1" title="Create the component directory">
                Add your file(s) to <code className="text-xs bg-surface-100 px-1 rounded">components/your-component/</code> — React + Tailwind, self-contained, no external deps.
              </Step>
              <Step number="2" title="Link it to a skill">
                Add the component ID to the <code className="text-xs bg-surface-100 px-1 rounded">"components"</code> array on the parent skill in the manifest. The skill teaches Claude <em>when</em> to use it; the component is the actual code.
              </Step>
              <Step number="3" title="Document usage in the skill">
                Update the skill's SKILL.md with the component's props and example usage so Claude knows how to wire it in.
              </Step>
            </div>
          </div>

          <div className="bg-surface-50 rounded-lg p-4">
            <p className="text-sm font-medium text-surface-800 mb-2">What makes a good skill?</p>
            <ul className="space-y-1.5">
              <li className="text-xs text-surface-600 flex gap-2"><span className="text-green-500 flex-shrink-0">&#10003;</span> Solves a specific, repeatable problem (not a vague "be helpful" prompt)</li>
              <li className="text-xs text-surface-600 flex gap-2"><span className="text-green-500 flex-shrink-0">&#10003;</span> Self-contained — works without needing other files or context</li>
              <li className="text-xs text-surface-600 flex gap-2"><span className="text-green-500 flex-shrink-0">&#10003;</span> Includes concrete examples of what the output should look like</li>
              <li className="text-xs text-surface-600 flex gap-2"><span className="text-green-500 flex-shrink-0">&#10003;</span> Has clear trigger keywords so Claude knows when to activate it</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* PROMPT BUILDER */}
      <Section
        icon={<Icons.Wrench />}
        title="Prompt Builder"
        subtitle="Copy a prompt, paste into Claude, get a ready-to-share skill"
      >
        <div className="pt-4 space-y-5">
          <p className="text-sm text-surface-600 leading-relaxed">
            You don't have to write skills by hand. Paste one of these prompts into Claude Code (or claude.ai) and it'll generate a properly formatted skill you can use immediately or contribute to the library. Just fill in the <code className="text-xs bg-surface-100 px-1 rounded">[brackets]</code>.
          </p>

          <PromptBlock
            title="Build a skill from a description"
            prompt={`I want to create a Claude Code skill that [describe what it does — e.g. "generates API documentation from code comments"].

It should trigger when: [list trigger conditions — e.g. "the user mentions API docs, swagger, or openapi"]
Category: [Documents / AI & Automation / Developer Tools / UI Components]

Generate a complete SKILL.md file with:
1. YAML frontmatter (name, version "1.0.0", description)
2. When to Use section with trigger conditions and exclusions
3. How It Works with numbered steps
4. At least 2 concrete examples showing user prompts and expected Claude behavior
5. Rules section with important constraints

Save it to .claude/skills/[skill-id]/SKILL.md`}
          />

          <PromptBlock
            title="Turn what I just did into a skill"
            prompt={`Look at what we just built together in this conversation. Turn it into a reusable Claude Code skill that someone else could install and get the same results.

Create a SKILL.md file with:
- YAML frontmatter (name, version "1.0.0", description with trigger keywords)
- When to Use section — what should trigger this skill
- How It Works — the step-by-step process we followed
- Examples — based on what we actually did
- Rules — constraints and things to avoid

Save it to .claude/skills/[good-short-name]/SKILL.md`}
          />

          <PromptBlock
            title="Build a reusable component + skill pair"
            prompt={`I want to create a reusable React + Tailwind component for [describe it — e.g. "a settings panel with grouped form sections"].

Build two things:
1. A self-contained component file (components/[name]/[Name].jsx) — no external deps beyond React + Tailwind, well-defined props interface
2. A companion SKILL.md that teaches Claude when to use this component, all props with types, multiple usage examples, and styling conventions

The skill should show Claude how to import, compose, and customize the component in real pages.`}
          />

          <PromptBlock
            title="Create a skill and add it to the library"
            prompt={`I want to create and contribute a skill to our team skill library at pandotic/pando-skillo.

The skill: [describe what it does]

Please:
1. Create skills/[skill-id]/SKILL.md with full YAML frontmatter and detailed instructions
2. Add the matching entry to skills-manifest.json with id, name, icon, category, description, triggers, version, author (use my GitHub username), and path
3. Run npm run validate to make sure everything is consistent
4. Commit with a descriptive message

Available icons: FileText, FileCheck, Presentation, Table, Bot, Wrench, Clock, Package
Available categories: Documents, AI & Automation, Developer Tools, UI Components`}
          />

          <div className="bg-surface-50 rounded-lg p-4">
            <p className="text-sm font-medium text-surface-800 mb-1">Tip: Use these from any project</p>
            <p className="text-xs text-surface-600 leading-relaxed">
              These prompts work in Claude Code, claude.ai, or any Claude-powered tool. The generated SKILL.md is a standalone file — just drop it into <code className="bg-surface-100 px-1 rounded">.claude/skills/</code> in any project and Claude picks it up automatically.
            </p>
          </div>
        </div>
      </Section>

      {/* WHAT THIS COULD BECOME */}
      <Section
        icon={<Icons.Globe />}
        title="Where This Is Going"
        subtitle="Internal tool today, open marketplace tomorrow?"
      >
        <div className="pt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="border border-surface-200 rounded-lg p-3.5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <p className="text-xs font-semibold text-surface-800 uppercase tracking-wide">Now</p>
              </div>
              <p className="text-sm font-medium text-surface-800">Internal Library</p>
              <p className="text-xs text-surface-500 mt-1 leading-relaxed">
                A shared place for the team to browse, install, and contribute skills and components. Everything lives in one repo and deploys to a single Netlify site.
              </p>
            </div>
            <div className="border border-surface-200 rounded-lg p-3.5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <p className="text-xs font-semibold text-surface-800 uppercase tracking-wide">Next</p>
              </div>
              <p className="text-sm font-medium text-surface-800">Multi-Team Sharing</p>
              <p className="text-xs text-surface-500 mt-1 leading-relaxed">
                Multiple teams publish skills to their own repos. The store aggregates from multiple manifests — a federated skill network across the org.
              </p>
            </div>
            <div className="border border-surface-200 rounded-lg p-3.5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-brand-400" />
                <p className="text-xs font-semibold text-surface-800 uppercase tracking-wide">Later</p>
              </div>
              <p className="text-sm font-medium text-surface-800">Open Marketplace</p>
              <p className="text-xs text-surface-500 mt-1 leading-relaxed">
                A public registry where anyone can publish and discover skills — like npm for AI workflows. Versioning, ratings, usage analytics, and one-click install.
              </p>
            </div>
          </div>
          <p className="text-xs text-surface-500 leading-relaxed">
            The format is already compatible with the emerging <strong>Agent Skills</strong> open standard. As the ecosystem matures, skills built here will work across platforms — Claude Code, claude.ai, and beyond. Building a library now means your team is already ahead.
          </p>
        </div>
      </Section>
    </div>
  );
}

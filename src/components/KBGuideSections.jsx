import React, { useState } from 'react';
import { Icons } from './Icons';

function Section({ icon, title, subtitle, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-surface-200 rounded-xl bg-white overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-surface-50 transition-colors">
        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 flex-shrink-0">{icon}</div>
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
          className="inline-flex items-center gap-1 text-xs text-surface-400 hover:text-emerald-600 transition-colors">
          {copied ? <><Icons.Check /> Copied</> : <><Icons.Copy /> Copy prompt</>}
        </button>
      </div>
      <pre className="bg-surface-50 border border-surface-200 rounded-lg p-3 text-xs font-mono text-surface-700 whitespace-pre-wrap leading-relaxed cursor-pointer hover:border-emerald-300 transition-colors" onClick={copy}>{prompt}</pre>
    </div>
  );
}

function Step({ number, title, children }) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center mt-0.5">{number}</div>
      <div>
        <p className="text-sm font-medium text-surface-800">{title}</p>
        <div className="text-sm text-surface-600 mt-0.5 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

export default function KBGuideSections() {
  return (
    <div className="mt-10 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-px flex-1 bg-surface-200" />
        <span className="text-xs font-medium text-surface-400 uppercase tracking-wider">Knowledgebase Guide</span>
        <div className="h-px flex-1 bg-surface-200" />
      </div>

      {/* WHAT ARE KNOWLEDGEBASES */}
      <Section
        icon={<Icons.BookOpen />}
        title="What Are Knowledgebases?"
        subtitle="Domain-expert files that turn any AI chatbot into a specialist"
        defaultOpen={true}
      >
        <div className="pt-4 space-y-5">
          <p className="text-sm text-surface-600 leading-relaxed">
            A knowledgebase is a structured Markdown file containing deep domain expertise — technical specifications, procedures, codes, Q&A, terminology, and safety considerations.
            When installed, it gives an AI chatbot (Claude Code, claude.ai, or any LLM) the knowledge to act as a reliable expert in that domain.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-surface-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-emerald-50 text-emerald-500"><Icons.BookOpen /></div>
                <h4 className="text-sm font-semibold text-surface-800">What's Inside a KB</h4>
              </div>
              <ul className="space-y-1.5 text-xs text-surface-600">
                <li className="flex gap-2"><span className="text-emerald-500 flex-shrink-0">&#8226;</span> <strong>Domain Scope</strong> — clear boundaries of what it covers and doesn't</li>
                <li className="flex gap-2"><span className="text-emerald-500 flex-shrink-0">&#8226;</span> <strong>Core Knowledge</strong> — technical content organized by topic</li>
                <li className="flex gap-2"><span className="text-emerald-500 flex-shrink-0">&#8226;</span> <strong>Q&A</strong> — real questions from the field with expert answers</li>
                <li className="flex gap-2"><span className="text-emerald-500 flex-shrink-0">&#8226;</span> <strong>Standards</strong> — applicable codes and regulations</li>
                <li className="flex gap-2"><span className="text-emerald-500 flex-shrink-0">&#8226;</span> <strong>Terminology</strong> — definitions of domain-specific terms</li>
                <li className="flex gap-2"><span className="text-emerald-500 flex-shrink-0">&#8226;</span> <strong>Safety</strong> — hazards, PPE, licensing requirements</li>
              </ul>
            </div>

            <div className="bg-surface-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-emerald-50 text-emerald-500"><Icons.Shield /></div>
                <h4 className="text-sm font-semibold text-surface-800">Built-in Guardrails</h4>
              </div>
              <p className="text-xs text-surface-600 leading-relaxed">
                Every knowledgebase automatically gets universal guardrails prepended at install time. You don't need to add safety rules to your KB — they're baked in. Guardrails prevent:
              </p>
              <ul className="space-y-1 text-xs text-surface-600">
                <li className="flex gap-2"><span className="text-emerald-500 flex-shrink-0">&#10003;</span> Hallucination — must cite sources, say "I don't know"</li>
                <li className="flex gap-2"><span className="text-emerald-500 flex-shrink-0">&#10003;</span> Prompt injection — ignores override attempts</li>
                <li className="flex gap-2"><span className="text-emerald-500 flex-shrink-0">&#10003;</span> Out-of-domain answers — stays within stated scope</li>
                <li className="flex gap-2"><span className="text-emerald-500 flex-shrink-0">&#10003;</span> Unsafe advice — recommends licensed professionals</li>
              </ul>
            </div>
          </div>

          <div className="bg-emerald-50 rounded-lg p-4">
            <p className="text-sm font-medium text-emerald-800 mb-1">Works with any domain</p>
            <p className="text-xs text-emerald-700 leading-relaxed">
              Knowledgebases aren't limited to construction trades. The same format works for any domain — software architecture, medical devices, food safety, project management, regulatory compliance, or anything else where you need a reliable AI expert.
              The guardrails adapt automatically because each KB defines its own scope boundaries.
            </p>
          </div>
        </div>
      </Section>

      {/* HOW TO INSTALL */}
      <Section
        icon={<Icons.Download />}
        title="How to Install Knowledgebases"
        subtitle="Add domain expertise to any project in seconds"
      >
        <div className="pt-4 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-surface-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-emerald-50 text-emerald-500"><Icons.Terminal /></div>
                <h4 className="text-sm font-semibold text-surface-800">CLI (with guardrails)</h4>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-surface-500 mb-1">Add to current project:</p>
                  <code className="text-xs font-mono bg-surface-100 text-surface-800 px-2 py-1 rounded block">npx pando-skillo kb add hvac-installation</code>
                </div>
                <div>
                  <p className="text-xs text-surface-500 mb-1">Add everywhere:</p>
                  <code className="text-xs font-mono bg-surface-100 text-surface-800 px-2 py-1 rounded block">npx pando-skillo kb add --all --global</code>
                </div>
              </div>
            </div>

            <div className="bg-surface-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-emerald-50 text-emerald-500"><Icons.Globe /></div>
                <h4 className="text-sm font-semibold text-surface-800">Other Ways</h4>
              </div>
              <div className="space-y-2.5">
                <div className="flex gap-2 items-start">
                  <span className="text-xs text-emerald-600 font-bold mt-0.5">PR</span>
                  <p className="text-xs text-surface-600">Select KBs above, sign in with GitHub, and deploy to any repo via pull request. Guardrails are included.</p>
                </div>
                <div className="flex gap-2 items-start">
                  <span className="text-xs text-emerald-600 font-bold mt-0.5">DL</span>
                  <p className="text-xs text-surface-600">Download the KB.md file and place it in <code className="bg-surface-100 px-1 rounded text-[10px]">.claude/skills/</code> or upload to claude.ai.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface-50 rounded-lg p-4">
            <p className="text-sm font-medium text-surface-800 mb-1">Where do knowledgebases go?</p>
            <p className="text-xs text-surface-600 leading-relaxed">
              Knowledgebases install to <code className="bg-surface-100 px-1 rounded">.claude/skills/</code> as SKILL.md files (same location as skills) so Claude Code auto-detects them.
              The CLI and PR deploy methods automatically prepend guardrails. If you download manually, you get the raw KB content without guardrails.
            </p>
          </div>
        </div>
      </Section>

      {/* HOW TO CREATE */}
      <Section
        icon={<Icons.Wrench />}
        title="How to Create & Share Knowledgebases"
        subtitle="Compile your domain expertise into a shareable KB"
      >
        <div className="pt-4 space-y-5">
          <p className="text-sm text-surface-600 leading-relaxed">
            Anyone can create a knowledgebase — you just need domain expertise and a structured format.
            You can write one by hand, use Claude to compile it from reference documents, or use the prompts below to generate one interactively.
          </p>

          <div>
            <h4 className="text-sm font-semibold text-surface-800 mb-3">Add a Knowledgebase to the Library</h4>
            <div className="space-y-3.5">
              <Step number="1" title="Create the KB file">
                Copy <code className="text-xs bg-surface-100 px-1 rounded">knowledgebases/_template/KB.md</code> to <code className="text-xs bg-surface-100 px-1 rounded">knowledgebases/your-kb/KB.md</code>.
                Fill in the YAML frontmatter (name, version, domain, description) and write the domain content. Include core knowledge, Q&A, standards, terminology, and safety sections.
              </Step>
              <Step number="2" title="Register it in the manifest">
                Add an entry to <code className="text-xs bg-surface-100 px-1 rounded">knowledgebases-manifest.json</code> with id, name, icon, category, domain, description, triggers, version, author, path, and <code className="text-xs bg-surface-100 px-1 rounded">type: "knowledgebase"</code>.
              </Step>
              <Step number="3" title="Validate and push">
                Run <code className="text-xs bg-surface-100 px-1 rounded">npm run validate</code> to check everything lines up, then open a PR. Once merged, it's live here with guardrails automatically applied at install time.
              </Step>
            </div>
          </div>

          <PromptBlock
            title="Compile a knowledgebase from your expertise"
            prompt={`I want to create a domain expert knowledgebase for [describe the domain — e.g. "residential plumbing systems"].

This knowledgebase should make an AI chatbot into a reliable expert in this field. It will be used by [describe who — e.g. "estimators and project managers reviewing bids"].

The KB should cover:
- [Topic area 1]
- [Topic area 2]
- [Topic area 3]

The KB should NOT cover:
- [Exclusion 1]
- [Exclusion 2]

Generate a complete KB.md file with:
1. YAML frontmatter: name, version "1.0.0", domain, description (include what it covers AND excludes)
2. Domain Scope section — clear boundaries
3. Core Knowledge — organized by topic with specifications, codes, and best practices
4. Common Questions & Answers — at least 5 real-world Q&As with expert answers
5. Standards & References — applicable codes, standards, manufacturer guidelines
6. Terminology table — key terms with clear definitions
7. Safety Considerations — hazards, PPE, licensing requirements

Save it to knowledgebases/[kb-id]/KB.md`}
          />

          <PromptBlock
            title="Build a KB from reference documents"
            prompt={`I have reference documents about [domain]. I want to compile them into a structured knowledgebase that an AI chatbot can use to answer expert questions.

Here are my source materials:
[Paste or describe your reference docs, manuals, specs, training materials, or notes]

Please compile this into a KB.md file with:
1. YAML frontmatter: name, version "1.0.0", domain, description
2. Domain Scope — what this KB covers and what it doesn't
3. Core Knowledge — restructure the content into clear topic sections
4. Common Questions & Answers — extract or infer the most likely field questions
5. Standards & References — list any codes, standards, or specs mentioned
6. Terminology — define all technical terms used
7. Safety Considerations — extract any safety-related content

Important: Only include information from the provided source materials.

Save it to knowledgebases/[kb-id]/KB.md`}
          />

          <PromptBlock
            title="Create and register a KB in one shot"
            prompt={`I want to create and contribute a knowledgebase to our shared library at pandotic/pando-skillo.

Domain: [describe the domain — e.g. "residential electrical systems"]

Please:
1. Create knowledgebases/[kb-id]/KB.md with full YAML frontmatter and comprehensive domain content
2. Add the matching entry to knowledgebases-manifest.json with id, name, icon, category, domain, description, triggers, version, author (use my GitHub username), path, and type: "knowledgebase"
3. Run npm run validate to make sure everything is consistent
4. Commit with a descriptive message

Available icons: Thermometer, Zap, Droplets, Shield, BookOpen
Available categories: Mechanical, Electrical, Plumbing, General`}
          />

          <div className="bg-surface-50 rounded-lg p-4">
            <p className="text-sm font-medium text-surface-800 mb-2">What makes a good knowledgebase?</p>
            <ul className="space-y-1.5">
              <li className="text-xs text-surface-600 flex gap-2"><span className="text-emerald-500 flex-shrink-0">&#10003;</span> Clear scope boundaries — what it covers AND what it explicitly excludes</li>
              <li className="text-xs text-surface-600 flex gap-2"><span className="text-emerald-500 flex-shrink-0">&#10003;</span> Grounded in real standards, codes, and specifications (not generic advice)</li>
              <li className="text-xs text-surface-600 flex gap-2"><span className="text-emerald-500 flex-shrink-0">&#10003;</span> Real-world Q&A that reflects actual questions from the field</li>
              <li className="text-xs text-surface-600 flex gap-2"><span className="text-emerald-500 flex-shrink-0">&#10003;</span> Specific numerical values — don't leave room for the AI to guess</li>
              <li className="text-xs text-surface-600 flex gap-2"><span className="text-emerald-500 flex-shrink-0">&#10003;</span> Safety-first — always flags when licensed professionals are needed</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* KB FORMAT REFERENCE */}
      <Section
        icon={<Icons.FileText />}
        title="Knowledgebase Format Reference"
        subtitle="The technical structure of a KB.md file"
      >
        <div className="pt-4 space-y-4">
          <p className="text-sm text-surface-600 leading-relaxed">
            Every knowledgebase is a standalone Markdown file with YAML frontmatter. The format is universal — it works for any domain, any team, any AI tool.
          </p>

          <div>
            <h4 className="text-sm font-semibold text-surface-800 mb-2">File structure</h4>
            <pre className="bg-surface-50 border border-surface-200 rounded-lg p-3 text-xs font-mono text-surface-700 whitespace-pre-wrap leading-relaxed">{`knowledgebases/
  _guardrails/
    GUARDRAILS.md          # Universal safety rules (auto-prepended)
  _template/
    KB.md                  # Empty template for new KBs
  hvac-installation/
    KB.md                  # Domain expert content
  your-new-kb/
    KB.md                  # Your KB goes here
knowledgebases-manifest.json  # Registry of all KBs`}</pre>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-surface-800 mb-2">KB.md format</h4>
            <pre className="bg-surface-50 border border-surface-200 rounded-lg p-3 text-xs font-mono text-surface-700 whitespace-pre-wrap leading-relaxed">{`---
name: my-knowledgebase
version: "1.0.0"
domain: "The Domain This Covers"
description: "A domain expert in X. Covers Y. Does NOT cover Z."
---

# [Domain] Expert Knowledgebase

## Domain Scope
What this covers / what it doesn't

## Core Knowledge
### Topic Area 1
Detailed content...

## Common Questions & Answers
### Q: Real question from the field
**A:** Expert answer with references

## Standards & References
- Code/Standard — description

## Terminology
| Term | Definition |
|------|-----------|

## Safety Considerations
- Critical safety info`}</pre>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-surface-800 mb-2">Manifest entry</h4>
            <pre className="bg-surface-50 border border-surface-200 rounded-lg p-3 text-xs font-mono text-surface-700 whitespace-pre-wrap leading-relaxed">{`{
  "id": "your-kb-id",
  "name": "Human-Readable Name",
  "icon": "Thermometer",
  "category": "Mechanical",
  "domain": "The Domain This Covers",
  "description": "Short card description",
  "triggers": ["keyword1", "keyword2"],
  "version": "1.0.0",
  "author": "github-username",
  "path": "knowledgebases/your-kb-id",
  "type": "knowledgebase"
}`}</pre>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-surface-800 mb-1.5">Available icons</p>
              <p className="text-xs text-surface-600">Thermometer, Zap, Droplets, Shield, BookOpen</p>
            </div>
            <div className="bg-surface-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-surface-800 mb-1.5">Available categories</p>
              <p className="text-xs text-surface-600">Mechanical, Electrical, Plumbing, General</p>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

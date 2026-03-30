import React, { useState, useEffect } from 'react';
import { Icons, getIcon, CAT_COLORS, defaultColors } from './Icons';
import { RAW } from '../config';

function CopyButton({ text, label, copied, onCopy }) {
  return (
    <button onClick={() => onCopy(text, label)}
      className="flex-shrink-0 text-surface-400 hover:text-brand-600 transition-colors p-1" title="Copy">
      {copied === label ? <Icons.Check /> : <Icons.Copy />}
    </button>
  );
}

export default function SkillDetailModal({ skill, onClose, onToggle, selected }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('preview');
  const [copied, setCopied] = useState(null);
  const c = CAT_COLORS[skill.category] || defaultColors;

  useEffect(() => {
    fetch(RAW(`skills/${skill.id}/SKILL.md`))
      .then(r => r.ok ? r.text() : null)
      .then(text => { setContent(text); setLoading(false); })
      .catch(() => setLoading(false));
  }, [skill.id]);

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const downloadFile = () => {
    if (!content) return;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${skill.id}-SKILL.md`; a.click();
    URL.revokeObjectURL(url);
  };

  const curlCmd = `curl -sL "${RAW(`skills/${skill.id}/SKILL.md`)}" -o .claude/skills/${skill.id}/SKILL.md --create-dirs`;
  const cliProject = `npx pando-skillo add ${skill.id}`;
  const cliGlobal = `npx pando-skillo add ${skill.id} --global`;

  const renderMarkdown = (md) => {
    if (!md) return null;
    const body = md.replace(/^---[\s\S]*?---\n*/, '');
    const lines = body.split('\n');
    const html = [];
    let inCode = false;
    let codeBlock = [];
    for (const line of lines) {
      if (line.startsWith('```')) {
        if (inCode) {
          html.push(<pre key={html.length} className="bg-surface-100 rounded-lg p-3 text-xs font-mono overflow-x-auto my-2 whitespace-pre-wrap">{codeBlock.join('\n')}</pre>);
          codeBlock = [];
        }
        inCode = !inCode;
        continue;
      }
      if (inCode) { codeBlock.push(line); continue; }
      if (line.startsWith('### '))
        html.push(<h4 key={html.length} className="font-semibold text-surface-800 mt-4 mb-1 text-sm">{line.slice(4)}</h4>);
      else if (line.startsWith('## '))
        html.push(<h3 key={html.length} className="font-semibold text-surface-900 mt-5 mb-2 text-base border-b border-surface-100 pb-1">{line.slice(3)}</h3>);
      else if (line.startsWith('# '))
        html.push(<h2 key={html.length} className="font-bold text-surface-900 mt-4 mb-2 text-lg">{line.slice(2)}</h2>);
      else if (line.startsWith('- ') || line.startsWith('* '))
        html.push(<li key={html.length} className="text-sm text-surface-700 ml-4 list-disc">{line.slice(2)}</li>);
      else if (/^\d+\.\s/.test(line))
        html.push(<li key={html.length} className="text-sm text-surface-700 ml-4 list-decimal">{line.replace(/^\d+\.\s/, '')}</li>);
      else if (line.trim() === '')
        html.push(<div key={html.length} className="h-2" />);
      else
        html.push(<p key={html.length} className="text-sm text-surface-700 leading-relaxed">{line}</p>);
    }
    return html;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col fade-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-surface-100">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${c.bg} ${c.icon}`}>{getIcon(skill.icon)}</div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg text-surface-900">{skill.name}</h3>
                {skill.version && <span className="text-[10px] font-mono text-surface-400 bg-surface-100 px-1.5 py-0.5 rounded">v{skill.version}</span>}
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>{skill.category}</span>
                {skill.author && (
                  <span className="flex items-center gap-1 text-xs text-surface-400">
                    <img src={`https://github.com/${skill.author}.png?size=32`} alt="" className="w-3.5 h-3.5 rounded-full" />
                    <a href={`https://github.com/${skill.author}`} target="_blank" rel="noopener noreferrer" className="hover:text-brand-600">{skill.author}</a>
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onToggle(skill.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selected ? 'bg-brand-600 text-white hover:bg-brand-700' : 'bg-surface-100 text-surface-700 hover:bg-surface-200'}`}>
              {selected ? '\u2713 Selected' : 'Select'}
            </button>
            <button onClick={onClose} className="text-surface-500 hover:text-surface-900 p-1"><Icons.X /></button>
          </div>
        </div>

        <div className="flex border-b border-surface-100 px-5">
          {[['preview', 'Preview'], ['install', 'Install & Share'], ['create', 'Create Your Own']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === key ? 'border-brand-600 text-brand-700' : 'border-transparent text-surface-500 hover:text-surface-700'}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1 p-5">
          {tab === 'preview' && (
            <>
              <p className="text-sm text-surface-600 mb-3">{skill.description}</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {skill.triggers.map(t => (
                  <span key={t} className="text-xs bg-surface-100 text-surface-600 px-2 py-0.5 rounded font-mono">{t}</span>
                ))}
              </div>
              {loading
                ? <div className="flex items-center justify-center py-10 text-surface-400"><Icons.Loader /><span className="ml-2 text-sm">Loading skill content...</span></div>
                : content
                  ? <div>{renderMarkdown(content)}</div>
                  : <p className="text-sm text-surface-500 text-center py-10">Could not load skill content.</p>
              }
            </>
          )}

          {tab === 'install' && (
            <div className="space-y-5">
              <div>
                <h4 className="font-semibold text-surface-900 text-sm mb-2 flex items-center gap-2"><Icons.Download /> Download</h4>
                <p className="text-xs text-surface-500 mb-2">Download the SKILL.md file, then place it in your project or upload to claude.ai.</p>
                <button onClick={downloadFile} disabled={!content}
                  className="inline-flex items-center gap-2 bg-surface-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-surface-800 disabled:opacity-40 transition-colors">
                  <Icons.Download /> Download SKILL.md
                </button>
              </div>

              <div>
                <h4 className="font-semibold text-surface-900 text-sm mb-2 flex items-center gap-2"><Icons.Terminal /> CLI Install</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-surface-500 mb-1">Project-level (this repo only):</p>
                    <div className="flex items-center gap-2 bg-surface-50 border border-surface-200 rounded-lg px-3 py-2">
                      <code className="text-xs font-mono text-surface-800 flex-1 overflow-x-auto">{cliProject}</code>
                      <CopyButton text={cliProject} label="cli-project" copied={copied} onCopy={copyToClipboard} />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-surface-500 mb-1">Global (all your projects):</p>
                    <div className="flex items-center gap-2 bg-surface-50 border border-surface-200 rounded-lg px-3 py-2">
                      <code className="text-xs font-mono text-surface-800 flex-1 overflow-x-auto">{cliGlobal}</code>
                      <CopyButton text={cliGlobal} label="cli-global" copied={copied} onCopy={copyToClipboard} />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-surface-900 text-sm mb-2 flex items-center gap-2"><Icons.Globe /> One-liner (curl)</h4>
                <p className="text-xs text-surface-500 mb-1">No install needed - run from your project root:</p>
                <div className="flex items-start gap-2 bg-surface-50 border border-surface-200 rounded-lg px-3 py-2">
                  <code className="text-xs font-mono text-surface-800 flex-1 break-all">{curlCmd}</code>
                  <CopyButton text={curlCmd} label="curl" copied={copied} onCopy={copyToClipboard} />
                </div>
              </div>

              <div className="border-t border-surface-100 pt-5">
                <h4 className="font-semibold text-surface-900 text-sm mb-3">Where Skills Can Live</h4>
                <div className="space-y-3">
                  <div className="flex gap-3 items-start">
                    <div className="p-1.5 rounded-lg bg-blue-50 text-blue-500 flex-shrink-0 mt-0.5"><Icons.Package /></div>
                    <div>
                      <p className="text-sm font-medium text-surface-800">Project-level <code className="text-xs bg-surface-100 px-1 rounded">.claude/skills/</code></p>
                      <p className="text-xs text-surface-500">Lives in the repo. Shared via git. Best for project-specific skills.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="p-1.5 rounded-lg bg-purple-50 text-purple-500 flex-shrink-0 mt-0.5"><Icons.Home /></div>
                    <div>
                      <p className="text-sm font-medium text-surface-800">User-level <code className="text-xs bg-surface-100 px-1 rounded">~/.claude/skills/</code></p>
                      <p className="text-xs text-surface-500">On your machine. Available in all your Claude Code projects. Use <code className="bg-surface-100 px-1 rounded text-[10px]">--global</code> flag.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="p-1.5 rounded-lg bg-amber-50 text-amber-500 flex-shrink-0 mt-0.5"><Icons.Globe /></div>
                    <div>
                      <p className="text-sm font-medium text-surface-800">Claude.ai (Web Chat)</p>
                      <p className="text-xs text-surface-500">Download the SKILL.md, then go to claude.ai &gt; Settings &gt; Skills and upload. Works in browser conversations.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="p-1.5 rounded-lg bg-green-50 text-green-500 flex-shrink-0 mt-0.5"><Icons.GitPR /></div>
                    <div>
                      <p className="text-sm font-medium text-surface-800">Team Deploy (via PR)</p>
                      <p className="text-xs text-surface-500">Select skills in this store and create a PR to add them to any team repo.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'create' && (
            <div className="space-y-5">
              <p className="text-sm text-surface-600 leading-relaxed">
                Want to build something like <strong>{skill.name}</strong>? Copy one of these prompts into Claude Code (or claude.ai) from any project. Claude will generate a properly formatted skill you can contribute back to the library.
              </p>

              <div>
                <h4 className="font-semibold text-surface-900 text-sm mb-2">Create a similar skill</h4>
                <p className="text-xs text-surface-500 mb-2">Paste this into Claude Code to generate a new skill inspired by this one:</p>
                <div className="relative">
                  <pre className="bg-surface-50 border border-surface-200 rounded-lg p-3 text-xs font-mono text-surface-800 whitespace-pre-wrap leading-relaxed">{`Create a new Claude Code skill similar to "${skill.name}" but for [describe your use case].

The skill should follow this format:
- YAML frontmatter with name, version, description
- Clear "When to Use" section with trigger conditions
- Step-by-step "How It Works" instructions
- Concrete examples with sample user prompts and expected behavior
- Rules section with constraints

Save the output as a single SKILL.md file.`}</pre>
                  <CopyButton
                    text={`Create a new Claude Code skill similar to "${skill.name}" but for [describe your use case].\n\nThe skill should follow this format:\n- YAML frontmatter with name, version, description\n- Clear "When to Use" section with trigger conditions\n- Step-by-step "How It Works" instructions\n- Concrete examples with sample user prompts and expected behavior\n- Rules section with constraints\n\nSave the output as a single SKILL.md file.`}
                    label="prompt-similar" copied={copied} onCopy={copyToClipboard} />
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-surface-900 text-sm mb-2">Create a skill from scratch</h4>
                <p className="text-xs text-surface-500 mb-2">Describe what you want and Claude builds the whole thing:</p>
                <div className="relative">
                  <pre className="bg-surface-50 border border-surface-200 rounded-lg p-3 text-xs font-mono text-surface-800 whitespace-pre-wrap leading-relaxed">{`I want to create a Claude Code skill that [describe what it does].

It should trigger when: [list trigger conditions]
Category: [Documents / AI & Automation / Developer Tools / UI Components]

Generate a complete SKILL.md file with:
1. YAML frontmatter (name, version "1.0.0", description)
2. When to Use section with trigger conditions and exclusions
3. How It Works with numbered steps
4. At least 2 concrete examples showing user prompts and expected Claude behavior
5. Rules section with important constraints

Save it to .claude/skills/[skill-id]/SKILL.md`}</pre>
                  <CopyButton
                    text={`I want to create a Claude Code skill that [describe what it does].\n\nIt should trigger when: [list trigger conditions]\nCategory: [Documents / AI & Automation / Developer Tools / UI Components]\n\nGenerate a complete SKILL.md file with:\n1. YAML frontmatter (name, version "1.0.0", description)\n2. When to Use section with trigger conditions and exclusions\n3. How It Works with numbered steps\n4. At least 2 concrete examples showing user prompts and expected Claude behavior\n5. Rules section with important constraints\n\nSave it to .claude/skills/[skill-id]/SKILL.md`}
                    label="prompt-scratch" copied={copied} onCopy={copyToClipboard} />
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-surface-900 text-sm mb-2">Create a skill + component</h4>
                <p className="text-xs text-surface-500 mb-2">For UI components that come with a companion skill:</p>
                <div className="relative">
                  <pre className="bg-surface-50 border border-surface-200 rounded-lg p-3 text-xs font-mono text-surface-800 whitespace-pre-wrap leading-relaxed">{`I want to create a reusable React + Tailwind component for [describe the component — e.g. "a data table with sorting and pagination"].

Build two things:
1. A component file (components/[name]/[Name].jsx) — self-contained, no external deps, accepts props, uses Tailwind for styling
2. A companion SKILL.md that teaches Claude when and how to use the component, including all props with types, usage examples, and styling conventions

The skill should reference the component and show Claude how to import and compose it in different contexts.`}</pre>
                  <CopyButton
                    text={`I want to create a reusable React + Tailwind component for [describe the component — e.g. "a data table with sorting and pagination"].\n\nBuild two things:\n1. A component file (components/[name]/[Name].jsx) — self-contained, no external deps, accepts props, uses Tailwind for styling\n2. A companion SKILL.md that teaches Claude when and how to use the component, including all props with types, usage examples, and styling conventions\n\nThe skill should reference the component and show Claude how to import and compose it in different contexts.`}
                    label="prompt-component" copied={copied} onCopy={copyToClipboard} />
                </div>
              </div>

              <div className="bg-brand-50 rounded-lg p-4">
                <p className="text-sm font-medium text-brand-800 mb-1">Share it back</p>
                <p className="text-xs text-brand-700 leading-relaxed">
                  Once Claude generates your skill, test it in your project. When it works well, open a PR to <code className="bg-brand-100 px-1 rounded">pandotic/pando-skillo</code> — add the SKILL.md to <code className="bg-brand-100 px-1 rounded">skills/your-skill/</code> and an entry to <code className="bg-brand-100 px-1 rounded">skills-manifest.json</code>. Your name shows up as the author.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Icons, getIcon, CAT_COLORS, defaultColors } from './Icons';
import { RAW } from '../config';

export default function SkillDetailModal({ skill, onClose, onToggle, selected }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const c = CAT_COLORS[skill.category] || defaultColors;

  useEffect(() => {
    fetch(RAW(`skills/${skill.id}/SKILL.md`))
      .then(r => r.ok ? r.text() : null)
      .then(text => { setContent(text); setLoading(false); })
      .catch(() => setLoading(false));
  }, [skill.id]);

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
              <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>{skill.category}</span>
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
        <div className="p-5 border-b border-surface-100">
          <p className="text-sm text-surface-600">{skill.description}</p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {skill.triggers.map(t => (
              <span key={t} className="text-xs bg-surface-100 text-surface-600 px-2 py-0.5 rounded font-mono">{t}</span>
            ))}
          </div>
        </div>
        <div className="overflow-y-auto flex-1 p-5">
          {loading
            ? <div className="flex items-center justify-center py-10 text-surface-400"><Icons.Loader /><span className="ml-2 text-sm">Loading skill content...</span></div>
            : content
              ? <div>{renderMarkdown(content)}</div>
              : <p className="text-sm text-surface-500 text-center py-10">Could not load skill content.</p>
          }
        </div>
      </div>
    </div>
  );
}

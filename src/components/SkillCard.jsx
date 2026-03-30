import React from 'react';
import { Icons, getIcon, CAT_COLORS, defaultColors } from './Icons';

export default function SkillCard({ skill, selected, onToggle, onDetail }) {
  const c = CAT_COLORS[skill.category] || defaultColors;
  return (
    <div
      onClick={() => onDetail(skill)}
      className={`card-hover fade-in cursor-pointer rounded-2xl border-2 bg-white p-5 ${selected ? 'selected-ring border-brand-500' : 'border-surface-200 hover:border-surface-300'}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${c.bg} ${c.icon}`}>{getIcon(skill.icon)}</div>
        <div onClick={e => { e.stopPropagation(); onToggle(skill.id); }}
          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all cursor-pointer ${selected ? 'bg-brand-600 border-brand-600 text-white' : 'border-surface-300 bg-white hover:border-brand-400'}`}>
          {selected && <Icons.Check />}
        </div>
      </div>
      <div className="flex items-center gap-2 mb-1">
        <h3 className="font-semibold text-surface-900">{skill.name}</h3>
        {skill.version && <span className="text-[10px] font-mono text-surface-400 bg-surface-100 px-1.5 py-0.5 rounded">v{skill.version}</span>}
      </div>
      <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${c.bg} ${c.text} mb-2`}>{skill.category}</span>
      <p className="text-sm text-surface-700 leading-relaxed mb-3 line-clamp-3">{skill.description}</p>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {skill.triggers.slice(0, 4).map(t => (
          <span key={t} className="text-xs bg-surface-100 text-surface-600 px-2 py-0.5 rounded font-mono">{t}</span>
        ))}
      </div>
      {skill.author && (
        <div className="flex items-center gap-1.5 pt-2 border-t border-surface-100">
          <img src={`https://github.com/${skill.author}.png?size=32`} alt="" className="w-4 h-4 rounded-full" />
          <span className="text-xs text-surface-400">by <a href={`https://github.com/${skill.author}`} target="_blank" rel="noopener noreferrer" className="text-surface-500 hover:text-brand-600" onClick={e => e.stopPropagation()}>{skill.author}</a></span>
        </div>
      )}
    </div>
  );
}

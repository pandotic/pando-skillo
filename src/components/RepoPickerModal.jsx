import React, { useState } from 'react';
import { Icons } from './Icons';

export default function RepoPickerModal({ repos, loading, onSelect, onClose }) {
  const [q, setQ] = useState('');
  const filtered = repos.filter(r => r.full_name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[70vh] flex flex-col fade-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-surface-100">
          <div>
            <h3 className="font-semibold text-lg">Select target repository</h3>
            <p className="text-xs text-surface-700 mt-0.5">Skills will be added to <code className="bg-surface-100 px-1 py-0.5 rounded">.claude/skills/</code> via pull request</p>
          </div>
          <button onClick={onClose} className="text-surface-500 hover:text-surface-900 p-1"><Icons.X /></button>
        </div>
        <div className="p-3 border-b border-surface-100">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400"><Icons.Search /></div>
            <input autoFocus type="text" placeholder="Search repos..." value={q} onChange={e => setQ(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
          </div>
        </div>
        <div className="overflow-y-auto flex-1 p-2">
          {loading
            ? <div className="flex items-center justify-center py-10 text-surface-500"><Icons.Loader /><span className="ml-2 text-sm">Loading repositories...</span></div>
            : filtered.length === 0
              ? <p className="text-center py-10 text-sm text-surface-500">No repositories found</p>
              : filtered.map(r => (
                <button key={r.id} onClick={() => onSelect(r)}
                  className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-surface-50 flex items-center gap-3 transition-colors">
                  <span className="text-surface-400"><Icons.Github /></span>
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-surface-900 truncate">{r.full_name}</p>
                    {r.description && <p className="text-xs text-surface-500 truncate">{r.description}</p>}
                  </div>
                </button>
              ))
          }
        </div>
      </div>
    </div>
  );
}

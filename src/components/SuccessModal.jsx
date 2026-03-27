import React from 'react';
import { Icons } from './Icons';

export default function SuccessModal({ prUrl, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center fade-in" onClick={e => e.stopPropagation()}>
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h3 className="text-lg font-semibold text-surface-900 mb-1">Pull request opened</h3>
        <p className="text-sm text-surface-600 mb-6">Review and merge to add the skills to your project.</p>
        <div className="flex gap-2 justify-center">
          <a href={prUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-surface-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-surface-800 transition-colors">
            View PR <Icons.ExternalLink />
          </a>
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-surface-200 text-sm font-medium text-surface-700 hover:bg-surface-50 transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
}
